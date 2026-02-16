import { describe, it, expect } from "vitest";
import { b, MarkdownLinkBlock } from "../../index";

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

  describe("target", () => {
    it("should render _self target", () => {
      expect(
        String(b.link("https://example.com", "Example").target("_self")),
      ).toBe('<a href="https://example.com" target="_self">Example</a>');
    });

    it("should render _parent target", () => {
      expect(
        String(b.link("https://example.com", "Example").target("_parent")),
      ).toBe('<a href="https://example.com" target="_parent">Example</a>');
    });

    it("should render _top target", () => {
      expect(
        String(b.link("https://example.com", "Example").target("_top")),
      ).toBe('<a href="https://example.com" target="_top">Example</a>');
    });

    it("should be chainable and return this", () => {
      const link = b.link("https://example.com", "Example");
      const result = link.target("_blank");
      expect(result).toBe(link);
    });

    it("should set $target property", () => {
      const link = b.link("https://example.com", "Example").target("_blank");
      expect(link.$target).toBe("_blank");
    });

    it("should render nested bold inside targeted link", () => {
      expect(
        String(b.link("https://example.com", b.bold("Bold")).target("_blank")),
      ).toBe('<a href="https://example.com" target="_blank">**Bold**</a>');
    });

    it("should not include target in metadata tags when unset", () => {
      const tags = b.link("https://example.com", "Example").getMetadataTags();
      expect(tags.join(",")).not.toContain("target=");
    });

    it("should include target for each target value in metadata", () => {
      for (const t of ["_blank", "_self", "_parent", "_top"] as const) {
        const tags = b
          .link("https://example.com", "Example")
          .target(t)
          .getMetadataTags();
        expect(tags).toContain(`target=${t}`);
      }
    });
  });
});
