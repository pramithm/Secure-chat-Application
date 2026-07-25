import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import api from '../services/api';
import { AdminMetrics } from '../types';
import { Users, MessageSquare, ShieldCheck, FileText, Activity, Clock, ShieldAlert } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAdminMetrics = async () => {
      try {
        const res = await api.get('/admin/metrics');
        setMetrics(res.data.metrics);
      } catch (err) {
        console.error('Failed to fetch admin metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminMetrics();
  }, []);

  return (
    <div className="min-h-screen bg-slatebg-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
        {/* Banner */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card-light flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Admin Operations</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                Zero-Knowledge Privacy
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live server performance & structural payload metrics. System administrators cannot inspect user plaintext contents.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" /> Server Active • Node.js Express & Socket.IO
          </div>
        </div>

        {/* Metrics Grid */}
        {loading ? (
          <p className="text-xs text-slate-400 text-center py-8">Fetching operational metrics...</p>
        ) : metrics ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Users */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card-light space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Users</span>
                <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{metrics.totalUsers}</p>
              <p className="text-[11px] text-slate-500">{metrics.onlineUsers} users currently online</p>
            </div>

            {/* Total Encrypted Messages */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card-light space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">E2EE Messages</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{metrics.totalMessages}</p>
              <p className="text-[11px] text-emerald-600 font-medium">100% Ciphertexts Only</p>
            </div>

            {/* Total Friend Requests */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card-light space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Friend Connections</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{metrics.totalFriendRequests}</p>
              <p className="text-[11px] text-slate-500">Connection Requests Dispatched</p>
            </div>

            {/* Total Encrypted Files */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card-light space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Files Shared</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{metrics.totalFilesShared}</p>
              <p className="text-[11px] text-slate-500">Images, Voice Notes, PDFs, DOCX</p>
            </div>
          </div>
        ) : null}

        {/* Cryptographic Compliance Policy Box */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-card-light space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-brand-600" /> Security Compliance Verification
          </h3>
          <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
            <li>Database stores exclusively <code className="bg-slate-100 px-1 py-0.5 rounded text-brand-700">ciphertext</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-brand-700">iv</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-brand-700">encryptedAesKey</code>, and <code className="bg-slate-100 px-1 py-0.5 rounded text-brand-700">hash</code>.</li>
            <li>No database administrator has mathematical capability to reconstruct plaintexts.</li>
            <li>Private RSA keys remain exclusively on client browser memory or local storage.</li>
          </ul>
        </div>
      </main>
    </div>
  );
};
