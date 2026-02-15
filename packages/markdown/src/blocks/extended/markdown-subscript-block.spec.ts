import { describe, it, expect } from "vitest";
import { b } from "../../index";

describe("MarkdownSubscriptBlock", () => {
  it("should render subscript with ~ delimiters", () => {
    expect(String(b.subscript("text"))).toBe("~text~");
  });

  it("should have no style options", () => {
    expect(b.subscript("text").getMetadataTags()).toEqual([]);
  });

  it("should return null for empty content", () => {
    expect(b.subscript().render()).toBeNull();
  });

  it("should report isEmpty correctly", () => {
    expect(b.subscript().isEmpty).toBe(true);
    expect(b.subscript("text").isEmpty).toBe(false);
  });

  it("should be creatable via b.subscript()", () => {
    expect(String(b.subscript("text"))).toBe("~text~");
  });

  it("should be creatable via b.sub()", () => {
    expect(String(b.sub("text"))).toBe("~text~");
  });

  it("should accept nested inline content", () => {
    expect(String(b.subscript("hello ", b.bold("world")))).toBe(
      "~hello **world**~",
    );
  });

  it("should be coercible via String()", () => {
    expect(String(b.subscript("text"))).toBe("~text~");
  });

  it("should be coercible via template literal", () => {
    expect(`${b.subscript("text")}`).toBe("~text~");
  });
});
