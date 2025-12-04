import { render, type RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";

/**
 * Utilitários de teste compartilhados
 */

/**
 * Renderiza um componente com providers necessários
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, {
    ...options,
  });
}

/**
 * Aguarda um tempo específico (útil para testes assíncronos)
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Cria um mock de função que retorna um valor após um delay
 */
export function createAsyncMock<T>(
  returnValue: T,
  delay: number = 100
): jest.Mock<Promise<T>> {
  return jest.fn(
    () =>
      new Promise((resolve) => setTimeout(() => resolve(returnValue), delay))
  );
}

/**
 * Cria um mock de função que retorna um erro após um delay
 */
export function createAsyncErrorMock(
  error: Error,
  delay: number = 100
): jest.Mock<Promise<never>> {
  return jest.fn(
    () => new Promise((_, reject) => setTimeout(() => reject(error), delay))
  );
}
