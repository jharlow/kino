import { MarkdownLineBlockContent } from "../primitives/markdown-line-block";
import { MarkdownListBlock } from "./markdown-list-block";
import {
  MarkdownUnorderedListItemBlock,
  MarkdownUnorderedListItemStyle,
} from "./markdown-unordered-list-item-block";

export class MarkdownUnorderedListBlock extends MarkdownListBlock {
  constructor(...lines: Array<MarkdownLineBlockContent | MarkdownListBlock>) {
    super(
      ...lines.map((line) =>
        line instanceof MarkdownListBlock
          ? line
          : new MarkdownUnorderedListItemBlock(line),
      ),
    );
  }

  public style(opt: MarkdownUnorderedListItemStyle): this {
    this.$lines.forEach((line) => {
      if (line instanceof MarkdownUnorderedListItemBlock) {
        line.style(opt);
      }
    });
    return this;
  }
}

export const unorderedList = (
  ...lines: Array<MarkdownLineBlockContent | MarkdownListBlock>
): MarkdownUnorderedListBlock => {
  return new MarkdownUnorderedListBlock(...lines);
};
export const ul = unorderedList;
