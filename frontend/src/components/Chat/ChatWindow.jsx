import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { io } from 'socket.io-client';
import { format } from 'date-fns';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  CircularProgress,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ReplyIcon from '@mui/icons-material/Reply';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { API_BASE } from '../../config';

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(API_BASE, {
      withCredentials: true,
    });

    // Join chat when component mounts
    if (user) {
      socketRef.current.emit('join', {
        _id: user._id,
        name: user.name,
        profilePicture: user.profilePicture,
      });
    }

    // Listen for previous messages
    socketRef.current.on('previous-messages', (data) => {
      // Support both array and object formats
      if (Array.isArray(data)) {
        setMessages(data);
        setHasMore(false); // No pagination info from socket
      } else if (data && data.messages) {
        setMessages(data.messages);
        if (data.pagination) {
          setHasMore(data.pagination.page < data.pagination.pages);
        }
      }
      setLoading(false);
    });

    // Listen for new messages
    socketRef.current.on('new-message', (message) => {
      if (message) {
        setMessages((prev) => [...prev, message]);
        markMessageAsRead(message._id);
      }
    });

    // Listen for online users
    socketRef.current.on('online-users', (users) => {
      if (Array.isArray(users)) {
        setOnlineUsers(users);
      }
    });

    // Listen for typing indicators
    socketRef.current.on('user-typing', (userData) => {
      if (userData && userData._id !== user._id) {
        setIsTyping(true);
      }
    });

    socketRef.current.on('user-stop-typing', (userData) => {
      if (userData && userData._id !== user._id) {
        setIsTyping(false);
      }
    });

    // Listen for message updates (edits, reactions, etc.)
    socketRef.current.on('message-updated', (updatedMessage) => {
      if (updatedMessage) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === updatedMessage._id ? updatedMessage : msg
          )
        );
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [user]);

  // Load more messages when scrolling up
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 1.0,
    };

    const handleObserver = (entries) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !loading) {
        loadMoreMessages();
      }
    };

    observerRef.current = new IntersectionObserver(handleObserver, options);

    if (messagesEndRef.current) {
      observerRef.current.observe(messagesEndRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [messages, hasMore, loading]);

  const loadMoreMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/api/chat/messages?page=${page + 1}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const data = await response.json();
      setMessages((prev) => [...data.messages, ...prev]);
      setPage((prev) => prev + 1);
      setHasMore(data.pagination.page < data.pagination.pages);
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && attachments.length === 0) return;

    const formData = new FormData();
    formData.append('message', newMessage);
    if (replyTo) {
      formData.append('replyTo', replyTo._id);
    }
    attachments.forEach((file) => {
      formData.append('attachments', file);
    });

    try {
      const response = await fetch(`${API_BASE}/api/chat/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to send message');

      // Emit socket event for real-time update
      if (socketRef.current) {
        socketRef.current.emit('send-message', {
          senderId: user._id,
          message: newMessage,
          // Optionally add attachments and replyTo if needed by backend
        });
      }

      setNewMessage('');
      setAttachments([]);
      setReplyTo(null);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };

  const handleTyping = () => {
    if (!socketRef.current) return;
    
    socketRef.current.emit('typing', {
      _id: user._id,
      name: user.name,
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('stop-typing', {
        _id: user._id,
        name: user.name,
      });
    }, 1000);
  };

  const handleMessageMenu = (event, message) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleEditMessage = async () => {
    if (!selectedMessage) return;
    setAnchorEl(null);
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;
    try {
      await fetch(`${API_BASE}/api/chat/messages/${selectedMessage._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setMessages((prev) =>
        prev.filter((msg) => msg._id !== selectedMessage._id)
      );
    } catch (error) {
      console.error('Error deleting message:', error);
    }
    setAnchorEl(null);
  };

  const handleAddReaction = async (emoji) => {
    if (!selectedMessage) return;
    try {
      await fetch(
        `${API_BASE}/api/chat/messages/${selectedMessage._id}/reactions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ emoji }),
        }
      );
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
    setAnchorEl(null);
  };

  const markMessageAsRead = async (messageId) => {
    try {
      await fetch(`${API_BASE}/api/chat/messages/${messageId}/read`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Chat header
  const ChatHeader = () => (
    <Paper elevation={2} sx={{
      p: 2,
      mb: 1,
      bgcolor: '#f7f7fa',
      borderRadius: '0 0 16px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid #e0e0e0',
    }}>
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar src={typeof '/Logo.png' === 'string' ? '/Logo.png' : undefined} sx={{ bgcolor: 'primary.main', width: 40, height: 40 }} />
        <Box>
          <Typography variant="h6" fontWeight={700} color="primary.main">KampusKart Chat</Typography>
          <Typography variant="caption" color="text.secondary">
            {onlineUsers.length} online
          </Typography>
        </Box>
      </Box>
      <Box>
        <IconButton onClick={() => setShowSearch(!showSearch)}>
          <SearchIcon />
        </IconButton>
      </Box>
    </Paper>
  );

  // Enhanced message bubble
  const renderMessage = (message) => {
    if (!message) return null;
    if (!message.sender) return null;
    const isOwnMessage = message.sender._id === user._id;
    const hasReactions = message.reactions && message.reactions.length > 0;
    const isRead = message.readBy && message.readBy.some((r) => r.user._id === user._id);
    return (
      <ListItem
        key={message._id}
        alignItems="flex-start"
        sx={{
          flexDirection: isOwnMessage ? 'row-reverse' : 'row',
          position: 'relative',
          mb: 1.5,
        }}
        disableGutters
      >
        <ListItemAvatar sx={{ minWidth: 48 }}>
          <Avatar
            src={typeof message.sender.profilePicture === 'string' ? message.sender.profilePicture : undefined}
            alt={message.sender.name}
            sx={{ border: isOwnMessage ? '2px solid #1976d2' : '2px solid #e0e0e0' }}
          />
        </ListItemAvatar>
        <Box sx={{
          bgcolor: isOwnMessage ? '#e3f2fd' : '#fff',
          border: isOwnMessage ? '1px solid #90caf9' : '1px solid #e0e0e0',
          borderRadius: isOwnMessage ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          p: 1.5,
          minWidth: 120,
          maxWidth: 420,
          boxShadow: 1,
          ml: isOwnMessage ? 0 : 1,
          mr: isOwnMessage ? 1 : 0,
          position: 'relative',
        }}>
          <Typography variant="body2" color="text.primary" sx={{ wordBreak: 'break-word' }}>
            {message.message}
            {message.edited && (
              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                (edited)
              </Typography>
            )}
          </Typography>
          {message.attachments && message.attachments.length > 0 && (
            <Box sx={{ mt: 1 }}>
              {message.attachments.map((attachment, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  {attachment.type === 'image' ? (
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      style={{ maxWidth: '180px', borderRadius: '8px', boxShadow: '0 2px 8px #eee' }}
                    />
                  ) : (
                    <Button
                      variant="outlined"
                      size="small"
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {attachment.name}
                    </Button>
                  )}
                </Box>
              ))}
            </Box>
          )}
          {hasReactions && (
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
              {message.reactions.map((reaction, index) => (
                <Tooltip key={index} title={reaction.user.name} placement="top">
                  <Typography component="span" variant="caption" sx={{ bgcolor: '#f1f1f1', px: 0.5, borderRadius: 1, fontSize: 18 }}>
                    {reaction.emoji}
                  </Typography>
                </Tooltip>
              ))}
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {message.sender.name}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {format(new Date(message.timestamp), 'HH:mm')}
            </Typography>
            {isOwnMessage && (
              <Typography variant="caption" color={isRead ? 'primary.main' : 'text.disabled'}>
                {isRead ? 'Read' : 'Sent'}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton
          size="small"
          onClick={(e) => handleMessageMenu(e, message)}
          sx={{ position: 'absolute', top: 0, right: isOwnMessage ? 'auto' : 0, left: isOwnMessage ? 0 : 'auto' }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </ListItem>
    );
  };

  if (loading && (!messages || messages.length === 0)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{
      position: 'fixed',
      top: '58px',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f7f7fa',
      overflow: 'hidden',
      height: 'calc(100vh - 58px)',
      minHeight: 0,
    }}>
      <ChatHeader />
      {/* Messages */}
      <Box sx={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        p: 3,
        mb: 0,
        bgcolor: '#f7f7fa',
        border: 'none',
        boxShadow: 'none',
      }}>
        {loading && <CircularProgress size={20} sx={{ display: 'block', mx: 'auto', my: 1 }} />}
        <List sx={{ p: 0 }}>
          {messages.map((message, index) => (
            <React.Fragment key={message._id}>
              {renderMessage(message)}
              {index < messages.length - 1 && <Divider variant="inset" component="li" sx={{ borderColor: '#e0e0e0' }} />}
            </React.Fragment>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      {/* Sticky Input and Reply Preview */}
      <Box sx={{ position: 'sticky', bottom: 0, left: 0, right: 0, bgcolor: '#f7f7fa', zIndex: 20, pt: 1 }}>
        {/* Reply Preview */}
        {replyTo && (
          <Paper sx={{ p: 1, mb: 1, bgcolor: 'grey.100' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Replying to {replyTo.sender.name}
              </Typography>
              <IconButton size="small" onClick={() => setReplyTo(null)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
            <Typography variant="body2" noWrap>
              {replyTo.message}
            </Typography>
          </Paper>
        )}
        {/* Typing Indicator */}
        {isTyping && (
          <Typography variant="caption" color="text.secondary" sx={{ px: 2, mb: 1 }}>
            Someone is typing...
          </Typography>
        )}
        {/* Message Input */}
        <Paper
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            boxShadow: '0 -2px 8px #eee',
          }}
        >
          <input
            type="file"
            multiple
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <IconButton onClick={() => fileInputRef.current?.click()}>
            <AttachFileIcon />
          </IconButton>
          <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            <EmojiEmotionsIcon />
          </IconButton>
          {showEmojiPicker && (
            <Box sx={{ position: 'absolute', bottom: '100%', left: 0 }}>
              <Picker data={data} onEmojiSelect={(emoji) => {
                setNewMessage((prev) => prev + emoji.native);
                setShowEmojiPicker(false);
              }} />
            </Box>
          )}
          {/* Show selected attachments as chips */}
          {attachments.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1, px: 2 }}>
              {attachments.map((file, idx) => (
                <Paper key={idx} sx={{ display: 'flex', alignItems: 'center', p: 0.5, bgcolor: '#e3f2fd' }}>
                  <Typography variant="caption" sx={{ mr: 1 }}>{file.name}</Typography>
                  <IconButton size="small" onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Paper>
              ))}
            </Box>
          )}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            size="small"
          />
          <IconButton type="submit" color="primary" disabled={!newMessage.trim() && attachments.length === 0}>
            <SendIcon />
          </IconButton>
        </Paper>
      </Box>

      {/* Message Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {selectedMessage?.sender._id === user._id && (
          <>
            <MenuItem onClick={handleEditMessage}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Edit
            </MenuItem>
            <MenuItem onClick={handleDeleteMessage}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          </>
        )}
        <MenuItem onClick={() => {
          setReplyTo(selectedMessage);
          setAnchorEl(null);
        }}>
          <ReplyIcon fontSize="small" sx={{ mr: 1 }} />
          Reply
        </MenuItem>
        <MenuItem onClick={() => handleAddReaction('👍')}>👍</MenuItem>
        <MenuItem onClick={() => handleAddReaction('❤️')}>❤️</MenuItem>
        <MenuItem onClick={() => handleAddReaction('😂')}>😂</MenuItem>
        <MenuItem onClick={() => handleAddReaction('😮')}>😮</MenuItem>
        <MenuItem onClick={() => handleAddReaction('😢')}>😢</MenuItem>
      </Menu>

      {/* Search Results Dialog */}
      <Dialog
        open={searchResults.length > 0}
        onClose={() => setSearchResults([])}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Search Results</DialogTitle>
        <DialogContent>
          <List>
            {searchResults.map((message) => (
              <React.Fragment key={message._id}>
                {renderMessage(message)}
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSearchResults([])}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatWindow; 