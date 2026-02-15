import {
  BlockMetadataTags,
  OptionalRenderingOptions,
} from "../primitives/markdown-block";
import {
  MarkdownLineBlock,
  MarkdownLineBlockContent,
} from "../primitives/markdown-line-block";

export class MarkdownOrderedListItemBlock extends MarkdownLineBlock {
  public $index: number;

  constructor(index: number, ...line: Array<MarkdownLineBlockContent>) {
    super(...line);
    this.$index = index;
  }

  public index(value: number): this {
    this.$index = value;
    return this;
  }

  public render(options?: OptionalRenderingOptions): string | null {
    const content = super.render(options);
    if (content === null || this.isEmpty) return null;
    return `${this.$index}. ${content}`;
  }

  public getMetadataTags(): BlockMetadataTags {
    return super.getMetadataTags().concat(`index=${this.$index}`);
  }
}

export const orderedListItem = (
  index: number,
  ...line: Array<MarkdownLineBlockContent>
): MarkdownOrderedListItemBlock => {
  return new MarkdownOrderedListItemBlock(index, ...line);
};
export const oli = orderedListItem;
