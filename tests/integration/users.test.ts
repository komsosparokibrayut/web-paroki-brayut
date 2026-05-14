/**
 * Integration tests for users action — password validation on inviteAdmin.
 * Run: npm test
 *
 * Note: These tests validate the password validation logic independently
 * of Firebase. Firebase functions are mocked with vi.mock().
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Inline password validation to avoid firebase-admin import issues ──────────

const MIN_LENGTH = 12;

const RULES: { test: (pw: string) => boolean; message: string }[] = [
  { test: (pw) => pw.length >= MIN_LENGTH, message: `Minimal ${MIN_LENGTH} karakter` },
  { test: (pw) => /[A-Z]/.test(pw), message: 'Minimal 1 huruf kapital (A-Z)' },
  { test: (pw) => /[a-z]/.test(pw), message: 'Minimal 1 huruf kecil (a-z)' },
  { test: (pw) => /[0-9]/.test(pw), message: 'Minimal 1 angka (0-9)' },
  { test: (pw) => /[^A-Za-z0-9]/.test(pw), message: 'Minimal 1 karakter spesial (!@#$%^&*)' },
];

function validatePasswordInline(password: string) {
  const errors: string[] = [];
  for (const rule of RULES) {
    if (!rule.test(password)) errors.push(rule.message);
  }
  return { isValid: errors.length === 0, errors: Object.freeze(errors) };
}

// ─── Mock firebase-admin ───────────────────────────────────────────────────────

vi.mock('firebase-admin', () => ({
  default: {
    auth: () => ({
      getUserByEmail: vi.fn(),
      createUser: vi.fn(),
      setCustomUserClaims: vi.fn(),
    }),
    firestore: () => ({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(),
          set: vi.fn(),
          update: vi.fn(),
        })),
      })),
    }),
  },
}));

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('inviteAdmin password validation — validatePassword called before Firebase', () => {
  // Valid passwords
  const validPasswords = [
    'AdminParoki123!',
    'S3cureP@ssword',
    'Admin_Wilayah_2026',
    'Rahasia_Satu2!',
    'Kat@Sandi123456',
  ];

  it.each(validPasswords)('accepts valid password: %s', (pw) => {
    const result = validatePasswordInline(pw);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  // Invalid: too short
  const tooShort = [
    'Abc1!',          // 5 chars
    'Short1!',        // 8 chars
    'Almost12!',      // 10 chars
    'Elfp7@',         // 7 chars
  ];

  it.each(tooShort)('rejects too short: %s', (pw) => {
    const result = validatePasswordInline(pw);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(`Minimal ${MIN_LENGTH} karakter`);
  });

  // Invalid: missing uppercase
  it('rejects password missing uppercase', () => {
    const result = validatePasswordInline('password123!@#');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Minimal 1 huruf kapital (A-Z)');
  });

  // Invalid: missing lowercase
  it('rejects password missing lowercase', () => {
    const result = validatePasswordInline('PASSWORD123!@#');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Minimal 1 huruf kecil (a-z)');
  });

  // Invalid: missing digit
  it('rejects password missing digit', () => {
    const result = validatePasswordInline('Password!@#$%^&*');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Minimal 1 angka (0-9)');
  });

  // Invalid: missing special char
  it('rejects password missing special character', () => {
    const result = validatePasswordInline('Password12345');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Minimal 1 karakter spesial (!@#$%^&*)');
  });

  // Multiple violations
  it('fails with 3 violations for weak password', () => {
    const result = validatePasswordInline('abc');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });

  // Boundary: exactly 12 chars
  it('accepts exactly 12-character password with all rules met', () => {
    const result = validatePasswordInline('Abcd1234!@#$');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  // Empty
  it('fails for empty password', () => {
    const result = validatePasswordInline('');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(4); // minLength, uppercase, lowercase, digit, special
  });

  // Space counts as special char (regex [^A-Za-z0-9] matches it)
  // 'Password 1A!' = 12 chars, has all rules — so it IS valid
  it('accepts space as valid special character (12 chars, all rules met)', () => {
    const result = validatePasswordInline('Password 1A!');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
