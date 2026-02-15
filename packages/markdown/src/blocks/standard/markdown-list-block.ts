import {
  BlockMetadataTags,
  OptionalRenderingOptions,
} from "../primitives/markdown-block";
import { MarkdownMultilineBlock } from "../primitives/markdown-multiline-block";

export class MarkdownListBlock extends MarkdownMultilineBlock {
  public $indent: number | undefined;
  private readonly _defaultIndent: number = 2;

  public indent(value: number): this {
    if (this.$indent) return this;
    this.$indent = value;
    return this;
  }

  public render(options?: OptionalRenderingOptions): string | null {
    if (this.isEmpty) return null;
    const indent =
      options?.enforce?.list?.indent ?? this.$indent ?? this._defaultIndent;
    return this.$lines
      .map((line) => {
        if (line instanceof MarkdownListBlock) {
          if (!line.$indent) {
            line.indent(indent);
          }
          const rendered = line.render(options);
          if (rendered === null) return null;
          return rendered
            .split("\n")
            .map((l) => this._SPACE_STRING.repeat(indent) + l)
            .join("\n");
        }
        if (this.isPrimitive(line)) return line;
        return line.render(options);
      })
      .filter((line) => line !== null)
      .join("\n");
  }

  public getMetadataTags(): BlockMetadataTags {
    return super
      .getMetadataTags()
      .concat(this.$indent ? [`indent=${this.$indent}`] : []);
  }
}
