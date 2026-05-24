import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { loginUser, registerUser, clearAuthError } from '../redux/authSlice';

const AuthPages = ({ defaultTab = 'login' }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, loading, error } = useSelector(state => state.auth);
  
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [rememberMe, setRememberMe] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localValidationError, setLocalValidationError] = useState('');

  // Clear errors when toggling tabs
  useEffect(() => {
    dispatch(clearAuthError());
    setLocalValidationError('');
  }, [activeTab, dispatch]);

  // Redirect on successful login/register
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalValidationError('');

    if (!email || !password) {
      setLocalValidationError('Please enter all required fields.');
      return;
    }

    if (activeTab === 'register') {
      if (!name) {
        setLocalValidationError('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalValidationError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setLocalValidationError('Password must be at least 6 characters long.');
        return;
      }

      dispatch(registerUser({ name, email, password }));
    } else {
      dispatch(loginUser({ email, password, rememberMe }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
      
      {/* Visual background elements */}
      <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] bg-gradient-to-br from-brand-indigo/25 to-brand-cyan/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] bg-gradient-to-br from-brand-purple/20 to-brand-indigo/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 flex flex-col items-center z-10">
        <Link to="/" className="flex items-center gap-2 mb-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-indigo to-brand-cyan flex items-center justify-center text-white shadow-lg shadow-brand-indigo/35 group-hover:scale-105 transition duration-300">
            <CheckSquare className="w-5.5 h-5.5" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-cyan bg-clip-text text-transparent">
            TaskFlow Pro
          </span>
        </Link>
        <p className="text-slate-400 text-xs tracking-wider uppercase font-semibold">Smart Workspace Hub</p>
      </div>

      {/* Main Glassmorphic Auth Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-3xl bg-slate-900/50 border border-white/10 backdrop-blur-md shadow-2xl relative z-10"
      >
        {/* Tabs switcher */}
        <div className="flex bg-slate-950/50 p-1.5 rounded-2xl mb-8 border border-white/5">
          <button 
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 text-xs font-extrabold rounded-xl transition ${activeTab === 'login' ? 'bg-gradient-to-r from-brand-indigo to-brand-purple text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            SIGN IN
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-3 text-xs font-extrabold rounded-xl transition ${activeTab === 'register' ? 'bg-gradient-to-r from-brand-indigo to-brand-purple text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            CREATE ACCOUNT
          </button>
        </div>

        {/* Error block displaying validation failures */}
        <AnimatePresence mode="wait">
          {(error || localValidationError) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex gap-2.5 items-start"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{localValidationError || error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Name Field (Register Mode Only) */}
          {activeTab === 'register' && (
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Full Name</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Harriet Potter" 
                  className="w-full bg-slate-950/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 focus:border-brand-indigo text-white placeholder-slate-500 transition-all duration-300"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Email Address</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" 
                className="w-full bg-slate-950/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 focus:border-brand-indigo text-white placeholder-slate-500 transition-all duration-300"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Password</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-slate-950/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 focus:border-brand-indigo text-white placeholder-slate-500 transition-all duration-300"
              />
            </div>
          </div>

          {/* Password Confirmation (Register Mode Only) */}
          {activeTab === 'register' && (
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-slate-950/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 focus:border-brand-indigo text-white placeholder-slate-500 transition-all duration-300"
                />
              </div>
            </div>
          )}

          {/* Toggles (Login Mode Only) */}
          {activeTab === 'login' && (
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-white transition">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="rounded bg-slate-900 border-white/10 text-brand-indigo focus:ring-brand-indigo/30 w-4 h-4 cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <span className="text-slate-500 hover:text-slate-300 cursor-not-allowed transition">Forgot password?</span>
            </div>
          )}

          {/* Submit Action Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-indigo to-brand-purple hover:from-brand-indigoDark hover:to-brand-purpleDark shadow-lg shadow-brand-indigo/25 hover:shadow-brand-indigo/35 transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>{activeTab === 'login' ? 'Access Workspace' : 'Initialize Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-500">
          By continuing, you agree to our Terms of Service.
        </p>
      </motion.div>

    </div>
  );
};

export default AuthPages;
