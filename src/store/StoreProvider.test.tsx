import { render, screen } from "@testing-library/react";
import StoreProvider from "./StoreProvider";

describe("StoreProvider", () => {
  it("renders children inside the Redux Provider", () => {
    render(
      <StoreProvider>
        <div>test child</div>
      </StoreProvider>,
    );
    expect(screen.getByText("test child")).toBeInTheDocument();
  });
});
