import { OptionalRenderingOptions } from "../primitives/markdown-block";
import { MarkdownInlineBlock } from "../primitives/markdown-inline-block";

export class MarkdownCommentBlock extends MarkdownInlineBlock {
  public render(options?: OptionalRenderingOptions): string | null {
    const content = super.render(options);
    if (content === null || this.isEmpty) return null;
    return `[${content}]: #`;
  }
}

export const comment = (
  ...content: Array<string | MarkdownInlineBlock>
): MarkdownCommentBlock => {
  return new MarkdownCommentBlock(...content);
};
export const hiddenFromHumans = comment;

MarkdownInlineBlock._register("comment", MarkdownCommentBlock);
