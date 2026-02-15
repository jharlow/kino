import { MarkdownLineBlockContent } from "../primitives/markdown-line-block";
import { MarkdownListBlock } from "../standard/markdown-list-block";
import {
  MarkdownTaskItemBlock,
  MarkdownTaskItemBlockStyle,
} from "./markdown-task-item-block";

export class MarkdownTaskListBlock extends MarkdownListBlock {
  constructor(
    ...lines: Array<
      [boolean, ...MarkdownLineBlockContent[]] | MarkdownListBlock
    >
  ) {
    super(
      ...lines.map((line) => {
        if (line instanceof MarkdownListBlock) return line;
        const [checked, ...content] = line;
        return new MarkdownTaskItemBlock(checked, ...content);
      }),
    );
  }

  public style(opt: MarkdownTaskItemBlockStyle): this {
    this.$lines.forEach((line) => {
      if (line instanceof MarkdownTaskItemBlock) {
        line.style(opt);
      }
    });
    return this;
  }
}

export const tasksList = (
  ...lines: Array<[boolean, ...MarkdownLineBlockContent[]] | MarkdownListBlock>
): MarkdownTaskListBlock => {
  return new MarkdownTaskListBlock(...lines);
};
export const tasks = tasksList;
