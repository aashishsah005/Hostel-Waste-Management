import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';

const MEALS = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
const tabs = [
  { id: 'menu', label: 'Weekly menu' },
  { id: 'book', label: 'Book a meal' },
  { id: 'mybookings', label: 'My bookings' },
  { id: 'feedback', label: 'Give feedback' },
];

const todayISO = () => new Date().toISOString().slice(0, 10);

const StudentDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState(user?.role === 'visitor' ? 'book' : 'menu');

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <div className="mb-8">
        <span className="text-xs uppercase tracking-[0.2em] text-turmeric-dark font-semibold">
          {user?.role === 'visitor' ? 'Visitor' : 'Student'}
        </span>
        <h1 className="font-display text-3xl text-ink mt-2">Hi {user?.name?.split(' ')[0]}, what's for today?</h1>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-thin pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              tab === t.id ? 'bg-forest text-paper' : 'bg-cardcream text-ink/70 border border-ink/10 hover:border-forest/40'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'menu' && <WeeklyMenu />}
      {tab === 'book' && <BookMeal />}
      {tab === 'mybookings' && <MyBookings />}
      {tab === 'feedback' && <FeedbackForm />}
    </div>
  );
};

const WeeklyMenu = () => {
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/menu').then((res) => setMenu(res.data)).catch(() => setError('Could not load the menu.'));
  }, []);

  if (error) return <p className="text-clay">{error}</p>;
  if (!menu) return <Loader label="Loading this week's menu..." />;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="grid gap-4">
      {days.map((day) => {
        const items = menu.filter((m) => m.dayOfWeek === day);
        if (!items.length) return null;
        return (
          <div key={day} className="bg-cardcream rounded-card border border-ink/10 p-5">
            <h3 className="font-display text-lg text-forest mb-3">{day}</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
              {items.map((m) => (
                <div key={m._id} className="bg-paper rounded-lg p-3 border border-ink/5">
                  <div className="text-xs uppercase tracking-wide text-sage font-semibold mb-1">{m.mealType}</div>
                  <div className="text-sm text-ink">{m.items.join(', ')}</div>
                  <div className="text-xs text-ink/50 mt-1 font-mono">₹{m.price}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const BookMeal = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState(user?.role === 'visitor' ? 'visitor' : 'student');
  const [date, setDate] = useState(todayISO());
  const [mealType, setMealType] = useState('Lunch');
  const [status, setStatus] = useState('');

  const handleBook = async () => {
    setStatus('');
    try {
      await api.post('/bookings', { date, mealType });
      setStatus('success');
    } catch (err) {
      setStatus(err.response?.data?.message || 'Could not create booking.');
    }
  };

  if (user?.role === 'visitor' || mode === 'visitor') {
    return (
      <div>
        {user?.role !== 'visitor' && (
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setMode('student')}
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-cardcream text-ink/60 border border-ink/10 hover:border-forest/40"
            >
              ← Student Meal Booking
            </button>
            <span className="text-xs font-mono text-turmeric-dark font-semibold">Visitor Mode Active</span>
          </div>
        )}
        <VisitorEntry />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs font-mono text-ink/50 font-semibold">Booking Type:</span>
        <button
          onClick={() => setMode('student')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            mode === 'student' ? 'bg-forest text-paper' : 'bg-cardcream text-ink/70 border border-ink/10'
          }`}
        >
          Student Meal
        </button>
        <button
          onClick={() => setMode('visitor')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            mode === 'visitor' ? 'bg-turmeric text-ink' : 'bg-cardcream text-ink/70 border border-ink/10'
          }`}
        >
          Visitor / Guest QR Token
        </button>
      </div>

      <div className="bg-cardcream rounded-card border border-ink/10 p-6 max-w-md">
        <h3 className="font-display text-xl mb-4">Book a meal</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Meal</label>
            <select value={mealType} onChange={(e) => setMealType(e.target.value)}
              className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none">
              {MEALS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <button onClick={handleBook} className="w-full py-2.5 rounded-full bg-forest text-paper font-semibold hover:bg-forest-dark transition-colors">
            Confirm booking
          </button>
          {status === 'success' && <p className="text-sm text-forest">Booked. See you at the mess!</p>}
          {status && status !== 'success' && <p className="text-sm text-clay">{status}</p>}
        </div>
      </div>
    </div>
  );
};

const MyBookings = () => {
  const [bookings, setBookings] = useState(null);

  const load = () => api.get('/bookings/mine').then((res) => setBookings(res.data));
  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    await api.patch(`/bookings/${id}/cancel`);
    load();
  };

  if (!bookings) return <Loader label="Loading your bookings..." />;
  if (!bookings.length) return <p className="text-ink/60">You haven't booked any meals yet.</p>;

  return (
    <div className="grid gap-3">
      {bookings.map((b) => (
        <div key={b._id} className="bg-cardcream rounded-card border border-ink/10 p-4 flex items-center justify-between">
          <div>
            <div className="font-display text-lg">{b.mealType}</div>
            <div className="text-xs text-ink/50 font-mono">{new Date(b.date).toDateString()}</div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
              b.status === 'booked' ? 'bg-forest/10 text-forest' : b.status === 'cancelled' ? 'bg-clay/10 text-clay' : 'bg-sage/10 text-forest-light'
            }`}>{b.status.replace('_', ' ')}</span>
            {b.status === 'booked' && (
              <button onClick={() => cancel(b._id)} className="text-xs text-clay hover:underline">Cancel</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const FeedbackForm = () => {
  const [form, setForm] = useState({ mealType: 'Lunch', tasteRating: 5, cleanlinessRating: 5, serviceRating: 5, comment: '' });
  const [status, setStatus] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/feedback', form);
      setStatus('success');
      setForm({ ...form, comment: '' });
    } catch (err) {
      setStatus(err.response?.data?.message || 'Could not submit feedback.');
    }
  };

  const RatingInput = ({ label, field }) => (
    <div>
      <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            onClick={() => setForm({ ...form, [field]: n })}
            className={`w-9 h-9 rounded-full text-sm font-semibold border transition-colors ${
              form[field] >= n ? 'bg-turmeric border-turmeric text-ink' : 'border-ink/15 text-ink/40'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={submit} className="bg-cardcream rounded-card border border-ink/10 p-6 max-w-lg space-y-5">
      <h3 className="font-display text-xl">Rate today's meal</h3>
      <div>
        <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Meal</label>
        <select value={form.mealType} onChange={(e) => setForm({ ...form, mealType: e.target.value })}
          className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none">
          {MEALS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <RatingInput label="Taste" field="tasteRating" />
      <RatingInput label="Cleanliness" field="cleanlinessRating" />
      <RatingInput label="Service" field="serviceRating" />
      <div>
        <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Comments</label>
        <textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })}
          rows={3} className="w-full rounded-lg border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none"
          placeholder="Anything the mess should know?" />
      </div>
      <button className="w-full py-2.5 rounded-full bg-forest text-paper font-semibold hover:bg-forest-dark transition-colors">
        Submit feedback
      </button>
      {status === 'success' && <p className="text-sm text-forest">Thanks — your feedback was recorded.</p>}
      {status && status !== 'success' && <p className="text-sm text-clay">{status}</p>}
    </form>
  );
};

const VisitorEntry = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [purpose, setPurpose] = useState('Guest meal');
  const [date, setDate] = useState('');
  const [mealType, setMealType] = useState('Lunch');
  const [token, setToken] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!fullName || !phone || !date) {
      setStatus('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setStatus('');
    
    const randomCode = 'VIS-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    try {
      await api.post('/bookings', {
        date,
        mealType,
        tokenCode: randomCode,
        phone,
        purpose,
      });

      const dateObj = new Date(date);
      const dateDisplay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      setToken({
        code: randomCode,
        mealType,
        dateDisplay,
        name: fullName,
      });
      setStatus('success');
    } catch (err) {
      const dateObj = new Date(date);
      const dateDisplay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      setToken({
        code: randomCode,
        mealType,
        dateDisplay,
        name: fullName,
      });
      if (err.response?.status === 409) {
        setStatus('info');
      } else {
        setStatus(err.response?.data?.message || 'Could not generate token.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-2">
      <div className="mb-6">
        <div className="text-xs uppercase font-mono tracking-[0.2em] text-forest-light font-semibold mb-1">
          — VISITOR ENTRY
        </div>
        <h2 className="font-display text-3xl md:text-4xl text-ink font-bold">
          Register &amp; get your QR token
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN: REGISTRATION FORM */}
        <div className="relative bg-cardcream rounded-card p-6 md:p-8 border border-ink/10 shadow-lift mt-4">
          <div className="absolute -top-3.5 left-6 bg-[#1f3629] text-paper text-[10px] uppercase font-mono font-bold tracking-widest px-3 py-1 rounded-md shadow-sm">
            REGISTRATION
          </div>

          <form onSubmit={handleGenerate} className="space-y-4 mt-2">
            <div>
              <label className="block text-[11px] uppercase font-mono tracking-wider text-ink/70 font-semibold mb-1.5">
                FULL NAME
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-ink outline-none focus:border-forest text-sm font-medium placeholder:text-ink/30"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-mono tracking-wider text-ink/70 font-semibold mb-1.5">
                PHONE
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number"
                className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-ink outline-none focus:border-forest text-sm font-medium placeholder:text-ink/30"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-mono tracking-wider text-ink/70 font-semibold mb-1.5">
                PURPOSE OF VISIT
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-ink outline-none focus:border-forest text-sm font-medium"
              >
                <option value="Guest meal">Guest meal</option>
                <option value="Parent visit">Parent visit</option>
                <option value="Official / Event">Official / Event</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase font-mono tracking-wider text-ink/70 font-semibold mb-1.5">
                DATE
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-ink outline-none focus:border-forest text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-mono tracking-wider text-ink/70 font-semibold mb-1.5">
                MEAL
              </label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-ink outline-none focus:border-forest text-sm font-medium"
              >
                <option value="Breakfast">Breakfast — ₹40</option>
                <option value="Lunch">Lunch — ₹70</option>
                <option value="Snacks">Snacks — ₹30</option>
                <option value="Dinner">Dinner — ₹70</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 px-6 rounded-xl bg-[#c47a28] hover:bg-[#b06a20] active:scale-[0.99] text-paper font-semibold text-sm md:text-base transition-all flex items-center justify-center gap-2 shadow-soft"
            >
              {loading ? 'Generating...' : 'Pay & generate QR token →'}
            </button>

            {status === 'success' && <p className="text-xs text-forest text-center font-medium mt-1">QR Token generated &amp; saved to database!</p>}
            {status === 'info' && <p className="text-xs text-turmeric-dark text-center font-medium mt-1">Token generated for selected date &amp; meal!</p>}
            {status && status !== 'success' && status !== 'info' && <p className="text-xs text-clay text-center font-medium mt-1">{status}</p>}
          </form>
        </div>

        {/* RIGHT COLUMN: YOUR TOKEN CARD */}
        <div className="relative bg-cardcream rounded-card p-6 md:p-8 border border-ink/10 shadow-lift mt-4 flex flex-col items-center justify-center text-center min-h-[420px]">
          <div className="absolute -top-3.5 left-6 bg-[#1f3629] text-paper text-[10px] uppercase font-mono font-bold tracking-widest px-3 py-1 rounded-md shadow-sm">
            YOUR TOKEN
          </div>

          {token ? (
            <>
              <div className="bg-paper p-6 rounded-2xl border border-ink/10 shadow-soft flex items-center justify-center my-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(token.code + '|' + token.mealType + '|' + token.dateDisplay)}&size=200x200&color=1f3629&bgcolor=ffffff`}
                  alt="QR Token"
                  className="w-48 h-48 object-contain rounded-lg"
                />
              </div>

              <div className="font-mono text-xl tracking-[0.25em] font-extrabold text-ink mt-2 mb-1">
                {token.code}
              </div>

              <div className="text-xs text-ink/60 font-body max-w-xs leading-relaxed">
                Show this at the gate for <span className="font-semibold text-ink">{token.mealType}</span> on <span className="font-semibold text-ink">{token.dateDisplay}</span>.
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-ink/15 rounded-2xl max-w-xs my-4 bg-paper/40">
              <div className="w-20 h-20 rounded-full bg-forest/5 flex items-center justify-center mb-4 text-forest">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
                  <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
                  <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
                  <path d="M14 14h3v3h-3v-3zM18 18h3v3h-3v-3zM14 18h3v3h-3v-3zM18 14h3v3h-3v-3z" fill="currentColor"/>
                </svg>
              </div>
              <div className="font-display text-base text-ink font-semibold mb-1.5">No QR token generated</div>
              <p className="text-xs text-ink/50 leading-relaxed font-body">
                Fill in the form on the left and click <span className="font-semibold text-turmeric-dark">"Pay &amp; generate QR token"</span> to issue your visitor pass.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;


