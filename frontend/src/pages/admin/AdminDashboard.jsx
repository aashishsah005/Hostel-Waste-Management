import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import StatCard from '../../components/StatCard';
import PlateGauge from '../../components/PlateGauge';

const todayISO = () => new Date().toISOString().slice(0, 10);
const COLORS = ['#2F4B3C', '#DFA13B', '#A64B34', '#7C9473', '#3E6350', '#B87F24'];

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'users', label: 'Manage users' },
];

const AdminDashboard = () => {
  const [tab, setTab] = useState('overview');
  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="mb-8">
        <span className="text-xs uppercase tracking-[0.2em] text-turmeric-dark font-semibold">Admin</span>
        <h1 className="font-display text-3xl text-ink mt-2">Hostel mess, at a glance</h1>
      </div>

      <div className="flex gap-2 mb-8">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              tab === t.id ? 'bg-forest text-paper' : 'bg-cardcream text-ink/70 border border-ink/10 hover:border-forest/40'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <Overview />}
      {tab === 'users' && <ManageUsers />}
    </div>
  );
};

const Overview = () => {
  const [waste, setWaste] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const to = todayISO();
    const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    Promise.all([
      api.get('/analytics/waste', { params: { from, to } }),
      api.get('/analytics/feedback'),
    ]).then(([w, f]) => {
      setWaste(w.data);
      setFeedback(f.data);
    });
  }, []);

  if (!waste || !feedback) return <Loader label="Pulling the last 30 days together..." />;

  const savedPercent = waste.totalPrepared ? Math.round((waste.totalConsumed / waste.totalPrepared) * 100) : 0;
  const pieData = Object.entries(waste.reasonBreakdown)
    .filter(([, v]) => v > 0)
    .map(([reason, kg]) => ({ name: reason.replace('_', ' '), value: Math.round(kg * 100) / 100 }));

  return (
    <div>
      <div className="grid md:grid-cols-3 gap-5 mb-8">
        <div className="bg-cardcream rounded-card border border-ink/10 p-6 flex flex-col items-center justify-center">
          <PlateGauge savedPercent={savedPercent} label="Meals fulfilled vs. prepared (30d)" />
        </div>
        <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
          <StatCard label="Total waste (30d)" value={`${waste.totalWasteKg} kg`} accent="clay" />
          <StatCard label="Estimated cost lost" value={`₹${waste.estimatedCostLost}`} accent="turmeric" />
          <StatCard label="Estimated CO₂e" value={`${waste.estimatedCarbonKg} kg`} accent="sage" />
          <StatCard label="Avg. student rating" value={`${feedback.avgTaste} / 5`} sublabel="taste, last 200 responses" accent="forest" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-cardcream rounded-card border border-ink/10 p-5">
          <h3 className="font-display text-lg mb-4">Waste by root cause (kg)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {pieData.map((entry, i) => <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-cardcream rounded-card border border-ink/10 p-5">
          <h3 className="font-display text-lg mb-4">Feedback keyword summary</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {feedback.topKeywords.map((k) => (
              <span key={k.word} className="px-3 py-1.5 rounded-full bg-turmeric/15 text-turmeric-dark text-sm font-medium">
                {k.word} <span className="text-ink/40 font-mono">×{k.count}</span>
              </span>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="font-display text-xl text-forest">{feedback.avgTaste}</div>
              <div className="text-xs text-ink/50">Taste</div>
            </div>
            <div>
              <div className="font-display text-xl text-forest">{feedback.avgCleanliness}</div>
              <div className="text-xs text-ink/50">Cleanliness</div>
            </div>
            <div>
              <div className="font-display text-xl text-forest">{feedback.avgService}</div>
              <div className="text-xs text-ink/50">Service</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'mess_manager', phone: '' });
  const [status, setStatus] = useState('');

  const load = () => api.get('/users').then((res) => setUsers(res.data));
  useEffect(() => { load(); }, []);

  const createStaff = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/staff', form);
      setStatus('success');
      setForm({ name: '', email: '', password: '', role: 'mess_manager', phone: '' });
      load();
    } catch (err) {
      setStatus(err.response?.data?.message || 'Could not create staff account.');
    }
  };

  const toggleStatus = async (u) => {
    await api.patch(`/users/${u._id}/status`, { isActive: !u.isActive });
    load();
  };

  const removeUser = async (id) => {
    if (!confirm('Remove this user permanently?')) return;
    await api.delete(`/users/${id}`);
    load();
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <form onSubmit={createStaff} className="bg-cardcream rounded-card border border-ink/10 p-6 space-y-4 h-fit">
        <h3 className="font-display text-xl">Add staff account</h3>
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none" />
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none" />
        <input required type="password" minLength={6} placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none" />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none">
          <option value="mess_manager">Mess Manager</option>
          <option value="admin">Admin</option>
        </select>
        <button className="w-full py-2.5 rounded-full bg-forest text-paper font-semibold hover:bg-forest-dark transition-colors">Create account</button>
        {status === 'success' && <p className="text-sm text-forest">Account created.</p>}
        {status && status !== 'success' && <p className="text-sm text-clay">{status}</p>}
      </form>

      <div className="md:col-span-2 space-y-2 max-h-[520px] overflow-y-auto scrollbar-thin">
        {users.map((u) => (
          <div key={u._id} className="bg-cardcream rounded-lg border border-ink/10 p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold text-ink">{u.name} <span className="text-xs font-mono text-sage">· {u.role}</span></div>
              <div className="text-xs text-ink/50">{u.email}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${u.isActive ? 'bg-forest/10 text-forest' : 'bg-clay/10 text-clay'}`}>
                {u.isActive ? 'Active' : 'Disabled'}
              </span>
              <button onClick={() => toggleStatus(u)} className="text-xs text-forest hover:underline">
                {u.isActive ? 'Disable' : 'Enable'}
              </button>
              <button onClick={() => removeUser(u._id)} className="text-xs text-clay hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
