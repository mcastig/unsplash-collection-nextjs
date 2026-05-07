import { render, screen, fireEvent } from "@testing-library/react";
import NewCollectionModal from "./NewCollectionModal";

describe("NewCollectionModal", () => {
  it("renders title and inputs", () => {
    render(<NewCollectionModal onSave={jest.fn()} onCancel={jest.fn()} />);
    expect(screen.getByText("Add Collection")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Collection name")).toBeInTheDocument();
  });

  it("Save button is disabled when input is empty", () => {
    render(<NewCollectionModal onSave={jest.fn()} onCancel={jest.fn()} />);
    expect(screen.getByText("Save")).toBeDisabled();
  });

  it("Save button is enabled after typing", () => {
    render(<NewCollectionModal onSave={jest.fn()} onCancel={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("Collection name"), {
      target: { value: "My Col" },
    });
    expect(screen.getByText("Save")).not.toBeDisabled();
  });

  it("calls onSave with trimmed name on Save click", () => {
    const onSave = jest.fn();
    render(<NewCollectionModal onSave={onSave} onCancel={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("Collection name"), {
      target: { value: "  Autumn  " },
    });
    fireEvent.click(screen.getByText("Save"));
    expect(onSave).toHaveBeenCalledWith("Autumn");
  });

  it("calls onSave on Enter key", () => {
    const onSave = jest.fn();
    render(<NewCollectionModal onSave={onSave} onCancel={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("Collection name"), {
      target: { value: "Test" },
    });
    fireEvent.keyDown(screen.getByPlaceholderText("Collection name"), {
      key: "Enter",
    });
    expect(onSave).toHaveBeenCalledWith("Test");
  });

  it("calls onCancel when Cancel is clicked", () => {
    const onCancel = jest.fn();
    render(<NewCollectionModal onSave={jest.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalled();
  });

  it("calls onCancel when backdrop is clicked", () => {
    const onCancel = jest.fn();
    const { container } = render(
      <NewCollectionModal onSave={jest.fn()} onCancel={onCancel} />,
    );
    fireEvent.click(container.firstChild as Element);
    expect(onCancel).toHaveBeenCalled();
  });

  it("does not call onSave when name is only whitespace", () => {
    const onSave = jest.fn();
    render(<NewCollectionModal onSave={onSave} onCancel={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("Collection name"), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByText("Save"));
    expect(onSave).not.toHaveBeenCalled();
  });

  it("does not call onSave on Enter when name is only whitespace", () => {
    const onSave = jest.fn();
    render(<NewCollectionModal onSave={onSave} onCancel={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("Collection name"), {
      target: { value: "   " },
    });
    fireEvent.keyDown(screen.getByPlaceholderText("Collection name"), {
      key: "Enter",
    });
    expect(onSave).not.toHaveBeenCalled();
  });
});
