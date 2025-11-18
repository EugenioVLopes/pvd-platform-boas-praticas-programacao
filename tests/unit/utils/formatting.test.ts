import { formatCurrency, formatDate, formatWeight } from "@/lib/utils/formatting";

describe("formatCurrency", () => {
  test("should format positive number as BRL currency", () => {
    // ARRANGE
    const value = 1234.56;

    // ACT
    const result = formatCurrency(value);

    // ASSERT - Normalize spaces (Intl uses non-breaking space)
    expect(result.replaceAll("\u00A0", " ")).toBe("R$ 1.234,56");
  });

  test("should format zero correctly", () => {
    // ARRANGE
    const value = 0;

    // ACT
    const result = formatCurrency(value);

    // ASSERT - Normalize spaces
    expect(result.replaceAll("\u00A0", " ")).toBe("R$ 0,00");
  });

  test("should format negative number correctly", () => {
    // ARRANGE
    const value = -100.5;

    // ACT
    const result = formatCurrency(value);

    // ASSERT - Normalize spaces
    expect(result.replaceAll("\u00A0", " ")).toBe("-R$ 100,50");
  });
});

describe("formatDate", () => {
  test("should format Date object correctly", () => {
    // ARRANGE
    const date = new Date("2024-01-15T14:30:00");

    // ACT
    const result = formatDate(date);

    // ASSERT
    expect(result).toContain("15/01/2024");
    expect(result).toContain("14:30");
  });

  test("should format date string correctly", () => {
    // ARRANGE
    const dateString = "2024-12-25T10:00:00";

    // ACT
    const result = formatDate(dateString);

    // ASSERT
    expect(result).toContain("25/12/2024");
  });
});

describe("formatWeight", () => {
  test("should format weight less than 1000g in grams", () => {
    // ARRANGE
    const weight = 500;

    // ACT
    const result = formatWeight(weight);

    // ASSERT
    expect(result).toBe("500 g");
  });

  test("should format weight greater than 1000g in kg", () => {
    // ARRANGE
    const weight = 1500;

    // ACT
    const result = formatWeight(weight);

    // ASSERT
    expect(result).toBe("1,5 kg");
  });

  test("should format exactly 1000g as kg", () => {
    // ARRANGE
    const weight = 1000;

    // ACT
    const result = formatWeight(weight);

    // ASSERT
    expect(result).toBe("1,0 kg");
  });
});

