// Shared admin-password policy — kept in one place so the client and server
// always enforce the exact same rules.
export const STRONG_PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const STRONG_PASSWORD_HINT =
  'At least 8 characters with an uppercase letter, a lowercase letter, a number, and a special character.';
