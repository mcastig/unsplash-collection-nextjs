import { store } from "./index";
import type { RootState, AppDispatch } from "./index";

describe("store", () => {
  it("has search, collections, and image slices in state", () => {
    const state: RootState = store.getState();
    expect(state).toHaveProperty("search");
    expect(state).toHaveProperty("collections");
    expect(state).toHaveProperty("image");
  });

  it("exposes a dispatch function", () => {
    const dispatch: AppDispatch = store.dispatch;
    expect(typeof dispatch).toBe("function");
  });
});
