import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  CheckSquare, 
  ShieldAlert, 
  LogOut, 
  Sun, 
  Moon, 
  Bell, 
  ChevronLeft, 
  ChevronRight, 
  User as UserIcon,
  Menu,
  X,
  CircleDot
} from 'lucide-react';
import { logoutUser } from '../redux/authSlice';
import { toggleDarkMode, toggleSidebar, fetchNotifications, markNotificationRead } from '../redux/uiSlice';

const SidebarLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector(state => state.auth);
  const { darkMode, sidebarOpen, notifications } = useSelector(state => state.ui);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Poll notifications every 30 seconds
    dispatch(fetchNotifications());
    const interval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkNotification = (id) => {
    dispatch(markNotificationRead(id));
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Tasks', path: '/tasks', icon: CheckSquare },
  ];

  if (user?.role === 'Admin') {
    navItems.push({ name: 'Admin Hub', path: '/admin', icon: ShieldAlert });
  }

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${darkMode ? 'dark bg-[#070b13]' : 'bg-slate-50'}`}>
      
      {/* 1. DESKTOP SIDEBAR */}
      <motion.aside 
        animate={{ width: sidebarOpen ? 260 : 76 }}
        className="hidden md:flex flex-col fixed top-0 left-0 h-screen glass-panel z-30 transition-all border-r border-slate-200/50 dark:border-dark-border/40"
      >
        {/* Logo & Toggle */}
        <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-dark-border/20">
          <AnimatePresence mode="wait">
            {sidebarOpen ? (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-indigo to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-indigo/35">
                  <CheckSquare className="w-5 h-5 text-white" />
                </div>
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-cyan bg-clip-text text-transparent">
                  TaskFlow Pro
                </span>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-tr from-brand-indigo to-brand-cyan flex items-center justify-center shadow-lg"
              >
                <CheckSquare className="w-5 h-5 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
          
          {sidebarOpen && (
            <button 
              onClick={() => dispatch(toggleSidebar())}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-dark-text hover:bg-slate-100 dark:hover:bg-dark-bg/60 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Expand Trigger if collapsed */}
        {!sidebarOpen && (
          <button 
            onClick={() => dispatch(toggleSidebar())}
            className="absolute top-6 -right-3 p-1 rounded-full bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border text-slate-400 hover:text-brand-indigo transition shadow-sm z-40"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all group relative ${
                  isActive 
                    ? 'bg-gradient-to-r from-brand-indigo/15 to-brand-purple/5 text-brand-indigo border-l-4 border-brand-indigo dark:text-brand-cyan' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-dark-text hover:bg-slate-100/50 dark:hover:bg-dark-card/40'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-brand-indigo dark:text-brand-cyan' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-dark-text'}`} />
                {sidebarOpen && <span>{item.name}</span>}
                {!sidebarOpen && (
                  <div className="absolute left-16 scale-0 group-hover:scale-100 bg-slate-800 dark:bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-md shadow-md transition-all whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer actions & user widget */}
        <div className="p-4 border-t border-slate-100 dark:border-dark-border/20 space-y-4">
          {/* Toggles */}
          <div className={`flex items-center gap-2 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
            <button 
              onClick={() => dispatch(toggleDarkMode())}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-dark-bg/60 transition"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400 animate-pulse" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {sidebarOpen && (
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            )}
            {!sidebarOpen && (
              <button 
                onClick={handleLogout}
                className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* User Widget */}
          {user && (
            <div className={`flex items-center gap-3 p-2 rounded-xl bg-slate-100/50 dark:bg-dark-card/30 ${sidebarOpen ? 'justify-start' : 'justify-center'}`}>
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${user.avatar || 'from-purple-500 to-indigo-500'} flex items-center justify-center text-white font-bold shadow-md`}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              {sidebarOpen && (
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate leading-4">{user.name}</p>
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                    {user.role}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.aside>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className={`flex-1 flex flex-col ${sidebarOpen ? 'md:pl-[260px]' : 'md:pl-[76px]'} transition-all duration-300 pb-20 md:pb-0`}>
        
        {/* Top Floating Navbar (Glassmorphic) */}
        <header className="sticky top-0 z-20 glass-panel border-b border-slate-100 dark:border-dark-border/20 px-6 py-4 flex items-center justify-between backdrop-blur-md">
          {/* Left: Responsive Mobile Toggle */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-dark-card text-slate-500 dark:text-slate-400"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              {location.pathname === '/dashboard' && 'Overview Dashboard'}
              {location.pathname === '/tasks' && 'Active Workspaces'}
              {location.pathname === '/admin' && 'Enterprise Security Admin'}
            </h2>
          </div>

          {/* Right: Notifications Triggers */}
          <div className="flex items-center gap-3 relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2.5 rounded-xl border border-slate-200/50 dark:border-dark-border/40 relative hover:bg-slate-100 dark:hover:bg-dark-card/50 transition-colors ${showNotifications ? 'bg-slate-100 dark:bg-dark-card' : ''}`}
            >
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-[10px] font-extrabold flex items-center justify-center rounded-full animate-bounce border-2 border-white dark:border-dark-bg">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown (Glassmorphism) */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute right-0 top-14 w-80 glass-panel border border-slate-200 dark:border-dark-border/50 rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-slate-100 dark:border-dark-border/20 flex items-center justify-between bg-slate-50/50 dark:bg-dark-card/25">
                    <span className="font-bold text-sm">Real-time Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => handleMarkNotification('all')}
                        className="text-xs text-brand-indigo dark:text-brand-cyan hover:underline font-bold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-dark-border/10">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
                        No active notifications.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n._id} 
                          onClick={() => handleMarkNotification(n._id)}
                          className={`p-3.5 hover:bg-slate-100/50 dark:hover:bg-dark-bg/30 transition cursor-pointer text-xs ${!n.isRead ? 'bg-brand-indigo/5 dark:bg-brand-cyan/5 border-l-4 border-brand-indigo' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold">{n.title}</span>
                            <span className="text-[10px] text-slate-400">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 leading-4">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 relative">
          {children}
        </main>
      </div>

      {/* 3. MOBILE MENU OVERLAY SLIDE-IN */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            {/* Sidebar drawer */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-dark-card border-r border-slate-200 dark:border-dark-border z-50 p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-indigo to-brand-cyan flex items-center justify-center text-white">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <span className="font-extrabold text-md tracking-tight bg-gradient-to-r from-brand-indigo to-brand-cyan bg-clip-text text-transparent">
                    TaskFlow Pro
                  </span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 dark:hover:text-dark-text"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-grow space-y-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link 
                      key={item.path} 
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
                        isActive 
                          ? 'bg-brand-indigo/10 text-brand-indigo dark:bg-brand-cyan/15 dark:text-brand-cyan' 
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-bg/60'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-slate-100 dark:border-dark-border/20 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Dark Mode</span>
                  <button 
                    onClick={() => dispatch(toggleDarkMode())}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-dark-bg/60"
                  >
                    {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
                  </button>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 font-bold hover:bg-rose-100 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 4. MOBILE BOTTOM TABS NAVIGATION BAR (Touch friendly) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 glass-panel border-t border-slate-200/50 dark:border-dark-border/40 flex items-center justify-around px-4 z-30 shadow-2xl">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 w-16 h-full transition ${isActive ? 'text-brand-indigo dark:text-brand-cyan' : 'text-slate-400'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-bold">{item.name.replace('My ', '')}</span>
            </Link>
          );
        })}
        {user && (
          <div className="flex flex-col items-center justify-center w-16 h-full">
            <div className={`w-7 h-7 rounded bg-gradient-to-tr ${user.avatar || 'from-purple-500 to-indigo-500'} flex items-center justify-center text-white text-xs font-bold`}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-full">Me</span>
          </div>
        )}
      </div>

    </div>
  );
};

export default SidebarLayout;
