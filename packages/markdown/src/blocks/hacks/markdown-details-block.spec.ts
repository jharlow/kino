import { describe, it, expect } from "vitest";
import { MarkdownDetailsBlock } from "./markdown-details-block";
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
});
