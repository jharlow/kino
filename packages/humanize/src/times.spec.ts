import { describe, expect, it } from "vitest";
import { times } from "./times";

describe(times, () => {
  it("should say never", () => {
    expect(times(0)).toEqual("never");
  });

  it("should say once", () => {
    expect(times(1)).toEqual("once");
  });

  it("should say twice", () => {
    expect(times(2)).toEqual("twice");
    expect(times(2, { 2: "dos times" })).toEqual("dos times");
  });

  it("should say thrice or three times", () => {
    expect(times(3)).toEqual("3 times");
    expect(times(3, { 3: "thrice" })).toEqual("thrice");
  });

  it("should say 12 times", () => {
    expect(times(12)).toEqual("12 times");
    expect(times(12, { 12: "douze times" })).toEqual("douze times");
  });

  it("should allow number overrides for specified values", () => {
    expect(times(12, { 12: "too many times" })).toEqual("too many times");
  });

  it("should use the overridden default suffix if supplied", () => {
    expect(times(12, undefined, "occurrences")).toBe("12 occurrences");
  });
});
