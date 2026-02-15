import { describe, it, expect } from "vitest";
import { b } from "../../index";

describe("MarkdownItalicBlock", () => {
  it("should render italic with default * style", () => {
    expect(String(b.italic("text"))).toBe("*text*");
  });

  it("should render italic with _ style", () => {
    expect(String(b.italic("text").style("_"))).toBe("_text_");
  });

  it("should render italic with * style explicitly", () => {
    expect(String(b.italic("text").style("*"))).toBe("*text*");
  });

  it("should return null for empty content", () => {
    expect(b.italic().render()).toBeNull();
  });

  it("should report isEmpty correctly", () => {
    expect(b.italic().isEmpty).toBe(true);
    expect(b.italic("text").isEmpty).toBe(false);
  });

  it("should accept nested inline blocks", () => {
    expect(String(b.italic("hello ", b.bold("world")))).toBe(
      "*hello **world***",
    );
  });

  it("should be coercible via template literal", () => {
    expect(`${b.italic("text")}`).toBe("*text*");
  });

  it("should be coercible via String()", () => {
    expect(String(b.italic("text"))).toBe("*text*");
  });

  it("should include style in metadata tags when set", () => {
    expect(b.italic("text").style("_").getMetadataTags()).toContain(
      "style=_",
    );
  });

  it("should have no metadata tags with default style", () => {
    expect(b.italic("text").getMetadataTags()).toEqual([]);
  });

  it("should be creatable via b.i alias", () => {
    expect(String(b.i("text"))).toBe("*text*");
  });

  it("should respect enforce.italic option", () => {
    const block = b.italic("text");
    expect(block.render({ enforce: { italic: { style: "_" } } })).toBe(
      "_text_",
    );
  });

  it("should let enforce override explicit style", () => {
    const block = b.italic("text").style("_");
    expect(block.render({ enforce: { italic: { style: "*" } } })).toBe(
      "*text*",
    );
  });

  it("should be chainable from paragraph via .i()", () => {
    expect(String(b.p("text").i())).toBe("*text*");
  });

  it("should be chainable from paragraph via .italic()", () => {
    expect(String(b.p("text").italic())).toBe("*text*");
  });
});
