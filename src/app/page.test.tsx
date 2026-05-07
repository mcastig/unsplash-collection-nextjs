import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("@/store/hooks", () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock("@/store/searchSlice", () => ({
  setQuery: jest.fn((q: string) => ({ type: "search/setQuery", payload: q })),
  searchPhotos: jest.fn((args: object) => ({
    type: "search/searchPhotos",
    meta: { arg: args },
  })),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: () => "/",
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import HomePage from "./page";

const mockDispatch = jest.fn();
const mockPush = jest.fn();

describe("HomePage", () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockPush.mockClear();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) => sel({ search: { query: "" } }),
    );
  });

  it("renders the search heading", () => {
    render(<HomePage />);
    expect(screen.getByText("Search")).toBeInTheDocument();
  });

  it("renders the search subtitle", () => {
    render(<HomePage />);
    expect(
      screen.getByText(/Search high-resolution images from Unsplash/i),
    ).toBeInTheDocument();
  });

  it("renders the search input", () => {
    render(<HomePage />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("does not dispatch when search query is empty (empty trim guard)", () => {
    // localQuery starts as "" (from mocked query in store)
    render(<HomePage />);
    // Press Enter on an empty input — SearchInput won't fire onSubmit,
    // but we can verify by typing whitespace which also guards the call
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("dispatches and navigates when search query is non-empty", () => {
    render(<HomePage />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "mountains" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockDispatch).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("mountains"),
    );
  });

  it("initialises localQuery from redux store query", () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel({ search: { query: "preset-query" } }),
    );
    render(<HomePage />);
    expect(
      (screen.getByRole("textbox") as HTMLInputElement).value,
    ).toBe("preset-query");
  });
});
