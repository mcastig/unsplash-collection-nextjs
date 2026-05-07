import { render, screen, fireEvent } from "@testing-library/react";
import AddToCollectionModal from "./AddToCollectionModal";
import { Collection } from "@/types";

const collections: Collection[] = [
  {
    id: 1,
    name: "Nature",
    created_at: "2024-01-01",
    image_count: 3,
    cover_image: null,
  },
  {
    id: 2,
    name: "Urban",
    created_at: "2024-01-02",
    image_count: 1,
    cover_image: null,
  },
  {
    id: 3,
    name: "Travel",
    created_at: "2024-01-03",
    image_count: 5,
    cover_image: null,
  },
];

const baseProps = {
  collections,
  alreadyInCollectionIds: [],
  onAdd: jest.fn(),
  onCreateNew: jest.fn(),
  onClose: jest.fn(),
};

describe("AddToCollectionModal", () => {
  it("renders all collections when no query", () => {
    render(<AddToCollectionModal {...baseProps} />);
    expect(screen.getByText("Nature")).toBeInTheDocument();
    expect(screen.getByText("Urban")).toBeInTheDocument();
    expect(screen.getByText("Travel")).toBeInTheDocument();
  });

  it("filters out already-added collections", () => {
    render(
      <AddToCollectionModal {...baseProps} alreadyInCollectionIds={[1]} />,
    );
    expect(screen.queryByText("Nature")).not.toBeInTheDocument();
    expect(screen.getByText("Urban")).toBeInTheDocument();
  });

  it("filters by search query", () => {
    render(<AddToCollectionModal {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText("Search collections..."), {
      target: { value: "urb" },
    });
    expect(screen.queryByText("Nature")).not.toBeInTheDocument();
    expect(screen.getByText("Urban")).toBeInTheDocument();
  });

  it("shows match count when searching", () => {
    render(<AddToCollectionModal {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText("Search collections..."), {
      target: { value: "a" },
    });
    expect(screen.getByText(/match/i)).toBeInTheDocument();
  });

  it("shows empty state when no matches", () => {
    render(<AddToCollectionModal {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText("Search collections..."), {
      target: { value: "zzz" },
    });
    expect(screen.getByText(/no collections match/i)).toBeInTheDocument();
  });

  it("calls onAdd with collection id when Add button clicked", () => {
    const onAdd = jest.fn();
    render(<AddToCollectionModal {...baseProps} onAdd={onAdd} />);
    fireEvent.click(screen.getAllByText("Add to Collection")[0]);
    expect(onAdd).toHaveBeenCalledWith(expect.any(Number));
  });

  it("calls onCreateNew when New Collection is clicked", () => {
    const onCreateNew = jest.fn();
    render(<AddToCollectionModal {...baseProps} onCreateNew={onCreateNew} />);
    fireEvent.click(screen.getByText("New Collection"));
    expect(onCreateNew).toHaveBeenCalled();
  });

  it("calls onClose when backdrop is clicked", () => {
    const onClose = jest.fn();
    const { container } = render(
      <AddToCollectionModal {...baseProps} onClose={onClose} />,
    );
    fireEvent.click(container.firstChild as Element);
    expect(onClose).toHaveBeenCalled();
  });

  it("shows 'No available collections' when no query and all filtered out", () => {
    render(
      <AddToCollectionModal
        {...baseProps}
        alreadyInCollectionIds={[1, 2, 3]}
      />,
    );
    expect(screen.getByText("No available collections")).toBeInTheDocument();
  });

  it("renders cover image using image_thumb_url when available", () => {
    const colWithThumb = {
      ...collections[0],
      cover_image: {
        id: 1,
        collection_id: 1,
        image_id: "img1",
        image_url: "/full.jpg",
        image_thumb_url: "/thumb.jpg",
        image_small_url: "/small.jpg",
        photographer_name: "X",
        photographer_username: "x",
        photographer_avatar: "",
        published_at: null,
        created_at: "",
      },
    };
    render(
      <AddToCollectionModal
        {...baseProps}
        collections={[colWithThumb]}
      />,
    );
    const img = screen.getByRole("img", { hidden: true });
    expect(img).toHaveAttribute("src", "/thumb.jpg");
  });

  it("renders cover image using image_url when image_thumb_url is empty", () => {
    const colWithUrlOnly = {
      ...collections[0],
      cover_image: {
        id: 1,
        collection_id: 1,
        image_id: "img1",
        image_url: "/full.jpg",
        image_thumb_url: "",
        image_small_url: "/small.jpg",
        photographer_name: "X",
        photographer_username: "x",
        photographer_avatar: "",
        published_at: null,
        created_at: "",
      },
    };
    render(
      <AddToCollectionModal
        {...baseProps}
        collections={[colWithUrlOnly]}
      />,
    );
    const img = screen.getByRole("img", { hidden: true });
    expect(img).toHaveAttribute("src", "/full.jpg");
  });

  it("shows singular 'match' when exactly one result", () => {
    render(<AddToCollectionModal {...baseProps} />);
    fireEvent.change(screen.getByPlaceholderText("Search collections..."), {
      target: { value: "nat" },
    });
    expect(screen.getByText("1 match")).toBeInTheDocument();
  });

  it("shows '0 photos' when image_count is undefined on a collection", () => {
    const colNoCount = { ...collections[0], image_count: undefined };
    render(
      <AddToCollectionModal
        {...baseProps}
        collections={[colNoCount]}
      />,
    );
    expect(screen.getByText("0 photos")).toBeInTheDocument();
  });
});
