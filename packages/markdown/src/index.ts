import { e, emoji } from "./blocks/extended/markdown-emoji-block";
import { fn, foot, footnote } from "./blocks/extended/markdown-footnote-block";
import {
  high,
  highlight,
  hl,
} from "./blocks/extended/markdown-highlight-block";
import { math } from "./blocks/extended/markdown-math-block";
import {
  st,
  strike,
  strikethrough,
} from "./blocks/extended/markdown-strikethrough-block";
import { sub, subscript } from "./blocks/extended/markdown-subscript-block";
import { sup, superscript } from "./blocks/extended/markdown-superscript-block";
import { t, table, tb } from "./blocks/extended/markdown-table-block";
import { taskItem } from "./blocks/extended/markdown-task-item-block";
import { tasksList } from "./blocks/extended/markdown-task-list-block";
import {
  comment,
  hiddenFromHumans,
} from "./blocks/hacks/markdown-comment-block";
import { details } from "./blocks/hacks/markdown-details-block";
import { u, underline } from "./blocks/hacks/markdown-underline-block";
import { renderingOptions } from "./blocks/primitives/markdown-block";
import { inspect } from "./blocks/primitives/markdown-block-inspector";
import { MarkdownMultilineBlockContent } from "./blocks/primitives/markdown-multiline-block";
import {
  block,
  blockquote,
  bq,
} from "./blocks/standard/markdown-blockquote-block";
import { bold } from "./blocks/standard/markdown-bold-block";
import { code, codeblock } from "./blocks/standard/markdown-code-block";
import { h, head, heading } from "./blocks/standard/markdown-heading-block";
import {
  horizontalRule,
  hr,
} from "./blocks/standard/markdown-horizontal-rule-block";
import { image, img } from "./blocks/standard/markdown-image-block";
import { i, italic } from "./blocks/standard/markdown-italic-block";
import { br, lineBreak } from "./blocks/standard/markdown-line-break-block";
import { link, url } from "./blocks/standard/markdown-link-block";
import { orderedList } from "./blocks/standard/markdown-ordered-list-block";
import { orderedListItem } from "./blocks/standard/markdown-ordered-list-item-block";
import { p, para, paragraph } from "./blocks/standard/markdown-paragraph-block";
import { unorderedList } from "./blocks/standard/markdown-unordered-list-block";
import { unorderedListItem } from "./blocks/standard/markdown-unordered-list-item-block";
import {
  d,
  doc,
  document as document_,
} from "./blocks/utilities/markdown-document-block";
import { s, sec, section } from "./blocks/utilities/markdown-section-block";
import { parse } from "./parsing/markdown-block-parser";
import { markdown, MarkdownLiteral, md } from "./parsing/markdown-literal";

// Re-export all types and classes

// Primitives
export { MarkdownBlock } from "./blocks/primitives/markdown-block";
export type {
  EnforceOptions,
  NewlineStrategy,
  RenderingOptions,
  OptionalRenderingOptions,
  BlockMetadataTags,
} from "./blocks/primitives/markdown-block";
export { MarkdownBlockInspector } from "./blocks/primitives/markdown-block-inspector";
export { MarkdownInlineBlock } from "./blocks/primitives/markdown-inline-block";
export type { MarkdownInlineBlockContent } from "./blocks/primitives/markdown-inline-block";
export { MarkdownLineBlock } from "./blocks/primitives/markdown-line-block";
export type { MarkdownLineBlockContent } from "./blocks/primitives/markdown-line-block";
export { MarkdownMultilineBlock } from "./blocks/primitives/markdown-multiline-block";
export type {
  MarkdownMultilineBlockOptions,
  MarkdownMultilineBlockContent,
} from "./blocks/primitives/markdown-multiline-block";
export type { StringReadable } from "./blocks/primitives/string-readable";
export type {
  PrimitiveValue,
  BooleanCoercibleValue,
} from "./blocks/primitives/values";

// Standard blocks
export { MarkdownBlockquoteBlock } from "./blocks/standard/markdown-blockquote-block";
export type { GithubFlavoredBlockquoteAlert } from "./blocks/standard/markdown-blockquote-block";
export { MarkdownBoldBlock } from "./blocks/standard/markdown-bold-block";
export type { MarkdownBoldStyle } from "./blocks/standard/markdown-bold-block";
export { MarkdownCodeBlock } from "./blocks/standard/markdown-code-block";
export type { MarkdownCodeBlockLanguage } from "./blocks/standard/markdown-code-block";
export { MarkdownHeadingBlock } from "./blocks/standard/markdown-heading-block";
export type {
  MarkdownHeadingLevel,
  MarkdownHeadingLevelOptions,
} from "./blocks/standard/markdown-heading-block";
export { MarkdownHorizontalRuleBlock } from "./blocks/standard/markdown-horizontal-rule-block";
export type { MarkdownHorizontalRuleStyle } from "./blocks/standard/markdown-horizontal-rule-block";
export { MarkdownImageBlock } from "./blocks/standard/markdown-image-block";
export { MarkdownItalicBlock } from "./blocks/standard/markdown-italic-block";
export type { MarkdownItalicStyle } from "./blocks/standard/markdown-italic-block";
export { MarkdownLineBreakBlock } from "./blocks/standard/markdown-line-break-block";
export { MarkdownLinkBlock } from "./blocks/standard/markdown-link-block";
export { MarkdownListBlock } from "./blocks/standard/markdown-list-block";
export { MarkdownOrderedListBlock } from "./blocks/standard/markdown-ordered-list-block";
export { MarkdownOrderedListItemBlock } from "./blocks/standard/markdown-ordered-list-item-block";
export { MarkdownParagraphBlock } from "./blocks/standard/markdown-paragraph-block";
export { MarkdownUnorderedListBlock } from "./blocks/standard/markdown-unordered-list-block";
export { MarkdownUnorderedListItemBlock } from "./blocks/standard/markdown-unordered-list-item-block";
export type { MarkdownUnorderedListItemStyle } from "./blocks/standard/markdown-unordered-list-item-block";

// Extended blocks
export { MarkdownEmojiBlock } from "./blocks/extended/markdown-emoji-block";
export type { EmojiShortname } from "./blocks/extended/markdown-emoji-block";
export { MarkdownFootnoteBlock } from "./blocks/extended/markdown-footnote-block";
export { MarkdownHighlightBlock } from "./blocks/extended/markdown-highlight-block";
export { MarkdownMathBlock } from "./blocks/extended/markdown-math-block";
export { MarkdownStrikethroughBlock } from "./blocks/extended/markdown-strikethrough-block";
export { MarkdownSubscriptBlock } from "./blocks/extended/markdown-subscript-block";
export { MarkdownSuperscriptBlock } from "./blocks/extended/markdown-superscript-block";
export { MarkdownTableBlock } from "./blocks/extended/markdown-table-block";
export type {
  MarkdownTableAlignStyle,
  MarkdownTableMaxWidth,
  MarkdownTableBlockContent,
  MarkdownTableColumn,
  ColumnsDefinition,
  MarkdownTableRow,
} from "./blocks/extended/markdown-table-block";
export { MarkdownTaskItemBlock } from "./blocks/extended/markdown-task-item-block";
export type { MarkdownTaskItemBlockStyle } from "./blocks/extended/markdown-task-item-block";
export { MarkdownTaskListBlock } from "./blocks/extended/markdown-task-list-block";

// Hacks
export { MarkdownCommentBlock } from "./blocks/hacks/markdown-comment-block";
export { MarkdownDetailsBlock } from "./blocks/hacks/markdown-details-block";
export { MarkdownUnderlineBlock } from "./blocks/hacks/markdown-underline-block";

// Utilities
export { MarkdownDocument } from "./blocks/utilities/markdown-document-block";
export { MarkdownSectionBlock } from "./blocks/utilities/markdown-section-block";

// Parsing
export { MarkdownBlockParser } from "./parsing/markdown-block-parser";
export { MarkdownLiteral } from "./parsing/markdown-literal";

const list = {
  unordered: unorderedList,
  ul: unorderedList,
  ordered: orderedList,
  ol: orderedList,
  tasks: tasksList,
};

const listItem = {
  unordered: unorderedListItem,
  u: unorderedListItem,
  ordered: orderedListItem,
  o: orderedListItem,
  task: taskItem,
  t: taskItem,
};

const api = {
  markdown,
  md,
  document: document_,
  doc,
  d,
  section,
  sec,
  s,
  heading,
  head,
  h,
  paragraph,
  para,
  p,
  blockquote,
  block,
  bq,
  bold,
  b: bold,
  italic,
  i,
  strikethrough,
  strike,
  st,
  highlight,
  high,
  hl,
  subscript,
  sub,
  superscript,
  sup,
  link,
  url,
  image,
  img,
  underline,
  u,
  emoji,
  e,
  list,
  ls: list,
  listItem,
  li: listItem,
  codeblock,
  code,
  math,
  comment,
  hiddenFromHumans,
  details,
  horizontalRule,
  hr,
  footnote,
  foot,
  fn,
  lineBreak,
  br,
  table,
  tb,
  t,
  renderingOptions,
  parse,
  inspect,
} as const;

export type Bamd = typeof api & {
  (strings: TemplateStringsArray, ...exprs: Array<MarkdownMultilineBlockContent>): MarkdownLiteral;
};

export const b: Bamd = Object.assign(md, api) as Bamd;

export default b;
