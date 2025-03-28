import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/gallery');
    } catch (err) {
      setError('Failed to create an account');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="card w-full max-w-md p-8 space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-primary-900">Create your account</h2>
          <p className="mt-2 text-sm text-primary-600">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-accent-600 hover:text-accent-500">
              Sign in
            </a>
          </p>
        </div>

        {error && (
          <div className="bg-error-50 text-error-700 p-4 rounded-lg text-sm" role="alert">
            {error}
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
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-accent w-full"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;