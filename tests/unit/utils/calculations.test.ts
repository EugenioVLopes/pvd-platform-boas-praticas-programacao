import {
  calculateItemTotal,
  calculateOrderTotal,
} from "@/lib/utils/calculations";
import {
  createMockSaleItem,
  createMockWeightSaleItem,
  createMockSaleItemWithAddons,
} from "@/tests/fixtures/products";
import { createMockOrder } from "@/tests/fixtures/sales";

describe("calculateItemTotal", () => {
  test("should calculate total for unit product with quantity", () => {
    // ARRANGE
    const item = createMockSaleItem({
      product: {
        id: 1,
        name: "Sorvete",
        price: 4.5,
        category: "Sorvetes",
        type: "unit",
      },
      quantity: 2,
    });

    // ACT
    const result = calculateItemTotal(item);

    // ASSERT
    expect(result).toBe(9.0);
  });

  test("should calculate total for unit product without quantity (defaults to 1)", () => {
    // ARRANGE
    const item = createMockSaleItem({
      product: {
        id: 1,
        name: "Sorvete",
        price: 4.5,
        category: "Sorvetes",
        type: "unit",
      },
      quantity: undefined,
    });

    // ACT
    const result = calculateItemTotal(item);

    // ASSERT
    expect(result).toBe(4.5);
  });

  test("should calculate total for weight product", () => {
    // ARRANGE
    const item = createMockWeightSaleItem({
      product: {
        id: 3,
        name: "Açaí no Peso",
        price: 47,
        category: "Açaí",
        type: "weight",
      },
      weight: 500, // 500g = 0.5kg
    });

    // ACT
    const result = calculateItemTotal(item);

    // ASSERT
    expect(result).toBe(23.5); // 47 * 0.5
  });

  test("should calculate total for weight product with 1kg", () => {
    // ARRANGE
    const item = createMockWeightSaleItem({
      product: {
        id: 3,
        name: "Açaí no Peso",
        price: 47,
        category: "Açaí",
        type: "weight",
      },
      weight: 1000, // 1000g = 1kg
    });

    // ACT
    const result = calculateItemTotal(item);

    // ASSERT
    expect(result).toBe(47.0); // 47 * 1
  });

  test("should calculate total for item with addons", () => {
    // ARRANGE
    const item = createMockSaleItemWithAddons({
      product: {
        id: 1,
        name: "Sorvete",
        price: 4.5,
        category: "Sorvetes",
        type: "unit",
      },
      quantity: 2,
      addons: [
        {
          id: 69,
          name: "Creme de Cookies",
          price: 3.0,
          category: "Adicionais",
          type: "addon",
        },
        {
          id: 70,
          name: "Nutella",
          price: 3.0,
          category: "Adicionais",
          type: "addon",
        },
      ],
    });

    // ACT
    const result = calculateItemTotal(item);

    // ASSERT
    // Base: 4.5 * 2 = 9.0
    // Addons: (3.0 + 3.0) * 2 = 12.0
    // Total: 9.0 + 12.0 = 21.0
    expect(result).toBe(21.0);
  });

  test("should calculate total for item with addons and no quantity (defaults to 1)", () => {
    // ARRANGE
    const item = createMockSaleItemWithAddons({
      product: {
        id: 1,
        name: "Sorvete",
        price: 4.5,
        category: "Sorvetes",
        type: "unit",
      },
      quantity: undefined,
      addons: [
        {
          id: 69,
          name: "Creme de Cookies",
          price: 3.0,
          category: "Adicionais",
          type: "addon",
        },
      ],
    });

    // ACT
    const result = calculateItemTotal(item);

    // ASSERT
    // Base: 4.5 * 1 = 4.5
    // Addons: 3.0 * 1 = 3.0
    // Total: 4.5 + 3.0 = 7.5
    expect(result).toBe(7.5);
  });

  test("should calculate total for item without addons (empty array)", () => {
    // ARRANGE
    const item = createMockSaleItem({
      product: {
        id: 1,
        name: "Sorvete",
        price: 4.5,
        category: "Sorvetes",
        type: "unit",
      },
      quantity: 1,
      addons: [],
    });

    // ACT
    const result = calculateItemTotal(item);

    // ASSERT
    expect(result).toBe(4.5);
  });

  test("should calculate total for item without addons (undefined)", () => {
    // ARRANGE
    const item = createMockSaleItem({
      product: {
        id: 1,
        name: "Sorvete",
        price: 4.5,
        category: "Sorvetes",
        type: "unit",
      },
      quantity: 1,
      addons: undefined,
    });

    // ACT
    const result = calculateItemTotal(item);

    // ASSERT
    expect(result).toBe(4.5);
  });

  test("should handle zero price product", () => {
    // ARRANGE
    const item = createMockSaleItem({
      product: {
        id: 1,
        name: "Produto Grátis",
        price: 0,
        category: "Teste",
        type: "unit",
      },
      quantity: 1,
    });

    // ACT
    const result = calculateItemTotal(item);

    // ASSERT
    expect(result).toBe(0);
  });

  test("should handle weight product without weight (should use quantity)", () => {
    // ARRANGE
    const item = createMockSaleItem({
      product: {
        id: 3,
        name: "Açaí no Peso",
        price: 47,
        category: "Açaí",
        type: "weight",
      },
      quantity: 2,
      weight: undefined,
    });

    // ACT
    const result = calculateItemTotal(item);

    // ASSERT
    // Se não tem weight, usa quantity: 47 * 2 = 94
    expect(result).toBe(94.0);
  });
});

describe("calculateOrderTotal", () => {
  test("should calculate total for order with single item", () => {
    // ARRANGE
    const order = createMockOrder({
      items: [createMockSaleItem({ quantity: 2 })],
    });

    // ACT
    const result = calculateOrderTotal(order);

    // ASSERT
    expect(result).toBe(9.0); // 4.5 * 2
  });

  test("should calculate total for order with multiple items", () => {
    // ARRANGE
    const order = createMockOrder({
      items: [
        createMockSaleItem({ quantity: 2 }),
        createMockSaleItem({ quantity: 3 }),
      ],
    });

    // ACT
    const result = calculateOrderTotal(order);

    // ASSERT
    // Item 1: 4.5 * 2 = 9.0
    // Item 2: 4.5 * 3 = 13.5
    // Total: 9.0 + 13.5 = 22.5
    expect(result).toBe(22.5);
  });

  test("should calculate total for order with weight items", () => {
    // ARRANGE
    const order = createMockOrder({
      items: [
        createMockWeightSaleItem({ weight: 500 }),
        createMockSaleItem({ quantity: 1 }),
      ],
    });

    // ACT
    const result = calculateOrderTotal(order);

    // ASSERT
    // Weight item: 47 * 0.5 = 23.5
    // Unit item: 4.5 * 1 = 4.5
    // Total: 23.5 + 4.5 = 28.0
    expect(result).toBe(28.0);
  });

  test("should calculate total for order with items and addons", () => {
    // ARRANGE
    const order = createMockOrder({
      items: [
        createMockSaleItemWithAddons({
          quantity: 2,
          addons: [
            {
              id: 69,
              name: "Creme de Cookies",
              price: 3.0,
              category: "Adicionais",
              type: "addon",
            },
          ],
        }),
      ],
    });

    // ACT
    const result = calculateOrderTotal(order);

    // ASSERT
    // Base: 4.5 * 2 = 9.0
    // Addons: 3.0 * 2 = 6.0
    // Total: 9.0 + 6.0 = 15.0
    expect(result).toBe(15.0);
  });

  test("should return zero for empty order", () => {
    // ARRANGE
    const order = createMockOrder({
      items: [],
    });

    // ACT
    const result = calculateOrderTotal(order);

    // ASSERT
    expect(result).toBe(0);
  });
});
