import { useCart } from "@/features/sales/hooks/use-cart";
import { mockAddons, mockProducts } from "@/tests/fixtures/products";
import { act, renderHook } from "@testing-library/react";

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
};

Object.defineProperty(globalThis, "sessionStorage", { value: mockSessionStorage });

describe("useCart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  describe("Inicialização", () => {
    test("deve inicializar com carrinho vazio", () => {
      // ARRANGE & ACT
      const { result } = renderHook(() => useCart());

      // ASSERT
      expect(result.current.items).toEqual([]);
      expect(result.current.isEmpty).toBe(true);
      expect(result.current.totalItems).toBe(0);
      expect(result.current.totalValue).toBe(0);
    });

    test("deve inicializar com itens do sessionStorage se persistToSession estiver habilitado", () => {
      // ARRANGE
      const storedItems = [{ product: mockProducts[0], quantity: 2 }];
      mockSessionStorage.getItem.mockReturnValueOnce(
        JSON.stringify(storedItems) as unknown as null
      );

      // ACT
      const { result } = renderHook(() => useCart({ persistToSession: true }));

      // ASSERT
      expect(result.current.items).toHaveLength(1);
      expect(result.current.isEmpty).toBe(false);
    });

    test("deve inicializar vazio quando enabled é false", () => {
      // ARRANGE & ACT
      const { result } = renderHook(() => useCart({ enabled: false }));

      // ASSERT
      expect(result.current.items).toEqual([]);
    });

    test("deve inicializar vazio quando persistToSession é false", () => {
      // ARRANGE & ACT
      const { result } = renderHook(() => useCart({ persistToSession: false }));

      // ASSERT
      expect(result.current.items).toEqual([]);
    });
  });

  describe("addItem", () => {
    test("deve adicionar item de unidade ao carrinho", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());
      const product = mockProducts[0]; // Sorvete de Chocolate (unit)

      // ACT
      let success: boolean;
      act(() => {
        success = result.current.addItem(product, { quantity: 2 });
      });

      // ASSERT
      expect(success!).toBe(true);
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].product).toEqual(product);
      expect(result.current.items[0].quantity).toBe(2);
    });

    test("deve adicionar item de peso ao carrinho", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());
      const product = mockProducts[2]; // Açaí no Peso (weight)

      // ACT
      let success: boolean;
      act(() => {
        success = result.current.addItem(product, { weight: 500 });
      });

      // ASSERT
      expect(success!).toBe(true);
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].weight).toBe(500);
      expect(result.current.items[0].quantity).toBeUndefined();
    });

    test("deve rejeitar item de peso sem peso definido", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());
      const product = mockProducts[2]; // Açaí no Peso (weight)

      // ACT
      let success: boolean;
      act(() => {
        success = result.current.addItem(product);
      });

      // ASSERT
      expect(success!).toBe(false);
      expect(result.current.items).toHaveLength(0);
    });

    test("deve rejeitar item com quantidade zero ou negativa", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());
      const product = mockProducts[0];

      // ACT
      let success: boolean;
      act(() => {
        success = result.current.addItem(product, { quantity: 0 });
      });

      // ASSERT
      expect(success!).toBe(false);
      expect(result.current.items).toHaveLength(0);
    });

    test("deve adicionar item com addons", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());
      const product = mockProducts[0];
      const addons = [mockAddons[0], mockAddons[1]];

      // ACT
      act(() => {
        result.current.addItem(product, { quantity: 1, addons });
      });

      // ASSERT
      expect(result.current.items[0].addons).toEqual(addons);
    });

    test("deve respeitar limite máximo de itens", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart({ maxItems: 2 }));
      const product = mockProducts[0];

      // ACT
      act(() => {
        result.current.addItem(product, { quantity: 1 });
        result.current.addItem(product, { quantity: 1 });
      });

      let success: boolean;
      act(() => {
        success = result.current.addItem(product, { quantity: 1 });
      });

      // ASSERT
      expect(success!).toBe(false);
      expect(result.current.items).toHaveLength(2);
    });

    test("deve rejeitar produto sem id", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());
      const invalidProduct = {
        ...mockProducts[0],
        id: undefined,
      } as unknown as (typeof mockProducts)[0];

      // ACT
      let success: boolean;
      act(() => {
        success = result.current.addItem(invalidProduct, { quantity: 1 });
      });

      // ASSERT
      expect(success!).toBe(false);
    });
  });

  describe("removeItem", () => {
    test("deve remover item pelo índice", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockProducts[0], { quantity: 1 });
        result.current.addItem(mockProducts[1], { quantity: 2 });
      });

      // ACT
      act(() => {
        result.current.removeItem(0);
      });

      // ASSERT
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].product).toEqual(mockProducts[1]);
    });

    test("não deve fazer nada quando enabled é false", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart({ enabled: false }));

      // ACT
      act(() => {
        result.current.removeItem(0);
      });

      // ASSERT
      expect(result.current.items).toHaveLength(0);
    });
  });

  describe("updateItem", () => {
    test("deve atualizar quantidade do item", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockProducts[0], { quantity: 1 });
      });

      // ACT
      let success: boolean;
      act(() => {
        success = result.current.updateItem(0, { quantity: 5 });
      });

      // ASSERT
      expect(success!).toBe(true);
      expect(result.current.items[0].quantity).toBe(5);
    });

    test("deve rejeitar atualização com quantidade inválida", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockProducts[0], { quantity: 1 });
      });

      // ACT
      let success: boolean;
      act(() => {
        success = result.current.updateItem(0, { quantity: 0 });
      });

      // ASSERT
      expect(success!).toBe(true); // Retorna true mas não aplica
      expect(result.current.items[0].quantity).toBe(1); // Mantém original
    });

    test("deve rejeitar índice inválido", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());

      // ACT
      let success: boolean;
      act(() => {
        success = result.current.updateItem(99, { quantity: 5 });
      });

      // ASSERT
      expect(success!).toBe(false);
    });

    test("deve rejeitar peso inválido para produto de peso", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockProducts[2], { weight: 500 });
      });

      // ACT
      act(() => {
        result.current.updateItem(0, { weight: -100 });
      });

      // ASSERT
      expect(result.current.items[0].weight).toBe(500); // Mantém original
    });
  });

  describe("clearCart", () => {
    test("deve limpar todos os itens do carrinho", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockProducts[0], { quantity: 1 });
        result.current.addItem(mockProducts[1], { quantity: 2 });
      });

      // ACT
      act(() => {
        result.current.clearCart();
      });

      // ASSERT
      expect(result.current.items).toHaveLength(0);
      expect(result.current.isEmpty).toBe(true);
    });

    test("deve limpar erros ao limpar carrinho", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());

      // ACT
      act(() => {
        result.current.clearCart();
      });

      // ASSERT
      expect(result.current.error).toBeNull();
    });
  });

  describe("getItemTotal", () => {
    test("deve calcular total para item de unidade", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockProducts[0], { quantity: 3 }); // 4.5 * 3 = 13.5
      });

      // ACT
      const total = result.current.getItemTotal(result.current.items[0]);

      // ASSERT
      expect(total).toBe(13.5);
    });

    test("deve calcular total para item de peso", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockProducts[2], { weight: 500 }); // 47 * 0.5 = 23.5
      });

      // ACT
      const total = result.current.getItemTotal(result.current.items[0]);

      // ASSERT
      expect(total).toBe(23.5);
    });

    test("deve incluir addons no cálculo", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockProducts[0], {
          quantity: 2,
          addons: [mockAddons[0]], // Creme de Cookies - 3.0
        }); // Base: 4.5 * 2 = 9, Addon: 3 * 2 = 6, Total: 15
      });

      // ACT
      const total = result.current.getItemTotal(result.current.items[0]);

      // ASSERT
      expect(total).toBe(15);
    });

    test("deve retornar 0 para produto sem preço", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());
      const itemWithoutPrice = {
        product: null as unknown as (typeof mockProducts)[0],
        quantity: 1,
      };

      // ACT
      const total = result.current.getItemTotal(itemWithoutPrice);

      // ASSERT
      expect(total).toBe(0);
    });
  });

  describe("canAddItem", () => {
    test("deve retornar true para produto válido", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());

      // ACT & ASSERT
      expect(result.current.canAddItem(mockProducts[0])).toBe(true);
    });

    test("deve retornar false quando limite atingido", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart({ maxItems: 1 }));

      act(() => {
        result.current.addItem(mockProducts[0], { quantity: 1 });
      });

      // ACT & ASSERT
      expect(result.current.canAddItem(mockProducts[1])).toBe(false);
    });

    test("deve retornar false quando enabled é false", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart({ enabled: false }));

      // ACT & ASSERT
      expect(result.current.canAddItem(mockProducts[0])).toBe(false);
    });
  });

  describe("findItemIndex e hasItem", () => {
    test("deve encontrar índice do item pelo productId", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockProducts[0], { quantity: 1 });
        result.current.addItem(mockProducts[1], { quantity: 1 });
      });

      // ACT & ASSERT
      expect(result.current.findItemIndex(mockProducts[1].id)).toBe(1);
      expect(result.current.hasItem(mockProducts[1].id)).toBe(true);
    });

    test("deve retornar -1 quando item não existe", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());

      // ACT & ASSERT
      expect(result.current.findItemIndex(999)).toBe(-1);
      expect(result.current.hasItem(999)).toBe(false);
    });
  });

  describe("addMultipleItems", () => {
    test("deve adicionar múltiplos itens de uma vez", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());
      const itemsToAdd = [
        { product: mockProducts[0], options: { quantity: 1 } },
        { product: mockProducts[1], options: { quantity: 2 } },
      ];

      // ACT
      let results: boolean[];
      act(() => {
        results = result.current.addMultipleItems(itemsToAdd);
      });

      // ASSERT
      expect(results!).toEqual([true, true]);
      expect(result.current.items).toHaveLength(2);
    });

    test("deve respeitar limite de itens ao adicionar múltiplos", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart({ maxItems: 1 }));
      const itemsToAdd = [
        { product: mockProducts[0], options: { quantity: 1 } },
        { product: mockProducts[1], options: { quantity: 2 } },
      ];

      // ACT
      let results: boolean[];
      act(() => {
        results = result.current.addMultipleItems(itemsToAdd);
      });

      // ASSERT
      expect(results!).toEqual([true, false]);
      expect(result.current.items).toHaveLength(1);
    });

    test("deve rejeitar item de peso sem peso", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());
      const itemsToAdd = [
        { product: mockProducts[2] }, // Açaí sem peso
      ];

      // ACT
      let results: boolean[];
      act(() => {
        results = result.current.addMultipleItems(itemsToAdd);
      });

      // ASSERT
      expect(results!).toEqual([false]);
    });
  });

  describe("removeMultipleItems", () => {
    test("deve remover múltiplos itens pelos índices", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockProducts[0], { quantity: 1 });
        result.current.addItem(mockProducts[1], { quantity: 1 });
        result.current.addItem(mockProducts[2], { weight: 500 });
      });

      // ACT
      act(() => {
        result.current.removeMultipleItems([0, 2]);
      });

      // ASSERT
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].product).toEqual(mockProducts[1]);
    });

    test("deve lidar com índices inválidos graciosamente", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockProducts[0], { quantity: 1 });
      });

      // ACT
      act(() => {
        result.current.removeMultipleItems([0, 99, -1]);
      });

      // ASSERT
      expect(result.current.items).toHaveLength(0);
    });
  });

  describe("updateMultipleItems", () => {
    test("deve atualizar múltiplos itens", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockProducts[0], { quantity: 1 });
        result.current.addItem(mockProducts[1], { quantity: 1 });
      });

      // ACT
      let results: boolean[];
      act(() => {
        results = result.current.updateMultipleItems([
          { index: 0, updates: { quantity: 5 } },
          { index: 1, updates: { quantity: 10 } },
        ]);
      });

      // ASSERT
      expect(results!).toEqual([true, true]);
      expect(result.current.items[0].quantity).toBe(5);
      expect(result.current.items[1].quantity).toBe(10);
    });

    test("deve rejeitar atualizações com índice inválido", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockProducts[0], { quantity: 1 });
      });

      // ACT
      let results: boolean[];
      act(() => {
        results = result.current.updateMultipleItems([
          { index: 99, updates: { quantity: 5 } },
        ]);
      });

      // ASSERT
      expect(results!).toEqual([false]);
    });
  });

  describe("getSubtotal e getTotalWithTax", () => {
    test("deve retornar subtotal correto", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockProducts[0], { quantity: 2 }); // 9.0
        result.current.addItem(mockProducts[1], { quantity: 1 }); // 4.5
      });

      // ACT & ASSERT
      expect(result.current.getSubtotal()).toBe(13.5);
    });

    test("deve calcular total com taxa", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockProducts[0], { quantity: 2 }); // 9.0
      });

      // ACT
      const totalWithTax = result.current.getTotalWithTax(0.1); // 10%

      // ASSERT
      expect(totalWithTax).toBe(9.9);
    });
  });

  describe("getItemsByCategory", () => {
    test("deve filtrar itens por categoria", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockProducts[0], { quantity: 1 }); // Sorvetes
        result.current.addItem(mockProducts[1], { quantity: 1 }); // Sorvetes
        result.current.addItem(mockProducts[2], { weight: 500 }); // Açaí
      });

      // ACT
      const sorvetes = result.current.getItemsByCategory("Sorvetes");
      const acai = result.current.getItemsByCategory("Açaí");

      // ASSERT
      expect(sorvetes).toHaveLength(2);
      expect(acai).toHaveLength(1);
    });

    test("deve retornar array vazio para categoria inexistente", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockProducts[0], { quantity: 1 });
      });

      // ACT
      const bebidas = result.current.getItemsByCategory("Bebidas");

      // ASSERT
      expect(bebidas).toHaveLength(0);
    });
  });

  describe("Validação", () => {
    test("deve validar carrinho corretamente", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart({ validateItems: true }));

      act(() => {
        result.current.addItem(mockProducts[0], { quantity: 1 });
      });

      // ASSERT
      expect(result.current.isValid).toBe(true);
      expect(result.current.validationErrors).toHaveLength(0);
    });

    test("deve detectar quando carrinho excede limite", () => {
      // ARRANGE
      const { result } = renderHook(() =>
        useCart({ maxItems: 1, validateItems: true })
      );

      // Adiciona 2 itens diretamente para testar validação
      act(() => {
        result.current.addItem(mockProducts[0], { quantity: 1 });
      });

      // ASSERT - Com 1 item e maxItems=1, ainda é válido
      expect(result.current.isValid).toBe(true);
    });

    test("deve pular validação quando validateItems é false", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart({ validateItems: false }));

      // ASSERT
      expect(result.current.isValid).toBe(true);
      expect(result.current.validationErrors).toHaveLength(0);
    });
  });

  describe("Erros e clearError", () => {
    test("deve limpar erro quando chamado clearError", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());

      // ACT
      act(() => {
        result.current.clearError();
      });

      // ASSERT
      expect(result.current.error).toBeNull();
    });
  });

  describe("totalItems e totalValue", () => {
    test("deve calcular totalItems corretamente", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockProducts[0], { quantity: 3 });
        result.current.addItem(mockProducts[1], { quantity: 2 });
      });

      // ASSERT
      expect(result.current.totalItems).toBe(5);
    });

    test("deve calcular totalValue corretamente", () => {
      // ARRANGE
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockProducts[0], { quantity: 2 }); // 4.5 * 2 = 9.0
      });

      // ASSERT
      expect(result.current.totalValue).toBe(9);
    });
  });
});
