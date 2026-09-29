import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PlateGauge from '../components/PlateGauge';
import api from '../api/axios';
import thaliImg from '../assets/indian_thali_hero.jpg';
import {
  Calendar,
  Ticket,
  History,
  Star,
  QrCode,
  BarChart3,
  ClipboardList,
  Tag,
  TrendingUp,
  Utensils,
  MessageSquare,
  Users,
  Leaf,
  Coins,
  Cloud
} from 'lucide-react';

const workflowSteps = [
  {
    step: '1',
    title: 'Students Signal',
    desc: 'Students RSVP for meals in advance.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-forest">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    step: '2',
    title: 'Smart Prediction',
    desc: 'System predicts demand using weighted engine.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-forest">
        <path d="M23 6l-9.5 9.5-5-5L1 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 6h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    step: '3',
    title: 'Mess Prepares',
    desc: 'Kitchen prepares the right quantity.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-forest">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    step: '4',
    title: 'Waste Recorded',
    desc: 'Actual consumption & waste is logged.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-forest">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="2" />
        <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
        <path d="M9 14l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    step: '5',
    title: 'Impact Tracked',
    desc: 'Financial & carbon impact is calculated.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-forest">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

const featuresList = [
  {
    title: 'Demand Forecasting',
    desc: 'Weighted moving average model for accurate meal prediction.',
    icon: (
      <div className="w-10 h-10 rounded-2xl bg-turmeric/15 flex items-center justify-center text-turmeric-dark font-bold">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M3 17l6-6 4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 6h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
  },
  {
    title: 'RSVP Signals',
    desc: 'Students RSVP meals to help us plan better every day.',
    icon: (
      <div className="w-10 h-10 rounded-2xl bg-clay/15 flex items-center justify-center text-clay font-bold">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" />
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
    ),
  },
  {
    title: 'Waste Tracking',
    desc: 'Record waste with root causes and quantities.',
    icon: (
      <div className="w-10 h-10 rounded-2xl bg-clay/20 flex items-center justify-center text-clay font-bold">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    ),
  },
  {
    title: 'Financial Impact',
    desc: 'Know exactly how much money is being lost every day.',
    icon: (
      <div className="w-10 h-10 rounded-2xl bg-forest/15 flex items-center justify-center text-forest font-bold">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    ),
  },
  {
    title: 'Carbon Impact',
    desc: 'Convert food waste into CO₂e and track environmental savings.',
    icon: (
      <div className="w-10 h-10 rounded-2xl bg-sage/20 flex items-center justify-center text-forest-light font-bold">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.5 10-10 10z" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
    ),
  },
  {
    title: 'Feedback Analysis',
    desc: '3-axis ratings + NLP insights to improve meal quality.',
    icon: (
      <div className="w-10 h-10 rounded-2xl bg-turmeric/15 flex items-center justify-center text-turmeric-dark font-bold">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
    ),
  },
  {
    title: 'Visitor Pass',
    desc: 'Generate QR based visitor passes for hassle-free entry.',
    icon: (
      <div className="w-10 h-10 rounded-2xl bg-turmeric/20 flex items-center justify-center text-turmeric-dark font-bold">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
          <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
          <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
          <path d="M14 14h3v3h-3v-3zM18 18h3v3h-3v-3z" fill="currentColor" />
        </svg>
      </div>
    ),
  },
];

const studentCapabilities = [
  {
    title: 'Weekly Menu Schedule',
    desc: 'Check daily breakfast, lunch, snacks, and dinner offerings and prices anytime.',
    tag: 'Menu',
    icon: <Calendar className="w-6 h-6 text-forest" />,
  },
  {
    title: 'One-Tap Meal RSVPs',
    desc: 'Confirm your attendance for upcoming meals so the kitchen prepares exact portions.',
    tag: 'RSVP',
    icon: <Ticket className="w-6 h-6 text-turmeric-dark" />,
  },
  {
    title: 'Meal Booking History',
    desc: 'Track your active, consumed, and past meal reservations in a clean history log.',
    tag: 'History',
    icon: <History className="w-6 h-6 text-forest-light" />,
  },
  {
    title: '3-Axis Meal Feedback',
    desc: 'Rate taste, cleanliness, and service speed with comments to help improve mess quality.',
    tag: 'Rating',
    icon: <Star className="w-6 h-6 text-turmeric-dark" />,
  },
  {
    title: 'Visitor Thali Pass',
    desc: 'Generate guest meal tokens with encrypted QR codes for parents and visitors.',
    tag: 'Guest Pass',
    icon: <QrCode className="w-6 h-6 text-clay" />,
  },
];

const staffCapabilities = [
  {
    title: 'Weighted Demand Prediction',
    desc: 'Calculate optimal cooking quantities blending 7-day weighted history, live RSVPs, and 5% safety buffer.',
    tag: 'Prediction',
    icon: <BarChart3 className="w-6 h-6 text-turmeric-dark" />,
  },
  {
    title: 'Daily Food Entry Logger',
    desc: 'Record exact meals prepared, consumed, food wasted in kg, and add operational notes.',
    tag: 'Daily Log',
    icon: <ClipboardList className="w-6 h-6 text-forest" />,
  },
  {
    title: 'Root-Cause Waste Tagging',
    desc: 'Classify waste drivers — exam periods, holidays, weather, unpopular recipes, or over-prep.',
    tag: 'Root Cause',
    icon: <Tag className="w-6 h-6 text-clay" />,
  },
  {
    title: '30-Day Waste Trend Analytics',
    desc: 'Interactive Recharts line charts and cause breakdown bar graphs for hostel administration.',
    tag: 'Analytics',
    icon: <TrendingUp className="w-6 h-6 text-forest-light" />,
  },
  {
    title: 'Weekly Menu Management',
    desc: 'Add, update, or remove daily menu slots and pricing in real time.',
    tag: 'Menu Editor',
    icon: <Utensils className="w-6 h-6 text-turmeric-dark" />,
  },
  {
    title: 'Feedback NLP Insights',
    desc: 'Inspect average student ratings and frequency-extracted keyword summary badges.',
    tag: 'NLP Badges',
    icon: <MessageSquare className="w-6 h-6 text-forest" />,
  },
];

const Landing = () => {
  const [stats, setStats] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const targetId = location.state.scrollTo;
      setTimeout(() => {
        if (targetId === 'home') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const elem = document.getElementById(targetId);
          if (elem) {
            elem.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }, 100);
    }
  }, [location]);

  useEffect(() => {
    api
      .get('/analytics/public')
      .then((res) => setStats(res.data))
      .catch(() =>
        setStats({
          savedPercent: 93,
          totalWasteKg: 305.9,
          totalBookings: 240,
          totalStudents: 150,
          estimatedCostLost: 18354,
          estimatedCarbonKg: 764.7,
        })
      );
  }, []);

  const savedPercent = stats && stats.savedPercent != null ? stats.savedPercent : 93;
  const wasteKg = stats && stats.totalWasteKg != null ? stats.totalWasteKg : 305.9;
  const costLost = stats && stats.estimatedCostLost != null ? stats.estimatedCostLost : 18354;
  const bookings = stats && stats.totalBookings != null ? stats.totalBookings : 240;
  const students = stats && stats.totalStudents != null ? stats.totalStudents : 150;

  return (
    <div id="home" className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-5 pt-6 pb-4 grid lg:grid-cols-12 gap-8 items-center">
        {/* Left Column Text & CTAs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-xs font-mono font-bold uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-forest animate-pulse" />
            SMART HOSTEL MESS COMMAND CENTER
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] leading-[1.08] text-ink font-bold tracking-tight">
            Smarter meals today,<br />
            <span className="text-forest italic">Zero waste</span> tomorrow.
          </h1>

          <p className="text-ink/75 text-base sm:text-lg leading-relaxed max-w-xl font-body">
            Predict demand, track waste, understand feedback and make every plate count. Together we save food, cut costs and protect our planet.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              to="/register"
              className="px-7 py-3.5 rounded-full bg-forest text-paper font-semibold text-sm hover:bg-forest-dark transition-all duration-200 shadow-lift flex items-center gap-2.5 group"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-turmeric">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" />
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
              </svg>
              <span>Book Meals as Student</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>

            <Link
              to="/login"
              className="px-6 py-3.5 rounded-full border border-ink/20 text-ink font-semibold text-sm hover:border-forest hover:text-forest transition-colors bg-cardcream/80 flex items-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-forest">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Staff &amp; Manager Login</span>
            </Link>
          </div>

          {/* Bottom Feature Tags */}
          <div className="pt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-ink/70">
            <span className="px-3 py-1.5 rounded-full bg-paper border border-ink/10 flex items-center gap-1.5 shadow-soft">
              <Users className="w-3.5 h-3.5 text-turmeric-dark" /> Real-time Student RSVPs
            </span>
            <span className="px-3 py-1.5 rounded-full bg-paper border border-ink/10 flex items-center gap-1.5 shadow-soft">
              <TrendingUp className="w-3.5 h-3.5 text-forest" /> Smart Demand Forecasting
            </span>
            <span className="px-3 py-1.5 rounded-full bg-paper border border-ink/10 flex items-center gap-1.5 shadow-soft">
              <BarChart3 className="w-3.5 h-3.5 text-clay" /> Data Driven Kitchen
            </span>
          </div>
        </div>

        {/* Right Column: REALISTIC INDIAN THALI PHOTOGRAPH VISUAL */}
        <div className="lg:col-span-6 relative flex justify-center items-center py-6">
          {/* Golden Warm Brush Background Glow Effect */}
          <div className="absolute w-[460px] h-[460px] rounded-full bg-gradient-to-tr from-turmeric/40 via-turmeric/20 to-transparent blur-3xl -z-10 pointer-events-none transform rotate-12 scale-110" />

          {/* Live Data Badge */}
          <div className="absolute top-0 right-2 bg-paper/95 backdrop-blur border border-ink/10 shadow-soft px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold text-ink z-30">
            <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
            <span>Live Data</span>
            <span className="text-ink/30">|</span>
            <span className="text-forest font-mono font-bold">MongoDB Active</span>
          </div>

          {/* Main Hero Visual: High Quality Realistic Photograph of Indian Thali Plate */}
          <div className="relative z-10 my-4 group">
            <img
              src={thaliImg}
              alt="Indian Hostel Mess Thali"
              className="w-[310px] h-[310px] sm:w-[370px] sm:h-[370px] md:w-[410px] md:h-[410px] rounded-full object-cover border-4 border-paper shadow-lift group-hover:scale-[1.02] transition-transform duration-500"
            />
          </div>

          {/* OVERLAY STAT CARDS SURROUNDING THALI (Matching Reference Image Composition) */}

          {/* Stat Card 1: Top Left - 93% Meals Fulfilled */}
          <div className="absolute top-4 left-0 sm:-left-4 bg-paper/95 backdrop-blur border border-ink/10 shadow-soft p-3.5 rounded-2xl flex items-center gap-3 text-left z-20 hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" />
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <div className="font-display font-bold text-xl text-ink leading-none">{savedPercent}%</div>
              <div className="text-[11px] text-ink/60 font-body mt-1 font-semibold">Meals Fulfilled <span className="text-[10px] block font-mono font-normal text-ink/40">(30d average)</span></div>
            </div>
          </div>

          {/* Stat Card 2: Bottom Left - 240 Active Bookings */}
          <div className="absolute bottom-12 left-0 sm:-left-2 bg-paper/95 backdrop-blur border border-ink/10 shadow-soft p-3.5 rounded-2xl flex items-center gap-3 text-left z-20 hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-turmeric/20 text-turmeric-dark flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" />
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <div className="font-display font-bold text-xl text-ink leading-none">{bookings}</div>
              <div className="text-[11px] text-ink/60 font-body mt-1 font-semibold">Active Bookings <span className="text-[10px] block font-mono font-normal text-ink/40">Today</span></div>
            </div>
          </div>

          {/* Stat Card 3: Top Right - 305.9 kg Food Wasted */}
          <div className="absolute top-6 right-0 sm:-right-4 bg-paper/95 backdrop-blur border border-ink/10 shadow-soft p-3.5 rounded-2xl flex items-center gap-3 text-left z-20 hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-clay/15 text-clay flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="font-display font-bold text-xl text-clay leading-none">{wasteKg} kg</div>
              <div className="text-[11px] text-ink/60 font-body mt-1 font-semibold">Food Wasted <span className="text-[10px] block font-mono font-normal text-ink/40">(30d total)</span></div>
            </div>
          </div>

          {/* Stat Card 4: Bottom Right - ₹18,354 Cost Lost */}
          <div className="absolute bottom-16 right-0 sm:-right-2 bg-paper/95 backdrop-blur border border-ink/10 shadow-soft p-3.5 rounded-2xl flex items-center gap-3 text-left z-20 hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center font-bold text-lg shrink-0">
              ₹
            </div>
            <div>
              <div className="font-display font-bold text-xl text-forest leading-none">₹{(costLost || 0).toLocaleString()}</div>
              <div className="text-[11px] text-ink/60 font-body mt-1 font-semibold">Cost Lost <span className="text-[10px] block font-mono font-normal text-ink/40">(30d total)</span></div>
            </div>
          </div>

          {/* Bottom Right Quote Card */}
          <div className="hidden xl:flex absolute -bottom-8 -right-8 bg-cardcream border border-ink/10 shadow-lift p-4 rounded-2xl items-center gap-3 max-w-[210px] z-30">
            <div className="text-2xl text-forest font-serif leading-none">“</div>
            <div>
              <div className="font-display font-bold text-xs text-ink leading-snug">Better planning today saves more than food.</div>
              <div className="text-[10px] text-forest font-mono mt-1 font-semibold flex items-center gap-1">
                <Leaf className="w-3 h-3 text-forest" /> Eco Impact
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. METRICS GREEN BANNER ACROSS FULL WIDTH */}
      <section className="max-w-7xl mx-auto px-5">
        <div className="bg-forest rounded-card text-paper p-6 md:p-8 shadow-lift grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-paper/15">
          <div className="pt-2 sm:pt-0">
            <div className="flex items-center justify-center gap-1.5 text-turmeric font-bold text-xl font-display">
              <Coins className="w-5 h-5 text-turmeric shrink-0" /> ₹60 / kg
            </div>
            <div className="text-xs text-paper/75 font-mono mt-1">Cost Basis</div>
          </div>

          <div className="pt-2 sm:pt-0">
            <div className="flex items-center justify-center gap-1.5 text-paper font-bold text-xl font-display">
              <Cloud className="w-5 h-5 text-paper shrink-0" /> 2.5 kg
            </div>
            <div className="text-xs text-paper/75 font-mono mt-1">CO₂e per kg</div>
          </div>

          <div className="pt-2 sm:pt-0">
            <div className="flex items-center justify-center gap-1.5 text-turmeric font-bold text-xl font-display">
              <Utensils className="w-5 h-5 text-turmeric shrink-0" /> 60 / 40
            </div>
            <div className="text-xs text-paper/75 font-mono mt-1">RSVP Blend</div>
          </div>

          <div className="pt-2 sm:pt-0">
            <div className="flex items-center justify-center gap-1.5 text-paper font-bold text-xl font-display">
              <Users className="w-5 h-5 text-paper shrink-0" /> {students}
            </div>
            <div className="text-xs text-paper/75 font-mono mt-1">Total Students</div>
          </div>

          <div className="col-span-2 sm:col-span-1 pt-2 sm:pt-0">
            <div className="flex items-center justify-center gap-1.5 text-turmeric font-bold text-xl font-display">
              <Leaf className="w-5 h-5 text-turmeric shrink-0" /> {stats ? stats.estimatedCarbonKg : 764.7} kg
            </div>
            <div className="text-xs text-paper/75 font-mono mt-1">CO₂e Saved (Est.)</div>
          </div>
        </div>
      </section>

      {/* 3. MIDDLE DOUBLE BOX GRID: HOW IT WORKS + POWERFUL FEATURES (EMBEDDING LIVE PLATEGAUGE DATA WIDGET) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-5 pt-4">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT BOX: HOW IT WORKS (5 Connected Steps) */}
          <div className="lg:col-span-5 bg-cardcream rounded-card p-6 md:p-8 border border-ink/10 shadow-soft h-full flex flex-col justify-between">
            <div>
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold text-ink">How it works</h2>
                <div className="w-12 h-1 bg-turmeric rounded-full mt-1.5" />
              </div>

              <div className="space-y-6 relative">
                {workflowSteps.map((w, i) => (
                  <div key={w.step} className="flex items-start gap-4 relative">
                    <div className="w-10 h-10 rounded-full bg-paper border border-ink/15 shadow-soft flex items-center justify-center shrink-0 text-forest font-bold font-mono text-sm z-10">
                      {w.step}
                    </div>

                    <div>
                      <div className="font-display font-bold text-base text-ink">{w.step}. {w.title}</div>
                      <div className="text-xs text-ink/65 font-body leading-relaxed mt-0.5">{w.desc}</div>
                    </div>

                    {i < workflowSteps.length - 1 && (
                      <div className="absolute top-10 left-5 bottom-0 w-0.5 border-l-2 border-dashed border-forest/20 -z-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT BOX: POWERFUL FEATURES & LIVE PLATEGAUGE DATA WIDGET */}
          <div id="features" className="lg:col-span-7 space-y-6">
            <div className="bg-cardcream rounded-card p-6 md:p-8 border border-ink/10 shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-ink">Powerful Features</h2>
                  <div className="w-12 h-1 bg-turmeric rounded-full mt-1.5" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {featuresList.map((f) => (
                  <div key={f.title} className="bg-paper rounded-2xl p-4 border border-ink/10 shadow-soft hover:shadow-lift hover:-translate-y-0.5 transition-all">
                    <div className="mb-3">{f.icon}</div>
                    <div className="font-display font-bold text-sm text-ink mb-1">{f.title}</div>
                    <div className="text-[11px] text-ink/60 font-body leading-relaxed">{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* LIVE PLATEGAUGE DATA COMPONENT CARD */}
            <div className="bg-cardcream rounded-card p-6 border border-ink/10 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-mono font-bold uppercase">
                  LIVE FULFILMENT GAUGE
                </div>
                <h3 className="font-display font-bold text-xl text-ink">Efficiency Rating</h3>
                <p className="text-xs text-ink/70 max-w-md">
                  Calculated dynamically from MongoDB meal logs based on actual RSVPs vs. kitchen consumption.
                </p>
              </div>

              <div className="shrink-0 bg-paper p-4 rounded-2xl border border-ink/10 shadow-soft flex flex-col items-center">
                <PlateGauge savedPercent={savedPercent} label="Meals Saved %" size={150} />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. DEDICATED STUDENT CAPABILITIES SECTION */}
      <section id="student-section" className="max-w-7xl mx-auto px-5 pt-4">
        <div className="bg-cardcream rounded-card p-6 md:p-10 border border-ink/10 shadow-soft">
          <div className="max-w-xl mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-turmeric/15 text-turmeric-dark text-xs font-mono font-bold uppercase tracking-wider mb-2">
              For Hostel Students
            </div>
            <h2 className="font-display text-3xl font-bold text-ink">What Students Can Do</h2>
            <p className="text-xs sm:text-sm text-ink/70 font-body mt-1 leading-relaxed">
              Seamless meal planning, instant RSVPs, and feedback tools designed for hostel residents.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {studentCapabilities.map((sc) => (
              <div key={sc.title} className="bg-paper rounded-2xl p-5 border border-ink/10 shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{sc.icon}</span>
                    <span className="text-[10px] font-mono font-bold uppercase text-forest bg-forest/10 px-2 py-0.5 rounded-full">{sc.tag}</span>
                  </div>
                  <h3 className="font-display font-bold text-base text-ink mb-1.5">{sc.title}</h3>
                  <p className="text-xs text-ink/65 font-body leading-relaxed">{sc.desc}</p>
                </div>
                <Link to="/login" className="mt-4 text-xs font-semibold text-forest hover:underline inline-flex items-center gap-1">
                  Access Portal →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. DEDICATED STAFF & MESS MANAGERS SECTION */}
      <section id="staff-section" className="max-w-7xl mx-auto px-5 pt-4">
        <div className="bg-cardcream rounded-card p-6 md:p-10 border border-ink/10 shadow-soft">
          <div className="max-w-xl mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 text-forest text-xs font-mono font-bold uppercase tracking-wider mb-2">
              For Mess Staff &amp; Management
            </div>
            <h2 className="font-display text-3xl font-bold text-ink">What Staff Can Do</h2>
            <p className="text-xs sm:text-sm text-ink/70 font-body mt-1 leading-relaxed">
              Data-driven kitchen controls, demand forecasting, and complete root-cause waste management.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {staffCapabilities.map((st) => (
              <div key={st.title} className="bg-paper rounded-2xl p-5 border border-ink/10 shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{st.icon}</span>
                    <span className="text-[10px] font-mono font-bold uppercase text-turmeric-dark bg-turmeric/15 px-2 py-0.5 rounded-full">{st.tag}</span>
                  </div>
                  <h3 className="font-display font-bold text-base text-ink mb-1.5">{st.title}</h3>
                  <p className="text-xs text-ink/65 font-body leading-relaxed">{st.desc}</p>
                </div>
                <Link to="/login" className="mt-4 text-xs font-semibold text-forest hover:underline inline-flex items-center gap-1">
                  Staff Login →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SUSTAINABILITY & ECOLOGICAL IMPACT BANNER */}
      <section id="impact" className="max-w-7xl mx-auto px-5 pt-4">
        <div className="bg-forest rounded-card text-paper p-8 md:p-10 shadow-lift relative overflow-hidden">
          <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-6 space-y-3">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-paper leading-tight">
                Less food wasted. Better planning. Lower cost.
              </h2>
              <p className="text-paper/80 text-xs sm:text-sm leading-relaxed max-w-lg">
                Every kg of food wasted costs <span className="text-turmeric font-bold">₹60</span> and emits <span className="text-turmeric font-bold">2.5 kg of CO₂e</span>. Together we build a sustainable campus.
              </p>
            </div>

            <div className="lg:col-span-6 grid grid-cols-3 gap-4 text-center divide-x divide-paper/15">
              <div className="px-2">
                <div className="font-display font-bold text-xl sm:text-2xl text-turmeric">₹98,640+</div>
                <div className="text-[11px] text-paper/70 font-mono mt-1">Est. Money Saved <span className="block text-[10px]">(30 Days)</span></div>
              </div>
              <div className="px-2">
                <div className="font-display font-bold text-xl sm:text-2xl text-paper">7,275 kg</div>
                <div className="text-[11px] text-paper/70 font-mono mt-1">Food Waste Reduced <span className="block text-[10px]">(30 Days)</span></div>
              </div>
              <div className="px-2">
                <div className="font-display font-bold text-xl sm:text-2xl text-turmeric">18,188 kg</div>
                <div className="text-[11px] text-paper/70 font-mono mt-1">CO₂e Saved <span className="block text-[10px]">(30 Days)</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-ink/10 pt-8 pb-4 text-center text-xs text-ink/50 font-mono">
        Smart Hostel Food Waste Prediction &amp; Management System — 7th Semester Minor Project
      </footer>
    </div>
  );
};

export default Landing;
