import {
  BlockMetadataTags,
  OptionalRenderingOptions,
} from "../primitives/markdown-block";
import {
  MarkdownLineBlock,
  MarkdownLineBlockContent,
} from "../primitives/markdown-line-block";

export type MarkdownHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type MarkdownHeadingLevelOptions = {
  allowReassignment?: boolean;
};

export class MarkdownHeadingBlock extends MarkdownLineBlock {
  public $level: MarkdownHeadingLevel | undefined;
  public $identifier: string | undefined;
  private readonly _defaultLevel: MarkdownHeadingLevel = 1;
  private readonly _defaultLevelOptions: MarkdownHeadingLevelOptions = {
    allowReassignment: false,
  };

  public identifier(value: string): this {
    if (this.$identifier) return this;
    this.$identifier = value;
    return this;
  }

  public id(value: string): this {
    return this.identifier(value);
  }

  public level(
    opt: MarkdownHeadingLevel,
    options?: MarkdownHeadingLevelOptions,
  ): this {
    const canReassign =
      options?.allowReassignment ?? this._defaultLevelOptions.allowReassignment;
    if (this.$level && !canReassign) return this;
    this.$level = opt;
    return this;
  }

  public l(
    opt: MarkdownHeadingLevel,
    options?: MarkdownHeadingLevelOptions,
  ): this {
    return this.level(opt, options);
  }

  public render(options?: OptionalRenderingOptions): string | null {
    const content = super.render(options);
    if (content === null || this.isEmpty) return null;
    return `${"#".repeat(this.$level ?? this._defaultLevel)} ${super.render(options)}${this.$identifier ? ` {#${this.$identifier}}` : ""}`;
  }

  public getMetadataTags(): BlockMetadataTags {
    return super
      .getMetadataTags()
      .concat(this.$identifier ? [`identifier=${this.$identifier}`] : [])
      .concat(this.$level ? [`level=${this.$level}`] : []);
  }
}

export const heading = (
  ...line: Array<MarkdownLineBlockContent>
): MarkdownHeadingBlock => {
  return new MarkdownHeadingBlock(...line);
};
export const head = heading;
export const h = heading;
