import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { UserSearch } from '../components/UserSearch';
import { FriendRequests } from '../components/FriendRequests';
import { ChatWindow } from '../components/ChatWindow';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Chat, User } from '../types';
import { MessageSquare, Users, UserPlus, Shield, Lock, Search } from 'lucide-react';

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [activeTab, setActiveTab] = useState<'chats' | 'friends' | 'search'>('chats');
  const [friendsList, setFriendsList] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchChats = async () => {
    try {
      const res = await api.get('/chats');
      setChats(res.data.chats);
      if (res.data.chats.length > 0 && !activeChat) {
        setActiveChat(res.data.chats[0]);
      }
    } catch (err) {
      console.error('Failed to fetch chats:', err);
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await api.get('/friends/list');
      setFriendsList(res.data.friends);
    } catch (err) {
      console.error('Failed to fetch friends list:', err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchChats(), fetchFriends()]);
      setLoading(false);
    };
    initData();
  }, []);

  const openOrCreateChat = async (targetUserId: string) => {
    try {
      const res = await api.post('/chats', { targetUserId });
      const newChat = res.data.chat;
      await fetchChats();
      setActiveChat(newChat);
      setActiveTab('chats');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to start chat.');
    }
  };

  if (!user) return null;

  return (
    <div className="h-screen flex flex-col bg-slatebg-50 overflow-hidden">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-80 sm:w-96 bg-white border-r border-slate-200 flex flex-col z-20 shadow-xs">
          {/* Navigation Tabs */}
          <div className="p-3 border-b border-slate-100 flex items-center gap-1 bg-slatebg-50">
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'chats'
                  ? 'bg-white text-brand-600 shadow-xs border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Chats ({chats.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('friends');
                fetchFriends();
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'friends'
                  ? 'bg-white text-brand-600 shadow-xs border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Requests
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'search'
                  ? 'bg-white text-brand-600 shadow-xs border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" /> Discovery
            </button>
          </div>

          {/* Sidebar Tab Content */}
          <div className="flex-1 overflow-y-auto p-3">
            {activeTab === 'chats' && (
              <div className="space-y-1.5">
                {chats.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                    <p>No active chat conversations yet.</p>
                    <button
                      onClick={() => setActiveTab('search')}
                      className="px-3 py-1.5 bg-brand-50 text-brand-700 font-bold rounded-xl border border-brand-200"
                    >
                      Find Friends to Chat
                    </button>
                  </div>
                ) : (
                  chats.map(chat => {
                    const recipient = chat.participants.find(p => (p.id || p._id) !== user.id && (p.id || p._id) !== user._id);
                    const isActive = activeChat?._id === chat._id;
                    return (
                      <div
                        key={chat._id}
                        onClick={() => setActiveChat(chat)}
                        className={`p-3 rounded-xl cursor-pointer transition-all border flex items-center justify-between ${
                          isActive
                            ? 'bg-brand-50/70 border-brand-200 shadow-2xs'
                            : 'bg-white border-transparent hover:bg-slatebg-50 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={recipient?.avatar}
                              alt={recipient?.username}
                              className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                            />
                            <span
                              className={`w-3 h-3 rounded-full absolute bottom-0 right-0 border-2 border-white ${
                                recipient?.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                              }`}
                            />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{recipient?.name}</p>
                            <p className="text-[11px] text-slate-500">@{recipient?.username}</p>
                          </div>
                        </div>
                        <Lock className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                    );
                  })
                )}

                {/* Confirmed Friends Quick Launch List */}
                {friendsList.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Confirmed Friends ({friendsList.length})
                    </h4>
                    <div className="space-y-1">
                      {friendsList.map(f => (
                        <div
                          key={f.id || f._id}
                          onClick={() => openOrCreateChat(f.id || f._id || '')}
                          className="p-2 rounded-lg hover:bg-slate-100 cursor-pointer flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <img src={f.avatar} alt={f.username} className="w-6 h-6 rounded-full" />
                            <span className="font-medium text-slate-800">{f.name}</span>
                          </div>
                          <span className="text-[10px] text-brand-600 font-bold">Start Chat</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'friends' && (
              <FriendRequests onRefreshChats={fetchChats} />
            )}

            {activeTab === 'search' && (
              <UserSearch onFriendRequestSent={fetchFriends} />
            )}
          </div>
        </div>

        {/* Right Chat Main Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slatebg-50">
          {activeChat ? (
            <ChatWindow chat={activeChat} currentUserId={user.id || user._id || ''} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shadow-sm">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Select or Start an Encrypted Conversation</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Connect with verified friends to exchange AES-256-GCM encrypted text messages, images, voice notes, and document files.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
