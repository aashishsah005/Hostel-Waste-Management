import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Bell, User, Calendar, Clock, X, Ban } from 'lucide-react';

const roleHome = {
  admin: '/admin',
  mess_manager: '/mess',
  student: '/student',
  visitor: '/student',
};

const MEAL_TIMINGS = {
  Breakfast: '7:00 AM – 8:00 AM',
  Lunch: '11:00 AM – 1:00 PM',
  Snacks: '4:00 PM – 5:00 PM',
  Dinner: '7:00 PM – 8:00 PM',
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Notifications State (Student & Manager)
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [skipStatus, setSkipStatus] = useState('');

  const isEligibleForNotifications = user && (user.role === 'student' || user.role === 'mess_manager' || user.role === 'admin');

  // Fetch Notifications for Authenticated User
  const fetchNotifications = async () => {
    if (!isEligibleForNotifications) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      // Silently handle error so app navigation never crashes
    }
  };

  useEffect(() => {
    if (isEligibleForNotifications) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSkipFromNotification = async (n) => {
    setSkipStatus('');
    try {
      const dateStr = new Date(n.date).toISOString().slice(0, 10);
      const res = await api.post('/bookings/skip', { date: dateStr, mealType: n.mealType });
      setSkipStatus(res.data.message || `${n.mealType} skipped!`);
      markAsRead(n._id);
      fetchNotifications();
    } catch (err) {
      setSkipStatus(err.response?.data?.message || `Could not skip ${n.mealType}.`);
    }
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  const handleNavSection = (e, sectionId) => {
    e.preventDefault();
    setOpen(false);
    setShowDropdown(false);

    if (location.pathname === '/') {
      if (sectionId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const elem = document.getElementById(sectionId);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else {
      navigate('/', { state: { scrollTo: sectionId } });
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    setOpen(false);
    setShowDropdown(false);
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'impact', label: 'Impact' },
    { id: 'student-section', label: 'For Students' },
    { id: 'staff-section', label: 'For Staff' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-ink/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Left Side: Brand Logo + Section Nav Links */}
        <div className="flex items-center gap-5 lg:gap-6">
          <a
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-cardcream/90 border border-ink/12 shadow-soft hover:border-forest/40 hover:bg-cardcream transition-all group cursor-pointer shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-forest flex items-center justify-center text-turmeric shadow-soft group-hover:scale-105 transition-transform">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor" opacity="0.3"/>
                <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="currentColor"/>
                <path d="M15 9l-3 3-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="font-display font-extrabold text-base text-ink leading-none tracking-tight">Mess Board</div>
              <div className="text-[9px] font-mono uppercase tracking-widest text-forest font-bold mt-0.5">Smart Hostel Mess</div>
            </div>
          </a>

          <div className="hidden xl:block w-px h-6 bg-ink/10 shrink-0" />

          <nav className="hidden lg:flex items-center gap-5 font-body text-xs font-semibold text-ink/75">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleNavSection(e, item.id)}
                className="relative group py-1 text-ink/75 hover:text-forest transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-forest/30 rounded"
              >
                <span>{item.label}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-forest rounded-full transition-all duration-300 ease-out group-hover:w-full" />
              </a>
            ))}
          </nav>
        </div>

        {/* Right Side: Action Buttons & Notification Bell */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-3 relative">
              {/* NOTIFICATION BELL (Student & Mess Manager) */}
              {isEligibleForNotifications && (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="p-2 rounded-full border border-ink/15 text-ink hover:border-forest/50 hover:bg-cardcream transition-all relative cursor-pointer"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-clay text-paper font-mono text-[9px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* NOTIFICATION DROPDOWN PANEL */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-cardcream rounded-2xl border border-ink/10 shadow-lift p-4 z-50 text-left space-y-3 font-body">
                      <div className="flex items-center justify-between border-b border-ink/10 pb-2">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-forest" />
                          <span className="font-display font-bold text-sm text-ink">
                            {user.role === 'mess_manager' ? 'Manager Alerts' : 'Notifications'}
                          </span>
                          {unreadCount > 0 && (
                            <span className="text-[10px] font-mono font-bold bg-clay/15 text-clay px-2 py-0.5 rounded-full">
                              {unreadCount} Unread
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setShowDropdown(false)}
                          className="text-xs text-ink/40 hover:text-ink font-bold cursor-pointer p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {skipStatus && (
                        <div className={`text-xs p-2.5 rounded-xl border font-medium ${
                          skipStatus.includes('skipped') || skipStatus.includes('success')
                            ? 'bg-forest/10 border-forest/30 text-forest'
                            : 'bg-clay/10 border-clay/30 text-clay'
                        }`}>
                          {skipStatus}
                        </div>
                      )}

                      <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-ink/50 text-center py-6">No notifications right now.</p>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              onClick={() => !n.isRead && markAsRead(n._id)}
                              className={`p-3.5 rounded-xl border transition-all text-xs ${
                                n.isRead
                                  ? 'bg-paper/50 border-ink/5 opacity-75'
                                  : 'bg-paper border-forest/20 shadow-soft'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="font-display font-bold text-ink text-xs flex items-center gap-1.5">
                                  <span>{n.title}</span>
                                </div>
                                {!n.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-forest shrink-0 mt-1" />
                                )}
                              </div>

                              {/* SENDER STUDENT BADGE FOR MANAGERS */}
                              {n.senderStudent && (
                                <div className="text-[11px] font-mono text-turmeric-dark font-bold mt-1 flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5 shrink-0" />
                                  <span>Student: {n.senderStudent.name}</span>
                                  {n.senderStudent.roomNumber && (
                                    <span className="text-ink/40 font-normal">(Room {n.senderStudent.roomNumber})</span>
                                  )}
                                </div>
                              )}

                              {/* MEAL DATE & TIMING BADGES */}
                              {n.mealType && n.date && (
                                <div className="text-[11px] font-mono text-forest font-semibold mt-1.5 flex flex-wrap items-center gap-3">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 shrink-0" />
                                    {new Date(n.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 shrink-0" />
                                    {MEAL_TIMINGS[n.mealType] || 'Standard Time'}
                                  </span>
                                </div>
                              )}

                              <p className="text-ink/75 text-[11px] mt-1.5 leading-relaxed">{n.message}</p>

                              <div className="mt-2 text-[10px] font-mono text-ink/40 text-right">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>

                              {/* DIRECT SKIP ACTION BUTTON (FOR STUDENTS) */}
                              {user.role === 'student' && n.type === 'meal_reminder' && n.mealType && (
                                <div className="mt-3 flex items-center justify-between pt-2 border-t border-ink/5">
                                  <span className="text-[10px] font-mono text-ink/40">
                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSkipFromNotification(n);
                                    }}
                                    className="px-3.5 py-1.5 rounded-full bg-clay text-paper font-semibold text-[11px] hover:bg-clay-dark transition-colors shadow-soft cursor-pointer flex items-center gap-1"
                                  >
                                    <Ban className="w-3 h-3 shrink-0" />
                                    <span>Skip {n.mealType}</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Link to={roleHome[user.role] || '/'} className="px-4 py-2 rounded-full border border-ink/20 text-ink hover:border-forest hover:text-forest transition-colors text-xs font-semibold">
                Dashboard
              </Link>
              <span className="text-ink/60 text-xs font-semibold">
                {user.name?.split(' ')[0]} <span className="text-turmeric-dark">({user.role.replace('_', ' ')})</span>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-full bg-forest text-paper hover:bg-forest-dark transition-colors shadow-soft text-xs font-semibold cursor-pointer"
              >
                Log out
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 rounded-full border border-ink/20 text-ink hover:border-forest hover:text-forest transition-colors text-xs font-semibold">
                Login
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 rounded-full bg-forest text-paper hover:bg-forest-dark transition-colors shadow-soft text-xs font-semibold"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="lg:hidden text-ink p-1"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {open && (
        <nav className="lg:hidden px-5 pb-4 flex flex-col gap-3 font-body text-sm border-t border-ink/10 pt-3 bg-paper">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleNavSection(e, item.id)}
              className="text-ink/80 hover:text-forest py-1 font-semibold transition-colors"
            >
              {item.label}
            </a>
          ))}

          <div className="pt-2 border-t border-ink/10 flex flex-col gap-2">
            {user ? (
              <>
                {unreadCount > 0 && (
                  <div className="text-xs text-clay font-bold flex items-center gap-1.5 py-1">
                    <Bell className="w-3.5 h-3.5" /> {unreadCount} Unread Notifications
                  </div>
                )}
                <Link to={roleHome[user.role] || '/'} onClick={() => setOpen(false)} className="text-ink/80 font-semibold">
                  Dashboard ({user.name?.split(' ')[0]})
                </Link>
                <button onClick={handleLogout} className="px-4 py-2 rounded-full bg-forest text-paper w-fit text-xs font-semibold">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="text-ink/80 font-semibold">
                  Login
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="px-4 py-2 rounded-full bg-forest text-paper w-fit text-xs font-semibold">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
