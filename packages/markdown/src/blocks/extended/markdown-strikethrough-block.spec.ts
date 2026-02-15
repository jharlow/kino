import { describe, it, expect } from "vitest";
import { b } from "../../index";

describe("MarkdownStrikethroughBlock", () => {
  it("should render strikethrough with ~~ delimiters", () => {
    expect(String(b.strikethrough("text"))).toBe("~~text~~");
  });

  it("should have no style options", () => {
    expect(b.strikethrough("text").getMetadataTags()).toEqual([]);
  });

  it("should return null for empty content", () => {
    expect(b.strikethrough().render()).toBeNull();
  });

  it("should report isEmpty correctly", () => {
    expect(b.strikethrough().isEmpty).toBe(true);
    expect(b.strikethrough("text").isEmpty).toBe(false);
  });

  it("should be creatable via b.strikethrough()", () => {
    expect(String(b.strikethrough("text"))).toBe("~~text~~");
  });

  it("should be creatable via b.strike()", () => {
    expect(String(b.strike("text"))).toBe("~~text~~");
  });

  it("should be creatable via b.st()", () => {
    expect(String(b.st("text"))).toBe("~~text~~");
  });

  it("should be chainable from paragraph via .st()", () => {
    expect(String(b.p("text").st())).toBe("~~text~~");
  });

  it("should be chainable from paragraph via .strikethrough()", () => {
    expect(String(b.p("text").strikethrough())).toBe("~~text~~");
  });

  it("should accept nested inline content", () => {
    expect(String(b.strikethrough("hello ", b.bold("world")))).toBe(
      "~~hello **world**~~",
    );
  });

  it("should be coercible via String()", () => {
    expect(String(b.strikethrough("text"))).toBe("~~text~~");
  });

  it("should be coercible via template literal", () => {
    expect(`${b.strikethrough("text")}`).toBe("~~text~~");
  });
});
