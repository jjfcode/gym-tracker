/**
 * Security middleware for API requests and data operations
 * Provides CSRF protection, input validation, and request sanitization
 */

import { SecurityService } from './security';
import { sanitizeFormData } from './input-sanitization';
import { supabase } from './supabase';

// Request context interface
interface RequestContext {
  userId?: string;
  operation: 'create' | 'read' | 'update' | 'delete';
  resource: string;
  data?: any;
}

// Security middleware configuration
const MIDDLEWARE_CONFIG = {
  // Operations that require CSRF protection
  csrfProtectedOperations: ['create', 'update', 'delete'],
  
  // Resources that require additional validation
  sensitiveResources: ['profile', 'weight_logs', 'plans', 'custom_exercises'],
  
  // Rate limiting per resource type
  resourceRateLimits: {
    profile: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 per minute
    weight_logs: { maxRequests: 50, windowMs: 60 * 1000 }, // 50 per minute
    workouts: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per minute
    exercises: { maxRequests: 200, windowMs: 60 * 1000 }, // 200 per minute
    exercise_sets: { maxRequests: 500, windowMs: 60 * 1000 }, // 500 per minute
  },
};

/**
 * Security middleware class
 */
export class SecurityMiddleware {
  /**
   * Main middleware function for securing API requests
   */
  static async secureRequest<T>(
    context: RequestContext,
    requestFn: () => Promise<T>
  ): Promise<T> {
    // 1. Validate user authentication
    await this.validateAuthentication(context);
    
    // 2. Check CSRF protection for state-changing operations
    if (MIDDLEWARE_CONFIG.csrfProtectedOperations.includes(context.operation)) {
      this.validateCSRFProtection();
    }
    
    // 3. Apply rate limiting
    await this.applyRateLimit(context);
    
    // 4. Validate and sanitize input data
    if (context.data) {
      context.data = await this.validateAndSanitizeData(context);
    }
    
    // 5. Check resource-specific permissions
    await this.validateResourcePermissions(context);
    
    // 6. Execute the request with monitoring
    return await this.executeWithMonitoring(context, requestFn);
  }

  /**
   * Validate user authentication and session
   */
  private static async validateAuthentication(context: RequestContext): Promise<void> {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      await SecurityService.logSecurityEvent('invalid_token', {
        operation: context.operation,
        resource: context.resource,
        error: error.message,
      }, 'medium');
      throw new Error('Authentication validation failed');
    }
    
    if (!session || !session.user) {
      await SecurityService.logSecurityEvent('invalid_token', {
        operation: context.operation,
        resource: context.resource,
        error: 'No valid session',
      }, 'medium');
      throw new Error('Authentication required');
    }
    
    // Check if session is expired
    const expiresAt = new Date(session.expires_at! * 1000);
    if (expiresAt <= new Date()) {
      await SecurityService.logSecurityEvent('invalid_token', {
        operation: context.operation,
        resource: context.resource,
        error: 'Session expired',
      }, 'low');
      throw new Error('Session expired. Please sign in again.');
    }
    
    context.userId = session.user.id;
  }

  /**
   * Validate CSRF protection
   */
  private static validateCSRFProtection(): void {
    const token = SecurityService.getCSRFToken();
    if (!token) {
      throw new Error('CSRF token missing. Please refresh the page.');
    }
    
    // In a real implementation, you would validate the token against a server-side store
    // For now, we just check that it exists and is properly formatted
    if (token.length < 32) {
      throw new Error('Invalid CSRF token format');
    }
  }

  /**
   * Apply rate limiting based on resource type
   */
  private static async applyRateLimit(context: RequestContext): Promise<void> {
    if (!context.userId) return;
    
    const resourceConfig = MIDDLEWARE_CONFIG.resourceRateLimits[
      context.resource as keyof typeof MIDDLEWARE_CONFIG.resourceRateLimits
    ];
    
    if (resourceConfig) {
      const rateLimitKey = `${context.userId}_${context.resource}`;
      const isAllowed = SecurityService.checkRateLimit(rateLimitKey, 'api');
      
      if (!isAllowed) {
        await SecurityService.logSecurityEvent('rate_limit_exceeded', {
          userId: context.userId,
          operation: context.operation,
          resource: context.resource,
        }, 'medium');
        throw new Error(`Rate limit exceeded for ${context.resource}. Please slow down.`);
      }
    }
  }

  /**
   * Validate and sanitize input data based on resource type
   */
  private static async validateAndSanitizeData(context: RequestContext): Promise<any> {
    const { resource, data, operation } = context;
    
    // Define validation schemas for different resources
    const validationSchemas = {
      profile: {
        display_name: { type: 'text', options: { maxLength: 50 } },
        locale: { type: 'text', options: { maxLength: 5 } },
        units: { type: 'text', options: { maxLength: 10 } },
        theme: { type: 'text', options: { maxLength: 10 } },
      },
      weight_logs: {
        weight: { type: 'weight', options: { unit: data.unit || 'lbs' } },
        measured_at: { type: 'date' },
        note: { type: 'notes', options: { maxLength: 500 } },
      },
      workouts: {
        title: { type: 'text', options: { maxLength: 100 } },
        date: { type: 'date' },
        notes: { type: 'notes', options: { maxLength: 1000 } },
        duration_minutes: { type: 'number', options: { min: 1, max: 600 } },
      },
      exercises: {
        slug: { type: 'text', options: { maxLength: 100 } },
        name_en: { type: 'text', options: { maxLength: 100 } },
        name_es: { type: 'text', options: { maxLength: 100 } },
        target_sets: { type: 'number', options: { min: 1, max: 20 } },
        target_reps: { type: 'number', options: { min: 1, max: 100 } },
        order_index: { type: 'number', options: { min: 0, max: 100 } },
      },
      exercise_sets: {
        weight: { type: 'weight', options: { unit: data.unit || 'lbs' } },
        reps: { type: 'reps' },
        rpe: { type: 'rpe' },
        set_index: { type: 'number', options: { min: 1, max: 20 } },
        notes: { type: 'notes', options: { maxLength: 200 } },
      },
      custom_exercises: {
        slug: { type: 'text', options: { maxLength: 100 } },
        name_en: { type: 'text', options: { maxLength: 100 } },
        name_es: { type: 'text', options: { maxLength: 100 } },
        instructions_en: { type: 'notes', options: { maxLength: 2000 } },
        instructions_es: { type: 'notes', options: { maxLength: 2000 } },
        equipment: { type: 'text', options: { maxLength: 50 } },
        difficulty_level: { type: 'text', options: { maxLength: 20 } },
      },
    };
    
    const schema = validationSchemas[resource as keyof typeof validationSchemas];
    if (!schema) {
      return data; // No validation schema defined, return as-is
    }
    
    // Sanitize the data
    const sanitized = sanitizeFormData(data, schema);
    
    // Additional validation for specific operations
    if (operation === 'create') {
      // Ensure required fields are present for creation
      await this.validateRequiredFields(resource, sanitized);
    }
    
    return sanitized;
  }

  /**
   * Validate required fields for resource creation
   */
  private static async validateRequiredFields(resource: string, data: any): Promise<void> {
    const requiredFields = {
      profile: ['display_name'],
      weight_logs: ['weight', 'measured_at'],
      workouts: ['title', 'date'],
      exercises: ['slug', 'name_en', 'name_es', 'target_sets', 'target_reps'],
      exercise_sets: ['set_index'],
      custom_exercises: ['slug', 'name_en', 'name_es'],
    };
    
    const required = requiredFields[resource as keyof typeof requiredFields];
    if (!required) return;
    
    const missing = required.filter(field => !data[field] && data[field] !== 0);
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
  }

  /**
   * Validate resource-specific permissions
   */
  private static async validateResourcePermissions(context: RequestContext): Promise<void> {
    const { userId, operation, resource, data } = context;
    
    // For sensitive resources, add additional checks
    if (MIDDLEWARE_CONFIG.sensitiveResources.includes(resource)) {
      // Ensure user can only access their own data
      if (data && data.user_id && data.user_id !== userId) {
        await SecurityService.logSecurityEvent('suspicious_activity', {
          userId,
          operation,
          resource,
          attemptedUserId: data.user_id,
          type: 'unauthorized_access_attempt',
        }, 'high');
        throw new Error('Access denied: Cannot access other users\' data');
      }
      
      // Check for suspicious data patterns
      await this.detectSuspiciousDataPatterns(context);
    }
  }

  /**
   * Detect suspicious data patterns
   */
  private static async detectSuspiciousDataPatterns(context: RequestContext): Promise<void> {
    const { userId, data, resource } = context;
    
    if (!data) return;
    
    // Check for SQL injection attempts in text fields
    const textFields = Object.entries(data).filter(([_, value]) => typeof value === 'string');
    for (const [field, value] of textFields) {
      if (this.containsSQLInjectionPattern(value as string)) {
        await SecurityService.logSecurityEvent('suspicious_activity', {
          userId,
          resource,
          field,
          type: 'sql_injection_attempt',
          value: (value as string).substring(0, 100), // Log first 100 chars only
        }, 'critical');
        throw new Error('Suspicious input detected');
      }
    }
    
    // Check for XSS attempts
    for (const [field, value] of textFields) {
      if (this.containsXSSPattern(value as string)) {
        await SecurityService.logSecurityEvent('suspicious_activity', {
          userId,
          resource,
          field,
          type: 'xss_attempt',
          value: (value as string).substring(0, 100),
        }, 'high');
        throw new Error('Suspicious input detected');
      }
    }
    
    // Check for unrealistic data values
    if (resource === 'weight_logs' && data.weight) {
      if (data.weight < 20 || data.weight > 800) { // Assuming lbs, adjust for kg
        await SecurityService.logSecurityEvent('suspicious_activity', {
          userId,
          resource,
          type: 'unrealistic_weight_value',
          value: data.weight,
        }, 'medium');
      }
    }
  }

  /**
   * Check for SQL injection patterns
   */
  private static containsSQLInjectionPattern(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
      /(--|\/\*|\*\/)/,
      /(\bOR\b.*=.*\bOR\b)/i,
      /(\bAND\b.*=.*\bAND\b)/i,
      /(;|\||&)/,
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Check for XSS patterns
   */
  private static containsXSSPattern(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
    ];
    
    return xssPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Execute request with monitoring and error handling
   */
  private static async executeWithMonitoring<T>(
    context: RequestContext,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await requestFn();
      
      // Log successful operation for audit trail
      const duration = Date.now() - startTime;
      if (MIDDLEWARE_CONFIG.sensitiveResources.includes(context.resource)) {
        // Only log sensitive operations to avoid noise
        console.log(`Security: ${context.operation} ${context.resource} completed in ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Log failed operation
      await SecurityService.logSecurityEvent('suspicious_activity', {
        userId: context.userId,
        operation: context.operation,
        resource: context.resource,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
        type: 'operation_failed',
      }, 'medium');
      
      throw error;
    }
  }
}

/**
 * Convenience wrapper for database operations
 */
export class SecureDatabase {
  /**
   * Secure SELECT operation
   */
  static async select<T>(
    table: string,
    query: any,
    userId?: string
  ): Promise<T> {
    return SecurityMiddleware.secureRequest(
      {
        userId,
        operation: 'read',
        resource: table,
      },
      () => query
    );
  }

  /**
   * Secure INSERT operation
   */
  static async insert<T>(
    table: string,
    data: any,
    query: any,
    userId?: string
  ): Promise<T> {
    return SecurityMiddleware.secureRequest(
      {
        userId,
        operation: 'create',
        resource: table,
        data,
      },
      () => query
    );
  }

  /**
   * Secure UPDATE operation
   */
  static async update<T>(
    table: string,
    data: any,
    query: any,
    userId?: string
  ): Promise<T> {
    return SecurityMiddleware.secureRequest(
      {
        userId,
        operation: 'update',
        resource: table,
        data,
      },
      () => query
    );
  }

  /**
   * Secure DELETE operation
   */
  static async delete<T>(
    table: string,
    query: any,
    userId?: string
  ): Promise<T> {
    return SecurityMiddleware.secureRequest(
      {
        userId,
        operation: 'delete',
        resource: table,
      },
      () => query
    );
  }
}

export default SecurityMiddleware;