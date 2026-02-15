import { OptionalRenderingOptions } from "../primitives/markdown-block";
import { MarkdownInlineBlock } from "../primitives/markdown-inline-block";

export class MarkdownSuperscriptBlock extends MarkdownInlineBlock {
  public render(options?: OptionalRenderingOptions): string | null {
    const content = super.render(options);
    if (content === null || this.isEmpty) return null;
    return `^${content}^`;
  }
}

export const superscript = (
  ...content: Array<string | MarkdownInlineBlock>
): MarkdownSuperscriptBlock => {
  return new MarkdownSuperscriptBlock(...content);
};
export const sup = superscript;

MarkdownInlineBlock._register("superscript", MarkdownSuperscriptBlock);
