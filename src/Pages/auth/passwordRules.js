export const MIN_PASSWORD_LENGTH = 10;

/** Returns the translation key of the problem, or null when the new password is fine. */
export function passwordProblem(password, confirm) {
  if (password.length < MIN_PASSWORD_LENGTH) return "auth.passwordTooShort";
  if (password !== confirm) return "auth.errors.PASSWORD_MISMATCH";
  return null;
}