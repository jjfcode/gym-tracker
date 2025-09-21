import { describe, it, expect } from 'vitest';
import {
  signInSchema,
  signUpSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  emailSchema,
  passwordSchema,
} from '../auth';

describe('Auth Validation Schemas', () => {
  describe('emailSchema', () => {
    it('validates correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
      ];

      validEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).not.toThrow();
      });
    });

    it('rejects invalid email addresses', () => {
      const invalidEmails = [
        '',
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        'user space@example.com',
      ];

      invalidEmails.forEach(email => {
        expect(() => emailSchema.parse(email)).toThrow();
      });
    });

    it('provides correct error messages', () => {
      try {
        emailSchema.parse('');
      } catch (error: any) {
        expect(error.errors[0].message).toBe('Email is required');
      }

      try {
        emailSchema.parse('invalid-email');
      } catch (error: any) {
        expect(error.errors[0].message).toBe('Please enter a valid email address');
      }
    });
  });

  describe('passwordSchema', () => {
    it('validates strong passwords', () => {
      const validPasswords = [
        'Password123',
        'MySecure1Pass',
        'Test123Pass',
        'Abcdefgh1',
      ];

      validPasswords.forEach(password => {
        expect(() => passwordSchema.parse(password)).not.toThrow();
      });
    });

    it('rejects weak passwords', () => {
      const invalidPasswords = [
        'short',           // Too short
        'password123',     // No uppercase
        'PASSWORD123',     // No lowercase
        'PasswordABC',     // No number
        'Pass123',         // Too short
      ];

      invalidPasswords.forEach(password => {
        expect(() => passwordSchema.parse(password)).toThrow();
      });
    });

    it('provides correct error messages for different validation failures', () => {
      try {
        passwordSchema.parse('short');
      } catch (error: any) {
        expect(error.errors[0].message).toBe('Password must be at least 8 characters');
      }

      try {
        passwordSchema.parse('password123');
      } catch (error: any) {
        expect(error.errors[0].message).toBe('Password must contain at least one uppercase letter');
      }

      try {
        passwordSchema.parse('PASSWORD123');
      } catch (error: any) {
        expect(error.errors[0].message).toBe('Password must contain at least one lowercase letter');
      }

      try {
        passwordSchema.parse('PasswordABC');
      } catch (error: any) {
        expect(error.errors[0].message).toBe('Password must contain at least one number');
      }
    });
  });

  describe('signInSchema', () => {
    it('validates correct sign in data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'anypassword',
      };

      expect(() => signInSchema.parse(validData)).not.toThrow();
    });

    it('rejects invalid sign in data', () => {
      const invalidData = [
        { email: '', password: 'password' },
        { email: 'invalid-email', password: 'password' },
        { email: 'test@example.com', password: '' },
      ];

      invalidData.forEach(data => {
        expect(() => signInSchema.parse(data)).toThrow();
      });
    });
  });

  describe('signUpSchema', () => {
    it('validates correct sign up data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        displayName: 'Test User',
      };

      expect(() => signUpSchema.parse(validData)).not.toThrow();
    });

    it('validates sign up data without display name', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      };

      expect(() => signUpSchema.parse(validData)).not.toThrow();
    });

    it('rejects mismatched passwords', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword123',
      };

      try {
        signUpSchema.parse(invalidData);
      } catch (error: any) {
        expect(error.errors[0].message).toBe('Passwords do not match');
        expect(error.errors[0].path).toEqual(['confirmPassword']);
      }
    });

    it('validates display name length', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        displayName: 'A', // Too short
      };

      try {
        signUpSchema.parse(invalidData);
      } catch (error: any) {
        expect(error.errors[0].message).toBe('Display name must be at least 2 characters');
      }
    });
  });

  describe('resetPasswordSchema', () => {
    it('validates correct reset password data', () => {
      const validData = {
        email: 'test@example.com',
      };

      expect(() => resetPasswordSchema.parse(validData)).not.toThrow();
    });

    it('rejects invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
      };

      expect(() => resetPasswordSchema.parse(invalidData)).toThrow();
    });
  });

  describe('updatePasswordSchema', () => {
    it('validates correct update password data', () => {
      const validData = {
        password: 'NewPassword123',
        confirmPassword: 'NewPassword123',
      };

      expect(() => updatePasswordSchema.parse(validData)).not.toThrow();
    });

    it('rejects mismatched passwords', () => {
      const invalidData = {
        password: 'NewPassword123',
        confirmPassword: 'DifferentPassword123',
      };

      try {
        updatePasswordSchema.parse(invalidData);
      } catch (error: any) {
        expect(error.errors[0].message).toBe('Passwords do not match');
        expect(error.errors[0].path).toEqual(['confirmPassword']);
      }
    });

    it('validates password strength', () => {
      const invalidData = {
        password: 'weak',
        confirmPassword: 'weak',
      };

      try {
        updatePasswordSchema.parse(invalidData);
      } catch (error: any) {
        expect(error.errors[0].message).toBe('Password must be at least 8 characters');
      }
    });
  });
});