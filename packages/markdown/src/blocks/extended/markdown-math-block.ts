import {
  BlockMetadataTags,
  OptionalRenderingOptions,
} from "../primitives/markdown-block";
import {
  MarkdownInlineBlock,
  MarkdownInlineBlockContent,
} from "../primitives/markdown-inline-block";
import { MarkdownLineBlockContent } from "../primitives/markdown-line-block";
import { MarkdownMultilineBlockContent } from "../primitives/markdown-multiline-block";

export class MarkdownMathBlock extends MarkdownInlineBlock {
  constructor(...line: Array<MarkdownMultilineBlockContent>) {
    super(...(line as Array<MarkdownInlineBlockContent>));
  }

  public render(options?: OptionalRenderingOptions): string | null {
    const content = super.render(options);
    // Remove empty lines at the start and end if this.$trim is true
    let processedContent = content;
    if (this.$trim && processedContent !== null) {
      const lines = processedContent.split("\n");
      // Remove leading empty lines
      while (lines.length > 0 && lines[0].trim() === "") {
        lines.shift();
      }
      // Remove trailing empty lines
      while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
        lines.pop();
      }
      processedContent = lines.join("\n");
    }
    if (processedContent === null) return null;
    const containsNewlines = processedContent.includes("\n");
    if (this.$content.length === 1 && !containsNewlines) {
      return `$${content}$`;
    }
    return `$$\n${processedContent}\n$$`;
  }
}

export const math = (
  ...lines: Array<MarkdownLineBlockContent>
): MarkdownMathBlock => {
  return new MarkdownMathBlock(...lines);
};
