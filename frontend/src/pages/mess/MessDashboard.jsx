import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import StatCard from '../../components/StatCard';
import PlateGauge from '../../components/PlateGauge';

const MEALS = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
const todayISO = () => new Date().toISOString().slice(0, 10);

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

const checkMealCutoff = (mealType) => {
  const cutoffHours = { Breakfast: 4, Lunch: 8, Snacks: 13, Dinner: 16 };
  const targetHour = cutoffHours[mealType] ?? 4;

  const now = new Date();
  const dateStr = todayISO();
  const [year, month, day] = dateStr.split('-').map(Number);

  const cutoffMs = Date.UTC(year, month - 1, day, targetHour, 0, 0) - (5.5 * 3600 * 1000);
  return now.getTime() >= cutoffMs;
};

// Preparation Intelligence calculation rule
const calculatePrepIntelligence = (liveDemand, aiRecommendedPrep) => {
  const recommended = aiRecommendedPrep || liveDemand || 1;
  const live = liveDemand || 0;

  let target = Math.max(live, recommended);
  let status = 'balanced'; // 'balanced' | 'overprep_risk' | 'underprep_risk'
  let rationale = '';
  let insight = '';

  if (live > recommended) {
    status = 'underprep_risk';
    target = live;
    rationale = 'Live demand exceeds AI recommendation. Target increased to cover expected diners & visitors.';
    insight = 'Live student demand & visitor passes exceed historical AI forecast. Prepare according to live demand to prevent shortages.';
  } else if (recommended - live > Math.max(10, live * 0.1)) {
    status = 'overprep_risk';
    target = recommended;
    rationale = 'AI recommendation includes safety buffer and exceeds live demand. Target set to AI recommendation.';
    insight = 'Current demand is below the AI recommendation. Monitor preparation closely to avoid unnecessary food waste.';
  } else {
    status = 'balanced';
    target = recommended;
    rationale = 'Live demand is well-aligned with AI recommendation. Optimal balanced preparation target.';
    insight = 'Kitchen demand and AI forecast are nicely balanced. Follow target preparation count for best fulfilment.';
  }

  return { target, status, rationale, insight };
};

const tabs = [
  { id: 'predict', label: "Today's Kitchen Control Room", icon: '🍳' },
  { id: 'entry', label: 'Log Food Entry / Audit', icon: '📝' },
  { id: 'waste', label: 'Waste Analytics & Audit', icon: '📊' },
  { id: 'menu', label: 'Manage Menu', icon: '🍱' },
  { id: 'feedback', label: 'Student Feedback', icon: '⭐' },
];

const MessDashboard = () => {
  const [tab, setTab] = useState('predict');
  const [closingAuditPrefill, setClosingAuditPrefill] = useState(null);

  const todayDateDisplay = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleOpenAuditForm = (prefillData) => {
    setClosingAuditPrefill(prefillData);
    setTab('entry');
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-8 space-y-8 font-body">
      {/* KITCHEN CONTROL ROOM HEADER */}
      <div className="bg-cardcream rounded-card p-6 md:p-8 border border-ink/10 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-xs font-mono font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
            <span>Smart Kitchen Control Room</span>
            <span className="text-ink/30">|</span>
            <span className="text-turmeric-dark font-semibold">Kitchen Performance &amp; Daily Closing</span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl text-ink font-bold tracking-tight">
            Kitchen Management &amp; Food Intelligence
          </h1>
          <p className="text-ink/75 text-sm">
            Live student demand, AI prep targets, daily meal closing audits, and waste analytics.
          </p>
        </div>

        <div className="bg-paper px-4 py-3 rounded-2xl border border-ink/10 text-right shadow-soft shrink-0">
          <div className="text-[10px] font-mono uppercase text-ink/50 font-bold">Today's Date</div>
          <div className="font-display font-bold text-base text-ink mt-0.5">{todayDateDisplay}</div>
          <div className="text-[10px] font-mono text-forest font-semibold mt-0.5">● System Active</div>
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
      {tab === 'predict' && <PredictionPanel onOpenAuditForm={handleOpenAuditForm} />}
      {tab === 'entry' && <FoodEntryForm prefill={closingAuditPrefill} onClearPrefill={() => setClosingAuditPrefill(null)} />}
      {tab === 'waste' && <WasteAnalytics />}
      {tab === 'menu' && <ManageMenu />}
      {tab === 'feedback' && <FeedbackSummary />}
    </div>
  );
};

/* 1. TODAY'S KITCHEN CONTROL ROOM PANEL */
const PredictionPanel = ({ onOpenAuditForm }) => {
  const [mealType, setMealType] = useState('Lunch');
  const [prediction, setPrediction] = useState(null);
  const [allPredictions, setAllPredictions] = useState({});
  const [bookingCounts, setBookingCounts] = useState([]);
  const [managerNotifications, setManagerNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [countRes, notifRes, predResults] = await Promise.all([
        api.get('/bookings/counts', { params: { date: todayISO() } }),
        api.get('/notifications').catch(() => ({ data: { notifications: [] } })),
        Promise.all(MEALS.map((m) => api.get('/food-entries/predict', { params: { mealType: m } }))),
      ]);

      const predMap = {};
      MEALS.forEach((m, idx) => {
        predMap[m] = predResults[idx].data;
      });

      setBookingCounts(countRes.data || []);
      setManagerNotifications(notifRes.data?.notifications || []);
      setAllPredictions(predMap);
      setPrediction(predMap[mealType] || predResults[1].data);
    } catch (err) {
      console.error('Error loading kitchen control room data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (allPredictions[mealType]) {
      setPrediction(allPredictions[mealType]);
    }
  }, [mealType, allPredictions]);

  // Authoritative Backend Derived Metrics
  const totalActiveStudents = bookingCounts[0]?.totalActiveStudents ?? 1;
  const totalStudentSkipsToday = bookingCounts.reduce((acc, b) => acc + (b.studentSkipped || 0), 0);
  const totalVisitorRevenueToday = bookingCounts.reduce((acc, b) => acc + (b.visitorRevenue || 0), 0);
  const totalVisitorPassesToday = bookingCounts.reduce((acc, b) => acc + (b.visitorPasses || 0), 0);

  // Filter Vacation Alerts for Activity Feed
  const vacationAlerts = managerNotifications.filter((n) => n.type === 'manager_vacation_alert');

  // Selected meal details
  const currentMealCount = bookingCounts.find((b) => b._id === mealType);
  const currentStudentSkipped = currentMealCount?.studentSkipped || 0;
  const currentVisitorPasses = currentMealCount?.visitorPasses || 0;
  const currentExpectedStudentDiners = Math.max(0, totalActiveStudents - currentStudentSkipped);
  const currentFinalDemand = currentExpectedStudentDiners + currentVisitorPasses;

  const currentAIRecommended = prediction?.recommendedPreparation || currentFinalDemand || 1;
  const currentPrepIntel = calculatePrepIntelligence(currentFinalDemand, currentAIRecommended);

  // Waste % calculation safely
  const predConsumption = prediction?.predictedConsumption || 1;
  const predWasteKg = prediction?.predictedWasteKg || 0;
  const wastePercent = Math.min(100, Math.round((predWasteKg / (predConsumption * 0.35 || 1)) * 100));

  return (
    <div className="space-y-8">
      {/* 4 TOP SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Active Students"
          value={totalActiveStudents}
          sublabel="Enrolled Mess Members"
          accent="forest"
        />
        <StatCard
          label="Today's Total Skips"
          value={totalStudentSkipsToday}
          sublabel="Across 4 daily meals"
          accent="clay"
        />
        <StatCard
          label="Active Vacations"
          value={vacationAlerts.length}
          sublabel="Multi-day meal pauses"
          accent="turmeric"
        />
        <StatCard
          label="Visitor Revenue Today"
          value={`₹${totalVisitorRevenueToday}`}
          sublabel={`${totalVisitorPassesToday} paid passes`}
          accent="sage"
        />
      </div>

      {/* FOUR-MEAL KITCHEN PLANNING GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-ink flex items-center gap-2">
              <span>FOUR-MEAL KITCHEN PLANNING GRID</span>
              <span className="text-xs font-mono font-normal text-forest bg-forest/10 px-2.5 py-0.5 rounded-full">
                All 4 Meals Target Overview
              </span>
            </h2>
            <p className="text-xs text-ink/65 mt-0.5">
              Live expected diners, AI recommendations, final prep targets, and meal closing audit.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MEALS.map((m) => {
            const countObj = bookingCounts.find((b) => b._id === m);
            const studentSkipped = countObj?.studentSkipped || 0;
            const visitorPasses = countObj?.visitorPasses || 0;
            const expectedStudentDiners = Math.max(0, totalActiveStudents - studentSkipped);
            const finalKitchenDemand = expectedStudentDiners + visitorPasses;

            const mealAIPrep = allPredictions[m]?.recommendedPreparation || finalKitchenDemand || 1;
            const prepIntel = calculatePrepIntelligence(finalKitchenDemand, mealAIPrep);
            const isClosed = checkMealCutoff(m);

            return (
              <div
                key={m}
                className={`bg-cardcream rounded-card p-5 border shadow-soft flex flex-col justify-between transition-all ${
                  m === mealType ? 'ring-2 ring-forest border-forest shadow-lift' : 'border-ink/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{MEAL_ICONS[m]}</span>
                      <div>
                        <h3 className="font-display font-bold text-base text-ink leading-tight">{m}</h3>
                        <div className="text-[10px] font-mono text-ink/50">{MEAL_TIMINGS[m]}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setMealType(m)}
                      className={`text-[10px] font-mono font-bold px-2 py-1 rounded-full border cursor-pointer ${
                        m === mealType
                          ? 'bg-forest text-paper border-forest'
                          : 'bg-paper text-ink/60 border-ink/15 hover:border-forest/40'
                      }`}
                    >
                      {m === mealType ? '★ Active' : 'Select'}
                    </button>
                  </div>

                  {/* PREPARATION RISK STATUS BADGE */}
                  <div className="mb-3">
                    {prepIntel.status === 'balanced' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-forest/10 border border-forest/20 text-forest text-[10px] font-mono font-bold">
                        🟢 Balanced Demand
                      </span>
                    )}
                    {prepIntel.status === 'overprep_risk' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-turmeric/15 border border-turmeric/30 text-turmeric-dark text-[10px] font-mono font-bold">
                        🟡 Slight Over-prep Risk
                      </span>
                    )}
                    {prepIntel.status === 'underprep_risk' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-clay/15 border border-clay/30 text-clay text-[10px] font-mono font-bold">
                        🔴 Under-prep Risk
                      </span>
                    )}
                  </div>

                  <div className="bg-paper rounded-xl p-3.5 border border-ink/10 space-y-2 my-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-ink/60">Expected Students</span>
                      <span className="font-bold text-ink">{expectedStudentDiners}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-ink/60">Skipped / Visitors</span>
                      <span className="font-mono text-[11px]">
                        🚫 {studentSkipped} | 🎟️ {visitorPasses}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs border-t border-ink/10 pt-1.5">
                      <span className="text-ink/60">Live Demand</span>
                      <span className="font-bold text-forest">{finalKitchenDemand}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-ink/60">AI Rec. Prep</span>
                      <span className="font-bold text-turmeric-dark">{mealAIPrep}</span>
                    </div>

                    {/* PROMINENT FINAL PREPARATION TARGET */}
                    <div className="bg-forest text-paper p-2.5 rounded-lg border border-forest-dark flex items-center justify-between mt-2 shadow-soft">
                      <span className="text-[10px] font-mono font-bold uppercase">⭐ PREPARE TARGET</span>
                      <span className="font-display font-bold text-lg leading-none">{prepIntel.target} Meals</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-ink/10">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className={isClosed ? 'text-clay font-bold' : 'text-forest font-semibold'}>
                      {isClosed ? '🔒 Skip Closed' : '🟢 Skip Open'}
                    </span>
                    <span className="text-[10px] text-ink/40">Cutoff: {CUTOFF_TIMINGS[m]}</span>
                  </div>

                  {/* CLOSE & AUDIT MEAL BUTTON */}
                  <button
                    onClick={() =>
                      onOpenAuditForm({
                        date: todayISO(),
                        mealType: m,
                        expectedDiners: expectedStudentDiners,
                        targetPreparation: prepIntel.target,
                        aiRecommendedPrep: mealAIPrep,
                      })
                    }
                    className="w-full py-1.5 rounded-lg bg-turmeric/15 hover:bg-turmeric text-turmeric-dark hover:text-ink font-mono text-[11px] font-bold transition-all border border-turmeric/30 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>📝 Close &amp; Audit Meal →</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI DEMAND INTELLIGENCE SECTION */}
      <div className="bg-cardcream rounded-card border border-ink/10 p-6 md:p-8 space-y-6 shadow-soft">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ink/10 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-turmeric-dark bg-turmeric/10 px-2.5 py-0.5 rounded-full border border-turmeric/20">
              <span>🤖 AI Demand Intelligence</span>
            </div>
            <h3 className="font-display text-2xl font-bold text-ink mt-1">
              {mealType} Preparation &amp; Consumption Forecast
            </h3>
          </div>

          <div className="flex gap-2">
            {MEALS.map((m) => (
              <button
                key={m}
                onClick={() => setMealType(m)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  mealType === m
                    ? 'bg-turmeric text-ink font-bold shadow-soft'
                    : 'bg-paper text-ink/60 border border-ink/15 hover:border-turmeric/40'
                }`}
              >
                {MEAL_ICONS[m]} {m}
              </button>
            ))}
          </div>
        </div>

        {loading || !prediction ? (
          <Loader label={`Calculating ML forecast for ${mealType}...`} />
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6 items-center">
              <div className="bg-paper rounded-2xl border border-ink/10 p-6 flex flex-col items-center justify-center text-center shadow-soft">
                <PlateGauge
                  savedPercent={Math.min(
                    100,
                    Math.round(
                      (prediction.predictedConsumption / (prediction.recommendedPreparation || 1)) * 100
                    )
                  )}
                  label="Fulfilment vs. Prepared"
                />
              </div>

              <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
                <StatCard
                  label="Predicted Consumption"
                  value={prediction.predictedConsumption}
                  sublabel={prediction.method}
                  accent="forest"
                />
                <StatCard
                  label="AI Recommended Prep (incl. 5% buffer)"
                  value={prediction.recommendedPreparation ?? '—'}
                  sublabel="Historical ML Forecast"
                  accent="sage"
                />
                <StatCard
                  label="Predicted Waste (kg)"
                  value={`${prediction.predictedWasteKg} kg`}
                  sublabel={`~${wastePercent}% waste ratio`}
                  accent="clay"
                />
                <StatCard
                  label="Model Confidence"
                  value={prediction.confidence || 'High'}
                  sublabel={`Sample: ${prediction.sampleSize ?? 30} entries`}
                  accent="turmeric"
                />
              </div>
            </div>

            {/* MANAGER FINAL PREPARATION DECISION CARD */}
            <div className="bg-paper rounded-2xl border-2 border-forest p-6 shadow-soft space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-ink/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⭐</span>
                  <div>
                    <h4 className="font-display font-bold text-lg text-ink">
                      FINAL PREPARATION TARGET DECISION FOR {mealType.toUpperCase()}
                    </h4>
                    <p className="text-xs text-ink/60">
                      Transparent decision rule combining Live Kitchen Demand and AI Historical Forecast.
                    </p>
                  </div>
                </div>

                <div className="bg-forest text-paper px-4 py-2 rounded-xl text-center shadow-soft shrink-0">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wide">PREPARE TARGET</div>
                  <div className="font-display font-bold text-2xl leading-none mt-0.5">
                    {currentPrepIntel.target} Meals
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="bg-forest/5 p-3 rounded-xl border border-forest/15">
                  <div className="text-[10px] uppercase font-bold text-forest">1. LIVE KITCHEN DEMAND</div>
                  <div className="font-display text-xl font-bold text-ink mt-1">{currentFinalDemand} Diners</div>
                  <div className="text-[10px] text-ink/60 mt-0.5">Students ({currentExpectedStudentDiners}) + Visitors ({currentVisitorPasses})</div>
                </div>

                <div className="bg-turmeric/5 p-3 rounded-xl border border-turmeric/20">
                  <div className="text-[10px] uppercase font-bold text-turmeric-dark">2. AI REC. PREPARATION</div>
                  <div className="font-display text-xl font-bold text-ink mt-1">{currentAIRecommended} Meals</div>
                  <div className="text-[10px] text-ink/60 mt-0.5">Weighted 30d trend + 5% buffer</div>
                </div>

                <div className="bg-sage/10 p-3 rounded-xl border border-sage/20">
                  <div className="text-[10px] uppercase font-bold text-forest">3. DECISION RATIONALE</div>
                  <div className="text-[11px] text-ink/80 leading-relaxed font-sans font-medium mt-1">
                    {currentPrepIntel.rationale}
                  </div>
                </div>
              </div>

              {/* MANAGER KITCHEN INSIGHT BOX */}
              <div className="bg-turmeric/10 border border-turmeric/30 rounded-xl p-3.5 flex items-start gap-3 text-xs">
                <span className="text-lg">💡</span>
                <div>
                  <strong className="font-bold text-ink block mb-0.5">Kitchen Manager Intelligence Insight:</strong>
                  <span className="text-ink/80">{currentPrepIntel.insight}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LIVE KITCHEN ACTIVITY FEED & VISITOR MEALS */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* LIVE ACTIVITY FEED */}
        <div className="bg-cardcream rounded-card border border-ink/10 p-6 space-y-4 shadow-soft">
          <div className="flex items-center justify-between border-b border-ink/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔔</span>
              <h3 className="font-display font-bold text-base text-ink">Live Kitchen Activity Feed</h3>
            </div>
            <span className="text-[10px] font-mono text-forest font-semibold bg-forest/10 px-2.5 py-0.5 rounded-full">
              Real-time Polling
            </span>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
            {managerNotifications.length === 0 ? (
              <p className="text-xs text-ink/50 italic text-center py-8">No kitchen alerts recorded yet.</p>
            ) : (
              managerNotifications.slice(0, 10).map((n) => (
                <div key={n._id} className="bg-paper rounded-xl border border-ink/10 p-3.5 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-ink">{n.title}</span>
                    <span className="text-[10px] font-mono text-ink/40">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {n.senderStudent && (
                    <div className="text-[11px] font-mono text-turmeric-dark font-semibold">
                      👤 {n.senderStudent.name} (Room {n.senderStudent.roomNumber || '101'})
                    </div>
                  )}

                  <p className="text-ink/75 leading-relaxed text-[11px]">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AUTHORITATIVE TODAY'S VISITOR MEAL BREAKDOWN */}
        <div className="bg-cardcream rounded-card border border-ink/10 p-6 space-y-4 shadow-soft">
          <div className="flex items-center justify-between border-b border-ink/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎟️</span>
              <h3 className="font-display font-bold text-base text-ink">Today's Visitor Pass Summary</h3>
            </div>
            <span className="text-xs font-mono font-bold text-forest bg-forest/10 px-3 py-1 rounded-full border border-forest/20">
              Total Revenue: ₹{totalVisitorRevenueToday}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {MEALS.map((m) => {
              const countObj = bookingCounts.find((b) => b._id === m);
              const passes = countObj?.visitorPasses || 0;
              const rev = countObj?.visitorRevenue || 0;
              return (
                <div key={m} className="bg-paper rounded-xl border border-ink/10 p-3.5 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-ink">{MEAL_ICONS[m]} {m}</span>
                    <span className="font-mono font-bold text-forest">₹{rev}</span>
                  </div>
                  <div className="text-[11px] font-mono text-ink/60">
                    🎟️ {passes} {passes === 1 ? 'pass' : 'passes'} issued
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-paper rounded-xl border border-ink/10 p-4 text-xs font-mono text-ink/70 flex items-center justify-between">
            <span>Overall Visitor Passes Today:</span>
            <strong className="text-forest text-sm">{totalVisitorPassesToday} Passes</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

/* 2. FOOD ENTRY / DAILY MEAL CLOSING FORM COMPONENT */
const FoodEntryForm = ({ prefill, onClearPrefill }) => {
  const [form, setForm] = useState({
    date: todayISO(),
    mealType: 'Lunch',
    mealsBooked: '',
    mealsPrepared: '',
    mealsConsumed: '',
    foodWastedKg: '',
    wasteReason: 'none',
    notes: '',
    targetPreparation: '',
    expectedDiners: '',
    aiRecommendedPrep: '',
  });
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (prefill) {
      setForm((prev) => ({
        ...prev,
        date: prefill.date || todayISO(),
        mealType: prefill.mealType || 'Lunch',
        expectedDiners: prefill.expectedDiners ?? '',
        targetPreparation: prefill.targetPreparation ?? '',
        aiRecommendedPrep: prefill.aiRecommendedPrep ?? '',
        mealsBooked: prefill.expectedDiners ?? '',
      }));
    }
  }, [prefill]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/food-entries', form);
      setStatus('success');
      if (onClearPrefill) onClearPrefill();
    } catch (err) {
      setStatus(err.response?.data?.message || 'Could not save this entry.');
    }
  };

  return (
    <form onSubmit={submit} className="bg-cardcream rounded-card border border-ink/10 p-6 md:p-8 max-w-2xl space-y-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-2xl font-bold text-ink">LOG FOOD ENTRY / DAILY MEAL CLOSING</h3>
          <p className="text-xs text-ink/65">Record actual prepared, consumed, and wasted food to complete meal audit.</p>
        </div>
        {prefill && (
          <span className="text-xs font-mono bg-forest/10 text-forest border border-forest/20 px-3 py-1 rounded-full font-bold">
            ✓ Auto-Prefilled
          </span>
        )}
      </div>

      {/* PLANNING TARGET CONTEXT CARD */}
      {(form.targetPreparation || form.expectedDiners || form.aiRecommendedPrep) && (
        <div className="bg-paper rounded-2xl border border-forest/20 p-4 text-xs font-mono space-y-2">
          <div className="font-bold text-forest uppercase text-[10px]">🎯 PLANNING TARGET CONTEXT FOR AUDIT</div>
          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="bg-cardcream p-2 rounded-lg border border-ink/10">
              <div className="text-[9px] text-ink/50 uppercase font-bold">Expected Diners</div>
              <div className="font-bold text-ink text-sm mt-0.5">{form.expectedDiners || '—'}</div>
            </div>
            <div className="bg-cardcream p-2 rounded-lg border border-ink/10">
              <div className="text-[9px] text-ink/50 uppercase font-bold">AI Rec. Prep</div>
              <div className="font-bold text-turmeric-dark text-sm mt-0.5">{form.aiRecommendedPrep || '—'}</div>
            </div>
            <div className="bg-forest/10 p-2 rounded-lg border border-forest/20">
              <div className="text-[9px] text-forest uppercase font-bold">Target Prep</div>
              <div className="font-bold text-forest text-sm mt-0.5">{form.targetPreparation || '—'}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-2.5 focus:border-forest outline-none text-sm font-medium"
          />
        </div>
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
        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Meals booked / Expected</label>
          <input
            type="number"
            min="0"
            required
            value={form.mealsBooked}
            onChange={(e) => setForm({ ...form, mealsBooked: e.target.value, expectedDiners: e.target.value })}
            className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-2.5 focus:border-forest outline-none text-sm font-medium"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Actually Prepared</label>
          <input
            type="number"
            min="0"
            required
            value={form.mealsPrepared}
            onChange={(e) => setForm({ ...form, mealsPrepared: e.target.value })}
            className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-2.5 focus:border-forest outline-none text-sm font-medium"
            placeholder="e.g. 428"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Actually Consumed</label>
          <input
            type="number"
            min="0"
            required
            value={form.mealsConsumed}
            onChange={(e) => setForm({ ...form, mealsConsumed: e.target.value })}
            className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-2.5 focus:border-forest outline-none text-sm font-medium"
            placeholder="e.g. 421"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Food Wasted (kg)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            required
            value={form.foodWastedKg}
            onChange={(e) => setForm({ ...form, foodWastedKg: e.target.value })}
            className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-2.5 focus:border-forest outline-none text-sm font-medium"
            placeholder="e.g. 2.1"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Root cause (if wasted)</label>
          <select
            value={form.wasteReason}
            onChange={(e) => setForm({ ...form, wasteReason: e.target.value })}
            className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-2.5 focus:border-forest outline-none text-sm font-medium"
          >
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
          <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Audit Notes</label>
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-2.5 focus:border-forest outline-none text-sm font-medium"
            placeholder="Optional kitchen manager notes for this meal audit..."
          />
        </div>
      </div>

      <button className="w-full py-3.5 rounded-full bg-forest text-paper font-semibold hover:bg-forest-dark transition-colors shadow-soft text-sm cursor-pointer">
        Save &amp; Complete Meal Audit →
      </button>

      {status === 'success' && <p className="text-xs text-forest font-semibold text-center bg-forest/10 p-3 rounded-xl">✓ Meal audit saved successfully!</p>}
      {status && status !== 'success' && <p className="text-xs text-clay font-semibold text-center bg-clay/10 p-3 rounded-xl">{status}</p>}
    </form>
  );
};

/* 3. WASTE ANALYTICS & KITCHEN AUDIT COMPONENT */
const WasteAnalytics = () => {
  const [summary, setSummary] = useState(null);
  const [performanceRecords, setPerformanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const to = todayISO();
    const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    Promise.all([
      api.get('/analytics/waste', { params: { from, to } }),
      api.get('/analytics/performance', { params: { from, to } }),
    ]).then(([wasteRes, perfRes]) => {
      setSummary(wasteRes.data);
      setPerformanceRecords(perfRes.data || []);
      setLoading(false);
    });
  }, []);

  if (loading || !summary) return <Loader label="Loading kitchen performance & waste audit data..." />;

  const chartData = summary.trend.map((t) => ({
    date: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    kg: t.foodWastedKg,
  }));

  const reasonData = Object.entries(summary.reasonBreakdown).map(([reason, kg]) => ({
    reason: reason.replace('_', ' '),
    kg: Math.round(kg * 100) / 100,
  }));

  // Calculate Average Accuracies from historical records
  const validTargetRecords = performanceRecords.filter((p) => p.targetAccuracyPercentage !== null);
  const avgTargetAccuracy = validTargetRecords.length
    ? Math.round((validTargetRecords.reduce((s, p) => s + p.targetAccuracyPercentage, 0) / validTargetRecords.length) * 10) / 10
    : 100;

  const validAIRecords = performanceRecords.filter((p) => p.aiAccuracyPercentage !== null);
  const avgAIAccuracy = validAIRecords.length
    ? Math.round((validAIRecords.reduce((s, p) => s + p.aiAccuracyPercentage, 0) / validAIRecords.length) * 10) / 10
    : 100;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">30-DAY KITCHEN PERFORMANCE &amp; WASTE AUDIT</h2>
        <p className="text-xs text-ink/65">Historical execution accuracy, financial loss, carbon footprint, and meal closing logs.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Waste (30d)" value={`${summary.totalWasteKg} kg`} accent="clay" />
        <StatCard label="Target Execution Acc." value={`${avgTargetAccuracy}%`} accent="forest" sublabel="Prepared vs. Target" />
        <StatCard label="AI Forecast Acc." value={`${avgAIAccuracy}%`} accent="turmeric" sublabel="AI Rec vs. Consumed" />
        <StatCard label="Estimated Cost Lost" value={`₹${summary.estimatedCostLost}`} accent="sage" sublabel={`${summary.estimatedCarbonKg} kg CO₂e`} />
      </div>

      {/* HISTORICAL PERFORMANCE AUDIT TABLE */}
      <div className="bg-cardcream rounded-card border border-ink/10 p-6 space-y-4 shadow-soft">
        <div className="flex items-center justify-between border-b border-ink/10 pb-3">
          <div>
            <h3 className="font-display font-bold text-lg text-ink">Daily Kitchen Closing Performance Audit</h3>
            <p className="text-xs text-ink/60">Meal-by-meal audit comparing planned targets vs. actual prepared and consumed food.</p>
          </div>
          <span className="text-xs font-mono font-bold text-forest bg-forest/10 px-3 py-1 rounded-full">
            {performanceRecords.length} Audited Meals
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs font-body border-collapse">
            <thead>
              <tr className="border-b border-ink/15 text-ink/50 uppercase font-mono text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Meal</th>
                <th className="py-2.5 px-3">Expected</th>
                <th className="py-2.5 px-3">Target</th>
                <th className="py-2.5 px-3">Prepared</th>
                <th className="py-2.5 px-3">Consumed</th>
                <th className="py-2.5 px-3">Waste (kg)</th>
                <th className="py-2.5 px-3">Cost Lost</th>
                <th className="py-2.5 px-3">Target Acc.</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {performanceRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-ink/50 italic font-mono text-xs">
                    No closed meal audit records found yet.
                  </td>
                </tr>
              ) : (
                performanceRecords.map((p) => (
                  <tr key={p._id} className="hover:bg-paper/50 transition-colors font-mono">
                    <td className="py-3 px-3 font-semibold text-ink">
                      {new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 px-3 font-bold text-forest flex items-center gap-1">
                      <span>{MEAL_ICONS[p.mealType]}</span>
                      <span>{p.mealType}</span>
                    </td>
                    <td className="py-3 px-3 text-ink/70">{p.expectedDiners ?? '—'}</td>
                    <td className="py-3 px-3 font-bold text-ink">{p.targetPreparation ?? '—'}</td>
                    <td className="py-3 px-3 font-bold text-forest">{p.mealsPrepared}</td>
                    <td className="py-3 px-3 text-ink/80">{p.mealsConsumed}</td>
                    <td className="py-3 px-3 text-clay font-bold">{p.foodWastedKg} kg</td>
                    <td className="py-3 px-3 text-turmeric-dark">₹{p.estimatedCostLost}</td>
                    <td className="py-3 px-3 font-bold">
                      {p.targetAccuracyPercentage !== null ? `${p.targetAccuracyPercentage}%` : '—'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-paper border border-ink/10 whitespace-nowrap">
                        {p.statusLabel}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TREND CHARTS */}
      <div className="bg-cardcream rounded-card border border-ink/10 p-6 shadow-soft">
        <h3 className="font-display text-lg font-bold text-ink mb-4">Waste Trend (Last 30 Days)</h3>
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

      <div className="bg-cardcream rounded-card border border-ink/10 p-6 shadow-soft">
        <h3 className="font-display text-lg font-bold text-ink mb-4">Waste by Root Cause</h3>
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

/* 4. MANAGE MENU COMPONENT */
const ManageMenu = () => {
  const [form, setForm] = useState({ dayOfWeek: 'Monday', mealType: 'Lunch', items: '', price: 40 });
  const [menu, setMenu] = useState([]);
  const [status, setStatus] = useState('');

  const load = () => api.get('/menu').then((res) => setMenu(res.data));
  useEffect(() => {
    load();
  }, []);

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
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">MANAGE WEEKLY MENU &amp; PRICING</h2>
        <p className="text-xs text-ink/65">Set daily recipes and visitor pricing for each meal slot.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <form onSubmit={submit} className="bg-cardcream rounded-card border border-ink/10 p-6 md:p-8 space-y-4 h-fit shadow-soft">
          <h3 className="font-display text-xl font-bold text-ink">Set a Menu Slot</h3>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.dayOfWeek}
              onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
              className="rounded-xl border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none text-xs font-medium"
            >
              {days.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select
              value={form.mealType}
              onChange={(e) => setForm({ ...form, mealType: e.target.value })}
              className="rounded-xl border border-ink/15 bg-paper px-3 py-2.5 focus:border-forest outline-none text-xs font-medium"
            >
              {MEALS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <input
            value={form.items}
            onChange={(e) => setForm({ ...form, items: e.target.value })}
            placeholder="Dal, Rice, Roti (comma separated)"
            className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-2.5 focus:border-forest outline-none text-sm font-medium"
          />
          <input
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-2.5 focus:border-forest outline-none text-sm font-medium"
            placeholder="Visitor Price (₹)"
          />
          <button className="w-full py-3 rounded-full bg-forest text-paper font-semibold hover:bg-forest-dark transition-colors shadow-soft text-sm cursor-pointer">
            Save Slot →
          </button>
          {status === 'success' && <p className="text-xs text-forest font-semibold text-center bg-forest/10 p-2 rounded-lg">✓ Menu slot saved!</p>}
        </form>

        <div className="space-y-2.5 max-h-[440px] overflow-y-auto scrollbar-thin pr-1">
          {menu.map((m) => (
            <div key={m._id} className="bg-cardcream rounded-xl border border-ink/10 p-4 flex justify-between items-center text-xs shadow-soft">
              <div>
                <span className="font-display font-bold text-ink">{m.dayOfWeek} · {m.mealType}</span>
                <span className="text-ink/60"> — {m.items.join(', ')}</span>
              </div>
              <span className="font-mono font-bold text-forest bg-forest/10 px-2.5 py-1 rounded-full border border-forest/20 shrink-0">
                ₹{m.price}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* 5. FEEDBACK SUMMARY COMPONENT */
const FeedbackSummary = () => {
  const [summary, setSummary] = useState(null);
  useEffect(() => {
    api.get('/analytics/feedback').then((res) => setSummary(res.data));
  }, []);

  if (!summary) return <Loader label="Summarizing student feedback..." />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">STUDENT FEEDBACK &amp; SENTIMENT</h2>
        <p className="text-xs text-ink/65">Aggregated student ratings and common comment keywords.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Feedback" value={summary.totalFeedback} accent="forest" />
        <StatCard label="Avg. Taste" value={`${summary.avgTaste} / 5`} accent="turmeric" />
        <StatCard label="Avg. Cleanliness" value={`${summary.avgCleanliness} / 5`} accent="sage" />
        <StatCard label="Avg. Service Speed" value={`${summary.avgService} / 5`} accent="clay" />
      </div>

      <div className="bg-cardcream rounded-card border border-ink/10 p-6 shadow-soft space-y-3">
        <h3 className="font-display text-lg font-bold text-ink">Most Mentioned Keywords</h3>
        <div className="flex flex-wrap gap-2">
          {summary.topKeywords.map((k) => (
            <span key={k.word} className="px-3.5 py-1.5 rounded-full bg-turmeric/15 text-turmeric-dark text-xs font-semibold border border-turmeric/30">
              {k.word} <span className="text-ink/40 font-mono">×{k.count}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="bg-cardcream rounded-card border border-ink/10 p-6 shadow-soft space-y-3">
        <h3 className="font-display text-lg font-bold text-ink">Recent Student Comments</h3>
        <div className="space-y-2.5 max-h-72 overflow-y-auto scrollbar-thin pr-1">
          {summary.recent.map((f) => (
            <div key={f._id} className="text-xs border-b border-ink/10 pb-2.5">
              <span className="font-bold text-ink">{f.user?.name || 'Student'}</span> on <strong className="text-forest">{f.mealType}</strong>:{' '}
              <span className="text-ink/80 italic">"{f.comment || 'No comment provided.'}"</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MessDashboard;
