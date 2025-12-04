export const CORRECT_PASSWORD = "21011996";
export const INCORRECT_PASSWORD = "wrongpassword";
export const EMPTY_PASSWORD = "";

export const mockOnLogin = jest.fn();

export function resetAuthMocks() {
  mockOnLogin.mockClear();
}
