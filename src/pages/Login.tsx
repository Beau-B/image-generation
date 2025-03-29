import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/gallery');
    } catch (err: any) {
      if (err.message?.includes('email_not_confirmed')) {
        setError('Please check your email to confirm your account before logging in.');
      } else {
        setError('Failed to sign in');
        console.error('Login error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    try {
      setResending(true);
      setError('');
      setResendSuccess(false);

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;

      setResendSuccess(true);
    } catch (err) {
      console.error('Error resending confirmation:', err);
      setError('Failed to resend confirmation email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="card w-full max-w-md p-8 space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-primary-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-primary-600">
            Or{' '}
            <a href="/signup" className="font-medium text-accent-600 hover:text-accent-500">
              create a new account
            </a>
          </p>
        </div>

        {error && (
          <div className="bg-error-50 text-error-700 p-4 rounded-lg text-sm space-y-2" role="alert">
            <p>{error}</p>
            {error.includes('confirm') && !resendSuccess && (
              <button
                onClick={handleResendConfirmation}
                disabled={resending}
                className="text-accent-600 hover:text-accent-500 font-medium"
              >
                {resending ? 'Sending...' : 'Resend confirmation email'}
              </button>
            )}
          </div>
        )}

        {resendSuccess && (
          <div className="bg-success-50 text-success-700 p-4 rounded-lg text-sm" role="alert">
            Confirmation email sent! Please check your inbox.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="label">
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-accent w-full"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;