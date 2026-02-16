import { describe, it, expect } from "vitest";
import { b } from "../../index";

describe("MarkdownFootnoteBlock", () => {
  describe("constructor", () => {
    it("should accept content lines in the constructor", () => {
      const block = b.footnote("Some footnote text");
      expect(block.$footer.$lines).toHaveLength(1);
    });

    it("should accept multiple content lines", () => {
      const block = b.footnote("Line one", "Line two", "Line three");
      expect(block.$footer.$lines).toHaveLength(3);
    });

    it("should start with no identifier", () => {
      const block = b.footnote("content");
      expect(block.$identifier).toBeUndefined();
    });
  });

  describe("identifier / id", () => {
    it("should set an alphanumeric identifier via .identifier()", () => {
      const block = b.footnote("content").identifier("abc123");
      expect(block.$identifier).toBe("abc123");
    });

    it("should set an alphanumeric identifier via .id()", () => {
      const block = b.footnote("content").id("note1");
      expect(block.$identifier).toBe("note1");
    });

    it("should reject identifiers with special characters", () => {
      const block = b.footnote("content").identifier("bad-id");
      expect(block.$identifier).toBeUndefined();
    });

    it("should reject identifiers with spaces", () => {
      const block = b.footnote("content").identifier("bad id");
      expect(block.$identifier).toBeUndefined();
    });

    it("should reject identifiers with dots", () => {
      const block = b.footnote("content").identifier("bad.id");
      expect(block.$identifier).toBeUndefined();
    });

    it("should reject identifiers with underscores", () => {
      const block = b.footnote("content").identifier("bad_id");
      expect(block.$identifier).toBeUndefined();
    });

    it("should only set the identifier once", () => {
      const block = b
        .footnote("content")
        .identifier("first")
        .identifier("second");
      expect(block.$identifier).toBe("first");
    });

    it("should only set the identifier once via .id()", () => {
      const block = b.footnote("content").id("first").id("second");
      expect(block.$identifier).toBe("first");
    });

    it("should be chainable", () => {
      const block = b.footnote("content");
      const result = block.identifier("abc");
      expect(result).toBe(block);
    });

    it("should be chainable even when identifier is rejected", () => {
      const block = b.footnote("content");
      const result = block.identifier("bad-id");
      expect(result).toBe(block);
    });

    it("should accept purely numeric identifiers", () => {
      const block = b.footnote("content").identifier("42");
      expect(block.$identifier).toBe("42");
    });

    it("should accept purely alphabetic identifiers", () => {
      const block = b.footnote("content").identifier("abc");
      expect(block.$identifier).toBe("abc");
    });
  });

  describe("render", () => {
    it("should render a footnote reference with the identifier", () => {
      expect(b.footnote("content").id("abc").render()).toBe("[^abc]");
    });

    it("should return null when no identifier is set", () => {
      expect(b.footnote("content").render()).toBeNull();
    });

    it("should return null when footer is empty", () => {
      expect(b.footnote().id("abc").render()).toBeNull();
    });

    it("should return null when both identifier and content are missing", () => {
      expect(b.footnote().render()).toBeNull();
    });

    it("should render reference with numeric identifier", () => {
      expect(b.footnote("text").id("1").render()).toBe("[^1]");
    });
  });

  describe("renderDefinition", () => {
    it("should render the full footnote definition", () => {
      expect(
        b.footnote("Some explanation").id("note1").renderDefinition(),
      ).toBe("[^note1]: Some explanation");
    });

    it("should return null when no identifier is set", () => {
      expect(b.footnote("content").renderDefinition()).toBeNull();
    });

    it("should return null when footer is empty", () => {
      expect(b.footnote().id("abc").renderDefinition()).toBeNull();
    });

    it("should return null when both identifier and content are missing", () => {
      expect(b.footnote().renderDefinition()).toBeNull();
    });

    it("should render definition with numeric identifier", () => {
      expect(b.footnote("Details here").id("1").renderDefinition()).toBe(
        "[^1]: Details here",
      );
    });
  });

  describe("multi-line footnotes", () => {
    it("should store multiple lines in $footer", () => {
      const block = b.footnote("Line 1", "Line 2");
      expect(block.$footer.$lines).toHaveLength(2);
    });

    it("should render multi-line definition content", () => {
      const block = b.footnote("Line 1", "Line 2").id("ml");
      const definition = block.renderDefinition();
      expect(definition).not.toBeNull();
      expect(definition).toContain("Line 1");
      expect(definition).toContain("Line 2");
    });
  });

  describe("$footer property", () => {
    it("should expose $footer as a MarkdownMultilineBlock", () => {
      const block = b.footnote("content");
      expect(block.$footer).toBeDefined();
      expect(block.$footer.$lines).toBeDefined();
    });

    it("should contain the constructor content in $footer.$lines", () => {
      const block = b.footnote("hello", "world");
      expect(block.$footer.$lines).toEqual(["hello", "world"]);
    });
  });

  describe("isEmpty", () => {
    it("should be empty when no content is provided", () => {
      expect(b.footnote().id("abc").$footer.isEmpty).toBe(true);
    });

    it("should not be empty when content is provided", () => {
      expect(b.footnote("content").$footer.isEmpty).toBe(false);
    });
  });

  describe("coercion", () => {
    it("should be coercible via String()", () => {
      expect(String(b.footnote("text").id("ref"))).toBe("[^ref]");
    });

    it("should be coercible via template literal", () => {
      expect(`${b.footnote("text").id("ref")}`).toBe("[^ref]");
    });

    it("should coerce to empty string when render returns null", () => {
      expect(String(b.footnote("text"))).toBe("");
    });

    it("should coerce to empty string with no content and no id", () => {
      expect(String(b.footnote())).toBe("");
    });
  });

  describe("getMetadataTags", () => {
    it("should include identifier tag when identifier is set", () => {
      const tags = b.footnote("content").id("abc").getMetadataTags();
      expect(tags).toContain("identifier=abc");
    });

    it("should not include identifier tag when identifier is not set", () => {
      const tags = b.footnote("content").getMetadataTags();
      expect(tags).toEqual([]);
    });

    it("should reflect the actual identifier value", () => {
      const tags = b.footnote("content").id("note42").getMetadataTags();
      expect(tags).toContain("identifier=note42");
    });
  });

  describe("factory aliases", () => {
    it("should be creatable via b.footnote()", () => {
      const block = b.footnote("text").id("a");
      expect(block.render()).toBe("[^a]");
    });

    it("should be creatable via b.foot()", () => {
      const block = b.foot("text").id("a");
      expect(block.render()).toBe("[^a]");
    });

    it("should be creatable via b.fn()", () => {
      const block = b.fn("text").id("a");
      expect(block.render()).toBe("[^a]");
    });

    it("should produce equivalent results from all factories", () => {
      const a = b.footnote("content").id("x").render();
      const c = b.foot("content").id("x").render();
      const d = b.fn("content").id("x").render();
      expect(a).toBe(c);
      expect(a).toBe(d);
    });

    it("should produce equivalent definitions from all factories", () => {
      const a = b.footnote("content").id("x").renderDefinition();
      const c = b.foot("content").id("x").renderDefinition();
      const d = b.fn("content").id("x").renderDefinition();
      expect(a).toBe(c);
      expect(a).toBe(d);
    });
  });
});
