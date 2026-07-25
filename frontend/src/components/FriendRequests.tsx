import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Clock, Check, Shield } from 'lucide-react';
import api from '../services/api';
import { FriendRequest } from '../types';

interface FriendRequestsProps {
  onRefreshChats?: () => void;
}

export const FriendRequests: React.FC<FriendRequestsProps> = ({ onRefreshChats }) => {
  const [received, setReceived] = useState<FriendRequest[]>([]);
  const [sent, setSent] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/friends/requests');
      setReceived(res.data.received);
      setSent(res.data.sent);
    } catch (err) {
      console.error('Fetch requests error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const respond = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      await api.post('/friends/respond', { requestId, action });
      fetchRequests();
      if (onRefreshChats) onRefreshChats();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Action failed');
    }
  };

  const cancelRequest = async (requestId: string) => {
    try {
      await api.delete(`/friends/request/${requestId}`);
      fetchRequests();
    } catch (err: any) {
      alert('Failed to cancel request');
    }
  };

  if (loading) return <p className="text-xs text-slate-400 p-3">Loading friend requests...</p>;

  return (
    <div className="space-y-4">
      {/* Received Requests */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-brand-600" /> Pending Incoming ({received.length})
        </h4>
        {received.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No incoming friend requests.</p>
        ) : (
          <div className="space-y-2">
            {received.map(req => (
              <div
                key={req._id}
                className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <img src={req.sender.avatar} alt={req.sender.username} className="w-8 h-8 rounded-full border" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{req.sender.name}</p>
                    <p className="text-[11px] text-slate-500">@{req.sender.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => respond(req._id, 'accept')}
                    className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                    title="Accept Request"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => respond(req._id, 'reject')}
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                    title="Reject Request"
                  >
                    <UserX className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sent Requests */}
      {sent.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Sent Requests ({sent.length})
          </h4>
          <div className="space-y-2">
            {sent.map(req => (
              <div
                key={req._id}
                className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <img src={req.receiver.avatar} alt={req.receiver.username} className="w-8 h-8 rounded-full border" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{req.receiver.name}</p>
                    <p className="text-[11px] text-slate-500">@{req.receiver.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => cancelRequest(req._id)}
                  className="px-2 py-1 text-[11px] text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
