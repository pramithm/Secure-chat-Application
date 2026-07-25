import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';
import { generateRSAKeyPair } from '../services/webCrypto';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
  privateKeyJwk: string | null;
  login: (token: string, user: User) => Promise<void>;
  register: (name: string, username: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  updateDemoMode: (enabled: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('ciphervault_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [demoMode, setDemoModeState] = useState<boolean>(
    localStorage.getItem('ciphervault_demo_mode') === 'true'
  );
  const [privateKeyJwk, setPrivateKeyJwk] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        const currentUser: User = res.data.user;
        setUser(currentUser);

        // Load cached RSA private key from localStorage
        const storedPrivateKey = localStorage.getItem(`ciphervault_pk_${currentUser.username}`);
        if (storedPrivateKey) {
          setPrivateKeyJwk(storedPrivateKey);
        } else if (currentUser.privateKeyEncrypted) {
          setPrivateKeyJwk(currentUser.privateKeyEncrypted);
        }
      } catch (err) {
        console.error('Auth verification failed:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [token]);

  const login = async (newToken: string, loggedInUser: User) => {
    localStorage.setItem('ciphervault_token', newToken);
    setToken(newToken);
    setUser(loggedInUser);

    // Retrieve or generate private key
    let storedPrivateKey = localStorage.getItem(`ciphervault_pk_${loggedInUser.username}`);
    if (!storedPrivateKey && loggedInUser.publicKey) {
      // If user had keypair but local private key lost, generate fresh keypair and sync public key
      const keypair = await generateRSAKeyPair();
      storedPrivateKey = keypair.privateKeyJwk;
      localStorage.setItem(`ciphervault_pk_${loggedInUser.username}`, storedPrivateKey);
      await api.put('/auth/keys', {
        publicKey: keypair.publicKeyJwk,
        privateKeyEncrypted: storedPrivateKey
      });
      loggedInUser.publicKey = keypair.publicKeyJwk;
    }
    setPrivateKeyJwk(storedPrivateKey);
  };

  const register = async (name: string, username: string, email: string, pass: string) => {
    // 1. Generate RSA 2048-bit Key pair for user
    const { publicKeyJwk, privateKeyJwk } = await generateRSAKeyPair();

    // 2. Call backend register API
    const res = await api.post('/auth/register', {
      name,
      username,
      email,
      password: pass,
      publicKey: publicKeyJwk,
      privateKeyEncrypted: privateKeyJwk
    });

    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem(`ciphervault_pk_${newUser.username}`, privateKeyJwk);
    localStorage.setItem('ciphervault_token', newToken);

    setToken(newToken);
    setUser(newUser);
    setPrivateKeyJwk(privateKeyJwk);
  };

  const logout = async () => {
    try {
      if (token) await api.post('/auth/logout');
    } catch (e) {
      // Ignore
    }
    localStorage.removeItem('ciphervault_token');
    setToken(null);
    setUser(null);
    setPrivateKeyJwk(null);
  };

  const updateDemoMode = (enabled: boolean) => {
    localStorage.setItem('ciphervault_demo_mode', String(enabled));
    setDemoModeState(enabled);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        demoMode,
        setDemoMode: setDemoModeState,
        privateKeyJwk,
        login,
        register,
        logout,
        updateDemoMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
