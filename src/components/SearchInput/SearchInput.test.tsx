import { render, screen, fireEvent } from "@testing-library/react";
import SearchInput from "./SearchInput";

describe("SearchInput", () => {
  it("renders placeholder", () => {
    render(
      <SearchInput
        value=""
        onChange={jest.fn()}
        onSubmit={jest.fn()}
        placeholder="Search..."
      />,
    );
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("calls onChange when typing", () => {
    const onChange = jest.fn();
    render(<SearchInput value="" onChange={onChange} onSubmit={jest.fn()} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "nature" },
    });
    expect(onChange).toHaveBeenCalledWith("nature");
  });

  it("calls onSubmit on Enter when value is non-empty", () => {
    const onSubmit = jest.fn();
    render(
      <SearchInput value="nature" onChange={jest.fn()} onSubmit={onSubmit} />,
    );
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("does NOT call onSubmit on Enter when value is empty", () => {
    const onSubmit = jest.fn();
    render(<SearchInput value="" onChange={jest.fn()} onSubmit={onSubmit} />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does NOT call onSubmit on other keys", () => {
    const onSubmit = jest.fn();
    render(<SearchInput value="x" onChange={jest.fn()} onSubmit={onSubmit} />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "a" });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
