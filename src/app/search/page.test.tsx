import { render, screen, fireEvent, act } from "@testing-library/react";

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
  useSearchParams: jest.fn(),
  usePathname: () => "/search",
  useParams: () => ({}),
}));

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import SearchPage from "./page";

const mockDispatch = jest.fn();
const mockPush = jest.fn();

const makeSearchState = (overrides = {}) => ({
  results: [],
  loading: false,
  error: null,
  query: "",
  ...overrides,
});

describe("SearchPage", () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockPush.mockClear();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel({ search: makeSearchState() }),
    );
  });

  it("renders the search input", async () => {
    await act(async () => {
      render(<SearchPage />);
    });
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("shows loading spinner when loading=true", async () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel({ search: makeSearchState({ loading: true }) }),
    );
    const { container } = render(<SearchPage />);
    expect(container.querySelector('[class*="spinner"]')).toBeInTheDocument();
  });

  it("shows error message when error is set", async () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel({ search: makeSearchState({ error: "Search failed" }) }),
    );
    await act(async () => {
      render(<SearchPage />);
    });
    expect(screen.getByText("Search failed")).toBeInTheDocument();
  });

  it("shows ImageGrid when there are results", async () => {
    const results = [
      {
        id: "img1",
        created_at: "2024-01-01",
        width: 100,
        height: 100,
        description: null,
        alt_description: "photo",
        urls: { raw: "", full: "", regular: "", small: "/s.jpg", thumb: "" },
        links: { html: "", download: "", download_location: "" },
        user: {
          id: "u1",
          name: "Alice",
          username: "alice",
          profile_image: { small: "", medium: "", large: "" },
          links: { html: "" },
        },
      },
    ];
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel({ search: makeSearchState({ results, loading: false }) }),
    );
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<SearchPage />));
    });
    expect(container.querySelectorAll("img").length).toBeGreaterThan(0);
  });

  it("shows empty message when no results and query exists", async () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel({
          search: makeSearchState({
            results: [],
            loading: false,
            error: null,
            query: "zebra",
          }),
        }),
    );
    await act(async () => {
      render(<SearchPage />);
    });
    expect(screen.getByText(/No results found for/i)).toBeInTheDocument();
  });

  it("dispatches search when effect sees new q param (q !== query)", async () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("q=nature"),
    );
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel({ search: makeSearchState({ query: "" }) }),
    );
    await act(async () => {
      render(<SearchPage />);
    });
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("dispatches search when q equals query but no results yet", async () => {
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("q=nature"),
    );
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel({
          search: makeSearchState({ query: "nature", results: [] }),
        }),
    );
    await act(async () => {
      render(<SearchPage />);
    });
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("does not dispatch when search input is empty (trim guard)", async () => {
    await act(async () => {
      render(<SearchPage />);
    });
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "  " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("dispatches and navigates on non-empty search submit", async () => {
    await act(async () => {
      render(<SearchPage />);
    });
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "sunset" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockDispatch).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("sunset"));
  });
});
