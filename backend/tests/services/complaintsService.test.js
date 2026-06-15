jest.mock('../../repositories/complaintRepository', () => ({
  create: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  count: jest.fn(),
  deleteOne: jest.fn(),
}));

jest.mock('../../services/mediaService', () => ({
  uploadImages: jest.fn(),
  deleteByPublicId: jest.fn(),
}));

const complaintsService = require('../../services/complaintsService');
const complaintRepository = require('../../repositories/complaintRepository');

describe('complaintsService stayAnonymous', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stores stayAnonymous when creating a complaint', async () => {
    complaintRepository.create.mockResolvedValue({
      populate: jest.fn().mockResolvedValue(true),
    });

    await complaintsService.createComplaint({
      userId: 'user-1',
      data: {
        title: 'Test complaint',
        description: 'Need this to be stored.',
        category: 'Academic',
        priority: 'Medium',
        department: 'Student Services',
        stayAnonymous: true,
      },
      files: [],
    });

    expect(complaintRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ stayAnonymous: true })
    );
  });

  it('updates stayAnonymous when editing a complaint', async () => {
    complaintRepository.findById.mockResolvedValue({
      user: { toString: () => 'user-1' },
      title: 'Old title',
      description: 'Old description',
      status: 'Open',
      statusHistory: [],
      images: [],
      category: 'Academic',
      priority: 'Medium',
      department: 'Student Services',
      save: jest.fn().mockResolvedValue({
        populate: jest.fn().mockResolvedValue(true),
      }),
    });

    await complaintsService.updateComplaint({
      complaintId: 'complaint-1',
      userId: 'user-1',
      isAdmin: false,
      data: {
        title: 'Updated title',
        description: 'Updated description',
        stayAnonymous: 'true',
      },
      files: [],
    });

    expect(complaintRepository.findById).toHaveBeenCalledWith('complaint-1');
  });
});
