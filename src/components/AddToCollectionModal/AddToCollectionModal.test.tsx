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
});
