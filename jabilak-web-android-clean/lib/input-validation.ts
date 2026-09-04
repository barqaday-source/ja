const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const EASTERN_ARABIC_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function normalizeArabicDigits(value: string): string {
  return value
    .split("")
    .map((character) => {
      const arabicIndex = ARABIC_DIGITS.indexOf(character);
      if (arabicIndex >= 0) return String(arabicIndex);
      const easternIndex = EASTERN_ARABIC_DIGITS.indexOf(character);
      return easternIndex >= 0 ? String(easternIndex) : character;
    })
    .join("")
    .replace(/[٬،]/g, ",")
    .replace(/[٫]/g, ".")
    .replace(/\s/g, "");
}

export function parseLocalizedNumber(value: string): number | null {
  const normalized = normalizeArabicDigits(value).replace(/,/g, "");
  if (!normalized || !/^\d+(\.\d+)?$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function validateLocalizedNumber(value: string, options: { label: string; min?: number; max?: number; integer?: boolean }): { value: number | null; message: string | null } {
  const parsed = parseLocalizedNumber(value);
  if (parsed === null) return { value: null, message: `يرجى إدخال ${options.label} بالأرقام فقط، مثل ١٠٠٠ أو 1000.` };
  if (options.integer && !Number.isInteger(parsed)) return { value: null, message: `${options.label} يجب أن يكون رقماً صحيحاً بلا فاصلة.` };
  if (options.min !== undefined && parsed < options.min) return { value: null, message: `${options.label} يجب ألا يقل عن ${options.min.toLocaleString("ar-IQ")}.` };
  if (options.max !== undefined && parsed > options.max) return { value: null, message: `${options.label} يجب ألا يتجاوز ${options.max.toLocaleString("ar-IQ")}.` };
  return { value: parsed, message: null };
}

export function formatLocalizedNumber(value: number): string {
  return value.toLocaleString("ar-IQ");
}
