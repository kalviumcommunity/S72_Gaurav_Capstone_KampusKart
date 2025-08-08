const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const auth = require('../../middleware/auth');

// Mock dependencies
jest.mock('../../models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

// Create test app
const app = express();
app.use(express.json());

// Mock route for testing
app.post('/test-signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({ email, password, name });
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/test-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Protected route for testing
app.get('/test-protected', auth, (req, res) => {
  res.json({
    message: 'Protected route accessed successfully',
    user: req.user
  });
});

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-key';
  });

  describe('POST /test-signup', () => {
    test('should create a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123!',
        name: 'Test User'
      };

      const mockUser = {
        _id: 'user123',
        email: userData.email,
        name: userData.name,
        save: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(null);
      User.mockImplementation(() => mockUser);
      jwt.sign.mockReturnValue('mock-jwt-token');

      const response = await request(app)
        .post('/test-signup')
        .send(userData)
        .expect(201);

      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(User).toHaveBeenCalledWith(userData);
      expect(mockUser.save).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 'user123' },
        'test-secret-key',
        { expiresIn: '24h' }
      );
      expect(response.body).toEqual({
        message: 'User created successfully',
        token: 'mock-jwt-token',
        user: {
          id: 'user123',
          email: userData.email,
          name: userData.name
        }
      });
    });

    test('should return error when user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'TestPassword123!',
        name: 'Test User'
      };

      const existingUser = {
        _id: 'existing123',
        email: userData.email,
        name: 'Existing User'
      };

      User.findOne.mockResolvedValue(existingUser);

      const response = await request(app)
        .post('/test-signup')
        .send(userData)
        .expect(400);

      expect(response.body).toEqual({
        message: 'User already exists'
      });
      expect(User).not.toHaveBeenCalled();
    });

    test('should handle server errors', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123!',
        name: 'Test User'
      };

      User.findOne.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/test-signup')
        .send(userData)
        .expect(500);

      expect(response.body).toEqual({
        message: 'Server error',
        error: 'Database error'
      });
    });
  });

  describe('POST /test-login', () => {
    test('should login user successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'TestPassword123!'
      };

      const mockUser = {
        _id: 'user123',
        email: loginData.email,
        name: 'Test User',
        comparePassword: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mock-jwt-token');

      const response = await request(app)
        .post('/test-login')
        .send(loginData)
        .expect(200);

      expect(User.findOne).toHaveBeenCalledWith({ email: loginData.email });
      expect(mockUser.comparePassword).toHaveBeenCalledWith(loginData.password);
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 'user123' },
        'test-secret-key',
        { expiresIn: '24h' }
      );
      expect(response.body).toEqual({
        message: 'Login successful',
        token: 'mock-jwt-token',
        user: {
          id: 'user123',
          email: loginData.email,
          name: 'Test User'
        }
      });
    });

    test('should return error when user not found', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'TestPassword123!'
      };

      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/test-login')
        .send(loginData)
        .expect(401);

      expect(response.body).toEqual({
        message: 'Invalid credentials'
      });
    });

    test('should return error when password is incorrect', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword'
      };

      const mockUser = {
        _id: 'user123',
        email: loginData.email,
        name: 'Test User',
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/test-login')
        .send(loginData)
        .expect(401);

      expect(response.body).toEqual({
        message: 'Invalid credentials'
      });
      expect(mockUser.comparePassword).toHaveBeenCalledWith(loginData.password);
    });

    test('should handle server errors during login', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'TestPassword123!'
      };

      User.findOne.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/test-login')
        .send(loginData)
        .expect(500);

      expect(response.body).toEqual({
        message: 'Server error',
        error: 'Database error'
      });
    });
  });

  describe('GET /test-protected', () => {
    test('should access protected route with valid token', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        name: 'Test User'
      };

      // Mock the auth middleware for this test
      const authMiddleware = jest.fn((req, res, next) => {
        req.user = mockUser;
        next();
      });

      // Create a new app instance with mocked auth
      const testApp = express();
      testApp.use(express.json());
      testApp.get('/test-protected', authMiddleware, (req, res) => {
        res.json({
          message: 'Protected route accessed successfully',
          user: req.user
        });
      });

      const response = await request(testApp)
        .get('/test-protected')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Protected route accessed successfully',
        user: mockUser
      });
    });

    test('should reject request without authorization header', async () => {
      const response = await request(app)
        .get('/test-protected')
        .expect(401);

      expect(response.body).toEqual({
        message: 'No token, authorization denied'
      });
    });
  });

  describe('Input Validation', () => {
    test('should handle missing required fields in signup', async () => {
      const incompleteData = {
        email: 'test@example.com'
        // Missing password and name
      };

      // Mock User constructor to throw error for missing fields
      User.mockImplementation(() => {
        throw new Error('Validation failed');
      });

      const response = await request(app)
        .post('/test-signup')
        .send(incompleteData)
        .expect(500);

      expect(response.body.message).toBe('Server error');
    });

    test('should handle missing required fields in login', async () => {
      const incompleteData = {
        email: 'test@example.com'
        // Missing password
      };

      // Mock User.findOne to throw error
      User.findOne.mockRejectedValue(new Error('Validation failed'));

      const response = await request(app)
        .post('/test-login')
        .send(incompleteData)
        .expect(500);

      expect(response.body.message).toBe('Server error');
    });
  });

  describe('JWT Token Generation', () => {
    test('should generate token with correct payload', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123!',
        name: 'Test User'
      };

      const mockUser = {
        _id: 'user123',
        email: userData.email,
        name: userData.name,
        save: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(null);
      User.mockImplementation(() => mockUser);
      jwt.sign.mockReturnValue('mock-jwt-token');

      await request(app)
        .post('/test-signup')
        .send(userData)
        .expect(201);

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 'user123' },
        'test-secret-key',
        { expiresIn: '24h' }
      );
    });

    test('should handle JWT_SECRET not configured', async () => {
      delete process.env.JWT_SECRET;

      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123!',
        name: 'Test User'
      };

      const mockUser = {
        _id: 'user123',
        email: userData.email,
        name: userData.name,
        save: jest.fn().mockResolvedValue(true)
      };

      User.findOne.mockResolvedValue(null);
      User.mockImplementation(() => mockUser);
      jwt.sign.mockReturnValue('mock-jwt-token');

      const response = await request(app)
        .post('/test-signup')
        .send(userData)
        .expect(201);

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 'user123' },
        'test-secret',
        { expiresIn: '24h' }
      );
    });
  });
});
