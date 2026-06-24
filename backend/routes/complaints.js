const express = require('express');
const router = express.Router();
const { authMiddleware, requireAdmin } = require('../middleware/auth');
const { sanitizeInput, validateComplaint } = require('../middleware/validation');
const { createMemoryUpload } = require('../middleware/uploads');
const complaintsController = require('../controllers/complaintsController');
const { createRateLimiter } = require('../middleware/rateLimit');

const upload = createMemoryUpload();
const complaintWriteLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // same as events/news/etc.
  message: { message: 'Too many complaints submitted, please try again later' }
});

router.get('/', authMiddleware, complaintsController.listComplaints);
router.post(
  '/',
  authMiddleware,
  complaintWriteLimiter,
  upload.array('images', 5),
  sanitizeInput,
  validateComplaint,
  complaintsController.createComplaint
);

router.get(
  '/admin/all',
  authMiddleware,
  requireAdmin('Admin access required'),
  complaintsController.listAdminComplaints
);
router.delete(
  '/admin/:id/permanent',
  authMiddleware,
  requireAdmin('Admin access required'),
  complaintsController.adminPermanentDelete
);
router.patch(
  '/admin/:id/restore',
  authMiddleware,
  requireAdmin('Admin access required'),
  complaintsController.adminRestoreComplaint
);
router.post(
  '/admin/cleanup-expired',
  authMiddleware,
  requireAdmin('Admin access required'),
  complaintsController.adminCleanupExpired
);

router.put('/:id', authMiddleware, complaintWriteLimiter, sanitizeInput, validateComplaint,  upload.array('images', 5), complaintsController.updateComplaint);
router.delete('/:id', authMiddleware, complaintWriteLimiter, complaintsController.deleteComplaint)

module.exports = router;
