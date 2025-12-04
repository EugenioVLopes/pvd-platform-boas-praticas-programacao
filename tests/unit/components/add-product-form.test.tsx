import { AddProductForm } from "@/features/products/components/add-product-form";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

// Mock do useProducts
jest.mock("@/features/products/hooks/use-products", () => ({
  useProducts: jest.fn(),
}));

describe("AddProductForm", () => {
  const mockOnAddProduct = jest.fn();

  beforeEach(() => {
    mockOnAddProduct.mockClear();
  });

  test("should render form fields", () => {
    // ARRANGE & ACT
    render(<AddProductForm onAddProduct={mockOnAddProduct} />);

    // ASSERT
    expect(screen.getByPlaceholderText("Nome do Produto")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Preço")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Categoria")).toBeInTheDocument();
    expect(screen.getByText("Adicionar Produto")).toBeInTheDocument();
  });

  test("should disable submit button when form is invalid", () => {
    // ARRANGE
    render(<AddProductForm onAddProduct={mockOnAddProduct} />);
    const submitButton = screen.getByText("Adicionar Produto");

    // ASSERT
    expect(submitButton).toBeDisabled();
  });

  test("should enable submit button when form is valid", async () => {
    // ARRANGE
    render(<AddProductForm onAddProduct={mockOnAddProduct} />);

    // ACT
    const nameInput = screen.getByPlaceholderText("Nome do Produto");
    const priceInput = screen.getByPlaceholderText("Preço");
    const categoryInput = screen.getByPlaceholderText("Categoria");

    fireEvent.change(nameInput, { target: { value: "Sorvete" } });
    fireEvent.change(priceInput, { target: { value: "4.5" } });
    fireEvent.change(categoryInput, { target: { value: "Sorvetes" } });

    // ASSERT
    const submitButton = screen.getByText("Adicionar Produto");
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  test("should call onAddProduct with correct data when form is submitted", async () => {
    // ARRANGE
    render(<AddProductForm onAddProduct={mockOnAddProduct} />);

    // ACT
    const nameInput = screen.getByPlaceholderText("Nome do Produto");
    const priceInput = screen.getByPlaceholderText("Preço");
    const categoryInput = screen.getByPlaceholderText("Categoria");

    fireEvent.change(nameInput, { target: { value: "Sorvete Chocolate" } });
    fireEvent.change(priceInput, { target: { value: "4.5" } });
    fireEvent.change(categoryInput, { target: { value: "Sorvetes" } });

    const submitButton = screen.getByText("Adicionar Produto");
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    // ASSERT
    await waitFor(() => {
      expect(mockOnAddProduct).toHaveBeenCalledTimes(1);
    });
    expect(mockOnAddProduct).toHaveBeenCalledWith({
      name: "Sorvete Chocolate",
      price: 4.5,
      category: "Sorvetes",
      type: "unit",
    });
  });

  test("should reset form after successful submission", async () => {
    // ARRANGE
    render(<AddProductForm onAddProduct={mockOnAddProduct} />);

    // ACT
    const nameInput = screen.getByPlaceholderText("Nome do Produto");
    const priceInput = screen.getByPlaceholderText("Preço");
    const categoryInput = screen.getByPlaceholderText("Categoria");

    fireEvent.change(nameInput, { target: { value: "Sorvete" } });
    fireEvent.change(priceInput, { target: { value: "4.5" } });
    fireEvent.change(categoryInput, { target: { value: "Sorvetes" } });

    const submitButton = screen.getByText("Adicionar Produto");
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    fireEvent.click(submitButton);

    // ASSERT - Verificar que o callback foi chamado
    await waitFor(() => {
      expect(mockOnAddProduct).toHaveBeenCalled();
    });

    // Verificar que os campos foram resetados (buscar novamente os elementos após o reset)
    await waitFor(
      () => {
        const nameInputAfter = screen.getByPlaceholderText(
          "Nome do Produto"
        ) as HTMLInputElement;
        const priceInputAfter = screen.getByPlaceholderText(
          "Preço"
        ) as HTMLInputElement;
        const categoryInputAfter = screen.getByPlaceholderText(
          "Categoria"
        ) as HTMLInputElement;
        expect(nameInputAfter.value).toBe("");
        expect(priceInputAfter.value).toBe("");
        expect(categoryInputAfter.value).toBe("");
      },
      { timeout: 2000 }
    );
  });

  test("should trim whitespace from name and category", async () => {
    // ARRANGE
    render(<AddProductForm onAddProduct={mockOnAddProduct} />);

    // ACT
    const nameInput = screen.getByPlaceholderText("Nome do Produto");
    const priceInput = screen.getByPlaceholderText("Preço");
    const categoryInput = screen.getByPlaceholderText("Categoria");

    fireEvent.change(nameInput, { target: { value: "  Sorvete  " } });
    fireEvent.change(priceInput, { target: { value: "4.5" } });
    fireEvent.change(categoryInput, { target: { value: "  Sorvetes  " } });

    const submitButton = screen.getByText("Adicionar Produto");
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    // ASSERT
    await waitFor(() => {
      expect(mockOnAddProduct).toHaveBeenCalledWith({
        name: "Sorvete",
        price: 4.5,
        category: "Sorvetes",
        type: "unit",
      });
    });
  });

  test("should parse price as float", async () => {
    // ARRANGE
    render(<AddProductForm onAddProduct={mockOnAddProduct} />);

    // ACT
    const nameInput = screen.getByPlaceholderText("Nome do Produto");
    const priceInput = screen.getByPlaceholderText("Preço");
    const categoryInput = screen.getByPlaceholderText("Categoria");

    fireEvent.change(nameInput, { target: { value: "Sorvete" } });
    fireEvent.change(priceInput, { target: { value: "12.99" } });
    fireEvent.change(categoryInput, { target: { value: "Sorvetes" } });

    const submitButton = screen.getByText("Adicionar Produto");
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    // ASSERT
    await waitFor(() => {
      expect(mockOnAddProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          price: 12.99,
        })
      );
    });
  });

  test("should not submit when name is empty", () => {
    // ARRANGE
    render(<AddProductForm onAddProduct={mockOnAddProduct} />);

    // ACT
    const priceInput = screen.getByPlaceholderText("Preço");
    const categoryInput = screen.getByPlaceholderText("Categoria");

    fireEvent.change(priceInput, { target: { value: "4.5" } });
    fireEvent.change(categoryInput, { target: { value: "Sorvetes" } });

    const submitButton = screen.getByText("Adicionar Produto");

    // ASSERT
    expect(submitButton).toBeDisabled();
    expect(mockOnAddProduct).not.toHaveBeenCalled();
  });

  test("should not submit when price is empty", () => {
    // ARRANGE
    render(<AddProductForm onAddProduct={mockOnAddProduct} />);

    // ACT
    const nameInput = screen.getByPlaceholderText("Nome do Produto");
    const categoryInput = screen.getByPlaceholderText("Categoria");

    fireEvent.change(nameInput, { target: { value: "Sorvete" } });
    fireEvent.change(categoryInput, { target: { value: "Sorvetes" } });

    const submitButton = screen.getByText("Adicionar Produto");

    // ASSERT
    expect(submitButton).toBeDisabled();
    expect(mockOnAddProduct).not.toHaveBeenCalled();
  });

  test("should not submit when category is empty", () => {
    // ARRANGE
    render(<AddProductForm onAddProduct={mockOnAddProduct} />);

    // ACT
    const nameInput = screen.getByPlaceholderText("Nome do Produto");
    const priceInput = screen.getByPlaceholderText("Preço");

    fireEvent.change(nameInput, { target: { value: "Sorvete" } });
    fireEvent.change(priceInput, { target: { value: "4.5" } });

    const submitButton = screen.getByText("Adicionar Produto");

    // ASSERT
    expect(submitButton).toBeDisabled();
    expect(mockOnAddProduct).not.toHaveBeenCalled();
  });
});
