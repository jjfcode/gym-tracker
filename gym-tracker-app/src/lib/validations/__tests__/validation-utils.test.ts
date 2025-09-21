import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  sanitizedString,
  sanitizedEmail,
  sanitizedNumber,
  sanitizedDate,
  formatValidationErrors,
  safeValidate,
  createFormValidator,
  securityValidation,
  secureString,
  workoutValidation,
  userValidation,
  dateValidation,
  validateBatch,
} from '../validation-utils';

describe('Validation Utils', () => {
  describe('sanitizedString', () => {
    it('should sanitize and validate strings', () => {
      const schema = sanitizedString({ maxLength: 10 });
      
      const result1 = schema.parse('  Hello World  ');
      expect(result1).toBe('Hello Worl'); // Truncated to 10 chars
      
      const result2 = schema.parse('<script>alert("xss")</script>');
      expect(result2).toBe('alert("xss")'); // HTML stripped
    });

    it('should handle invalid input', () => {
      const schema = sanitizedString();
      
      expect(() => schema.parse(123)).toThrow();
      expect(() => schema.parse(null)).toThrow();
    });
  });

  describe('sanitizedEmail', () => {
    it('should sanitize and validate emails', () => {
      const schema = sanitizedEmail();
      
      const result = schema.parse('  TEST@EXAMPLE.COM  ');
      expect(result).toBe('test@example.com');
    });

    it('should reject invalid emails', () => {
      const schema = sanitizedEmail();
      
      expect(() => schema.parse('invalid-email')).toThrow();
      expect(() => schema.parse('test@')).toThrow();
    });
  });

  describe('sanitizedNumber', () => {
    it('should sanitize and validate numbers', () => {
      const schema = sanitizedNumber({ min: 0, max: 100, decimals: 1 });
      
      expect(schema.parse('50.67')).toBe(50.7);
      expect(schema.parse(75)).toBe(75);
      expect(schema.parse('150')).toBe(100); // Clamped to max
      expect(schema.parse('-10')).toBe(0);   // Clamped to min
    });

    it('should reject invalid numbers', () => {
      const schema = sanitizedNumber();
      
      expect(() => schema.parse('not-a-number')).toThrow();
      expect(() => schema.parse('')).toThrow();
    });
  });

  describe('sanitizedDate', () => {
    it('should sanitize and validate dates', () => {
      const schema = sanitizedDate();
      
      expect(schema.parse('2023-12-25')).toBe('2023-12-25');
      expect(schema.parse(new Date('2023-12-25'))).toBe('2023-12-25');
    });

    it('should reject invalid dates', () => {
      const schema = sanitizedDate();
      
      expect(() => schema.parse('invalid-date')).toThrow();
      expect(() => schema.parse('2023-13-45')).toThrow();
    });
  });

  describe('formatValidationErrors', () => {
    it('should format Zod errors correctly', () => {
      const schema = z.object({
        name: z.string().min(2, 'Name too short'),
        age: z.number().min(18, 'Must be adult'),
      });

      const result = schema.safeParse({ name: 'A', age: 16 });
      
      if (!result.success) {
        const formatted = formatValidationErrors(result.error);
        expect(formatted).toEqual({
          'name': 'Name too short',
          'age': 'Must be adult',
        });
      }
    });

    it('should handle nested field errors', () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string().min(2, 'Name required'),
          }),
        }),
      });

      const result = schema.safeParse({ user: { profile: { name: '' } } });
      
      if (!result.success) {
        const formatted = formatValidationErrors(result.error);
        expect(formatted['user.profile.name']).toBe('Name required');
      }
    });
  });

  describe('safeValidate', () => {
    it('should return success for valid data', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const result = safeValidate(schema, { name: 'John', age: 30 });
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: 'John', age: 30 });
      }
    });

    it('should return formatted errors for invalid data', () => {
      const schema = z.object({
        name: z.string().min(2, 'Name too short'),
        age: z.number().min(18, 'Must be adult'),
      });

      const result = safeValidate(schema, { name: 'A', age: 16 });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toEqual({
          'name': 'Name too short',
          'age': 'Must be adult',
        });
      }
    });
  });

  describe('createFormValidator', () => {
    it('should create a validator function', () => {
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(8),
      });

      const validator = createFormValidator(schema);
      
      const result1 = validator({ email: 'test@example.com', password: 'password123' });
      expect(result1.success).toBe(true);
      
      const result2 = validator({ email: 'invalid', password: '123' });
      expect(result2.success).toBe(false);
    });
  });

  describe('securityValidation', () => {
    describe('checkSqlInjection', () => {
      it('should detect SQL injection attempts', () => {
        expect(securityValidation.checkSqlInjection("'; DROP TABLE users; --")).toBe(true);
        expect(securityValidation.checkSqlInjection('SELECT * FROM users')).toBe(true);
        expect(securityValidation.checkSqlInjection('Normal text')).toBe(false);
      });

      it('should be case insensitive', () => {
        expect(securityValidation.checkSqlInjection('select * from users')).toBe(true);
        expect(securityValidation.checkSqlInjection('SeLeCt * FrOm users')).toBe(true);
      });
    });

    describe('checkXssAttempt', () => {
      it('should detect XSS attempts', () => {
        expect(securityValidation.checkXssAttempt('<script>alert("xss")</script>')).toBe(true);
        expect(securityValidation.checkXssAttempt('javascript:alert("xss")')).toBe(true);
        expect(securityValidation.checkXssAttempt('onclick="alert()"')).toBe(true);
        expect(securityValidation.checkXssAttempt('Normal text')).toBe(false);
      });
    });

    describe('isSafeInput', () => {
      it('should identify safe input', () => {
        expect(securityValidation.isSafeInput('Normal text')).toBe(true);
        expect(securityValidation.isSafeInput('User input with numbers 123')).toBe(true);
      });

      it('should identify unsafe input', () => {
        expect(securityValidation.isSafeInput('<script>alert("xss")</script>')).toBe(false);
        expect(securityValidation.isSafeInput("'; DROP TABLE users; --")).toBe(false);
      });
    });
  });

  describe('secureString', () => {
    it('should validate secure strings', () => {
      const schema = secureString({ maxLength: 20 });
      
      const result = schema.parse('  Safe input text  ');
      expect(result).toBe('Safe input text');
    });

    it('should reject unsafe input', () => {
      const schema = secureString();
      
      expect(() => schema.parse('<script>alert("xss")</script>')).toThrow('Input contains potentially unsafe content');
      expect(() => schema.parse("'; DROP TABLE users; --")).toThrow('Input contains potentially unsafe content');
    });

    it('should enforce length limits', () => {
      const schema = secureString({ minLength: 5, maxLength: 10 });
      
      expect(() => schema.parse('abc')).toThrow('Must be at least 5 characters');
      
      const longText = 'a'.repeat(20);
      const result = schema.parse(longText);
      expect(result.length).toBe(10);
    });

    it('should validate patterns', () => {
      const schema = secureString({ pattern: /^[a-zA-Z]+$/ });
      
      expect(schema.parse('ValidText')).toBe('ValidText');
      expect(() => schema.parse('Invalid123')).toThrow('Input format is invalid');
    });
  });

  describe('workoutValidation', () => {
    describe('weight', () => {
      it('should validate weight in lbs', () => {
        const schema = workoutValidation.weight('lbs');
        
        expect(schema.parse('150.5')).toBe(150.5);
        expect(schema.parse(200)).toBe(200);
      });

      it('should validate weight in kg', () => {
        const schema = workoutValidation.weight('kg');
        
        expect(schema.parse('70.5')).toBe(70.5);
        expect(schema.parse(90)).toBe(90);
      });

      it('should enforce weight limits', () => {
        const schemaLbs = workoutValidation.weight('lbs');
        const schemaKg = workoutValidation.weight('kg');
        
        expect(() => schemaLbs.parse('1000')).toThrow('Weight must be between 20 and 800 lbs');
        expect(() => schemaKg.parse('500')).toThrow('Weight must be between 9 and 363 kg');
      });
    });

    describe('reps', () => {
      it('should validate reps', () => {
        const schema = workoutValidation.reps();
        
        expect(schema.parse('12')).toBe(12);
        expect(schema.parse(8)).toBe(8);
      });

      it('should enforce reps limits and integer constraint', () => {
        const schema = workoutValidation.reps();
        
        expect(() => schema.parse('0')).toThrow();
        expect(() => schema.parse('150')).toThrow();
        expect(() => schema.parse('12.5')).toThrow('Reps must be a whole number');
      });
    });

    describe('rpe', () => {
      it('should validate RPE', () => {
        const schema = workoutValidation.rpe();
        
        expect(schema.parse('8.5')).toBe(8.5);
        expect(schema.parse(7)).toBe(7);
      });

      it('should enforce RPE limits', () => {
        const schema = workoutValidation.rpe();
        
        expect(() => schema.parse('0')).toThrow('RPE must be between 1 and 10');
        expect(() => schema.parse('15')).toThrow('RPE must be between 1 and 10');
      });
    });

    describe('exerciseName', () => {
      it('should validate exercise names', () => {
        const schema = workoutValidation.exerciseName();
        
        expect(schema.parse('Bench Press')).toBe('Bench Press');
        expect(schema.parse('Squat (Back)')).toBe('Squat (Back)');
      });

      it('should reject invalid exercise names', () => {
        const schema = workoutValidation.exerciseName();
        
        expect(() => schema.parse('')).toThrow();
        expect(() => schema.parse('<script>alert("xss")</script>')).toThrow();
      });
    });
  });

  describe('userValidation', () => {
    describe('displayName', () => {
      it('should validate display names', () => {
        const schema = userValidation.displayName();
        
        expect(schema.parse('John Doe')).toBe('John Doe');
        expect(schema.parse('User_123')).toBe('User_123');
      });

      it('should enforce length and pattern constraints', () => {
        const schema = userValidation.displayName();
        
        expect(() => schema.parse('A')).toThrow();
        expect(() => schema.parse('a'.repeat(60))).toThrow();
      });
    });

    describe('email', () => {
      it('should validate emails', () => {
        const schema = userValidation.email();
        
        expect(schema.parse('test@example.com')).toBe('test@example.com');
        expect(schema.parse('  USER@DOMAIN.ORG  ')).toBe('user@domain.org');
      });

      it('should enforce email length limits', () => {
        const schema = userValidation.email();
        
        const longEmail = 'a'.repeat(250) + '@example.com';
        expect(() => schema.parse(longEmail)).toThrow('Email address is too long');
      });
    });

    describe('password', () => {
      it('should validate strong passwords', () => {
        const schema = userValidation.password();
        
        expect(schema.parse('StrongPass123!')).toBe('StrongPass123!');
      });

      it('should enforce password requirements', () => {
        const schema = userValidation.password();
        
        expect(() => schema.parse('weak')).toThrow('Password must be at least 8 characters');
        expect(() => schema.parse('nouppercase123!')).toThrow('Password must contain at least one uppercase letter');
        expect(() => schema.parse('NOLOWERCASE123!')).toThrow('Password must contain at least one lowercase letter');
        expect(() => schema.parse('NoNumbers!')).toThrow('Password must contain at least one number');
        expect(() => schema.parse('NoSpecialChars123')).toThrow('Password must contain at least one special character');
      });
    });
  });

  describe('dateValidation', () => {
    describe('pastDate', () => {
      it('should validate past dates', () => {
        const schema = dateValidation.pastDate();
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        expect(schema.parse(yesterdayStr)).toBe(yesterdayStr);
      });

      it('should reject future dates', () => {
        const schema = dateValidation.pastDate();
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        expect(() => schema.parse(tomorrowStr)).toThrow('Date cannot be in the future');
      });
    });

    describe('futureDate', () => {
      it('should validate future dates', () => {
        const schema = dateValidation.futureDate();
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        expect(schema.parse(tomorrowStr)).toBe(tomorrowStr);
      });

      it('should reject past dates', () => {
        const schema = dateValidation.futureDate();
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        expect(() => schema.parse(yesterdayStr)).toThrow('Date cannot be in the past');
      });
    });

    describe('dateRange', () => {
      it('should validate dates within range', () => {
        const minDate = new Date('2023-01-01');
        const maxDate = new Date('2023-12-31');
        const schema = dateValidation.dateRange(minDate, maxDate);
        
        expect(schema.parse('2023-06-15')).toBe('2023-06-15');
      });

      it('should reject dates outside range', () => {
        const minDate = new Date('2023-01-01');
        const maxDate = new Date('2023-12-31');
        const schema = dateValidation.dateRange(minDate, maxDate);
        
        expect(() => schema.parse('2022-12-31')).toThrow('Date must be after 2023-01-01');
        expect(() => schema.parse('2024-01-01')).toThrow('Date must be before 2023-12-31');
      });
    });
  });

  describe('validateBatch', () => {
    it('should validate multiple fields successfully', () => {
      const data = {
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
      };

      const validators = {
        name: z.string().min(2),
        age: z.number().min(18),
        email: z.string().email(),
      };

      const result = validateBatch(data, validators);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    it('should return errors for invalid fields', () => {
      const data = {
        name: 'A',
        age: 16,
        email: 'invalid-email',
      };

      const validators = {
        name: z.string().min(2, 'Name too short'),
        age: z.number().min(18, 'Must be adult'),
        email: z.string().email('Invalid email'),
      };

      const result = validateBatch(data, validators);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toEqual({
          name: 'Name too short',
          age: 'Must be adult',
          email: 'Invalid email',
        });
      }
    });

    it('should validate only provided fields', () => {
      const data = {
        name: 'John Doe',
        // age is missing
      };

      const validators = {
        name: z.string().min(2),
        age: z.number().min(18),
      };

      const result = validateBatch(data, validators);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.name).toBeUndefined();
        expect(result.errors.age).toBeDefined();
      }
    });
  });
});