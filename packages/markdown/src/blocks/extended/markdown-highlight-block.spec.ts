import { describe, it, expect } from "vitest";
import { b } from "../../index";

describe("MarkdownHighlightBlock", () => {
  it("should render highlight with == delimiters", () => {
    expect(String(b.highlight("text"))).toBe("==text==");
  });

  it("should have no style options", () => {
    expect(b.highlight("text").getMetadataTags()).toEqual([]);
  });

  it("should return null for empty content", () => {
    expect(b.highlight().render()).toBeNull();
  });

  it("should report isEmpty correctly", () => {
    expect(b.highlight().isEmpty).toBe(true);
    expect(b.highlight("text").isEmpty).toBe(false);
  });

  it("should be creatable via b.highlight()", () => {
    expect(String(b.highlight("text"))).toBe("==text==");
  });

  it("should be creatable via b.high()", () => {
    expect(String(b.high("text"))).toBe("==text==");
  });

  it("should be creatable via b.hl()", () => {
    expect(String(b.hl("text"))).toBe("==text==");
  });

  it("should be chainable from paragraph via .hl()", () => {
    expect(String(b.p("text").hl())).toBe("==text==");
  });

  it("should be chainable from paragraph via .highlight()", () => {
    expect(String(b.p("text").highlight())).toBe("==text==");
  });

  it("should accept nested inline content", () => {
    expect(String(b.highlight("hello ", b.bold("world")))).toBe(
      "==hello **world**==",
    );
  });

  it("should be coercible via String()", () => {
    expect(String(b.highlight("text"))).toBe("==text==");
  });

  it("should be coercible via template literal", () => {
    expect(`${b.highlight("text")}`).toBe("==text==");
  });
});
