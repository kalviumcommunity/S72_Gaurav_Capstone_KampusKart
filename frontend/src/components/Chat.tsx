import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import { useAuth } from '../contexts/AuthContext';
import { FiSearch, FiSend, FiSmile } from 'react-icons/fi';
import io from 'socket.io-client';
import { format, isSameDay, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import Picker from '@emoji-mart/react';
import emojiData from '@emoji-mart/data';
import { API_BASE } from '../config';

interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture?: {
    url: string;
    public_id: string;
  };
}

interface Message {
  _id: string;
  sender: User;
  text: string;
  createdAt: string;
  conversation: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

interface Conversation {
  _id: string;
  participants: User[];
  latestMessage?: Message;
  updatedAt: string;
  readBy?: string[];
  isGroupChat: boolean;
  name?: string;
}

const ENDPOINT = API_BASE;
  
const Chat: React.FC = () => {
  const { user, token } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [conversationsError, setConversationsError] = useState<string | null>(null);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [conversationCreateError, setConversationCreateError] = useState<string | null>(null);
  const [sendMessageError, setSendMessageError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (user && API_BASE) {
      try {
        socketRef.current = io(API_BASE, {
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
          transports: ['websocket', 'polling'],
        });

        socketRef.current.on('connect', () => {
          console.log('Socket connected');
          setSocketConnected(true);
          if (user?._id) {
            socketRef.current.emit('setup', user);
          }
        });

        socketRef.current.on('connect_error', (error: any) => {
          console.error('Socket connection error:', error);
          setSocketConnected(false);
          // Attempt to reconnect after a delay
          setTimeout(() => {
            if (socketRef.current) {
              socketRef.current.connect();
            }
          }, 5000);
        });

        socketRef.current.on('disconnect', (reason: any) => {
          console.log('Socket disconnected:', reason);
          setSocketConnected(false);
          // Attempt to reconnect if not disconnected by the server
          if (reason !== 'io server disconnect') {
            setTimeout(() => {
              if (socketRef.current) {
                socketRef.current.connect();
              }
            }, 5000);
          }
        });

        socketRef.current.on('reconnect', (attemptNumber: number) => {
          console.log('Socket reconnected after', attemptNumber, 'attempts');
          setSocketConnected(true);
          if (user?._id) {
            socketRef.current.emit('setup', user);
          }
        });

        socketRef.current.on('message received', (newMessageReceived: Message) => {
          if (selectedConversation && selectedConversation._id === newMessageReceived.conversation) {
            setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
            // Mark message as delivered
            if (user?._id) {
              socketRef.current.emit('message delivered', { 
                messageId: newMessageReceived._id, 
                userId: user._id 
              });
            }
          }
          
          // Update conversations list
          setConversations(prevConversations => {
            const updatedConversations = prevConversations.map(conv =>
              conv._id === newMessageReceived.conversation 
                ? { 
                    ...conv, 
                    latestMessage: newMessageReceived, 
                    updatedAt: newMessageReceived.createdAt,
                    readBy: conv.readBy || []
                  } 
                : conv
            );
            
            // Sort conversations by updatedAt
            updatedConversations.sort((a, b) => 
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
            
            // If conversation not found, fetch updated list
            if (!updatedConversations.find(conv => conv._id === newMessageReceived.conversation)) {
              fetchConversations();
              return prevConversations;
            }
            
            return updatedConversations;
          });
        });

        socketRef.current.on('message delivered', (data: { messageId: string, userId: string }) => {
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg._id === data.messageId ? { ...msg, status: 'delivered' } : msg
            )
          );
        });

        socketRef.current.on('message read', (data: { messageId: string, userId: string }) => {
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg._id === data.messageId ? { ...msg, status: 'read' } : msg
            )
          );
          
          // Update conversation readBy status
          setConversations(prevConversations =>
            prevConversations.map(conv => {
              if (conv.latestMessage?._id === data.messageId) {
                return {
                  ...conv,
                  readBy: [...(conv.readBy || []), data.userId].filter((id, index, self) => 
                    self.indexOf(id) === index
                  )
                };
              }
              return conv;
            })
          );
        });

        socketRef.current.on('typing', (data: { conversationId: string, userId: string }) => {
          if (selectedConversation && selectedConversation._id === data.conversationId) {
            setIsTyping(true);
          }
        });

        socketRef.current.on('stop typing', (data: { conversationId: string, userId: string }) => {
          if (selectedConversation && selectedConversation._id === data.conversationId) {
            setIsTyping(false);
          }
        });

        socketRef.current.on('online users', (users: string[]) => {
          console.log('Online users received:', users);
          setOnlineUsers(users);
        });

        socketRef.current.on('user online', (userId: string) => {
          console.log('User online:', userId);
          setOnlineUsers(prevUsers => [...prevUsers, userId]);
        });

        socketRef.current.on('user offline', (userId: string) => {
          console.log('User offline:', userId);
          setOnlineUsers(prevUsers => prevUsers.filter(id => id !== userId));
        });
      } catch (error) {
        console.error('Error initializing socket:', error);
        setSocketConnected(false);
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    if (!token) return;
    setConversationsError(null);
    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      const data = await response.json();
      // Sort conversations by updatedAt (newest first)
      data.sort((a: Conversation, b: Conversation) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      // Ensure readBy is an array for each conversation
      data.forEach((conv: Conversation) => {
        if (!conv.readBy) conv.readBy = [];
      });
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversationsError('Failed to load conversations.');
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [token]);

  const fetchMessages = async () => {
    console.log('fetchMessages called', { selectedConversation: selectedConversation?._id, token: !!token, socketConnected });
    if (!selectedConversation || !token) {
      setMessages([]);
      setMessagesError(null);
      return;
    }
    setMessagesError(null);
    try {
      if (socketRef.current) {
        socketRef.current.emit('join chat', selectedConversation._id);
      }

      const response = await fetch(`${API_BASE}/api/chat/${selectedConversation._id}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(data);

      // Mark conversation as read by the current user
      if (user?._id) {
        const markReadResponse = await fetch(`${API_BASE}/api/chat/${selectedConversation._id}/read`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: user._id }),
        });
        if (!markReadResponse.ok) {
          console.error('Failed to mark conversation as read');
        }
      }

      // Update local state to mark conversation as read
      if (user?._id) {
        setConversations(prevConversations => prevConversations.map(conv =>
          conv._id === selectedConversation._id
            ? { ...conv, readBy: [...(conv.readBy || []), user._id].filter((id, index, self) => self.indexOf(id) === index) }
            : conv
        ));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
      setMessagesError('Failed to load messages.');
    }
  };

  useEffect(() => {
    console.log('useEffect for fetching messages triggered', { selectedConversation: selectedConversation?._id, token: !!token, socketConnected });
    fetchMessages();
  }, [selectedConversation, token, socketConnected, user]);

  useEffect(() => {
    if (
      selectedConversation &&
      messages.length > 0 &&
      socketRef.current &&
      user?._id
    ) {
      messages.forEach((msg) => {
        if (msg.sender._id !== user._id && msg.status !== 'read') {
          socketRef.current.emit('message read', {
            conversationId: selectedConversation._id,
            messageId: msg._id,
            senderId: msg.sender._id,
          });
        }
      });
    }
  }, [messages, selectedConversation, user]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchText(query);
    setSearchError(null);
    if (query.length > 2) {
      try {
        const response = await fetch(`${API_BASE}/api/chat/users?search=${query}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to search users');
        }
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
        setSearchError('Failed to search users.');
      }
    } else {
      setSearchResults([]);
      setSearchError(null);
    }
  };

  const handleUserSelect = async (userId: string) => {
    if (!user?._id || !token) return;
    
    setConversationCreateError(null);
    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create/fetch conversation');
      }

      const conversation = await response.json();
      
      // Clear search results
      setSearchResults([]);
      setSearchText('');

      // Update conversations list
      setConversations(prevConversations => {
        const updatedConversations = prevConversations.filter(conv => conv._id !== conversation._id);
        updatedConversations.unshift({
          ...conversation,
          readBy: [user._id]
        });
        return updatedConversations;
      });

      // Select the new conversation and immediately trigger message fetching
      setSelectedConversation(conversation);
      console.log('setSelectedConversation called with:', conversation);
      console.log('Conversations after update:', conversations);

    } catch (error) {
      console.error('Error creating/fetching conversation:', error);
      setConversationCreateError('Failed to start conversation. Please try again.');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !token || !socketConnected || !user?._id) return;

    const messageContent = newMessage;
    setNewMessage('');
    setSendMessageError(null);

    const tempMessage: Message = {
      _id: Date.now().toString(),
      sender: user,
      text: messageContent,
      createdAt: new Date().toISOString(),
      conversation: selectedConversation._id,
      status: 'sending'
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const response = await fetch(`${API_BASE}/api/chat/${selectedConversation._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: messageContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const sentMessage: Message = await response.json();
      
      // Update messages with the sent message
      setMessages(prevMessages =>
        prevMessages.map(msg => 
          msg._id === tempMessage._id ? { ...sentMessage, status: 'sent' } : msg
        )
      );

      // Emit the new message through socket
      if (socketRef.current) {
        socketRef.current.emit('new message', sentMessage);
      }

      // Update conversations list
      setConversations(prevConversations => {
        const updatedConversations = prevConversations.map(conv =>
          conv._id === selectedConversation._id 
            ? { 
                ...conv, 
                latestMessage: sentMessage, 
                updatedAt: sentMessage.createdAt,
                readBy: [user._id] // Reset readBy to only include sender
              } 
            : conv
        );
        
        // Sort conversations by updatedAt
        updatedConversations.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        
        return updatedConversations;
      });

    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the temporary message and restore the input
      setMessages(prevMessages => prevMessages.filter(msg => msg._id !== tempMessage._id));
      setNewMessage(messageContent);
      setSendMessageError('Failed to send message. Please try again.');
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (socketRef.current && selectedConversation) {
      socketRef.current.emit('typing', { conversationId: selectedConversation._id, userId: user?._id });
    }
  };

  const handleStopTyping = () => {
    if (socketRef.current && selectedConversation) {
      socketRef.current.emit('stop typing', { conversationId: selectedConversation._id, userId: user?._id });
    }
  };

  const getParticipantName = (participants: User[]) => {
    const otherParticipant = participants.find(p => p._id !== user?._id);
    return otherParticipant ? otherParticipant.name : 'Unknown User';
  };

  const renderParticipantAvatar = (participant: User | undefined, size: 'small' | 'large') => {
    if (!participant) return null;
    const avatarSizeClass = size === 'small' ? 'w-8 h-8' : 'w-10 h-10';
    const defaultAvatarSize = size === 'small' ? 20 : 24;

    if (participant.profilePicture?.url) {
      return (
        <img
          src={participant.profilePicture.url}
          alt={participant.name}
          className={`${avatarSizeClass} rounded-full mr-3 object-cover border border-gray-300`}
          onError={(e) => { console.error('Error loading profile picture:', e.currentTarget.src); e.currentTarget.src = '/default-profile.png'; }}
        />
      );
    } else {
      const initial = participant.name ? participant.name.charAt(0).toUpperCase() : '?';
      return (
        <div className={`${avatarSizeClass} rounded-full mr-3 bg-gray-300 flex items-center justify-center text-black font-bold text-lg`}>
           <svg xmlns="http://www.w3.org/2000/svg" width={defaultAvatarSize} height={defaultAvatarSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-user"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </div>
      );
    }
  };

   const groupMessagesByDate = (messages: Message[]) => {
    const grouped = new Map<string, Message[]>();
    messages.forEach(message => {
      const dateKey = format(parseISO(message.createdAt), 'yyyy-MM-dd');
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(message);
    });
    return Array.from(grouped.entries());
  };

  const renderDateHeader = (dateString: string) => {
    const date = parseISO(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(date, today)) {
      return 'Today';
    } else if (isSameDay(date, yesterday)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node) &&
          searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node)) {
        setSearchResults([]);
        setSearchText('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchInputRef, searchResultsRef]);

  const handleDeleteChat = async () => {
    if (!selectedConversation || !token) return;

    const confirmDelete = window.confirm(`Are you sure you want to delete this conversation?`);

    if (confirmDelete) {
      try {
        const response = await fetch(`${API_BASE}/api/chat/${selectedConversation._id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete conversation');
        }

        // Remove the conversation from the state
        setConversations(prevConversations => prevConversations.filter(conv => conv._id !== selectedConversation._id));
        setSelectedConversation(null); // Deselect the conversation

        alert('Conversation deleted successfully.');

      } catch (error) {
        console.error('Error deleting conversation:', error);
        alert('Failed to delete conversation.');
      }
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setNewMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const handleConversationClick = (conversation: Conversation) => {
    if (conversation && conversation._id) {
      setSelectedConversation(conversation);
      // Mark conversation as read when selected
      if (user?._id && conversation.readBy && !conversation.readBy.includes(user._id)) {
        setConversations(prevConversations =>
          prevConversations.map(conv =>
            conv._id === conversation._id
              ? { ...conv, readBy: [...(conv.readBy || []), user._id] }
              : conv
          )
        );
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />
      <main className="flex-1 container mx-auto p-2 md:p-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#F3F4F6] rounded-lg shadow-inner overflow-x-hidden" style={{ paddingTop: '80px' }}>
        {/* Left Column - Conversations */}
        <div className={`md:col-span-1 bg-white p-4 rounded-lg shadow flex flex-col max-h-[calc(100vh-100px)] overflow-hidden ${
          selectedConversation ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Search Users section at the top of the left panel */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Start New Chat</h2>
             <form className="relative mb-4 flex" onSubmit={e => e.preventDefault()}>
               <div className="relative flex-1">
                 <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                 <input
                   type="text"
                   placeholder="Search users..."
                   className="w-full pl-10 pr-4 py-2 rounded-l-full border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00C6A7] focus:border-transparent text-gray-900 bg-gray-50"
                   value={searchText}
                   onChange={handleSearch}
                   ref={searchInputRef}
                 />
               </div>
               <button
                 type="button"
                 aria-label="Search"
                 className="px-4 py-2 bg-[#00C6A7] text-white rounded-r-full font-semibold hover:bg-[#009e87] transition"
                 tabIndex={-1}
                 onClick={() => searchInputRef.current?.focus()}
               >
                 <FiSearch />
               </button>
               {searchResults.length > 0 && (
                 <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-80 overflow-y-auto left-0 top-12" ref={searchResultsRef}>
                   {searchResults.map((result) => (
                     <div
                       key={result._id}
                       className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center text-gray-900 rounded-md"
                       onClick={() => handleUserSelect(result._id)}
                       onKeyDown={(e) => {
                         if (e.key === 'Enter' || e.key === ' ') {
                           handleUserSelect(result._id);
                         }
                       }}
                       role="button"
                       tabIndex={0}
                       style={{ pointerEvents: 'auto', zIndex: 20 }}
                     >
                       {renderParticipantAvatar(result, 'small')}
                       <div>
                         <p className="font-semibold">{result.name}</p>
                         <p className="text-sm text-gray-600">{result.email}</p>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </form>
             {conversationCreateError && <div className="text-red-500 text-sm mt-2">{conversationCreateError}</div>}
           </div>

           <h2 className="text-lg font-semibold mb-4 text-gray-800">People</h2>
           <div className="space-y-4 flex-1 overflow-y-auto">
             {/* Combined Conversation List */}
              <div className="flex-1 overflow-y-auto space-y-4">
                {conversations.length === 0 && !conversationsError ? (
                   <div className="text-center text-gray-500">No conversations yet.</div>
                ) : conversationsError ? (
                   <div className="text-center text-red-500">{conversationsError}</div>
                ) : (conversations.map((conversation) => {
                    const isGroup = conversation.isGroupChat;
                    const displayName = isGroup ? conversation.name : getParticipantName(conversation.participants);
                    const displayAvatar = isGroup ? (
                      <div className="w-8 h-8 rounded-full bg-purple-300 mr-3 flex items-center justify-center text-black font-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-users"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                      </div>
                    ) : (
                      renderParticipantAvatar(conversation.participants.find(p => p._id !== user?._id), 'small')
                    );
                    const isOnline = !isGroup && conversation.participants.find(p => p._id !== user?._id) && onlineUsers.includes(conversation.participants.find(p => p._id !== user?._id)?._id || '');
                    const isSelected = selectedConversation?._id === conversation._id;
                    const isUnread = conversation.latestMessage && user?._id && conversation.readBy && !conversation.readBy.includes(user._id);

                    return (
                      <div
                        key={conversation._id}
                        className={`flex items-center p-2 cursor-pointer rounded-md ${
                          isSelected ? 'bg-gray-200' : 'hover:bg-gray-100'
                        }`}
                        onClick={() => handleConversationClick(conversation)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleConversationClick(conversation);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="relative mr-3 flex items-center">
                          {displayAvatar}
                          {isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 flex items-center">
                            {displayName}
                            {isUnread && (
                              <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {conversation.latestMessage ? `${conversation.latestMessage.sender._id === user?._id ? 'You: ' : ''}${conversation.latestMessage.text.substring(0, 30)}${conversation.latestMessage.text.length > 30 ? '...' : ''}` : 'Start a conversation'}
                          </div>
                        </div>
                      </div>
                    );
                }))}
              </div>
           </div>
        </div>

        {/* Right Column - Chat Area */}
        <div className={`md:col-span-2 bg-white p-4 md:p-6 rounded-lg shadow flex flex-col max-h-[calc(100vh-96px)] ${
          selectedConversation ? 'flex' : 'hidden md:flex'
        }`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center border-b border-gray-200 pb-4 mb-4">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden mr-2 p-2 hover:bg-gray-100 rounded-full"
                  aria-label="Back to conversations"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>
                {renderParticipantAvatar(selectedConversation.participants.find(p => p._id !== user?._id), 'large')}
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800">{getParticipantName(selectedConversation.participants)}</h2>
                  {selectedConversation.participants.find(p => p._id !== user?._id) && onlineUsers.includes(selectedConversation.participants.find(p => p._id !== user?._id)?._id || '') ? (
                    <span className="text-sm text-green-600 font-semibold">Online</span>
                  ) : (
                    <span className="text-sm text-gray-500">Offline</span>
                  )}
                </div>
                {/* Header Icons */}
                <div className="flex space-x-4 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-trash-2 cursor-pointer hover:text-red-600" onClick={handleDeleteChat}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-4 px-2 md:px-0">
                {groupMessagesByDate(messages).map(([date, messagesForDate]) => (
                  <div key={date}>
                    <div className="text-center text-sm text-gray-500 mb-4">{renderDateHeader(date)}</div>
                    {messagesForDate.map((message) => {
                      const isMine = message.sender._id === user?._id;
                      return (
                        <div
                          key={message._id}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2`}
                        >
                          <div className={`max-w-[85%] md:max-w-[70%] px-4 py-2 rounded-2xl shadow-md flex-shrink-0 ${
                            isMine
                              ? 'bg-gradient-to-br from-[#DCF8C6] to-[#b2f0e6] text-black rounded-br-none mr-4'
                              : 'bg-gradient-to-br from-[#F3F4F6] to-[#e0e7ef] text-black rounded-bl-none ml-2'
                            }`}>
                            <p className="pb-1 break-words">{message.text}</p>
                            <div className={`flex items-center ${isMine ? 'justify-end' : 'justify-start'} space-x-1 mt-1 text-xs text-gray-500 opacity-75`}>
                              <span>{format(new Date(message.createdAt), 'h:mm a')}</span>
                              {isMine && message.status && (
                                <span className="ml-1">
                                  {message.status === 'sent' && '✓'}
                                  {message.status === 'delivered' && '✓✓'}
                                  {message.status === 'read' && <span className="text-blue-500">✓✓</span>}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500 italic">
                    <div className="flex items-center gap-2">
                      <span>{getParticipantName(selectedConversation.participants.filter(p => p._id !== user?._id))} is typing</span>
                      <span className="inline-flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {messages.length === 0 && selectedConversation && !messagesError && (
                <div className="text-center text-gray-500">Loading messages...</div>
              )}
              {messagesError && (
                <div className="text-center text-red-500 mt-4">{messagesError}</div>
              )}

              {/* Message Input Area */}
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-4 border-t border-gray-200 relative">
                {/* Emoji Picker Button */}
                <button
                  type="button"
                  aria-label="Open emoji picker"
                  className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#181818] text-white border border-gray-300 hover:bg-[#00C6A7] focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2 transition-colors duration-200"
                  onClick={() => setShowEmojiPicker(v => !v)}
                  tabIndex={0}
                >
                  <FiSmile size={32} className="text-white md:text-4xl" />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-16 left-0 z-[9999]">
                    <Picker data={emojiData} onEmojiSelect={handleEmojiSelect} theme="light" />
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Type your message here..."
                  className="flex-1 px-4 py-2 md:py-3 rounded-full bg-[#F3F4F6] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-base"
                  value={newMessage}
                  onChange={handleTyping}
                />
                {/* Send Button */}
                <button
                  type="submit"
                  aria-label="Send message"
                  className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#181818] text-white border border-gray-300 hover:bg-[#00C6A7] focus:outline-none focus:ring-2 focus:ring-blue-500 ml-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!newMessage.trim()}
                >
                  <FiSend size={28} className="text-white md:text-3xl" />
                </button>
              </form>
              {sendMessageError && (
                <div className="text-center text-red-500 mt-2">{sendMessageError}</div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a conversation or search for a user to start chatting.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Chat; 