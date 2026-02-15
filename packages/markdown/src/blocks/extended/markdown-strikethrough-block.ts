import { OptionalRenderingOptions } from "../primitives/markdown-block";
import { MarkdownInlineBlock } from "../primitives/markdown-inline-block";

export class MarkdownStrikethroughBlock extends MarkdownInlineBlock {
  public render(options?: OptionalRenderingOptions): string | null {
    const content = super.render(options);
    if (content === null || this.isEmpty) return null;
    return `~~${content}~~`;
  }
}

export const strikethrough = (
  ...content: Array<string | MarkdownInlineBlock>
): MarkdownStrikethroughBlock => {
  return new MarkdownStrikethroughBlock(...content);
};
export const strike = strikethrough;
export const st = strikethrough;

MarkdownInlineBlock._register("strikethrough", MarkdownStrikethroughBlock);
