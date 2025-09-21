import { describe, it, expect } from 'vitest';
import {
  signInSchema,
  signUpSchema,
  resetPasswordSchema,
  emailSchema,
  passwordSchema,
} from '../auth';

describe('Auth Validation Schemas - Basic Tests', () => {
  describe('emailSchema', () => {
    it('accepts valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
      ];

      validEmails.forEach(email => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(true);
      });
    });

    it('rejects invalid email addresses', () => {
      const invalidEmails = [
        '',
        'invalid-email',
        '@example.com',
        'user@',
      ];

      invalidEmails.forEach(email => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('passwordSchema', () => {
    it('accepts strong passwords', () => {
      const validPasswords = [
        'Password123',
        'MySecure1Pass',
        'Test123Pass',
      ];

      validPasswords.forEach(password => {
        const result = passwordSchema.safeParse(password);
        expect(result.success).toBe(true);
      });
    });

    it('rejects weak passwords', () => {
      const invalidPasswords = [
        'short',           // Too short
        'password123',     // No uppercase
        'PASSWORD123',     // No lowercase
        'PasswordABC',     // No number
      ];

      invalidPasswords.forEach(password => {
        const result = passwordSchema.safeParse(password);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('signInSchema', () => {
    it('accepts valid sign in data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'anypassword',
      };

      const result = signInSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects invalid data', () => {
      const invalidData = {
        email: 'invalid-email',
        password: '',
      };

      const result = signInSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('signUpSchema', () => {
    it('accepts valid sign up data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        displayName: 'Test User',
      };

      const result = signUpSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('accepts sign up data without display name', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      };

      const result = signUpSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects mismatched passwords', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword123',
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    it('accepts valid email', () => {
      const validData = {
        email: 'test@example.com',
      };

      const result = resetPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
      };

      const result = resetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});