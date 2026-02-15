import {
  BlockMetadataTags,
  OptionalRenderingOptions,
} from "../primitives/markdown-block";
import {
  MarkdownInlineBlock,
  MarkdownInlineBlockContent,
} from "../primitives/markdown-inline-block";
import { MarkdownLineBlockContent } from "../primitives/markdown-line-block";
import { MarkdownMultilineBlockContent } from "../primitives/markdown-multiline-block";

export type MarkdownCodeBlockLanguage = string;
export class MarkdownCodeBlock extends MarkdownInlineBlock {
  public $language: MarkdownCodeBlockLanguage | undefined;
  public $backtickCount: number = 1;

  constructor(...line: Array<MarkdownMultilineBlockContent>) {
    super(...(line as Array<MarkdownInlineBlockContent>));
  }

  public language(opt: MarkdownCodeBlockLanguage): this {
    this.$language = opt;
    return this;
  }

  public render(options?: OptionalRenderingOptions): string | null {
    const renderOptions =
      this.$content.length > 1
        ? { ...options, lineJoinString: "\n" }
        : options;
    const content = super.render(renderOptions);
    // Remove empty lines at the start and end if this.$trim is true
    let processedContent = content;
    if (this.$trim && processedContent !== null) {
      const lines = processedContent.split("\n");
      // Remove leading empty lines
      while (lines.length > 0 && lines[0].trim() === "") {
        lines.shift();
      }
      // Remove trailing empty lines
      while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
        lines.pop();
      }
      processedContent = lines.join("\n");
    }
    if (processedContent === null) return null;
    const containsNewlines = processedContent.includes("\n");
    if (!this.$language && this.$content.length === 1 && !containsNewlines) {
      const tick = "`".repeat(this.$backtickCount);
      return `${tick}${content}${tick}`;
    }
    return `\`\`\`${this.$language ?? this._EMPTY_STRING}\n${processedContent}\n\`\`\``;
  }

  public getMetadataTags(): BlockMetadataTags {
    return super
      .getMetadataTags()
      .concat(this.$language ? [`language=${this.$language}`] : []);
  }
}

export const codeblock = (
  ...lines: Array<MarkdownLineBlockContent>
): MarkdownCodeBlock => {
  const block = new MarkdownCodeBlock(...lines);
  if (lines.length >= 2) {
    const last = lines[lines.length - 1];
    if (typeof last === "string" && /^\w+$/.test(last)) {
      block.language(last);
    }
  }
  return block;
};
export const code = codeblock;
