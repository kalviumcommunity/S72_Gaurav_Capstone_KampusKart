const {
  isValidEmail,
  normalizeEmail,
  extractDomain,
  isFreeEmailProvider,
  maskEmail
} = require('../../utils/emailUtils');

describe('Email Utils', () => {
  describe('isValidEmail', () => {
    test('should return true for valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
        'a@b.c',
        'user@subdomain.example.com'
      ];

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    test('should return false for invalid email addresses', () => {
      // Test each email individually to isolate the issue
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
      expect(isValidEmail('user..name@example.com')).toBe(false);
      expect(isValidEmail('user@example..com')).toBe(false);
      expect(isValidEmail('user name@example.com')).toBe(false);
      expect(isValidEmail('user@example')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
      expect(isValidEmail(123)).toBe(false);
      expect(isValidEmail({})).toBe(false);
      expect(isValidEmail([])).toBe(false);
    });

    test('should handle whitespace correctly', () => {
      expect(isValidEmail('  test@example.com  ')).toBe(true);
      expect(isValidEmail('  invalid-email  ')).toBe(false);
    });
  });

  describe('normalizeEmail', () => {
    test('should normalize valid email addresses', () => {
      const testCases = [
        { input: 'TEST@EXAMPLE.COM', expected: 'test@example.com' },
        { input: '  User.Name@Domain.COM  ', expected: 'user.name@domain.com' },
        { input: 'user+tag@EXAMPLE.org', expected: 'user+tag@example.org' }
      ];

      testCases.forEach(({ input, expected }) => {
        expect(normalizeEmail(input)).toBe(expected);
      });
    });

    test('should return null for invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        '',
        null,
        undefined
      ];

      invalidEmails.forEach(email => {
        expect(normalizeEmail(email)).toBe(null);
      });
    });
  });

  describe('extractDomain', () => {
    test('should extract domain from valid email addresses', () => {
      const testCases = [
        { email: 'user@example.com', expected: 'example.com' },
        { email: 'test@subdomain.example.org', expected: 'subdomain.example.org' },
        { email: 'user@domain.co.uk', expected: 'domain.co.uk' },
        { email: 'user+tag@test-domain.com', expected: 'test-domain.com' }
      ];

      testCases.forEach(({ email, expected }) => {
        expect(extractDomain(email)).toBe(expected);
      });
    });

    test('should return null for invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        '',
        null,
        undefined
      ];

      invalidEmails.forEach(email => {
        expect(extractDomain(email)).toBe(null);
      });
    });

    test('should handle edge cases', () => {
      expect(extractDomain('user@')).toBe(null);
      expect(extractDomain('@domain.com')).toBe(null); // This should be null because it's not a valid email
    });
  });

  describe('isFreeEmailProvider', () => {
    test('should return true for free email providers', () => {
      const freeProviderEmails = [
        'user@gmail.com',
        'test@yahoo.com',
        'user@hotmail.com',
        'test@outlook.com',
        'user@aol.com',
        'test@icloud.com',
        'USER@GMAIL.COM', // Case insensitive
        '  user@gmail.com  ' // With whitespace
      ];

      freeProviderEmails.forEach(email => {
        expect(isFreeEmailProvider(email)).toBe(true);
      });
    });

    test('should return false for non-free email providers', () => {
      const nonFreeProviderEmails = [
        'user@company.com',
        'test@university.edu',
        'user@example.org',
        'test@domain.net',
        'user@custom-domain.com'
      ];

      nonFreeProviderEmails.forEach(email => {
        expect(isFreeEmailProvider(email)).toBe(false);
      });
    });

    test('should return false for invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@gmail.com',
        'user@',
        '',
        null,
        undefined
      ];

      invalidEmails.forEach(email => {
        expect(isFreeEmailProvider(email)).toBe(false);
      });
    });
  });

  describe('maskEmail', () => {
    test('should mask email addresses correctly', () => {
      const testCases = [
        { email: 'user@example.com', expected: 'u***@example.com' },
        { email: 'test@domain.org', expected: 't***@domain.org' },
        { email: 'john@company.com', expected: 'j***@company.com' },
        { email: 'a@b.c', expected: 'a@b.c' }
      ];

      testCases.forEach(({ email, expected }) => {
        expect(maskEmail(email)).toBe(expected);
      });
    });

    test('should handle single character local parts', () => {
      expect(maskEmail('a@example.com')).toBe('a@example.com');
    });

    test('should return null for invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        '',
        null,
        undefined
      ];

      invalidEmails.forEach(email => {
        expect(maskEmail(email)).toBe(null);
      });
    });

    test('should preserve domain case and structure', () => {
      expect(maskEmail('user@EXAMPLE.COM')).toBe('u***@EXAMPLE.COM');
      expect(maskEmail('test@subdomain.example.org')).toBe('t***@subdomain.example.org');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle very long email addresses', () => {
      const longEmail = 'a'.repeat(100) + '@example.com';
      expect(isValidEmail(longEmail)).toBe(true);
      expect(normalizeEmail(longEmail)).toBe(longEmail.toLowerCase());
    });

    test('should handle special characters in local part', () => {
      const specialCharEmails = [
        'user+tag@example.com',
        'user.name@example.com',
        'user-name@example.com',
        'user_name@example.com'
      ];

      specialCharEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
        expect(normalizeEmail(email)).toBe(email.toLowerCase());
      });
    });

    test('should handle international domains', () => {
      const internationalEmails = [
        'user@example.co.uk',
        'test@example.org',
        'user@example.net',
        'test@example.edu'
      ];

      internationalEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
        expect(extractDomain(email)).toBe(email.split('@')[1]);
      });
    });

    test('should handle empty and whitespace-only strings', () => {
      const emptyInputs = ['', '   ', '\t\n'];
      
      emptyInputs.forEach(input => {
        expect(isValidEmail(input)).toBe(false);
        expect(normalizeEmail(input)).toBe(null);
        expect(extractDomain(input)).toBe(null);
        expect(isFreeEmailProvider(input)).toBe(false);
        expect(maskEmail(input)).toBe(null);
      });
    });

    test('should handle non-string inputs gracefully', () => {
      const nonStringInputs = [null, undefined, 123, {}, [], true, false];
      
      nonStringInputs.forEach(input => {
        expect(isValidEmail(input)).toBe(false);
        expect(normalizeEmail(input)).toBe(null);
        expect(extractDomain(input)).toBe(null);
        expect(isFreeEmailProvider(input)).toBe(false);
        expect(maskEmail(input)).toBe(null);
      });
    });
  });

  describe('Integration Tests', () => {
    test('should work together in a typical workflow', () => {
      const email = '  USER.NAME@GMAIL.COM  ';
      
      // Step 1: Validate email
      expect(isValidEmail(email)).toBe(true);
      
      // Step 2: Normalize email
      const normalized = normalizeEmail(email);
      expect(normalized).toBe('user.name@gmail.com');
      
      // Step 3: Extract domain
      const domain = extractDomain(normalized);
      expect(domain).toBe('gmail.com');
      
      // Step 4: Check if free provider
      expect(isFreeEmailProvider(normalized)).toBe(true);
      
      // Step 5: Mask for privacy
      const masked = maskEmail(normalized);
      expect(masked).toBe('u********@gmail.com');
    });

    test('should handle invalid email in workflow', () => {
      const invalidEmail = 'invalid-email';
      
      expect(isValidEmail(invalidEmail)).toBe(false);
      expect(normalizeEmail(invalidEmail)).toBe(null);
      expect(extractDomain(invalidEmail)).toBe(null);
      expect(isFreeEmailProvider(invalidEmail)).toBe(false);
      expect(maskEmail(invalidEmail)).toBe(null);
    });
  });
});
