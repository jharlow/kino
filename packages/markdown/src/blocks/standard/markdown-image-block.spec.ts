import { describe, it, expect } from "vitest";
import { b, MarkdownImageBlock } from "../../index";

describe("MarkdownImageBlock", () => {
  it("should render an image with alt text", () => {
    expect(String(b.image("photo.png", "A photo"))).toBe(
      "![A photo](photo.png)",
    );
  });

  it("should return null when no alt text is provided", () => {
    expect(b.image("photo.png").render()).toBeNull();
  });

  it("should report isEmpty when no alt text", () => {
    expect(b.image("photo.png").isEmpty).toBe(true);
  });

  it("should report not isEmpty when alt text is provided", () => {
    expect(b.image("photo.png", "A photo").isEmpty).toBe(false);
  });

  it("should be coercible via String()", () => {
    expect(String(b.image("photo.png", "A photo"))).toBe(
      "![A photo](photo.png)",
    );
  });

  it("should be coercible via template literal", () => {
    expect(`${b.image("photo.png", "A photo")}`).toBe("![A photo](photo.png)");
  });

  it("should accept nested inline content in alt", () => {
    expect(String(b.image("photo.png", "a ", b.bold("bold"), " caption"))).toBe(
      "![a **bold** caption](photo.png)",
    );
  });

  it("should include src in metadata tags", () => {
    const tags = b.image("photo.png", "A photo").getMetadataTags();
    expect(tags).toContain("src=photo.png");
  });

  it("should set default src and alt if empty via defaultIfEmpty()", () => {
    const block = b.image("original.png");
    block.defaultIfEmpty("fallback.png", "Fallback alt");
    expect(String(block)).toBe("![Fallback alt](fallback.png)");
  });

  it("should not override non-empty image via defaultIfEmpty()", () => {
    const block = b.image("original.png", "Original alt");
    block.defaultIfEmpty("fallback.png", "Fallback alt");
    expect(String(block)).toBe("![Original alt](original.png)");
  });

  it("should set default via default() alias", () => {
    const block = b.image("original.png");
    block.default("fallback.png", "Fallback alt");
    expect(String(block)).toBe("![Fallback alt](fallback.png)");
  });

  it("should not override non-empty image via default() alias", () => {
    const block = b.image("original.png", "Original alt");
    block.default("fallback.png", "Fallback alt");
    expect(String(block)).toBe("![Original alt](original.png)");
  });

  it("should be creatable via b.img alias", () => {
    expect(String(b.img("photo.png", "A photo"))).toBe("![A photo](photo.png)");
  });

  it("should be chainable from paragraph via .image()", () => {
    expect(String(b.p("A photo").image("photo.png"))).toBe(
      "![A photo](photo.png)",
    );
  });

  it("should be chainable from paragraph via .img()", () => {
    expect(String(b.p("A photo").img("photo.png"))).toBe(
      "![A photo](photo.png)",
    );
  });

  it("should render html if a caption is provided", () => {
    expect(String(b.image("photo.png", "A photo").caption("A caption"))).toBe(
      '<figure>\n  <img src="photo.png" alt="A photo">\n  <figcaption>A caption</figcaption>\n</figure>',
    );
  });

  it("should not render alt tag if caption is provided but no alt text", () => {
    expect(String(b.image("photo.png").caption("A caption"))).toBe(
      '<figure>\n  <img src="photo.png">\n  <figcaption>A caption</figcaption>\n</figure>',
    );
  });

  describe("caption", () => {
    it("should be chainable and return this", () => {
      const img = b.image("photo.png", "alt");
      const result = img.caption("caption");
      expect(result).toBe(img);
    });

    it("should set $caption property", () => {
      const img = b.image("photo.png", "alt").caption("My caption");
      expect(img.$caption).toEqual(["My caption"]);
    });

    it("should render caption with nested bold", () => {
      expect(
        String(
          b.image("photo.png", "alt").caption("Taken in ", b.bold("Paris")),
        ),
      ).toBe(
        '<figure>\n  <img src="photo.png" alt="alt">\n  <figcaption>Taken in **Paris**</figcaption>\n</figure>',
      );
    });

    it("should render caption with nested italic", () => {
      expect(
        String(b.image("photo.png", "alt").caption(b.italic("emphasis"))),
      ).toBe(
        '<figure>\n  <img src="photo.png" alt="alt">\n  <figcaption>*emphasis*</figcaption>\n</figure>',
      );
    });

    it("should show alt and caption as distinct trees in inspect", () => {
      const img = b.image("photo.png", "alt text").caption("My caption");
      const tree = b.inspect(img);
      expect(tree).toContain("alt");
      expect(tree).toContain('"alt text"');
      expect(tree).toContain("caption");
      expect(tree).toContain('"My caption"');
    });

    it("should show only caption in inspect when no alt", () => {
      const img = b.image("photo.png").caption("My caption");
      const tree = b.inspect(img);
      expect(tree).not.toContain("├── alt");
      expect(tree).toContain("caption");
      expect(tree).toContain('"My caption"');
    });

    it("should show nested blocks in caption inspect tree", () => {
      const img = b.image("photo.png", "alt").caption("Text ", b.bold("bold"));
      const tree = b.inspect(img);
      expect(tree).toContain("caption");
      expect(tree).toContain("MarkdownBoldBlock");
    });

    it("should not show caption grouping in inspect when no caption", () => {
      const img = b.image("photo.png", "alt text");
      const tree = b.inspect(img);
      expect(tree).not.toContain("caption");
      expect(tree).not.toContain("├── alt");
      expect(tree).toContain('"alt text"');
    });
  });
});
