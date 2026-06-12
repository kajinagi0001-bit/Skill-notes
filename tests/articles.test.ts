import { describe, expect, it } from "vitest";

describe("article URL conventions", () => {
  it("accepts lowercase kebab-case slugs", () => {
    expect("codex-question-to-article").toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it("rejects unsafe path fragments", () => {
    expect("../draft").not.toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });
});
