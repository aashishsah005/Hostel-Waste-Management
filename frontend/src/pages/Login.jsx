import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleHome = {
  admin: '/admin',
  mess_manager: '/mess',
  student: '/student',
  visitor: '/student',
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(roleHome[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 py-20">
      <h1 className="font-display text-3xl text-ink mb-2">Welcome back</h1>
      <p className="text-ink/60 mb-8">Log in to book meals or manage the mess.</p>

      <form onSubmit={handleSubmit} className="bg-cardcream rounded-card border border-ink/10 p-6 shadow-soft space-y-4">
        {error && <div className="text-sm text-clay bg-clay/10 border border-clay/20 rounded-lg px-3 py-2">{error}</div>}
        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none"
            placeholder="you@hostel.edu"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Password</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-full bg-forest text-paper font-semibold hover:bg-forest-dark transition-colors disabled:opacity-60"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <div className="mt-6 text-sm text-ink/60 bg-turmeric/10 border border-turmeric/20 rounded-lg p-4">
        <p className="font-semibold text-ink mb-1">Demo credentials (after running the seed script)</p>
        <p>Admin — admin@hostel.edu / admin123</p>
        <p>Mess Manager — manager@hostel.edu / manager123</p>
        <p>Student — student1@hostel.edu / student123</p>
      </div>

      <p className="mt-6 text-sm text-ink/60">
        New student or visitor?{' '}
        <Link to="/register" className="text-forest font-semibold hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
};

export default Login;
