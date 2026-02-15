import { MarkdownInlineBlock } from "../primitives/markdown-inline-block";
import { MarkdownLineBlockContent } from "../primitives/markdown-line-block";

export class MarkdownParagraphBlock extends MarkdownInlineBlock {}

export const paragraph = (
  ...line: Array<MarkdownLineBlockContent>
): MarkdownParagraphBlock => {
  return new MarkdownParagraphBlock(...line);
};
export const para = paragraph;
export const p = paragraph;
