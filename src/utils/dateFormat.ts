/**
 * Platform-wide date formatting & parsing utilities enforcing MM/DD/YYYY format.
 * Internal storage uses ISO YYYY-MM-DD for reliable sorting and date-picker sync,
 * while all user-facing inputs, tables, cards, and exports format as MM/DD/YYYY.
 */

const pad2 = (n: number): string => String(n).padStart(2, '0');

/**
 * Formats an ISO date string (YYYY-MM-DD), ISO timestamp, MM/DD/YYYY string,
 * or Date object into strict MM/DD/YYYY format.
 */
export const formatDateMMDDYYYY = (value?: string | Date | null): string => {
  if (!value) return '';

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return '';
    return `${pad2(value.getMonth() + 1)}/${pad2(value.getDate())}/${value.getFullYear()}`;
  }

  const trimmed = String(value).trim();
  if (!trimmed) return '';

  // Already MM/DD/YYYY (or M/D/YYYY)
  const mdyMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (mdyMatch) {
    const mm = parseInt(mdyMatch[1], 10);
    const dd = parseInt(mdyMatch[2], 10);
    const yyyy = parseInt(mdyMatch[3], 10);
    if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
      return `${pad2(mm)}/${pad2(dd)}/${yyyy}`;
    }
  }

  // ISO YYYY-MM-DD (avoid timezone shift by parsing directly)
  const isoDateMatch = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(trimmed);
  if (isoDateMatch) {
    const [, yyyy, mm, dd] = isoDateMatch;
    return `${mm}/${dd}/${yyyy}`;
  }

  // Fallback for other parsable Date strings
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return `${pad2(parsed.getMonth() + 1)}/${pad2(parsed.getDate())}/${parsed.getFullYear()}`;
  }

  return trimmed;
};

/**
 * Converts a MM/DD/YYYY or YYYY-MM-DD string into ISO YYYY-MM-DD if valid, else null.
 */
export const parseMMDDYYYYToIso = (input: string): string | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (isoMatch) {
    return trimmed;
  }

  const mdyMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (!mdyMatch) return null;

  const mm = parseInt(mdyMatch[1], 10);
  const dd = parseInt(mdyMatch[2], 10);
  const yyyy = parseInt(mdyMatch[3], 10);

  if (mm < 1 || mm > 12 || dd < 1 || dd > 31 || yyyy < 1900 || yyyy > 2100) {
    return null;
  }

  // Validate real calendar day (e.g. reject 02/30/2026)
  const testDate = new Date(yyyy, mm - 1, dd);
  if (
    testDate.getFullYear() !== yyyy ||
    testDate.getMonth() !== mm - 1 ||
    testDate.getDate() !== dd
  ) {
    return null;
  }

  return `${yyyy}-${pad2(mm)}-${pad2(dd)}`;
};

/**
 * Ensures an input value is formatted as YYYY-MM-DD for native <input type="date"> sync.
 */
export const toIsoDateString = (value?: string | null): string => {
  if (!value) return '';
  return parseMMDDYYYYToIso(value) || '';
};

const WEEKDAY_NAMES_UPPER = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

/**
 * Formats a date string into "SATURDAY 08/08/2026" for poster date ribbon banners,
 * preserving MM/DD/YYYY format with zero timezone shifting.
 */
export const formatPosterBannerDate = (value?: string | null): string => {
  if (!value) return 'MATCHDAY';
  const iso = parseMMDDYYYYToIso(value);
  if (iso) {
    const [yyyy, mm, dd] = iso.split('-').map(Number);
    const localDate = new Date(yyyy, mm - 1, dd);
    if (!Number.isNaN(localDate.getTime())) {
      const weekday = WEEKDAY_NAMES_UPPER[localDate.getDay()];
      return `${weekday} ${formatDateMMDDYYYY(iso)}`;
    }
  }
  return formatDateMMDDYYYY(value).toUpperCase() || 'MATCHDAY';
};

