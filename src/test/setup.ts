import "@testing-library/jest-dom";

// Setup runs for every test, including ones marked
// `// @vitest-environment node` (api/*.test.ts). Guard the jsdom-specific
// polyfills so they no-op cleanly outside the browser environment.
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  });

  // jsdom doesn't ship ResizeObserver; Radix's Slider uses it internally.
  class ResizeObserverPolyfill {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as unknown as { ResizeObserver: typeof ResizeObserverPolyfill }).ResizeObserver =
    ResizeObserverPolyfill;
}
