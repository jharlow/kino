import { describe, it, expect } from "vitest";
import { b } from "../../index";
import { MarkdownMultilineBlock } from "./markdown-multiline-block";

describe("MarkdownMultilineBlock", () => {
  describe("constructor", () => {
    it("should accept primitive string lines", () => {
      const block = new MarkdownMultilineBlock("line one", "line two");
      expect(block.render()).toBe("line one\nline two");
    });

    it("should accept number primitives", () => {
      const block = new MarkdownMultilineBlock(1, 2, 3);
      expect(block.render()).toBe("1\n2\n3");
    });

    it("should accept boolean primitives", () => {
      const block = new MarkdownMultilineBlock(true, false);
      expect(block.render()).toBe("true\nfalse");
    });

    it("should accept inline blocks", () => {
      const block = new MarkdownMultilineBlock(b.bold("bold text"));
      expect(block.render()).toBe("**bold text**");
    });

    it("should accept line blocks", () => {
      const block = new MarkdownMultilineBlock(b.p("paragraph"));
      expect(block.render()).toBe("paragraph");
    });

    it("should accept nested multiline blocks", () => {
      const inner = new MarkdownMultilineBlock("inner line");
      const outer = new MarkdownMultilineBlock(inner);
      expect(outer.render()).toBe("inner line");
    });

    it("should accept mixed content types", () => {
      const block = new MarkdownMultilineBlock(
        "plain",
        b.bold("bold"),
        b.p("para"),
        b.bq("quote"),
      );
      expect(block.render()).toBe("plain\n**bold**\npara\n> quote");
    });

    it("should accept no arguments", () => {
      const block = new MarkdownMultilineBlock();
      expect(block.render()).toBeNull();
    });
  });

  describe("render()", () => {
    it("should join lines with newline by default", () => {
      const block = new MarkdownMultilineBlock("a", "b", "c");
      expect(block.render()).toBe("a\nb\nc");
    });

    it("should return null when empty", () => {
      const block = new MarkdownMultilineBlock();
      expect(block.render()).toBeNull();
    });

    it("should return null when all lines are empty primitives", () => {
      const block = new MarkdownMultilineBlock(null, undefined, "");
      expect(block.render()).toBeNull();
    });

    it("should return null when all lines are empty blocks", () => {
      const block = new MarkdownMultilineBlock(b.p(), b.bold());
      expect(block.render()).toBeNull();
    });
  });

  describe("isEmpty", () => {
    it("should be true when no lines provided", () => {
      expect(new MarkdownMultilineBlock().isEmpty).toBe(true);
    });

    it("should be true when all lines are null or undefined", () => {
      expect(new MarkdownMultilineBlock(null, undefined).isEmpty).toBe(true);
    });

    it("should be true when all lines are empty strings", () => {
      expect(new MarkdownMultilineBlock("", "").isEmpty).toBe(true);
    });

    it("should be true when all lines are empty blocks", () => {
      expect(new MarkdownMultilineBlock(b.p(), b.bold()).isEmpty).toBe(true);
    });

    it("should be false when at least one line has content", () => {
      expect(new MarkdownMultilineBlock("", "text").isEmpty).toBe(false);
    });

    it("should be false when containing a non-empty block", () => {
      expect(new MarkdownMultilineBlock(b.p("text")).isEmpty).toBe(false);
    });
  });

  describe("emptyIf()", () => {
    it("should clear content when condition is truthy", () => {
      const block = new MarkdownMultilineBlock("text").emptyIf(true);
      expect(block.isEmpty).toBe(true);
    });

    it("should keep content when condition is falsy (false)", () => {
      const block = new MarkdownMultilineBlock("text").emptyIf(false);
      expect(block.render()).toBe("text");
    });

    it("should keep content when condition is falsy (0)", () => {
      const block = new MarkdownMultilineBlock("text").emptyIf(0);
      expect(block.render()).toBe("text");
    });

    it("should keep content when condition is falsy (null)", () => {
      const block = new MarkdownMultilineBlock("text").emptyIf(null);
      expect(block.render()).toBe("text");
    });

    it("should keep content when condition is falsy (undefined)", () => {
      const block = new MarkdownMultilineBlock("text").emptyIf(undefined);
      expect(block.render()).toBe("text");
    });

    it("should keep content when condition is falsy (empty string)", () => {
      const block = new MarkdownMultilineBlock("text").emptyIf("");
      expect(block.render()).toBe("text");
    });

    it("should clear content when condition is truthy (1)", () => {
      const block = new MarkdownMultilineBlock("text").emptyIf(1);
      expect(block.isEmpty).toBe(true);
    });

    it("should clear content when condition is truthy (non-empty string)", () => {
      const block = new MarkdownMultilineBlock("text").emptyIf("yes");
      expect(block.isEmpty).toBe(true);
    });

    it("should return this for chaining", () => {
      const block = new MarkdownMultilineBlock("text");
      expect(block.emptyIf(true)).toBe(block);
    });
  });

  describe("change()", () => {
    it("should pass the block to the callback and return the result", () => {
      const block = new MarkdownMultilineBlock("line one", "line two");
      const result = block.change((blk) => {
        blk.$lines.push("line three");
        return blk;
      });
      expect(result.render()).toBe("line one\nline two\nline three");
    });

    it("should return a different block if the callback creates one", () => {
      const block = new MarkdownMultilineBlock("old");
      const result = block.change(() => new MarkdownMultilineBlock("replaced"));
      expect(result.render()).toBe("replaced");
    });

    it("should receive the original block as the argument", () => {
      const block = new MarkdownMultilineBlock("original");
      block.change((received) => {
        expect(received).toBe(block);
        return received;
      });
    });

    it("should allow replacing lines", () => {
      const block = new MarkdownMultilineBlock("a", "b");
      const result = block.change((blk) => {
        blk.$lines = ["x", "y", "z"];
        return blk;
      });
      expect(result.render()).toBe("x\ny\nz");
    });

    it("should work on empty blocks", () => {
      const block = new MarkdownMultilineBlock();
      const result = block.change((blk) => {
        blk.$lines = ["filled"];
        return blk;
      });
      expect(result.render()).toBe("filled");
    });

    it("should allow conditional transformation", () => {
      const addLine = true;
      const block = new MarkdownMultilineBlock("first");
      const result = block.change((blk) => {
        if (addLine) blk.$lines.push("second");
        return blk;
      });
      expect(result.render()).toBe("first\nsecond");
    });

    it("should allow conditional no-op", () => {
      const addLine = false;
      const block = new MarkdownMultilineBlock("first");
      const result = block.change((blk) => {
        if (addLine) blk.$lines.push("second");
        return blk;
      });
      expect(result.render()).toBe("first");
    });

    it("should work with block content", () => {
      const block = new MarkdownMultilineBlock("text");
      const result = block.change((blk) => {
        blk.$lines.push(b.bold("bold line"));
        return blk;
      });
      expect(result.render()).toBe("text\n**bold line**");
    });
  });

  describe("defaultIfEmpty()", () => {
    it("should set content when empty", () => {
      const block = new MarkdownMultilineBlock().defaultIfEmpty("fallback");
      expect(block.render()).toBe("fallback");
    });

    it("should set multiple lines when empty", () => {
      const block = new MarkdownMultilineBlock().defaultIfEmpty(
        "line one",
        "line two",
      );
      expect(block.render()).toBe("line one\nline two");
    });

    it("should not override existing content", () => {
      const block = new MarkdownMultilineBlock("text").defaultIfEmpty(
        "fallback",
      );
      expect(block.render()).toBe("text");
    });

    it("should return this for chaining", () => {
      const block = new MarkdownMultilineBlock();
      expect(block.defaultIfEmpty("fallback")).toBe(block);
    });

    it("should accept block content as defaults", () => {
      const block = new MarkdownMultilineBlock().defaultIfEmpty(
        b.p("default para"),
      );
      expect(block.render()).toBe("default para");
    });
  });

  describe("depth getter/setter", () => {
    it("should default to 0", () => {
      const block = new MarkdownMultilineBlock();
      expect(block.depth).toBe(0);
    });

    it("should set and get depth", () => {
      const block = new MarkdownMultilineBlock();
      block.depth = 3;
      expect(block.depth).toBe(3);
    });
  });

  describe("heading level adjustment", () => {
    it("should render headings at level 1 when depth is 0", () => {
      const block = new MarkdownMultilineBlock(b.h("Title"), "body");
      expect(block.render()).toBe("# Title\nbody");
    });

    it("should render headings at level 2 when depth is 1", () => {
      const block = new MarkdownMultilineBlock(b.h("Title"), "body");
      block.depth = 1;
      expect(block.render()).toBe("## Title\nbody");
    });

    it("should render headings at level 3 when depth is 2", () => {
      const block = new MarkdownMultilineBlock(b.h("Title"), "body");
      block.depth = 2;
      expect(block.render()).toBe("### Title\nbody");
    });

    it("should cap heading level at 6", () => {
      const block = new MarkdownMultilineBlock(b.h("Title"), "body");
      block.depth = 10;
      expect(block.render()).toBe("###### Title\nbody");
    });

    it("should use allowReassignment: true when setting heading level", () => {
      const heading = b.h("Title").level(3);
      const block = new MarkdownMultilineBlock(heading, "body");
      block.depth = 1;
      // depth + 1 = 2, and allowReassignment overrides the previously set level 3
      expect(block.render()).toBe("## Title\nbody");
    });
  });

  describe("section block depth propagation", () => {
    it("should set depth on nested MarkdownSectionBlock to parent depth + 1", () => {
      const block = new MarkdownMultilineBlock(
        b.sec(b.h("Nested Title"), "body"),
      );
      expect(block.render()).toBe("## Nested Title\nbody");
    });

    it("should set depth on nested MarkdownDocument to parent depth + 1", () => {
      const block = new MarkdownMultilineBlock(b.doc(b.h("Doc Title"), "body"));
      expect(block.render()).toBe("## Doc Title\nbody");
    });

    it("should propagate depth through multiple nesting levels", () => {
      const block = new MarkdownMultilineBlock(
        b.sec(b.h("L1"), b.sec(b.h("L2"), b.sec(b.h("L3")))),
      );
      expect(block.render()).toBe("## L1\n### L2\n#### L3");
    });
  });

  describe("MarkdownLineBreakBlock as a line", () => {
    it("should render line break as empty string within multiline block", () => {
      const block = new MarkdownMultilineBlock("before", b.br(), "after");
      expect(block.render()).toBe("before\n\nafter");
    });

    it("should render multiple line breaks as empty strings", () => {
      const block = new MarkdownMultilineBlock("line", b.br(), b.br(), "end");
      expect(block.render()).toBe("line\n\n\nend");
    });
  });

  describe("newline strategies", () => {
    describe("none (default)", () => {
      it("should join lines with single newline", () => {
        const block = new MarkdownMultilineBlock("a", "b", "c");
        expect(block.render()).toBe("a\nb\nc");
      });
    });

    describe("between_blocks", () => {
      it("should join lines with double newline", () => {
        const block = new MarkdownMultilineBlock(
          "one",
          "two",
          "three",
        ).setRenderingOptions({ newlineStrategy: "between_blocks" });
        expect(block.render()).toBe("one\n\ntwo\n\nthree");
      });

      it("should handle single line", () => {
        const block = new MarkdownMultilineBlock("only").setRenderingOptions({
          newlineStrategy: "between_blocks",
        });
        expect(block.render()).toBe("only");
      });
    });

    describe("before_and_after_heading", () => {
      it("should add double newline before headings", () => {
        const block = new MarkdownMultilineBlock(
          "intro",
          b.h("Title"),
          "body",
        ).setRenderingOptions({
          newlineStrategy: "before_and_after_heading",
        });
        expect(block.render()).toBe("intro\n\n# Title\n\nbody");
      });

      it("should add double newline after headings", () => {
        const block = new MarkdownMultilineBlock(
          b.h("Title"),
          "body",
          "more",
        ).setRenderingOptions({
          newlineStrategy: "before_and_after_heading",
        });
        // First line is heading, second line: prev was heading -> double newline
        // Third line: prev was not heading -> single newline
        expect(block.render()).toBe("# Title\n\nbody\nmore");
      });

      it("should use single newline between non-heading lines", () => {
        const block = new MarkdownMultilineBlock(
          "one",
          "two",
          "three",
        ).setRenderingOptions({
          newlineStrategy: "before_and_after_heading",
        });
        expect(block.render()).toBe("one\ntwo\nthree");
      });

      it("should add double newline before a multiline block starting with heading", () => {
        const inner = new MarkdownMultilineBlock(b.h("Inner Heading"), "body");
        const outer = new MarkdownMultilineBlock(
          "intro",
          inner,
        ).setRenderingOptions({
          newlineStrategy: "before_and_after_heading",
        });
        expect(outer.render()).toBe("intro\n\n# Inner Heading\nbody");
      });
    });
  });

  describe("$trim / dedent behavior", () => {
    it("should have $trim set to true by default", () => {
      const block = new MarkdownMultilineBlock();
      expect(block.$trim).toBe(true);
    });

    it("should allow setting trim to false", () => {
      const block = new MarkdownMultilineBlock("text").trim(false);
      expect(block.$trim).toBe(false);
    });
  });

  describe("shouldFilter (null/undefined handling)", () => {
    it("should filter out null values by default", () => {
      const block = new MarkdownMultilineBlock("a", null, "b");
      expect(block.render()).toBe("a\nb");
    });

    it("should filter out undefined values by default", () => {
      const block = new MarkdownMultilineBlock("a", undefined, "b");
      expect(block.render()).toBe("a\nb");
    });

    it("should retain null values when renderNullish is true", () => {
      const block = new MarkdownMultilineBlock("a", null, "b");
      // null is a primitive, so it renders as the raw null value which becomes empty in join
      expect(block.render({ renderNullish: true })).toBe("a\n\nb");
    });

    it("should retain undefined values when renderNullish is true", () => {
      const block = new MarkdownMultilineBlock("a", undefined, "b");
      // undefined is a primitive, so it renders as the raw undefined value which becomes empty in join
      expect(block.render({ renderNullish: true })).toBe("a\n\nb");
    });

    it("should not filter null when renderNullish is true, producing 3 entries", () => {
      const block = new MarkdownMultilineBlock("a", null, "b");
      // With renderNullish true, null is not filtered and stays as a line
      const rendered = block.render({ renderNullish: true });
      // The result has 3 entries joined by newline
      expect(rendered?.split("\n").length).toBe(3);
    });
  });

  describe("Symbol.toPrimitive", () => {
    it("should return rendered string for 'string' hint", () => {
      const block = new MarkdownMultilineBlock("hello", "world");
      expect(String(block)).toBe("hello\nworld");
    });

    it("should return rendered string for 'default' hint", () => {
      const block = new MarkdownMultilineBlock("hello", "world");
      expect(`${block}`).toBe("hello\nworld");
    });

    it("should return line count for 'number' hint", () => {
      const block = new MarkdownMultilineBlock("a", "b", "c");
      expect(+block).toBe(3);
    });

    it("should return 0 for empty block via number hint", () => {
      const block = new MarkdownMultilineBlock();
      expect(+block).toBe(0);
    });

    it("should return empty string for empty block via string hint", () => {
      const block = new MarkdownMultilineBlock();
      expect(String(block)).toBe("");
    });

    it("should return empty string for empty block via default hint", () => {
      const block = new MarkdownMultilineBlock();
      expect(`${block}`).toBe("");
    });
  });

  describe("$lines internal array", () => {
    it("should expose the internal lines array", () => {
      const block = new MarkdownMultilineBlock("a", "b");
      expect(block.$lines).toEqual(["a", "b"]);
    });

    it("should reflect changes after emptyIf clears", () => {
      const block = new MarkdownMultilineBlock("a", "b").emptyIf(true);
      expect(block.$lines).toEqual([]);
    });

    it("should reflect changes after defaultIfEmpty sets content", () => {
      const block = new MarkdownMultilineBlock().defaultIfEmpty("x", "y");
      expect(block.$lines).toEqual(["x", "y"]);
    });
  });

  describe("coercion via String() and template literals", () => {
    it("should be coercible via String()", () => {
      const block = new MarkdownMultilineBlock("hello");
      expect(String(block)).toBe("hello");
    });

    it("should be coercible via template literal", () => {
      const block = new MarkdownMultilineBlock("hello");
      expect(`${block}`).toBe("hello");
    });

    it("should embed in template literals alongside other text", () => {
      const block = new MarkdownMultilineBlock("content");
      expect(`before ${block} after`).toBe("before content after");
    });
  });

  describe("via b.sec() and b.doc()", () => {
    it("should create a section block via b.sec()", () => {
      expect(String(b.sec("hello"))).toBe("hello");
    });

    it("should create a document block via b.doc()", () => {
      expect(String(b.doc("hello"))).toBe("hello");
    });

    it("should support emptyIf on section blocks", () => {
      expect(b.sec("text").emptyIf(true).isEmpty).toBe(true);
    });

    it("should support defaultIfEmpty on section blocks", () => {
      expect(String(b.sec().defaultIfEmpty("fallback"))).toBe("fallback");
    });

    it("should support depth-based heading adjustment via nested sections", () => {
      const doc = b.doc(b.h("Top"), b.sec(b.h("Child")));
      expect(String(doc)).toBe("# Top\n## Child");
    });

    it("should support newline strategies on section blocks", () => {
      const sec = b.sec("a", "b").setRenderingOptions({
        newlineStrategy: "between_blocks",
      });
      expect(String(sec)).toBe("a\n\nb");
    });

    it("should return line count via number coercion on section", () => {
      expect(+b.sec("one", "two", "three")).toBe(3);
    });

    it("should render null for empty section", () => {
      expect(b.sec().render()).toBeNull();
    });

    it("should render null for empty document", () => {
      expect(b.doc().render()).toBeNull();
    });
  });
});
