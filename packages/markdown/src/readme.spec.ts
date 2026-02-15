import { test } from "vitest";
import { b, MarkdownDocument } from "./index";

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
  console.log(String(doc));
  console.log(b.b("hi").i("_").h(2).id("text").render());

  type User = { name?: string; email?: string };
  const createUserDoc = (user: User, short?: boolean): MarkdownDocument => {
    return b.doc(
      b.h("User details"),
      b.p(b.b("The users name is"), user.name).emptyIf(!user.name),
      b.p(b.b("The users email is"), user.email).emptyIf(!user.email),
    );
  };
  console.log(String(createUserDoc({ name: "John Doe" })));
});
