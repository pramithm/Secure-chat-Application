import React from 'react';
import { Shield, ToggleLeft, ToggleRight, LogOut, LayoutDashboard, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, demoMode, updateDemoMode, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-xs z-30">
      {/* Brand Title */}
      <Link to="/" className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            CipherVault <span className="text-[10px] px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-semibold border border-brand-200">E2EE</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-medium">Academic End-to-End Encryption Platform</p>
        </div>
      </Link>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Demo Mode Academic Toggle */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slatebg-100 border border-slate-200 text-xs">
          <span className="font-semibold text-slate-700">Demo Mode:</span>
          <button
            onClick={() => updateDemoMode(!demoMode)}
            className="flex items-center gap-1 text-brand-600 focus:outline-none"
            title="Toggle View Encryption buttons on all messages for academic demonstration"
          >
            {demoMode ? (
              <ToggleRight className="w-6 h-6 text-brand-600" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-slate-400" />
            )}
          </button>
        </div>

        {/* Admin Dashboard Link */}
        <Link
          to="/admin"
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <LayoutDashboard className="w-4 h-4" /> Admin Stats
        </Link>

        {/* User Info & Logout */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full border border-slate-200" />
            <div className="hidden md:block">
              <p className="text-xs font-bold text-slate-900">{user.name}</p>
              <p className="text-[10px] text-slate-500">@{user.username}</p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
