import "@testing-library/jest-dom/vitest";

import { cleanup } from "@solidjs/testing-library";

import { afterEach } from "vitest";

afterEach(cleanup);

// jsdom has no layout APIs; the components only need them to exist.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;

if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false
    }) as MediaQueryList;
}

if (typeof Element !== "undefined") Element.prototype.scrollIntoView ??= () => {};

// jsdom lays nothing out, so every box is 0×0 and FloatingPanel would treat its target as hidden.
if (typeof Element !== "undefined") {
  Element.prototype.getBoundingClientRect = function () {
    return {
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 100,
      bottom: 20,
      width: 100,
      height: 20
    } as DOMRect;
  };
}
