const s = 1000;
const m = s * 60;
const h = m * 60;
const d = h * 24;
const w = d * 7;
const y = d * 365.25;
const mo = y / 12;

type Years = "years" | "year" | "yrs" | "yr" | "y";
type Months = "months" | "month" | "mo";
type Weeks = "weeks" | "week" | "w";
type Days = "days" | "day" | "d";
type Hours = "hours" | "hour" | "hrs" | "hr" | "h";
type Minutes = "minutes" | "minute" | "mins" | "min" | "m";
type Seconds = "seconds" | "second" | "secs" | "sec" | "s";
type Milliseconds = "milliseconds" | "millisecond" | "msecs" | "msec" | "ms";

/**
 * A unit of time. Each unit supports singular and plural forms, as well as
 * common abbreviations.
 *
 * @example
 * "years", "year", "yrs", "yr", "y"
 * "months", "month", "mo"
 * "weeks", "week", "w"
 * "days", "day", "d"
 * "hours", "hour", "hrs", "hr", "h"
 * "minutes", "minute", "mins", "min", "m"
 * "seconds", "second", "secs", "sec", "s"
 * "milliseconds", "millisecond", "msecs", "msec", "ms"
 */
export type Unit =
  | Years
  | Months
  | Weeks
  | Days
  | Hours
  | Minutes
  | Seconds
  | Milliseconds;

type UnitAnyCase = Capitalize<Unit> | Uppercase<Unit> | Unit;

/**
 * A string representation of a duration of time. Can use any supported unit, and optionally
 * include a space between the number and unit.
 *
 * @example
 * "300ms"
 * "300 milliseconds"
 * "2h"
 * "2 hours"
 */
export type DurationString =
  | `${number}`
  | `${number}${UnitAnyCase}`
  | `${number} ${UnitAnyCase}`;

const msToUnit = (ms: number, unit: Unit): number => {
  switch (unit) {
    case "years":
    case "year":
    case "yrs":
    case "yr":
    case "y":
      return ms / y;
    case "months":
    case "month":
    case "mo":
      return ms / mo;
    case "weeks":
    case "week":
    case "w":
      return ms / w;
    case "days":
    case "day":
    case "d":
      return ms / d;
    case "hours":
    case "hour":
    case "hrs":
    case "hr":
    case "h":
      return ms / h;
    case "minutes":
    case "minute":
    case "mins":
    case "min":
    case "m":
      return ms / m;
    case "seconds":
    case "second":
    case "secs":
    case "sec":
    case "s":
      return ms / s;
    case "milliseconds":
    case "millisecond":
    case "msecs":
    case "msec":
    case "ms":
      return ms;
  }
};

/**
 * Options for the duration conversion.
 */
interface DurationOptions {
  /**
   * The unit to convert to when providing a string value.
   * @default "milliseconds"
   */
  toUnit?: Unit;
  /**
   * If providing a number (to covert to a string), set to `true` to use verbose
   * formatting (e.g. `1 hour` instead of `1h`).
   * @default false
   */
  long?: boolean;
}

/**
 * Convert the given duration string to a number of units (default milliseconds)
 *
 * @returns The duration in milliseconds, or another unit if specified in `options.toUnit`
 */
export function duration(
  /**
   * The duration string to parse
   */
  duration: DurationString,
  /**
   * Options for the duration conversion
   */
  options?: DurationOptions
): number;
/**
 * Format the given duration in milliseconds to a duration string
 *
 * @returns The formatted duration as a string.
 */
export function duration(
  /**
   * The duration in milliseconds to format
   */
  durationInMs: number,
  /**
   * Options for the duration conversion
   */
  options?: DurationOptions
): DurationString;
export function duration(
  value: DurationString | number,
  options?: DurationOptions
): DurationString | number {
  if (typeof value === "string") {
    return msToUnit(parse(value), options?.toUnit ?? "milliseconds");
  } else if (typeof value === "number") {
    return format(value, options);
  }
  throw new Error(
    `Value provided to ms() must be a string or number. value=${JSON.stringify(value)}`
  );
}

/**
 * Parse the given string and return milliseconds.
 *
 * @param str - A string to parse to milliseconds
 * @returns The parsed value in milliseconds, or `NaN` if the string can't be
 * parsed
 */
function parse(str: string): number {
  if (typeof str !== "string" || str.length === 0 || str.length > 100) {
    throw new Error(
      `Value provided to ms.parse() must be a string with length between 1 and 99. value=${JSON.stringify(str)}`
    );
  }
  const match =
    /^(-?\d*\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|months?|mo|years?|yrs?|y)?$/i.exec(
      str
    );

  if (!match) {
    return NaN;
  }

  const value = match[1];
  const unit = match[2] || "ms";

  const n = parseFloat(value);

  const matchUnit = unit.toLowerCase() as Lowercase<Unit>;

  switch (matchUnit) {
    case "years":
    case "year":
    case "yrs":
    case "yr":
    case "y":
      return n * y;
    case "months":
    case "month":
    case "mo":
      return n * mo;
    case "weeks":
    case "week":
    case "w":
      return n * w;
    case "days":
    case "day":
    case "d":
      return n * d;
    case "hours":
    case "hour":
    case "hrs":
    case "hr":
    case "h":
      return n * h;
    case "minutes":
    case "minute":
    case "mins":
    case "min":
    case "m":
      return n * m;
    case "seconds":
    case "second":
    case "secs":
    case "sec":
    case "s":
      return n * s;
    case "milliseconds":
    case "millisecond":
    case "msecs":
    case "msec":
    case "ms":
      return n;
  }
}

/**
 * Short format for `duration`.
 */
function fmtShort(ms: number): DurationString {
  const msAbs = Math.abs(ms);
  if (msAbs >= y) {
    return `${Math.round(ms / y)}y`;
  }
  if (msAbs >= mo) {
    return `${Math.round(ms / mo)}mo`;
  }
  if (msAbs >= w) {
    return `${Math.round(ms / w)}w`;
  }
  if (msAbs >= d) {
    return `${Math.round(ms / d)}d`;
  }
  if (msAbs >= h) {
    return `${Math.round(ms / h)}h`;
  }
  if (msAbs >= m) {
    return `${Math.round(ms / m)}m`;
  }
  if (msAbs >= s) {
    return `${Math.round(ms / s)}s`;
  }
  return `${ms}ms`;
}

/**
 * Long format for `duration`.
 */
function fmtLong(ms: number): DurationString {
  const msAbs = Math.abs(ms);
  if (msAbs >= y) {
    return plural(ms, msAbs, y, "year");
  }
  if (msAbs >= mo) {
    return plural(ms, msAbs, mo, "month");
  }
  if (msAbs >= w) {
    return plural(ms, msAbs, w, "week");
  }
  if (msAbs >= d) {
    return plural(ms, msAbs, d, "day");
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, "hour");
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, "minute");
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, "second");
  }
  return `${ms} ms`;
}

/**
 * Format the given integer as a string.
 *
 * @param ms - milliseconds
 * @param options - Options for the conversion
 * @returns The formatted string
 */
function format(ms: number, options?: DurationOptions): DurationString {
  if (typeof ms !== "number" || !Number.isFinite(ms)) {
    throw new Error("Value provided to ms.format() must be of type number.");
  }

  return options?.long ? fmtLong(ms) : fmtShort(ms);
}

/**
 * Pluralization helper.
 */
function plural(
  ms: number,
  msAbs: number,
  n: number,
  name: string
): DurationString {
  const isPlural = msAbs >= n * 1.5;
  return `${Math.round(ms / n)} ${name}${isPlural ? "s" : ""}` as DurationString;
}
