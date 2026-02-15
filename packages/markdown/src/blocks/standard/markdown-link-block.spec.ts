import { describe, it, expect } from "vitest";
import { b } from "../../index";

describe("MarkdownLinkBlock", () => {
  it("should render a link with label", () => {
    expect(String(b.link("https://example.com", "Example"))).toBe(
      "[Example](https://example.com)",
    );
  });

  it("should render an auto-link without label", () => {
    expect(String(b.link("https://example.com"))).toBe("<https://example.com>");
  });

  it("should be coercible via String()", () => {
    expect(String(b.link("https://example.com", "click here"))).toBe(
      "[click here](https://example.com)",
    );
  });

  it("should be coercible via template literal", () => {
    expect(`${b.link("https://example.com", "click here")}`).toBe(
      "[click here](https://example.com)",
    );
  });

  it("should accept nested inline content in label", () => {
    expect(
      String(b.link("https://example.com", "hello ", b.bold("world"))),
    ).toBe("[hello **world**](https://example.com)");
  });

  it("should include url in metadata tags", () => {
    const tags = b.link("https://example.com", "Example").getMetadataTags();
    expect(tags).toContain("url=https://example.com");
  });

  it("should set default url and label if empty via defaultIfEmpty()", () => {
    const block = b.link("https://original.com");
    block.defaultIfEmpty("https://fallback.com", "Fallback");
    expect(String(block)).toBe("[Fallback](https://fallback.com)");
  });

  it("should not override non-empty link via defaultIfEmpty()", () => {
    const block = b.link("https://original.com", "Original");
    block.defaultIfEmpty("https://fallback.com", "Fallback");
    expect(String(block)).toBe("[Original](https://original.com)");
  });

  it("should set default via default() alias", () => {
    const block = b.link("https://original.com");
    block.default("https://fallback.com", "Fallback");
    expect(String(block)).toBe("[Fallback](https://fallback.com)");
  });

  it("should not override non-empty link via default() alias", () => {
    const block = b.link("https://original.com", "Original");
    block.default("https://fallback.com", "Fallback");
    expect(String(block)).toBe("[Original](https://original.com)");
  });

  it("should be creatable via b.url alias", () => {
    expect(String(b.url("https://example.com", "Example"))).toBe(
      "[Example](https://example.com)",
    );
  });

  it("should be chainable from paragraph via .link()", () => {
    expect(String(b.p("click here").link("https://example.com"))).toBe(
      "[click here](https://example.com)",
    );
  });

  it("should be chainable from paragraph via .url()", () => {
    expect(String(b.p("click here").url("https://example.com"))).toBe(
      "[click here](https://example.com)",
    );
  });

  it("should render html when given a link target", () => {
    expect(
      String(b.link("https://example.com", "Example").target("_blank")),
    ).toBe('<a href="https://example.com" target="_blank">Example</a>');
  });

  it("should use the link if a label is not provided", () => {
    expect(String(b.link("https://example.com").target("_blank"))).toBe(
      '<a href="https://example.com" target="_blank">https://example.com</a>',
    );
  });

  it("should include target in metadata tags", () => {
    const tags = b
      .link("https://example.com", "Example")
      .target("_blank")
      .getMetadataTags();
    expect(tags).toContain("target=_blank");
  });
});
