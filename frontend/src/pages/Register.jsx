import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    hostelBlock: '',
    roomNumber: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/student');
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
      <h1 className="font-display text-3xl font-bold text-ink mb-2">Create your account</h1>
      <p className="text-ink/60 text-sm mb-8">Students and visitors can self-register. Staff accounts are created by the admin.</p>

      <form onSubmit={handleSubmit} className="bg-cardcream rounded-card border border-ink/10 p-6 shadow-soft space-y-4">
        {error && <div className="text-sm text-clay bg-clay/10 border border-clay/20 rounded-lg px-3 py-2">{error}</div>}

        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Full name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Email</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Password</label>
          <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">I am a</label>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none">
            <option value="student">Student</option>
            <option value="visitor">Visitor</option>
          </select>
        </div>
        {form.role === 'student' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Hostel block</label>
              <input value={form.hostelBlock} onChange={(e) => setForm({ ...form, hostelBlock: e.target.value })}
                className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none" placeholder="A" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Room no.</label>
              <input value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none" placeholder="101" />
            </div>
          </div>
        )}
        <button type="submit" disabled={loading}
          className="w-full py-2.5 rounded-full bg-forest text-paper font-semibold hover:bg-forest-dark transition-colors disabled:opacity-60">
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink/60">
        Already have an account?{' '}
        <Link to="/login" className="text-forest font-semibold hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default Register;
