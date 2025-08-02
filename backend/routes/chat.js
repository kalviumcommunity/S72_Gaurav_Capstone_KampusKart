const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Helper function to upload a file buffer to Cloudinary
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: 'chat_attachments'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

// Get recent chat messages with pagination
router.get('/messages', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Chat.find({ isDeleted: false })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name profilePicture')
      .populate('replyTo')
      .lean();
    
    const total = await Chat.countDocuments({ isDeleted: false });
    
    res.json({
      messages: messages.reverse(),
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
});

// Search messages
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    const messages = await Chat.find(
      { $text: { $search: query }, isDeleted: false },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .populate('sender', 'name profilePicture')
      .limit(20)
      .lean();
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error searching messages', error: error.message });
  }
});

// Send new message
router.post('/messages', auth, upload.array('attachments', 5), async (req, res) => {
  try {
    const { message, replyTo } = req.body;
    const attachments = [];

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file);
        attachments.push({
          type: file.mimetype.startsWith('image/') ? 'image' : 'file',
          url: result.secure_url,
          name: file.originalname,
          size: file.size,
          mimeType: file.mimetype
        });
      }
    }

    const chatMessage = new Chat({
      sender: req.user._id,
      message,
      attachments,
      replyTo
    });

    await chatMessage.save();
    
    const populatedMessage = await Chat.findById(chatMessage._id)
      .populate('sender', 'name profilePicture')
      .populate('replyTo')
      .lean();

    // Emit to all clients in real time
    const io = req.app.get('io');
    if (io) {
      io.to('global-chat').emit('new-message', populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

// Edit message
router.patch('/messages/:messageId', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const chatMessage = await Chat.findById(req.params.messageId);
    
    // Debug logging
    console.log('Edit message debug:', {
      messageId: req.params.messageId,
      currentUser: req.user._id,
      messageSender: chatMessage ? chatMessage.sender : null,
      messageSenderString: chatMessage ? chatMessage.sender.toString() : null,
      userString: req.user._id.toString(),
      comparison: chatMessage ? chatMessage.sender.toString() === req.user._id.toString() : false
    });
    
    if (!chatMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (chatMessage.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this message' });
    }

    chatMessage.message = message;
    chatMessage.edited = true;
    chatMessage.editedAt = new Date();
    await chatMessage.save();
    
    const updatedMessage = await Chat.findById(chatMessage._id)
      .populate('sender', 'name profilePicture')
      .populate('replyTo')
      .lean();
    
    res.json(updatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error editing message', error: error.message });
  }
});

// Delete message (soft delete)
router.delete('/messages/:messageId', auth, async (req, res) => {
  try {
    const message = await Chat.findById(req.params.messageId);

    // Debug logging
    console.log('User:', req.user);
    console.log('User.isAdmin:', req.user.isAdmin);
    console.log('Message sender:', message ? message.sender : null);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    message.isDeleted = true;
    await message.save();

    // Emit message-deleted event
    const io = req.app.get('io');
    if (io) {
      io.to('global-chat').emit('message-deleted', { _id: message._id });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message', error: error.message });
  }
});

// Add/remove reaction
router.post('/messages/:messageId/reactions', auth, async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Chat.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.addReaction(req.user._id, emoji);
    
    const updatedMessage = await Chat.findById(message._id)
      .populate('sender', 'name profilePicture')
      .populate('reactions.user', 'name profilePicture')
      .lean();
    
    res.json(updatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error updating reaction', error: error.message });
  }
});

// Mark message as read
router.post('/messages/:messageId/read', auth, async (req, res) => {
  try {
    const message = await Chat.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.markAsRead(req.user._id);
    
    const updatedMessage = await Chat.findById(message._id)
      .populate('sender', 'name profilePicture')
      .populate('readBy.user', 'name profilePicture')
      .lean();
    
    res.json(updatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error marking message as read', error: error.message });
  }
});

module.exports = router; 