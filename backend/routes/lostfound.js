const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Assuming you have an auth middleware
const LostFoundItem = require('../models/LostFoundItem');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier');
const rateLimit = require('express-rate-limit'); // Import rate-limit

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer configuration for file uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

// Helper function to upload images to Cloudinary
const uploadImages = async (files) => {
  const uploadPromises = files.map(file => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'lost-found' }, // Specify a folder in Cloudinary
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve({ public_id: result.public_id, url: result.secure_url });
        }
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  });
  return Promise.all(uploadPromises);
};

// Rate limiting middleware for item creation, update, and deletion
const itemRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Create a new lost or found item
router.post('/', authMiddleware, itemRateLimiter, upload.array('images', 5), async (req, res) => {
  try {
    const { type, title, description, location, date, contact } = req.body;
    const userId = req.user.id; // Assuming user ID is available from auth middleware

    // Validate required fields
    if (!title || !description || !date || !contact) {
        return res.status(400).json({ message: 'Please provide title, description, date, and contact information.' });
    }

    const images = req.files && req.files.length > 0 ? await uploadImages(req.files) : [];

    const newItem = new LostFoundItem({
      user: userId,
      type,
      title,
      description,
      location,
      date,
      images,
      contact,
    });

    await newItem.save();

    // Populate user before sending the response
    await newItem.populate('user', 'name email');

    res.status(201).json(newItem);

  } catch (error) {
    console.error('Create lost/found item error:', error);
    res.status(500).json({ message: 'Error creating item' });
  }
});

// Get search suggestions
router.get('/suggestions', authMiddleware, async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(200).json([]);
        }

        const searchRegex = new RegExp(query, 'i'); // Case-insensitive regex

        // Find items matching the query in title, description, or location
        const suggestions = await LostFoundItem.find({
            $or: [
                { title: searchRegex },
                { description: searchRegex },
                { location: searchRegex }
            ]
        })
        .select('title description type resolved location date createdAt') // Include more fields
        .limit(5) // Limit to 5 suggestions
        .sort({ createdAt: -1 }) // Sort by newest first
        .populate('user', 'name'); // Include user name

        // Format suggestions with more details
        const formattedSuggestions = suggestions.map(item => ({
            _id: item._id,
            title: item.title,
            description: item.description,
            type: item.type,
            resolved: item.resolved,
            location: item.location,
            date: item.date,
            createdAt: item.createdAt,
            userName: item.user.name,
            displayText: `${item.title} (${item.type}${item.resolved ? ' - Resolved' : ''})`,
            // Add a formatted date string
            formattedDate: new Date(item.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }),
            // Add a formatted time ago string
            timeAgo: getTimeAgo(new Date(item.createdAt))
        }));

        res.status(200).json(formattedSuggestions);

    } catch (error) {
        console.error('Get search suggestions error:', error);
        res.status(500).json({ message: 'Error fetching suggestions' });
    }
});

// Helper function to get time ago string
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
}

// Get all lost or found items (or filtered)
router.get('/', async (req, res) => {
  try {
    const { type, resolved, search, page = 1, limit = 10 } = req.query;
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    let filter = {};
    if (type) {
      filter.type = type;
    }
    if (resolved !== undefined) {
      filter.resolved = resolved === 'true';
    }

    // Add search filter if search query is provided
    if (search) {
        const searchRegex = new RegExp(search, 'i'); // Case-insensitive regex
        filter.$or = [
            { title: searchRegex },
            { description: searchRegex }
        ];
    }

    const count = await LostFoundItem.countDocuments(filter);
    const totalPages = Math.ceil(count / parsedLimit);
    const skip = (parsedPage - 1) * parsedLimit;

    const items = await LostFoundItem.find(filter)
        .skip(skip)
        .limit(parsedLimit)
        .populate('user', 'name email') // Populate user details
        .sort({ createdAt: -1 }); // Sort by creation date, newest first

    res.status(200).json({ items, totalItems: count, totalPages });

  } catch (error) {
    console.error('Get lost/found items error:', error);
    res.status(500).json({ message: 'Error fetching items' });
  }
});

// Get a single lost or found item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await LostFoundItem.findById(req.params.id).populate('user', 'name email');
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json(item);
  } catch (error) {
    console.error('Get single lost/found item error:', error);
    res.status(500).json({ message: 'Error fetching item' });
  }
});

// Update a lost or found item by ID
router.put('/:id', authMiddleware, itemRateLimiter, upload.array('images', 5), async (req, res) => {
  try {
    const { type, title, description, location, date, resolved, contact } = req.body;
    const userId = req.user.id;
    const itemId = req.params.id;

    // Validate required fields
    if (!title || !description || !date || !contact) {
        return res.status(400).json({ message: 'Please provide title, description, date, and contact information.' });
    }

    const item = await LostFoundItem.findById(itemId);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if the item is resolved
    if (item.resolved) {
        return res.status(409).json({ message: 'Resolved items cannot be updated' });
    }

    // Check if the logged-in user is the owner of the item
    if (item.user.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to update this item' });
    }

    // Handle image uploads and potentially deleting old images
    if (req.files && req.files.length > 0) {
        // Remove old images from Cloudinary
        if (item.images.length > 0) {
            for (const image of item.images) {
                await cloudinary.uploader.destroy(image.public_id);
            }
        }
        // Upload new images
        const newImages = await uploadImages(req.files);
        item.images = newImages;
    }

    // Update item fields
    item.type = type || item.type;
    item.title = title || item.title;
    item.description = description || item.description;
    item.location = location || item.location;
    item.date = date || item.date;
    // Only update resolved if it's explicitly provided in the request body
    if (resolved !== undefined) {
        item.resolved = resolved;
    }
    item.contact = contact || item.contact;

    await item.save();

    // Populate user before sending the response
    await item.populate('user', 'name email');

    res.status(200).json(item);


  } catch (error) {
    console.error('Update lost/found item error:', error);
    res.status(500).json({ message: 'Error updating item' });
  }
});

// Delete a lost or found item by ID
router.delete('/:id', authMiddleware, itemRateLimiter, async (req, res) => {
  try {
    const itemId = req.params.id;
    const userId = req.user.id;

    const item = await LostFoundItem.findById(itemId);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if the item is resolved
    if (item.resolved) {
        return res.status(409).json({ message: 'Resolved items cannot be deleted' });
    }

    // Check if the logged-in user is the owner of the item
    if (item.user.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this item' });
    }

    // Remove images from Cloudinary
    if (item.images.length > 0) {
      for (const image of item.images) {
        await cloudinary.uploader.destroy(image.public_id);
      }
    }

    // Use deleteOne() for Mongoose v6+
    await LostFoundItem.deleteOne({ _id: itemId });

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete lost/found item error:', error);
    res.status(500).json({ message: 'Error deleting item' });
  }
});

// Mark a lost or found item as resolved
router.put('/:id/resolve', authMiddleware, async (req, res) => {
    try {
        const itemId = req.params.id;
        const userId = req.user.id;

        const item = await LostFoundItem.findById(itemId);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check if the logged-in user is the owner of the item
        if (item.user.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to mark this item as resolved' });
        }

        item.resolved = true;
        item.resolvedAt = new Date(); // Set resolvedAt timestamp
        await item.save();

        res.status(200).json({ message: 'Item marked as resolved' });

    } catch (error) {
        console.error('Mark item as resolved error:', error);
        res.status(500).json({ message: 'Error marking item as resolved' });
    }
});

module.exports = router; 