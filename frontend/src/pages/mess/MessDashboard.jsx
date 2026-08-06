import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import StatCard from '../../components/StatCard';
import PlateGauge from '../../components/PlateGauge';

const MEALS = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
const todayISO = () => new Date().toISOString().slice(0, 10);

const tabs = [
  { id: 'predict', label: 'Today & prediction' },
  { id: 'entry', label: 'Log food entry' },
  { id: 'waste', label: 'Waste analytics' },
  { id: 'menu', label: 'Manage menu' },
  { id: 'feedback', label: 'Feedback summary' },
];

const MessDashboard = () => {
  const [tab, setTab] = useState('predict');
  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="mb-8">
        <span className="text-xs uppercase tracking-[0.2em] text-turmeric-dark font-semibold">Mess Manager</span>
        <h1 className="font-display text-3xl text-ink mt-2">Kitchen control room</h1>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-thin pb-1">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              tab === t.id ? 'bg-forest text-paper' : 'bg-cardcream text-ink/70 border border-ink/10 hover:border-forest/40'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'predict' && <PredictionPanel />}
      {tab === 'entry' && <FoodEntryForm />}
      {tab === 'waste' && <WasteAnalytics />}
      {tab === 'menu' && <ManageMenu />}
      {tab === 'feedback' && <FeedbackSummary />}
    </div>
  );
};

const PredictionPanel = () => {
  const [mealType, setMealType] = useState('Lunch');
  const [prediction, setPrediction] = useState(null);
  const [bookingCounts, setBookingCounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [predRes, countRes] = await Promise.all([
      api.get('/food-entries/predict', { params: { mealType } }),
      api.get('/bookings/counts', { params: { date: todayISO() } }),
    ]);
    setPrediction(predRes.data);
    setBookingCounts(countRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [mealType]);

  const bookedForMeal = bookingCounts.find((b) => b._id === mealType)?.count || 0;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="text-sm text-ink/60">Meal:</span>
        {MEALS.map((m) => (
          <button key={m} onClick={() => setMealType(m)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold ${mealType === m ? 'bg-turmeric text-ink' : 'bg-cardcream border border-ink/10 text-ink/60'}`}>
            {m}
          </button>
        ))}
      </div>

      {loading || !prediction ? <Loader label="Running the prediction model..." /> : (
        <div className="grid md:grid-cols-3 gap-5">
          <div className="bg-cardcream rounded-card border border-ink/10 p-6 flex flex-col items-center">
            <PlateGauge
              savedPercent={Math.min(100, Math.round((prediction.predictedConsumption / (prediction.recommendedPreparation || 1)) * 100))}
              label="Predicted fulfilment vs. prepared"
            />
          </div>
          <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
            <StatCard label="Students booked today" value={bookedForMeal} accent="turmeric" />
            <StatCard label="Predicted consumption" value={prediction.predictedConsumption} sublabel={prediction.method} accent="forest" />
            <StatCard label="Recommended preparation" value={prediction.recommendedPreparation ?? '—'} sublabel="incl. 5% buffer" accent="sage" />
            <StatCard label="Predicted waste (kg)" value={prediction.predictedWasteKg} accent="clay" />
          </div>
        </div>
      )}
      <p className="text-xs text-ink/40 mt-6 max-w-xl font-mono">
        Confidence: {prediction?.confidence || '—'} · based on {prediction?.sampleSize ?? 0} recent {mealType.toLowerCase()} entries.
        Model runs as a weighted moving average in Node — swap in a Python/Scikit-learn service later without changing this UI.
      </p>
    </div>
  );
};

const FoodEntryForm = () => {
  const [form, setForm] = useState({
    date: todayISO(), mealType: 'Lunch', mealsBooked: '', mealsPrepared: '', mealsConsumed: '', foodWastedKg: '', wasteReason: 'none', notes: '',
  });
  const [status, setStatus] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/food-entries', form);
      setStatus('success');
    } catch (err) {
      setStatus(err.response?.data?.message || 'Could not save this entry.');
    }
  };

  return (
    <form onSubmit={submit} className="bg-cardcream rounded-card border border-ink/10 p-6 max-w-2xl space-y-4">
      <h3 className="font-display text-xl">Log today's food entry</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Date</label>
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Meal</label>
          <select value={form.mealType} onChange={(e) => setForm({ ...form, mealType: e.target.value })}
            className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none">
            {MEALS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Meals booked</label>
          <input type="number" min="0" required value={form.mealsBooked} onChange={(e) => setForm({ ...form, mealsBooked: e.target.value })}
            className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Meals prepared</label>
          <input type="number" min="0" required value={form.mealsPrepared} onChange={(e) => setForm({ ...form, mealsPrepared: e.target.value })}
            className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Meals consumed</label>
          <input type="number" min="0" required value={form.mealsConsumed} onChange={(e) => setForm({ ...form, mealsConsumed: e.target.value })}
            className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Food wasted (kg)</label>
          <input type="number" step="0.1" min="0" required value={form.foodWastedKg} onChange={(e) => setForm({ ...form, foodWastedKg: e.target.value })}
            className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Root cause (if wasted)</label>
          <select value={form.wasteReason} onChange={(e) => setForm({ ...form, wasteReason: e.target.value })}
            className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none">
            <option value="none">None</option>
            <option value="exam_period">Exam period</option>
            <option value="holiday">Holiday</option>
            <option value="unpopular_menu">Unpopular menu item</option>
            <option value="weather">Weather</option>
            <option value="over_preparation">Over-preparation</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Notes</label>
          <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none" />
        </div>
      </div>
      <button className="w-full py-2.5 rounded-full bg-forest text-paper font-semibold hover:bg-forest-dark transition-colors">Save entry</button>
      {status === 'success' && <p className="text-sm text-forest">Entry saved.</p>}
      {status && status !== 'success' && <p className="text-sm text-clay">{status}</p>}
    </form>
  );
};

const WasteAnalytics = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const to = todayISO();
    const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    api.get('/analytics/waste', { params: { from, to } }).then((res) => setSummary(res.data));
  }, []);

  if (!summary) return <Loader label="Crunching 30 days of waste data..." />;

  const chartData = summary.trend.map((t) => ({
    date: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    kg: t.foodWastedKg,
  }));

  const reasonData = Object.entries(summary.reasonBreakdown).map(([reason, kg]) => ({
    reason: reason.replace('_', ' '),
    kg: Math.round(kg * 100) / 100,
  }));

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total waste (30d)" value={`${summary.totalWasteKg} kg`} accent="clay" />
        <StatCard label="Fulfilment rate" value={`${summary.fulfilmentRate}%`} accent="forest" sublabel="consumed / prepared" />
        <StatCard label="Estimated cost lost" value={`₹${summary.estimatedCostLost}`} accent="turmeric" />
        <StatCard label="Estimated CO₂e" value={`${summary.estimatedCarbonKg} kg`} accent="sage" />
      </div>

      <div className="bg-cardcream rounded-card border border-ink/10 p-5 mb-6">
        <h3 className="font-display text-lg mb-4">Waste trend, last 30 days</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#E4DFC8" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
            <YAxis tick={{ fontSize: 11 }} unit="kg" />
            <Tooltip />
            <Line type="monotone" dataKey="kg" stroke="#A64B34" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-cardcream rounded-card border border-ink/10 p-5">
        <h3 className="font-display text-lg mb-4">Waste by root cause</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={reasonData}>
            <CartesianGrid stroke="#E4DFC8" strokeDasharray="3 3" />
            <XAxis dataKey="reason" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} unit="kg" />
            <Tooltip />
            <Bar dataKey="kg" fill="#DFA13B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const ManageMenu = () => {
  const [form, setForm] = useState({ dayOfWeek: 'Monday', mealType: 'Lunch', items: '', price: 40 });
  const [menu, setMenu] = useState([]);
  const [status, setStatus] = useState('');

  const load = () => api.get('/menu').then((res) => setMenu(res.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/menu', { ...form, items: form.items.split(',').map((s) => s.trim()).filter(Boolean) });
      setStatus('success');
      load();
    } catch (err) {
      setStatus(err.response?.data?.message || 'Could not save menu item.');
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <form onSubmit={submit} className="bg-cardcream rounded-card border border-ink/10 p-6 space-y-4 h-fit">
        <h3 className="font-display text-xl">Set a menu slot</h3>
        <div className="grid grid-cols-2 gap-3">
          <select value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
            className="rounded-lg border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none">
            {days.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={form.mealType} onChange={(e) => setForm({ ...form, mealType: e.target.value })}
            className="rounded-lg border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none">
            {MEALS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <input value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })}
          placeholder="Dal, Rice, Roti (comma separated)"
          className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none" />
        <input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none" placeholder="Price" />
        <button className="w-full py-2.5 rounded-full bg-forest text-paper font-semibold hover:bg-forest-dark transition-colors">Save slot</button>
        {status === 'success' && <p className="text-sm text-forest">Saved.</p>}
      </form>

      <div className="space-y-2 max-h-[420px] overflow-y-auto scrollbar-thin">
        {menu.map((m) => (
          <div key={m._id} className="bg-cardcream rounded-lg border border-ink/10 p-3 flex justify-between items-center text-sm">
            <div>
              <span className="font-semibold">{m.dayOfWeek} · {m.mealType}</span>
              <span className="text-ink/60"> — {m.items.join(', ')}</span>
            </div>
            <span className="font-mono text-xs text-ink/50">₹{m.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const FeedbackSummary = () => {
  const [summary, setSummary] = useState(null);
  useEffect(() => { api.get('/analytics/feedback').then((res) => setSummary(res.data)); }, []);
  if (!summary) return <Loader label="Summarizing student feedback..." />;

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total feedback" value={summary.totalFeedback} accent="forest" />
        <StatCard label="Avg. taste" value={`${summary.avgTaste} / 5`} accent="turmeric" />
        <StatCard label="Avg. cleanliness" value={`${summary.avgCleanliness} / 5`} accent="sage" />
        <StatCard label="Avg. service" value={`${summary.avgService} / 5`} accent="clay" />
      </div>
      <div className="bg-cardcream rounded-card border border-ink/10 p-5 mb-6">
        <h3 className="font-display text-lg mb-3">Most mentioned words</h3>
        <div className="flex flex-wrap gap-2">
          {summary.topKeywords.map((k) => (
            <span key={k.word} className="px-3 py-1.5 rounded-full bg-turmeric/15 text-turmeric-dark text-sm font-medium">
              {k.word} <span className="text-ink/40 font-mono">×{k.count}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="bg-cardcream rounded-card border border-ink/10 p-5">
        <h3 className="font-display text-lg mb-3">Recent comments</h3>
        <div className="space-y-2">
          {summary.recent.map((f) => (
            <div key={f._id} className="text-sm border-b border-ink/5 pb-2">
              <span className="font-semibold">{f.user?.name || 'Student'}</span> on {f.mealType}: {f.comment || '—'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MessDashboard;
