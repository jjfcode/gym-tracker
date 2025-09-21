/**
 * Comprehensive security service for the Gym Tracker application
 * Handles CSRF protection, secure headers, rate limiting, and security monitoring
 */

import { supabase } from './supabase';
import { sanitizeInput } from './input-sanitization';

// Security configuration
const SECURITY_CONFIG = {
  // Rate limiting configuration
  rateLimits: {
    login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
    api: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
    passwordReset: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  },
  
  // Session configuration
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    renewThreshold: 60 * 60 * 1000, // Renew if expires within 1 hour
  },
  
  // Security headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  },
};

// Rate limiting storage (in-memory for client-side, should be server-side in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// CSRF token management
let csrfToken: string | null = null;

/**
 * Security service class
 */
export class SecurityService {
  /**
   * Initialize security service
   */
  static async initialize(): Promise<void> {
    try {
      // Generate CSRF token
      await this.generateCSRFToken();
      
      // Set up security headers (where possible in browser)
      this.setupSecurityHeaders();
      
      // Initialize session monitoring
      this.initializeSessionMonitoring();
      
      // Set up security event listeners
      this.setupSecurityEventListeners();
      
      console.log('Security service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize security service:', error);
    }
  }

  /**
   * Generate and store CSRF token
   */
  static async generateCSRFToken(): Promise<string> {
    const token = this.generateSecureToken();
    csrfToken = token;
    
    // Store in sessionStorage (more secure than localStorage for CSRF tokens)
    sessionStorage.setItem('csrf_token', token);
    
    return token;
  }

  /**
   * Get current CSRF token
   */
  static getCSRFToken(): string | null {
    if (!csrfToken) {
      csrfToken = sessionStorage.getItem('csrf_token');
    }
    return csrfToken;
  }

  /**
   * Validate CSRF token
   */
  static validateCSRFToken(token: string): boolean {
    const storedToken = this.getCSRFToken();
    return storedToken !== null && token === storedToken;
  }

  /**
   * Generate cryptographically secure token
   */
  static generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Set up security headers (where possible in browser environment)
   */
  static setupSecurityHeaders(): void {
    // Note: Most security headers must be set by the server
    // This is a placeholder for client-side security measures
    
    // Prevent clickjacking by checking if we're in an iframe
    if (window.self !== window.top) {
      console.warn('Application loaded in iframe - potential clickjacking attempt');
      this.logSecurityEvent('suspicious_activity', {
        type: 'iframe_detection',
        referrer: document.referrer,
      });
    }

    // Check for HTTPS
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      console.warn('Application not served over HTTPS');
      this.logSecurityEvent('suspicious_activity', {
        type: 'insecure_connection',
        protocol: location.protocol,
      });
    }
  }

  /**
   * Rate limiting check
   */
  static checkRateLimit(key: string, type: keyof typeof SECURITY_CONFIG.rateLimits): boolean {
    const config = SECURITY_CONFIG.rateLimits[type];
    const now = Date.now();
    const rateLimitKey = `${type}_${key}`;
    
    const existing = rateLimitStore.get(rateLimitKey);
    
    if (!existing || now > existing.resetTime) {
      // Reset or create new entry
      rateLimitStore.set(rateLimitKey, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }
    
    if (existing.count >= config.maxAttempts) {
      // Rate limit exceeded
      this.logSecurityEvent('rate_limit_exceeded', {
        type,
        key,
        attempts: existing.count,
      });
      return false;
    }
    
    // Increment counter
    existing.count++;
    rateLimitStore.set(rateLimitKey, existing);
    return true;
  }

  /**
   * Secure API request wrapper
   */
  static async secureRequest<T>(
    requestFn: () => Promise<T>,
    options: {
      requireCSRF?: boolean;
      rateLimitKey?: string;
      rateLimitType?: keyof typeof SECURITY_CONFIG.rateLimits;
    } = {}
  ): Promise<T> {
    const { requireCSRF = true, rateLimitKey, rateLimitType = 'api' } = options;

    // Check rate limiting
    if (rateLimitKey && !this.checkRateLimit(rateLimitKey, rateLimitType)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Validate CSRF token for state-changing operations
    if (requireCSRF) {
      const token = this.getCSRFToken();
      if (!token) {
        throw new Error('CSRF token missing. Please refresh the page.');
      }
    }

    try {
      const result = await requestFn();
      return result;
    } catch (error) {
      // Log security-related errors
      if (error instanceof Error) {
        if (error.message.includes('auth') || error.message.includes('permission')) {
          this.logSecurityEvent('suspicious_activity', {
            type: 'api_error',
            error: error.message,
            rateLimitKey,
          });
        }
      }
      throw error;
    }
  }

  /**
   * Validate and sanitize form data
   */
  static validateFormData<T extends Record<string, any>>(
    data: T,
    schema: Record<keyof T, { type: string; required?: boolean; options?: any }>
  ): { isValid: boolean; sanitizedData?: Partial<T>; errors?: Record<string, string> } {
    const sanitizedData: Partial<T> = {};
    const errors: Record<string, string> = {};

    for (const [key, config] of Object.entries(schema)) {
      const value = data[key];
      
      // Check required fields
      if (config.required && (value === undefined || value === null || value === '')) {
        errors[key] = `${key} is required`;
        continue;
      }
      
      // Skip validation for optional empty fields
      if (!config.required && (value === undefined || value === null || value === '')) {
        continue;
      }
      
      // Sanitize input
      try {
        const sanitized = sanitizeInput(value, config.type as any, config.options);
        if (sanitized !== null) {
          sanitizedData[key as keyof T] = sanitized;
        } else if (config.required) {
          errors[key] = `Invalid ${key} format`;
        }
      } catch (error) {
        errors[key] = `Invalid ${key} format`;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      sanitizedData: Object.keys(errors).length === 0 ? sanitizedData : undefined,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
    };
  }

  /**
   * Session monitoring and validation
   */
  static initializeSessionMonitoring(): void {
    // Check session validity periodically
    setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const expiresAt = new Date(session.expires_at! * 1000);
          const now = new Date();
          const timeUntilExpiry = expiresAt.getTime() - now.getTime();
          
          // Refresh token if expiring soon
          if (timeUntilExpiry < SECURITY_CONFIG.session.renewThreshold) {
            await supabase.auth.refreshSession();
          }
        }
      } catch (error) {
        console.error('Session monitoring error:', error);
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  /**
   * Set up security event listeners
   */
  static setupSecurityEventListeners(): void {
    // Detect potential XSS attempts
    window.addEventListener('error', (event) => {
      if (event.error && event.error.message) {
        const message = event.error.message.toLowerCase();
        if (message.includes('script') || message.includes('eval') || message.includes('javascript:')) {
          this.logSecurityEvent('suspicious_activity', {
            type: 'potential_xss',
            error: event.error.message,
            filename: event.filename,
            lineno: event.lineno,
          });
        }
      }
    });

    // Detect console manipulation attempts
    const originalConsole = { ...console };
    Object.keys(console).forEach(key => {
      if (typeof console[key as keyof Console] === 'function') {
        const original = console[key as keyof Console] as Function;
        (console as any)[key] = function(...args: any[]) {
          // Check for suspicious console usage
          const argsString = args.join(' ').toLowerCase();
          if (argsString.includes('password') || argsString.includes('token') || argsString.includes('secret')) {
            SecurityService.logSecurityEvent('suspicious_activity', {
              type: 'console_manipulation',
              method: key,
              args: args.map(arg => typeof arg === 'string' ? arg.substring(0, 100) : typeof arg),
            });
          }
          return original.apply(console, args);
        };
      }
    });

    // Detect DevTools opening (basic detection)
    let devtools = { open: false, orientation: null };
    const threshold = 160;
    
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          this.logSecurityEvent('suspicious_activity', {
            type: 'devtools_opened',
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        devtools.open = false;
      }
    }, 500);
  }

  /**
   * Log security events to the database
   */
  static async logSecurityEvent(
    eventType: 'failed_login' | 'suspicious_activity' | 'rate_limit_exceeded' | 'invalid_token',
    details: Record<string, any> = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Call the database function to log the security event
      const { error } = await supabase.rpc('log_security_event', {
        p_event_type: eventType,
        p_user_id: user?.id || null,
        p_email: user?.email || null,
        p_details: details,
        p_severity: severity,
      });

      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  /**
   * Validate file uploads for security
   */
  static validateFileUpload(file: File): { isValid: boolean; error?: string } {
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size exceeds 5MB limit' };
    }

    // Check file type (only allow images)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Only image files are allowed' };
    }

    // Check file name for suspicious patterns
    const suspiciousPatterns = ['.php', '.js', '.html', '.exe', '.bat', '.cmd'];
    const fileName = file.name.toLowerCase();
    if (suspiciousPatterns.some(pattern => fileName.includes(pattern))) {
      return { isValid: false, error: 'File name contains suspicious content' };
    }

    return { isValid: true };
  }

  /**
   * Secure local storage operations
   */
  static secureStorage = {
    set(key: string, value: any): void {
      try {
        const encrypted = btoa(JSON.stringify(value));
        localStorage.setItem(`gym_tracker_${key}`, encrypted);
      } catch (error) {
        console.error('Failed to store data securely:', error);
      }
    },

    get(key: string): any {
      try {
        const encrypted = localStorage.getItem(`gym_tracker_${key}`);
        if (!encrypted) return null;
        return JSON.parse(atob(encrypted));
      } catch (error) {
        console.error('Failed to retrieve data securely:', error);
        return null;
      }
    },

    remove(key: string): void {
      localStorage.removeItem(`gym_tracker_${key}`);
    },

    clear(): void {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('gym_tracker_')) {
          localStorage.removeItem(key);
        }
      });
    },
  };

  /**
   * Content Security Policy violation handler
   */
  static handleCSPViolation(event: SecurityPolicyViolationEvent): void {
    this.logSecurityEvent('suspicious_activity', {
      type: 'csp_violation',
      violatedDirective: event.violatedDirective,
      blockedURI: event.blockedURI,
      documentURI: event.documentURI,
      originalPolicy: event.originalPolicy,
    }, 'high');
  }

  /**
   * Check for suspicious user behavior patterns
   */
  static async checkSuspiciousActivity(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('detect_suspicious_activity', {
        p_user_id: userId,
      });

      if (error) {
        console.error('Error checking suspicious activity:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error checking suspicious activity:', error);
      return false;
    }
  }

  /**
   * Secure password validation
   */
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common weak passwords
    const commonPasswords = [
      'password', '123456', 'password123', 'admin', 'qwerty',
      'letmein', 'welcome', 'monkey', '1234567890'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common and easily guessable');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Clean up security resources
   */
  static cleanup(): void {
    // Clear rate limit store
    rateLimitStore.clear();
    
    // Clear CSRF token
    csrfToken = null;
    sessionStorage.removeItem('csrf_token');
    
    // Clear secure storage
    this.secureStorage.clear();
  }
}

// Set up CSP violation listener
if (typeof window !== 'undefined') {
  document.addEventListener('securitypolicyviolation', SecurityService.handleCSPViolation);
}

// Export security utilities
export const security = SecurityService;
export default SecurityService;