import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export const LoginPage: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      setError('Please fill in all credentials.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { usernameOrEmail, password });
      const { token, user } = res.data;
      await login(token, user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials or server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slatebg-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-card-light border border-slate-200/90 space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white mx-auto shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign In to CipherVault</h2>
          <p className="text-xs text-slate-500">Access your End-to-End Encrypted Messages</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Username or Email
            </label>
            <input
              type="text"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="e.g. alice or alice@crypto.org"
              required
              className="w-full px-4 py-2.5 text-sm bg-slatebg-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-4 py-2.5 text-sm bg-slatebg-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:underline">
            Register new account
          </Link>
        </div>
      </div>
    </div>
  );
};
