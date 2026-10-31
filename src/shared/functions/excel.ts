import FileSaver from "file-saver";

export type ExcelCellValue = string | number | boolean | null | undefined;

export interface ExportExcelOptions {
  fileName: string;
  sheetName?: string;
  headers: string[];
  rows: ExcelCellValue[][];
}

const CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let code = i;
    for (let bit = 0; bit < 8; bit += 1) {
      code = code & 1 ? 0xedb88320 ^ (code >>> 1) : code >>> 1;
    }
    table[i] = code >>> 0;
  }
  return table;
})();

const crc32 = (bytes: Uint8Array) => {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

// Builds a minimal, valid .xlsx archive using stored (uncompressed) ZIP entries.
const createZip = (files: Array<{ name: string; content: string }>) => {
  const encoder = new TextEncoder();
  const localParts: Uint8Array<ArrayBuffer>[] = [];
  const centralParts: Uint8Array<ArrayBuffer>[] = [];
  const now = new Date();
  const dosTime =
    (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const dosDate =
    ((now.getFullYear() - 1980) << 9) |
    ((now.getMonth() + 1) << 5) |
    now.getDate();
  let offset = 0;

  files.forEach(({ name, content }) => {
    const nameBytes = encoder.encode(name);
    const data = encoder.encode(content);
    const checksum = crc32(data);

    const local = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0x0800, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, dosTime, true);
    localView.setUint16(12, dosDate, true);
    localView.setUint32(14, checksum, true);
    localView.setUint32(18, data.length, true);
    localView.setUint32(22, data.length, true);
    localView.setUint16(26, nameBytes.length, true);
    localView.setUint16(28, 0, true);
    local.set(nameBytes, 30);

    localParts.push(local, data);

    const central = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(central.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0x0800, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, dosTime, true);
    centralView.setUint16(14, dosDate, true);
    centralView.setUint32(16, checksum, true);
    centralView.setUint32(20, data.length, true);
    centralView.setUint32(24, data.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, offset, true);
    central.set(nameBytes, 46);

    centralParts.push(central);
    offset += local.length + data.length;
  });

  const centralSize = centralParts.reduce(
    (total, part) => total + part.length,
    0,
  );
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(4, 0, true);
  endView.setUint16(6, 0, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);
  endView.setUint16(20, 0, true);

  return new Blob([...localParts, ...centralParts, end], {
    type: CONTENT_TYPE,
  });
};

const escapeXml = (value: string) =>
  value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").replace(
    /[<>&"']/g,
    (char) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[char] as string,
  );

const columnName = (index: number) => {
  let name = "";
  let current = index;
  while (current >= 0) {
    name = String.fromCharCode((current % 26) + 65) + name;
    current = Math.floor(current / 26) - 1;
  }
  return name;
};

const cellToText = (value: ExcelCellValue) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  return String(value);
};

const cellXml = (ref: string, value: ExcelCellValue, style: number) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `<c r="${ref}" s="${style}"><v>${value}</v></c>`;
  }
  return `<c r="${ref}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(
    cellToText(value),
  )}</t></is></c>`;
};

const sanitizeSheetName = (name: string) => {
  const sanitized = name.replace(/[\\/?*[\]:]/g, " ").trim();
  return (sanitized || "Sheet1").slice(0, 31);
};

const NUMERIC_TEXT_PATTERN = /^-?(0|[1-9]\d*)(\.\d+)?$/;

// Extracts a value from a rendered table cell so the export stays in sync with
// what the user sees (translated text, icon links and checkboxes included).
export const getCellExportValue = (
  cell?: HTMLTableCellElement,
): ExcelCellValue => {
  if (!cell) return "";

  const checkbox = cell.querySelector<HTMLInputElement>(
    'input[type="checkbox"]',
  );
  if (checkbox) return checkbox.checked ? "Yes" : "No";

  const phoneLink = cell.querySelector<HTMLAnchorElement>('a[href^="tel:"]');
  if (phoneLink) {
    return phoneLink.getAttribute("href")?.replace(/^tel:\+?/, "") ?? "";
  }

  const value = cell.textContent?.trim() ?? "";
  return NUMERIC_TEXT_PATTERN.test(value) ? Number(value) : value;
};

// Reads the rendered table (headers, visible columns and non-inactive rows)
// so the exported sheet always matches what the user is looking at.
export const getTableExportData = (table: HTMLTableElement) => {
  const headerRow = table.tHead?.rows[0];
  const bodyRows = table.tBodies[0]?.rows;
  if (!headerRow || !bodyRows) return null;

  const headers = Array.from(headerRow.cells).map((cell) => {
    // The title is the first paragraph; the subtitle (when present) follows it,
    // just before the sort arrow, which is not part of the header label.
    const texts = Array.from(cell.querySelectorAll("p"))
      .map((paragraph) => paragraph.textContent?.trim() ?? "")
      .filter((text) => text && text !== "▲");
    const [title = cell.textContent?.trim() ?? "", subtitle] = texts;
    return subtitle ? `${title} ${subtitle}` : title;
  });

  const rows = Array.from(bodyRows)
    .filter((row) => {
      const firstCell = row.cells[0];
      const isPlaceholder = row.cells.length === 1 && firstCell?.colSpan > 1;
      return !isPlaceholder && row.dataset.active !== "false";
    })
    .map((row) =>
      headers.map((_, index) => getCellExportValue(row.cells[index])),
    );

  if (headers.length === 0 || rows.length === 0) return null;

  return { headers, rows };
};

const buildSheetXml = ({
  headers,
  rows,
}: {
  headers: string[];
  rows: ExcelCellValue[][];
}) => {
  const widths = headers.map((header, index) => {
    const longest = rows.reduce((max, row) => {
      return Math.max(max, cellToText(row[index]).length);
    }, header.length);
    return Math.min(Math.max(longest + 2, 10), 50);
  });

  const cols = headers
    .map(
      (_, index) =>
        `<col min="${index + 1}" max="${index + 1}" width="${widths[index]}" customWidth="1"/>`,
    )
    .join("");

  const headerRow = `<row r="1">${headers
    .map((header, index) => cellXml(`${columnName(index)}1`, header, 1))
    .join("")}</row>`;

  const bodyRows = rows
    .map((row, rowIndex) => {
      const rowNumber = rowIndex + 2;
      const cells = row
        .map((value, columnIndex) =>
          cellXml(`${columnName(columnIndex)}${rowNumber}`, value, 2),
        )
        .join("");
      return `<row r="${rowNumber}">${cells}</row>`;
    })
    .join("");

  return `${XML_HEADER}<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>${
    cols ? `<cols>${cols}</cols>` : ""
  }<sheetData>${headerRow}${bodyRows}</sheetData></worksheet>`;
};

const buildWorkbookFiles = (
  sheetName: string,
  headers: string[],
  rows: ExcelCellValue[][],
) => [
  {
    name: "[Content_Types].xml",
    content: `${XML_HEADER}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
  },
  {
    name: "_rels/.rels",
    content: `${XML_HEADER}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
  },
  {
    name: "xl/workbook.xml",
    content: `${XML_HEADER}<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${escapeXml(
      sanitizeSheetName(sheetName),
    )}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
  },
  {
    name: "xl/_rels/workbook.xml.rels",
    content: `${XML_HEADER}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
  },
  {
    name: "xl/styles.xml",
    content: `${XML_HEADER}<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF000000"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FF9CA3AF"/></left><right style="thin"><color rgb="FF9CA3AF"/></right><top style="thin"><color rgb="FF9CA3AF"/></top><bottom style="thin"><color rgb="FF9CA3AF"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`,
  },
  {
    name: "xl/worksheets/sheet1.xml",
    content: buildSheetXml({ headers, rows }),
  },
];

export const exportToExcel = ({
  fileName,
  sheetName = "Sheet1",
  headers,
  rows,
}: ExportExcelOptions) => {
  if (headers.length === 0) return;

  const blob = createZip(buildWorkbookFiles(sheetName, headers, rows));
  const finalName = fileName.toLowerCase().endsWith(".xlsx")
    ? fileName
    : `${fileName}.xlsx`;

  // @ts-expect-error injected by React Native WebView
  if (typeof window !== "undefined" && window.ReactNativeWebView) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(",")[1];
      // @ts-expect-error injected by React Native WebView
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "blob",
          data: base64Data,
          fileName: finalName,
          contentType: CONTENT_TYPE,
        }),
      );
    };
    reader.onerror = () => FileSaver.saveAs(blob, finalName);
    reader.readAsDataURL(blob);
    return;
  }

  FileSaver.saveAs(blob, finalName);
};
