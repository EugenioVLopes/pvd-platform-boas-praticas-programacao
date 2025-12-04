import { useProducts } from "@/features/products/hooks/use-products";
import { createMockProduct, mockProducts } from "@/tests/fixtures/products";
import { act, renderHook } from "@testing-library/react";

// Mock do zustand persist
jest.mock("zustand/middleware", () => ({
  persist: (fn: unknown) => fn,
}));

describe("useProducts", () => {
  beforeEach(() => {
    // Limpar estado antes de cada teste
    const { result } = renderHook(() => useProducts());
    act(() => {
      result.current.resetToInitialProducts();
    });
  });

  test("should return initial products", () => {
    // ARRANGE & ACT
    const { result } = renderHook(() => useProducts());

    // ASSERT
    expect(result.current.products).toBeDefined();
    expect(Array.isArray(result.current.products)).toBe(true);
    expect(result.current.products.length).toBeGreaterThan(0);
  });

  test("should add a new product", () => {
    // ARRANGE
    const { result } = renderHook(() => useProducts());
    const newProduct = createMockProduct({ id: 999, name: "Novo Produto" });
    const initialCount = result.current.products.length;

    // ACT
    act(() => {
      result.current.addProduct(newProduct);
    });

    // ASSERT
    expect(result.current.products.length).toBe(initialCount + 1);
    expect(result.current.products.find((p) => p.id === newProduct.id)).toEqual(
      newProduct
    );
  });

  test("should update an existing product", () => {
    // ARRANGE
    const { result } = renderHook(() => useProducts());
    const productToUpdate = result.current.products[0];
    const updatedProduct = {
      ...productToUpdate,
      name: "Produto Atualizado",
      price: 99.99,
    };

    // ACT
    act(() => {
      result.current.updateProduct(updatedProduct);
    });

    // ASSERT
    const foundProduct = result.current.products.find(
      (p) => p.id === productToUpdate.id
    );
    expect(foundProduct).toEqual(updatedProduct);
    expect(foundProduct?.name).toBe("Produto Atualizado");
    expect(foundProduct?.price).toBe(99.99);
  });

  test("should remove a product by id", () => {
    // ARRANGE
    const { result } = renderHook(() => useProducts());
    const productToRemove = result.current.products[0];
    const initialCount = result.current.products.length;

    // ACT
    act(() => {
      result.current.removeProduct(productToRemove.id);
    });

    // ASSERT
    expect(result.current.products.length).toBe(initialCount - 1);
    expect(
      result.current.products.find((p) => p.id === productToRemove.id)
    ).toBeUndefined();
  });

  test("should set products", () => {
    // ARRANGE
    const { result } = renderHook(() => useProducts());
    const newProducts = [
      createMockProduct({ id: 1 }),
      createMockProduct({ id: 2 }),
    ];

    // ACT
    act(() => {
      result.current.setProducts(newProducts);
    });

    // ASSERT
    expect(result.current.products).toEqual(newProducts);
    expect(result.current.products.length).toBe(2);
  });

  test("should load products", () => {
    // ARRANGE
    const { result } = renderHook(() => useProducts());
    const productsToLoad = mockProducts.slice(0, 3);

    // ACT
    act(() => {
      result.current.loadProducts(productsToLoad);
    });

    // ASSERT
    expect(result.current.products).toEqual(productsToLoad);
    expect(result.current.products.length).toBe(3);
  });

  test("should reset to initial products", () => {
    // ARRANGE
    const { result } = renderHook(() => useProducts());
    const initialProducts = [...result.current.products];

    // ACT - Adicionar produtos e depois resetar
    act(() => {
      result.current.addProduct(createMockProduct({ id: 999 }));
      result.current.addProduct(createMockProduct({ id: 998 }));
    });

    expect(result.current.products.length).toBeGreaterThan(
      initialProducts.length
    );

    act(() => {
      result.current.resetToInitialProducts();
    });

    // ASSERT
    expect(result.current.products.length).toBe(initialProducts.length);
    expect(result.current.products).toEqual(initialProducts);
  });

  test("should handle multiple operations", () => {
    // ARRANGE
    const { result } = renderHook(() => useProducts());
    const product1 = createMockProduct({ id: 100, name: "Produto 1" });
    const product2 = createMockProduct({ id: 101, name: "Produto 2" });

    // ACT
    act(() => {
      result.current.addProduct(product1);
      result.current.addProduct(product2);
    });

    // ASSERT
    expect(result.current.products.length).toBeGreaterThanOrEqual(2);
    expect(
      result.current.products.find((p) => p.id === product1.id)
    ).toBeDefined();
    expect(
      result.current.products.find((p) => p.id === product2.id)
    ).toBeDefined();

    // ACT - Atualizar produto
    act(() => {
      result.current.updateProduct({
        ...product1,
        name: "Produto 1 Atualizado",
      });
    });

    // ASSERT
    const updated = result.current.products.find((p) => p.id === product1.id);
    expect(updated?.name).toBe("Produto 1 Atualizado");

    // ACT - Remover produto
    act(() => {
      result.current.removeProduct(product1.id);
    });

    // ASSERT
    expect(
      result.current.products.find((p) => p.id === product1.id)
    ).toBeUndefined();
    expect(
      result.current.products.find((p) => p.id === product2.id)
    ).toBeDefined();
  });
});
