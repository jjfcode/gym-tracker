import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  stripHtml,
  sanitizeText,
  sanitizeEmail,
  sanitizeNumber,
  sanitizeDate,
  sanitizeWeight,
  sanitizeReps,
  sanitizeRPE,
  sanitizeNotes,
  sanitizeExerciseName,
  sanitizeDisplayName,
  sanitizeSqlInput,
  sanitizeFileName,
  sanitizeInput,
  sanitizeFormData,
} from '../input-sanitization';

describe('Input Sanitization', () => {
  describe('escapeHtml', () => {
    it('should escape HTML characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
      expect(escapeHtml('Hello & "World"')).toBe('Hello &amp; &quot;World&quot;');
      expect(escapeHtml("It's a 'test'")).toBe('It&#x27;s a &#x27;test&#x27;');
    });

    it('should handle non-string input', () => {
      expect(escapeHtml(123 as any)).toBe('123');
      expect(escapeHtml(null as any)).toBe('null');
      expect(escapeHtml(undefined as any)).toBe('undefined');
    });
  });

  describe('stripHtml', () => {
    it('should remove HTML tags', () => {
      expect(stripHtml('<p>Hello <strong>World</strong></p>')).toBe('Hello World');
      expect(stripHtml('<script>alert("xss")</script>Text')).toBe('Text');
      expect(stripHtml('No HTML here')).toBe('No HTML here');
    });

    it('should handle malformed HTML', () => {
      expect(stripHtml('<p>Unclosed tag')).toBe('Unclosed tag');
      expect(stripHtml('Text with < and > symbols')).toBe('Text with  symbols');
    });
  });

  describe('sanitizeText', () => {
    it('should sanitize text with default options', () => {
      const input = '  <script>alert("xss")</script>  Hello World  ';
      const result = sanitizeText(input);
      expect(result).toBe('Hello World');
    });

    it('should respect maxLength option', () => {
      const input = 'This is a very long text that should be truncated';
      const result = sanitizeText(input, { maxLength: 10 });
      expect(result).toBe('This is a ');
    });

    it('should preserve HTML when allowHtml is true', () => {
      const input = '<p>Hello World</p>';
      const result = sanitizeText(input, { allowHtml: true });
      expect(result).toBe('&lt;p&gt;Hello World&lt;&#x2F;p&gt;');
    });

    it('should not trim when trim is false', () => {
      const input = '  Hello World  ';
      const result = sanitizeText(input, { trim: false });
      expect(result).toBe('  Hello World  ');
    });
  });

  describe('sanitizeEmail', () => {
    it('should normalize email addresses', () => {
      expect(sanitizeEmail('  TEST@EXAMPLE.COM  ')).toBe('test@example.com');
      expect(sanitizeEmail('User@Domain.org')).toBe('user@domain.org');
    });

    it('should handle non-string input', () => {
      expect(sanitizeEmail(123 as any)).toBe('');
      expect(sanitizeEmail(null as any)).toBe('');
    });
  });

  describe('sanitizeNumber', () => {
    it('should sanitize valid numbers', () => {
      expect(sanitizeNumber('123.45')).toBe(123.45);
      expect(sanitizeNumber(67.89)).toBe(67.89);
      expect(sanitizeNumber('  42  ')).toBe(42);
    });

    it('should handle invalid input', () => {
      expect(sanitizeNumber('not a number')).toBeNull();
      expect(sanitizeNumber('')).toBeNull();
      expect(sanitizeNumber('abc123')).toBeNull();
    });

    it('should apply constraints', () => {
      expect(sanitizeNumber('150', { min: 0, max: 100 })).toBe(100);
      expect(sanitizeNumber('-50', { min: 0, max: 100 })).toBe(0);
      expect(sanitizeNumber('123.456', { decimals: 2 })).toBe(123.46);
    });

    it('should handle negative numbers', () => {
      expect(sanitizeNumber('-42', { allowNegative: false })).toBe(42);
      expect(sanitizeNumber('-42', { allowNegative: true })).toBe(-42);
    });

    it('should remove non-numeric characters', () => {
      expect(sanitizeNumber('$123.45')).toBe(123.45);
      expect(sanitizeNumber('1,234.56')).toBe(1234.56);
    });
  });

  describe('sanitizeDate', () => {
    it('should sanitize valid dates', () => {
      const date = new Date('2023-12-25');
      expect(sanitizeDate(date)).toBe('2023-12-25');
      expect(sanitizeDate('2023-12-25')).toBe('2023-12-25');
    });

    it('should handle invalid dates', () => {
      expect(sanitizeDate('invalid date')).toBeNull();
      expect(sanitizeDate('')).toBeNull();
      expect(sanitizeDate('2023-13-45')).toBeNull();
    });

    it('should handle non-string/non-date input', () => {
      expect(sanitizeDate(123 as any)).toBeNull();
      expect(sanitizeDate(null as any)).toBeNull();
    });
  });

  describe('sanitizeWeight', () => {
    it('should sanitize weight in lbs', () => {
      expect(sanitizeWeight('150.5', 'lbs')).toBe(150.5);
      expect(sanitizeWeight(200, 'lbs')).toBe(200);
    });

    it('should sanitize weight in kg', () => {
      expect(sanitizeWeight('70.5', 'kg')).toBe(70.5);
      expect(sanitizeWeight(90, 'kg')).toBe(90);
    });

    it('should enforce weight limits', () => {
      expect(sanitizeWeight('1000', 'lbs')).toBe(800); // Max lbs
      expect(sanitizeWeight('10', 'lbs')).toBe(20);    // Min lbs
      expect(sanitizeWeight('500', 'kg')).toBe(363);   // Max kg
      expect(sanitizeWeight('5', 'kg')).toBe(9);       // Min kg
    });

    it('should handle invalid weight', () => {
      expect(sanitizeWeight('invalid')).toBeNull();
      expect(sanitizeWeight('')).toBeNull();
    });
  });

  describe('sanitizeReps', () => {
    it('should sanitize valid reps', () => {
      expect(sanitizeReps('12')).toBe(12);
      expect(sanitizeReps(8)).toBe(8);
    });

    it('should enforce reps limits', () => {
      expect(sanitizeReps('150')).toBe(100); // Max reps
      expect(sanitizeReps('0')).toBe(1);     // Min reps
    });

    it('should handle invalid reps', () => {
      expect(sanitizeReps('invalid')).toBeNull();
      expect(sanitizeReps('12.5')).toBe(13); // Rounds to whole number
    });
  });

  describe('sanitizeRPE', () => {
    it('should sanitize valid RPE', () => {
      expect(sanitizeRPE('8.5')).toBe(8.5);
      expect(sanitizeRPE(7)).toBe(7);
    });

    it('should enforce RPE limits', () => {
      expect(sanitizeRPE('15')).toBe(10); // Max RPE
      expect(sanitizeRPE('0')).toBe(1);   // Min RPE
    });

    it('should handle invalid RPE', () => {
      expect(sanitizeRPE('invalid')).toBeNull();
      expect(sanitizeRPE('')).toBeNull();
    });
  });

  describe('sanitizeNotes', () => {
    it('should sanitize notes text', () => {
      const input = '  <script>alert("xss")</script>  Great workout!  ';
      expect(sanitizeNotes(input)).toBe('Great workout!');
    });

    it('should respect maxLength', () => {
      const longText = 'a'.repeat(1500);
      const result = sanitizeNotes(longText, 100);
      expect(result.length).toBe(100);
    });
  });

  describe('sanitizeExerciseName', () => {
    it('should sanitize exercise names', () => {
      expect(sanitizeExerciseName('  Bench Press  ')).toBe('Bench Press');
      expect(sanitizeExerciseName('<script>Squat</script>')).toBe('Squat');
    });

    it('should enforce length limits', () => {
      const longName = 'a'.repeat(150);
      const result = sanitizeExerciseName(longName);
      expect(result.length).toBe(100);
    });
  });

  describe('sanitizeDisplayName', () => {
    it('should sanitize display names', () => {
      expect(sanitizeDisplayName('  John Doe  ')).toBe('John Doe');
      expect(sanitizeDisplayName('<script>User</script>')).toBe('User');
    });

    it('should enforce length limits', () => {
      const longName = 'a'.repeat(100);
      const result = sanitizeDisplayName(longName);
      expect(result.length).toBe(50);
    });
  });

  describe('sanitizeSqlInput', () => {
    it('should remove SQL injection attempts', () => {
      expect(sanitizeSqlInput("'; DROP TABLE users; --")).toBe('');
      expect(sanitizeSqlInput('SELECT * FROM users')).toBe('   users');
      expect(sanitizeSqlInput('Normal text')).toBe('Normal text');
    });

    it('should be case insensitive', () => {
      expect(sanitizeSqlInput('select * from users')).toBe('   users');
      expect(sanitizeSqlInput('SeLeCt * FrOm users')).toBe('   users');
    });
  });

  describe('sanitizeFileName', () => {
    it('should sanitize file names', () => {
      expect(sanitizeFileName('my<file>.txt')).toBe('myfile.txt');
      expect(sanitizeFileName('../../etc/passwd')).toBe('etcpasswd');
      expect(sanitizeFileName('...hidden')).toBe('hidden');
    });

    it('should enforce length limits', () => {
      const longName = 'a'.repeat(300) + '.txt';
      const result = sanitizeFileName(longName);
      expect(result.length).toBe(255);
    });

    it('should handle non-string input', () => {
      expect(sanitizeFileName(123 as any)).toBe('');
      expect(sanitizeFileName(null as any)).toBe('');
    });
  });

  describe('sanitizeInput', () => {
    it('should route to appropriate sanitizer based on type', () => {
      expect(sanitizeInput('  test@example.com  ', 'email')).toBe('test@example.com');
      expect(sanitizeInput('123.45', 'number')).toBe(123.45);
      expect(sanitizeInput('2023-12-25', 'date')).toBe('2023-12-25');
      expect(sanitizeInput('  Hello World  ', 'text')).toBe('Hello World');
    });

    it('should handle null/undefined input', () => {
      expect(sanitizeInput(null, 'text')).toBeNull();
      expect(sanitizeInput(undefined, 'email')).toBeNull();
    });

    it('should pass options to sanitizers', () => {
      expect(sanitizeInput('150.5', 'weight', { unit: 'kg' })).toBe(150.5);
      expect(sanitizeInput('  text  ', 'text', { maxLength: 3 })).toBe('tex');
    });
  });

  describe('sanitizeFormData', () => {
    it('should sanitize form data according to schema', () => {
      const formData = {
        email: '  TEST@EXAMPLE.COM  ',
        weight: '150.5',
        notes: '  Great workout!  ',
        reps: '12',
      };

      const schema = {
        email: { type: 'email' },
        weight: { type: 'weight', options: { unit: 'lbs' } },
        notes: { type: 'notes' },
        reps: { type: 'reps' },
      };

      const result = sanitizeFormData(formData, schema);

      expect(result.email).toBe('test@example.com');
      expect(result.weight).toBe(150.5);
      expect(result.notes).toBe('Great workout!');
      expect(result.reps).toBe(12);
    });

    it('should only sanitize fields present in data', () => {
      const formData = {
        email: 'test@example.com',
      };

      const schema = {
        email: { type: 'email' },
        weight: { type: 'weight' },
      };

      const result = sanitizeFormData(formData, schema);

      expect(result.email).toBe('test@example.com');
      expect(result.weight).toBeUndefined();
    });
  });
});