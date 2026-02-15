import { describe, it, expect } from "vitest";
import { b } from "../../index";
import { MarkdownLineBlock } from "./markdown-line-block";
import { MarkdownInlineBlock } from "./markdown-inline-block";

describe("MarkdownLineBlock", () => {
  describe("constructor", () => {
    it("should accept string content", () => {
      const block = new MarkdownLineBlock("hello");
      expect(block.$line).toEqual(["hello"]);
    });

    it("should accept multiple string arguments", () => {
      const block = new MarkdownLineBlock("hello", " ", "world");
      expect(block.$line).toEqual(["hello", " ", "world"]);
    });

    it("should accept no arguments", () => {
      const block = new MarkdownLineBlock();
      expect(block.$line).toEqual([]);
    });

    it("should accept inline blocks as content", () => {
      const inline = new MarkdownInlineBlock("inner");
      const block = new MarkdownLineBlock("before ", inline);
      expect(block.$line).toHaveLength(2);
      expect(block.$line[0]).toBe("before ");
      expect(block.$line[1]).toBe(inline);
    });

    it("should accept mixed primitive types", () => {
      const block = new MarkdownLineBlock("text", 42, true);
      expect(block.$line).toEqual(["text", 42, true]);
    });

    it("should accept null and undefined content", () => {
      const block = new MarkdownLineBlock("text", null, undefined);
      expect(block.$line).toEqual(["text", null, undefined]);
    });
  });

  describe("render()", () => {
    it("should join string content", () => {
      const block = new MarkdownLineBlock("hello", " ", "world");
      expect(block.render()).toBe("hello world");
    });

    it("should render nested inline blocks", () => {
      const inline = b.bold("world");
      const block = new MarkdownLineBlock("hello ", inline);
      expect(block.render()).toBe("hello **world**");
    });

    it("should return null for empty content", () => {
      const block = new MarkdownLineBlock();
      expect(block.render()).toBeNull();
    });

    it("should return null when all content is empty primitives", () => {
      const block = new MarkdownLineBlock(null, undefined, "");
      expect(block.render()).toBeNull();
    });

    it("should filter null and undefined when renderNullish is false", () => {
      const block = new MarkdownLineBlock("hello", null, "world");
      expect(block.render({ renderNullish: false })).toBe("helloworld");
    });

    it("should pass through null via join when renderNullish is true", () => {
      // MarkdownLineBlock does not stringify primitives (unlike MarkdownInlineBlock),
      // so null passes through as-is and Array.join coerces it to empty string
      const block = new MarkdownLineBlock("hello", null, "world");
      expect(block.render({ renderNullish: true })).toBe("helloworld");
    });

    it("should render number primitives via join", () => {
      const block = new MarkdownLineBlock("count: ", 42);
      expect(block.render()).toBe("count: 42");
    });

    it("should render boolean primitives via join", () => {
      const block = new MarkdownLineBlock("active: ", true);
      expect(block.render()).toBe("active: true");
    });
  });

  describe("isEmpty", () => {
    it("should be true when line is empty", () => {
      expect(new MarkdownLineBlock().isEmpty).toBe(true);
    });

    it("should be true when all content is null", () => {
      expect(new MarkdownLineBlock(null, null).isEmpty).toBe(true);
    });

    it("should be true when all content is undefined", () => {
      expect(new MarkdownLineBlock(undefined, undefined).isEmpty).toBe(true);
    });

    it("should be true when all content is empty string", () => {
      expect(new MarkdownLineBlock("", "").isEmpty).toBe(true);
    });

    it("should be true when content is mix of empty primitives", () => {
      expect(new MarkdownLineBlock(null, undefined, "").isEmpty).toBe(true);
    });

    it("should be true when nested inline block is also empty", () => {
      const inline = new MarkdownInlineBlock();
      expect(new MarkdownLineBlock(inline).isEmpty).toBe(true);
    });

    it("should be false when content has a non-empty string", () => {
      expect(new MarkdownLineBlock("text").isEmpty).toBe(false);
    });

    it("should be false when content has a number", () => {
      expect(new MarkdownLineBlock(0).isEmpty).toBe(false);
    });

    it("should be false when content has a boolean", () => {
      expect(new MarkdownLineBlock(false).isEmpty).toBe(false);
    });

    it("should be false when nested inline block is non-empty", () => {
      const inline = new MarkdownInlineBlock("text");
      expect(new MarkdownLineBlock(inline).isEmpty).toBe(false);
    });
  });

  describe("emptyIf()", () => {
    it("should keep content when condition is truthy", () => {
      const block = new MarkdownLineBlock("text").emptyIf(true);
      expect(block.render()).toBe("text");
    });

    it("should clear content when condition is falsy (false)", () => {
      const block = new MarkdownLineBlock("text").emptyIf(false);
      expect(block.render()).toBeNull();
      expect(block.$line).toEqual([]);
    });

    it("should clear content when condition is falsy (0)", () => {
      const block = new MarkdownLineBlock("text").emptyIf(0);
      expect(block.render()).toBeNull();
    });

    it("should clear content when condition is falsy (null)", () => {
      const block = new MarkdownLineBlock("text").emptyIf(null);
      expect(block.render()).toBeNull();
    });

    it("should clear content when condition is falsy (undefined)", () => {
      const block = new MarkdownLineBlock("text").emptyIf(undefined);
      expect(block.render()).toBeNull();
    });

    it("should clear content when condition is falsy (empty string)", () => {
      const block = new MarkdownLineBlock("text").emptyIf("");
      expect(block.render()).toBeNull();
    });

    it("should keep content when condition is truthy (non-zero number)", () => {
      const block = new MarkdownLineBlock("text").emptyIf(1);
      expect(block.render()).toBe("text");
    });

    it("should keep content when condition is truthy (non-empty string)", () => {
      const block = new MarkdownLineBlock("text").emptyIf("yes");
      expect(block.render()).toBe("text");
    });

    it("should return the same block instance", () => {
      const block = new MarkdownLineBlock("text");
      const result = block.emptyIf(true);
      expect(result).toBe(block);
    });
  });

  describe("defaultIfEmpty()", () => {
    it("should set content when block is empty", () => {
      const block = new MarkdownLineBlock().defaultIfEmpty("fallback");
      expect(block.render()).toBe("fallback");
    });

    it("should not override existing content", () => {
      const block = new MarkdownLineBlock("text").defaultIfEmpty("fallback");
      expect(block.render()).toBe("text");
    });

    it("should set content when all primitives are empty", () => {
      const block = new MarkdownLineBlock(null, undefined, "").defaultIfEmpty(
        "fallback",
      );
      expect(block.render()).toBe("fallback");
    });

    it("should accept multiple arguments as new content", () => {
      const block = new MarkdownLineBlock().defaultIfEmpty(
        "hello",
        " ",
        "world",
      );
      expect(block.render()).toBe("hello world");
    });

    it("should return the same block instance", () => {
      const block = new MarkdownLineBlock();
      const result = block.defaultIfEmpty("fallback");
      expect(result).toBe(block);
    });
  });

  describe("$line", () => {
    it("should expose the internal line array", () => {
      const block = new MarkdownLineBlock("a", "b");
      expect(block.$line).toEqual(["a", "b"]);
    });

    it("should be mutable", () => {
      const block = new MarkdownLineBlock("a");
      block.$line.push("b");
      expect(block.render()).toBe("ab");
    });
  });

  describe("Symbol.toPrimitive", () => {
    it("should render for string hint", () => {
      const block = new MarkdownLineBlock("text");
      expect(`${block}`).toBe("text");
    });

    it("should render for default hint", () => {
      const block = new MarkdownLineBlock("text");
      expect(String(block)).toBe("text");
    });

    it("should return line length for number hint", () => {
      const block = new MarkdownLineBlock("a", "b", "c");
      expect(+block).toBe(3);
    });

    it("should return 0 for empty block number hint", () => {
      const block = new MarkdownLineBlock();
      expect(+block).toBe(0);
    });

    it("should return empty string for empty block string hint", () => {
      const block = new MarkdownLineBlock();
      expect(`${block}`).toBe("");
    });
  });

  describe("String coercion", () => {
    it("should be coercible via String()", () => {
      const block = new MarkdownLineBlock("text");
      expect(String(block)).toBe("text");
    });

    it("should be coercible via template literal", () => {
      const block = new MarkdownLineBlock("text");
      expect(`${block}`).toBe("text");
    });

    it("should render empty string when block is empty via template literal", () => {
      const block = new MarkdownLineBlock();
      expect(`${block}`).toBe("");
    });
  });

  describe("via heading (extends MarkdownLineBlock)", () => {
    it("should render heading with line content", () => {
      expect(b.h("Title").render()).toBe("# Title");
    });

    it("should accept inline blocks in heading", () => {
      expect(String(b.h("Hello ", b.bold("world")))).toBe(
        "# Hello **world**",
      );
    });

    it("should clear heading line when emptyIf is falsy", () => {
      expect(b.h("Title").emptyIf(false).render()).toBeNull();
    });

    it("should keep heading line when emptyIf is truthy", () => {
      expect(b.h("Title").emptyIf(true).render()).toBe("# Title");
    });

    it("should set default heading content when empty", () => {
      expect(b.h().defaultIfEmpty("Fallback").render()).toBe("# Fallback");
    });

    it("should not override existing heading content with defaultIfEmpty", () => {
      expect(b.h("Title").defaultIfEmpty("Fallback").render()).toBe(
        "# Title",
      );
    });
  });
});
