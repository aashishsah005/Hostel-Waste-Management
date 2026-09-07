import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import api from '../../api/axios';
import Loader from '../../components/Loader';
import StatCard from '../../components/StatCard';
import PlateGauge from '../../components/PlateGauge';
import {
  LayoutDashboard,
  GraduationCap,
  ChefHat,
  Palmtree,
  Ticket,
  TrendingUp,
  ShieldCheck,
  Ban,
  UserPlus,
  CreditCard,
  Sunrise,
  Sun,
  Coffee,
  Moon,
  Utensils
} from 'lucide-react';

const MEALS = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
const todayISO = () => new Date().toISOString().slice(0, 10);
const COLORS = ['#2F4B3C', '#DFA13B', '#A64B34', '#7C9473', '#3E6350', '#B87F24'];

const MEAL_ICONS = {
  Breakfast: <Sunrise className="w-4 h-4 text-turmeric-dark shrink-0" />,
  Lunch: <Sun className="w-4 h-4 text-forest shrink-0" />,
  Snacks: <Coffee className="w-4 h-4 text-turmeric-dark shrink-0" />,
  Dinner: <Moon className="w-4 h-4 text-forest-dark shrink-0" />,
};

const tabs = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4 shrink-0" /> },
  { id: 'students', label: 'Students', icon: <GraduationCap className="w-4 h-4 shrink-0" /> },
  { id: 'managers', label: 'Mess Managers', icon: <ChefHat className="w-4 h-4 shrink-0" /> },
  { id: 'vacations', label: 'Vacations', icon: <Palmtree className="w-4 h-4 shrink-0" /> },
  { id: 'visitors', label: 'Visitor Passes', icon: <Ticket className="w-4 h-4 shrink-0" /> },
  { id: 'analytics', label: 'System Analytics', icon: <TrendingUp className="w-4 h-4 shrink-0" /> },
];

const AdminDashboard = () => {
  const [tab, setTab] = useState('overview');
  const todayDateDisplay = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="max-w-6xl mx-auto px-5 py-8 space-y-8 font-body">
      {/* ADMIN CONTROL CENTER HEADER */}
      <div className="bg-cardcream rounded-card p-6 md:p-8 border border-ink/10 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/10 border border-forest/20 text-forest text-xs font-mono font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
            <span>Admin Control Center</span>
            <span className="text-ink/30">|</span>
            <span className="text-turmeric-dark font-semibold">System Administration</span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl text-ink font-bold tracking-tight">
            Hostel Mess Operations &amp; Governance
          </h1>
          <p className="text-ink/75 text-sm">
            Live system overview, student user management, manager accounts, vacations, and financial audit.
          </p>
        </div>

        <div className="bg-paper px-4 py-3 rounded-2xl border border-ink/10 text-right shadow-soft shrink-0">
          <div className="text-[10px] font-mono uppercase text-ink/50 font-bold">Today's Date</div>
          <div className="font-display font-bold text-base text-ink mt-0.5">{todayDateDisplay}</div>
          <div className="text-[10px] font-mono text-forest font-semibold mt-0.5 flex items-center justify-end gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-forest" /> Admin Authorized
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
      {tab === 'overview' && <OverviewTab />}
      {tab === 'students' && <StudentsTab />}
      {tab === 'managers' && <ManagersTab />}
      {tab === 'vacations' && <VacationsTab />}
      {tab === 'visitors' && <VisitorsTab />}
      {tab === 'analytics' && <AnalyticsTab />}
    </div>
  );
};

/* 1. OVERVIEW TAB */
const OverviewTab = () => {
  const [overview, setOverview] = useState(null);
  const [bookingCounts, setBookingCounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/users/admin-overview'),
      api.get('/bookings/counts', { params: { date: todayISO() } }),
    ])
      .then(([ovRes, countRes]) => {
        setOverview(ovRes.data);
        setBookingCounts(countRes.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading admin overview:', err);
        setLoading(false);
      });
  }, []);

  if (loading || !overview) return <Loader label="Compiling system overview metrics..." />;

  return (
    <div className="space-y-8">
      {/* 4 TOP SYSTEM SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Students"
          value={overview.totalStudents}
          sublabel={`${overview.activeStudents} Active · ${overview.inactiveStudents} Disabled`}
          accent="forest"
        />
        <StatCard
          label="Active Mess Managers"
          value={overview.activeManagers}
          sublabel="Hostel Staff Account"
          accent="turmeric"
        />
        <StatCard
          label="Today's Student Skips"
          value={overview.todaySkips}
          sublabel="Across 4 daily meals"
          accent="clay"
        />
        <StatCard
          label="Visitor Revenue Today"
          value={`₹${overview.todayVisitorRevenue}`}
          sublabel={`${overview.todayVisitorPasses} paid passes`}
          accent="sage"
        />
      </div>

      {/* 4-MEAL TODAY'S OVERVIEW TABLE */}
      <div className="bg-cardcream rounded-card border border-ink/10 p-6 space-y-4 shadow-soft">
        <div className="flex items-center justify-between border-b border-ink/10 pb-3">
          <div>
            <h3 className="font-display font-bold text-lg text-ink">Today's Meal Demand Overview</h3>
            <p className="text-xs text-ink/60">Live expected diners, skips, and visitor passes for today's meals.</p>
          </div>
          <span className="text-xs font-mono font-bold text-forest bg-forest/10 px-3 py-1 rounded-full border border-forest/20">
            Authoritative MongoDB Aggregation
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs font-body border-collapse">
            <thead>
              <tr className="border-b border-ink/15 text-ink/50 uppercase font-mono text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Meal Slot</th>
                <th className="py-2.5 px-3">Expected Students</th>
                <th className="py-2.5 px-3">Student Skips</th>
                <th className="py-2.5 px-3">Visitor Passes</th>
                <th className="py-2.5 px-3">Final Demand</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {MEALS.map((m) => {
                const countObj = bookingCounts.find((b) => b._id === m);
                const activeSt = countObj?.totalActiveStudents ?? overview.activeStudents;
                const skipped = countObj?.studentSkipped || 0;
                const visitors = countObj?.visitorPasses || 0;
                const expectedStudents = Math.max(0, activeSt - skipped);
                const finalDemand = expectedStudents + visitors;

                return (
                  <tr key={m} className="hover:bg-paper/50 transition-colors font-mono">
                    <td className="py-3 px-3 font-bold text-ink flex items-center gap-2">
                      <span className="text-base">{MEAL_ICONS[m]}</span>
                      <span>{m}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-ink/80">{expectedStudents}</td>
                    <td className="py-3 px-3 text-clay font-bold">
                      <span className="inline-flex items-center gap-1">
                        <Ban className="w-3.5 h-3.5 shrink-0 text-clay" /> {skipped}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-turmeric-dark font-bold">
                      <span className="inline-flex items-center gap-1">
                        <Ticket className="w-3.5 h-3.5 shrink-0 text-turmeric-dark" /> {visitors}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-forest text-sm">
                      <span className="inline-flex items-center gap-1">
                        <ChefHat className="w-3.5 h-3.5 shrink-0 text-forest" /> {finalDemand}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* 2. STUDENTS TAB */
const StudentsTab = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadStudents = () => {
    setLoading(true);
    api
      .get('/users', { params: { role: 'student' } })
      .then((res) => {
        setStudents(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const toggleStatus = async (user) => {
    await api.patch(`/users/${user._id}/status`, { isActive: !user.isActive });
    loadStudents();
  };

  const removeUser = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this student account?')) return;
    await api.delete(`/users/${id}`);
    loadStudents();
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.roomNumber?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && s.isActive) ||
      (statusFilter === 'inactive' && !s.isActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">STUDENT MANAGEMENT</h2>
          <p className="text-xs text-ink/65">Search, filter, activate/deactivate, or manage student accounts.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by name, email, room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-ink/15 bg-cardcream px-3.5 py-2 text-xs focus:border-forest outline-none min-w-[200px]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-ink/15 bg-cardcream px-3 py-2 text-xs focus:border-forest outline-none font-semibold"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Disabled Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loader label="Loading student directory..." />
      ) : (
        <div className="bg-cardcream rounded-card border border-ink/10 p-6 space-y-4 shadow-soft">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs font-body border-collapse">
              <thead>
                <tr className="border-b border-ink/15 text-ink/50 uppercase font-mono text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Hostel Block</th>
                  <th className="py-2.5 px-3">Room</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5 font-mono">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-ink/50 italic">
                      No matching student accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s._id} className="hover:bg-paper/50 transition-colors">
                      <td className="py-3 px-3 font-bold text-ink">{s.name}</td>
                      <td className="py-3 px-3 text-ink/70">{s.email}</td>
                      <td className="py-3 px-3 text-ink/80">{s.hostelBlock || 'Block A'}</td>
                      <td className="py-3 px-3 font-bold text-forest">{s.roomNumber || '101'}</td>
                      <td className="py-3 px-3 text-ink/70">{s.phone || '—'}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                            s.isActive ? 'bg-forest/10 text-forest border border-forest/20' : 'bg-clay/10 text-clay border border-clay/20'
                          }`}
                        >
                          {s.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <button
                          onClick={() => toggleStatus(s)}
                          className={`text-[11px] font-bold underline cursor-pointer ${s.isActive ? 'text-clay' : 'text-forest'}`}
                        >
                          {s.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => removeUser(s._id)} className="text-[11px] text-clay/70 hover:text-clay underline cursor-pointer">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/* 3. MANAGERS TAB */
const ManagersTab = () => {
  const [managers, setManagers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'mess_manager', phone: '' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const loadManagers = () => {
    setLoading(true);
    api
      .get('/users', { params: { role: 'mess_manager' } })
      .then((res) => {
        setManagers(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadManagers();
  }, []);

  const createStaff = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/staff', form);
      setStatus('success');
      setForm({ name: '', email: '', password: '', role: 'mess_manager', phone: '' });
      loadManagers();
    } catch (err) {
      setStatus(err.response?.data?.message || 'Could not create staff account.');
    }
  };

  const toggleStatus = async (user) => {
    await api.patch(`/users/${user._id}/status`, { isActive: !user.isActive });
    loadManagers();
  };

  const removeUser = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this Mess Manager account?')) return;
    await api.delete(`/users/${id}`);
    loadManagers();
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <form onSubmit={createStaff} className="bg-cardcream rounded-card border border-ink/10 p-6 md:p-8 space-y-4 h-fit shadow-soft">
        <h3 className="font-display text-xl font-bold text-ink flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-forest" /> Add Staff / Manager
        </h3>

        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Full Name</label>
          <input
            required
            placeholder="Manager Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl border border-ink/15 bg-paper px-3.5 py-2.5 focus:border-forest outline-none text-xs"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Email Address</label>
          <input
            required
            type="email"
            placeholder="manager@hostel.edu"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-xl border border-ink/15 bg-paper px-3.5 py-2.5 focus:border-forest outline-none text-xs"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Password</label>
          <input
            required
            type="password"
            minLength={3}
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-xl border border-ink/15 bg-paper px-3.5 py-2.5 focus:border-forest outline-none text-xs"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wide text-ink/50 font-semibold mb-1">Role</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full rounded-xl border border-ink/15 bg-paper px-3.5 py-2.5 focus:border-forest outline-none text-xs font-semibold"
          >
            <option value="mess_manager">Mess Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button className="w-full py-3 rounded-full bg-forest text-paper font-semibold hover:bg-forest-dark transition-colors shadow-soft text-xs cursor-pointer">
          Create Account →
        </button>

        {status === 'success' && <p className="text-xs text-forest font-semibold text-center bg-forest/10 p-2 rounded-lg">Staff account created!</p>}
        {status && status !== 'success' && <p className="text-xs text-clay font-semibold text-center bg-clay/10 p-2 rounded-lg">{status}</p>}
      </form>

      <div className="md:col-span-2 space-y-3">
        <h3 className="font-display text-xl font-bold text-ink flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-turmeric-dark" /> Active Mess Managers
        </h3>
        {loading ? (
          <Loader label="Loading manager accounts..." />
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin pr-1">
            {managers.length === 0 ? (
              <p className="text-xs text-ink/50 italic p-6 text-center">No Mess Manager accounts found.</p>
            ) : (
              managers.map((m) => (
                <div key={m._id} className="bg-cardcream rounded-xl border border-ink/10 p-4 flex items-center justify-between shadow-soft">
                  <div>
                    <div className="font-bold text-ink text-sm">
                      {m.name} <span className="text-xs font-mono text-forest">· {m.role}</span>
                    </div>
                    <div className="text-xs font-mono text-ink/60">{m.email}</div>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        m.isActive ? 'bg-forest/10 text-forest border border-forest/20' : 'bg-clay/10 text-clay border border-clay/20'
                      }`}
                    >
                      {m.isActive ? 'Active' : 'Disabled'}
                    </span>
                    <button onClick={() => toggleStatus(m)} className="text-xs text-forest font-bold underline cursor-pointer">
                      {m.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => removeUser(m._id)} className="text-xs text-clay underline cursor-pointer">
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* 4. VACATIONS TAB */
const VacationsTab = () => {
  const [vacations, setVacations] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/users/admin-vacations')
      .then((res) => {
        setVacations(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = vacations.filter((v) => filterStatus === 'all' || v.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">STUDENT VACATION MONITORING</h2>
          <p className="text-xs text-ink/65">Track multi-day student meal pauses and scheduled return dates.</p>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-xl border border-ink/15 bg-cardcream px-3 py-2 text-xs focus:border-forest outline-none font-semibold"
        >
          <option value="all">All Vacations</option>
          <option value="active">Active Only</option>
          <option value="cancelled">Cancelled Only</option>
        </select>
      </div>

      {loading ? (
        <Loader label="Loading vacation monitoring logs..." />
      ) : (
        <div className="bg-cardcream rounded-card border border-ink/10 p-6 space-y-4 shadow-soft">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs font-body border-collapse">
              <thead>
                <tr className="border-b border-ink/15 text-ink/50 uppercase font-mono text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Room / Block</th>
                  <th className="py-2.5 px-3">Start Date</th>
                  <th className="py-2.5 px-3">End Date</th>
                  <th className="py-2.5 px-3">Meal Types</th>
                  <th className="py-2.5 px-3">Meals Skipped</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5 font-mono">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-ink/50 italic">
                      No student vacation records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((v) => (
                    <tr key={v._id} className="hover:bg-paper/50 transition-colors">
                      <td className="py-3 px-3 font-bold text-ink">{v.student?.name || 'Student'}</td>
                      <td className="py-3 px-3 text-forest font-semibold">
                        Room {v.student?.roomNumber || '101'} ({v.student?.hostelBlock || 'Block A'})
                      </td>
                      <td className="py-3 px-3 text-ink/80">
                        {new Date(v.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 px-3 text-ink/80">
                        {new Date(v.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 px-3 text-ink/70">{v.mealTypes.join(', ')}</td>
                      <td className="py-3 px-3 font-bold text-clay">{v.totalMealsSkipped} meals</td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1.5 ${
                            v.status === 'active'
                              ? 'bg-forest/10 text-forest border border-forest/20'
                              : 'bg-paper text-ink/50 border border-ink/15'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${v.status === 'active' ? 'bg-forest' : 'bg-ink/30'}`} />
                          {v.status === 'active' ? 'Active' : 'Cancelled'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/* 5. VISITOR PASSES TAB */
const VisitorsTab = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/users/admin-visitor-payments')
      .then((res) => {
        setPayments(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const totalRevenue = payments.reduce((sum, p) => sum + (p.paymentAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-ink/10 pb-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">VISITOR PASS &amp; REVENUE AUDIT</h2>
          <p className="text-xs text-ink/65">Authoritative financial audit log of paid visitor passes and dummy transactions.</p>
        </div>
        <span className="text-xs font-mono font-bold text-forest bg-forest/10 px-4 py-2 rounded-full border border-forest/20 shadow-soft">
          Total Revenue: ₹{totalRevenue}
        </span>
      </div>

      {loading ? (
        <Loader label="Loading visitor pass transaction log..." />
      ) : (
        <div className="bg-cardcream rounded-card border border-ink/10 p-6 space-y-4 shadow-soft">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs font-body border-collapse">
              <thead>
                <tr className="border-b border-ink/15 text-ink/50 uppercase font-mono text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Visitor / Host</th>
                  <th className="py-2.5 px-3">Meal Slot</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Transaction ID</th>
                  <th className="py-2.5 px-3">Token Code</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5 font-mono">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-ink/50 italic">
                      No paid visitor pass transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p._id} className="hover:bg-paper/50 transition-colors">
                      <td className="py-3 px-3 font-bold text-ink">
                        {p.purpose || p.student?.name || 'Visitor Guest'}
                      </td>
                      <td className="py-3 px-3 text-forest font-bold">{p.mealType}</td>
                      <td className="py-3 px-3 text-ink/80">
                        {new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 px-3 font-bold text-forest">₹{p.paymentAmount}</td>
                      <td className="py-3 px-3 text-ink/70 font-semibold">{p.transactionId}</td>
                      <td className="py-3 px-3 font-bold text-turmeric-dark">{p.tokenCode}</td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-forest/10 text-forest border border-forest/20 inline-flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-forest" /> Paid
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/* 6. SYSTEM ANALYTICS TAB */
const AnalyticsTab = () => {
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

  if (!waste || !feedback) return <Loader label="Pulling system analytics..." />;

  const savedPercent = waste.totalPrepared ? Math.round((waste.totalConsumed / waste.totalPrepared) * 100) : 0;
  const pieData = Object.entries(waste.reasonBreakdown)
    .filter(([, v]) => v > 0)
    .map(([reason, kg]) => ({ name: reason.replace('_', ' '), value: Math.round(kg * 100) / 100 }));

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-5 mb-6">
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
        <div className="bg-cardcream rounded-card border border-ink/10 p-5 shadow-soft">
          <h3 className="font-display text-lg font-bold text-ink mb-4">Waste by root cause (kg)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {pieData.map((entry, i) => (
                  <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-cardcream rounded-card border border-ink/10 p-5 shadow-soft">
          <h3 className="font-display text-lg font-bold text-ink mb-4">Feedback keyword summary</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {feedback.topKeywords.map((k) => (
              <span key={k.word} className="px-3 py-1.5 rounded-full bg-turmeric/15 text-turmeric-dark text-xs font-semibold border border-turmeric/30">
                {k.word} <span className="text-ink/40 font-mono">×{k.count}</span>
              </span>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 text-center pt-2">
            <div className="bg-paper p-3 rounded-xl border border-ink/10">
              <div className="font-display font-bold text-xl text-forest">{feedback.avgTaste}</div>
              <div className="text-xs text-ink/50 font-mono">Taste</div>
            </div>
            <div className="bg-paper p-3 rounded-xl border border-ink/10">
              <div className="font-display font-bold text-xl text-forest">{feedback.avgCleanliness}</div>
              <div className="text-xs text-ink/50 font-mono">Cleanliness</div>
            </div>
            <div className="bg-paper p-3 rounded-xl border border-ink/10">
              <div className="font-display font-bold text-xl text-forest">{feedback.avgService}</div>
              <div className="text-xs text-ink/50 font-mono">Service</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
