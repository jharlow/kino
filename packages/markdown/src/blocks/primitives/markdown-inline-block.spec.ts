import { describe, it, expect } from "vitest";
import { b } from "../../index";
import { MarkdownInlineBlock } from "./markdown-inline-block";
import { MarkdownBoldBlock } from "../standard/markdown-bold-block";
import { MarkdownItalicBlock } from "../standard/markdown-italic-block";
import { MarkdownLinkBlock } from "../standard/markdown-link-block";
import { MarkdownImageBlock } from "../standard/markdown-image-block";
import { MarkdownStrikethroughBlock } from "../extended/markdown-strikethrough-block";
import { MarkdownHighlightBlock } from "../extended/markdown-highlight-block";
import { MarkdownSuperscriptBlock } from "../extended/markdown-superscript-block";

describe("MarkdownInlineBlock", () => {
  describe("constructor", () => {
    it("should accept string content", () => {
      const block = new MarkdownInlineBlock("hello");
      expect(block.$content).toEqual(["hello"]);
    });

    it("should accept multiple string arguments", () => {
      const block = new MarkdownInlineBlock("hello", " ", "world");
      expect(block.$content).toEqual(["hello", " ", "world"]);
    });

    it("should accept no arguments", () => {
      const block = new MarkdownInlineBlock();
      expect(block.$content).toEqual([]);
    });

    it("should accept nested inline blocks", () => {
      const inner = new MarkdownInlineBlock("inner");
      const block = new MarkdownInlineBlock("before ", inner);
      expect(block.$content).toHaveLength(2);
      expect(block.$content[0]).toBe("before ");
      expect(block.$content[1]).toBe(inner);
    });

    it("should accept mixed primitive types", () => {
      const block = new MarkdownInlineBlock("text", 42, true);
      expect(block.$content).toEqual(["text", 42, true]);
    });

    it("should accept null and undefined content", () => {
      const block = new MarkdownInlineBlock("text", null, undefined);
      expect(block.$content).toEqual(["text", null, undefined]);
    });
  });

  describe("render()", () => {
    it("should join string content", () => {
      const block = new MarkdownInlineBlock("hello", " ", "world");
      expect(block.render()).toBe("hello world");
    });

    it("should stringify primitive values", () => {
      const block = new MarkdownInlineBlock("count: ", 42);
      expect(block.render()).toBe("count: 42");
    });

    it("should stringify boolean values", () => {
      const block = new MarkdownInlineBlock("active: ", true);
      expect(block.render()).toBe("active: true");
    });

    it("should render nested inline blocks", () => {
      const inner = b.bold("world");
      const block = new MarkdownInlineBlock("hello ", inner);
      expect(block.render()).toBe("hello **world**");
    });

    it("should return null for empty content", () => {
      const block = new MarkdownInlineBlock();
      expect(block.render()).toBeNull();
    });

    it("should return null when all content is empty primitives", () => {
      const block = new MarkdownInlineBlock(null, undefined, "");
      expect(block.render()).toBeNull();
    });

    it("should filter null and undefined content when renderNullish is false", () => {
      const block = new MarkdownInlineBlock("hello", null, "world");
      expect(block.render({ renderNullish: false })).toBe("helloworld");
    });

    it("should include null and undefined content when renderNullish is true", () => {
      const block = new MarkdownInlineBlock("hello", null, "world");
      expect(block.render({ renderNullish: true })).toBe("hellonullworld");
    });
  });

  describe("isEmpty", () => {
    it("should be true when content is empty", () => {
      expect(new MarkdownInlineBlock().isEmpty).toBe(true);
    });

    it("should be true when all content is null", () => {
      expect(new MarkdownInlineBlock(null, null).isEmpty).toBe(true);
    });

    it("should be true when all content is undefined", () => {
      expect(new MarkdownInlineBlock(undefined, undefined).isEmpty).toBe(true);
    });

    it("should be true when all content is empty string", () => {
      expect(new MarkdownInlineBlock("", "").isEmpty).toBe(true);
    });

    it("should be true when content is mix of empty primitives", () => {
      expect(new MarkdownInlineBlock(null, undefined, "").isEmpty).toBe(true);
    });

    it("should be true when nested block is also empty", () => {
      const inner = new MarkdownInlineBlock();
      expect(new MarkdownInlineBlock(inner).isEmpty).toBe(true);
    });

    it("should be false when content has a non-empty string", () => {
      expect(new MarkdownInlineBlock("text").isEmpty).toBe(false);
    });

    it("should be false when content has a number", () => {
      expect(new MarkdownInlineBlock(0).isEmpty).toBe(false);
    });

    it("should be false when content has a boolean", () => {
      expect(new MarkdownInlineBlock(false).isEmpty).toBe(false);
    });

    it("should be false when nested block is non-empty", () => {
      const inner = new MarkdownInlineBlock("text");
      expect(new MarkdownInlineBlock(inner).isEmpty).toBe(false);
    });
  });

  describe("emptyIf()", () => {
    it("should keep content when condition is truthy", () => {
      const block = new MarkdownInlineBlock("text").emptyIf(true);
      expect(block.render()).toBe("text");
    });

    it("should clear content when condition is falsy (false)", () => {
      const block = new MarkdownInlineBlock("text").emptyIf(false);
      expect(block.render()).toBeNull();
      expect(block.$content).toEqual([]);
    });

    it("should clear content when condition is falsy (0)", () => {
      const block = new MarkdownInlineBlock("text").emptyIf(0);
      expect(block.render()).toBeNull();
    });

    it("should clear content when condition is falsy (null)", () => {
      const block = new MarkdownInlineBlock("text").emptyIf(null);
      expect(block.render()).toBeNull();
    });

    it("should clear content when condition is falsy (undefined)", () => {
      const block = new MarkdownInlineBlock("text").emptyIf(undefined);
      expect(block.render()).toBeNull();
    });

    it("should clear content when condition is falsy (empty string)", () => {
      const block = new MarkdownInlineBlock("text").emptyIf("");
      expect(block.render()).toBeNull();
    });

    it("should keep content when condition is truthy (non-zero number)", () => {
      const block = new MarkdownInlineBlock("text").emptyIf(1);
      expect(block.render()).toBe("text");
    });

    it("should keep content when condition is truthy (non-empty string)", () => {
      const block = new MarkdownInlineBlock("text").emptyIf("yes");
      expect(block.render()).toBe("text");
    });

    it("should return the same block instance", () => {
      const block = new MarkdownInlineBlock("text");
      const result = block.emptyIf(true);
      expect(result).toBe(block);
    });
  });

  describe("if() alias", () => {
    it("should keep content when condition is truthy", () => {
      const block = new MarkdownInlineBlock("text").if(true);
      expect(block.render()).toBe("text");
    });

    it("should clear content when condition is falsy", () => {
      const block = new MarkdownInlineBlock("text").if(false);
      expect(block.render()).toBeNull();
    });
  });

  describe("defaultIfEmpty()", () => {
    it("should set content when block is empty", () => {
      const block = new MarkdownInlineBlock().defaultIfEmpty("fallback");
      expect(block.render()).toBe("fallback");
    });

    it("should not override existing content", () => {
      const block = new MarkdownInlineBlock("text").defaultIfEmpty("fallback");
      expect(block.render()).toBe("text");
    });

    it("should set content when all primitives are empty", () => {
      const block = new MarkdownInlineBlock(null, undefined, "").defaultIfEmpty(
        "fallback",
      );
      expect(block.render()).toBe("fallback");
    });

    it("should accept multiple arguments as new content", () => {
      const block = new MarkdownInlineBlock().defaultIfEmpty(
        "hello",
        " ",
        "world",
      );
      expect(block.render()).toBe("hello world");
    });

    it("should return the same block instance", () => {
      const block = new MarkdownInlineBlock();
      const result = block.defaultIfEmpty("fallback");
      expect(result).toBe(block);
    });
  });

  describe("default() alias", () => {
    it("should set content when block is empty", () => {
      const block = new MarkdownInlineBlock().default("fallback");
      expect(block.render()).toBe("fallback");
    });

    it("should not override existing content", () => {
      const block = new MarkdownInlineBlock("text").default("fallback");
      expect(block.render()).toBe("text");
    });
  });

  describe("chaining methods", () => {
    it("bold() should return a MarkdownBoldBlock wrapping this", () => {
      const block = new MarkdownInlineBlock("text");
      const result = block.bold();
      expect(result).toBeInstanceOf(MarkdownBoldBlock);
      expect(result.render()).toBe("**text**");
    });

    it("b() should return a MarkdownBoldBlock wrapping this", () => {
      const block = new MarkdownInlineBlock("text");
      const result = block.b();
      expect(result).toBeInstanceOf(MarkdownBoldBlock);
      expect(result.render()).toBe("**text**");
    });

    it("italic() should return a MarkdownItalicBlock wrapping this", () => {
      const block = new MarkdownInlineBlock("text");
      const result = block.italic();
      expect(result).toBeInstanceOf(MarkdownItalicBlock);
      expect(result.render()).toBe("*text*");
    });

    it("i() should return a MarkdownItalicBlock wrapping this", () => {
      const block = new MarkdownInlineBlock("text");
      const result = block.i();
      expect(result).toBeInstanceOf(MarkdownItalicBlock);
      expect(result.render()).toBe("*text*");
    });

    it("strikethrough() should return a MarkdownStrikethroughBlock wrapping this", () => {
      const block = new MarkdownInlineBlock("text");
      const result = block.strikethrough();
      expect(result).toBeInstanceOf(MarkdownStrikethroughBlock);
      expect(result.render()).toBe("~~text~~");
    });

    it("st() should return a MarkdownStrikethroughBlock wrapping this", () => {
      const block = new MarkdownInlineBlock("text");
      const result = block.st();
      expect(result).toBeInstanceOf(MarkdownStrikethroughBlock);
      expect(result.render()).toBe("~~text~~");
    });

    it("highlight() should return a MarkdownHighlightBlock wrapping this", () => {
      const block = new MarkdownInlineBlock("text");
      const result = block.highlight();
      expect(result).toBeInstanceOf(MarkdownHighlightBlock);
      expect(result.render()).toBe("==text==");
    });

    it("hl() should return a MarkdownHighlightBlock wrapping this", () => {
      const block = new MarkdownInlineBlock("text");
      const result = block.hl();
      expect(result).toBeInstanceOf(MarkdownHighlightBlock);
      expect(result.render()).toBe("==text==");
    });

    it("superscript() should return a MarkdownSuperscriptBlock wrapping this", () => {
      const block = new MarkdownInlineBlock("text");
      const result = block.superscript();
      expect(result).toBeInstanceOf(MarkdownSuperscriptBlock);
      expect(result.render()).toBe("^text^");
    });

    it("sup() should return a MarkdownSuperscriptBlock wrapping this", () => {
      const block = new MarkdownInlineBlock("text");
      const result = block.sup();
      expect(result).toBeInstanceOf(MarkdownSuperscriptBlock);
      expect(result.render()).toBe("^text^");
    });

    it("link() should return a MarkdownLinkBlock with this as label", () => {
      const block = new MarkdownInlineBlock("click here");
      const result = block.link("https://example.com");
      expect(result).toBeInstanceOf(MarkdownLinkBlock);
      expect(result.render()).toBe("[click here](https://example.com)");
    });

    it("url() should return a MarkdownLinkBlock with this as label", () => {
      const block = new MarkdownInlineBlock("click here");
      const result = block.url("https://example.com");
      expect(result).toBeInstanceOf(MarkdownLinkBlock);
      expect(result.render()).toBe("[click here](https://example.com)");
    });

    it("image() should return a MarkdownImageBlock with this as alt", () => {
      const block = new MarkdownInlineBlock("alt text");
      const result = block.image("https://example.com/img.png");
      expect(result).toBeInstanceOf(MarkdownImageBlock);
      expect(result.render()).toBe("![alt text](https://example.com/img.png)");
    });

    it("img() should return a MarkdownImageBlock with this as alt", () => {
      const block = new MarkdownInlineBlock("alt text");
      const result = block.img("https://example.com/img.png");
      expect(result).toBeInstanceOf(MarkdownImageBlock);
      expect(result.render()).toBe("![alt text](https://example.com/img.png)");
    });
  });

  describe("multi-step chaining", () => {
    it("should chain bold then italic", () => {
      const block = new MarkdownInlineBlock("text");
      const result = block.bold().italic();
      expect(result.render()).toBe("***text***");
    });

    it("should chain italic then bold", () => {
      const block = new MarkdownInlineBlock("text");
      const result = block.italic().bold();
      expect(result.render()).toBe("***text***");
    });

    it("should chain bold then link", () => {
      const block = new MarkdownInlineBlock("text");
      const result = block.bold().link("https://example.com");
      expect(result.render()).toBe("[**text**](https://example.com)");
    });

    it("should chain italic then strikethrough", () => {
      const block = new MarkdownInlineBlock("text");
      const result = block.italic().strikethrough();
      expect(result.render()).toBe("~~*text*~~");
    });

    it("should chain bold then highlight", () => {
      const block = new MarkdownInlineBlock("text");
      const result = block.bold().highlight();
      expect(result.render()).toBe("==**text**==");
    });

    it("should chain bold then superscript", () => {
      const block = new MarkdownInlineBlock("text");
      const result = block.bold().superscript();
      expect(result.render()).toBe("^**text**^");
    });

    it("should chain bold then image", () => {
      const block = new MarkdownInlineBlock("alt");
      const result = block.bold().image("https://example.com/img.png");
      expect(result.render()).toBe("![**alt**](https://example.com/img.png)");
    });
  });

  describe("chaining via b.p()", () => {
    it("should chain bold via paragraph", () => {
      expect(String(b.p("text").bold())).toBe("**text**");
    });

    it("should chain italic via paragraph", () => {
      expect(String(b.p("text").italic())).toBe("*text*");
    });

    it("should chain strikethrough via paragraph", () => {
      expect(String(b.p("text").strikethrough())).toBe("~~text~~");
    });

    it("should chain highlight via paragraph", () => {
      expect(String(b.p("text").highlight())).toBe("==text==");
    });

    it("should chain superscript via paragraph", () => {
      expect(String(b.p("text").superscript())).toBe("^text^");
    });

    it("should chain link via paragraph", () => {
      expect(String(b.p("click").link("https://example.com"))).toBe(
        "[click](https://example.com)",
      );
    });

    it("should chain image via paragraph", () => {
      expect(String(b.p("alt").image("https://example.com/img.png"))).toBe(
        "![alt](https://example.com/img.png)",
      );
    });
  });

  describe("Symbol.toPrimitive", () => {
    it("should render for string hint", () => {
      const block = new MarkdownInlineBlock("text");
      expect(`${block}`).toBe("text");
    });

    it("should render for default hint", () => {
      const block = new MarkdownInlineBlock("text");
      expect(String(block)).toBe("text");
    });

    it("should return content length for number hint", () => {
      const block = new MarkdownInlineBlock("a", "b", "c");
      expect(+block).toBe(3);
    });

    it("should return 0 for empty block number hint", () => {
      const block = new MarkdownInlineBlock();
      expect(+block).toBe(0);
    });

    it("should return empty string for empty block string hint", () => {
      const block = new MarkdownInlineBlock();
      expect(`${block}`).toBe("");
    });
  });

  describe("String coercion", () => {
    it("should be coercible via String()", () => {
      const block = new MarkdownInlineBlock("text");
      expect(String(block)).toBe("text");
    });

    it("should be coercible via template literal", () => {
      const block = new MarkdownInlineBlock("text");
      expect(`${block}`).toBe("text");
    });

    it("should render empty string when block is empty via template literal", () => {
      const block = new MarkdownInlineBlock();
      expect(`${block}`).toBe("");
    });
  });

  describe("$content", () => {
    it("should expose the internal content array", () => {
      const block = new MarkdownInlineBlock("a", "b");
      expect(block.$content).toEqual(["a", "b"]);
    });

    it("should be mutable", () => {
      const block = new MarkdownInlineBlock("a");
      block.$content.push("b");
      expect(block.render()).toBe("ab");
    });
  });

  describe("$trim", () => {
    it("should default to true", () => {
      const block = new MarkdownInlineBlock("text");
      expect(block.$trim).toBe(true);
    });

    it("should be settable via trim()", () => {
      const block = new MarkdownInlineBlock("text").trim(false);
      expect(block.$trim).toBe(false);
    });
  });
});
