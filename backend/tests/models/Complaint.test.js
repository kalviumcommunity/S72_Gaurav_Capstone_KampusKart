const mongoose = require('mongoose');
const Complaint = require('../../models/Complaint');

describe('Complaint Model Test', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Complaint.deleteMany({});
  });

  describe('Complaint Schema Validation', () => {
    test('should create a valid complaint with required fields', async () => {
      const validComplaint = {
        user: new mongoose.Types.ObjectId(),
        title: 'Test Complaint',
        description: 'This is a test complaint description',
        category: 'Academic',
        department: 'Academic Affairs'
      };

      const complaint = new Complaint(validComplaint);
      const savedComplaint = await complaint.save();

      expect(savedComplaint._id).toBeDefined();
      expect(savedComplaint.title).toBe(validComplaint.title);
      expect(savedComplaint.description).toBe(validComplaint.description);
      expect(savedComplaint.category).toBe(validComplaint.category);
      expect(savedComplaint.department).toBe(validComplaint.department);
      expect(savedComplaint.status).toBe('Open');
      expect(savedComplaint.priority).toBe('Medium');
      expect(savedComplaint.createdAt).toBeDefined();
      expect(savedComplaint.lastUpdated).toBeDefined();
      expect(savedComplaint.isDeleted).toBe(false);
    });

    test('should fail to create complaint without required fields', async () => {
      const invalidComplaint = {
        title: 'Test Complaint'
        // Missing user, description, category, department
      };

      const complaint = new Complaint(invalidComplaint);
      let err;

      try {
        await complaint.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeDefined();
      expect(err.errors.user).toBeDefined();
      expect(err.errors.description).toBeDefined();
      expect(err.errors.category).toBeDefined();
      expect(err.errors.department).toBeDefined();
    });

    test('should fail with title longer than 100 characters', async () => {
      const invalidComplaint = {
        user: new mongoose.Types.ObjectId(),
        title: 'A'.repeat(101), // 101 characters
        description: 'This is a test complaint description',
        category: 'Academic',
        department: 'Academic Affairs'
      };

      const complaint = new Complaint(invalidComplaint);
      let err;

      try {
        await complaint.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeDefined();
      expect(err.errors.title).toBeDefined();
    });

    test('should fail with description longer than 1000 characters', async () => {
      const invalidComplaint = {
        user: new mongoose.Types.ObjectId(),
        title: 'Test Complaint',
        description: 'A'.repeat(1001), // 1001 characters
        category: 'Academic',
        department: 'Academic Affairs'
      };

      const complaint = new Complaint(invalidComplaint);
      let err;

      try {
        await complaint.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeDefined();
      expect(err.errors.description).toBeDefined();
    });
  });

  describe('Category and Department Validation', () => {
    test('should accept valid categories', async () => {
      const validCategories = ['Academic', 'Administrative', 'Facilities', 'IT', 'Security', 'Other'];
      
      for (const category of validCategories) {
        const complaint = new Complaint({
          user: new mongoose.Types.ObjectId(),
          title: `Test Complaint - ${category}`,
          description: 'This is a test complaint description',
          category: category,
          department: 'Academic Affairs'
        });

        const savedComplaint = await complaint.save();
        expect(savedComplaint.category).toBe(category);
      }
    });

    test('should reject invalid category', async () => {
      const invalidComplaint = {
        user: new mongoose.Types.ObjectId(),
        title: 'Test Complaint',
        description: 'This is a test complaint description',
        category: 'InvalidCategory',
        department: 'Academic Affairs'
      };

      const complaint = new Complaint(invalidComplaint);
      let err;

      try {
        await complaint.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeDefined();
      expect(err.errors.category).toBeDefined();
    });

    test('should accept valid departments', async () => {
      const validDepartments = [
        'Academic Affairs', 
        'Administration', 
        'Facilities Management', 
        'IT Services', 
        'Security', 
        'Student Services'
      ];
      
      for (const department of validDepartments) {
        const complaint = new Complaint({
          user: new mongoose.Types.ObjectId(),
          title: `Test Complaint - ${department}`,
          description: 'This is a test complaint description',
          category: 'Academic',
          department: department
        });

        const savedComplaint = await complaint.save();
        expect(savedComplaint.department).toBe(department);
      }
    });

    test('should reject invalid department', async () => {
      const invalidComplaint = {
        user: new mongoose.Types.ObjectId(),
        title: 'Test Complaint',
        description: 'This is a test complaint description',
        category: 'Academic',
        department: 'InvalidDepartment'
      };

      const complaint = new Complaint(invalidComplaint);
      let err;

      try {
        await complaint.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeDefined();
      expect(err.errors.department).toBeDefined();
    });
  });

  describe('Priority Validation', () => {
    test('should accept valid priorities', async () => {
      const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
      
      for (const priority of validPriorities) {
        const complaint = new Complaint({
          user: new mongoose.Types.ObjectId(),
          title: `Test Complaint - ${priority}`,
          description: 'This is a test complaint description',
          category: 'Academic',
          department: 'Academic Affairs',
          priority: priority
        });

        const savedComplaint = await complaint.save();
        expect(savedComplaint.priority).toBe(priority);
      }
    });

    test('should default to Medium priority when not specified', async () => {
      const complaint = new Complaint({
        user: new mongoose.Types.ObjectId(),
        title: 'Test Complaint',
        description: 'This is a test complaint description',
        category: 'Academic',
        department: 'Academic Affairs'
      });

      const savedComplaint = await complaint.save();
      expect(savedComplaint.priority).toBe('Medium');
    });

    test('should reject invalid priority', async () => {
      const invalidComplaint = {
        user: new mongoose.Types.ObjectId(),
        title: 'Test Complaint',
        description: 'This is a test complaint description',
        category: 'Academic',
        department: 'Academic Affairs',
        priority: 'InvalidPriority'
      };

      const complaint = new Complaint(invalidComplaint);
      let err;

      try {
        await complaint.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeDefined();
      expect(err.errors.priority).toBeDefined();
    });
  });

  describe('Status Validation', () => {
    test('should accept valid statuses', async () => {
      const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
      
      for (const status of validStatuses) {
        const complaint = new Complaint({
          user: new mongoose.Types.ObjectId(),
          title: `Test Complaint - ${status}`,
          description: 'This is a test complaint description',
          category: 'Academic',
          department: 'Academic Affairs',
          status: status
        });

        const savedComplaint = await complaint.save();
        expect(savedComplaint.status).toBe(status);
      }
    });

    test('should default to Open status when not specified', async () => {
      const complaint = new Complaint({
        user: new mongoose.Types.ObjectId(),
        title: 'Test Complaint',
        description: 'This is a test complaint description',
        category: 'Academic',
        department: 'Academic Affairs'
      });

      const savedComplaint = await complaint.save();
      expect(savedComplaint.status).toBe('Open');
    });

    test('should reject invalid status', async () => {
      const invalidComplaint = {
        user: new mongoose.Types.ObjectId(),
        title: 'Test Complaint',
        description: 'This is a test complaint description',
        category: 'Academic',
        department: 'Academic Affairs',
        status: 'InvalidStatus'
      };

      const complaint = new Complaint(invalidComplaint);
      let err;

      try {
        await complaint.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeDefined();
      expect(err.errors.status).toBeDefined();
    });
  });

  describe('Status History', () => {
    test('should add status update to history', async () => {
      const complaint = new Complaint({
        user: new mongoose.Types.ObjectId(),
        title: 'Test Complaint',
        description: 'This is a test complaint description',
        category: 'Academic',
        department: 'Academic Affairs'
      });

      const savedComplaint = await complaint.save();

      // Add status update
      savedComplaint.statusHistory.push({
        status: 'In Progress',
        comment: 'Working on the issue',
        updatedBy: new mongoose.Types.ObjectId()
      });

      const updatedComplaint = await savedComplaint.save();

      expect(updatedComplaint.statusHistory).toHaveLength(1);
      expect(updatedComplaint.statusHistory[0].status).toBe('In Progress');
      expect(updatedComplaint.statusHistory[0].comment).toBe('Working on the issue');
      expect(updatedComplaint.statusHistory[0].timestamp).toBeDefined();
    });

    test('should validate status update comment length', async () => {
      const complaint = new Complaint({
        user: new mongoose.Types.ObjectId(),
        title: 'Test Complaint',
        description: 'This is a test complaint description',
        category: 'Academic',
        department: 'Academic Affairs'
      });

      const savedComplaint = await complaint.save();

      // Add status update with comment too long
      savedComplaint.statusHistory.push({
        status: 'In Progress',
        comment: 'A'.repeat(501), // 501 characters, exceeds 500 limit
        updatedBy: new mongoose.Types.ObjectId()
      });

      let err;
      try {
        await savedComplaint.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeDefined();
    });
  });

  describe('Images Array', () => {
    test('should accept valid image objects', async () => {
      const complaint = new Complaint({
        user: new mongoose.Types.ObjectId(),
        title: 'Test Complaint',
        description: 'This is a test complaint description',
        category: 'Academic',
        department: 'Academic Affairs',
        images: [
          {
            public_id: 'test_public_id_1',
            url: 'https://example.com/image1.jpg'
          },
          {
            public_id: 'test_public_id_2',
            url: 'https://example.com/image2.jpg'
          }
        ]
      });

      const savedComplaint = await complaint.save();

      expect(savedComplaint.images).toHaveLength(2);
      expect(savedComplaint.images[0].public_id).toBe('test_public_id_1');
      expect(savedComplaint.images[0].url).toBe('https://example.com/image1.jpg');
      expect(savedComplaint.images[1].public_id).toBe('test_public_id_2');
      expect(savedComplaint.images[1].url).toBe('https://example.com/image2.jpg');
    });

    test('should reject image without required fields', async () => {
      const complaint = new Complaint({
        user: new mongoose.Types.ObjectId(),
        title: 'Test Complaint',
        description: 'This is a test complaint description',
        category: 'Academic',
        department: 'Academic Affairs',
        images: [
          {
            public_id: 'test_public_id_1'
            // Missing url
          }
        ]
      });

      let err;
      try {
        await complaint.save();
      } catch (error) {
        err = error;
      }

      expect(err).toBeDefined();
    });
  });

  describe('Timestamps', () => {
    test('should update lastUpdated timestamp on save', async () => {
      const complaint = new Complaint({
        user: new mongoose.Types.ObjectId(),
        title: 'Test Complaint',
        description: 'This is a test complaint description',
        category: 'Academic',
        department: 'Academic Affairs'
      });

      const savedComplaint = await complaint.save();
      const initialLastUpdated = savedComplaint.lastUpdated;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      // Update the complaint
      savedComplaint.title = 'Updated Test Complaint';
      const updatedComplaint = await savedComplaint.save();

      expect(updatedComplaint.lastUpdated.getTime()).toBeGreaterThan(initialLastUpdated.getTime());
    });
  });

  describe('Soft Delete', () => {
    test('should support soft delete functionality', async () => {
      const complaint = new Complaint({
        user: new mongoose.Types.ObjectId(),
        title: 'Test Complaint',
        description: 'This is a test complaint description',
        category: 'Academic',
        department: 'Academic Affairs'
      });

      const savedComplaint = await complaint.save();
      expect(savedComplaint.isDeleted).toBe(false);
      expect(savedComplaint.deletedAt).toBeUndefined();

      // Soft delete
      savedComplaint.isDeleted = true;
      savedComplaint.deletedAt = new Date();
      const deletedComplaint = await savedComplaint.save();

      expect(deletedComplaint.isDeleted).toBe(true);
      expect(deletedComplaint.deletedAt).toBeDefined();
    });
  });
});
