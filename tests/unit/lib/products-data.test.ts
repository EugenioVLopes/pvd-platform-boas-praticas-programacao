import {
  getProductsByCategory,
  getCategories,
  searchProducts,
  getProductById,
  INITIAL_PRODUCTS,
} from "@/lib/constants/products-data";

describe("getProductsByCategory", () => {
  test("should return products for a specific category", () => {
    // ARRANGE
    const category = "Sorvetes";

    // ACT
    const result = getProductsByCategory(category);

    // ASSERT
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((product) => product.category === category)).toBe(true);
  });

  test("should return empty array for non-existent category", () => {
    // ARRANGE
    const category = "Categoria Inexistente";

    // ACT
    const result = getProductsByCategory(category);

    // ASSERT
    expect(result).toEqual([]);
  });

  test("should return all products from Açaí category", () => {
    // ARRANGE
    const category = "Açaí";

    // ACT
    const result = getProductsByCategory(category);

    // ASSERT
    expect(result.length).toBeGreaterThan(0);
    result.forEach((product) => {
      expect(product.category).toBe(category);
    });
  });
});

describe("getCategories", () => {
  test("should return unique categories", () => {
    // ARRANGE & ACT
    const result = getCategories();

    // ASSERT
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    // Verificar que não há duplicatas
    const uniqueCategories = Array.from(new Set(result));
    expect(uniqueCategories.length).toBe(result.length);
  });

  test("should return categories as strings", () => {
    // ARRANGE & ACT
    const result = getCategories();

    // ASSERT
    result.forEach((category) => {
      expect(typeof category).toBe("string");
      expect(category.length).toBeGreaterThan(0);
    });
  });

  test("should include expected categories", () => {
    // ARRANGE & ACT
    const result = getCategories();

    // ASSERT
    // Verificar que categorias conhecidas estão presentes
    const hasSorvetes = result.includes("Sorvetes");
    const hasAcai = result.includes("Açaí");
    expect(hasSorvetes || hasAcai).toBe(true);
  });
});

describe("searchProducts", () => {
  test("should find products by name (case insensitive)", () => {
    // ARRANGE
    const query = "sorvete";

    // ACT
    const result = searchProducts(query);

    // ASSERT
    expect(result.length).toBeGreaterThan(0);
    result.forEach((product) => {
      expect(product.name.toLowerCase()).toContain(query.toLowerCase());
    });
  });

  test("should find products with exact name match", () => {
    // ARRANGE
    const productName = INITIAL_PRODUCTS[0]?.name;
    if (!productName) {
      throw new Error("No products available");
    }

    // ACT
    const result = searchProducts(productName);

    // ASSERT
    expect(result.length).toBeGreaterThan(0);
    expect(result.some((p) => p.name === productName)).toBe(true);
  });

  test("should find products with partial name match", () => {
    // ARRANGE
    // Buscar por parte do nome de um produto conhecido
    const partialName = INITIAL_PRODUCTS[0]?.name.substring(0, 3);
    if (!partialName) {
      throw new Error("No products available");
    }

    // ACT
    const result = searchProducts(partialName);

    // ASSERT
    expect(result.length).toBeGreaterThan(0);
    result.forEach((product) => {
      expect(product.name.toLowerCase()).toContain(partialName.toLowerCase());
    });
  });

  test("should return empty array for non-matching query", () => {
    // ARRANGE
    const query = "ProdutoInexistenteXYZ123";

    // ACT
    const result = searchProducts(query);

    // ASSERT
    expect(result).toEqual([]);
  });

  test("should handle empty query", () => {
    // ARRANGE
    const query = "";

    // ACT
    const result = searchProducts(query);

    // ASSERT
    // String vazia deve retornar todos os produtos (todos contêm string vazia)
    expect(result.length).toBe(INITIAL_PRODUCTS.length);
  });

  test("should handle special characters in query", () => {
    // ARRANGE
    const query = "Açaí"; // Testar acentuação

    // ACT
    const result = searchProducts(query);

    // ASSERT
    // Deve encontrar produtos com "Açaí" no nome
    result.forEach((product) => {
      expect(product.name.toLowerCase()).toContain(query.toLowerCase());
    });
  });
});

describe("getProductById", () => {
  test("should return product for valid ID", () => {
    // ARRANGE
    const productId = INITIAL_PRODUCTS[0]?.id;
    if (!productId) {
      throw new Error("No products available");
    }

    // ACT
    const result = getProductById(productId);

    // ASSERT
    expect(result).toBeDefined();
    expect(result?.id).toBe(productId);
  });

  test("should return undefined for non-existent ID", () => {
    // ARRANGE
    const nonExistentId = 99999;

    // ACT
    const result = getProductById(nonExistentId);

    // ASSERT
    expect(result).toBeUndefined();
  });

  test("should return correct product for first ID", () => {
    // ARRANGE
    const firstProduct = INITIAL_PRODUCTS[0];
    if (!firstProduct) {
      throw new Error("No products available");
    }

    // ACT
    const result = getProductById(firstProduct.id);

    // ASSERT
    expect(result).toEqual(firstProduct);
  });

  test("should return correct product for last ID", () => {
    // ARRANGE
    const lastProduct = INITIAL_PRODUCTS.at(-1);
    if (!lastProduct) {
      throw new Error("No products available");
    }

    // ACT
    const result = getProductById(lastProduct.id);

    // ASSERT
    expect(result).toEqual(lastProduct);
  });

  test("should return undefined for negative ID", () => {
    // ARRANGE
    const negativeId = -1;

    // ACT
    const result = getProductById(negativeId);

    // ASSERT
    expect(result).toBeUndefined();
  });

  test("should return undefined for zero ID", () => {
    // ARRANGE
    const zeroId = 0;

    // ACT
    const result = getProductById(zeroId);

    // ASSERT
    expect(result).toBeUndefined();
  });
});

