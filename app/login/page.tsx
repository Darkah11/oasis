'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { setCredentials } from '@/store/slices/authSlice';
import { cn, goldGradient } from '@/lib/utils';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegister ? { name, email, password } : { email, password };
      
      const response = await axios.post(endpoint, payload);
      dispatch(setCredentials(response.data));
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-card border border-border shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gold-600 via-gold-400 to-gold-700 bg-clip-text text-transparent">
            Oasis
          </h1>
          <p className="text-muted-foreground">
            {isRegister ? 'Create your premium account' : 'Welcome back to luxury'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-sm font-medium">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="John Doe"
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-sm font-medium">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="nick@example.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full py-3 rounded-lg font-bold text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]",
              goldGradient,
              loading && "opacity-70 cursor-not-allowed"
            )}
          >
            {loading ? 'Processing...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm text-primary hover:underline transition-all"
          >
            {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
