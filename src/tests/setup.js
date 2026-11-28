import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";

import { IDBFactory } from "fake-indexeddb";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

beforeEach(() => {
  window.indexedDB = new IDBFactory();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});