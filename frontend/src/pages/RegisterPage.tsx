import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Key, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await register(name, username, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slatebg-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-card-light border border-slate-200/90 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white mx-auto shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create CipherVault Account</h2>
          <p className="text-xs text-slate-500">Generates RSA 2048-bit E2EE Key Pair automatically</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alice Smith"
              required
              className="w-full px-4 py-2 text-sm bg-slatebg-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Unique Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. alicesmith"
              required
              className="w-full px-4 py-2 text-sm bg-slatebg-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alice@example.com"
              required
              className="w-full px-4 py-2 text-sm bg-slatebg-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900"
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
              className="w-full px-4 py-2 text-sm bg-slatebg-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900"
            />
          </div>

          <div className="p-3 rounded-xl bg-brand-50 border border-brand-100 flex items-center gap-2.5 text-xs text-brand-800">
            <Key className="w-4 h-4 text-brand-600 flex-shrink-0" />
            <span>WebCrypto will construct a client-side 2048-bit RSA-OAEP public/private keypair upon submit.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Generating RSA Key Pair...' : 'Create Account'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
