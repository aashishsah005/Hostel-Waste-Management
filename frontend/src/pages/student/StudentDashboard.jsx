import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';

const MEALS = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

const MEAL_TIMINGS = {
  Breakfast: '7:00 AM – 8:00 AM',
  Lunch: '11:00 AM – 1:00 PM',
  Snacks: '4:00 PM – 5:00 PM',
  Dinner: '7:00 PM – 8:00 PM',
};

const CUTOFF_TIMINGS = {
  Breakfast: '4:00 AM',
  Lunch: '8:00 AM',
  Snacks: '1:00 PM',
  Dinner: '4:00 PM',
};

const MEAL_ICONS = {
  Breakfast: '🍳',
  Lunch: '🍛',
  Snacks: '☕',
  Dinner: '🍽️',
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const getTodayDayName = () => {
  const dayIndex = new Date().getDay();
  return DAYS[dayIndex === 0 ? 6 : dayIndex - 1];
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning!', icon: '🍳' };
  if (hour < 17) return { text: 'Good afternoon!', icon: '🍛' };
  return { text: 'Good evening!', icon: '🍽️' };
};

const todayISO = () => new Date().toISOString().slice(0, 10);

const checkCutoffStatus = (mealType) => {
  const cutoffHours = { Breakfast: 4, Lunch: 8, Snacks: 13, Dinner: 16 };
  const targetHour = cutoffHours[mealType] ?? 4;

  const now = new Date();
  const dateStr = todayISO();
  const [year, month, day] = dateStr.split('-').map(Number);

  const cutoffMs = Date.UTC(year, month - 1, day, targetHour, 0, 0) - (5.5 * 3600 * 1000);
  const diffMs = cutoffMs - now.getTime();

  if (diffMs <= 0) {
    return { isClosed: true, text: '🔒 Skip Closed', countdown: 'Prep started' };
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

  const format2 = (n) => String(n).padStart(2, '0');
  const countdownStr = `${format2(hours)}h ${format2(mins)}m ${format2(secs)}s`;

  return {
    isClosed: false,
    text: `⏳ Closes at ${CUTOFF_TIMINGS[mealType]}`,
    countdown: countdownStr,
  };
};

const tabs = [
  { id: 'todays-meals', label: "Today's Meals & Skip", icon: '🍲' },
  { id: 'vacation', label: 'Vacation Pause', icon: '🏠' },
  { id: 'menu', label: 'Weekly Menu', icon: '📅' },
  { id: 'book', label: 'Manage / Guest Pass', icon: '🎟️' },
  { id: 'mybookings', label: 'Meal Status History', icon: '📜' },
  { id: 'feedback', label: 'Give Feedback', icon: '⭐' },
];

const StudentDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState(user?.role === 'visitor' ? 'book' : 'todays-meals');
  const greeting = getGreeting();
  const todayName = getTodayDayName();

  return (
    <div className="max-w-6xl mx-auto px-5 py-8 space-y-8">
      {/* DASHBOARD HEADER */}
      <div className="bg-cardcream rounded-card p-6 md:p-8 border border-ink/10 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-xs font-mono font-bold uppercase tracking-wider">
            <span>{greeting.icon}</span>
            <span>{user?.role === 'visitor' ? 'Visitor Portal' : 'Student Portal'}</span>
            <span className="text-ink/30">|</span>
            <span className="text-turmeric-dark font-semibold">Today: {todayName}</span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl text-ink font-bold tracking-tight">
            {greeting.text} {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-ink/75 text-sm font-body">
            Your daily meals are <strong className="text-forest font-semibold">automatically expected</strong>. Skip single meals or use <strong>Vacation Pause</strong> for multi-day trips.
          </p>

          {user?.role === 'student' && (
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-ink/65 font-mono">
              <span className="bg-paper px-3 py-1 rounded-md border border-ink/10">
                🏢 Block: <strong className="text-forest">{user?.hostelBlock || 'A'}</strong>
              </span>
              <span className="bg-paper px-3 py-1 rounded-md border border-ink/10">
                🚪 Room: <strong className="text-forest">{user?.roomNumber || '101'}</strong>
              </span>
              <span className="bg-paper px-3 py-1 rounded-md border border-ink/10">
                📞 {user?.phone || '9876543210'}
              </span>
            </div>
          )}
        </div>

        {/* Dashboard Quick Stats Bar */}
        <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0">
          <div className="bg-paper p-3.5 rounded-2xl border border-ink/10 text-center shadow-soft">
            <div className="text-xs text-ink/50 font-mono font-semibold uppercase">Fulfilment</div>
            <div className="font-display text-2xl font-bold text-forest mt-0.5">93%</div>
            <div className="text-[10px] text-ink/40 font-mono">30d Avg</div>
          </div>
          <div className="bg-paper p-3.5 rounded-2xl border border-ink/10 text-center shadow-soft">
            <div className="text-xs text-ink/50 font-mono font-semibold uppercase">Cost Basis</div>
            <div className="font-display text-2xl font-bold text-turmeric-dark mt-0.5">₹60/kg</div>
            <div className="text-[10px] text-ink/40 font-mono">Hostel Standard</div>
          </div>
        </div>
      </div>

      {/* DASHBOARD NAVIGATION TABS */}
      <div className="flex gap-2 border-b border-ink/10 pb-3 overflow-x-auto scrollbar-thin">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              tab === t.id
                ? 'bg-forest text-paper shadow-soft'
                : 'bg-cardcream text-ink/75 border border-ink/10 hover:border-forest/40 hover:text-forest'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT AREAS */}
      {tab === 'todays-meals' && <TodaysMealsSection onGoToBook={() => setTab('book')} />}
      {tab === 'vacation' && <VacationSection />}
      {tab === 'menu' && <WeeklyMenuSection />}
      {tab === 'book' && <BookMeal />}
      {tab === 'mybookings' && <MyBookings />}
      {tab === 'feedback' && <FeedbackForm />}
    </div>
  );
};

/* 1. TODAY'S MEALS & MEAL SKIP SECTION */
const TodaysMealsSection = ({ onGoToBook }) => {
  const [menu, setMenu] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [, setTick] = useState(0);

  const todayName = getTodayDayName();
  const todayDateStr = todayISO();

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [menuRes, bookingsRes] = await Promise.all([
        api.get('/menu'),
        api.get('/bookings/mine').catch(() => ({ data: [] })),
      ]);
      setMenu(menuRes.data);
      setMyBookings(bookingsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSkip = async (mealType) => {
    setStatusMessage('');
    try {
      const res = await api.post('/bookings/skip', { date: todayDateStr, mealType });
      setStatusMessage(res.data.message || `${mealType} skipped successfully.`);
      loadData();
    } catch (err) {
      setStatusMessage(err.response?.data?.message || `Could not skip ${mealType}.`);
    }
  };

  const handleUnskip = async (mealType) => {
    setStatusMessage('');
    try {
      const res = await api.patch('/bookings/unskip', { date: todayDateStr, mealType });
      setStatusMessage(res.data.message || `Skip undone for ${mealType}.`);
      loadData();
    } catch (err) {
      setStatusMessage(err.response?.data?.message || `Could not undo skip for ${mealType}.`);
    }
  };

  if (loading) return <Loader label="Loading today's meal schedule & skip status..." />;

  const todayMenuItems = menu ? menu.filter((m) => m.dayOfWeek === todayName) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink flex items-center gap-2">
            <span>TODAY'S MEALS &amp; SKIP CONTROL</span>
            <span className="text-xs font-mono font-normal text-forest bg-forest/10 px-2.5 py-0.5 rounded-full">
              {todayName} ({new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
            </span>
          </h2>
          <p className="text-xs text-ink/65 mt-0.5">
            You are automatically expected for all meals. Click <strong>Skip</strong> if you will not eat.
          </p>
        </div>

        <button
          onClick={onGoToBook}
          className="text-xs font-semibold text-forest hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          Guest / QR Pass →
        </button>
      </div>

      {statusMessage && (
        <div
          className={`text-xs px-4 py-3 rounded-xl border flex items-center justify-between font-semibold ${
            statusMessage.includes('successfully') || statusMessage.includes('expected') || statusMessage.includes('undone')
              ? 'bg-forest/10 border-forest/30 text-forest'
              : 'bg-clay/10 border-clay/30 text-clay'
          }`}
        >
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage('')} className="text-ink/40 hover:text-ink text-xs cursor-pointer">✕</button>
        </div>
      )}

      {/* TODAY'S 4 MEAL CARDS WITH SKIP CONTROL */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {MEALS.map((mealType) => {
          const menuItem = todayMenuItems.find((m) => m.mealType === mealType);
          const cutoff = checkCutoffStatus(mealType);

          const bookingRecord = myBookings.find((b) => {
            const bDate = new Date(b.date).toISOString().slice(0, 10);
            return bDate === todayDateStr && b.mealType === mealType;
          });

          const isSkipped = bookingRecord && bookingRecord.status === 'skipped';
          const isConsumed = bookingRecord && bookingRecord.status === 'consumed';

          let statusDisplay = {
            title: '🟢 Coming',
            subtext: 'Your meal is automatically expected.',
            badgeBg: 'bg-forest/10 text-forest border-forest/25',
          };

          if (isSkipped) {
            statusDisplay = {
              title: '🔴 Skipped',
              subtext: "You are not counted for this meal.",
              badgeBg: 'bg-clay/10 text-clay border-clay/25',
            };
          } else if (isConsumed) {
            statusDisplay = {
              title: '🔵 Completed',
              subtext: 'Meal recorded as consumed.',
              badgeBg: 'bg-sage/15 text-forest border-sage/30',
            };
          }

          const price = menuItem?.price || (mealType === 'Snacks' ? 20 : 40);

          return (
            <div
              key={mealType}
              className={`bg-cardcream rounded-2xl p-5 border shadow-soft hover:shadow-lift transition-all flex flex-col justify-between ${
                isSkipped ? 'border-clay/30 bg-clay/5 ring-1 ring-clay/20' : 'border-ink/10'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-ink/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl p-1 rounded-xl bg-paper border border-ink/10 shadow-soft">{MEAL_ICONS[mealType]}</span>
                    <div>
                      <h3 className="font-display font-extrabold text-lg text-ink leading-snug">{mealType}</h3>
                      <div className="text-[11px] font-mono font-semibold text-ink/55">{MEAL_TIMINGS[mealType]}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border shrink-0 ${statusDisplay.badgeBg}`}>
                    {statusDisplay.title}
                  </span>
                </div>

                <div className="text-[11px] text-ink/65 font-medium italic">
                  {statusDisplay.subtext}
                </div>

                {/* MENU & PRICE BOX */}
                <div className="bg-paper rounded-2xl p-3.5 border border-ink/10 shadow-soft space-y-2">
                  <div className="text-xs font-semibold text-ink leading-relaxed">
                    {menuItem && menuItem.items && menuItem.items.length > 0
                      ? menuItem.items.join(', ')
                      : 'Standard Hostel Menu'}
                  </div>
                  <div className="pt-2 border-t border-ink/10 flex items-center justify-between font-mono">
                    <div className="text-[10px] uppercase font-bold text-ink/40">Meal Price</div>
                    <div className="font-display font-extrabold text-base text-forest">₹{price}</div>
                  </div>
                </div>

                {/* CUTOFF & COUNTDOWN STATUS */}
                <div className="py-1 text-[11px] font-mono flex items-center justify-between text-ink/70">
                  <span className={cutoff.isClosed ? 'text-clay font-bold' : 'text-forest font-bold'}>
                    {cutoff.text}
                  </span>
                  {!cutoff.isClosed && (
                    <span className="text-[10px] text-ink/60 bg-paper px-2 py-0.5 rounded-md border border-ink/15 font-semibold">
                      ⏱️ {cutoff.countdown}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-ink/10 mt-2">
                {isSkipped ? (
                  <button
                    onClick={() => handleUnskip(mealType)}
                    disabled={cutoff.isClosed}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      cutoff.isClosed
                        ? 'bg-ink/10 text-ink/35 cursor-not-allowed border border-ink/10'
                        : 'bg-turmeric text-ink hover:bg-turmeric-dark shadow-soft hover:shadow-lift cursor-pointer'
                    }`}
                  >
                    <span>↩ Undo Skip</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleSkip(mealType)}
                    disabled={cutoff.isClosed || isConsumed}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      cutoff.isClosed || isConsumed
                        ? 'bg-ink/10 text-ink/35 cursor-not-allowed border border-ink/10'
                        : 'bg-clay text-paper hover:bg-clay-dark shadow-soft hover:shadow-lift cursor-pointer'
                    }`}
                  >
                    <span>🚫 Skip {mealType}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* 2. VACATION / MULTI-DAY MEAL PAUSE SECTION */
const VacationSection = () => {
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(todayISO());
  const [allMeals, setAllMeals] = useState(true);
  const [selectedMeals, setSelectedMeals] = useState(['Breakfast', 'Lunch', 'Snacks', 'Dinner']);
  const [vacations, setVacations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [excludedList, setExcludedList] = useState([]);

  const loadVacations = async () => {
    try {
      const res = await api.get('/vacations/mine');
      setVacations(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadVacations();
  }, []);

  const toggleMeal = (meal) => {
    if (allMeals) {
      setAllMeals(false);
      setSelectedMeals([meal]);
      return;
    }
    if (selectedMeals.includes(meal)) {
      const next = selectedMeals.filter((m) => m !== meal);
      setSelectedMeals(next);
      if (next.length === 0) setAllMeals(false);
    } else {
      const next = [...selectedMeals, meal];
      setSelectedMeals(next);
      if (next.length === 4) setAllMeals(true);
    }
  };

  const toggleAllMeals = (e) => {
    const checked = e.target.checked;
    setAllMeals(checked);
    if (checked) {
      setSelectedMeals(['Breakfast', 'Lunch', 'Snacks', 'Dinner']);
    } else {
      setSelectedMeals([]);
    }
  };

  // Live total meal calculation
  const calculateTotalMeals = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate.slice(0, 10));
    const end = new Date(endDate.slice(0, 10));
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;
    const diffDays = Math.ceil((end - start) / (1000 * 3600 * 24)) + 1;
    return diffDays * selectedMeals.length;
  };

  const totalMeals = calculateTotalMeals();

  const handleCreateVacation = async (e) => {
    e.preventDefault();
    if (selectedMeals.length === 0) {
      setStatusMsg('Please select at least one meal to pause.');
      return;
    }

    setLoading(true);
    setStatusMsg('');
    setExcludedList([]);

    try {
      const res = await api.post('/vacations', {
        startDate,
        endDate,
        mealTypes: selectedMeals,
      });

      setStatusMsg(res.data.message || 'Vacation activated successfully!');
      if (res.data.excludedMeals && res.data.excludedMeals.length > 0) {
        setExcludedList(res.data.excludedMeals);
      }
      loadVacations();
    } catch (err) {
      setStatusMsg(err.response?.data?.message || 'Could not activate vacation mode.');
      if (err.response?.data?.excludedMeals) {
        setExcludedList(err.response.data.excludedMeals);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelVacation = async (id) => {
    setStatusMsg('');
    try {
      const res = await api.patch(`/vacations/${id}/cancel`);
      setStatusMsg(res.data.message || 'Vacation cancelled successfully.');
      loadVacations();
    } catch (err) {
      setStatusMsg(err.response?.data?.message || 'Could not cancel vacation.');
    }
  };

  const activeVacation = vacations.find((v) => v.status === 'active');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">🏠 VACATION &amp; MULTI-DAY MEAL PAUSE</h2>
        <p className="text-xs text-ink/65">Going home or taking leave? Pause all your meals in one single action.</p>
      </div>

      {statusMsg && (
        <div
          className={`text-xs px-4 py-3 rounded-xl border flex flex-col gap-1 font-semibold ${
            statusMsg.includes('successfully') || statusMsg.includes('activated') || statusMsg.includes('cancelled')
              ? 'bg-forest/10 border-forest/30 text-forest'
              : 'bg-clay/10 border-clay/30 text-clay'
          }`}
        >
          <div className="flex items-center justify-between">
            <span>{statusMsg}</span>
            <button onClick={() => setStatusMsg('')} className="text-ink/40 hover:text-ink text-xs cursor-pointer">✕</button>
          </div>

          {excludedList.length > 0 && (
            <div className="text-[11px] text-clay font-normal mt-1 border-t border-clay/20 pt-1">
              <strong>Note:</strong> {excludedList.length} meal(s) were excluded as their cutoff had already passed.
            </div>
          )}
        </div>
      )}

      {/* ACTIVE VACATION CARD */}
      {activeVacation && (
        <div className="bg-turmeric/10 rounded-card border border-turmeric/40 p-6 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-turmeric/20 text-turmeric-dark text-xs font-mono font-bold uppercase tracking-wider">
              <span>🏠 Active Vacation Mode</span>
            </div>
            <h3 className="font-display font-bold text-lg text-ink">
              {new Date(activeVacation.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} →{' '}
              {new Date(activeVacation.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </h3>
            <p className="text-xs text-ink/75">
              Paused: <strong>{activeVacation.mealTypes.join(', ')}</strong> ({activeVacation.totalMealsSkipped} total meals)
            </p>
          </div>

          <button
            onClick={() => handleCancelVacation(activeVacation._id)}
            className="px-5 py-2.5 rounded-full bg-clay text-paper text-xs font-semibold hover:bg-clay-dark transition-colors shadow-soft cursor-pointer shrink-0"
          >
            ↩ Resume Meals / Cancel Vacation
          </button>
        </div>
      )}

      {/* VACATION FORM */}
      <div className="bg-cardcream rounded-card border border-ink/10 p-6 md:p-8 max-w-2xl shadow-soft">
        <h3 className="font-display text-xl font-bold text-ink mb-1">Going Home? Plan Your Meal Pause</h3>
        <p className="text-xs text-ink/65 mb-6">Select your leave dates and meals to automatically skip them.</p>

        <form onSubmit={handleCreateVacation} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">From Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-2.5 focus:border-forest outline-none text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">To Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-2.5 focus:border-forest outline-none text-sm font-medium"
              />
            </div>
          </div>

          {/* MEAL SELECTION CHECKBOXES */}
          <div>
            <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-2">Select Meals To Pause</label>
            <div className="space-y-2 bg-paper p-4 rounded-xl border border-ink/10">
              <label className="flex items-center gap-2 text-xs font-bold text-forest cursor-pointer border-b border-ink/10 pb-2">
                <input
                  type="checkbox"
                  checked={allMeals}
                  onChange={toggleAllMeals}
                  className="rounded text-forest focus:ring-forest accent-forest cursor-pointer"
                />
                <span>☑ All Meals (Breakfast, Lunch, Snacks, Dinner)</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {MEALS.map((m) => (
                  <label key={m} className="flex items-center gap-2 text-xs text-ink/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedMeals.includes(m)}
                      onChange={() => toggleMeal(m)}
                      className="rounded text-forest focus:ring-forest accent-forest cursor-pointer"
                    />
                    <span>{MEAL_ICONS[m]} {m}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* LIVE MEAL COUNTER */}
          <div className="bg-forest/5 rounded-xl p-3.5 border border-forest/20 flex items-center justify-between">
            <span className="text-xs text-ink/70 font-medium">Total Planned Meals to Pause:</span>
            <span className="font-display font-bold text-forest text-lg">{totalMeals} meals</span>
          </div>

          <button
            type="submit"
            disabled={loading || totalMeals === 0}
            className={`w-full py-3.5 rounded-full font-semibold transition-all shadow-soft text-sm flex items-center justify-center gap-2 ${
              loading || totalMeals === 0
                ? 'bg-ink/10 text-ink/40 cursor-not-allowed border border-ink/10'
                : 'bg-forest text-paper hover:bg-forest-dark cursor-pointer'
            }`}
          >
            {loading ? 'Activating Vacation...' : '🏠 Pause My Meals →'}
          </button>
        </form>
      </div>

      {/* VACATION HISTORY */}
      <div className="space-y-3">
        <h3 className="font-display text-lg font-bold text-ink">Vacation History</h3>
        {vacations.length === 0 ? (
          <p className="text-xs text-ink/50 italic">No vacation records found.</p>
        ) : (
          <div className="grid gap-3">
            {vacations.map((v) => (
              <div key={v._id} className="bg-cardcream rounded-xl border border-ink/10 p-4 flex items-center justify-between text-xs">
                <div>
                  <div className="font-display font-bold text-ink">
                    {new Date(v.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} →{' '}
                    {new Date(v.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="text-ink/60 mt-0.5">
                    {v.mealTypes.join(', ')} · <strong>{v.totalMealsSkipped} meals</strong>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                  v.status === 'active'
                    ? 'bg-turmeric/20 text-turmeric-dark border border-turmeric/40'
                    : 'bg-ink/10 text-ink/50 border border-ink/20'
                }`}>
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* 3. WEEKLY MENU SECTION */
const WeeklyMenuSection = () => {
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(getTodayDayName());

  const todayName = getTodayDayName();

  useEffect(() => {
    api
      .get('/menu')
      .then((res) => setMenu(res.data))
      .catch(() => setError('Could not load the menu.'));
  }, []);

  if (error) return <p className="text-clay text-sm font-semibold">{error}</p>;
  if (!menu) return <Loader label="Loading this week's mess menu..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">WEEKLY MESS MENU</h2>
          <p className="text-xs text-ink/65">Full 7-day breakfast, lunch, snacks, and dinner schedule.</p>
        </div>

        <div className="flex gap-1.5 overflow-x-auto scrollbar-thin pb-1">
          {DAYS.map((day) => {
            const isToday = day === todayName;
            const isSelected = day === selectedDay;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-forest text-paper shadow-soft'
                    : 'bg-cardcream text-ink/75 border border-ink/10 hover:border-forest/40'
                }`}
              >
                <span>{day.slice(0, 3)}</span>
                {isToday && <span className="w-1.5 h-1.5 rounded-full bg-turmeric animate-pulse" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6">
        {DAYS.map((day) => {
          const items = menu.filter((m) => m.dayOfWeek === day);
          const isToday = day === todayName;
          const isSelected = day === selectedDay;

          if (!items.length) return null;

          return (
            <div
              key={day}
              className={`bg-cardcream rounded-card border p-6 transition-all ${
                isSelected
                  ? 'border-forest ring-2 ring-forest/20 shadow-lift'
                  : 'border-ink/10 shadow-soft'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-xl font-bold text-forest">{day}</h3>
                  {isToday && (
                    <span className="bg-turmeric/20 text-turmeric-dark font-mono text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border border-turmeric/30">
                      ★ Today
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono text-ink/50">{items.length} Meals Offered</span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {MEALS.map((mealType) => {
                  const m = items.find((item) => item.mealType === mealType);
                  return (
                    <div key={mealType} className="bg-paper rounded-2xl p-4 border border-ink/10 shadow-soft">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg">{MEAL_ICONS[mealType]}</span>
                          <span className="font-display font-bold text-sm text-ink">{mealType}</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-forest bg-forest/10 px-2 py-0.5 rounded-full">
                          ₹{m?.price || (mealType === 'Snacks' ? 20 : 40)}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono text-ink/50 mb-2">
                        {MEAL_TIMINGS[mealType]} (Cutoff: {CUTOFF_TIMINGS[mealType]})
                      </div>

                      <div className="text-xs text-ink/80 font-medium leading-relaxed">
                        {m && m.items && m.items.length > 0 ? m.items.join(', ') : 'Standard Menu'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* 4. MANAGE & GUEST PASS SECTION */
const BookMeal = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState(user?.role === 'visitor' ? 'visitor' : 'student');
  const [date, setDate] = useState(todayISO());
  const [mealType, setMealType] = useState('Lunch');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    setStatus('');
    setLoading(true);
    try {
      await api.post('/bookings', { date, mealType });
      setStatus('success');
    } catch (err) {
      setStatus(err.response?.data?.message || 'Could not create booking.');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role === 'visitor' || mode === 'visitor') {
    return (
      <div>
        {user?.role !== 'visitor' && (
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setMode('student')}
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-cardcream text-ink/60 border border-ink/10 hover:border-forest/40 cursor-pointer"
            >
              ← Student Dashboard
            </button>
            <span className="text-xs font-mono text-turmeric-dark font-semibold">Visitor QR Token Mode Active</span>
          </div>
        )}
        <VisitorEntry />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-ink/50 font-semibold">Mode:</span>
        <button
          onClick={() => setMode('student')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
            mode === 'student' ? 'bg-forest text-paper' : 'bg-cardcream text-ink/70 border border-ink/10'
          }`}
        >
          Manual RSVP / Extra Token
        </button>
        <button
          onClick={() => setMode('visitor')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
            mode === 'visitor' ? 'bg-turmeric text-ink' : 'bg-cardcream text-ink/70 border border-ink/10'
          }`}
        >
          Visitor / Guest QR Token
        </button>
      </div>

      <div className="bg-cardcream rounded-card border border-ink/10 p-6 md:p-8 max-w-md shadow-soft">
        <h3 className="font-display text-xl font-bold text-ink mb-1">Manual Meal Booking / Extra Pass</h3>
        <p className="text-xs text-ink/65 mb-6">Create a special meal booking for explicit dates.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-2.5 focus:border-forest outline-none text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Meal Type</label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-2.5 focus:border-forest outline-none text-sm font-medium"
            >
              {MEALS.map((m) => (
                <option key={m} value={m}>
                  {MEAL_ICONS[m]} {m} ({MEAL_TIMINGS[m]})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleBook}
            disabled={loading}
            className="w-full py-3 rounded-full bg-forest text-paper font-semibold hover:bg-forest-dark transition-colors shadow-soft text-sm cursor-pointer"
          >
            {loading ? 'Confirming...' : 'Create Booking Record →'}
          </button>

          {status === 'success' && (
            <p className="text-xs text-forest font-semibold bg-forest/10 p-3 rounded-xl border border-forest/20 text-center">
              ✓ Booking created successfully!
            </p>
          )}
          {status && status !== 'success' && (
            <p className="text-xs text-clay font-semibold bg-clay/10 p-3 rounded-xl border border-clay/20 text-center">
              {status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/* 5. MY BOOKINGS / MEAL STATUS HISTORY */
const MyBookings = () => {
  const [bookings, setBookings] = useState(null);

  const load = () => api.get('/bookings/mine').then((res) => setBookings(res.data));
  useEffect(() => {
    load();
  }, []);

  const cancel = async (id) => {
    await api.patch(`/bookings/${id}/cancel`);
    load();
  };

  if (!bookings) return <Loader label="Loading your meal status history..." />;
  if (!bookings.length) return <p className="text-ink/60 text-sm font-medium">No meal status or skip records found yet.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">MEAL STATUS &amp; SKIP HISTORY</h2>
          <p className="text-xs text-ink/65">Review your past skips, RSVPs, and consumed meal logs.</p>
        </div>
        <span className="text-xs font-mono text-forest bg-forest/10 px-3 py-1 rounded-full font-bold">
          Total Records: {bookings.length}
        </span>
      </div>

      <div className="grid gap-3">
        {bookings.map((b) => (
          <div key={b._id} className="bg-cardcream rounded-card border border-ink/10 p-4 sm:p-5 flex items-center justify-between hover:shadow-soft transition-shadow">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{MEAL_ICONS[b.mealType] || '🍲'}</span>
              <div>
                <div className="font-display font-bold text-base text-ink">{b.mealType}</div>
                <div className="text-xs text-ink/50 font-mono mt-0.5">
                  {new Date(b.date).toDateString()} · <span className="text-forest">{MEAL_TIMINGS[b.mealType] || 'Standard Time'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                  b.status === 'skipped'
                    ? 'bg-clay/15 text-clay border border-clay/30'
                    : b.status === 'booked'
                    ? 'bg-forest/15 text-forest border border-forest/30'
                    : b.status === 'cancelled'
                    ? 'bg-ink/10 text-ink/50 border border-ink/20'
                    : 'bg-sage/20 text-forest-light border border-sage/40'
                }`}
              >
                {b.status === 'skipped' ? '🔴 Skipped' : b.status.replace('_', ' ')}
              </span>
              {b.status === 'booked' && (
                <button onClick={() => cancel(b._id)} className="text-xs text-clay hover:underline font-semibold cursor-pointer">
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* 6. FEEDBACK FORM SECTION */
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
      <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1.5">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            onClick={() => setForm({ ...form, [field]: n })}
            className={`w-9 h-9 rounded-full text-sm font-semibold border transition-all cursor-pointer ${
              form[field] >= n ? 'bg-turmeric border-turmeric text-ink shadow-soft' : 'border-ink/15 text-ink/40 bg-paper'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">GIVE MEAL FEEDBACK</h2>
        <p className="text-xs text-ink/65">Rate today's food quality to help mess staff improve recipes.</p>
      </div>

      <form onSubmit={submit} className="bg-cardcream rounded-card border border-ink/10 p-6 md:p-8 max-w-lg space-y-5 shadow-soft">
        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Meal</label>
          <select
            value={form.mealType}
            onChange={(e) => setForm({ ...form, mealType: e.target.value })}
            className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-2.5 focus:border-forest outline-none text-sm font-medium"
          >
            {MEALS.map((m) => (
              <option key={m} value={m}>
                {MEAL_ICONS[m]} {m}
              </option>
            ))}
          </select>
        </div>

        <RatingInput label="Taste Rating" field="tasteRating" />
        <RatingInput label="Cleanliness Rating" field="cleanlinessRating" />
        <RatingInput label="Service Speed Rating" field="serviceRating" />

        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Comments &amp; Suggestions</label>
          <textarea
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            rows={3}
            className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-2.5 focus:border-forest outline-none text-sm font-medium"
            placeholder="Anything specific about the meal quality or portion size?"
          />
        </div>

        <button className="w-full py-3 rounded-full bg-forest text-paper font-semibold hover:bg-forest-dark transition-colors shadow-soft text-sm cursor-pointer">
          Submit Meal Feedback →
        </button>

        {status === 'success' && (
          <p className="text-xs text-forest font-semibold bg-forest/10 p-3 rounded-xl border border-forest/20 text-center">
            ✓ Thank you! Your feedback has been recorded for the mess manager.
          </p>
        )}
        {status && status !== 'success' && (
          <p className="text-xs text-clay font-semibold bg-clay/10 p-3 rounded-xl border border-clay/20 text-center">
            {status}
          </p>
        )}
      </form>
    </div>
  );
};

/* VISITOR ENTRY & DUMMY PAYMENT COMPONENT */
const VisitorEntry = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [purpose, setPurpose] = useState('Guest meal');
  const [date, setDate] = useState(todayISO());
  const [mealType, setMealType] = useState('Lunch');
  const [receipt, setReceipt] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const priceMap = { Breakfast: 40, Lunch: 40, Snacks: 20, Dinner: 40 };
  const currentPrice = priceMap[mealType] || 40;

  const handlePayAndBook = async (e) => {
    e.preventDefault();
    if (!fullName || !phone || !date) {
      setStatus('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setStatus('');

    try {
      const res = await api.post('/bookings/visitor-pay', {
        date,
        mealType,
        visitorName: fullName,
        phone,
        purpose,
      });

      const b = res.data.booking;
      const dateObj = new Date(b.date);
      const dateDisplay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      setReceipt({
        code: b.tokenCode,
        transactionId: b.transactionId,
        amount: b.paymentAmount,
        visitorName: b.visitorName || fullName,
        mealType: b.mealType,
        dateDisplay,
        timing: MEAL_TIMINGS[b.mealType] || 'Standard Time',
      });
      setStatus('success');
    } catch (err) {
      setStatus(err.response?.data?.message || 'Could not complete visitor booking.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setReceipt(null);
    setStatus('');
  };

  return (
    <div className="max-w-5xl mx-auto py-2">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase font-mono tracking-[0.2em] text-forest-light font-semibold mb-1">
            — VISITOR MEAL PASS &amp; DEMO CHECKOUT
          </div>
          <h2 className="font-display text-3xl md:text-4xl text-ink font-bold">
            Visitor Meal Booking
          </h2>
        </div>

        {receipt && (
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-full bg-forest/10 border border-forest/30 text-forest text-xs font-semibold hover:bg-forest/20 transition-colors cursor-pointer"
          >
            🎟️ Book Another Visitor Pass
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* LEFT: PAYMENT FORM */}
        <div className="relative bg-cardcream rounded-card p-6 md:p-8 border border-ink/10 shadow-lift mt-4">
          <div className="absolute -top-3.5 left-6 bg-[#1f3629] text-paper text-[10px] uppercase font-mono font-bold tracking-widest px-3 py-1 rounded-md shadow-sm">
            DEMO CHECKOUT &amp; DETAILS
          </div>

          <form onSubmit={handlePayAndBook} className="space-y-4 mt-2">
            <div>
              <label className="block text-[11px] uppercase font-mono tracking-wider text-ink/70 font-semibold mb-1.5">
                VISITOR NAME
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
                PHONE NUMBER
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit Phone Number"
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase font-mono tracking-wider text-ink/70 font-semibold mb-1.5">
                  MEAL DATE
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-ink/15 bg-paper px-3 py-2.5 text-ink outline-none focus:border-forest text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-mono tracking-wider text-ink/70 font-semibold mb-1.5">
                  MEAL TYPE
                </label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full rounded-xl border border-ink/15 bg-paper px-3 py-2.5 text-ink outline-none focus:border-forest text-xs font-medium"
                >
                  <option value="Breakfast">Breakfast — ₹40</option>
                  <option value="Lunch">Lunch — ₹40</option>
                  <option value="Snacks">Snacks — ₹20</option>
                  <option value="Dinner">Dinner — ₹40</option>
                </select>
              </div>
            </div>

            {/* AUTHORITATIVE PRICE DISPLAY CARD */}
            <div className="bg-forest/5 rounded-xl p-3.5 border border-forest/20 flex items-center justify-between text-xs my-2">
              <div>
                <div className="font-display font-bold text-ink">{MEAL_ICONS[mealType]} {mealType} Pass</div>
                <div className="text-[10px] font-mono text-ink/50">{MEAL_TIMINGS[mealType]}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono uppercase text-ink/50 font-bold">Total Price</div>
                <div className="font-display text-xl font-bold text-forest">₹{currentPrice}</div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 py-3.5 px-6 rounded-xl text-paper font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-soft cursor-pointer ${
                loading
                  ? 'bg-ink/20 text-ink/40 cursor-not-allowed'
                  : 'bg-[#c47a28] hover:bg-[#b06a20] active:scale-[0.99]'
              }`}
            >
              {loading ? '⏳ Processing Demo Payment...' : `💳 Pay ₹${currentPrice} & Generate QR Pass →`}
            </button>

            <div className="text-[10px] text-center font-mono text-ink/40">
              🔒 Safe Demo Payment Gateway Simulation
            </div>

            {status === 'success' && <p className="text-xs text-forest text-center font-semibold mt-1">✓ Visitor pass paid &amp; issued successfully!</p>}
            {status && status !== 'success' && <p className="text-xs text-clay text-center font-semibold mt-1">{status}</p>}
          </form>
        </div>

        {/* RIGHT: CONFIRMATION RECEIPT & QR CARD */}
        <div className="relative bg-cardcream rounded-card p-6 md:p-8 border border-ink/10 shadow-lift mt-4 flex flex-col items-center justify-center text-center min-h-[440px]">
          <div className="absolute -top-3.5 left-6 bg-[#1f3629] text-paper text-[10px] uppercase font-mono font-bold tracking-widest px-3 py-1 rounded-md shadow-sm">
            {receipt ? 'PASS & RECEIPT' : 'YOUR QR PASS'}
          </div>

          {receipt ? (
            <div className="w-full space-y-3">
              <div className="bg-forest/10 border border-forest/30 text-forest text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5">
                <span>✓ Payment Successful (DEMO)</span>
              </div>

              <div className="bg-paper p-5 rounded-2xl border border-ink/10 shadow-soft space-y-3 text-left text-xs">
                <div className="flex items-center justify-between border-b border-ink/10 pb-2">
                  <div>
                    <div className="font-display font-bold text-base text-ink">{receipt.visitorName}</div>
                    <div className="text-[10px] font-mono text-ink/50">Visitor Pass</div>
                  </div>
                  <span className="font-mono text-xs font-bold text-forest bg-forest/10 px-2.5 py-1 rounded-full border border-forest/20">
                    PAID ₹{receipt.amount}
                  </span>
                </div>

                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex items-center justify-between text-ink/75">
                    <span>Meal:</span>
                    <strong className="text-ink">{MEAL_ICONS[receipt.mealType]} {receipt.mealType}</strong>
                  </div>
                  <div className="flex items-center justify-between text-ink/75">
                    <span>Date:</span>
                    <strong className="text-ink">{receipt.dateDisplay}</strong>
                  </div>
                  <div className="flex items-center justify-between text-ink/75">
                    <span>Timing:</span>
                    <strong className="text-forest">{receipt.timing}</strong>
                  </div>
                  <div className="flex items-center justify-between text-ink/50 border-t border-ink/10 pt-1 mt-1 text-[10px]">
                    <span>Txn ID:</span>
                    <span className="font-mono font-bold text-ink">{receipt.transactionId}</span>
                  </div>
                </div>

                <div className="bg-paper p-3 rounded-xl border border-ink/10 flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(receipt.code + '|' + receipt.mealType + '|' + receipt.dateDisplay + '|' + receipt.transactionId)}&size=200x200&color=1f3629&bgcolor=ffffff`}
                    alt="Visitor QR Pass"
                    className="w-40 h-40 object-contain rounded-lg"
                  />
                </div>

                <div className="font-mono text-center text-sm tracking-[0.2em] font-extrabold text-ink">
                  {receipt.code}
                </div>
              </div>

              <div className="text-[10px] text-ink/50 font-body">
                Show this QR pass at the mess gate scanner for meal entry.
              </div>
            </div>
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
              <div className="font-display text-base text-ink font-semibold mb-1.5">No Visitor Pass Active</div>
              <p className="text-xs text-ink/50 leading-relaxed font-body">
                Fill in visitor details on the left and click <span className="font-semibold text-turmeric-dark">"Pay &amp; Generate QR Pass"</span> to complete demo checkout.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
