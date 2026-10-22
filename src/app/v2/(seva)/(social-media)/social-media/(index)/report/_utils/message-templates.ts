export function buildSevadarPendingMsg(params: {
  location: string;
  date: string;
  rows: Array<{ name: string; tehsil_name: string }>;
}): string {
  const header = `🙏 *${params.location} - SM Seva Report*\n📅 ${params.date}\n\n`;
  const body = params.rows
    .map((r, i) => `${i + 1}. ${r.name}${r.tehsil_name ? ` (${r.tehsil_name})` : ""}`)
    .join("\n");
  return header + (body || "No data");
}

export function buildAllPlatformsMsg(params: {
  location: string;
  date: string;
  reports: Array<{ question: string; seva_count: number }>;
  totalSevadar: number;
  totalSubmissions: number;
}): string {
  const header = `🙏 *${params.location} - All SM Platform Report*\n📅 ${params.date}\n\n`;
  const body = params.reports
    .map((r) => `• ${r.question}: ${r.seva_count}`)
    .join("\n");
  const footer = `\n\nTotal Sevadar: ${params.totalSevadar}\nUpdates Given: ${params.totalSubmissions}\nPending: ${params.totalSevadar - params.totalSubmissions}`;
  return header + body + footer;
}

export function buildPlatformWiseMsg(params: {
  location: string;
  date: string;
  platform: string;
  rows: Array<{ name: string; submitted: number; total: number }>;
}): string {
  const header = `🙏 *${params.location} - ${params.platform} Report*\n📅 ${params.date}\n\n`;
  const body = params.rows
    .map((r, i) => `${i + 1}. ${r.name}: ${r.submitted}/${r.total}`)
    .join("\n");
  return header + (body || "No data");
}

export function splitLongMessage(msg: string, maxLen = 4500): string[] {
  if (msg.length <= maxLen) return [msg];
  const chunks: string[] = [];
  let current = "";
  for (const line of msg.split("\n")) {
    const next = current ? `${current}\n${line}` : line;
    if (next.length > maxLen) {
      if (current) chunks.push(current);
      current = line;
    } else {
      current = next;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}
