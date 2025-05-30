import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE } from '../config';
import { FiSearch, FiSend } from 'react-icons/fi';
import io from 'socket.io-client';
import { format, isSameDay, parseISO } from 'date-fns';

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
}

const ENDPOINT = API_BASE;
var socket: any;

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

  useEffect(() => {
    if (user) {
      socket = io(ENDPOINT, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      socket.on('connect', () => {
        console.log('Socket connected');
        setSocketConnected(true);
        socket.emit('setup', user);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setSocketConnected(false);
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setSocketConnected(false);
      });

      socket.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
        setSocketConnected(true);
      socket.emit('setup', user);
      });

      socket.on('message received', (newMessageReceived: Message) => {
        if (selectedConversation && selectedConversation._id === newMessageReceived.conversation) {
          setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
        } else {
          fetchConversations();
        }
         setConversations(prevConversations => {
          const updatedConversations = prevConversations.map(conv =>
            conv._id === newMessageReceived.conversation ? { ...conv, latestMessage: newMessageReceived, updatedAt: newMessageReceived.createdAt } : conv
          );
           updatedConversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          if (!updatedConversations.find(conv => conv._id === newMessageReceived.conversation)) {
            fetchConversations();
            return prevConversations;
          }
          return updatedConversations;
        });
      });

      socket.on('typing', () => setIsTyping(true));
      socket.on('stop typing', () => setIsTyping(false));

      socket.on('online users', (users: string[]) => {
        console.log('Online users received:', users);
        setOnlineUsers(users);
      });

      socket.on('user online', (userId: string) => {
        console.log('User online:', userId);
        setOnlineUsers(prevUsers => [...prevUsers, userId]);
      });

      socket.on('user offline', (userId: string) => {
        console.log('User offline:', userId);
        setOnlineUsers(prevUsers => prevUsers.filter(id => id !== userId));
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
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
       data.sort((a: Conversation, b: Conversation) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversationsError('Failed to load conversations.');
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [token]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation || !token) {
        setMessages([]);
        setMessagesError(null);
        return;
      }
      setMessagesError(null);
      try {
        socket.emit('join chat', selectedConversation._id);

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

        if (user?._id) {
        setConversations(prevConversations => prevConversations.map(conv =>
            conv._id === selectedConversation._id ? { ...conv, readBy: [...(conv.readBy || []), user._id].filter((id, index, self) => self.indexOf(id) === index) } : conv
        ));
        }

      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
        setMessagesError('Failed to load messages.');
      }
    };

    fetchMessages();
  }, [selectedConversation, token, socketConnected]);

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
      setSelectedConversation(conversation);
      setSearchResults([]);
      setSearchText('');

      if (user?._id) {
      setConversations(prevConversations => prevConversations.map(conv =>
            conv._id === conversation._id ? { ...conv, readBy: [...(conv.readBy || []), user._id].filter((id, index, self) => self.indexOf(id) === index) } : conv
      ));
      }

      fetchConversations();

    } catch (error) {
      console.error('Error creating/fetching conversation:', error);
      setConversationCreateError('Failed to start conversation.');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !token || !socketConnected) return;

    const messageContent = newMessage;
    setNewMessage('');
    setSendMessageError(null);

    if (socketConnected && selectedConversation) {
      socket.emit('stop typing', selectedConversation._id);
      setTyping(false);
    }

      const tempMessage: Message = {
        _id: Date.now().toString(),
        sender: user!,
        text: messageContent,
        createdAt: new Date().toISOString(),
        conversation: selectedConversation._id,
      status: 'sending'
      };
      setMessages([...messages, tempMessage]);

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
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg._id === tempMessage._id ? { ...sentMessage, status: 'sent' } : msg))
      );

      socket.emit('new message', sentMessage);

      setConversations(prevConversations => {
        const updatedConversations = prevConversations.map(conv =>
          conv._id === selectedConversation._id ? { ...conv, latestMessage: sentMessage, updatedAt: sentMessage.createdAt } : conv
        );
         updatedConversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        return updatedConversations;
      });

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prevMessages) => prevMessages.filter(msg => msg._id !== tempMessage._id));
      setNewMessage(messageContent);
      setSendMessageError('Failed to send message.');
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (!socketConnected || !selectedConversation) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing', selectedConversation._id);
    }

    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;

    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        socket.emit('stop typing', selectedConversation._id);
        setTyping(false);
      }
    }, timerLength);

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

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />
      <main className="flex-1 container mx-auto px-12 py-8 pt-[100px] grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-md flex flex-col max-h-[calc(100vh-144px)] border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-black">Find Users</h2>
          <div className="relative mb-6">
            <FiSearch className="absolute top-3 left-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white bg-[#181818]"
              value={searchText}
              onChange={handleSearch}
            />
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((result) => (
                  <div
                    key={result._id}
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center text-gray-900 rounded-md"
                    onClick={() => handleUserSelect(result._id)}
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
            {searchError && <div className="text-red-500 text-sm mt-2">{searchError}</div>}
          </div>

          <h2 className="text-xl font-bold mb-4 text-black">Conversations</h2>
          <div className="flex-1 overflow-y-auto space-y-4">
            {conversations.length === 0 && !conversationsError ? (
               <div className="text-center text-gray-500">Loading conversations...</div>
            ) : conversationsError ? (
               <div className="text-center text-red-500">{conversationsError}</div>
            ) : (conversations.map((conversation) => {
              const otherParticipant = conversation.participants.find(p => p._id !== user?._id);
              return (
                <div
                  key={conversation._id}
                  className={`flex items-center p-4 border-b cursor-pointer ${
                    selectedConversation?._id === conversation._id ? 'bg-blue-100' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="relative mr-3">
                    {renderParticipantAvatar(otherParticipant, 'small')}
                    {otherParticipant && onlineUsers.includes(otherParticipant._id) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{getParticipantName(conversation.participants.filter(p => p._id !== user?._id))}</div>
                    <div className={`text-sm ${conversation.latestMessage && user?._id && !conversation.readBy?.includes(user._id) ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                      {conversation.latestMessage ? `${conversation.latestMessage.sender._id === user?._id ? 'You: ' : ''}${conversation.latestMessage.text.substring(0, 30)}${conversation.latestMessage.text.length > 30 ? '...' : ''}` : 'Start a conversation'}
                    </div>
                  </div>
                  {conversation.latestMessage && user?._id && !conversation.readBy?.includes(user._id) && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                  )}
                </div>
              );
            }))}
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md flex flex-col max-h-[calc(100vh-144px)] border border-gray-200">
          {selectedConversation ? (
            <>
              <div className="flex items-center mb-4">
                 <h2 className="text-xl font-bold text-black mr-2">Chat with {getParticipantName(selectedConversation.participants)}</h2>
                {selectedConversation.participants.find(p => p._id !== user?._id) && onlineUsers.includes(selectedConversation.participants.find(p => p._id !== user?._id)?._id || '') && (
                  <span className="text-sm text-green-600 font-semibold">(Online)</span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                 {groupMessagesByDate(messages).map(([date, messagesForDate]) => (
                   <div key={date}>
                      <div className="text-center text-sm text-gray-500 mb-4">{renderDateHeader(date)}</div>
                     {messagesForDate.map((message) => (
                       <div
                         key={message._id}
                         className={`flex ${message.sender._id === user?._id ? 'justify-end' : 'justify-start'} mb-2`}
                       >
                          <div className={`max-w-[70%] px-4 py-2 rounded-xl ${message.sender._id === user?._id ? 'bg-blue-500 text-white rounded-br-none mr-2' : 'bg-gray-200 text-black rounded-bl-none ml-2'}`}>
                           <p className="pb-1">{message.text}</p>
                           <div className="flex items-center justify-end space-x-1 mt-1 text-xs opacity-75">
                             <span>{format(new Date(message.createdAt), 'h:mm a')}</span>
                             {message.sender._id === user?._id && message.status && (
                               <span>
                                 {message.status === 'sending' && 'Sending...'}
                                 {message.status === 'sent' && '✓'}
                                 {message.status === 'delivered' && '✓✓'}
                                 {message.status === 'read' && '✓✓'}
                               </span>
                             )}
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 ))}
                 {isTyping && (
                   <div className="flex items-center space-x-2">
                     
                     <div className="text-sm text-gray-500">{getParticipantName(selectedConversation.participants)} is typing...</div>
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
              <form onSubmit={handleSendMessage} className="flex gap-4 mt-auto">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white bg-[#181818] text-base"
                  value={newMessage}
                  onChange={handleTyping}
                />
                <button
                  type="submit"
                  className="w-10 h-10 rounded-full font-semibold text-white bg-[#181818] hover:bg-[#00C6A7] transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!newMessage.trim()}
                >
                  <FiSend size={20} />
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