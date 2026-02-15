import { describe, it, expect } from "vitest";
import { b } from "../../index";

describe("MarkdownLineBreakBlock", () => {
  it("should always render a newline", () => {
    expect(b.br().render()).toBe("\n");
  });

  it("should be creatable via b.lineBreak()", () => {
    expect(b.lineBreak().render()).toBe("\n");
  });

  it("should be creatable via b.br()", () => {
    expect(b.br().render()).toBe("\n");
  });

  it("should be coercible via String()", () => {
    expect(String(b.br())).toBe("\n");
  });
});
