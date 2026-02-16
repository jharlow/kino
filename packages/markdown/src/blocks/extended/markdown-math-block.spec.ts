import { describe, it, expect } from "vitest";
import { b } from "../../index";
import { MarkdownMathBlock } from "./markdown-math-block";

describe("MarkdownMathBlock", () => {
  describe("inline math (single content, no newlines)", () => {
    it("should render single string with $ delimiters", () => {
      expect(b.math("x^2").render()).toBe("$x^2$");
    });

    it("should render a simple expression", () => {
      expect(b.math("a + b = c").render()).toBe("$a + b = c$");
    });

    it("should render single inline block with $ delimiters", () => {
      const inner = b.p("E = mc^2");
      expect(b.math(inner).render()).toBe("$E = mc^2$");
    });
  });

  describe("block math (multiple content or newlines)", () => {
    it("should render multiple strings with $$ delimiters", () => {
      expect(b.math("x^2", " + ", "y^2").render()).toBe(
        "$$\nx^2 + y^2\n$$",
      );
    });

    it("should render content containing newlines with $$ delimiters", () => {
      expect(b.math("x^2\ny^2").render()).toBe("$$\nx^2\ny^2\n$$");
    });

    it("should render two separate lines with $$ delimiters", () => {
      expect(b.math("line1", "line2").render()).toBe("$$\nline1line2\n$$");
    });
  });

  describe("empty content", () => {
    it("should return null for no arguments", () => {
      expect(b.math().render()).toBeNull();
    });

    it("should return null when all content is null", () => {
      expect(b.math(null, null).render()).toBeNull();
    });

    it("should return null when all content is undefined", () => {
      expect(b.math(undefined).render()).toBeNull();
    });

    it("should return null when all content is empty string", () => {
      expect(b.math("", "").render()).toBeNull();
    });
  });

  describe("isEmpty", () => {
    it("should be true when no content", () => {
      expect(b.math().isEmpty).toBe(true);
    });

    it("should be false when content is present", () => {
      expect(b.math("x").isEmpty).toBe(false);
    });
  });

  describe("trim behavior", () => {
    it("should strip leading newline from single content via dedent", () => {
      // Single content with leading newline: dedent strips it, leaving no newlines → inline
      expect(b.math("\nx^2").render()).toBe("$x^2$");
    });

    it("should strip trailing newline from single content via dedent", () => {
      expect(b.math("x^2\n").render()).toBe("$x^2$");
    });

    it("should strip both leading and trailing newlines from single content", () => {
      expect(b.math("\nx^2\n").render()).toBe("$x^2$");
    });

    it("should preserve inner empty lines in multiline content", () => {
      expect(b.math("a\n\nb").render()).toBe("$$\na\n\nb\n$$");
    });

    it("should strip leading empty lines in multiline content", () => {
      expect(b.math("\na\nb").render()).toBe("$$\na\nb\n$$");
    });

    it("should strip trailing empty lines in multiline content", () => {
      expect(b.math("a\nb\n").render()).toBe("$$\na\nb\n$$");
    });

    it("should preserve leading/trailing newlines when $trim is false", () => {
      const block = b.math("\nx^2\n").trim(false);
      // With trim off, newlines are preserved → has newlines → block math
      expect(block.render()).toBe("$$\n\nx^2\n\n$$");
    });
  });

  describe("constructor", () => {
    it("should be an instance of MarkdownMathBlock", () => {
      expect(b.math("x")).toBeInstanceOf(MarkdownMathBlock);
    });

    it("should accept mixed content types", () => {
      const block = b.math("count = ", 42);
      expect(block.render()).toBe("$$\ncount = 42\n$$");
    });
  });

  describe("coercion", () => {
    it("should be coercible via String()", () => {
      expect(String(b.math("x^2"))).toBe("$x^2$");
    });

    it("should be coercible via template literal", () => {
      expect(`${b.math("x^2")}`).toBe("$x^2$");
    });

    it("should return empty string for empty block via template literal", () => {
      expect(`${b.math()}`).toBe("");
    });
  });

  describe("inherited methods", () => {
    it("should support emptyIf to clear content", () => {
      expect(b.math("x").emptyIf(true).render()).toBeNull();
    });

    it("should support emptyIf to keep content", () => {
      expect(b.math("x").emptyIf(false).render()).toBe("$x$");
    });

    it("should support if to keep content when truthy", () => {
      expect(b.math("x").if(true).render()).toBe("$x$");
    });

    it("should support if to clear content when falsy", () => {
      expect(b.math("x").if(false).render()).toBeNull();
    });

    it("should support defaultIfEmpty", () => {
      expect(b.math().defaultIfEmpty("fallback").render()).toBe("$fallback$");
    });

    it("should not override existing content with defaultIfEmpty", () => {
      expect(b.math("x").defaultIfEmpty("fallback").render()).toBe("$x$");
    });

    it("should support change()", () => {
      const result = b.math("x").change((blk) => {
        blk.$content = ["y"];
        return blk;
      });
      expect(result.render()).toBe("$y$");
    });
  });
});
