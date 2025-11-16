import { describe, expect, it } from "vitest";
import { duration, DurationString, Unit } from "./index";

describe("duration(string)", () => {
  it("should not throw an error", () => {
    expect(() => {
      duration("1m");
    }).not.toThrow();
  });

  it("should preserve duration", () => {
    expect(duration("100")).toBe(100);
  });

  it("should convert from m to duration", () => {
    expect(duration("1m")).toBe(60000);
  });

  it("should convert from h to duration", () => {
    expect(duration("1h")).toBe(3600000);
  });

  it("should convert d to duration", () => {
    expect(duration("2d")).toBe(172800000);
  });

  it("should convert w to duration", () => {
    expect(duration("3w")).toBe(1814400000);
  });

  it("should convert s to duration", () => {
    expect(duration("1s")).toBe(1000);
  });

  it("should convert duration to duration", () => {
    expect(duration("100ms")).toBe(100);
  });

  it("should convert y to duration", () => {
    expect(duration("1y")).toBe(31557600000);
  });

  it("should work with decimals", () => {
    expect(duration("1.5h")).toBe(5400000);
  });

  it("should work with multiple spaces", () => {
    expect(duration("1   s")).toBe(1000);
  });

  it("should return NaN if invalid", () => {
    // @ts-expect-error - We expect this to fail.
    expect(Number.isNaN(duration("☃"))).toBe(true);
    // @ts-expect-error - We expect this to fail.
    expect(Number.isNaN(duration("10-.5"))).toBe(true);
    // @ts-expect-error - We expect this to fail.
    expect(Number.isNaN(duration("duration"))).toBe(true);
  });

  it("should be case-insensitive", () => {
    expect(duration("1.5H")).toBe(5400000);
  });

  it("should work with numbers starting with .", () => {
    expect(duration(".5ms")).toBe(0.5);
  });

  it("should work with negative integers", () => {
    expect(duration("-100ms")).toBe(-100);
  });

  it("should work with negative decimals", () => {
    expect(duration("-1.5h")).toBe(-5400000);
    expect(duration("-10.5h")).toBe(-37800000);
  });

  it('should work with negative decimals starting with "."', () => {
    expect(duration("-.5h")).toBe(-1800000);
  });

  const unitCases: Array<[DurationString, number]> = [
    ["1500ms", 1500],
    ["1500msec", 1500],
    ["1500msecs", 1500],
    ["1500millisecond", 1500],
    ["1500milliseconds", 1500],
    ["2s", 2000],
    ["2sec", 2000],
    ["2secs", 2000],
    ["2second", 2000],
    ["2seconds", 2000],
    ["3m", 180000],
    ["3min", 180000],
    ["3mins", 180000],
    ["3minute", 180000],
    ["3minutes", 180000],
    ["4h", 14400000],
    ["4hr", 14400000],
    ["4hrs", 14400000],
    ["4hour", 14400000],
    ["4hours", 14400000],
    ["1d", 86400000],
    ["1day", 86400000],
    ["1days", 86400000],
    ["2w", 1209600000],
    ["2week", 1209600000],
    ["2weeks", 1209600000],
    ["1mo", 2629800000],
    ["1month", 2629800000],
    ["1months", 2629800000],
    ["1y", 31557600000],
    ["1yr", 31557600000],
    ["1yrs", 31557600000],
    ["1year", 31557600000],
    ["1years", 31557600000],
  ];
  it.each(unitCases)("should convert %s to duration", (input, expected) => {
    expect(duration(input)).toBe(expected);
  });

  const toUnitCases: Array<[DurationString, Unit, number]> = [
    ["1500ms", "seconds", 1.5],
    ["2 minutes", "seconds", 120],
    ["3 hours", "minutes", 180],
    ["1 day", "hours", 24],
    ["2 weeks", "days", 14],
    ["1 month", "days", 30.4375],
    ["1 year", "days", 365.25],
    ["5000ms", "seconds", 5],
    ["120s", "minutes", 2],
    ["7200s", "hours", 2],
    ["1year", "months", 12],
    ["2y", "years", 2],
    ["48h", "days", 2],
    ["336h", "weeks", 2],
    ["2mo", "days", 60.875],
    ["2y", "days", 730.5],
    ["-1500ms", "seconds", -1.5],
    ["-2 minutes", "seconds", -120],
    ["-3 hours", "minutes", -180],
    ["-1 day", "hours", -24],
    ["-2 weeks", "days", -14],
    ["-1 month", "days", -30.4375],
    ["-1 year", "days", -365.25],
  ];
  it.each(toUnitCases)("should convert %s to %s", (input, toUnit, expected) => {
    expect(duration(input, { toUnit })).toBe(expected);
  });
});

// long strings

describe("duration(long string)", () => {
  it("should not throw an error", () => {
    expect(() => {
      duration("53 milliseconds");
    }).not.toThrow();
  });

  it("should convert milliseconds to duration", () => {
    expect(duration("53 milliseconds")).toBe(53);
  });

  it("should convert durationecs to duration", () => {
    expect(duration("17 ms")).toBe(17);
  });

  it("should convert sec to duration", () => {
    expect(duration("1 sec")).toBe(1000);
  });

  it("should convert from min to duration", () => {
    expect(duration("1 min")).toBe(60000);
  });

  it("should convert from hr to duration", () => {
    expect(duration("1 hr")).toBe(3600000);
  });

  it("should convert days to duration", () => {
    expect(duration("2 days")).toBe(172800000);
  });

  it("should convert weeks to duration", () => {
    expect(duration("1 week")).toBe(604800000);
  });

  it("should convert years to duration", () => {
    expect(duration("1 year")).toBe(31557600000);
  });

  it("should work with decimals", () => {
    expect(duration("1.5 hours")).toBe(5400000);
  });

  it("should work with negative integers", () => {
    expect(duration("-100 milliseconds")).toBe(-100);
  });

  it("should work with negative decimals", () => {
    expect(duration("-1.5 hours")).toBe(-5400000);
  });

  it('should work with negative decimals starting with "."', () => {
    expect(duration("-.5 hr")).toBe(-1800000);
  });
});

// numbers

describe("duration(number, { long: true })", () => {
  it("should not throw an error", () => {
    expect(() => {
      duration(500, { long: true });
    }).not.toThrow();
  });

  it("should support milliseconds", () => {
    expect(duration(500, { long: true })).toBe("500 ms");

    expect(duration(-500, { long: true })).toBe("-500 ms");
  });

  it("should support seconds", () => {
    expect(duration(1000, { long: true })).toBe("1 second");
    expect(duration(1200, { long: true })).toBe("1 second");
    expect(duration(10000, { long: true })).toBe("10 seconds");

    expect(duration(-1000, { long: true })).toBe("-1 second");
    expect(duration(-1200, { long: true })).toBe("-1 second");
    expect(duration(-10000, { long: true })).toBe("-10 seconds");
  });

  it("should support minutes", () => {
    expect(duration(60 * 1000, { long: true })).toBe("1 minute");
    expect(duration(60 * 1200, { long: true })).toBe("1 minute");
    expect(duration(60 * 10000, { long: true })).toBe("10 minutes");

    expect(duration(-1 * 60 * 1000, { long: true })).toBe("-1 minute");
    expect(duration(-1 * 60 * 1200, { long: true })).toBe("-1 minute");
    expect(duration(-1 * 60 * 10000, { long: true })).toBe("-10 minutes");
  });

  it("should support hours", () => {
    expect(duration(60 * 60 * 1000, { long: true })).toBe("1 hour");
    expect(duration(60 * 60 * 1200, { long: true })).toBe("1 hour");
    expect(duration(60 * 60 * 10000, { long: true })).toBe("10 hours");

    expect(duration(-1 * 60 * 60 * 1000, { long: true })).toBe("-1 hour");
    expect(duration(-1 * 60 * 60 * 1200, { long: true })).toBe("-1 hour");
    expect(duration(-1 * 60 * 60 * 10000, { long: true })).toBe("-10 hours");
  });

  it("should support days", () => {
    expect(duration(1 * 24 * 60 * 60 * 1000, { long: true })).toBe("1 day");
    expect(duration(1 * 24 * 60 * 60 * 1200, { long: true })).toBe("1 day");
    expect(duration(6 * 24 * 60 * 60 * 1000, { long: true })).toBe("6 days");

    expect(duration(-1 * 1 * 24 * 60 * 60 * 1000, { long: true })).toBe(
      "-1 day"
    );
    expect(duration(-1 * 1 * 24 * 60 * 60 * 1200, { long: true })).toBe(
      "-1 day"
    );
    expect(duration(-1 * 6 * 24 * 60 * 60 * 1000, { long: true })).toBe(
      "-6 days"
    );
  });

  it("should support weeks", () => {
    expect(duration(1 * 7 * 24 * 60 * 60 * 1000, { long: true })).toBe(
      "1 week"
    );
    expect(duration(2 * 7 * 24 * 60 * 60 * 1000, { long: true })).toBe(
      "2 weeks"
    );

    expect(duration(-1 * 1 * 7 * 24 * 60 * 60 * 1000, { long: true })).toBe(
      "-1 week"
    );
    expect(duration(-1 * 2 * 7 * 24 * 60 * 60 * 1000, { long: true })).toBe(
      "-2 weeks"
    );
  });

  it("should support months", () => {
    expect(duration(30.4375 * 24 * 60 * 60 * 1000, { long: true })).toBe(
      "1 month"
    );
    expect(duration(30.4375 * 24 * 60 * 60 * 1200, { long: true })).toBe(
      "1 month"
    );
    expect(duration(30.4375 * 24 * 60 * 60 * 10000, { long: true })).toBe(
      "10 months"
    );

    expect(duration(-1 * 30.4375 * 24 * 60 * 60 * 1000, { long: true })).toBe(
      "-1 month"
    );
    expect(duration(-1 * 30.4375 * 24 * 60 * 60 * 1200, { long: true })).toBe(
      "-1 month"
    );
    expect(duration(-1 * 30.4375 * 24 * 60 * 60 * 10000, { long: true })).toBe(
      "-10 months"
    );
  });

  it("should support years", () => {
    expect(duration(365.25 * 24 * 60 * 60 * 1000 + 1, { long: true })).toBe(
      "1 year"
    );
    expect(duration(365.25 * 24 * 60 * 60 * 1200 + 1, { long: true })).toBe(
      "1 year"
    );
    expect(duration(365.25 * 24 * 60 * 60 * 10000 + 1, { long: true })).toBe(
      "10 years"
    );

    expect(
      duration(-1 * 365.25 * 24 * 60 * 60 * 1000 - 1, { long: true })
    ).toBe("-1 year");
    expect(
      duration(-1 * 365.25 * 24 * 60 * 60 * 1200 - 1, { long: true })
    ).toBe("-1 year");
    expect(
      duration(-1 * 365.25 * 24 * 60 * 60 * 10000 - 1, { long: true })
    ).toBe("-10 years");
  });

  it("should round", () => {
    expect(duration(234234234, { long: true })).toBe("3 days");

    expect(duration(-234234234, { long: true })).toBe("-3 days");
  });
});

// numbers

describe("duration(number)", () => {
  it("should not throw an error", () => {
    expect(() => {
      duration(500);
    }).not.toThrow();
  });

  it("should support milliseconds", () => {
    expect(duration(500)).toBe("500ms");

    expect(duration(-500)).toBe("-500ms");
  });

  it("should support seconds", () => {
    expect(duration(1000)).toBe("1s");
    expect(duration(10000)).toBe("10s");

    expect(duration(-1000)).toBe("-1s");
    expect(duration(-10000)).toBe("-10s");
  });

  it("should support minutes", () => {
    expect(duration(60 * 1000)).toBe("1m");
    expect(duration(60 * 10000)).toBe("10m");

    expect(duration(-1 * 60 * 1000)).toBe("-1m");
    expect(duration(-1 * 60 * 10000)).toBe("-10m");
  });

  it("should support hours", () => {
    expect(duration(60 * 60 * 1000)).toBe("1h");
    expect(duration(60 * 60 * 10000)).toBe("10h");

    expect(duration(-1 * 60 * 60 * 1000)).toBe("-1h");
    expect(duration(-1 * 60 * 60 * 10000)).toBe("-10h");
  });

  it("should support days", () => {
    expect(duration(24 * 60 * 60 * 1000)).toBe("1d");
    expect(duration(24 * 60 * 60 * 6000)).toBe("6d");

    expect(duration(-1 * 24 * 60 * 60 * 1000)).toBe("-1d");
    expect(duration(-1 * 24 * 60 * 60 * 6000)).toBe("-6d");
  });

  it("should support weeks", () => {
    expect(duration(1 * 7 * 24 * 60 * 60 * 1000)).toBe("1w");
    expect(duration(2 * 7 * 24 * 60 * 60 * 1000)).toBe("2w");

    expect(duration(-1 * 1 * 7 * 24 * 60 * 60 * 1000)).toBe("-1w");
    expect(duration(-1 * 2 * 7 * 24 * 60 * 60 * 1000)).toBe("-2w");
  });

  it("should support months", () => {
    expect(duration(30.4375 * 24 * 60 * 60 * 1000)).toBe("1mo");
    expect(duration(30.4375 * 24 * 60 * 60 * 1200)).toBe("1mo");
    expect(duration(30.4375 * 24 * 60 * 60 * 10000)).toBe("10mo");

    expect(duration(-1 * 30.4375 * 24 * 60 * 60 * 1000)).toBe("-1mo");
    expect(duration(-1 * 30.4375 * 24 * 60 * 60 * 1200)).toBe("-1mo");
    expect(duration(-1 * 30.4375 * 24 * 60 * 60 * 10000)).toBe("-10mo");
  });

  it("should support years", () => {
    expect(duration(365.25 * 24 * 60 * 60 * 1000 + 1)).toBe("1y");
    expect(duration(365.25 * 24 * 60 * 60 * 1200 + 1)).toBe("1y");
    expect(duration(365.25 * 24 * 60 * 60 * 10000 + 1)).toBe("10y");

    expect(duration(-1 * 365.25 * 24 * 60 * 60 * 1000 - 1)).toBe("-1y");
    expect(duration(-1 * 365.25 * 24 * 60 * 60 * 1200 - 1)).toBe("-1y");
    expect(duration(-1 * 365.25 * 24 * 60 * 60 * 10000 - 1)).toBe("-10y");
  });

  it("should round", () => {
    expect(duration(234234234)).toBe("3d");

    expect(duration(-234234234)).toBe("-3d");
  });
});

// invalid inputs

describe("duration(invalid inputs)", () => {
  it('should throw an error, when duration("")', () => {
    expect(() => {
      // @ts-expect-error - We expect this to throw.
      duration("");
    }).toThrow();
  });

  it("should throw an error, when duration(undefined)", () => {
    expect(() => {
      // @ts-expect-error - We expect this to throw.
      duration(undefined);
    }).toThrow();
  });

  it("should throw an error, when duration(null)", () => {
    expect(() => {
      // @ts-expect-error - We expect this to throw.
      duration(null);
    }).toThrow();
  });

  it("should throw an error, when duration([])", () => {
    expect(() => {
      // @ts-expect-error - We expect this to throw.
      duration([]);
    }).toThrow();
  });

  it("should throw an error, when duration({})", () => {
    expect(() => {
      // @ts-expect-error - We expect this to throw.
      duration({});
    }).toThrow();
  });

  it("should throw an error, when duration(NaN)", () => {
    expect(() => {
      duration(NaN);
    }).toThrow();
  });

  it("should throw an error, when duration(Infinity)", () => {
    expect(() => {
      duration(Infinity);
    }).toThrow();
  });

  it("should throw an error, when duration(-Infinity)", () => {
    expect(() => {
      duration(-Infinity);
    }).toThrow();
  });
});
