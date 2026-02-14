import { test } from "vitest";
import { b } from "./index";

test("readme", () => {
  const doc = b
    .doc(
      b.heading(b.code("bamd"), " - block architected markdown documents"),
      b.md`a terse programatic markdown builder for making complex, sharable prompts`,
      b.sec(
        b.heading("terse"),
        b.md`designed to be as simple as possible at callsites, disclosing additional options via a discoverable, chainable API`,
        b
          .code(
            `
          String(b.heading(b.italic('text')).level(2).identifier('text-1')) ===> '## *text* {#text-1}'
          String(b.h(b.i('text')).l(2).id('text-1)) ===> '## *text* {#text-1}'
        `,
          )
          .language("js")
          .trim(),
      ),
    )
    .setRenderingOptions({ newlineStrategy: "between_blocks" });
  console.log(String(doc));
});
