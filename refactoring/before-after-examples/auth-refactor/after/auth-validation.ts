// ✅ Constantes extraídas para configuração
const AUTH_CONFIG = {
  CORRECT_PASSWORD: "21011996",
  VALIDATION_DELAY: 500,
  ERROR_MESSAGES: {
    EMPTY_PASSWORD: "Por favor, digite a senha",
    INCORRECT_PASSWORD: "Senha incorreta. Tente novamente.",
  },
} as const;

// ✅ Tipos para melhor tipagem
interface AuthResult {
  success: boolean;
  error?: string;
}

// ✅ Classe utilitária para lógica de autenticação
export class AuthValidator {
  // ✅ Método estático para validação de entrada
  private static validateInput(password: string): string | null {
    if (!password.trim()) {
      return AUTH_CONFIG.ERROR_MESSAGES.EMPTY_PASSWORD;
    }
    return null;
  }

  // ✅ Método estático para verificação de senha
  private static verifyPassword(password: string): boolean {
    return password === AUTH_CONFIG.CORRECT_PASSWORD;
  }

  // ✅ Método principal que encapsula toda a lógica de autenticação
  static async authenticateUser(password: string): Promise<AuthResult> {
    // Validação de entrada
    const validationError = this.validateInput(password);
    if (validationError) {
      return { success: false, error: validationError };
    }

    // Simula delay de autenticação
    await new Promise((resolve) =>
      setTimeout(resolve, AUTH_CONFIG.VALIDATION_DELAY)
    );

    // Verificação de senha
    const isValid = this.verifyPassword(password);

    if (isValid) {
      return { success: true };
    } else {
      return {
        success: false,
        error: AUTH_CONFIG.ERROR_MESSAGES.INCORRECT_PASSWORD,
      };
    }
  }

  // ✅ Método para obter configurações (se necessário)
  static getConfig() {
    return AUTH_CONFIG;
  }
}
