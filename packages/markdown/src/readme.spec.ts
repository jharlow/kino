import { test } from "vitest";
import {
  b,
  MarkdownBlock,
  MarkdownDocument,
  MarkdownInlineBlock,
} from "./index";

test("readme", () => {
  const doc = b
    .doc(
      b.heading(b.code("bamd"), " - block architected markdown documents"),
      b.md`a terse programatic markdown builder for making complex, sharable prompts`,
      b.sec(
        b.heading("terse"),
        b.md`designed to be as simple as possible at call-sites, disclosing additional options via a discoverable, chainable API`,
        b
          .code(
            `
          String(b.bold('text').heading().level(2).id('text-1')) ===> '## **text** {#text-1}'
          String(b.b("text").h(2).id("text-"))                   ===> '## **text** {#text-1}'
          `,
          )
          .language("js"),
      ),
    )
    .setRenderingOptions({ newlineStrategy: "between_blocks" });
  // console.log(String(doc));
  // console.log(b.b("hi").i("_").h(2).id("text").render());

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
    email: "john.doe@example.com",
    alternateEmail: "john.doe@work.com",
  };
  const userDoc = createUserDoc(user);
  console.log(`${userDoc}`);
  // # User details
  // The users name is unknown
  // **The users email is**: john.doe@example.com[^1]
  //
  // [^1]: Alternate email: john.doe@work.com

  const prompt = b
    .doc(
      b.heading("Instructions"),
      b.p("Greet the user and introduce yourself as a helpful AI assistant."),
      userDoc,
      b.p("Once you have done this, call the `welcomeGiven` tool."),
    )
    .setRenderingOptions({
      enforce: { bold: { style: "__" } },
      newlineStrategy: "between_blocks",
    });
  console.log(String(prompt));
});
