import { franc } from "franc";

// ─── Single source of truth ───────────────────────────────────────────────────
// Each entry: [franc language code, native digits 0-9]
const LANG_DIGITS: [string, string[]][] = [
  ["eng", ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]],
  ["hin", ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"]],
  ["mar", ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"]],
  ["mag", ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"]],
  ["nep", ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"]],
  ["pan", ["੦", "੧", "੨", "੩", "੪", "੫", "੬", "੭", "੮", "੯"]],
  ["guj", ["૦", "૧", "૨", "૩", "૪", "૫", "૬", "૭", "૮", "૯"]],
  ["kan", ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"]],
  ["ben", ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]],
  ["ndo", ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]],
  ["und", ["୦", "୧", "୨", "୩", "୪", "୫", "୬", "୭", "୮", "୯"]], // Odia
  ["mal", ["൦", "൧", "൨", "൩", "൪", "൫", "൬", "൭", "൮", "൯"]],
  ["tel", ["౦", "౧", "౨", "౩", "౪", "౫", "౬", "౭", "౮", "౯"]],
  ["tam", ["௦", "௧", "௨", "௩", "௪", "௫", "௬", "௭", "௮", "௯"]],
  ["urd", ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]],
  ["arb", ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]],
  ["prs", ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]], // Sindhi
];

// ─── Derived lookups (built once at module load) ───────────────────────────

/** franc code → native-digit regex (global) */
export const langNumberRegex: Record<string, RegExp> = {};

/** franc code → char-to-ASCII map for fast O(1) lookup */
const toAsciiMap: Record<string, Record<string, string>> = {};

for (const [code, digits] of LANG_DIGITS) {
  toAsciiMap[code] = {};
  digits.forEach((ch, i) => {
    toAsciiMap[code][ch] = String(i);
  });
  if (code !== "eng") {
    langNumberRegex[code] = new RegExp(`[${digits.join("")}]`, "g");
  }
}

// ─── Core converter ───────────────────────────────────────────────────────────

/**
 * Converts native-script numerals in `str` to ASCII digits.
 * Uses franc for language detection; falls back to returning `str` unchanged.
 */
export function toAsciiDigits(str: string): string {
  if (!str.trim()) return str;

  const code = franc(str);
  const charMap = toAsciiMap[code];
  const regex = langNumberRegex[code];

  if (!charMap || !regex || code === "eng") return str;

  return str.replace(regex, (ch) => charMap[ch] ?? ch);
}

// ─── Regexes ─────────────────────────────────────────────────────────────────

/** Highest priority: explicitly bracketed pincode e.g. <110001> */
const BRACKETED_PINCODE_RE = /<([1-9]\d{5})>/;

/**
 * Standard 6-digit pincode after ASCII conversion.
 * Allows formats: 110001 | 110 001 | 110-001
 * Word boundaries prevent matching substrings of mobile numbers.
 */
const PINCODE_RE = /\b([1-9]\d{2})[- ]?(\d{3})\b/g;

/** Indian mobile: optional +91/0 prefix, starts with 6-9, total 10 digits */
const MOBILE_RE = /(?:\+91|91|0)?([6-9]\d{9})/g;

export const allLangPincodeRegex =
  /^(?:[1-9]\d{5}|[१-९][0-९]{5}|[૧-૯][૦-૯]{5}|[১-৯][০-৯]{5}|[୧-୯][୦-୯]{5}|[੧-੯][੦-੯]{5}|[೧-೯][೦-೯]{5}|[۱-۹][۰-۹]{5}|[൧-൯][൦-൯]{5}|[౧-౯][౦-౯]{5}|[௧-௯][0-௯]{5})$/;

// ─── Public API ───────────────────────────────────────────────────────────────

export interface MobilePinResult {
  mobileNumber: string[] | null;
  pinCodes: string[] | null;
  /** The string after native numeral → ASCII conversion */
  converted: string;
}

/**
 * Extracts mobile numbers and pincodes from a multilingual address string.
 *
 * Strategy:
 * 1. Normalise native numerals → ASCII via franc detection
 * 2. Honour explicitly bracketed pincodes `<110001>` first
 * 3. Extract all mobile numbers and pincodes via regex
 * 4. Drop any pincode that appears as a substring inside a mobile number
 */
export function getMobilePin(raw: string): MobilePinResult {
  const converted = toAsciiDigits(raw.replace(/_/g, " "));

  // Priority 1: bracketed pincode
  const bracketed = BRACKETED_PINCODE_RE.exec(converted);
  if (bracketed) {
    return {
      mobileNumber: extractAll(MOBILE_RE, converted),
      pinCodes: [bracketed[1]],
      converted,
    };
  }

  const mobiles = extractAll(MOBILE_RE, converted);
  const mobileDigits = new Set(mobiles.map(stripNonDigits));

  // Collect all pincode candidates, reject those embedded in a mobile number
  const pinCodes = extractAll(PINCODE_RE, converted)
    .map(stripNonDigits)
    .filter((pin) => !isMobileSubstring(pin, mobileDigits));

  return {
    mobileNumber: mobiles.length ? mobiles : null,
    pinCodes: pinCodes.length ? pinCodes : null,
    converted,
  };
}

/**
 * Extracts the pincode from a raw address message.
 * Returns an ASCII digit string, or "" if not found.
 */
export function getPincode(message: string): string {
  // Bracketed pincode wins immediately
  const bracketed = BRACKETED_PINCODE_RE.exec(message);
  if (bracketed) return bracketed[1];

  const { pinCodes } = getMobilePin(message);
  return pinCodes?.[0] ?? "";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Run a global regex and return all full matches, resetting lastIndex each time */
function extractAll(re: RegExp, str: string): string[] {
  re.lastIndex = 0;
  const results: string[] = [];
  let m: RegExpExecArray | null;
  // biome-ignore lint/suspicious/noAssignInExpressions: known
  while ((m = re.exec(str)) !== null) results.push(m[0]);
  re.lastIndex = 0;
  return results;
}

function stripNonDigits(s: string): string {
  return s.replace(/\D/g, "");
}

function isMobileSubstring(pin: string, mobileDigitSet: Set<string>): boolean {
  for (const mob of mobileDigitSet) {
    if (mob.includes(pin)) return true;
  }
  return false;
}

// ─── Legacy exports (backwards compat) ───────────────────────────────────────
export const numeralMaps = toAsciiMap;
