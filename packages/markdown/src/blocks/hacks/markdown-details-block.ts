import {
  MarkdownBlock,
  OptionalRenderingOptions,
} from "../primitives/markdown-block";
import {
  MarkdownInlineBlock,
  MarkdownInlineBlockContent,
} from "../primitives/markdown-inline-block";
import {
  MarkdownMultilineBlock,
  MarkdownMultilineBlockContent,
} from "../primitives/markdown-multiline-block";

export class MarkdownDetailsBlock extends MarkdownMultilineBlock {
  public $summary: Array<MarkdownInlineBlockContent> | undefined = undefined;

  constructor(...content: Array<MarkdownMultilineBlockContent>) {
    super(...content);
  }

  public summary(...content: Array<MarkdownInlineBlockContent>): this {
    this.$summary = content;
    return this;
  }

  public render(options?: OptionalRenderingOptions): string | null {
    if (this.isEmpty) return null;
    const summaryContent = (this.$summary ?? [])
      .map((block) =>
        block instanceof MarkdownBlock ? block.render(options) : String(block),
      )
      .join("\n");
    const renderedContent = super.render(options);
    const indentedContent = renderedContent
      ? renderedContent
          .split("\n")
          .map((l) => "  " + l)
          .join("\n")
      : "";
    return `<details>\n  <summary>${summaryContent}</summary>\n${indentedContent}\n</details>`;
  }
}

export const details = (
  ...content: Array<MarkdownMultilineBlockContent>
): MarkdownDetailsBlock => {
  return new MarkdownDetailsBlock(...content);
};

MarkdownInlineBlock._register("details", MarkdownDetailsBlock);
