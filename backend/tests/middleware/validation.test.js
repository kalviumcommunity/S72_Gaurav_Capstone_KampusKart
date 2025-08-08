const { validationResult } = require('express-validator');
const { 
  sanitizeInput, 
  validateSignup, 
  validateLogin, 
  validateProfileUpdate
} = require('../../middleware/validation');

// Mock express-validator
jest.mock('express-validator', () => ({
  body: jest.fn(() => ({
    isEmail: jest.fn().mockReturnThis(),
    normalizeEmail: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    matches: jest.fn().mockReturnThis(),
    notEmpty: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis(),
    trim: jest.fn().mockReturnThis(),
    escape: jest.fn().mockReturnThis(),
    isIn: jest.fn().mockReturnThis()
  })),
  validationResult: jest.fn()
}));

describe('Validation Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sanitizeInput', () => {
    test('should trim string values in request body', () => {
      mockReq.body = {
        name: '  John Doe  ',
        email: '  test@example.com  ',
        message: '  Hello World  '
      };

      sanitizeInput(mockReq, mockRes, mockNext);

      expect(mockReq.body.name).toBe('John Doe');
      expect(mockReq.body.email).toBe('test@example.com');
      expect(mockReq.body.message).toBe('Hello World');
      expect(mockNext).toHaveBeenCalled();
    });

    test('should handle non-string values without modification', () => {
      mockReq.body = {
        age: 25,
        isActive: true,
        tags: ['tag1', 'tag2'],
        name: '  John Doe  '
      };

      sanitizeInput(mockReq, mockRes, mockNext);

      expect(mockReq.body.age).toBe(25);
      expect(mockReq.body.isActive).toBe(true);
      expect(mockReq.body.tags).toEqual(['tag1', 'tag2']);
      expect(mockReq.body.name).toBe('John Doe');
      expect(mockNext).toHaveBeenCalled();
    });

    test('should handle empty request body', () => {
      mockReq.body = {};

      sanitizeInput(mockReq, mockRes, mockNext);

      expect(mockReq.body).toEqual({});
      expect(mockNext).toHaveBeenCalled();
    });

    test('should handle null request body', () => {
      mockReq.body = null;

      sanitizeInput(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('validateSignup', () => {
    test('should pass validation for valid signup data', () => {
      validationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      const signupValidation = validateSignup[validateSignup.length - 1];
      signupValidation(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    test('should return validation errors for invalid signup data', () => {
      const mockErrors = [
        { path: 'email', msg: 'Please provide a valid email address' },
        { path: 'password', msg: 'Password must be at least 8 characters long' }
      ];

      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors
      });

      const signupValidation = validateSignup[validateSignup.length - 1];
      signupValidation(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        details: [
          { field: 'email', message: 'Please provide a valid email address' },
          { field: 'password', message: 'Password must be at least 8 characters long' }
        ]
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should handle empty validation errors array', () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => []
      });

      const signupValidation = validateSignup[validateSignup.length - 1];
      signupValidation(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        details: []
      });
    });
  });

  describe('validateLogin', () => {
    test('should pass validation for valid login data', () => {
      validationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      const loginValidation = validateLogin[validateLogin.length - 1];
      loginValidation(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    test('should return validation errors for invalid login data', () => {
      const mockErrors = [
        { path: 'email', msg: 'Please provide a valid email address' },
        { path: 'password', msg: 'Password is required' }
      ];

      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors
      });

      const loginValidation = validateLogin[validateLogin.length - 1];
      loginValidation(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        details: [
          { field: 'email', message: 'Please provide a valid email address' },
          { field: 'password', message: 'Password is required' }
        ]
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('validateProfileUpdate', () => {
    test('should pass validation for valid profile update data', () => {
      validationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      const profileValidation = validateProfileUpdate[validateProfileUpdate.length - 1];
      profileValidation(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    test('should return validation errors for invalid profile update data', () => {
      const mockErrors = [
        { path: 'name', msg: 'Name must be between 2 and 50 characters' },
        { path: 'phone', msg: 'Please provide a valid phone number' }
      ];

      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors
      });

      const profileValidation = validateProfileUpdate[validateProfileUpdate.length - 1];
      profileValidation(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        details: [
          { field: 'name', message: 'Name must be between 2 and 50 characters' },
          { field: 'phone', message: 'Please provide a valid phone number' }
        ]
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should handle optional fields correctly', () => {
      validationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      const profileValidation = validateProfileUpdate[validateProfileUpdate.length - 1];
      profileValidation(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle validationResult throwing an error', () => {
      validationResult.mockImplementation(() => {
        throw new Error('Validation error');
      });

      const signupValidation = validateSignup[validateSignup.length - 1];
      
      expect(() => {
        signupValidation(mockReq, mockRes, mockNext);
      }).toThrow('Validation error');
    });

    test('should handle missing validationResult methods', () => {
      validationResult.mockReturnValue({
        // Missing isEmpty and array methods
      });

      const signupValidation = validateSignup[validateSignup.length - 1];
      
      expect(() => {
        signupValidation(mockReq, mockRes, mockNext);
      }).toThrow();
    });
  });

  describe('Validation Rules Structure', () => {
    test('should have correct number of validation rules for signup', () => {
      // validateSignup should have validation rules + error handler
      expect(validateSignup.length).toBeGreaterThan(1);
    });

    test('should have correct number of validation rules for login', () => {
      // validateLogin should have validation rules + error handler
      expect(validateLogin.length).toBeGreaterThan(1);
    });

    test('should have correct number of validation rules for profile update', () => {
      // validateProfileUpdate should have validation rules + error handler
      expect(validateProfileUpdate.length).toBeGreaterThan(1);
    });
  });
});
