import {
  EmojiShortname,
  MarkdownEmojiBlock,
} from "../blocks/extended/markdown-emoji-block";
import { MarkdownCommentBlock } from "../blocks/hacks/markdown-comment-block";
import { MarkdownDetailsBlock } from "../blocks/hacks/markdown-details-block";
import { MarkdownUnderlineBlock } from "../blocks/hacks/markdown-underline-block";
import { MarkdownFootnoteBlock } from "../blocks/extended/markdown-footnote-block";
import { MarkdownHighlightBlock } from "../blocks/extended/markdown-highlight-block";
import { MarkdownStrikethroughBlock } from "../blocks/extended/markdown-strikethrough-block";
import { MarkdownSubscriptBlock } from "../blocks/extended/markdown-subscript-block";
import { MarkdownSuperscriptBlock } from "../blocks/extended/markdown-superscript-block";
import { MarkdownMathBlock } from "../blocks/extended/markdown-math-block";
import {
  MarkdownTableAlignStyle,
  MarkdownTableBlock,
} from "../blocks/extended/markdown-table-block";
import { MarkdownTaskItemBlock } from "../blocks/extended/markdown-task-item-block";
import {
  MarkdownInlineBlock,
  MarkdownInlineBlockContent,
} from "../blocks/primitives/markdown-inline-block";
import {
  MarkdownLineBlock,
  MarkdownLineBlockContent,
} from "../blocks/primitives/markdown-line-block";
import {
  MarkdownMultilineBlock,
  MarkdownMultilineBlockContent,
} from "../blocks/primitives/markdown-multiline-block";
import {
  GithubFlavoredBlockquoteAlert,
  MarkdownBlockquoteBlock,
} from "../blocks/standard/markdown-blockquote-block";
import { MarkdownBoldBlock } from "../blocks/standard/markdown-bold-block";
import { MarkdownCodeBlock } from "../blocks/standard/markdown-code-block";
import {
  MarkdownHeadingBlock,
  MarkdownHeadingLevel,
} from "../blocks/standard/markdown-heading-block";
import {
  MarkdownHorizontalRuleBlock,
  MarkdownHorizontalRuleStyle,
} from "../blocks/standard/markdown-horizontal-rule-block";
import { MarkdownImageBlock } from "../blocks/standard/markdown-image-block";
import { MarkdownItalicBlock } from "../blocks/standard/markdown-italic-block";
import { MarkdownLineBreakBlock } from "../blocks/standard/markdown-line-break-block";
import { MarkdownParagraphBlock } from "../blocks/standard/markdown-paragraph-block";
import {
  MarkdownLinkBlock,
  MarkdownLinkTarget,
} from "../blocks/standard/markdown-link-block";
import { MarkdownListBlock } from "../blocks/standard/markdown-list-block";
import { MarkdownOrderedListItemBlock } from "../blocks/standard/markdown-ordered-list-item-block";
import {
  MarkdownUnorderedListItemBlock,
  MarkdownUnorderedListItemStyle,
} from "../blocks/standard/markdown-unordered-list-item-block";
import { MarkdownDocument } from "../blocks/utilities/markdown-document-block";
import { MarkdownSectionBlock } from "../blocks/utilities/markdown-section-block";

function findSingleClose(text: string, start: number, char: string): number {
  for (let j = start; j < text.length; j++) {
    if (text[j] === char) {
      if (j + 1 < text.length && text[j + 1] === char) {
        j++;
        continue;
      }
      if (j > 0 && text[j - 1] === char) {
        continue;
      }
      return j;
    }
  }
  return -1;
}

export class MarkdownBlockParser {
  private parseInline(text: string): MarkdownInlineBlockContent[] {
    const result: MarkdownInlineBlockContent[] = [];
    let buffer = "";
    let i = 0;

    const flush = () => {
      if (buffer) {
        result.push(buffer);
        buffer = "";
      }
    };

    while (i < text.length) {
      // 1a. Triple backtick code span: ```content```
      if (
        text[i] === "`" &&
        i + 2 < text.length &&
        text[i + 1] === "`" &&
        text[i + 2] === "`"
      ) {
        const end = text.indexOf("```", i + 3);
        if (end !== -1) {
          flush();
          const rawContent = text.slice(i + 3, end);
          if (rawContent.includes("\n")) {
            // Multi-line: first line may be language tag
            const firstNewline = rawContent.indexOf("\n");
            const firstLine = rawContent.slice(0, firstNewline);
            const rest = rawContent.slice(firstNewline + 1);
            const content = rest.endsWith("\n") ? rest.slice(0, -1) : rest;
            const cb = new MarkdownCodeBlock(content);
            if (/^\w+$/.test(firstLine)) {
              cb.language(firstLine);
            }
            result.push(cb);
          } else {
            // Single-line: inline triple backtick
            const cb = new MarkdownCodeBlock(rawContent);
            cb.$backtickCount = 3;
            result.push(cb);
          }
          i = end + 3;
          continue;
        }
      }

      // 1b. Inline math: $content$
      if (text[i] === "$" && text[i + 1] !== "$") {
        const end = findSingleClose(text, i + 1, "$");
        if (end !== -1) {
          flush();
          result.push(new MarkdownMathBlock(text.slice(i + 1, end)));
          i = end + 1;
          continue;
        }
      }

      // 1c. Code span
      if (text[i] === "`") {
        const end = text.indexOf("`", i + 1);
        if (end !== -1) {
          flush();
          result.push(new MarkdownCodeBlock(text.slice(i + 1, end)));
          i = end + 1;
          continue;
        }
      }

      // 2. Image: ![alt](src)
      if (text[i] === "!" && text[i + 1] === "[") {
        const closeBracket = text.indexOf("]", i + 2);
        if (closeBracket !== -1 && text[closeBracket + 1] === "(") {
          const closeParen = text.indexOf(")", closeBracket + 2);
          if (closeParen !== -1) {
            flush();
            const alt = text.slice(i + 2, closeBracket);
            const src = text.slice(closeBracket + 2, closeParen);
            result.push(new MarkdownImageBlock(src, ...this.parseInline(alt)));
            i = closeParen + 1;
            continue;
          }
        }
      }

      // 3. Footnote ref: [^id]
      if (text[i] === "[" && text[i + 1] === "^") {
        const closeBracket = text.indexOf("]", i + 2);
        if (closeBracket !== -1) {
          flush();
          const id = text.slice(i + 2, closeBracket);
          const fn = new MarkdownFootnoteBlock();
          fn.$identifier = id;
          result.push(fn);
          i = closeBracket + 1;
          continue;
        }
      }

      // 4. Link: [text](url)
      if (text[i] === "[") {
        const closeBracket = text.indexOf("]", i + 1);
        if (closeBracket !== -1 && text[closeBracket + 1] === "(") {
          const closeParen = text.indexOf(")", closeBracket + 2);
          if (closeParen !== -1) {
            flush();
            const linkText = text.slice(i + 1, closeBracket);
            const url = text.slice(closeBracket + 2, closeParen);
            result.push(
              new MarkdownLinkBlock(url, ...this.parseInline(linkText)),
            );
            i = closeParen + 1;
            continue;
          }
        }
      }

      // 5. Underline: <ins>content</ins>
      if (text[i] === "<" && text.startsWith("<ins>", i)) {
        const end = text.indexOf("</ins>", i + 5);
        if (end !== -1) {
          flush();
          result.push(
            new MarkdownUnderlineBlock(
              ...this.parseInline(text.slice(i + 5, end)),
            ),
          );
          i = end + 6;
          continue;
        }
      }

      // 6. HTML link: <a href="url" target="target">content</a>
      if (text[i] === "<" && text.startsWith("<a ", i)) {
        const tagEnd = text.indexOf(">", i + 3);
        if (tagEnd !== -1) {
          const closeTag = text.indexOf("</a>", tagEnd + 1);
          if (closeTag !== -1) {
            const tag = text.slice(i, tagEnd + 1);
            const hrefMatch = tag.match(/href="([^"]*)"/);
            const targetMatch = tag.match(/target="([^"]*)"/);
            if (hrefMatch) {
              flush();
              const linkContent = text.slice(tagEnd + 1, closeTag);
              const linkBlock = new MarkdownLinkBlock(
                hrefMatch[1],
                ...this.parseInline(linkContent),
              );
              if (targetMatch) {
                linkBlock.target(targetMatch[1] as MarkdownLinkTarget);
              }
              result.push(linkBlock);
              i = closeTag + 4;
              continue;
            }
          }
        }
      }

      // 7. Auto link: <url>
      if (text[i] === "<") {
        const closeAngle = text.indexOf(">", i + 1);
        if (closeAngle !== -1) {
          const url = text.slice(i + 1, closeAngle);
          if (url.includes("://") || url.includes("@")) {
            flush();
            result.push(new MarkdownLinkBlock(url));
            i = closeAngle + 1;
            continue;
          }
        }
      }

      // 6. Bold: **text**
      if (text[i] === "*" && text[i + 1] === "*") {
        const end = text.indexOf("**", i + 2);
        if (end !== -1) {
          flush();
          result.push(
            new MarkdownBoldBlock(...this.parseInline(text.slice(i + 2, end))),
          );
          i = end + 2;
          continue;
        }
      }

      // 7. Bold underscore: __text__
      if (text[i] === "_" && text[i + 1] === "_") {
        const end = text.indexOf("__", i + 2);
        if (end !== -1) {
          flush();
          const block = new MarkdownBoldBlock(
            ...this.parseInline(text.slice(i + 2, end)),
          );
          block.style("__");
          result.push(block);
          i = end + 2;
          continue;
        }
      }

      // 8. Strikethrough: ~~text~~
      if (text[i] === "~" && text[i + 1] === "~") {
        const end = text.indexOf("~~", i + 2);
        if (end !== -1) {
          flush();
          result.push(
            new MarkdownStrikethroughBlock(
              ...this.parseInline(text.slice(i + 2, end)),
            ),
          );
          i = end + 2;
          continue;
        }
      }

      // 9. Highlight: ==text==
      if (text[i] === "=" && text[i + 1] === "=") {
        const end = text.indexOf("==", i + 2);
        if (end !== -1) {
          flush();
          result.push(
            new MarkdownHighlightBlock(
              ...this.parseInline(text.slice(i + 2, end)),
            ),
          );
          i = end + 2;
          continue;
        }
      }

      // 10. Italic: *text*
      if (text[i] === "*" && text[i + 1] !== "*") {
        const end = findSingleClose(text, i + 1, "*");
        if (end !== -1) {
          flush();
          result.push(
            new MarkdownItalicBlock(
              ...this.parseInline(text.slice(i + 1, end)),
            ),
          );
          i = end + 1;
          continue;
        }
      }

      // 11. Italic underscore: _text_
      if (text[i] === "_" && text[i + 1] !== "_") {
        const end = findSingleClose(text, i + 1, "_");
        if (end !== -1) {
          flush();
          const block = new MarkdownItalicBlock(
            ...this.parseInline(text.slice(i + 1, end)),
          );
          block.style("_");
          result.push(block);
          i = end + 1;
          continue;
        }
      }

      // 12. Subscript: ~text~
      if (text[i] === "~" && text[i + 1] !== "~") {
        const end = findSingleClose(text, i + 1, "~");
        if (end !== -1) {
          flush();
          result.push(
            new MarkdownSubscriptBlock(
              ...this.parseInline(text.slice(i + 1, end)),
            ),
          );
          i = end + 1;
          continue;
        }
      }

      // 13. Superscript: ^text^
      if (text[i] === "^") {
        const end = text.indexOf("^", i + 1);
        if (end !== -1) {
          flush();
          result.push(
            new MarkdownSuperscriptBlock(
              ...this.parseInline(text.slice(i + 1, end)),
            ),
          );
          i = end + 1;
          continue;
        }
      }

      // 14. Emoji: :name:
      if (text[i] === ":") {
        const end = text.indexOf(":", i + 1);
        if (end !== -1) {
          const name = text.slice(i + 1, end);
          if (/^[a-z0-9_+-]+$/.test(name)) {
            flush();
            result.push(new MarkdownEmojiBlock(name as EmojiShortname));
            i = end + 1;
            continue;
          }
        }
      }

      buffer += text[i];
      i++;
    }

    flush();
    return result;
  }

  private inlineToBlockContent(
    parsed: MarkdownInlineBlockContent[],
  ): MarkdownMultilineBlockContent {
    if (parsed.length === 0) return "";
    if (parsed.length === 1) {
      const item = parsed[0];
      if (typeof item === "string") return item;
      if (item instanceof MarkdownInlineBlock) return item;
      return String(item ?? "");
    }
    return new MarkdownInlineBlock(...parsed);
  }

  private parseBlockquoteLines(lines: string[]): MarkdownBlockquoteBlock {
    const stripped = lines.map((line) => {
      const match = line.match(/^>(?: )?(.*)$/);
      return match ? match[1] : line;
    });

    // Detect GitHub-flavored alert: [!NOTE], [!TIP], etc.
    let alert: GithubFlavoredBlockquoteAlert | undefined;
    const alertMatch = stripped[0]?.match(
      /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]$/i,
    );
    if (alertMatch) {
      alert = alertMatch[1].toLowerCase() as GithubFlavoredBlockquoteAlert;
      stripped.shift();
    }

    const content = this.parseBlocks(stripped);
    const bq = new MarkdownBlockquoteBlock(...content);
    if (alert) bq.alert(alert);
    return bq;
  }

  private parseListGroup(
    lines: string[],
    startIndex: number,
  ): [MarkdownListBlock, number] {
    const items: MarkdownMultilineBlockContent[] = [];
    let i = startIndex;
    let observedNestedIndent: number | undefined;

    while (i < lines.length) {
      const line = lines[i];
      const indent = line.length - line.trimStart().length;
      const trimmed = line.trimStart();

      if (indent > 0 && trimmed.length > 0) {
        const nestedIndent = indent;
        if (observedNestedIndent === undefined) {
          observedNestedIndent = nestedIndent;
        }
        const nestedLines: string[] = [];
        while (i < lines.length) {
          const nl = lines[i];
          const ni = nl.length - nl.trimStart().length;
          if (ni >= nestedIndent && nl.trimStart().length > 0) {
            nestedLines.push(nl.slice(nestedIndent));
            i++;
          } else {
            break;
          }
        }
        const [nestedList] = this.parseListGroup(nestedLines, 0);
        items.push(nestedList);
        continue;
      }

      // Task item: - [x] text or - [ ] text
      const taskMatch = trimmed.match(/^- \[([ xX])\] (.+)$/);
      if (taskMatch) {
        const checked = taskMatch[1] !== " ";
        const parsed = this.parseInline(taskMatch[2]);
        const item = new MarkdownTaskItemBlock(
          checked,
          ...(parsed as MarkdownLineBlockContent[]),
        );
        if (taskMatch[1] === "X") item.style("X");
        items.push(item);
        i++;
        continue;
      }

      // Unordered list item: * text or - text or + text
      const ulMatch = trimmed.match(/^([*+-]) (.+)$/);
      if (ulMatch) {
        const style = ulMatch[1] as MarkdownUnorderedListItemStyle;
        const parsed = this.parseInline(ulMatch[2]);
        const item = new MarkdownUnorderedListItemBlock(
          ...(parsed as MarkdownLineBlockContent[]),
        );
        item.style(style);
        items.push(item);
        i++;
        continue;
      }

      // Ordered list item: 1. text
      const olMatch = trimmed.match(/^(\d+)\. (.+)$/);
      if (olMatch) {
        const idx = parseInt(olMatch[1]);
        const parsed = this.parseInline(olMatch[2]);
        const item = new MarkdownOrderedListItemBlock(
          idx,
          ...(parsed as MarkdownLineBlockContent[]),
        );
        items.push(item);
        i++;
        continue;
      }

      break;
    }

    const list = new MarkdownListBlock(...items);
    if (observedNestedIndent !== undefined) {
      list.indent(observedNestedIndent);
    }
    return [list, i];
  }

  private parseBlocks(
    lines: string[],
    headingLevelMap?: WeakMap<MarkdownHeadingBlock, number>,
  ): MarkdownMultilineBlockContent[] {
    const result: MarkdownMultilineBlockContent[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // 1. Code fence
      const codeFenceMatch = line.match(/^```(\w*)$/);
      if (codeFenceMatch) {
        const language = codeFenceMatch[1] || undefined;
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].match(/^```$/)) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // skip closing ```
        const codeBlock = new MarkdownCodeBlock(codeLines.join("\n"));
        if (language) codeBlock.language(language);
        result.push(codeBlock);
        continue;
      }

      // 2. Math fence
      const mathFenceMatch = line.match(/^\$\$$/);
      if (mathFenceMatch) {
        const mathLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].match(/^\$\$$/)) {
          mathLines.push(lines[i]);
          i++;
        }
        i++; // skip closing $$
        result.push(new MarkdownMathBlock(mathLines.join("\n")));
        continue;
      }

      // 3. Figure with caption: <figure>...<img>...<figcaption>...</figure>
      if (line === "<figure>") {
        const figureLines: string[] = [];
        i++;
        while (i < lines.length && lines[i] !== "</figure>") {
          figureLines.push(lines[i]);
          i++;
        }
        i++; // skip closing </figure>
        const figureContent = figureLines.join("\n");
        const imgMatch = figureContent.match(
          /<img src="([^"]*)"(?:\s+alt="([^"]*)")?>/,
        );
        const captionMatch = figureContent.match(
          /<figcaption>([\s\S]*?)<\/figcaption>/,
        );
        if (imgMatch) {
          const src = imgMatch[1];
          const alt = imgMatch[2];
          const imgBlock = alt
            ? new MarkdownImageBlock(src, ...this.parseInline(alt))
            : new MarkdownImageBlock(src);
          if (captionMatch) {
            imgBlock.caption(...this.parseInline(captionMatch[1]));
          }
          result.push(imgBlock);
          continue;
        }
      }

      // 4. Details: <details>...<summary>...</summary>...content...</details>
      if (line === "<details>") {
        const detailsLines: string[] = [];
        i++;
        while (i < lines.length && lines[i] !== "</details>") {
          detailsLines.push(lines[i]);
          i++;
        }
        i++; // skip closing </details>
        const detailsContent = detailsLines.join("\n");
        const summaryMatch = detailsContent.match(
          /^\s*<summary>(.*?)<\/summary>/,
        );
        let bodyText: string;
        if (summaryMatch) {
          bodyText = detailsContent.slice(summaryMatch[0].length);
        } else {
          bodyText = detailsContent;
        }
        // Strip leading newline and 2-space indent from content lines
        const bodyLines = bodyText
          .replace(/^\n/, "")
          .split("\n")
          .map((l) => (l.startsWith("  ") ? l.slice(2) : l));
        const contentBlocks = this.parseBlocks(bodyLines);
        const detailsBlock = new MarkdownDetailsBlock(...contentBlocks);
        if (summaryMatch && summaryMatch[1]) {
          detailsBlock.summary(...this.parseInline(summaryMatch[1]));
        }
        result.push(detailsBlock);
        continue;
      }

      // 5. Heading
      const headingMatch = line.match(/^(#{1,6}) (.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length as MarkdownHeadingLevel;
        const content = headingMatch[2];
        const idMatch = content.match(/^(.+?) \{#(.+)\}$/);
        const headingContent = idMatch ? idMatch[1] : content;
        const headingId = idMatch ? idMatch[2] : undefined;
        const parsed = this.parseInline(headingContent);
        const h = new MarkdownHeadingBlock(
          ...(parsed as MarkdownLineBlockContent[]),
        );
        if (headingLevelMap) {
          headingLevelMap.set(h, level);
        } else {
          h.$level = level;
        }
        if (headingId) h.identifier(headingId);
        result.push(h);
        i++;
        continue;
      }

      // 3. Blockquote
      if (line.match(/^>/)) {
        const bqLines: string[] = [];
        while (i < lines.length && lines[i].match(/^>/)) {
          bqLines.push(lines[i]);
          i++;
        }
        result.push(this.parseBlockquoteLines(bqLines));
        continue;
      }

      // 4. Horizontal rule
      const hrMatch = line.match(/^([-*_])\1{2,}$/);
      if (hrMatch) {
        const style = hrMatch[1] as MarkdownHorizontalRuleStyle;
        const count = line.length;
        // Pop preceding line break (owned by HR render)
        if (
          result.length > 0 &&
          result[result.length - 1] instanceof MarkdownLineBreakBlock
        ) {
          result.pop();
        }
        // Skip following empty line (owned by HR render)
        if (i + 1 < lines.length && lines[i + 1] === "") {
          i++;
        }
        const hrBlock = new MarkdownHorizontalRuleBlock();
        hrBlock.style(style);
        hrBlock.count(count);
        result.push(hrBlock);
        i++;
        continue;
      }

      // 5-7. List items (task, unordered, ordered)
      const isListItem =
        line.match(/^(\s*)- \[([ xX])\] (.+)$/) ||
        line.match(/^(\s*)([*+-]) (.+)$/) ||
        line.match(/^(\s*)(\d+)\. (.+)$/);
      if (isListItem) {
        const [listBlock, nextI] = this.parseListGroup(lines, i);
        result.push(listBlock);
        i = nextI;
        continue;
      }

      // 8. Table: | col1 | col2 | ... |
      if (
        line.match(/^\|.+\|$/) &&
        i + 1 < lines.length &&
        lines[i + 1].match(/^\|[\s\-:|]+\|$/)
      ) {
        const headerCells = line
          .slice(1, -1)
          .split("|")
          .map((c) => c.trim());
        const separatorCells = lines[i + 1]
          .slice(1, -1)
          .split("|")
          .map((c) => c.trim());
        const alignments: Array<MarkdownTableAlignStyle | undefined> =
          separatorCells.map((sep) => {
            const left = sep.startsWith(":");
            const right = sep.endsWith(":");
            if (left && right) return "center";
            if (right) return "right";
            if (left) return "left";
            return undefined;
          });
        i += 2; // skip header + separator
        const rows: Array<Record<string, MarkdownLineBlockContent>> = [];
        while (i < lines.length && lines[i].match(/^\|.+\|$/)) {
          const cells = lines[i]
            .slice(1, -1)
            .split(/(?<!\\)\|/)
            .map((c) => c.trim().replace(/\\\|/g, "|"));
          const row: Record<string, MarkdownLineBlockContent> = {};
          for (let c = 0; c < headerCells.length; c++) {
            const raw = cells[c] ?? "";
            const parsed = this.parseInline(raw);
            if (parsed.length === 0) {
              row[headerCells[c]] = "";
            } else if (parsed.length === 1 && typeof parsed[0] === "string") {
              row[headerCells[c]] = parsed[0];
            } else if (
              parsed.length === 1 &&
              parsed[0] instanceof MarkdownInlineBlock
            ) {
              row[headerCells[c]] = parsed[0];
            } else {
              row[headerCells[c]] = new MarkdownInlineBlock(...parsed);
            }
          }
          rows.push(row);
          i++;
        }
        const columnsDefinition: Record<string, string> = {};
        for (const name of headerCells) {
          columnsDefinition[name] = name;
        }
        const tableBlock = new MarkdownTableBlock(columnsDefinition, ...rows);
        for (let c = 0; c < headerCells.length; c++) {
          const align = alignments[c];
          if (align) {
            tableBlock.setColumnAlign(headerCells[c], align);
          }
        }
        result.push(tableBlock);
        continue;
      }

      // 9. Comment: [content]: #
      const commentMatch = line.match(/^\[([^\^][^\]]*)\]: #$/);
      if (commentMatch) {
        const content = commentMatch[1];
        result.push(new MarkdownCommentBlock(content));
        i++;
        continue;
      }

      // 10. Footnote definition: [^id]: content
      const fnDefMatch = line.match(/^\[\^(.+?)\]: (.+)$/);
      if (fnDefMatch) {
        // Skip footnote definitions - they'll be handled by parse()
        i++;
        // Also skip continuation lines
        while (
          i < lines.length &&
          lines[i] !== "" &&
          !lines[i].match(/^\[\^.+?\]: /)
        ) {
          i++;
        }
        continue;
      }

      // 10. Inline code fence spanning multiple lines
      if (line.includes("```") && !line.match(/^```/)) {
        let endLine = -1;
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].includes("```")) {
            endLine = j;
            break;
          }
        }
        if (endLine !== -1) {
          const combinedText = lines.slice(i, endLine + 1).join("\n");
          const parsed = this.parseInline(combinedText);
          result.push(
            new MarkdownParagraphBlock(
              ...(parsed as MarkdownLineBlockContent[]),
            ),
          );
          i = endLine + 1;
          continue;
        }
      }

      // 11. Everything else
      if (line === "") {
        result.push(new MarkdownLineBreakBlock());
      } else {
        const parsed = this.parseInline(line);
        result.push(
          new MarkdownParagraphBlock(...(parsed as MarkdownLineBlockContent[])),
        );
      }
      i++;
    }

    return result;
  }

  private collectFootnoteBlocks(
    items: MarkdownMultilineBlockContent[],
  ): MarkdownFootnoteBlock[] {
    const result: MarkdownFootnoteBlock[] = [];
    const walk = (item: unknown) => {
      if (item instanceof MarkdownFootnoteBlock) {
        result.push(item);
      }
      if (item instanceof MarkdownMultilineBlock) {
        item.$lines.forEach(walk);
      } else if (item instanceof MarkdownLineBlock) {
        item.$line.forEach(walk);
      } else if (item instanceof MarkdownInlineBlock) {
        item.$content.forEach(walk);
      }
    };
    items.forEach(walk);
    return result;
  }

  private nestSections(
    blocks: MarkdownMultilineBlockContent[],
    headingLevels: WeakMap<MarkdownHeadingBlock, number>,
  ): MarkdownMultilineBlockContent[] {
    const result: MarkdownMultilineBlockContent[] = [];
    const stack: { level: number; items: MarkdownMultilineBlockContent[] }[] = [
      { level: 0, items: result },
    ];

    for (const block of blocks) {
      if (block instanceof MarkdownHeadingBlock) {
        const level = headingLevels.get(block) ?? 1;

        if (level <= 1) {
          // Level 1 headings go directly into the root
          while (stack.length > 1) {
            stack.pop();
          }
          stack[0].items.push(block);
        } else {
          // Pop back to the parent depth (level - 1)
          // This ensures each heading gets its own NEW section
          const parentDepth = level - 1;
          while (stack.length > parentDepth) {
            if (stack.length <= 1) break;
            stack.pop();
          }

          // Create intermediate sections if needed to reach parent depth
          while (stack.length < parentDepth) {
            const sec = new MarkdownSectionBlock();
            stack[stack.length - 1].items.push(sec);
            stack.push({ level: stack.length, items: sec.$lines });
          }

          // Always create a new section for this heading
          const sec = new MarkdownSectionBlock();
          stack[stack.length - 1].items.push(sec);
          stack.push({ level: stack.length, items: sec.$lines });

          // Push heading into its new section
          stack[stack.length - 1].items.push(block);
        }
      } else {
        // Non-heading content goes to current level
        stack[stack.length - 1].items.push(block);
      }
    }

    return result;
  }

  public parse(input: string): MarkdownDocument {
    const allLines = input.split("\n");

    // Pre-pass: extract footnote definitions from anywhere in the document.
    // Definitions may appear interleaved with body text, not just at the end.
    const bodyLines: string[] = [];
    const footnoteDefs = new Map<string, MarkdownMultilineBlockContent[]>();

    let i = 0;
    while (i < allLines.length) {
      const defMatch = allLines[i].match(/^\[\^(.+?)\]: (.+)$/);
      if (defMatch) {
        // Pop the preceding empty line (separator between body and definition)
        if (bodyLines.length > 0 && bodyLines[bodyLines.length - 1] === "") {
          bodyLines.pop();
        }
        const id = defMatch[1];
        const content: MarkdownMultilineBlockContent[] = [defMatch[2]];
        i++;
        // Collect continuation lines
        while (
          i < allLines.length &&
          allLines[i] !== "" &&
          !allLines[i].match(/^\[\^.+?\]: /)
        ) {
          content.push(allLines[i]);
          i++;
        }
        footnoteDefs.set(id, content);
      } else {
        bodyLines.push(allLines[i]);
        i++;
      }
    }

    const headingLevelMap = new WeakMap<MarkdownHeadingBlock, number>();
    const flatBlocks = this.parseBlocks(bodyLines, headingLevelMap);
    const blocks = this.nestSections(flatBlocks, headingLevelMap);
    const doc = new MarkdownDocument(...blocks);

    // Wire footnote definitions
    if (footnoteDefs.size > 0) {
      const fnBlocks = this.collectFootnoteBlocks(blocks);
      for (const fn of fnBlocks) {
        if (fn.$identifier && footnoteDefs.has(fn.$identifier)) {
          const originalId = fn.$identifier;
          fn.$footer.$lines.push(...footnoteDefs.get(originalId)!);
          // Clear numeric identifiers so auto-numbering handles them.
          // This allows parsed documents to be embedded in host documents
          // without footnote numbering collisions.
          if (/^\d+$/.test(originalId)) {
            fn.$identifier = undefined;
          }
        }
      }
    }

    return doc;
  }
}

export const parse = (input: string): MarkdownDocument => {
  return new MarkdownBlockParser().parse(input);
};
