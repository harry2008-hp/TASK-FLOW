import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckSquare, 
  ArrowRight, 
  Sparkles, 
  Columns, 
  TrendingUp, 
  ShieldCheck, 
  Users 
} from 'lucide-react';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring', damping: 20 }
    }
  };

  const floatVariants = {
    animate: {
      y: [0, -12, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const features = [
    {
      title: 'Glassmorphic Kanban Board',
      desc: 'Seamlessly drag and drop your cards. Statuses include Pending, In Progress, and Completed.',
      icon: Columns,
      color: 'from-cyan-500 to-blue-500'
    },
    {
      title: 'Productivity Statistics',
      desc: 'Visualize team completions, upcoming deadlines, and user actions on dynamic analytical widgets.',
      icon: TrendingUp,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      title: 'Enterprise RBAC Security',
      desc: 'Full authentication features with Admin vs Regular User roles. Safe password hashing and session tokens.',
      icon: ShieldCheck,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Real-time Activity Stream',
      desc: 'Monitor user operations, audit changes, and push updates down assignee notification logs instantly.',
      icon: Users,
      color: 'from-emerald-500 to-teal-500'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden relative font-sans">
      
      {/* Premium Background Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-brand-indigo/30 via-brand-purple/20 to-transparent rounded-full blur-[140px] pointer-events-none opacity-60" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-brand-cyan/20 via-brand-indigo/15 to-transparent rounded-full blur-[140px] pointer-events-none opacity-60" />
      
      {/* Decorative Grid Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="relative max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-indigo to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-indigo/40">
            <CheckSquare className="w-5.5 h-5.5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-cyan bg-clip-text text-transparent">
            TaskFlow Pro
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition">
            Sign In
          </Link>
          <Link to="/register" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-brand-indigo to-brand-purple hover:from-brand-indigoDark hover:to-brand-purpleDark text-white shadow-lg shadow-brand-indigo/30 transition transform hover:-translate-y-0.5">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-24 grid md:grid-cols-2 gap-12 items-center z-10">
        {/* Hero Left Content */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 text-left"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-brand-cyan" />
            <span className="text-xs font-semibold text-slate-300 tracking-wide">Next Generation SaaS Platform</span>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent"
          >
            Accelerate and Organize Your <br />
            <span className="bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-cyan bg-clip-text text-transparent">
              Workspace Flow
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-slate-400 text-lg leading-relaxed max-w-lg"
          >
            The premium task management engine. Securely manage tasks, view advanced charts dashboard analytics, coordinate assignees, and track project velocities instantly.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <Link to="/register" className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-cyan hover:brightness-110 shadow-xl shadow-brand-indigo/25 transition transform hover:-translate-y-0.5">
              <span>Initialize Workspace</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="flex items-center justify-center px-8 py-4 rounded-xl font-semibold border border-white/10 hover:bg-white/5 transition">
              Explore Live Demo
            </Link>
          </motion.div>
        </motion.div>

        {/* Hero Right Visuals (Glassmorphic Mockup) */}
        <motion.div 
          variants={floatVariants}
          animate="animate"
          className="flex justify-center relative"
        >
          {/* Main Visual Board */}
          <div className="w-full max-w-[480px] p-6 rounded-3xl bg-slate-950/40 border border-white/10 backdrop-blur-md shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <span className="text-xs text-slate-500 font-semibold tracking-wider">PROJECT WORKSPACE</span>
            </div>

            {/* Simulated Tasks */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center justify-between transform hover:scale-[1.02] transition duration-300">
                <div className="space-y-1.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold bg-cyan-500/10 text-cyan-400">Low</span>
                  <p className="text-sm font-semibold text-slate-100">Setup production databases</p>
                </div>
                <div className="w-7 h-7 rounded bg-brand-indigo flex items-center justify-center text-xs font-bold shadow-md">D</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center justify-between transform hover:scale-[1.02] transition duration-300">
                <div className="space-y-1.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold bg-brand-purple/10 text-brand-purple">Urgent</span>
                  <p className="text-sm font-semibold text-slate-100">JWT Token Security integration</p>
                </div>
                <div className="w-7 h-7 rounded bg-brand-purple flex items-center justify-center text-xs font-bold shadow-md">H</div>
              </div>

              <div className="p-4 rounded-2xl bg-brand-indigo/15 border border-brand-indigo/40 backdrop-blur-xs flex items-center justify-between transform hover:scale-[1.02] transition duration-300">
                <div className="space-y-1.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold bg-emerald-500/15 text-emerald-400">Completed</span>
                  <p className="text-sm font-semibold text-brand-indigo dark:text-brand-cyan line-through">Design client landing grids</p>
                </div>
                <div className="w-7 h-7 rounded bg-brand-cyan flex items-center justify-center text-xs font-bold shadow-md">A</div>
              </div>
            </div>

            {/* Glowing Accent Orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-tr from-brand-indigo to-brand-cyan rounded-full blur-[70px] opacity-15 pointer-events-none" />
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 z-10 border-t border-white/5">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Unrivaled Productivity Features
          </h2>
          <p className="text-slate-400">
            A carefully engineered software environment packed with enterprise modules to speed up dev cycles.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div 
                key={idx}
                whileHover={{ y: -8, borderColor: 'rgba(255,255,255,0.15)' }}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-lg transition-all duration-300 text-left space-y-4"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${feat.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-slate-100">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative max-w-7xl mx-auto px-6 py-10 z-10 text-center text-xs text-slate-500 border-t border-white/5">
        <p>© 2026 TaskFlow Pro Platform. Developed with advanced agentic systems.</p>
      </footer>

    </div>
  );
};

export default LandingPage;
