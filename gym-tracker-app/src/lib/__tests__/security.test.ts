/**
 * Comprehensive security tests for the Gym Tracker application
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { SecurityService } from '../security';
import { SecurityMiddleware } from '../security-middleware';
import { sanitizeInput, sanitizeFormData } from '../input-sanitization';

// Mock Supabase
vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
      refreshSession: vi.fn(),
    },
    rpc: vi.fn(),
  },
}));

// Mock crypto for testing
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: vi.fn((arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
  },
});

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(global, 'sessionStorage', {
  value: mockSessionStorage,
});

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
});

describe('SecurityService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset rate limit store
    (SecurityService as any).rateLimitStore?.clear();
  });

  afterEach(() => {
    SecurityService.cleanup();
  });

  describe('CSRF Token Management', () => {
    it('should generate a secure CSRF token', async () => {
      const token = await SecurityService.generateCSRFToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes * 2 hex chars
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('csrf_token', token);
    });

    it('should validate CSRF tokens correctly', async () => {
      const token = await SecurityService.generateCSRFToken();
      
      expect(SecurityService.validateCSRFToken(token)).toBe(true);
      expect(SecurityService.validateCSRFToken('invalid-token')).toBe(false);
      expect(SecurityService.validateCSRFToken('')).toBe(false);
    });

    it('should retrieve CSRF token from storage', () => {
      const testToken = 'test-csrf-token';
      mockSessionStorage.getItem.mockReturnValue(testToken);
      
      const token = SecurityService.getCSRFToken();
      expect(token).toBe(testToken);
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('csrf_token');
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limits', () => {
      const result1 = SecurityService.checkRateLimit('user1', 'login');
      const result2 = SecurityService.checkRateLimit('user1', 'login');
      
      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });

    it('should block requests exceeding rate limits', () => {
      const userKey = 'user1';
      
      // Exceed login rate limit (5 attempts)
      for (let i = 0; i < 5; i++) {
        SecurityService.checkRateLimit(userKey, 'login');
      }
      
      const blocked = SecurityService.checkRateLimit(userKey, 'login');
      expect(blocked).toBe(false);
    });

    it('should reset rate limits after time window', () => {
      const userKey = 'user1';
      
      // Mock Date.now to control time
      const originalNow = Date.now;
      let mockTime = 1000000;
      Date.now = vi.fn(() => mockTime);
      
      // Exceed rate limit
      for (let i = 0; i < 6; i++) {
        SecurityService.checkRateLimit(userKey, 'login');
      }
      
      // Advance time beyond window
      mockTime += 16 * 60 * 1000; // 16 minutes
      
      const allowed = SecurityService.checkRateLimit(userKey, 'login');
      expect(allowed).toBe(true);
      
      // Restore original Date.now
      Date.now = originalNow;
    });
  });

  describe('Secure Request Wrapper', () => {
    it('should execute requests with CSRF validation', async () => {
      await SecurityService.generateCSRFToken();
      const mockRequest = vi.fn().mockResolvedValue('success');
      
      const result = await SecurityService.secureRequest(mockRequest, {
        requireCSRF: true,
      });
      
      expect(result).toBe('success');
      expect(mockRequest).toHaveBeenCalled();
    });

    it('should reject requests without CSRF token', async () => {
      const mockRequest = vi.fn().mockResolvedValue('success');
      
      await expect(
        SecurityService.secureRequest(mockRequest, { requireCSRF: true })
      ).rejects.toThrow('CSRF token missing');
      
      expect(mockRequest).not.toHaveBeenCalled();
    });

    it('should apply rate limiting to requests', async () => {
      const mockRequest = vi.fn().mockResolvedValue('success');
      const rateLimitKey = 'test-user';
      
      // Exceed rate limit
      for (let i = 0; i < 100; i++) {
        try {
          await SecurityService.secureRequest(mockRequest, {
            requireCSRF: false,
            rateLimitKey,
            rateLimitType: 'api',
          });
        } catch (error) {
          // Expected to fail at some point
        }
      }
      
      await expect(
        SecurityService.secureRequest(mockRequest, {
          requireCSRF: false,
          rateLimitKey,
          rateLimitType: 'api',
        })
      ).rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('Form Data Validation', () => {
    it('should validate and sanitize form data correctly', () => {
      const formData = {
        name: '  John Doe  ',
        email: 'JOHN@EXAMPLE.COM',
        weight: '150.5',
        notes: '<script>alert("xss")</script>Valid notes',
      };
      
      const schema = {
        name: { type: 'text', required: true },
        email: { type: 'email', required: true },
        weight: { type: 'weight', required: true },
        notes: { type: 'notes', required: false },
      };
      
      const result = SecurityService.validateFormData(formData, schema);
      
      expect(result.isValid).toBe(true);
      expect(result.sanitizedData?.name).toBe('John Doe');
      expect(result.sanitizedData?.email).toBe('john@example.com');
      expect(result.sanitizedData?.weight).toBe(150.5);
      expect(result.sanitizedData?.notes).not.toContain('<script>');
    });

    it('should reject invalid form data', () => {
      const formData = {
        email: 'invalid-email',
        weight: 'not-a-number',
      };
      
      const schema = {
        email: { type: 'email', required: true },
        weight: { type: 'weight', required: true },
      };
      
      const result = SecurityService.validateFormData(formData, schema);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.sanitizedData).toBeUndefined();
    });

    it('should handle missing required fields', () => {
      const formData = {
        email: 'test@example.com',
        // missing required weight field
      };
      
      const schema = {
        email: { type: 'email', required: true },
        weight: { type: 'weight', required: true },
      };
      
      const result = SecurityService.validateFormData(formData, schema);
      
      expect(result.isValid).toBe(false);
      expect(result.errors?.weight).toContain('required');
    });
  });

  describe('File Upload Validation', () => {
    it('should validate safe image files', () => {
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 }); // 1MB
      
      const result = SecurityService.validateFileUpload(mockFile);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject files that are too large', () => {
      const mockFile = new File([''], 'large.jpg', { type: 'image/jpeg' });
      Object.defineProperty(mockFile, 'size', { value: 10 * 1024 * 1024 }); // 10MB
      
      const result = SecurityService.validateFileUpload(mockFile);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('size exceeds');
    });

    it('should reject non-image files', () => {
      const mockFile = new File([''], 'script.js', { type: 'application/javascript' });
      Object.defineProperty(mockFile, 'size', { value: 1024 });
      
      const result = SecurityService.validateFileUpload(mockFile);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Only image files');
    });

    it('should reject files with suspicious names', () => {
      const mockFile = new File([''], 'image.php.jpg', { type: 'image/jpeg' });
      Object.defineProperty(mockFile, 'size', { value: 1024 });
      
      const result = SecurityService.validateFileUpload(mockFile);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('suspicious content');
    });
  });

  describe('Password Validation', () => {
    it('should validate strong passwords', () => {
      const strongPassword = 'MyStr0ng!Password';
      const result = SecurityService.validatePassword(strongPassword);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        'short',           // Too short
        'nouppercase1!',   // No uppercase
        'NOLOWERCASE1!',   // No lowercase
        'NoNumbers!',      // No numbers
        'NoSpecialChars1', // No special characters
        'password',        // Common password
      ];
      
      weakPasswords.forEach(password => {
        const result = SecurityService.validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Secure Storage', () => {
    it('should store and retrieve data securely', () => {
      const testData = { userId: '123', preferences: { theme: 'dark' } };
      
      SecurityService.secureStorage.set('test-key', testData);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
      
      // Mock the encrypted data retrieval
      const encodedData = btoa(JSON.stringify(testData));
      mockLocalStorage.getItem.mockReturnValue(encodedData);
      
      const retrieved = SecurityService.secureStorage.get('test-key');
      expect(retrieved).toEqual(testData);
    });

    it('should handle corrupted storage data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('corrupted-data');
      
      const result = SecurityService.secureStorage.get('test-key');
      expect(result).toBeNull();
    });

    it('should clear all app data', () => {
      SecurityService.secureStorage.clear();
      expect(mockLocalStorage.removeItem).toHaveBeenCalled();
    });
  });
});

describe('SecurityMiddleware', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { supabase } = await import('../supabase');
    (supabase.auth.getSession as Mock).mockResolvedValue({
      data: {
        session: {
          user: { id: 'test-user-id' },
          expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        },
      },
      error: null,
    });
  });

  describe('Authentication Validation', () => {
    it('should validate authenticated requests', async () => {
      const mockRequest = vi.fn().mockResolvedValue('success');
      
      const result = await SecurityMiddleware.secureRequest(
        {
          operation: 'read',
          resource: 'workouts',
        },
        mockRequest
      );
      
      expect(result).toBe('success');
      expect(mockRequest).toHaveBeenCalled();
    });

    it('should reject unauthenticated requests', async () => {
      const { supabase } = await import('../supabase');
      (supabase.auth.getSession as Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });
      
      const mockRequest = vi.fn().mockResolvedValue('success');
      
      await expect(
        SecurityMiddleware.secureRequest(
          {
            operation: 'read',
            resource: 'workouts',
          },
          mockRequest
        )
      ).rejects.toThrow('Authentication required');
      
      expect(mockRequest).not.toHaveBeenCalled();
    });

    it('should reject expired sessions', async () => {
      const { supabase } = await import('../supabase');
      (supabase.auth.getSession as Mock).mockResolvedValue({
        data: {
          session: {
            user: { id: 'test-user-id' },
            expires_at: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
          },
        },
        error: null,
      });
      
      const mockRequest = vi.fn().mockResolvedValue('success');
      
      await expect(
        SecurityMiddleware.secureRequest(
          {
            operation: 'read',
            resource: 'workouts',
          },
          mockRequest
        )
      ).rejects.toThrow('Session expired');
    });
  });

  describe('Data Validation and Sanitization', () => {
    it('should sanitize input data', async () => {
      const mockRequest = vi.fn().mockResolvedValue('success');
      const inputData = {
        title: '  My Workout  ',
        notes: '<script>alert("xss")</script>Valid notes',
        weight: '150.5',
      };
      
      await SecurityMiddleware.secureRequest(
        {
          operation: 'create',
          resource: 'workouts',
          data: inputData,
        },
        mockRequest
      );
      
      expect(mockRequest).toHaveBeenCalled();
    });

    it('should detect SQL injection attempts', async () => {
      const mockRequest = vi.fn().mockResolvedValue('success');
      const maliciousData = {
        title: "'; DROP TABLE workouts; --",
        notes: 'Normal notes',
      };
      
      await expect(
        SecurityMiddleware.secureRequest(
          {
            operation: 'create',
            resource: 'workouts',
            data: maliciousData,
          },
          mockRequest
        )
      ).rejects.toThrow('Suspicious input detected');
      
      expect(mockRequest).not.toHaveBeenCalled();
    });

    it('should detect XSS attempts', async () => {
      const mockRequest = vi.fn().mockResolvedValue('success');
      const maliciousData = {
        title: 'Normal title',
        notes: '<script>document.cookie</script>',
      };
      
      await expect(
        SecurityMiddleware.secureRequest(
          {
            operation: 'create',
            resource: 'workouts',
            data: maliciousData,
          },
          mockRequest
        )
      ).rejects.toThrow('Suspicious input detected');
      
      expect(mockRequest).not.toHaveBeenCalled();
    });
  });

  describe('Permission Validation', () => {
    it('should prevent access to other users\' data', async () => {
      const mockRequest = vi.fn().mockResolvedValue('success');
      const unauthorizedData = {
        user_id: 'other-user-id',
        title: 'Unauthorized workout',
      };
      
      await expect(
        SecurityMiddleware.secureRequest(
          {
            operation: 'create',
            resource: 'workouts',
            data: unauthorizedData,
          },
          mockRequest
        )
      ).rejects.toThrow('Access denied');
      
      expect(mockRequest).not.toHaveBeenCalled();
    });
  });
});

describe('Input Sanitization', () => {
  describe('sanitizeInput', () => {
    it('should sanitize text input', () => {
      const input = '  <script>alert("xss")</script>Hello World!  ';
      const result = sanitizeInput(input, 'text');
      
      expect(result).toBe('Hello World!');
      expect(result).not.toContain('<script>');
    });

    it('should sanitize email input', () => {
      const input = '  TEST@EXAMPLE.COM  ';
      const result = sanitizeInput(input, 'email');
      
      expect(result).toBe('test@example.com');
    });

    it('should sanitize numeric input', () => {
      const validNumber = '150.5';
      const invalidNumber = 'abc123def';
      
      expect(sanitizeInput(validNumber, 'number')).toBe(150.5);
      expect(sanitizeInput(invalidNumber, 'number')).toBeNull();
    });

    it('should sanitize weight input', () => {
      const validWeight = '150.5';
      const invalidWeight = '2000'; // Too heavy
      
      expect(sanitizeInput(validWeight, 'weight')).toBe(150.5);
      expect(sanitizeInput(invalidWeight, 'weight')).toBe(800); // Clamped to max
    });

    it('should sanitize RPE input', () => {
      const validRPE = '8.5';
      const invalidRPE = '15'; // Too high
      
      expect(sanitizeInput(validRPE, 'rpe')).toBe(8.5);
      expect(sanitizeInput(invalidRPE, 'rpe')).toBe(10); // Clamped to max
    });
  });

  describe('sanitizeFormData', () => {
    it('should sanitize multiple form fields', () => {
      const formData = {
        name: '  John Doe  ',
        email: 'JOHN@EXAMPLE.COM',
        weight: '150.5',
        notes: '<script>alert("xss")</script>Valid notes',
      };
      
      const schema = {
        name: { type: 'text' },
        email: { type: 'email' },
        weight: { type: 'weight' },
        notes: { type: 'notes' },
      };
      
      const result = sanitizeFormData(formData, schema);
      
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.weight).toBe(150.5);
      expect(result.notes).not.toContain('<script>');
    });
  });
});

describe('Security Event Logging', () => {
  beforeEach(async () => {
    const { supabase } = await import('../supabase');
    (supabase.rpc as Mock).mockResolvedValue({ error: null });
    (supabase.auth.getUser as Mock).mockResolvedValue({
      data: { user: { id: 'test-user', email: 'test@example.com' } },
      error: null,
    });
  });

  it('should log security events to database', async () => {
    const { supabase } = await import('../supabase');
    
    await SecurityService.logSecurityEvent('failed_login', {
      email: 'test@example.com',
      reason: 'invalid_credentials',
    });
    
    expect(supabase.rpc).toHaveBeenCalledWith('log_security_event', {
      p_event_type: 'failed_login',
      p_user_id: 'test-user',
      p_email: 'test@example.com',
      p_details: {
        email: 'test@example.com',
        reason: 'invalid_credentials',
      },
      p_severity: 'medium',
    });
  });

  it('should handle logging errors gracefully', async () => {
    const { supabase } = await import('../supabase');
    (supabase.rpc as Mock).mockResolvedValue({ error: new Error('Database error') });
    
    // Should not throw
    await expect(
      SecurityService.logSecurityEvent('suspicious_activity', {})
    ).resolves.not.toThrow();
  });
});