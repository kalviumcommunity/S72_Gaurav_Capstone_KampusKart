const express = require('express');
const router = express.Router();
const { authMiddleware, requireAdmin } = require('../middleware/auth');
const { sanitizeInput, validateLostFoundItem } = require('../middleware/validation');
const { createMemoryUpload } = require('../middleware/uploads');
const { createRateLimiter } = require('../middleware/rateLimit');
const lostfoundController = require('../controllers/lostfoundController');

const upload = createMemoryUpload();
const itemRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

router.post(
  '/',
  authMiddleware,
  itemRateLimiter,
  upload.array('images', 5),
  sanitizeInput,
  validateLostFoundItem,
  lostfoundController.createItem
);
router.get('/suggestions', authMiddleware, lostfoundController.getSuggestions);
router.get('/', lostfoundController.listItems);

router.get(
  '/admin/all',
  authMiddleware,
  requireAdmin('Admin access required'),
  lostfoundController.listAdminItems
);
router.delete(
  '/admin/:id/permanent',
  authMiddleware,
  requireAdmin('Admin access required'),
  lostfoundController.adminPermanentDelete
);
router.patch(
  '/admin/:id/restore',
  authMiddleware,
  requireAdmin('Admin access required'),
  lostfoundController.adminRestoreItem
);
router.post(
  '/admin/cleanup-expired',
  authMiddleware,
  requireAdmin('Admin access required'),
  lostfoundController.adminCleanupExpired
);

router.get('/:id', lostfoundController.getItemById);
router.put(
  '/:id',
  authMiddleware,
  itemRateLimiter,
  upload.array('images', 5),
  sanitizeInput,
  validateLostFoundItem,
  lostfoundController.updateItem
);
router.delete('/:id', authMiddleware, itemRateLimiter, lostfoundController.deleteItem);
router.patch('/:id/resolve', authMiddleware, lostfoundController.resolveItem);

module.exports = router;
