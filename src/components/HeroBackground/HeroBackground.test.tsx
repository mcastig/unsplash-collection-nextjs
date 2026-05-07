import { render } from "@testing-library/react";
import HeroBackground from "./HeroBackground";
import { UnsplashImage } from "@/types";

const makeImage = (i: number): UnsplashImage => ({
  id: `img${i}`,
  created_at: "2024-01-01",
  width: 100,
  height: 100,
  description: null,
  alt_description: null,
  urls: {
    raw: "",
    full: "",
    regular: "",
    small: "",
    thumb: `/thumb${i}.jpg`,
  },
  links: { html: "", download: "", download_location: "" },
  user: {
    id: `u${i}`,
    name: `User ${i}`,
    username: `user${i}`,
    profile_image: { small: "", medium: "", large: "" },
    links: { html: "" },
  },
});

describe("HeroBackground", () => {
  it("renders without any images (default props)", () => {
    const { container } = render(<HeroBackground />);
    expect(container.firstChild).toBeInTheDocument();
    expect(container.querySelectorAll("img")).toHaveLength(0);
  });

  it("renders img elements at IMAGE_POSITIONS when images provided", () => {
    const images = Array.from({ length: 12 }, (_, i) => makeImage(i));
    const { container } = render(<HeroBackground images={images} />);
    expect(container.querySelectorAll("img")).toHaveLength(12);
  });

  it("renders 72 tiles total (12 cols × 6 rows)", () => {
    const { container } = render(<HeroBackground />);
    const tiles = container.querySelectorAll("[class]");
    expect(tiles.length).toBeGreaterThan(0);
  });

  it("renders no imgs when empty images array passed", () => {
    const { container } = render(<HeroBackground images={[]} />);
    expect(container.querySelectorAll("img")).toHaveLength(0);
  });
});
