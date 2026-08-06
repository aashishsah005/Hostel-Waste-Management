import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PlateGauge from '../components/PlateGauge';
import api from '../api/axios';

const features = [
  {
    title: 'Meal booking',
    desc: 'Students confirm breakfast, lunch, snacks or dinner a day ahead, giving the kitchen a real signal instead of a guess.',
    tag: '01',
  },
  {
    title: 'Demand prediction',
    desc: 'Historical consumption is weighted and blended with live bookings to recommend how much to actually cook.',
    tag: '02',
  },
  {
    title: 'Waste & root-cause logging',
    desc: 'Every entry is tagged — exam period, holiday, unpopular menu — so patterns in waste become visible, not anecdotal.',
    tag: '03',
  },
  {
    title: 'Cost & carbon dashboard',
    desc: 'Kilograms saved translate automatically into money saved and an estimated emissions reduction.',
    tag: '04',
  },
  {
    title: 'Feedback & ratings',
    desc: 'Taste, cleanliness and service ratings roll up into a keyword summary the mess manager can act on.',
    tag: '05',
  },
  {
    title: 'Role-based access',
    desc: 'Admin, mess manager, student and visitor each see exactly the tools relevant to their day.',
    tag: '06',
  },
];

const workflow = [
  'Student books a meal',
  'Mess staff logs daily entry',
  'History builds in the database',
  'Prediction engine estimates demand',
  'Kitchen prepares to the recommendation',
  'Waste & feedback analysed on dashboards',
];

const stack = [
  { layer: 'Frontend', tools: 'React, Tailwind CSS, Recharts' },
  { layer: 'Backend', tools: 'Node.js, Express' },
  { layer: 'Database', tools: 'MongoDB (Mongoose)' },
  { layer: 'Auth', tools: 'JWT, bcrypt' },
  { layer: 'Prediction', tools: 'Weighted historical modelling' },
];

const Landing = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/analytics/public')
      .then((res) => setStats(res.data))
      .catch(() => setStats({ savedPercent: 85, totalWasteKg: 0, totalBookings: 0, estimatedCostLost: 0 }));
  }, []);

  const savedPercent = stats ? stats.savedPercent : 85;

  return (
    <div>
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-[1.2fr,0.8fr] gap-12 items-center">
        <div>
          <span className="inline-block text-xs uppercase tracking-[0.2em] text-turmeric-dark font-semibold mb-5">
            Smart Hostel Waste Management System
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-[3.4rem] leading-[1.08] text-ink">
            Every plate the mess prepares, <em className="text-forest not-italic">accounted for.</em>
          </h1>
          <p className="mt-6 text-ink/70 text-lg max-w-xl leading-relaxed">
            A smart hostel mess platform connected to MongoDB that predicts food demand, tracks waste down to the
            reason it happened, and turns kitchen guesswork into real-time data the whole hostel can
            trust.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3 rounded-full bg-forest text-paper font-semibold hover:bg-forest-dark transition-colors shadow-lift"
            >
              Book a meal as a student
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-full border border-ink/20 text-ink font-semibold hover:border-forest hover:text-forest transition-colors"
            >
              Staff log in
            </Link>
          </div>
        </div>

        <div className="bg-cardcream rounded-card shadow-lift p-8 flex flex-col items-center border border-ink/5">
          <PlateGauge savedPercent={savedPercent} label="Live MongoDB average meals saved vs. wasted" size={200} />
          <div className="grid grid-cols-2 gap-4 mt-6 w-full text-center">
            <div>
              <div className="font-display text-2xl text-forest">₹{stats ? stats.estimatedCostLost : 0}</div>
              <div className="text-xs text-ink/50 font-mono">Dynamic MongoDB Cost Lost</div>
            </div>
            <div>
              <div className="font-display text-2xl text-clay">{stats ? stats.totalWasteKg : 0} kg</div>
              <div className="text-xs text-ink/50 font-mono">Dynamic Food Wasted</div>
            </div>
          </div>
          {stats && (
            <div className="mt-4 pt-4 border-t border-ink/10 w-full grid grid-cols-2 text-center text-xs font-mono text-ink/60">
              <div>Bookings: <span className="font-bold text-forest">{stats.totalBookings}</span></div>
              <div>Students: <span className="font-bold text-forest">{stats.totalStudents}</span></div>
            </div>
          )}
        </div>
      </section>


      {/* PROBLEM */}
      <section className="bg-forest text-paper">
        <div className="max-w-6xl mx-auto px-5 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-turmeric font-semibold">The problem</span>
            <h2 className="font-display text-3xl md:text-4xl mt-3 leading-tight">
              Hostel messes cook by estimate — and estimates are expensive.
            </h2>
          </div>
          <p className="text-paper/80 leading-relaxed">
            Without real data on how many students will actually show up, kitchens either
            over-prepare and throw food away, or under-prepare and run short. This project
            replaces that guesswork with historical data, live bookings and a demand model —
            reducing waste, saving cost, and giving hostel administration a clear picture of
            where and why food is lost.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <span className="text-xs uppercase tracking-[0.2em] text-turmeric-dark font-semibold">What's inside</span>
        <h2 className="font-display text-3xl md:text-4xl mt-3 mb-12 max-w-2xl">
          A complete mess-management loop, not just another tracker.
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.tag} className="bg-cardcream rounded-card p-6 border border-ink/5 shadow-soft hover:shadow-lift transition-shadow">
              <span className="font-mono text-xs text-sage">{f.tag}</span>
              <h3 className="font-display text-xl mt-2 mb-2 text-ink">{f.title}</h3>
              <p className="text-sm text-ink/65 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="bg-cardcream border-y border-ink/10">
        <div className="max-w-6xl mx-auto px-5 py-20">
          <span className="text-xs uppercase tracking-[0.2em] text-turmeric-dark font-semibold">System workflow</span>
          <h2 className="font-display text-3xl md:text-4xl mt-3 mb-12 max-w-2xl">
            From a tapped "I'll be at dinner" to a chart the admin trusts.
          </h2>
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-0">
            {workflow.map((step, i) => (
              <React.Fragment key={step}>
                <div className="flex-1 bg-paper rounded-card p-5 border border-ink/10">
                  <span className="font-mono text-xs text-forest-light">Step {i + 1}</span>
                  <p className="font-display text-lg mt-1 text-ink">{step}</p>
                </div>
                {i < workflow.length - 1 && (
                  <div className="hidden md:flex items-center justify-center px-2 text-turmeric">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <span className="text-xs uppercase tracking-[0.2em] text-turmeric-dark font-semibold">Under the hood</span>
        <h2 className="font-display text-3xl md:text-4xl mt-3 mb-12 max-w-2xl">Built on the MERN stack.</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {stack.map((s) => (
            <div key={s.layer} className="rounded-card border border-ink/10 p-5 bg-cardcream">
              <div className="text-xs uppercase tracking-wide text-sage font-semibold mb-2">{s.layer}</div>
              <div className="font-display text-lg text-ink leading-snug">{s.tools}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-5 pb-24">
        <div className="bg-forest rounded-card text-paper p-10 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h2 className="font-display text-3xl md:text-4xl leading-tight">Ready to see your hostel's plate?</h2>
            <p className="text-paper/75 mt-3 max-w-md">
              Create a student account to book meals, or log in as staff to manage the kitchen and view analytics.
            </p>
          </div>
          <div className="flex gap-4 flex-wrap">
            <Link to="/register" className="px-6 py-3 rounded-full bg-turmeric text-ink font-semibold hover:bg-turmeric-light transition-colors">
              Create account
            </Link>
            <Link to="/login" className="px-6 py-3 rounded-full border border-paper/30 text-paper font-semibold hover:border-paper transition-colors">
              Log in
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink/10 py-8 text-center text-xs text-ink/50 font-mono">
        Smart Hostel Food Waste Prediction &amp; Management System — 7th Semester Minor Project
      </footer>
    </div>
  );
};

export default Landing;
