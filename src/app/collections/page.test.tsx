import { render, screen, fireEvent, act } from "@testing-library/react";

jest.mock("@/store/hooks", () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock("@/store/collectionsSlice", () => ({
  fetchCollections: jest.fn(() => ({ type: "collections/fetchAll" })),
  createCollection: jest.fn((name: string) => ({
    type: "collections/create",
    payload: { id: 99, name, created_at: "", image_count: 0, cover_image: null },
  })),
  deleteCollection: jest.fn((id: number) => ({
    type: "collections/delete",
    payload: id,
  })),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/collections",
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import CollectionsPage from "./page";
import { Collection } from "@/types";

const mockDispatch = jest.fn();

const col: Collection = {
  id: 1,
  name: "Nature",
  created_at: "2024-01-01",
  image_count: 3,
  cover_image: null,
};

describe("CollectionsPage", () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    mockDispatch.mockResolvedValue({ meta: { requestStatus: "fulfilled" } });
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  it("renders loading spinner when loading=true", () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel({ collections: { collections: [], loading: true } }),
    );
    const { container } = render(<CollectionsPage />);
    expect(container.querySelector('[class*="spinner"]')).toBeInTheDocument();
  });

  it("renders empty state when no collections and not loading", () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel({ collections: { collections: [], loading: false } }),
    );
    render(<CollectionsPage />);
    expect(screen.getByText(/No collections yet/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Create your first collection/i),
    ).toBeInTheDocument();
  });

  it("renders collection cards when collections exist", () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel({ collections: { collections: [col], loading: false } }),
    );
    render(<CollectionsPage />);
    expect(screen.getByText("Nature")).toBeInTheDocument();
  });

  it("dispatches fetchCollections on mount", () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel({ collections: { collections: [], loading: false } }),
    );
    render(<CollectionsPage />);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("opens NewCollectionModal when New Collection button clicked", () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel({ collections: { collections: [], loading: false } }),
    );
    render(<CollectionsPage />);
    fireEvent.click(screen.getByText("New Collection"));
    expect(screen.getByPlaceholderText("Collection name")).toBeInTheDocument();
  });

  it("opens NewCollectionModal from the empty-state button", () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel({ collections: { collections: [], loading: false } }),
    );
    render(<CollectionsPage />);
    fireEvent.click(screen.getByText("Create your first collection"));
    expect(screen.getByPlaceholderText("Collection name")).toBeInTheDocument();
  });

  it("closes modal and dispatches createCollection on save", async () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel({ collections: { collections: [], loading: false } }),
    );
    render(<CollectionsPage />);
    fireEvent.click(screen.getByText("New Collection"));
    fireEvent.change(screen.getByPlaceholderText("Collection name"), {
      target: { value: "Sunsets" },
    });
    await act(async () => {
      fireEvent.click(screen.getByText("Save"));
    });
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("closes modal when Cancel clicked", () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel({ collections: { collections: [], loading: false } }),
    );
    render(<CollectionsPage />);
    fireEvent.click(screen.getByText("New Collection"));
    fireEvent.click(screen.getByText("Cancel"));
    expect(
      screen.queryByPlaceholderText("Collection name"),
    ).not.toBeInTheDocument();
  });

  it("dispatches deleteCollection when trash icon clicked", () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel({ collections: { collections: [col], loading: false } }),
    );
    render(<CollectionsPage />);
    fireEvent.click(screen.getByLabelText("Delete Nature"));
    expect(mockDispatch).toHaveBeenCalled();
  });
});
