import { render, screen } from "@testing-library/react";
import NotFound from "./not-found";

describe("NotFound", () => {
  it("renders the 404 code", () => {
    render(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders the page not found heading", () => {
    render(<NotFound />);
    expect(
      screen.getByRole("heading", { name: /page not found/i }),
    ).toBeInTheDocument();
  });

  it("renders the descriptive subtitle", () => {
    render(<NotFound />);
    expect(
      screen.getByText(/doesn't exist or has been moved/i),
    ).toBeInTheDocument();
  });

  it("renders a Go home link pointing to /", () => {
    render(<NotFound />);
    const link = screen.getByRole("link", { name: /go home/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/");
  });

  it("applies gradient-text class to the 404 code", () => {
    render(<NotFound />);
    const code = screen.getByText("404");
    expect(code.className).toContain("gradient-text");
  });
});
