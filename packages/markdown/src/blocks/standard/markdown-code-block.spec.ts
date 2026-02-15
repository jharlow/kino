import { describe, it, expect } from "vitest";
import { b } from "../../index";

describe("MarkdownCodeBlock", () => {
  describe("inline code (single-line, no language)", () => {
    it("should render single-line content as inline code", () => {
      expect(String(b.code("hello"))).toBe("`hello`");
    });

    it("should render a single word as inline code", () => {
      expect(String(b.code("x"))).toBe("`x`");
    });

    it("should render inline code with spaces", () => {
      expect(String(b.code("hello world"))).toBe("`hello world`");
    });

    it("should render inline code with special characters", () => {
      expect(String(b.code("a + b = c"))).toBe("`a + b = c`");
    });
  });

  describe("fenced code block (multi-line)", () => {
    it("should render multi-line content as a fenced block", () => {
      expect(String(b.code("line1\nline2"))).toBe(
        "```\nline1\nline2\n```",
      );
    });

    it("should render fenced block with three or more lines", () => {
      expect(String(b.code("a\nb\nc"))).toBe("```\na\nb\nc\n```");
    });
  });

  describe("fenced code block (with language)", () => {
    it("should render single-line content as fenced when language is set", () => {
      expect(String(b.code("x = 1").language("py"))).toBe(
        "```py\nx = 1\n```",
      );
    });

    it("should render multi-line content with language", () => {
      expect(String(b.code("const a = 1;\nconst b = 2;").language("js"))).toBe(
        "```js\nconst a = 1;\nconst b = 2;\n```",
      );
    });

    it("should accept various language identifiers", () => {
      expect(String(b.code("{}").language("json"))).toBe(
        "```json\n{}\n```",
      );
      expect(String(b.code("<p>hi</p>").language("html"))).toBe(
        "```html\n<p>hi</p>\n```",
      );
      expect(String(b.code("SELECT 1").language("sql"))).toBe(
        "```sql\nSELECT 1\n```",
      );
    });
  });

  describe(".language() chainable method", () => {
    it("should return the block instance for chaining", () => {
      const block = b.code("test");
      const result = block.language("ts");
      expect(result).toBe(block);
    });

    it("should set $language property", () => {
      const block = b.code("test").language("rust");
      expect(block.$language).toBe("rust");
    });

    it("should default $language to undefined", () => {
      const block = b.code("test");
      expect(block.$language).toBeUndefined();
    });
  });

  describe("trim and dedent", () => {
    it("should default $trim to true", () => {
      const block = b.code("test");
      expect(block.$trim).toBe(true);
    });

    it("should strip leading and trailing empty lines when $trim is true", () => {
      const block = b.code("\n\nhello\n\n").language("txt");
      expect(String(block)).toBe("```txt\nhello\n```");
    });

    it("should strip leading empty lines from fenced content", () => {
      const block = b.code("\n\nfirst\nsecond").language("txt");
      expect(String(block)).toBe("```txt\nfirst\nsecond\n```");
    });

    it("should strip trailing empty lines from fenced content", () => {
      const block = b.code("first\nsecond\n\n").language("txt");
      expect(String(block)).toBe("```txt\nfirst\nsecond\n```");
    });

    it("should dedent content by removing common leading whitespace", () => {
      const block = b.code("    line1\n    line2").language("txt");
      expect(String(block)).toBe("```txt\nline1\nline2\n```");
    });

    it("should preserve relative indentation when dedenting", () => {
      const block = b
        .code(
          `
        function hello() {
          console.log("world");
        }
      `,
        )
        .language("js")
        .trim();
      expect(String(block)).toBe(
        '```js\nfunction hello() {\n  console.log("world");\n}\n```',
      );
    });

    it("should preserve relative indentation with nested blocks", () => {
      const block = b
        .code("    if (true) {\n      doSomething();\n    }")
        .language("js");
      expect(String(block)).toBe(
        "```js\nif (true) {\n  doSomething();\n}\n```",
      );
    });

    it("should allow disabling trim", () => {
      const block = b.code("\n  hello\n").language("txt").trim(false);
      expect(String(block)).toBe("```txt\n\n  hello\n\n```");
    });

    it("should be chainable via .trim()", () => {
      const block = b.code("test");
      const result = block.trim(true);
      expect(result).toBe(block);
    });

    it("should dedent inline code as well", () => {
      expect(String(b.code("  hello  "))).toBe("`hello  `");
    });

    it("should handle trim with mixed indentation levels", () => {
      const block = b.code("      a\n        b\n      c").language("txt");
      expect(String(block)).toBe("```txt\na\n  b\nc\n```");
    });

    it("should not dedent when trim is false", () => {
      const block = b.code("  a\n  b").trim(false);
      expect(String(block)).toBe("```\n  a\n  b\n```");
    });
  });

  describe("empty handling", () => {
    it("should return null when empty", () => {
      expect(b.code().render()).toBeNull();
    });

    it("should return null for empty string", () => {
      expect(b.code("").render()).toBeNull();
    });

    it("should report isEmpty for no content", () => {
      expect(b.code().isEmpty).toBe(true);
    });

    it("should report isEmpty for empty string content", () => {
      expect(b.code("").isEmpty).toBe(true);
    });

    it("should not be empty with content", () => {
      expect(b.code("hello").isEmpty).toBe(false);
    });

    it("should return null for null content", () => {
      expect(b.code(null).render()).toBeNull();
    });

    it("should return null for undefined content", () => {
      expect(b.code(undefined).render()).toBeNull();
    });
  });

  describe("coercion", () => {
    it("should be coercible via String()", () => {
      expect(String(b.code("test"))).toBe("`test`");
    });

    it("should be coercible via template literal", () => {
      expect(`${b.code("test")}`).toBe("`test`");
    });

    it("should coerce to empty string when empty", () => {
      expect(String(b.code())).toBe("");
    });

    it("should coerce fenced block via String()", () => {
      expect(String(b.code("a\nb"))).toBe("```\na\nb\n```");
    });

    it("should coerce fenced block via template literal", () => {
      expect(`${b.code("a\nb")}`).toBe("```\na\nb\n```");
    });

    it("should coerce language-tagged block via String()", () => {
      expect(String(b.code("x").language("py"))).toBe("```py\nx\n```");
    });
  });

  describe("factory aliases", () => {
    it("should be creatable via b.code()", () => {
      expect(String(b.code("test"))).toBe("`test`");
    });

    it("should be creatable via b.codeblock()", () => {
      expect(String(b.codeblock("test"))).toBe("`test`");
    });

    it("should produce equivalent results from both factories", () => {
      expect(String(b.code("hello").language("js"))).toBe(
        String(b.codeblock("hello").language("js")),
      );
    });
  });

  describe("getMetadataTags", () => {
    it("should include language tag when language is set", () => {
      const block = b.code("test").language("python");
      expect(block.getMetadataTags()).toContain("language=python");
    });

    it("should not include language tag when language is not set", () => {
      const block = b.code("test");
      expect(block.getMetadataTags()).toEqual([]);
    });

    it("should reflect the actual language value", () => {
      const block = b.code("test").language("typescript");
      expect(block.getMetadataTags()).toContain("language=typescript");
    });
  });

  describe("multiple content arguments", () => {
    it("should join multiple content arguments", () => {
      const block = b.code("line1", "line2");
      const rendered = block.render();
      expect(rendered).not.toBeNull();
      expect(rendered).toContain("line1");
      expect(rendered).toContain("line2");
    });
  });

  describe("edge cases", () => {
    it("should render whitespace-only lines as fenced block after trim", () => {
      const block = b.code("\n   \n  \n").language("txt");
      // The content is not truly empty (the base class sees non-empty string content),
      // but trim strips leading/trailing empty lines, leaving an empty line in the middle
      const rendered = block.render();
      expect(rendered).toBe("```txt\n\n```");
    });

    it("should render single newline as fenced block after trim", () => {
      const block = b.code("\n").language("txt");
      // A newline is non-empty content; after trimming empty lines, an empty line remains
      const rendered = block.render();
      expect(rendered).toBe("```txt\n\n```");
    });

    it("should handle code with backticks in content", () => {
      const block = b.code("use `this`");
      expect(String(block)).toBe("`use `this``");
    });

    it("should handle code with triple backticks in fenced block", () => {
      const block = b.code("use ```this```\nmore").language("md");
      expect(String(block)).toContain("```md");
    });

    it("should handle numeric content", () => {
      expect(String(b.code(42))).toBe("`42`");
    });

    it("should handle boolean content", () => {
      expect(String(b.code(true))).toBe("`true`");
    });

    it("should handle content with only spaces (single line)", () => {
      // Spaces-only content gets trimmed, resulting in empty inline code
      const block = b.code("   ");
      const rendered = block.render();
      expect(rendered).toBe("``");
    });
  });
});
