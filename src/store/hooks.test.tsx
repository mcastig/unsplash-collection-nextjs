import React from "react";
import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "./index";
import { useAppDispatch, useAppSelector } from "./hooks";

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(Provider, { store }, children);

describe("store hooks", () => {
  it("useAppDispatch returns a dispatch function", () => {
    const { result } = renderHook(() => useAppDispatch(), { wrapper });
    expect(typeof result.current).toBe("function");
  });

  it("useAppSelector reads from state", () => {
    const { result } = renderHook(
      () => useAppSelector((s) => s.search.query),
      { wrapper },
    );
    expect(result.current).toBe("");
  });
});
