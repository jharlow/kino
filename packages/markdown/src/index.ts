import { e, emoji } from "./blocks/extended/markdown-emoji-block";
import { fn, foot, footnote } from "./blocks/extended/markdown-footnote-block";
import {
  high,
  highlight,
  hl,
} from "./blocks/extended/markdown-highlight-block";
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
import { renderingOptions } from "./blocks/primitives/markdown-block";
import { inspect } from "./blocks/primitives/markdown-block-inspector";
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
import { d, doc, document as document_ } from "./blocks/utilities/markdown-document-block";
import { s, sec, section } from "./blocks/utilities/markdown-section-block";
import { parse } from "./parsing/markdown-block-parser";
import { markdown, md } from "./parsing/markdown-literal";

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
export const b = {
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
  emoji,
  e,
  list,
  ls: list,
  listItem,
  li: listItem,
  codeblock,
  code,
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

export default b;
