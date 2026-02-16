import { describe, it, expect } from "vitest";
import { b, MarkdownDetailsBlock } from "../../index";
import { MarkdownDocument } from "../utilities/markdown-document-block";
import { MarkdownListBlock } from "../standard/markdown-list-block";

describe("MarkdownDetailsBlock", () => {
  it("should render a details block with a summary", () => {
    const doc = new MarkdownDocument("Line 1", "Line 2", "Line 3");
    const block = new MarkdownDetailsBlock(
      doc,
      new MarkdownListBlock("test", "2", new MarkdownListBlock("3", "4")),
    ).summary("This is a summary");
    expect(String(block)).toBe(
      "<details>\n  <summary>This is a summary</summary>\n  Line 1\n  Line 2\n  Line 3\n  test\n  2\n    3\n    4\n</details>",
    );
  });

  it("should render empty summary block if no summary is provided", () => {
    const doc = new MarkdownDocument("Line 1", "Line 2", "Line 3");
    const block = new MarkdownDetailsBlock(doc);
    expect(String(block)).toBe(
      "<details>\n  <summary></summary>\n  Line 1\n  Line 2\n  Line 3\n</details>",
    );
  });

  it("should render null if contents are empty", () => {
    const block = new MarkdownDetailsBlock();
    expect(block.render()).toBeNull();
  });

  it("should be creatable via b.details", () => {
    expect(String(b.details("content").summary("title"))).toBe(
      "<details>\n  <summary>title</summary>\n  content\n</details>",
    );
  });

  it("should be an instance of MarkdownDetailsBlock", () => {
    expect(b.details("content")).toBeInstanceOf(MarkdownDetailsBlock);
  });

  it("should report isEmpty correctly", () => {
    expect(b.details().isEmpty).toBe(true);
    expect(b.details("content").isEmpty).toBe(false);
  });

  describe("summary", () => {
    it("should be chainable and return this", () => {
      const block = b.details("content");
      const result = block.summary("title");
      expect(result).toBe(block);
    });

    it("should set $summary property", () => {
      const block = b.details("content").summary("My summary");
      expect(block.$summary).toEqual(["My summary"]);
    });

    it("should render summary with nested bold", () => {
      expect(
        String(b.details("content").summary("Click ", b.bold("here"))),
      ).toBe(
        '<details>\n  <summary>Click **here**</summary>\n  content\n</details>',
      );
    });

    it("should render summary with nested italic", () => {
      expect(
        String(b.details("content").summary(b.italic("emphasis"))),
      ).toBe(
        "<details>\n  <summary>*emphasis*</summary>\n  content\n</details>",
      );
    });

    it("should render empty summary when $summary is undefined", () => {
      const block = b.details("content");
      expect(String(block)).toContain("<summary></summary>");
    });
  });

  describe("inspect", () => {
    it("should show summary and content as distinct trees", () => {
      const block = b.details("Line 1", "Line 2").summary("Click me");
      const tree = b.inspect(block);
      expect(tree).toContain("MarkdownDetailsBlock");
      expect(tree).toContain("summary");
      expect(tree).toContain('"Click me"');
      expect(tree).toContain("content");
      expect(tree).toContain('"Line 1"');
      expect(tree).toContain('"Line 2"');
    });

    it("should show only content when no summary is set", () => {
      const block = b.details("Content only");
      const tree = b.inspect(block);
      expect(tree).not.toContain("├── summary");
      expect(tree).toContain("content");
      expect(tree).toContain('"Content only"');
    });

    it("should show nested blocks in summary inspect tree", () => {
      const block = b.details("content").summary("Click ", b.bold("here"));
      const tree = b.inspect(block);
      expect(tree).toContain("summary");
      expect(tree).toContain("MarkdownBoldBlock");
    });

    it("should show nested blocks in content inspect tree", () => {
      const block = b.details(b.bold("important")).summary("title");
      const tree = b.inspect(block);
      expect(tree).toContain("content");
      expect(tree).toContain("MarkdownBoldBlock");
    });
  });
});
