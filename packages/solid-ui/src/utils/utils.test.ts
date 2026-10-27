import { createRoot, createSignal } from "solid-js";

import { describe, expect, it } from "vitest";

import { createControllableSignal } from "./form";
import { cx, mergeStyle, resolveSize } from "./style";

describe("cx", () => {
  it("joins truthy class names", () => {
    expect(cx("a", false, undefined, null, "", "b")).toBe("a b");
  });
});

describe("resolveSize", () => {
  it("maps tokens, numbers and lengths", () => {
    expect(resolveSize("md")).toBe("var(--bx-spacing-md)");
    expect(resolveSize(12)).toBe("12px");
    expect(resolveSize("3rem")).toBe("3rem");
  });
});

describe("mergeStyle", () => {
  it("merges string and object styles with additions", () => {
    expect(mergeStyle("color: red", { gap: "1px" })).toBe("color: red; gap: 1px");
    expect(mergeStyle({ marginTop: "2px" } as never, { gap: undefined })).toBe("margin-top: 2px");
    expect(mergeStyle(undefined, {})).toBeUndefined();
  });

  it("keeps custom property names as written", () => {
    expect(mergeStyle(undefined, { "--bx-gridMin": "1rem" })).toBe("--bx-gridMin: 1rem");
  });
});

describe("createControllableSignal", () => {
  it("keeps its own state when uncontrolled and resets to the default", () => {
    createRoot(dispose => {
      const state = createControllableSignal({ value: () => undefined, defaultValue: () => "a" });
      state.setValue("b");
      expect(state.value()).toBe("b");
      state.reset();
      expect(state.value()).toBe("a");
      dispose();
    });
  });

  it("follows the parent when controlled", () => {
    createRoot(dispose => {
      const [value, setValue] = createSignal<string | undefined>("x");
      const state = createControllableSignal({ value, defaultValue: () => "a" });
      state.setValue("ignored");
      expect(state.value()).toBe("x");
      setValue("y");
      expect(state.value()).toBe("y");
      dispose();
    });
  });
});
