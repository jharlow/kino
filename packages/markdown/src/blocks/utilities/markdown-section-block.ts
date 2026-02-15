import { MarkdownFootnoteBlock } from "../extended/markdown-footnote-block";
import { MarkdownInlineBlock } from "../primitives/markdown-inline-block";
import { MarkdownLineBlock } from "../primitives/markdown-line-block";
import {
  MarkdownMultilineBlock,
  MarkdownMultilineBlockContent,
} from "../primitives/markdown-multiline-block";

export class MarkdownSectionBlock extends MarkdownMultilineBlock {
  private collectFootnotes(): MarkdownFootnoteBlock[] {
    const footnotes: MarkdownFootnoteBlock[] = [];
    const walk = (item: unknown) => {
      if (item instanceof MarkdownFootnoteBlock) {
        footnotes.push(item);
      }
      if (item instanceof MarkdownMultilineBlock) {
        item.$lines.forEach(walk);
      } else if (item instanceof MarkdownLineBlock) {
        item.$line.forEach(walk);
      } else if (item instanceof MarkdownInlineBlock) {
        item.$content.forEach(walk);
      }
    };
    this.$lines.forEach(walk);
    return footnotes;
  }

  public [Symbol.toPrimitive](hint: "default" | "string" | "number"): string {
    if (hint === "number") return this.$lines.length.toString();

    const footnotes = this.collectFootnotes();
    let counter = 1;
    for (const fn of footnotes) {
      if (!fn.$identifier && !fn.$footer.isEmpty) {
        fn.$identifier = String(counter++);
      }
    }

    const options = this.getRenderingOptions();
    const body = this.render(options) ?? "";

    if (footnotes.length === 0) return body;

    const definitions = footnotes
      .map((fn) => fn.renderDefinition(options))
      .filter((d) => d !== null)
      .join("\n");
    return definitions ? `${body}\n\n${definitions}` : body;
  }
}

export const section = (
  ...lines: Array<MarkdownMultilineBlockContent>
): MarkdownSectionBlock => {
  return new MarkdownSectionBlock(...lines);
};
export const sec = section;
export const s = section;
