import { render, screen, fireEvent } from "@testing-library/react";
import CollectionCard from "./CollectionCard";
import { Collection } from "@/types";

const col: Collection = {
  id: 7,
  name: "Urban",
  created_at: "2024-01-01",
  image_count: 4,
  cover_image: null,
};

const colWithCover: Collection = {
  ...col,
  cover_image: {
    id: 1,
    collection_id: 7,
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

describe("CollectionCard", () => {
  it("renders collection name and photo count", () => {
    render(<CollectionCard collection={col} />);
    expect(screen.getByText("Urban")).toBeInTheDocument();
    expect(screen.getByText("4 photos")).toBeInTheDocument();
  });

  it("links to the collection detail page", () => {
    render(<CollectionCard collection={col} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/collections/7");
  });

  it("shows placeholder when no cover image", () => {
    const { container } = render(<CollectionCard collection={col} />);
    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  it("renders cover image when provided", () => {
    render(<CollectionCard collection={colWithCover} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/full.jpg");
  });

  it("does not render delete button when onDelete is not provided", () => {
    render(<CollectionCard collection={col} />);
    expect(screen.queryByLabelText(/delete/i)).not.toBeInTheDocument();
  });

  it("calls onDelete with collection id when delete button clicked", () => {
    const onDelete = jest.fn();
    render(<CollectionCard collection={col} onDelete={onDelete} />);
    fireEvent.click(screen.getByLabelText("Delete Urban"));
    expect(onDelete).toHaveBeenCalledWith(7);
  });

  it("uses image_small_url as cover when image_url is falsy", () => {
    const colSmallOnly: Collection = {
      ...col,
      cover_image: {
        id: 1,
        collection_id: 7,
        image_id: "img1",
        image_url: "",
        image_thumb_url: "/thumb.jpg",
        image_small_url: "/small.jpg",
        photographer_name: "X",
        photographer_username: "x",
        photographer_avatar: "",
        published_at: null,
        created_at: "",
      },
    };
    render(<CollectionCard collection={colSmallOnly} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/small.jpg");
  });

  it("shows '0 photos' when image_count is undefined", () => {
    const colNoCount: Collection = { ...col, image_count: undefined };
    render(<CollectionCard collection={colNoCount} />);
    expect(screen.getByText("0 photos")).toBeInTheDocument();
  });
});
