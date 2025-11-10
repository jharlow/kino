import { describe, expect, it } from "vitest";
import { pluralize } from "./pluralize";

describe(pluralize.name, () => {
  it("should append an s as the default", () => {
    expect(pluralize(1, "cupcake")).toEqual("cupcake");
    expect(pluralize(2, "cupcake")).toEqual("cupcakes");
  });

  it("should return provided value for special cases", () => {
    expect(pluralize(1, "person", "people")).toEqual("person");
    expect(pluralize(2, "person", "people")).toEqual("people");
    expect(pluralize(1, "child", "children")).toEqual("child");
    expect(pluralize(2, "child", "children")).toEqual("children");
  });
});
