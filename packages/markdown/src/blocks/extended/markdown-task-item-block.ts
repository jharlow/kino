import {
  BlockMetadataTags,
  OptionalRenderingOptions,
} from "../primitives/markdown-block";
import {
  MarkdownLineBlock,
  MarkdownLineBlockContent,
} from "../primitives/markdown-line-block";

export type MarkdownTaskItemBlockStyle = "x" | "X";

export class MarkdownTaskItemBlock extends MarkdownLineBlock {
  public $checked: boolean = false;
  public $style: MarkdownTaskItemBlockStyle | undefined;
  private readonly _defaultStyle: MarkdownTaskItemBlockStyle = "x";

  constructor(checked: boolean, ...line: Array<MarkdownLineBlockContent>) {
    super(...line);
    this.$checked = checked;
  }

  public style(opt: MarkdownTaskItemBlockStyle): this {
    this.$style = opt;
    return this;
  }

  public checked(value: boolean): this {
    this.$checked = value;
    return this;
  }

  public render(options?: OptionalRenderingOptions): string | null {
    const content = super.render(options);
    if (content === null) return null;
    const style =
      options?.enforceStyles?.taskItem ?? this.$style ?? this._defaultStyle;
    return `- [${this.$checked ? style : this._SPACE_STRING}] ${content}`;
  }

  public getMetadataTags(): BlockMetadataTags {
    return super
      .getMetadataTags()
      .concat(this.$checked ? ["checked"] : ["unchecked"])
      .concat(this.$style ? [`style=${this.$style}`] : []);
  }
}

export const taskItem = (
  checked: boolean,
  ...line: Array<MarkdownLineBlockContent>
): MarkdownTaskItemBlock => {
  return new MarkdownTaskItemBlock(checked, ...line);
};
export const tli = taskItem;
