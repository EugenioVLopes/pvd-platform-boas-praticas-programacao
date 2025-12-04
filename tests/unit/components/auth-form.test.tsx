import { Auth } from "@/features/auth/components/auth-form";
import {
  CORRECT_PASSWORD,
  INCORRECT_PASSWORD,
  mockOnLogin,
} from "@/tests/fixtures/auth";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

describe("Auth", () => {
  beforeAll(() => {
    // Mock do setTimeout para acelerar testes
    jest.useFakeTimers();
  });

  afterAll(() => {
    // Restaurar timers reais após todos os testes
    jest.useRealTimers();
  });

  beforeEach(() => {
    mockOnLogin.mockClear();
    jest.clearAllTimers();
  });

  test("should render password input and submit button", () => {
    // ARRANGE & ACT
    render(<Auth onLogin={mockOnLogin} />);

    // ASSERT
    expect(screen.getByPlaceholderText("Digite sua senha")).toBeInTheDocument();
    expect(screen.getByText("Entrar")).toBeInTheDocument();
  });

  test("should disable submit button when password is empty", () => {
    // ARRANGE
    render(<Auth onLogin={mockOnLogin} />);

    // ASSERT
    const submitButton = screen.getByText("Entrar");
    expect(submitButton).toBeDisabled();
  });

  test("should enable submit button when password is entered", () => {
    // ARRANGE
    render(<Auth onLogin={mockOnLogin} />);

    // ACT
    const passwordInput = screen.getByPlaceholderText("Digite sua senha");
    fireEvent.change(passwordInput, { target: { value: "test" } });

    // ASSERT
    const submitButton = screen.getByText("Entrar");
    expect(submitButton).not.toBeDisabled();
  });

  test("should show error when password is empty on submit", () => {
    // ARRANGE
    render(<Auth onLogin={mockOnLogin} />);

    // ACT - Tentar submeter sem senha (mas o botão está desabilitado)
    // Vamos testar digitando e apagando
    const passwordInput = screen.getByPlaceholderText("Digite sua senha");
    fireEvent.change(passwordInput, { target: { value: "test" } });
    fireEvent.change(passwordInput, { target: { value: "" } });

    // ASSERT
    // O botão deve estar desabilitado quando vazio
    const submitButton = screen.getByText("Entrar");
    expect(submitButton).toBeDisabled();
  });

  test("should call onLogin with correct password", async () => {
    // ARRANGE
    render(<Auth onLogin={mockOnLogin} />);

    // ACT
    const passwordInput = screen.getByPlaceholderText("Digite sua senha");
    fireEvent.change(passwordInput, { target: { value: CORRECT_PASSWORD } });

    const submitButton = screen.getByText("Entrar");
    fireEvent.click(submitButton);

    // Avançar o timer
    jest.advanceTimersByTime(500);

    // ASSERT
    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledTimes(1);
    });
  });

  test("should show error message with incorrect password", async () => {
    // ARRANGE
    render(<Auth onLogin={mockOnLogin} />);

    // ACT
    const passwordInput = screen.getByPlaceholderText("Digite sua senha");
    fireEvent.change(passwordInput, { target: { value: INCORRECT_PASSWORD } });

    const submitButton = screen.getByText("Entrar");
    fireEvent.click(submitButton);

    // Avançar o timer
    jest.advanceTimersByTime(500);

    // ASSERT
    await waitFor(() => {
      expect(
        screen.getByText("Senha incorreta. Tente novamente.")
      ).toBeInTheDocument();
    });

    expect(mockOnLogin).not.toHaveBeenCalled();
    expect(passwordInput).toHaveValue("");
  });

  test("should show loading state during authentication", async () => {
    // ARRANGE
    render(<Auth onLogin={mockOnLogin} />);

    // ACT
    const passwordInput = screen.getByPlaceholderText("Digite sua senha");
    fireEvent.change(passwordInput, { target: { value: CORRECT_PASSWORD } });

    const submitButton = screen.getByText("Entrar");
    fireEvent.click(submitButton);

    // ASSERT - Durante o loading
    expect(screen.getByText("Verificando...")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Avançar o timer
    jest.advanceTimersByTime(500);

    // ASSERT - Após o loading
    await waitFor(() => {
      expect(screen.queryByText("Verificando...")).not.toBeInTheDocument();
    });
  });

  test("should clear error when user starts typing", async () => {
    // ARRANGE
    render(<Auth onLogin={mockOnLogin} />);

    // ACT - Submeter com senha incorreta
    const passwordInput = screen.getByPlaceholderText("Digite sua senha");
    fireEvent.change(passwordInput, { target: { value: INCORRECT_PASSWORD } });

    const submitButton = screen.getByText("Entrar");
    fireEvent.click(submitButton);

    jest.advanceTimersByTime(500);

    await waitFor(() => {
      expect(
        screen.getByText("Senha incorreta. Tente novamente.")
      ).toBeInTheDocument();
    });

    // ACT - Começar a digitar novamente
    fireEvent.change(passwordInput, { target: { value: "new" } });

    // ASSERT
    await waitFor(() => {
      expect(
        screen.queryByText("Senha incorreta. Tente novamente.")
      ).not.toBeInTheDocument();
    });
  });

  test("should have proper accessibility attributes", () => {
    // ARRANGE & ACT
    render(<Auth onLogin={mockOnLogin} />);

    // ASSERT
    const passwordInput = screen.getByPlaceholderText("Digite sua senha");
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toHaveAttribute("required");
    expect(passwordInput).toHaveAttribute("aria-invalid", "false");
  });

  test("should show aria-invalid when error exists", async () => {
    // ARRANGE
    render(<Auth onLogin={mockOnLogin} />);

    // ACT
    const passwordInput = screen.getByPlaceholderText("Digite sua senha");
    fireEvent.change(passwordInput, { target: { value: INCORRECT_PASSWORD } });

    const submitButton = screen.getByText("Entrar");
    fireEvent.click(submitButton);

    jest.advanceTimersByTime(500);

    // ASSERT
    await waitFor(() => {
      expect(passwordInput).toHaveAttribute("aria-invalid", "true");
    });
  });

  test("should not call onLogin with incorrect password", async () => {
    // ARRANGE
    render(<Auth onLogin={mockOnLogin} />);

    // ACT
    const passwordInput = screen.getByPlaceholderText("Digite sua senha");
    fireEvent.change(passwordInput, { target: { value: INCORRECT_PASSWORD } });

    const submitButton = screen.getByText("Entrar");
    fireEvent.click(submitButton);

    jest.advanceTimersByTime(500);

    // ASSERT
    await waitFor(() => {
      expect(mockOnLogin).not.toHaveBeenCalled();
    });
  });
});
