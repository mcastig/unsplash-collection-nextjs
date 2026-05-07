import { render, screen, act } from "@testing-library/react";

jest.mock("@/store/hooks", () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock("@/store/collectionsSlice", () => ({
  fetchCollectionById: jest.fn((id: number) => ({
    type: "collections/fetchById",
    payload: id,
  })),
  fetchCollectionImages: jest.fn((id: number) => ({
    type: "collections/fetchImages",
    payload: id,
  })),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/collections/5",
  useParams: jest.fn(() => ({ id: "5" })),
  useSearchParams: () => new URLSearchParams(),
}));

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import CollectionDetailPage from "./page";
import { CollectionImage, Collection } from "@/types";

const mockDispatch = jest.fn();

const makeImage = (overrides: Partial<CollectionImage> = {}): CollectionImage => ({
  id: 1,
  collection_id: 5,
  image_id: "img1",
  image_url: "/full.jpg",
  image_thumb_url: "/thumb.jpg",
  image_small_url: "/small.jpg",
  photographer_name: "Alice",
  photographer_username: "alice",
  photographer_avatar: "/avatar.jpg",
  published_at: null,
  created_at: "2024-01-01",
  ...overrides,
});

const mockCollection: Collection = {
  id: 5,
  name: "Test Collection",
  created_at: "2024-01-01",
  image_count: 2,
};

describe("CollectionDetailPage", () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  it("renders loading spinner when imagesLoading=true", () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel({
          collections: {
            selectedCollection: null,
            collectionImages: [],
            imagesLoading: true,
          },
        }),
    );
    const { container } = render(<CollectionDetailPage />);
    expect(container.querySelector('[class*="spinner"]')).toBeInTheDocument();
  });

  it("renders empty state when no images and not loading", () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel({
          collections: {
            selectedCollection: null,
            collectionImages: [],
            imagesLoading: false,
          },
        }),
    );
    render(<CollectionDetailPage />);
    expect(screen.getByText("This collection is empty.")).toBeInTheDocument();
    expect(screen.getByText("Browse images to add")).toBeInTheDocument();
  });

  it("renders collection name and image count when selectedCollection is set", () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel({
          collections: {
            selectedCollection: mockCollection,
            collectionImages: [],
            imagesLoading: false,
          },
        }),
    );
    render(<CollectionDetailPage />);
    expect(screen.getByText("Test Collection")).toBeInTheDocument();
    expect(screen.getByText("2 photos")).toBeInTheDocument();
  });

  it("renders collection images grid", () => {
    const images = [makeImage(), makeImage({ id: 2, image_id: "img2" })];
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel({
          collections: {
            selectedCollection: mockCollection,
            collectionImages: images,
            imagesLoading: false,
          },
        }),
    );
    render(<CollectionDetailPage />);
    expect(screen.getAllByRole("img")).toHaveLength(2);
  });

  it("uses image_url when image_small_url is empty", () => {
    const images = [makeImage({ image_small_url: "" })];
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel({
          collections: {
            selectedCollection: mockCollection,
            collectionImages: images,
            imagesLoading: false,
          },
        }),
    );
    render(<CollectionDetailPage />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/full.jpg");
  });

  it("renders empty alt when photographer_name is empty", () => {
    const images = [makeImage({ photographer_name: "" })];
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel({
          collections: {
            selectedCollection: mockCollection,
            collectionImages: images,
            imagesLoading: false,
          },
        }),
    );
    const { container } = render(<CollectionDetailPage />);
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("alt", "");
  });

  it("renders '0 photos' when selectedCollection.image_count is undefined", () => {
    const collNoCount = { ...mockCollection, image_count: undefined };
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel({
          collections: {
            selectedCollection: collNoCount,
            collectionImages: [],
            imagesLoading: false,
          },
        }),
    );
    render(<CollectionDetailPage />);
    expect(screen.getByText("0 photos")).toBeInTheDocument();
  });

  it("dispatches fetchCollectionById and fetchCollectionImages on mount", async () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel({
          collections: {
            selectedCollection: null,
            collectionImages: [],
            imagesLoading: false,
          },
        }),
    );
    await act(async () => {
      render(<CollectionDetailPage />);
    });
    expect(mockDispatch).toHaveBeenCalledTimes(2);
  });
});
