import { describe, it, expect } from "vitest";
import { b } from "../../index";

describe("MarkdownEmojiBlock", () => {
  describe("rendering", () => {
    it("should render an emoji shortname wrapped in colons", () => {
      expect(String(b.emoji("joy"))).toBe(":joy:");
    });

    it("should render heart emoji", () => {
      expect(String(b.emoji("heart"))).toBe(":heart:");
    });

    it("should render waffle emoji", () => {
      expect(String(b.emoji("waffle"))).toBe(":waffle:");
    });

    it("should render thumbsup emoji", () => {
      expect(String(b.emoji("thumbsup"))).toBe(":thumbsup:");
    });

    it("should render emoji with underscores in name", () => {
      expect(String(b.emoji("heart_eyes"))).toBe(":heart_eyes:");
    });
  });

  describe("coercion", () => {
    it("should be coercible via String()", () => {
      expect(String(b.emoji("joy"))).toBe(":joy:");
    });

    it("should be coercible via template literal", () => {
      expect(`${b.emoji("joy")}`).toBe(":joy:");
    });

    it("should coerce to the same value as render()", () => {
      const block = b.emoji("sparkles");
      expect(String(block)).toBe(block.render());
    });
  });

  describe("factory aliases", () => {
    it("should be creatable via b.emoji()", () => {
      expect(String(b.emoji("heart"))).toBe(":heart:");
    });

    it("should be creatable via b.e()", () => {
      expect(String(b.e("heart"))).toBe(":heart:");
    });

    it("should produce equivalent results from both factories", () => {
      expect(String(b.emoji("waffle"))).toBe(String(b.e("waffle")));
    });
  });

  describe("getMetadataTags", () => {
    it("should include name tag with the emoji shortname", () => {
      const tags = b.emoji("joy").getMetadataTags();
      expect(tags).toContain("name=joy");
    });

    it("should include name tag for heart emoji", () => {
      const tags = b.emoji("heart").getMetadataTags();
      expect(tags).toContain("name=heart");
    });

    it("should include name tag for complex shortname", () => {
      const tags = b.emoji("heart_eyes").getMetadataTags();
      expect(tags).toContain("name=heart_eyes");
    });
  });

  describe("$emoji property", () => {
    it("should store the emoji shortname on the instance", () => {
      const block = b.emoji("thumbsup");
      expect(block.$emoji).toBe("thumbsup");
    });

    it("should store the correct value for different emojis", () => {
      expect(b.emoji("waffle").$emoji).toBe("waffle");
      expect(b.emoji("joy").$emoji).toBe("joy");
      expect(b.emoji("heart").$emoji).toBe("heart");
    });
  });

  describe("render", () => {
    it("should always return a non-null string", () => {
      expect(b.emoji("joy").render()).not.toBeNull();
    });

    it("should return the colon-wrapped shortname", () => {
      expect(b.emoji("thumbsup").render()).toBe(":thumbsup:");
    });
  });
});
