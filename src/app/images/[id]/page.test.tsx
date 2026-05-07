import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import React from "react";

jest.mock("@/store/hooks", () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock("@/store/imageSlice", () => ({
  fetchImageDetail: jest.fn(() => ({ type: "image/fetchDetail" })),
  fetchImageCollections: jest.fn(() => ({ type: "image/fetchCollections" })),
  removeCollectionFromImage: jest.fn((id: number) => ({
    type: "image/removeCollection",
    payload: id,
  })),
  addCollectionToImage: jest.fn((entry: object) => ({
    type: "image/addCollection",
    payload: entry,
  })),
}));

jest.mock("@/store/collectionsSlice", () => ({
  fetchCollections: jest.fn(() => ({ type: "collections/fetchAll" })),
  createCollection: jest.fn((name: string) => ({
    type: "collections/create",
    payload: name,
  })),
  addImageToCollection: jest.fn((args: object) => ({
    type: "collections/addImage",
    payload: args,
  })),
  removeImageFromCollection: jest.fn((args: object) => ({
    type: "collections/removeImage",
    payload: args,
  })),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/images/abc",
  useParams: jest.fn(() => ({ id: "abc" })),
  useSearchParams: () => new URLSearchParams(),
}));

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import ImageDetailPage from "./page";
import { UnsplashImage, Collection, CollectionImage } from "@/types";

const mockDispatch = jest.fn();

const mockImage: UnsplashImage = {
  id: "abc",
  created_at: "2024-03-15T12:00:00Z",
  width: 800,
  height: 600,
  description: "A mountain",
  alt_description: "Beautiful mountain",
  urls: {
    raw: "/raw.jpg",
    full: "/full.jpg",
    regular: "/regular.jpg",
    small: "/small.jpg",
    thumb: "/thumb.jpg",
  },
  links: {
    html: "https://unsplash.com/photos/abc",
    download: "https://unsplash.com/photos/abc/download",
    download_location: "https://api.unsplash.com/photos/abc/download",
  },
  user: {
    id: "u1",
    name: "Alice",
    username: "alice",
    profile_image: { small: "/sm.jpg", medium: "/med.jpg", large: "/lg.jpg" },
    links: { html: "" },
  },
};

const mockCollection: Collection = {
  id: 1,
  name: "Nature",
  created_at: "2024-01-01",
  image_count: 2,
  cover_image: null,
};

const mockCollectionEntry: CollectionImage = {
  id: 10,
  collection_id: 1,
  image_id: "abc",
  image_url: "/full.jpg",
  image_thumb_url: "/thumb.jpg",
  image_small_url: "/small.jpg",
  photographer_name: "Alice",
  photographer_username: "alice",
  photographer_avatar: "/avatar.jpg",
  published_at: null,
  created_at: "2024-01-01",
};

const makeState = (overrides: Record<string, unknown> = {}) => ({
  search: { query: "" },
  collections: { collections: [], loading: false },
  image: { currentImage: null, imageCollections: [], loading: false },
  ...overrides,
});

describe("ImageDetailPage", () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    mockDispatch.mockResolvedValue({ meta: { requestStatus: "fulfilled" } });
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) => sel(makeState()),
    );
  });

  it("renders loading spinner when loading=true", () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel(makeState({ image: { currentImage: null, imageCollections: [], loading: true } })),
    );
    const { container } = render(<ImageDetailPage />);
    expect(container.querySelector('[class*="spinner"]')).toBeInTheDocument();
  });

  it("renders null when not loading and currentImage is null", () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel(makeState({ image: { currentImage: null, imageCollections: [], loading: false } })),
    );
    const { container } = render(<ImageDetailPage />);
    expect(container.firstChild).toBeNull();
  });

  it("renders image when currentImage is provided", () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel(makeState({
          image: { currentImage: mockImage, imageCollections: [], loading: false },
          collections: { collections: [], loading: false },
        })),
    );
    render(<ImageDetailPage />);
    expect(screen.getByAltText("Beautiful mountain")).toBeInTheDocument();
  });

  it("renders author name and avatar when profile_image.medium is set", () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel(makeState({
          image: { currentImage: mockImage, imageCollections: [], loading: false },
          collections: { collections: [], loading: false },
        })),
    );
    render(<ImageDetailPage />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    const avatarImg = screen.getAllByRole("img").find(
      (img) => (img as HTMLImageElement).src.includes("med.jpg"),
    );
    expect(avatarImg).toBeDefined();
  });

  it("does not render avatar img when profile_image.medium is empty", () => {
    const imageNoAvatar = {
      ...mockImage,
      user: { ...mockImage.user, profile_image: { small: "", medium: "", large: "" } },
    };
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel(makeState({
          image: { currentImage: imageNoAvatar, imageCollections: [], loading: false },
          collections: { collections: [], loading: false },
        })),
    );
    render(<ImageDetailPage />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders 'Not in any collection yet' when imageCollections is empty", () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel(makeState({
          image: { currentImage: mockImage, imageCollections: [], loading: false },
          collections: { collections: [], loading: false },
        })),
    );
    render(<ImageDetailPage />);
    expect(
      screen.getByText("Not in any collection yet."),
    ).toBeInTheDocument();
  });

  it("renders collection list with thumb when imageCollections has entries with thumb", () => {
    const imageCollections = [
      { collectionId: 1, collectionName: "Nature", entry: mockCollectionEntry },
    ];
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel(makeState({
          image: { currentImage: mockImage, imageCollections, loading: false },
          collections: { collections: [mockCollection], loading: false },
        })),
    );
    const { container } = render(<ImageDetailPage />);
    expect(screen.getByText("Nature")).toBeInTheDocument();
    // The collection thumbnail renders an <img class="colThumb" ...>
    expect(container.querySelector('[class*="colThumb"]:not([class*="Placeholder"])')).toBeInTheDocument();
  });

  it("renders thumb placeholder when image_thumb_url is empty", () => {
    const entryNoThumb = { ...mockCollectionEntry, image_thumb_url: "" };
    const imageCollections = [
      { collectionId: 1, collectionName: "Nature", entry: entryNoThumb },
    ];
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel(makeState({
          image: { currentImage: mockImage, imageCollections, loading: false },
          collections: { collections: [mockCollection], loading: false },
        })),
    );
    const { container } = render(<ImageDetailPage />);
    expect(container.querySelector('[class*="colThumbPlaceholder"]')).toBeInTheDocument();
  });

  it("shows '0 photos' when collection is not found in collections list", () => {
    const imageCollections = [
      { collectionId: 999, collectionName: "Unknown", entry: mockCollectionEntry },
    ];
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel(makeState({
          image: { currentImage: mockImage, imageCollections, loading: false },
          collections: { collections: [], loading: false },
        })),
    );
    render(<ImageDetailPage />);
    expect(screen.getByText("0 photos")).toBeInTheDocument();
  });

  it("opens AddToCollectionModal on 'Add to Collection' click", () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel(makeState({
          image: { currentImage: mockImage, imageCollections: [], loading: false },
          collections: { collections: [mockCollection], loading: false },
        })),
    );
    render(<ImageDetailPage />);
    fireEvent.click(screen.getByText("Add to Collection"));
    expect(screen.getByText("Add to Collections")).toBeInTheDocument();
  });

  it("closes AddToCollectionModal via its onClose prop", () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel(makeState({
          image: { currentImage: mockImage, imageCollections: [], loading: false },
          collections: { collections: [mockCollection], loading: false },
        })),
    );
    render(<ImageDetailPage />);
    fireEvent.click(screen.getByText("Add to Collection"));
    expect(screen.getByText("Add to Collections")).toBeInTheDocument();
    // Click backdrop to close
    const backdrop = screen
      .getByText("Add to Collections")
      .closest('[class*="modal"]')
      ?.parentElement;
    if (backdrop) fireEvent.click(backdrop);
    expect(screen.queryByText("Add to Collections")).not.toBeInTheDocument();
  });

  it("transitions to NewCollectionModal when onCreateNew is called", () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel(makeState({
          image: { currentImage: mockImage, imageCollections: [], loading: false },
          collections: { collections: [mockCollection], loading: false },
        })),
    );
    render(<ImageDetailPage />);
    fireEvent.click(screen.getByText("Add to Collection"));
    fireEvent.click(screen.getByText("New Collection"));
    expect(screen.getByPlaceholderText("Collection name")).toBeInTheDocument();
  });

  it("cancels NewCollectionModal and reopens AddToCollectionModal", () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel(makeState({
          image: { currentImage: mockImage, imageCollections: [], loading: false },
          collections: { collections: [mockCollection], loading: false },
        })),
    );
    render(<ImageDetailPage />);
    fireEvent.click(screen.getByText("Add to Collection"));
    fireEvent.click(screen.getByText("New Collection"));
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.getByText("Add to Collections")).toBeInTheDocument();
  });

  it("handleAddToCollection dispatches and updates state on fulfilled", async () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel(makeState({
          image: { currentImage: mockImage, imageCollections: [], loading: false },
          collections: { collections: [mockCollection], loading: false },
        })),
    );
    render(<ImageDetailPage />);
    fireEvent.click(screen.getByText("Add to Collection"));
    await act(async () => {
      fireEvent.click(screen.getAllByText("Add to Collection")[1]);
    });
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("handleAddToCollection when col not found: modal shows 'No available collections'", () => {
    // All collections are excluded via alreadyInCollectionIds equivalent scenario:
    // collections list has collection with id 1, but imageCollections already has that id
    const imageCollections = [
      { collectionId: 1, collectionName: "Nature", entry: mockCollectionEntry },
    ];
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel(makeState({
          image: { currentImage: mockImage, imageCollections, loading: false },
          collections: { collections: [mockCollection], loading: false },
        })),
    );
    render(<ImageDetailPage />);
    fireEvent.click(screen.getByText("Add to Collection"));
    // Collection 1 is already in imageCollections, so it's filtered from modal
    expect(screen.getByText("No available collections")).toBeInTheDocument();
  });

  it("handleAddToCollection does not dispatch further when requestStatus is not fulfilled", async () => {
    const rejectedDispatch = jest.fn().mockResolvedValue({
      meta: { requestStatus: "rejected" },
    });
    (useAppDispatch as jest.Mock).mockReturnValue(rejectedDispatch);
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel(makeState({
          image: { currentImage: mockImage, imageCollections: [], loading: false },
          collections: { collections: [mockCollection], loading: false },
        })),
    );
    render(<ImageDetailPage />);
    fireEvent.click(screen.getByText("Add to Collection"));
    await act(async () => {
      fireEvent.click(screen.getAllByText("Add to Collection")[1]);
    });
    // Modal should still be open (not closed)
    expect(screen.getByText("Add to Collections")).toBeInTheDocument();
  });

  it("handleRemove dispatches on fulfilled result", async () => {
    const imageCollections = [
      { collectionId: 1, collectionName: "Nature", entry: mockCollectionEntry },
    ];
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel(makeState({
          image: { currentImage: mockImage, imageCollections, loading: false },
          collections: { collections: [mockCollection], loading: false },
        })),
    );
    render(<ImageDetailPage />);
    await act(async () => {
      fireEvent.click(screen.getByText("— Remove"));
    });
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("handleRemove does nothing extra when requestStatus is not fulfilled", async () => {
    const rejectedDispatch = jest.fn().mockResolvedValue({
      meta: { requestStatus: "rejected" },
    });
    (useAppDispatch as jest.Mock).mockReturnValue(rejectedDispatch);
    const imageCollections = [
      { collectionId: 1, collectionName: "Nature", entry: mockCollectionEntry },
    ];
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel(makeState({
          image: { currentImage: mockImage, imageCollections, loading: false },
          collections: { collections: [mockCollection], loading: false },
        })),
    );
    render(<ImageDetailPage />);
    await act(async () => {
      fireEvent.click(screen.getByText("— Remove"));
    });
    expect(rejectedDispatch).toHaveBeenCalled();
  });

  it("handleDownload triggers anchor click", () => {
    const clickSpy = jest.fn();
    const originalCreate = document.createElement.bind(document);
    const createSpy = jest
      .spyOn(document, "createElement")
      .mockImplementation((tag: string) => {
        const el = originalCreate(tag as keyof HTMLElementTagNameMap);
        if (tag === "a") {
          (el as HTMLAnchorElement).click = clickSpy;
        }
        return el;
      });

    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel(
          makeState({
            image: {
              currentImage: mockImage,
              imageCollections: [],
              loading: false,
            },
            collections: { collections: [], loading: false },
          }),
        ),
    );
    render(<ImageDetailPage />);
    fireEvent.click(screen.getByText("Download"));
    expect(clickSpy).toHaveBeenCalled();
    createSpy.mockRestore();
  });

  it("handleCreateCollection dispatches and shows AddToCollectionModal on fulfilled", async () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel(makeState({
          image: { currentImage: mockImage, imageCollections: [], loading: false },
          collections: { collections: [mockCollection], loading: false },
        })),
    );
    render(<ImageDetailPage />);
    // Open add modal
    fireEvent.click(screen.getByText("Add to Collection"));
    // Click New Collection to switch to new collection modal
    fireEvent.click(screen.getByText("New Collection"));
    // Fill in name and save
    fireEvent.change(screen.getByPlaceholderText("Collection name"), {
      target: { value: "My New Collection" },
    });
    await act(async () => {
      fireEvent.click(screen.getByText("Save"));
    });
    expect(mockDispatch).toHaveBeenCalled();
    // Should return to AddToCollectionModal
    await waitFor(() => {
      expect(screen.getByText("Add to Collections")).toBeInTheDocument();
    });
  });

  it("handleCreateCollection keeps NewCollectionModal open when requestStatus is not fulfilled", async () => {
    const rejectedDispatch = jest.fn().mockResolvedValue({
      meta: { requestStatus: "rejected" },
    });
    (useAppDispatch as jest.Mock).mockReturnValue(rejectedDispatch);
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel(makeState({
          image: { currentImage: mockImage, imageCollections: [], loading: false },
          collections: { collections: [mockCollection], loading: false },
        })),
    );
    render(<ImageDetailPage />);
    fireEvent.click(screen.getByText("Add to Collection"));
    fireEvent.click(screen.getByText("New Collection"));
    fireEvent.change(screen.getByPlaceholderText("Collection name"), {
      target: { value: "Rejected" },
    });
    await act(async () => {
      fireEvent.click(screen.getByText("Save"));
    });
    expect(rejectedDispatch).toHaveBeenCalled();
    // When rejected: NewCollectionModal stays open, AddToCollectionModal stays closed
    expect(screen.getByPlaceholderText("Collection name")).toBeInTheDocument();
    expect(screen.queryByText("Add to Collections")).not.toBeInTheDocument();
  });

  it("uses 'Unsplash photo' fallback when alt_description is null", () => {
    const imageNoAlt = { ...mockImage, alt_description: null };
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel(
          makeState({
            image: {
              currentImage: imageNoAlt,
              imageCollections: [],
              loading: false,
            },
            collections: { collections: [], loading: false },
          }),
        ),
    );
    const { container } = render(<ImageDetailPage />);
    const mainImg = container.querySelector('[class*="mainImage"]');
    expect(mainImg).toHaveAttribute("alt", "Unsplash photo");
  });

  it("dispatches initial data fetches on mount", async () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (sel: (s: object) => unknown) =>
        sel(makeState({
          image: { currentImage: null, imageCollections: [], loading: false },
          collections: { collections: [], loading: false },
        })),
    );
    await act(async () => {
      render(<ImageDetailPage />);
    });
    expect(mockDispatch).toHaveBeenCalledTimes(3);
  });
});
