import React from "react";

jest.mock("@/store/StoreProvider", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock("@/components/Header/Header", () => ({
  default: () => <div data-testid="mock-header" />,
}));

import RootLayout, { metadata } from "./layout";

describe("RootLayout", () => {
  it("exports correct metadata title", () => {
    expect(metadata.title).toBe("UnsplashBox");
  });

  it("exports a non-empty metadata description", () => {
    expect(typeof metadata.description).toBe("string");
    expect((metadata.description as string).length).toBeGreaterThan(0);
  });

  it("exports metadata with icons", () => {
    expect(metadata.icons).toBeDefined();
  });

  it("renders an html element wrapping children", () => {
    const element = RootLayout({
      children: React.createElement("div", null, "page content"),
    });
    expect(element).toBeTruthy();
    expect(element.type).toBe("html");
    expect(element.props.lang).toBe("en");
  });
});
