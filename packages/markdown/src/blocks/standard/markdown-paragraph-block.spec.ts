import { describe, it, expect } from "vitest";
import { b } from "../../index";

describe("MarkdownParagraphBlock", () => {
  it("should render content as plain inline text", () => {
    expect(b.p("Hello world").render()).toBe("Hello world");
  });

  it("should be creatable via b.paragraph()", () => {
    expect(String(b.paragraph("text"))).toBe("text");
  });

  it("should be creatable via b.para()", () => {
    expect(String(b.para("text"))).toBe("text");
  });

  it("should be creatable via b.p()", () => {
    expect(String(b.p("text"))).toBe("text");
  });

  it("should report isEmpty correctly", () => {
    expect(b.p().isEmpty).toBe(true);
    expect(b.p("text").isEmpty).toBe(false);
  });

  it("should return null when empty", () => {
    expect(b.p().render()).toBeNull();
  });

  it("should chain .b() for bold", () => {
    expect(String(b.p("text").b())).toBe("**text**");
  });

  it("should chain .i() for italic", () => {
    expect(String(b.p("text").i())).toBe("*text*");
  });

  it("should chain .st() for strikethrough", () => {
    expect(String(b.p("text").st())).toBe("~~text~~");
  });

  it("should chain .hl() for highlight", () => {
    expect(String(b.p("text").hl())).toBe("==text==");
  });

  it("should chain .sub() for subscript", () => {
    expect(String(b.sub("text"))).toBe("~text~");
  });

  it("should chain .sup() for superscript", () => {
    expect(String(b.p("text").sup())).toBe("^text^");
  });

  it("should chain .url() for link", () => {
    expect(String(b.p("click").url("https://example.com"))).toBe(
      "[click](https://example.com)",
    );
  });

  it("should chain .img() for image", () => {
    expect(String(b.p("alt").img("https://example.com/img.png"))).toBe(
      "![alt](https://example.com/img.png)",
    );
  });

  it("should clear content when emptyIf condition is falsy", () => {
    expect(b.p("text").emptyIf(false).render()).toBeNull();
  });

  it("should keep content when emptyIf condition is truthy", () => {
    expect(b.p("text").emptyIf(true).render()).toBe("text");
  });

  it("should clear content when .if() condition is falsy", () => {
    expect(b.p("text").if(false).render()).toBeNull();
  });

  it("should keep content when .if() condition is truthy", () => {
    expect(b.p("text").if(true).render()).toBe("text");
  });

  it("should set default content when empty via defaultIfEmpty()", () => {
    expect(b.p().defaultIfEmpty("fallback").render()).toBe("fallback");
  });

  it("should not override existing content via defaultIfEmpty()", () => {
    expect(b.p("text").defaultIfEmpty("fallback").render()).toBe("text");
  });

  it("should set default content when empty via .default()", () => {
    expect(b.p().default("fallback").render()).toBe("fallback");
  });

  it("should not override existing content via .default()", () => {
    expect(b.p("text").default("fallback").render()).toBe("text");
  });

  it("should be coercible via String()", () => {
    expect(String(b.p("text"))).toBe("text");
  });

  it("should be coercible via template literal", () => {
    expect(`${b.p("text")}`).toBe("text");
  });

  it("should accept nested inline blocks", () => {
    expect(String(b.p("hello ", b.bold("world")))).toBe(
      "hello **world**",
    );
  });

  it("should accept multiple nested inline blocks", () => {
    expect(
      String(b.p("hello ", b.bold("bold"), " and ", b.italic("italic"))),
    ).toBe("hello **bold** and *italic*");
  });
});
