/**
 * Unit tests for password validation
 * Run: npm test
 */

import { describe, it, expect } from 'vitest';
import { validatePassword, getPasswordRequirements, PASSWORD_MIN_LENGTH, PASSWORD_RULES } from '@/lib/password-validation';

describe('validatePassword', () => {
  // Valid password passes all rules
  it('returns all rules passing for a valid password', () => {
    const result = validatePassword('ValidPass123!');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  // Rule 1: minimum length
  it('fails for password shorter than 12 characters', () => {
    const result = validatePassword('Abc1!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Minimal 12 karakter');
  });

  it('passes for exactly 12 characters', () => {
    const result = validatePassword('Abcd1234!@#$');
    expect(result.isValid).toBe(true);
  });

  // Rule 2: uppercase
  it('fails for no uppercase letter', () => {
    const result = validatePassword('password123!@#');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Minimal 1 huruf kapital (A-Z)');
  });

  // Rule 3: lowercase
  it('fails for no lowercase letter', () => {
    const result = validatePassword('PASSWORD123!@#');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Minimal 1 huruf kecil (a-z)');
  });

  // Rule 4: digit
  it('fails for no digit', () => {
    const result = validatePassword('Password!@#$%^');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Minimal 1 angka (0-9)');
  });

  // Rule 5: special character
  it('fails for no special character', () => {
    const result = validatePassword('Password12345');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Minimal 1 karakter spesial (!@#$%^&*)');
  });

  // Combinations
  it('fails for 3 rule violations (length, uppercase, special)', () => {
    const result = validatePassword('abc');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });

  it('fails for 4 rule violations (length, uppercase, lowercase, digit)', () => {
    const result = validatePassword('!@#$%^&*()');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(4);
  });

  // Empty string
  it('fails empty string with all applicable rules', () => {
    const result = validatePassword('');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3); // minLength, uppercase, lowercase, digit, special
  });

  // Returns immutable errors array
  it('returns a frozen (immutable) errors array', () => {
    const result = validatePassword('weak');
    expect(() => (result.errors as string[]).push('hack')).toThrow();
  });
});

describe('getPasswordRequirements', () => {
  it('returns 5 requirement messages', () => {
    const reqs = getPasswordRequirements();
    expect(reqs).toHaveLength(5);
  });

  it('includes minimum length requirement', () => {
    const reqs = getPasswordRequirements();
    expect(reqs.some(r => r.includes('12'))).toBe(true);
  });
});

describe('PASSWORD_MIN_LENGTH', () => {
  it('equals 12', () => {
    expect(PASSWORD_MIN_LENGTH).toBe(12);
  });
});

describe('PASSWORD_RULES', () => {
  it('has 5 rules', () => {
    expect(PASSWORD_RULES).toHaveLength(5);
  });
});
