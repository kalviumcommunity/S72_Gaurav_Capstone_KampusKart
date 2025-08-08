/**
 * Email utility functions for validation and formatting
 */

/**
 * Validates if an email address is in correct format
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if email is valid, false otherwise
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const trimmedEmail = email.trim();
  
  // Basic structure check
  if (!trimmedEmail.includes('@') || trimmedEmail.startsWith('@') || trimmedEmail.endsWith('@')) {
    return false;
  }
  
  const [localPart, domain] = trimmedEmail.split('@');
  
  // Check for empty parts
  if (!localPart || !domain) {
    return false;
  }
  
  // Check for spaces
  if (localPart.includes(' ') || domain.includes(' ')) {
    return false;
  }
  
  // Check for consecutive dots
  if (localPart.includes('..') || domain.includes('..')) {
    return false;
  }
  
  // Check for dots at start/end of local part
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return false;
  }
  
  // Check for dots at start/end of domain parts
  const domainParts = domain.split('.');
  if (domainParts.some(part => part === '')) {
    return false;
  }
  
  // Basic regex for allowed characters
  const localRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
  const domainRegex = /^[a-zA-Z0-9.-]+$/;
  
  return localRegex.test(localPart) && domainRegex.test(domain) && domain.includes('.');
};

/**
 * Normalizes an email address (converts to lowercase and trims whitespace)
 * @param {string} email - The email address to normalize
 * @returns {string|null} - Normalized email or null if invalid
 */
const normalizeEmail = (email) => {
  if (!isValidEmail(email)) {
    return null;
  }
  
  return email.trim().toLowerCase();
};

/**
 * Extracts domain from email address
 * @param {string} email - The email address
 * @returns {string|null} - Domain part of email or null if invalid
 */
const extractDomain = (email) => {
  if (!isValidEmail(email)) {
    return null;
  }
  
  const parts = email.trim().split('@');
  return parts[1] || null;
};

/**
 * Checks if email is from a common free email provider
 * @param {string} email - The email address to check
 * @returns {boolean} - True if from free provider, false otherwise
 */
const isFreeEmailProvider = (email) => {
  const domain = extractDomain(email);
  if (!domain) {
    return false;
  }
  
  const freeProviders = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'aol.com',
    'icloud.com'
  ];
  
  return freeProviders.includes(domain.toLowerCase());
};

/**
 * Masks an email address for privacy (e.g., j***@example.com)
 * @param {string} email - The email address to mask
 * @returns {string|null} - Masked email or null if invalid
 */
const maskEmail = (email) => {
  if (!isValidEmail(email)) {
    return null;
  }
  
  const [localPart, domain] = email.trim().split('@');
  const maskedLocal = localPart.charAt(0) + '*'.repeat(Math.max(0, localPart.length - 1));
  
  return `${maskedLocal}@${domain}`;
};

module.exports = {
  isValidEmail,
  normalizeEmail,
  extractDomain,
  isFreeEmailProvider,
  maskEmail
};
