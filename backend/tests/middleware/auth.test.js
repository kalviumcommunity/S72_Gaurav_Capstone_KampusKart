const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');
const User = require('../../models/User');

// Mock User model
jest.mock('../../models/User');

describe('Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      header: jest.fn(),
      user: null
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    
    // Reset environment variables
    process.env.JWT_SECRET = 'test-secret-key';
    process.env.ADMIN_EMAILS = 'admin@example.com,superadmin@example.com';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('JWT_SECRET Configuration', () => {
    test('should return 500 error when JWT_SECRET is not configured', async () => {
      delete process.env.JWT_SECRET;

      await auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Server configuration error'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Authorization Header', () => {
    test('should return 401 error when no authorization header', async () => {
      mockReq.header.mockReturnValue(null);

      await auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'No token, authorization denied'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should return 401 error when authorization header does not start with Bearer', async () => {
      mockReq.header.mockReturnValue('InvalidToken');

      await auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'No token, authorization denied'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should extract token correctly from Bearer header', async () => {
      const mockToken = 'valid-jwt-token';
      const mockDecoded = { userId: 'user123' };
      const mockUser = { _id: 'user123', email: 'test@example.com', name: 'Test User' };

      mockReq.header.mockReturnValue(`Bearer ${mockToken}`);
      jwt.verify = jest.fn().mockReturnValue(mockDecoded);
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await auth(mockReq, mockRes, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, 'test-secret-key');
      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Token Verification', () => {
    test('should return 401 error when token is invalid', async () => {
      mockReq.header.mockReturnValue('Bearer invalid-token');
      jwt.verify = jest.fn().mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Token is not valid'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should handle JWT verification errors gracefully', async () => {
      mockReq.header.mockReturnValue('Bearer malformed-token');
      jwt.verify = jest.fn().mockImplementation(() => {
        throw new jwt.JsonWebTokenError('jwt malformed');
      });

      await auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Token is not valid'
      });
    });
  });

  describe('User Lookup', () => {
    test('should return 401 error when user not found', async () => {
      const mockDecoded = { userId: 'nonexistent-user' };

      mockReq.header.mockReturnValue('Bearer valid-token');
      jwt.verify = jest.fn().mockReturnValue(mockDecoded);
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Token is not valid'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should add user to request object when user found', async () => {
      const mockDecoded = { userId: 'user123' };
      const mockUser = { 
        _id: 'user123', 
        email: 'test@example.com', 
        name: 'Test User' 
      };

      mockReq.header.mockReturnValue('Bearer valid-token');
      jwt.verify = jest.fn().mockReturnValue(mockDecoded);
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await auth(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    test('should exclude password from user object', async () => {
      const mockDecoded = { userId: 'user123' };
      const mockUser = { 
        _id: 'user123', 
        email: 'test@example.com', 
        name: 'Test User',
        password: 'hashed-password'
      };

      mockReq.header.mockReturnValue('Bearer valid-token');
      jwt.verify = jest.fn().mockReturnValue(mockDecoded);
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await auth(mockReq, mockRes, mockNext);

      expect(User.findById().select).toHaveBeenCalledWith('-password');
    });
  });

  describe('Admin Detection', () => {
    test('should set isAdmin to true for admin emails', async () => {
      const mockDecoded = { userId: 'user123' };
      const mockUser = { 
        _id: 'user123', 
        email: 'admin@example.com', 
        name: 'Admin User' 
      };

      mockReq.header.mockReturnValue('Bearer valid-token');
      jwt.verify = jest.fn().mockReturnValue(mockDecoded);
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await auth(mockReq, mockRes, mockNext);

      expect(mockReq.user.isAdmin).toBe(true);
      expect(mockNext).toHaveBeenCalled();
    });

    test('should set isAdmin to false for non-admin emails', async () => {
      const mockDecoded = { userId: 'user123' };
      const mockUser = { 
        _id: 'user123', 
        email: 'regular@example.com', 
        name: 'Regular User' 
      };

      mockReq.header.mockReturnValue('Bearer valid-token');
      jwt.verify = jest.fn().mockReturnValue(mockDecoded);
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await auth(mockReq, mockRes, mockNext);

      expect(mockReq.user.isAdmin).toBe(false);
      expect(mockNext).toHaveBeenCalled();
    });

    test('should handle empty ADMIN_EMAILS environment variable', async () => {
      delete process.env.ADMIN_EMAILS;
      
      const mockDecoded = { userId: 'user123' };
      const mockUser = { 
        _id: 'user123', 
        email: 'any@example.com', 
        name: 'Any User' 
      };

      mockReq.header.mockReturnValue('Bearer valid-token');
      jwt.verify = jest.fn().mockReturnValue(mockDecoded);
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await auth(mockReq, mockRes, mockNext);

      expect(mockReq.user.isAdmin).toBe(false);
      expect(mockNext).toHaveBeenCalled();
    });

    test('should handle multiple admin emails correctly', async () => {
      process.env.ADMIN_EMAILS = 'admin1@example.com,admin2@example.com,admin3@example.com';
      
      const mockDecoded = { userId: 'user123' };
      const mockUser = { 
        _id: 'user123', 
        email: 'admin2@example.com', 
        name: 'Admin User' 
      };

      mockReq.header.mockReturnValue('Bearer valid-token');
      jwt.verify = jest.fn().mockReturnValue(mockDecoded);
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await auth(mockReq, mockRes, mockNext);

      expect(mockReq.user.isAdmin).toBe(true);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      const mockDecoded = { userId: 'user123' };

      mockReq.header.mockReturnValue('Bearer valid-token');
      jwt.verify = jest.fn().mockReturnValue(mockDecoded);
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await auth(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Token is not valid'
      });
    });

    test('should log errors for debugging', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockDecoded = { userId: 'user123' };

      mockReq.header.mockReturnValue('Bearer valid-token');
      jwt.verify = jest.fn().mockReturnValue(mockDecoded);
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Test error'))
      });

      await auth(mockReq, mockRes, mockNext);

      expect(consoleSpy).toHaveBeenCalledWith('Auth middleware error:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });
});
