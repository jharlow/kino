import { OptionalRenderingOptions } from "../primitives/markdown-block";
import { MarkdownInlineBlock } from "../primitives/markdown-inline-block";

export class MarkdownUnderlineBlock extends MarkdownInlineBlock {
  public render(options?: OptionalRenderingOptions): string | null {
    const content = super.render(options);
    if (content === null || this.isEmpty) return null;
    return `<ins>${content}</ins>`;
  }
}

export const underline = (
  ...content: Array<string | MarkdownInlineBlock>
): MarkdownUnderlineBlock => {
  return new MarkdownUnderlineBlock(...content);
};
export const u = underline;

MarkdownInlineBlock._register("underline", MarkdownUnderlineBlock);
