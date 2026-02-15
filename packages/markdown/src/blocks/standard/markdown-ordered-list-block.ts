import { MarkdownLineBlockContent } from "../primitives/markdown-line-block";
import { MarkdownListBlock } from "./markdown-list-block";
import { MarkdownOrderedListItemBlock } from "./markdown-ordered-list-item-block";
import { MarkdownUnorderedListBlock } from "./markdown-unordered-list-block";
import { MarkdownUnorderedListItemBlock } from "./markdown-unordered-list-item-block";

export class MarkdownOrderedListBlock extends MarkdownListBlock {
  constructor(...lines: Array<MarkdownLineBlockContent | MarkdownListBlock>) {
    const nonListCount = lines.filter(
      (l) => !(l instanceof MarkdownListBlock),
    ).length;
    const hasNestedUnordered = lines.some(
      (l) => l instanceof MarkdownUnorderedListBlock,
    );
    const useUnordered = nonListCount === 1 && hasNestedUnordered;
    let itemIndex = 1;
    super(
      ...lines.map((line) =>
        line instanceof MarkdownListBlock
          ? line
          : useUnordered
            ? new MarkdownUnorderedListItemBlock(line)
            : new MarkdownOrderedListItemBlock(itemIndex++, line),
      ),
    );
  }

  public startingIndex(value: number): this {
    let itemIndex = 0;
    this.$lines.forEach((line) => {
      if (line instanceof MarkdownOrderedListItemBlock) {
        line.index(itemIndex + value);
        itemIndex++;
      }
    });
    return this;
  }
}

export const orderedList = (
  ...lines: Array<MarkdownLineBlockContent | MarkdownListBlock>
): MarkdownOrderedListBlock => {
  return new MarkdownOrderedListBlock(...lines);
};
export const ol = orderedList;
