/**
 * Password complexity validation utility.
 * Enforces strong password policies for admin accounts.
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: readonly string[];
}

const MIN_LENGTH = 12;

const RULES: { test: (pw: string) => boolean; message: string }[] = [
  {
    test: (pw) => pw.length >= MIN_LENGTH,
    message: `Minimal ${MIN_LENGTH} karakter`,
  },
  {
    test: (pw) => /[A-Z]/.test(pw),
    message: "Minimal 1 huruf kapital (A-Z)",
  },
  {
    test: (pw) => /[a-z]/.test(pw),
    message: "Minimal 1 huruf kecil (a-z)",
  },
  {
    test: (pw) => /[0-9]/.test(pw),
    message: "Minimal 1 angka (0-9)",
  },
  {
    test: (pw) => /[^A-Za-z0-9]/.test(pw),
    message: "Minimal 1 karakter spesial (!@#$%^&*)",
  },
];

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  for (const rule of RULES) {
    if (!rule.test(password)) {
      errors.push(rule.message);
    }
  }

  return {
    isValid: errors.length === 0,
    // Return a frozen copy to prevent external mutation of the shared array
    errors: Object.freeze(errors),
  };
}

export function getPasswordRequirements() {
  return RULES.map((r) => r.message);
}

export { RULES as PASSWORD_RULES, MIN_LENGTH as PASSWORD_MIN_LENGTH };
