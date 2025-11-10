import { describe, expect, it } from "vitest";
import { ordinal } from "./ordinal";

describe(ordinal.name, () => {
  describe("ordinal value for numbers ending in zero", () => {
    it("should return 0 if the number is 0 (0th doesnt read very well)", () => {
      expect(ordinal(0)).toEqual("0");
    });

    it("should return the number with suffix th", () => {
      expect(ordinal(10)).toEqual("10th");
    });
  });

  describe("ordinal value for numbers ending in one", () => {
    it("should end in st for numbers not ending in 11", () => {
      expect(ordinal(1)).toEqual("1st");
      expect(ordinal(11)).not.toEqual("11st");
      expect(ordinal(21)).toEqual("21st");
    });

    it("should be 11th for numbers ending in 11", () => {
      expect(ordinal(11)).toEqual("11th");
      expect(ordinal(111)).toEqual("111th");
    });
  });

  describe("ordinal value for numbers ending in two", () => {
    it("should end in nd for numbers not ending in 12", () => {
      expect(ordinal(2)).toEqual("2nd");
      expect(ordinal(12)).not.toEqual("12nd");
      expect(ordinal(22)).toEqual("22nd");
    });

    it("should be 12th for numbers ending in 12", () => {
      expect(ordinal(12)).toEqual("12th");
      expect(ordinal(112)).toEqual("112th");
    });
  });

  describe("ordinal value for numbers ending in three", () => {
    it("should end in rd for numbers not ending in 13", () => {
      expect(ordinal(3)).toEqual("3rd");
      expect(ordinal(13)).not.toEqual("13rd");
      expect(ordinal(23)).toEqual("23rd");
    });

    it("should be 13th for numbers ending in 13", () => {
      expect(ordinal(13)).toEqual("13th");
      expect(ordinal(113)).toEqual("113th");
    });
  });

  describe("ordinal value for numbers ending in four", () => {
    it("should end in th for numbers", () => {
      expect(ordinal(4)).toEqual("4th");
      expect(ordinal(14)).toEqual("14th");
      expect(ordinal(24)).toEqual("24th");
    });
  });

  describe("custom number processor", () => {
    it("should use the custom number processor if provided", () => {
      expect(ordinal(1, { numberProcessor: (n) => `Number_${n}` })).toEqual(
        "Number_1st"
      );
      expect(ordinal(22, { numberProcessor: (n) => `Num(${n})` })).toEqual(
        "Num(22)nd"
      );
    });
  });
});
