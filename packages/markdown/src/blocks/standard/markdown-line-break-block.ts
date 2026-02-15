import { MarkdownInlineBlock } from "../primitives/markdown-inline-block";

export class MarkdownLineBreakBlock extends MarkdownInlineBlock {
  public render(): string | null {
    return "\n";
  }
}

export const lineBreak = (): MarkdownLineBreakBlock => {
  return new MarkdownLineBreakBlock();
};
export const br = lineBreak;
