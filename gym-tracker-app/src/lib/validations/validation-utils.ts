import { z } from 'zod';
import { sanitizeInput } from '../input-sanitization';

/**
 * Enhanced validation utilities with sanitization
 */

// Custom Zod transformers for sanitization
export const sanitizedString = (options: {
  maxLength?: number;
  allowHtml?: boolean;
  trim?: boolean;
} = {}) => 
  z.string()
    .transform(val => sanitizeInput(val, 'text', options))
    .refine(val => typeof val === 'string', 'Must be a valid string');

export const sanitizedEmail = () =>
  z.string()
    .email('Must be a valid email address')
    .transform(val => sanitizeInput(val, 'email'));

export const sanitizedNumber = (options: {
  min?: number;
  max?: number;
  decimals?: number;
  allowNegative?: boolean;
} = {}) =>
  z.union([z.string(), z.number()])
    .transform(val => sanitizeInput(val, 'number', options))
    .refine(val => val !== null, 'Must be a valid number')
    .transform(val => val as number);

export const sanitizedDate = () =>
  z.union([z.string(), z.date()])
    .transform(val => {
      if (val instanceof Date) {
        return sanitizeInput(val, 'date');
      }
      return sanitizeInput(val, 'date');
    })
    .refine(val => val !== null, 'Must be a valid date')
    .transform(val => val as string);

// Common validation patterns
export const patterns = {
  // Date patterns
  dateISO: /^\d{4}-\d{2}-\d{2}$/,
  dateTimeISO: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
  
  // Exercise patterns
  exerciseSlug: /^[a-z0-9-]+$/,
  
  // Numeric patterns
  positiveNumber: /^\d*\.?\d+$/,
  wholeNumber: /^\d+$/,
  
  // Text patterns
  displayName: /^[a-zA-Z0-9\s\-_.]+$/,
  
  // Security patterns (to detect potential attacks)
  sqlInjection: /(union|select|insert|update|delete|drop|create|alter|exec|script)/i,
  xssAttempt: /(<script|javascript:|on\w+\s*=)/i,
};

/**
 * Validation error formatter
 */
export function formatValidationErrors(errors: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  
  errors.errors.forEach(error => {
    const path = error.path.join('.');
    formatted[path] = error.message;
  });
  
  return formatted;
}

/**
 * Safe validation that returns formatted errors
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return {
    success: false,
    errors: formatValidationErrors(result.error),
  };
}

/**
 * Validation middleware for form data
 */
export function createFormValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown) => {
    return safeValidate(schema, data);
  };
}

/**
 * Security validation helpers
 */
export const securityValidation = {
  // Check for SQL injection attempts
  checkSqlInjection: (input: string): boolean => {
    return patterns.sqlInjection.test(input);
  },
  
  // Check for XSS attempts
  checkXssAttempt: (input: string): boolean => {
    return patterns.xssAttempt.test(input);
  },
  
  // Validate input is safe
  isSafeInput: (input: string): boolean => {
    return !securityValidation.checkSqlInjection(input) && 
           !securityValidation.checkXssAttempt(input);
  },
};

/**
 * Enhanced string validation with security checks
 */
export const secureString = (options: {
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
  allowHtml?: boolean;
} = {}) =>
  z.string()
    .min(options.minLength || 0, `Must be at least ${options.minLength || 0} characters`)
    .max(options.maxLength || 1000, `Must be less than ${options.maxLength || 1000} characters`)
    .refine(
      val => securityValidation.isSafeInput(val),
      'Input contains potentially unsafe content'
    )
    .refine(
      val => !options.pattern || options.pattern.test(val),
      'Input format is invalid'
    )
    .transform(val => sanitizeInput(val, 'text', {
      maxLength: options.maxLength,
      allowHtml: options.allowHtml || false,
      trim: true,
    }));

/**
 * Workout-specific validation helpers
 */
export const workoutValidation = {
  weight: (unit: 'kg' | 'lbs' = 'lbs') => {
    const maxWeight = unit === 'kg' ? 363 : 800;
    const minWeight = unit === 'kg' ? 9 : 20;
    
    return z.union([z.string(), z.number()])
      .transform(val => sanitizeInput(val, 'weight', { unit }))
      .refine(val => val !== null, 'Must be a valid weight')
      .transform(val => val as number)
      .refine(
        val => val >= minWeight && val <= maxWeight,
        `Weight must be between ${minWeight} and ${maxWeight} ${unit}`
      );
  },
  
  reps: () => z.union([z.string(), z.number()])
    .transform(val => sanitizeInput(val, 'reps'))
    .refine(val => val !== null, 'Must be a valid number of reps')
    .transform(val => val as number)
    .refine(
      val => Number.isInteger(val) && val >= 1 && val <= 100,
      'Reps must be a whole number between 1 and 100'
    ),
  
  rpe: () => z.union([z.string(), z.number()])
    .transform(val => sanitizeInput(val, 'rpe'))
    .refine(val => val !== null, 'Must be a valid RPE')
    .transform(val => val as number)
    .refine(
      val => val >= 1 && val <= 10,
      'RPE must be between 1 and 10'
    ),
  
  exerciseName: () => secureString({
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_.()]+$/,
  }),
  
  workoutNotes: () => secureString({
    maxLength: 1000,
    allowHtml: false,
  }),
};

/**
 * User input validation helpers
 */
export const userValidation = {
  displayName: () => secureString({
    minLength: 2,
    maxLength: 50,
    pattern: patterns.displayName,
  }),
  
  email: () => z.string()
    .email('Must be a valid email address')
    .max(254, 'Email address is too long')
    .transform(val => sanitizeInput(val, 'email')),
  
  password: () => z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .refine(
      password => /[A-Z]/.test(password),
      'Password must contain at least one uppercase letter'
    )
    .refine(
      password => /[a-z]/.test(password),
      'Password must contain at least one lowercase letter'
    )
    .refine(
      password => /[0-9]/.test(password),
      'Password must contain at least one number'
    )
    .refine(
      password => /[^A-Za-z0-9]/.test(password),
      'Password must contain at least one special character'
    ),
};

/**
 * Date validation helpers
 */
export const dateValidation = {
  pastDate: () => sanitizedDate()
    .refine(
      date => new Date(date) <= new Date(),
      'Date cannot be in the future'
    ),
  
  futureDate: () => sanitizedDate()
    .refine(
      date => new Date(date) >= new Date(),
      'Date cannot be in the past'
    ),
  
  dateRange: (minDate?: Date, maxDate?: Date) => sanitizedDate()
    .refine(
      date => !minDate || new Date(date) >= minDate,
      `Date must be after ${minDate?.toISOString().split('T')[0]}`
    )
    .refine(
      date => !maxDate || new Date(date) <= maxDate,
      `Date must be before ${maxDate?.toISOString().split('T')[0]}`
    ),
};

/**
 * Batch validation for multiple fields
 */
export function validateBatch<T extends Record<string, any>>(
  data: T,
  validators: Record<keyof T, z.ZodSchema>
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const validatedData: Partial<T> = {};
  
  for (const [key, validator] of Object.entries(validators)) {
    const result = validator.safeParse(data[key]);
    
    if (result.success) {
      validatedData[key as keyof T] = result.data;
    } else {
      const errorMessage = result.error?.issues?.[0]?.message || 
                          result.error?.errors?.[0]?.message || 
                          'Validation failed';
      errors[key] = errorMessage;
    }
  }
  
  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }
  
  return { success: true, data: validatedData as T };
}