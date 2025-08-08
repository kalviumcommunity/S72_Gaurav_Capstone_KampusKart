const mongoose = require('mongoose');
const User = require('../../models/User');

describe('User Model Test', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('User Schema Validation', () => {
    test('should create a valid user with required fields', async () => {
      const validUser = {
        email: 'test@example.com',
        password: 'TestPassword123!',
        name: 'Test User'
      };

      const user = new User(validUser);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(validUser.email);
      expect(savedUser.name).toBe(validUser.name);
      expect(savedUser.createdAt).toBeDefined();
    });

    test('should fail to create user without required fields', async () => {
      const invalidUser = {
        name: 'Test User'
        // Missing email and password
      };

      const user = new User(invalidUser);
      let err;

      try {
        await user.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeDefined();
      expect(err.errors.email).toBeDefined();
    });

    test('should fail with invalid email format', async () => {
      const invalidUser = {
        email: 'invalid-email',
        password: 'TestPassword123!',
        name: 'Test User'
      };

      const user = new User(invalidUser);
      let err;

      try {
        await user.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeDefined();
    });

    test('should fail with password less than 6 characters', async () => {
      const invalidUser = {
        email: 'test@example.com',
        password: '123',
        name: 'Test User'
      };

      const user = new User(invalidUser);
      let err;

      try {
        await user.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeDefined();
      expect(err.errors.password).toBeDefined();
    });
  });

  describe('Password Hashing', () => {
    test('should hash password before saving', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'TestPassword123!',
        name: 'Test User'
      });

      const savedUser = await user.save();
      
      // Check that the password was hashed (should not be the original password)
      expect(savedUser.password).not.toBe('TestPassword123!');
      expect(savedUser.password).toBeDefined();
      expect(savedUser.password.length).toBeGreaterThan(0);
    });

    test('should not hash password if not modified', async () => {
      const user = new User({
        email: 'test2@example.com',
        password: 'TestPassword123!',
        name: 'Test User 2'
      });

      await user.save();
      const originalHashedPassword = user.password;
      
      // Update non-password field
      user.name = 'Updated Name';
      await user.save();

      // Password should remain the same
      expect(user.password).toBe(originalHashedPassword);
    });
  });

  describe('Password Comparison', () => {
    test('should compare password correctly', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'TestPassword123!',
        name: 'Test User'
      });

      await user.save(); // Save the user first to trigger password hashing
      const result = await user.comparePassword('TestPassword123!');
      
      expect(result).toBe(true);
    });

    test('should return false for incorrect password', async () => {
      const user = new User({
        email: 'test2@example.com',
        password: 'TestPassword123!',
        name: 'Test User 2'
      });

      await user.save();
      const result = await user.comparePassword('WrongPassword');
      
      expect(result).toBe(false);
    });
  });

  describe('Google Auth Support', () => {
    test('should allow user creation with Google ID without password', async () => {
      const googleUser = {
        email: 'google@example.com',
        name: 'Google User',
        googleId: 'google123'
      };

      const user = new User(googleUser);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.googleId).toBe('google123');
      expect(savedUser.password).toBeUndefined();
    });

    test('should require password for non-Google users', async () => {
      const regularUser = {
        email: 'regular@example.com',
        name: 'Regular User'
        // Missing password
      };

      const user = new User(regularUser);
      let err;

      try {
        await user.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeDefined();
      expect(err.errors.password).toBeDefined();
    });
  });

  describe('Email Uniqueness', () => {
    test('should not allow duplicate emails', async () => {
      const user1 = new User({
        email: 'duplicate@example.com',
        password: 'TestPassword123!',
        name: 'User 1'
      });

      const user2 = new User({
        email: 'duplicate@example.com',
        password: 'TestPassword123!',
        name: 'User 2'
      });

      await user1.save();
      let err;

      try {
        await user2.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeDefined();
      expect(err.code).toBe(11000); // MongoDB duplicate key error
    });
  });
});
