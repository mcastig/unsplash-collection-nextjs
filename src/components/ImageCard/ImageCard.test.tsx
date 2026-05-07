import { render, screen } from "@testing-library/react";
import ImageCard from "./ImageCard";
import { UnsplashImage } from "@/types";

const img: UnsplashImage = {
  id: "abc123",
  created_at: "2024-01-01",
  width: 800,
  height: 600,
  description: null,
  alt_description: "mountain lake",
  urls: {
    raw: "",
    full: "",
    regular: "",
    small: "/small.jpg",
    thumb: "/thumb.jpg",
  },
  links: { html: "", download: "", download_location: "" },
  user: {
    id: "u1",
    name: "Jane Doe",
    username: "janedoe",
    profile_image: { small: "", medium: "", large: "" },
    links: { html: "" },
  },
};

describe("ImageCard", () => {
  it("renders a link to the image page", () => {
    render(<ImageCard image={img} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/images/abc123");
  });

  it("renders the image with correct src", () => {
    render(<ImageCard image={img} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/small.jpg");
  });

  it("uses alt_description for alt text", () => {
    render(<ImageCard image={img} />);
    expect(screen.getByRole("img")).toHaveAttribute("alt", "mountain lake");
  });

  it("shows author name in overlay", () => {
    render(<ImageCard image={img} />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("uses description when alt_description is null", () => {
    const imgWithDesc: UnsplashImage = {
      ...img,
      alt_description: null,
      description: "Mountain landscape",
    };
    render(<ImageCard image={imgWithDesc} />);
    expect(screen.getByRole("img")).toHaveAttribute(
      "alt",
      "Mountain landscape",
    );
  });

  it("uses fallback text when both alt_description and description are null", () => {
    const imgNoAlt: UnsplashImage = {
      ...img,
      alt_description: null,
      description: null,
    };
    render(<ImageCard image={imgNoAlt} />);
    expect(screen.getByRole("img")).toHaveAttribute("alt", "Unsplash photo");
  });

  it("applies custom style prop to the link", () => {
    render(<ImageCard image={img} style={{ opacity: 0.5 }} />);
    const link = screen.getByRole("link");
    expect((link as HTMLElement).style.opacity).toBe("0.5");
  });
});
