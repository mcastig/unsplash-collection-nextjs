import { render, screen, fireEvent } from "@testing-library/react";
import Header from "./Header";

const mockPathname = jest.fn(() => "/");
jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({ push: jest.fn() }),
}));

describe("Header", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("renders logo and nav links", () => {
    render(<Header />);
    expect(screen.getByAltText("UnsplashBox")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Collections")).toBeInTheDocument();
  });

  it("marks Home link active on /", () => {
    mockPathname.mockReturnValue("/");
    render(<Header />);
    expect(screen.getByText("Home").className).toContain("navLinkActive");
  });

  it("marks Collections link active on /collections", () => {
    mockPathname.mockReturnValue("/collections");
    render(<Header />);
    expect(screen.getByText("Collections").className).toContain(
      "navLinkActive",
    );
  });

  it("toggles theme on button click", () => {
    render(<Header />);
    const btn = screen.getByLabelText("Toggle theme");
    fireEvent.click(btn);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    fireEvent.click(btn);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("persists theme to localStorage", () => {
    render(<Header />);
    fireEvent.click(screen.getByLabelText("Toggle theme"));
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("reads saved theme from localStorage on mount", () => {
    localStorage.setItem("theme", "dark");
    render(<Header />);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("prefers dark theme when matchMedia reports dark and no saved theme", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: query.includes("dark"),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }),
    });
    render(<Header />);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});
