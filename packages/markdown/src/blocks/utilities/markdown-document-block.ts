import { MarkdownMultilineBlockContent } from "../primitives/markdown-multiline-block";
import { MarkdownSectionBlock } from "./markdown-section-block";

export class MarkdownDocument extends MarkdownSectionBlock {}

export const document = (
  ...lines: Array<MarkdownMultilineBlockContent>
): MarkdownDocument => {
  return new MarkdownDocument(...lines);
};
export const doc = document;
export const d = document;
