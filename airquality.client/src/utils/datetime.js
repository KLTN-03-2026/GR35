const VN_TIME_ZONE = "Asia/Ho_Chi_Minh";
const VN_UTC_OFFSET_HOURS = 7;

function hasExplicitTimezone(isoString) {
  return /([zZ]|[+\-]\d{2}:\d{2})$/.test(isoString);
}

function parseIsoWithoutTimezoneAsVnDate(isoString) {
  // Accept: YYYY-MM-DDTHH:mm:ss(.SSS)? or YYYY-MM-DD HH:mm:ss(.SSS)?
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(
    isoString.trim(),
  );
  if (!m) return null;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const hour = Number(m[4]);
  const minute = Number(m[5]);
  const second = Number(m[6] ?? 0);
  const milli = Number((m[7] ?? "0").padEnd(3, "0"));

  if (![year, month, day, hour, minute, second, milli].every(Number.isFinite)) return null;

  // DB string has no timezone; treat it as VN local wall-time.
  // Convert that wall-time to a real instant by subtracting VN offset, then use UTC.
  return new Date(Date.UTC(year, month - 1, day, hour - VN_UTC_OFFSET_HOURS, minute, second, milli));
}

function toDateAssumingDbVn(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return null;

    if (hasExplicitTimezone(s)) {
      const d = new Date(s);
      return Number.isNaN(d.getTime()) ? null : d;
    }

    const parsed = parseIsoWithoutTimezoneAsVnDate(s);
    if (parsed) return parsed;

    const fallback = new Date(s);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }

  // number (ms) or other convertible values
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDbDateTime(value, options = {}) {
  const date = toDateAssumingDbVn(value);
  if (!date) return "--";

  return date.toLocaleString("vi-VN", {
    timeZone: VN_TIME_ZONE,
    ...options,
  });
}

export function formatDbTime(value, options = {}) {
  return formatDbDateTime(value, {
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  });
}

