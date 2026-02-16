import { describe, expect, test } from "vitest";
import assert from "assert";
import { b, MarkdownDocument } from "./index";

describe("README", () => {
  test("example 1", () => {
    type User = { name?: string; email?: string; alternateEmail?: string };
    const createUserDoc = (user: User): MarkdownDocument => {
      const footnote = b
        .footnote(`Alternate email: ${user.alternateEmail}`)
        .if(user.alternateEmail);
      return b
        .doc(
          b.heading("User details"),
          b`The users name is ${b.p(user.name).default("unknown")}`,
          b`${b.b("The users email is")}: ${user.email}${footnote}`.if(
            user.email,
          ),
        )
        .if(user.name || user.email);
    };

    const user: User = {
      email: "john@email.com",
      alternateEmail: "john@work.com",
    };
    const userDoc = createUserDoc(user);
    const result1 = `# User details
The users name is unknown
**The users email is**: john@email.com[^1]

[^1]: Alternate email: john@work.com`;
    expect(String(userDoc)).toBe(result1);

    const prompt = b
      .doc(
        b.heading("Instructions"),
        "Greet the user and introduce yourself as a helpful AI assistant.",
        userDoc,
        "Once you have done this, call the `welcomeGiven` tool.",
      )
      .setRenderingOptions({
        enforce: { bold: { style: "__" } },
        newlineStrategy: "between_blocks",
      });
    const result2 = `# Instructions

Greet the user and introduce yourself as a helpful AI assistant.

## User details

The users name is unknown

__The users email is__: john@email.com[^1]

Once you have done this, call the \`welcomeGiven\` tool.

[^1]: Alternate email: john@work.com`;
    expect(String(prompt)).toBe(result2);
  });

  test("example 2", () => {
    type User = { name?: string; email?: string; alternateEmail?: string };
    const createUserDoc = (user: User): MarkdownDocument => {
      const footnote = b
        .footnote(`Alternate email: ${user.alternateEmail}`)
        .if(user.alternateEmail);
      return b
        .doc(
          b.heading("User details"),
          b`The users name is ${b.p(user.name).default("unknown")}`,
          b`${b.b("The users email is")}: ${user.email}${footnote}`.if(
            user.email,
          ),
        )
        .if(user.name || user.email);
    };

    const user: User = {
      email: "john@email.com",
      alternateEmail: "john@work.com",
    };
    const userDoc = createUserDoc(user);
    const result = `MarkdownDocument
├── MarkdownHeadingBlock
│   └── "User details"
├── MarkdownLiteral [trimmed]
│   ├── "The users name is "
│   └── MarkdownParagraphBlock
│       └── "unknown"
└── MarkdownLiteral [trimmed]
    ├── MarkdownBoldBlock
    │   └── "The users email is"
    ├── ": "
    ├── "john@email.com"
    └── MarkdownFootnoteBlock
        └── footer
            └── "Alternate email: john@work.com"`;
    expect(userDoc.inspect()).toBe(result);
  });

  test("example 3", () => {
    type PullRequest = { title: string; reviewer: string; approved: boolean };
    const createPrDoc = (pr: PullRequest): MarkdownDocument => {
      const reviewer = b.b(pr.reviewer).change((block) => {
        if (pr.approved) return block.strikethrough();
        return block;
      });
      return b.doc(b.b(pr.title).h(), b.p("Reviewer: ", reviewer));
    };

    const pr: PullRequest = { title: "100", reviewer: "John", approved: true };
    const result1 = `# **100**\nReviewer: ~~**John**~~`;
    expect(String(createPrDoc(pr))).toBe(result1);

    const result2 = `# **100**\nReviewer: **John**`;
    expect(String(createPrDoc({ ...pr, approved: false }))).toBe(result2);
  });

  test("example 4", () => {
    const existingPrompt = b` 
  # About our company
  We are a company that makes widgets.

  ## Our process
  We follow a _rigorous_ process to make ==widgets==.

  ## Our customers
  | Name       | Email                  |
  |------------|------------------------|
  | John Doe   | john.doe@example.com   |
  | Jane Smith | jane.smith@example.com |
`.parse(); // 👈 and then `.parse()` it to convert it automatically

    const result = `MarkdownDocument
├── MarkdownHeadingBlock
│   └── "About our company"
├── MarkdownParagraphBlock
│   └── "We are a company that makes widgets."
├── MarkdownLineBreakBlock
├── MarkdownSectionBlock
│   ├── MarkdownHeadingBlock
│   │   └── "Our process"
│   ├── MarkdownParagraphBlock
│   │   ├── "We follow a "
│   │   ├── MarkdownItalicBlock [style=_]
│   │   │   └── "rigorous"
│   │   ├── " process to make "
│   │   ├── MarkdownHighlightBlock
│   │   │   └── "widgets"
│   │   └── "."
│   └── MarkdownLineBreakBlock
└── MarkdownSectionBlock
    ├── MarkdownHeadingBlock
    │   └── "Our customers"
    └── MarkdownTableBlock [columns=Name,Email, rows=2]
        ├── columns
        │   ├── "Name"
        │   └── "Email"
        └── rows
            ├── row 0
            │   ├── "John Doe"
            │   └── "john.doe@example.com"
            └── row 1
                ├── "Jane Smith"
                └── "jane.smith@example.com"`;
    expect(existingPrompt.inspect()).toBe(result);
  });

  test("example 5", () => {
    const templateEncoding = b`
    ${b.h("Example document").l(2).id("example-document")}
    ${b.b("Important text")}${b.fn("example footnote")}
    `;

    const functionalEncoding = b.doc(
      b.h("Example document").l(2).id("example-document"),
      b.p(b.b("Important text"), b.fn("example footnote")),
    );

    const parseEncoding = b`
    ## Example document {#example-document}
    **Important text**[^1]
  
    [^1]: example footnote
    `.parse();
    expect(String(templateEncoding)).toBe(String(functionalEncoding));
    expect(String(functionalEncoding)).toBe(String(parseEncoding));
  });
});
