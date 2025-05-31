const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const User = require('../models/User');
// Import Conversation and Message models
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// @desc    Search for users to start a chat
// @route   GET /api/chat/users
// @access  Private
router.get('/users', protect, async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

// @desc    Create or fetch a conversation
// @route   POST /api/chat
// @access  Private
router.post('/', protect, async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log('UserId param not sent with request');
    return res.sendStatus(400);
  }

  var isChat = await Conversation.find({
    $and: [
      { participants: { $eq: req.user._id } },
      { participants: { $eq: userId } },
    ],
  }).populate('participants', '-password').populate('latestMessage');

  isChat = await User.populate(isChat, {
    path: 'latestMessage.sender',
    select: 'name profilePicture email',
  });

  if (isChat.length > 0) {
    const chat = isChat[0];
    if (!chat.readBy.includes(req.user._id)) {
        chat.readBy.push(req.user._id);
        await chat.save();
    }
    res.send(chat);
  } else {
    var chatData = {
      participants: [req.user._id, userId],
      readBy: [req.user._id],
    };

    try {
      const createdChat = await Conversation.create(chatData);
      const FullChat = await Conversation.findOne({ _id: createdChat._id }).populate('participants', '-password').populate('latestMessage');
      const PopulatedChat = await User.populate(FullChat, {
        path: 'latestMessage.sender',
        select: 'name profilePicture email',
      });
      res.status(200).json(PopulatedChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

// @desc    Fetch all conversations for a user
// @route   GET /api/chat
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    Conversation.find({ participants: { $eq: req.user._id } })
      .populate('participants', '-password')
      .populate('latestMessage')
      .populate('readBy', 'name')
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: 'latestMessage.sender',
          select: 'name profilePicture email',
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Get all messages for a conversation
// @route   GET /api/chat/:conversationId/messages
// @access  Private
router.get('/:conversationId/messages', protect, async (req, res) => {
  try {
    const messages = await Message.find({ conversation: req.params.conversationId })
      .populate('sender', 'name profilePicture email');

    await Conversation.findByIdAndUpdate(
      req.params.conversationId,
      { $addToSet: { readBy: req.user._id } },
      { new: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Send a message
// @route   POST /api/chat/:conversationId/messages
// @access  Private
router.post('/:conversationId/messages', protect, async (req, res) => {
  const { text } = req.body;
  const conversationId = req.params.conversationId;

  if (!text || !conversationId) {
    console.log('Invalid data passed into request');
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    text: text,
    conversation: conversationId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate('sender', 'name profilePicture');
    message = await message.populate('conversation');
    message = await User.populate(message, {
      path: 'conversation.participants',
      select: 'name profilePicture email',
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      latestMessage: message,
      readBy: [req.user._id],
    });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Create a new group chat
// @route   POST /api/chat/group
// @access  Private
router.post('/group', protect, async (req, res) => {
  const { name, members } = req.body;

  if (!name || !members || members.length < 2) {
    return res.status(400).json({ message: 'Please provide a group name and select at least two members.' });
  }

  // Add the current user to the members list if not already present
  if (!members.includes(req.user._id)) {
      members.push(req.user._id);
  }

  try {
    const groupChat = await Conversation.create({
      isGroupChat: true,
      name: name,
      participants: members,
      groupAdmin: req.user._id,
      readBy: [req.user._id]
    });

    const fullGroupChat = await Conversation.findOne({ _id: groupChat._id })
      .populate('participants', '-password')
      .populate('groupAdmin', '-password');

    res.status(201).json(fullGroupChat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a conversation
// @route   DELETE /api/chat/:conversationId
// @access  Private
router.delete('/:conversationId', protect, async (req, res) => {
  try {
    const conversationId = req.params.conversationId;

    // Optional: Add authorization check to ensure only participants can delete
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Ensure the user is a participant in the conversation
    if (!conversation.participants.includes(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to delete this conversation' });
    }

    // Delete associated messages (optional, depending on desired behavior)
    await Message.deleteMany({ conversation: conversationId });

    // Delete the conversation
    await Conversation.findByIdAndDelete(conversationId);

    res.status(200).json({ message: 'Conversation deleted successfully' });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 