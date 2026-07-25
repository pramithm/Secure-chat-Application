import React, { useState } from 'react';
import { Search, UserPlus, Check, Clock, UserCheck } from 'lucide-react';
import api from '../services/api';
import { User } from '../types';

export const UserSearch: React.FC<{ onFriendRequestSent?: () => void }> = ({ onFriendRequestSent }) => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/users/search?q=${encodeURIComponent(val)}`);
      setResults(res.data.users);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (userId: string) => {
    setActionId(userId);
    try {
      await api.post('/friends/request', { receiverId: userId });
      setResults(prev =>
        prev.map(u => (u.id === userId || u._id === userId ? { ...u, friendStatus: 'pending_sent' } : u))
      );
      if (onFriendRequestSent) onFriendRequestSent();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to send request');
    } finally {
      setActionId(null);
    }
  };

  const acceptRequest = async (userId: string) => {
    setActionId(userId);
    try {
      // Find friend request id first or get pending requests
      const reqRes = await api.get('/friends/requests');
      const incomingReq = reqRes.data.received.find(
        (r: any) => r.sender._id === userId || r.sender.id === userId
      );

      if (incomingReq) {
        await api.post('/friends/respond', { requestId: incomingReq._id, action: 'accept' });
        setResults(prev =>
          prev.map(u => (u.id === userId || u._id === userId ? { ...u, friendStatus: 'friends' } : u))
        );
        if (onFriendRequestSent) onFriendRequestSent();
      } else {
        alert('Friend request not found');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to accept request');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by unique username..."
          className="w-full pl-9 pr-4 py-2 text-xs bg-slatebg-100 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900 placeholder:text-slate-400"
        />
      </div>

      {/* Search Results */}
      {loading && <p className="text-xs text-slate-400 text-center py-2">Searching directory...</p>}

      {results.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {results.map(user => {
            const uId = user.id || user._id || '';
            return (
              <div
                key={uId}
                className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full border border-slate-200" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{user.name}</p>
                    <p className="text-[11px] text-slate-500">@{user.username}</p>
                  </div>
                </div>

                {user.friendStatus === 'friends' && (
                  <span className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> Friends
                  </span>
                )}

                {user.friendStatus === 'pending_sent' && (
                  <span className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Requested
                  </span>
                )}

                {user.friendStatus === 'pending_received' && (
                  <button
                    disabled={actionId === uId}
                    onClick={() => acceptRequest(uId)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Accept Request
                  </button>
                )}

                {(!user.friendStatus || user.friendStatus === 'none') && (
                  <button
                    disabled={actionId === uId}
                    onClick={() => sendRequest(uId)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white shadow-xs transition-colors flex items-center gap-1"
                  >
                    <UserPlus className="w-3 h-3" /> Add
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
