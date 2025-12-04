import {
  getCategories,
  getProductById,
  getProductsByCategory,
  searchProducts,
} from "@/lib/constants/products-data";

describe("getProductsByCategory", () => {
  test("should return products filtered by category", () => {
    // ARRANGE
    const category = "Sorvetes";

    // ACT
    const result = getProductsByCategory(category);

    // ASSERT
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    result.forEach((product) => {
      expect(product.category).toBe(category);
    });
  });

  test("should return empty array for non-existent category", () => {
    // ARRANGE
    const category = "Categoria Inexistente";

    // ACT
    const result = getProductsByCategory(category);

    // ASSERT
    expect(result).toEqual([]);
  });

  test("should return all products for valid category", () => {
    // ARRANGE
    const category = "Açaí";

    // ACT
    const result = getProductsByCategory(category);

    // ASSERT
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.category === category)).toBe(true);
  });
});

describe("getCategories", () => {
  test("should return array of unique categories", () => {
    // ARRANGE & ACT
    const result = getCategories();

    // ASSERT
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);

    // Verificar que são únicas
    const uniqueCategories = Array.from(new Set(result));
    expect(result.length).toBe(uniqueCategories.length);
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

  test("should include common categories", () => {
    // ARRANGE & ACT
    const result = getCategories();

    // ASSERT - Verificar se categorias comuns existem
    const hasSorvetes = result.includes("Sorvetes");
    const hasAcai = result.includes("Açaí");

    // Pelo menos uma dessas categorias deve existir
    expect(hasSorvetes || hasAcai).toBe(true);
  });
});

describe("searchProducts", () => {
  test("should return products matching search query", () => {
    // ARRANGE
    const query = "Sorvete";

    // ACT
    const result = searchProducts(query);

    // ASSERT
    expect(Array.isArray(result)).toBe(true);
    result.forEach((product) => {
      expect(product.name.toLowerCase()).toContain(query.toLowerCase());
    });
  });

  test("should be case insensitive", () => {
    // ARRANGE
    const query1 = "sorvete";
    const query2 = "SORVETE";
    const query3 = "Sorvete";

    // ACT
    const result1 = searchProducts(query1);
    const result2 = searchProducts(query2);
    const result3 = searchProducts(query3);

    // ASSERT
    expect(result1.length).toBe(result2.length);
    expect(result2.length).toBe(result3.length);
  });

  test("should return empty array for non-matching query", () => {
    // ARRANGE
    const query = "ProdutoInexistenteXYZ123";

    // ACT
    const result = searchProducts(query);

    // ASSERT
    expect(result).toEqual([]);
  });

  test("should return partial matches", () => {
    // ARRANGE
    const query = "Aça";

    // ACT
    const result = searchProducts(query);

    // ASSERT
    expect(result.length).toBeGreaterThan(0);
    result.forEach((product) => {
      expect(product.name.toLowerCase()).toContain(query.toLowerCase());
    });
  });

  test("should handle empty query", () => {
    // ARRANGE
    const query = "";

    // ACT
    const result = searchProducts(query);

    // ASSERT
    // String vazia está contida em qualquer string, então deve retornar todos
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("getProductById", () => {
  test("should return product when id exists", () => {
    // ARRANGE
    const id = 1;

    // ACT
    const result = getProductById(id);

    // ASSERT
    expect(result).toBeDefined();
    expect(result?.id).toBe(id);
  });

  test("should return undefined when id does not exist", () => {
    // ARRANGE
    const id = 99999;

    // ACT
    const result = getProductById(id);

    // ASSERT
    expect(result).toBeUndefined();
  });

  test("should return correct product properties", () => {
    // ARRANGE
    const id = 1;

    // ACT
    const result = getProductById(id);

    // ASSERT
    if (result) {
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("price");
      expect(result).toHaveProperty("category");
      expect(result).toHaveProperty("type");
    }
  });
});
