import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, GraduationCap, ChefHat, ShieldCheck } from 'lucide-react';

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
      setError(err.response?.data?.message || 'Server connection failed. Please ensure the backend server (port 5000) is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 py-12">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:underline mb-6">
        <span>←</span> Back to Home
      </Link>
      <h1 className="font-display text-3xl font-bold text-ink mb-2">Welcome back</h1>
      <p className="text-ink/60 text-sm mb-8">Log in to book meals or manage the mess.</p>

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

      <div className="mt-6 text-xs text-ink/70 bg-turmeric/10 border border-turmeric/30 rounded-xl p-4 space-y-2">
        <p className="font-bold text-ink text-sm mb-1 flex items-center gap-1.5">
          <KeyRound className="w-4 h-4 text-turmeric-dark shrink-0" /> Demo Accounts Quick Login
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setForm({ email: 'abc@gmail.com', password: '123' })}
            className="px-3 py-2 rounded-lg bg-paper border border-ink/15 hover:border-forest text-left transition-colors cursor-pointer"
          >
            <div className="font-bold text-forest flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 shrink-0" /> Student
            </div>
            <div className="text-[10px] text-ink/50 font-mono">abc@gmail.com</div>
            <div className="text-[10px] text-ink/40 font-mono">Pass: 123</div>
          </button>
          <button
            type="button"
            onClick={() => setForm({ email: 'manager@hostel.edu', password: '123' })}
            className="px-3 py-2 rounded-lg bg-paper border border-ink/15 hover:border-forest text-left transition-colors cursor-pointer"
          >
            <div className="font-bold text-turmeric-dark flex items-center gap-1.5">
              <ChefHat className="w-4 h-4 shrink-0" /> Mess Manager
            </div>
            <div className="text-[10px] text-ink/50 font-mono">manager@hostel.edu</div>
            <div className="text-[10px] text-ink/40 font-mono">Pass: 123 / manager123</div>
          </button>
          <button
            type="button"
            onClick={() => setForm({ email: 'admin@hostel.edu', password: 'admin123' })}
            className="px-3 py-2 rounded-lg bg-paper border border-ink/15 hover:border-forest text-left transition-colors cursor-pointer"
          >
            <div className="font-bold text-clay flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 shrink-0" /> Admin
            </div>
            <div className="text-[10px] text-ink/50 font-mono">admin@hostel.edu</div>
            <div className="text-[10px] text-ink/40 font-mono">Pass: admin123</div>
          </button>
        </div>
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
