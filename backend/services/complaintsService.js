const complaintRepository = require('../repositories/complaintRepository');
const { ServiceError } = require('./serviceError');
const mediaService = require('./mediaService');
const { escapeRegex, parsePagination } = require('./queryUtils');

const listComplaints = async ({ status, category, search, page, limit }) => {
  const query = { isDeleted: { $ne: true } };

  if (status && status !== 'All') {
    query.status = status;
  }

  if (category && category !== 'all') {
    query.category = category;
  }

  if (search && typeof search === 'string') {
    const escapedSearch = escapeRegex(search);
    query.$or = [
      { title: { $regex: escapedSearch, $options: 'i' } },
      { description: { $regex: escapedSearch, $options: 'i' } },
      { category: { $regex: escapedSearch, $options: 'i' } },
      { department: { $regex: escapedSearch, $options: 'i' } }
    ];
  }

  const { page: parsedPage, limit: parsedLimit, skip } = parsePagination({
    page,
    limit,
    defaultLimit: 9,
    maxLimit: 100
  });

  const totalItems = await complaintRepository.count(query);
  const totalPages = Math.ceil(totalItems / parsedLimit);

  const complaints = await complaintRepository
    .find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parsedLimit);

  return { complaints, totalItems, totalPages, page: parsedPage };
};

const createComplaint = async ({ userId, data, files }) => {
  const { title, description, category, priority, department, stayAnonymous } = data;

  if (!title || !description) {
    throw new ServiceError('Title and description are required.', 400);
  }

  const images = files && files.length > 0
    ? await mediaService.uploadImages(files, {
        folder: 'complaints'
      })
    : [];

  const complaint = await complaintRepository.create({
    user: userId,
    title,
    description,
    images,
    category,
    priority,
    department,
    stayAnonymous: stayAnonymous === true || stayAnonymous === 'true'
  });

  await complaint.populate('user', 'name email');
  return complaint;
};

const updateComplaint = async ({ complaintId, userId, isAdmin, data, files }) => {
  const { title, description, status, category, priority, department, keepImages, statusComment, stayAnonymous } = data;

  const complaint = await complaintRepository.findById(complaintId);
  if (!complaint || complaint.isDeleted) {
    throw new ServiceError('Complaint not found.', 404);
  }

  if (complaint.user.toString() !== userId.toString() && !isAdmin) {
    throw new ServiceError('Not authorized to update this complaint.', 403);
  }

  complaint.title = title || complaint.title;
  complaint.description = description || complaint.description;

  if (status && isAdmin) {
    complaint.statusHistory.push({
      status,
      comment: statusComment || '',
      updatedBy: userId,
      timestamp: new Date()
    });
    complaint.status = status;
  }

  if (category) complaint.category = category;
  if (priority) complaint.priority = priority;
  if (department) complaint.department = department;
  if (Object.prototype.hasOwnProperty.call(data, 'stayAnonymous')) {
    complaint.stayAnonymous = stayAnonymous === true || stayAnonymous === 'true';
  }

  let keepPublicIds = [];
  if (keepImages) {
    try {
      keepPublicIds = JSON.parse(keepImages);
    } catch (error) {
      keepPublicIds = [];
    }
  }

  if (Array.isArray(complaint.images)) {
    for (const img of complaint.images) {
      if (!keepPublicIds.includes(img.public_id)) {
        try {
          await mediaService.deleteByPublicId(img.public_id);
        } catch (error) {
          // Ignore delete errors
        }
      }
    }
  }

  let keptImages = [];
  if (Array.isArray(complaint.images)) {
    keptImages = keepPublicIds
      .map((pid) => complaint.images.find((img) => img.public_id === pid))
      .filter(Boolean);
  }

  if (files && files.length > 0) {
    const newImages = await mediaService.uploadImages(files, {
      folder: 'complaints'
    });
    keptImages = [...keptImages, ...newImages];
  }

  complaint.images = keptImages;

  const updatedComplaint = await complaint.save();
  await updatedComplaint.populate('user', 'name email');

  return updatedComplaint;
};

const deleteComplaint = async ({ complaintId, userId, isAdmin }) => {
  const complaint = await complaintRepository.findById(complaintId);
  if (!complaint) {
    throw new ServiceError('Complaint not found.', 404);
  }

  if (complaint.user.toString() !== userId.toString() && !isAdmin) {
    throw new ServiceError('Not authorized to delete this complaint.', 403);
  }

  complaint.isDeleted = true;
  complaint.deletedAt = new Date();
  await complaint.save();

  return { message: 'Complaint removed.' };
};

const listAdminComplaints = async ({ status, search, page, limit, includeDeleted }) => {
  const query = {};

  if (status && status !== 'All') {
    query.status = status;
  }

  if (search) {
    const escapedSearch = escapeRegex(search);
    query.$or = [
      { title: { $regex: escapedSearch, $options: 'i' } },
      { description: { $regex: escapedSearch, $options: 'i' } }
    ];
  }

  if (includeDeleted !== 'true') {
    query.isDeleted = { $ne: true };
  }

  const { page: parsedPage, limit: parsedLimit, skip } = parsePagination({
    page,
    limit,
    defaultLimit: 50,
    maxLimit: 100
  });

  const totalItems = await complaintRepository.count(query);
  const totalPages = Math.ceil(totalItems / parsedLimit);

  const complaints = await complaintRepository
    .find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parsedLimit);

  return { complaints, totalItems, totalPages, page: parsedPage };
};

const adminRestoreComplaint = async (complaintId) => {
  const complaint = await complaintRepository.findById(complaintId);
  if (!complaint) {
    throw new ServiceError('Complaint not found.', 404);
  }

  complaint.isDeleted = false;
  complaint.deletedAt = undefined;
  await complaint.save();

  await complaint.populate('user', 'name email');
  return { message: 'Complaint restored successfully.', complaint };
};

const adminPermanentDelete = async (complaintId) => {
  const complaint = await complaintRepository.findById(complaintId);
  if (!complaint) {
    throw new ServiceError('Complaint not found.', 404);
  }

  if (Array.isArray(complaint.images)) {
    for (const img of complaint.images) {
      try {
        await mediaService.deleteByPublicId(img.public_id);
      } catch (error) {
        // Ignore delete errors
      }
    }
  }

  await complaintRepository.deleteOne({ _id: complaintId });
  return { message: 'Complaint permanently deleted.' };
};

const adminCleanupExpired = async () => {
  const now = new Date();
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(now.getDate() - 14);

  const expiredComplaints = await complaintRepository.find({
    status: { $in: ['Resolved', 'Closed'] },
    lastUpdated: { $lt: fourteenDaysAgo },
    isDeleted: { $ne: true }
  });

  let deletedCount = 0;
  let errorCount = 0;

  for (const complaint of expiredComplaints) {
    try {
      if (Array.isArray(complaint.images)) {
        for (const img of complaint.images) {
          try {
            await mediaService.deleteByPublicId(img.public_id);
          } catch (error) {
            // Ignore delete errors
          }
        }
      }

      complaint.isDeleted = true;
      complaint.deletedAt = new Date();
      await complaint.save();
      deletedCount += 1;
    } catch (error) {
      errorCount += 1;
    }
  }

  return {
    message: 'Manual cleanup completed',
    deletedCount,
    errorCount,
    totalFound: expiredComplaints.length
  };
};

module.exports = {
  listComplaints,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  listAdminComplaints,
  adminRestoreComplaint,
  adminPermanentDelete,
  adminCleanupExpired
};
