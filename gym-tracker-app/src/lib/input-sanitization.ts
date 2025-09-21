/**
 * Input sanitization utilities for security and data integrity
 */

// HTML entities for escaping
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Escapes HTML characters to prevent XSS attacks
 */
export function escapeHtml(input: string): string {
  if (typeof input !== 'string') {
    return String(input);
  }
  
  return input.replace(/[&<>"'/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Removes HTML tags from input
 */
export function stripHtml(input: string): string {
  if (typeof input !== 'string') {
    return String(input);
  }
  
  // Remove HTML tags including script tags and their content
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags and content
    .replace(/<[^>]*>/g, ''); // Remove remaining HTML tags
}

/**
 * Sanitizes text input by trimming whitespace and escaping HTML
 */
export function sanitizeText(input: string, options: {
  maxLength?: number;
  allowHtml?: boolean;
  trim?: boolean;
} = {}): string {
  const { maxLength, allowHtml = false, trim = true } = options;
  
  if (typeof input !== 'string') {
    input = String(input);
  }
  
  // Remove or escape HTML first
  if (!allowHtml) {
    input = stripHtml(input);
  } else {
    input = escapeHtml(input);
  }
  
  // Trim whitespace after HTML processing
  if (trim) {
    input = input.trim();
  }
  
  // Truncate if necessary
  if (maxLength && input.length > maxLength) {
    input = input.substring(0, maxLength);
  }
  
  return input;
}

/**
 * Sanitizes email input
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') {
    return '';
  }
  
  return email.toLowerCase().trim();
}

/**
 * Sanitizes numeric input
 */
export function sanitizeNumber(input: string | number, options: {
  min?: number;
  max?: number;
  decimals?: number;
  allowNegative?: boolean;
} = {}): number | null {
  const { min, max, decimals, allowNegative = true } = options;
  
  let num: number;
  
  if (typeof input === 'number') {
    num = input;
  } else if (typeof input === 'string') {
    // Check if string contains any digits
    if (!/\d/.test(input)) {
      return null;
    }
    
    // Remove non-numeric characters except decimal point and minus sign
    const cleaned = input.replace(/[^0-9.-]/g, '');
    if (cleaned === '' || cleaned === '.' || cleaned === '-') {
      return null;
    }
    num = parseFloat(cleaned);
  } else {
    return null;
  }
  
  // Check if valid number
  if (isNaN(num) || !isFinite(num)) {
    return null;
  }
  
  // Handle negative numbers
  if (!allowNegative && num < 0) {
    num = Math.abs(num);
  }
  
  // Round to specified decimal places
  if (typeof decimals === 'number') {
    num = Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }
  
  // Apply min/max constraints
  if (typeof min === 'number') {
    num = Math.max(num, min);
  }
  if (typeof max === 'number') {
    num = Math.min(num, max);
  }
  
  return num;
}

/**
 * Sanitizes date input
 */
export function sanitizeDate(input: string | Date): string | null {
  let date: Date;
  
  if (input instanceof Date) {
    date = input;
  } else if (typeof input === 'string') {
    date = new Date(input);
  } else {
    return null;
  }
  
  // Check if valid date
  if (isNaN(date.getTime())) {
    return null;
  }
  
  // Return ISO date string (YYYY-MM-DD)
  return date.toISOString().split('T')[0];
}

/**
 * Sanitizes workout notes and comments
 */
export function sanitizeNotes(notes: string, maxLength = 1000): string {
  return sanitizeText(notes, {
    maxLength,
    allowHtml: false,
    trim: true,
  });
}

/**
 * Sanitizes exercise name
 */
export function sanitizeExerciseName(name: string): string {
  return sanitizeText(name, {
    maxLength: 100,
    allowHtml: false,
    trim: true,
  });
}

/**
 * Sanitizes user display name
 */
export function sanitizeDisplayName(name: string): string {
  return sanitizeText(name, {
    maxLength: 50,
    allowHtml: false,
    trim: true,
  });
}

/**
 * Validates and sanitizes weight input
 */
export function sanitizeWeight(weight: string | number, unit: 'kg' | 'lbs' = 'lbs'): number | null {
  const maxWeight = unit === 'kg' ? 363 : 800; // 800 lbs = ~363 kg
  const minWeight = unit === 'kg' ? 9 : 20;    // 20 lbs = ~9 kg
  
  return sanitizeNumber(weight, {
    min: minWeight,
    max: maxWeight,
    decimals: 1,
    allowNegative: false,
  });
}

/**
 * Validates and sanitizes reps input
 */
export function sanitizeReps(reps: string | number): number | null {
  return sanitizeNumber(reps, {
    min: 1,
    max: 100,
    decimals: 0,
    allowNegative: false,
  });
}

/**
 * Validates and sanitizes RPE input
 */
export function sanitizeRPE(rpe: string | number): number | null {
  return sanitizeNumber(rpe, {
    min: 1,
    max: 10,
    decimals: 1,
    allowNegative: false,
  });
}

/**
 * Sanitizes SQL-like input to prevent injection attacks
 */
export function sanitizeSqlInput(input: string): string {
  if (typeof input !== 'string') {
    return String(input);
  }
  
  // Remove potentially dangerous SQL keywords and characters
  const dangerous = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
    'EXEC', 'EXECUTE', 'UNION', 'SCRIPT', '--', ';', 'xp_', 'sp_', 
    'INFORMATION_SCHEMA', 'sysobjects', 'syscolumns'
  ];
  
  let sanitized = input;
  dangerous.forEach(keyword => {
    // Escape special regex characters
    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedKeyword, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  // Handle comment patterns separately
  sanitized = sanitized.replace(/\/\*[\s\S]*?\*\//g, ''); // /* */ comments
  sanitized = sanitized.replace(/--.*$/gm, ''); // -- comments
  
  return sanitized.trim();
}

/**
 * Validates file upload input
 */
export function sanitizeFileName(fileName: string): string {
  if (typeof fileName !== 'string') {
    return '';
  }
  
  // Remove path traversal attempts and dangerous characters
  return fileName
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
    .replace(/\.\./g, '')         // Remove path traversal
    .replace(/^\.+/, '')          // Remove leading dots
    .trim()
    .substring(0, 255);           // Limit length
}

/**
 * Comprehensive input sanitizer that applies appropriate sanitization based on input type
 */
export function sanitizeInput(input: any, type: 'text' | 'email' | 'number' | 'date' | 'notes' | 'weight' | 'reps' | 'rpe', options?: any): any {
  if (input === null || input === undefined) {
    return null;
  }
  
  switch (type) {
    case 'text':
      return sanitizeText(input, options);
    case 'email':
      return sanitizeEmail(input);
    case 'number':
      return sanitizeNumber(input, options);
    case 'date':
      return sanitizeDate(input);
    case 'notes':
      return sanitizeNotes(input, options?.maxLength);
    case 'weight':
      return sanitizeWeight(input, options?.unit);
    case 'reps':
      return sanitizeReps(input);
    case 'rpe':
      return sanitizeRPE(input);
    default:
      return sanitizeText(input);
  }
}

/**
 * Batch sanitization for form data
 */
export function sanitizeFormData<T extends Record<string, any>>(
  data: T,
  schema: Record<keyof T, { type: string; options?: any }>
): Partial<T> {
  const sanitized: Partial<T> = {};
  
  for (const [key, config] of Object.entries(schema)) {
    if (key in data) {
      sanitized[key as keyof T] = sanitizeInput(data[key], config.type as any, config.options);
    }
  }
  
  return sanitized;
}