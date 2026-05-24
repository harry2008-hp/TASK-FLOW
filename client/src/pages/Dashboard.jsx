import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  ListTodo,
  Calendar,
  Zap,
  TrendingUp
} from 'lucide-react';
import { fetchTasks } from '../redux/taskSlice';
import { fetchActivityLogs } from '../redux/uiSlice';

const Dashboard = () => {
  const dispatch = useDispatch();

  const { user } = useSelector(state => state.auth);
  const { tasks, loading } = useSelector(state => state.tasks);
  const { logs } = useSelector(state => state.ui);

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchActivityLogs());
  }, [dispatch]);

  // Calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  
  const urgentTasks = tasks.filter(t => t.priority === 'Urgent' && t.status !== 'Completed').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Recharts: Status Pie Data
  const pieData = [
    { name: 'Pending', value: pendingTasks, color: '#6366f1' },       // Indigo
    { name: 'In Progress', value: inProgressTasks, color: '#a855f7' },   // Purple
    { name: 'Completed', value: completedTasks, color: '#06b6d4' }      // Cyan
  ].filter(d => d.value > 0);

  // Recharts: Timeline Data (Tasks Created/Completed by date)
  // Let's create dummy dates or construct dynamic points from active tasks!
  const getTimelineData = () => {
    const datesMap = {};
    
    // Default 7 days representation
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      datesMap[dateStr] = { date: dateStr, created: 0, completed: 0 };
    }

    tasks.forEach(task => {
      const createdDate = new Date(task.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
      if (datesMap[createdDate]) {
        datesMap[createdDate].created += 1;
      }
      if (task.status === 'Completed' && task.updatedAt) {
        const completedDate = new Date(task.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
        if (datesMap[completedDate]) {
          datesMap[completedDate].completed += 1;
        }
      }
    });

    return Object.values(datesMap);
  };

  const timelineData = getTimelineData();

  // Upcoming deadlines (within next 7 days, excluding completed)
  const upcomingDeadlines = [...tasks]
    .filter(t => t.status !== 'Completed')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4);

  const statCards = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: ListTodo,
      desc: 'All managed items',
      gradient: 'from-blue-500/10 to-indigo-500/10 text-indigo-500 border-indigo-500/20'
    },
    {
      title: 'Completed',
      value: `${completedTasks} (${completionRate}%)`,
      icon: CheckCircle2,
      desc: 'Finished task list',
      gradient: 'from-cyan-500/10 to-emerald-500/10 text-cyan-500 border-cyan-500/20'
    },
    {
      title: 'Pending Flow',
      value: pendingTasks + inProgressTasks,
      icon: Clock,
      desc: 'Tasks in execution',
      gradient: 'from-amber-500/10 to-orange-500/10 text-amber-500 border-amber-500/20'
    },
    {
      title: 'Urgent Alert',
      value: urgentTasks,
      icon: AlertOctagon,
      desc: 'Requires attention',
      gradient: 'from-rose-500/10 to-red-500/10 text-rose-500 border-rose-500/20 animate-pulse-slow'
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. WELCOME BANNER HEADER (Premium Gradient Glass) */}
      {user && (
        <div className="p-6 md:p-8 rounded-3xl glass-panel relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-white/30 dark:border-dark-border/30">
          <div className="space-y-2 z-10 text-left">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-800 via-slate-600 to-indigo-700 dark:from-white dark:via-slate-200 dark:to-brand-cyan bg-clip-text text-transparent">
              Welcome back, {user.name} 👋
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              Your dashboard looks outstanding. You have achieved a <span className="font-bold text-brand-indigo dark:text-brand-cyan">{completionRate}%</span> completion rate. Let's keep the productivity velocity up!
            </p>
          </div>
          
          <div className="flex gap-4 z-10 shrink-0">
            <div className="p-4 rounded-2xl bg-white/40 dark:bg-dark-card/40 border border-white/20 dark:border-dark-border/20 text-center shadow-sm">
              <span className="block text-xl font-extrabold text-brand-indigo dark:text-brand-cyan">{completedTasks}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Completions</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/40 dark:bg-dark-card/40 border border-white/20 dark:border-dark-border/20 text-center shadow-sm">
              <span className="block text-xl font-extrabold text-brand-purple">{urgentTasks}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Urgent items</span>
            </div>
          </div>

          {/* Background glowing blob */}
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-brand-indigo/10 to-transparent blur-2xl pointer-events-none" />
        </div>
      )}

      {/* 2. STATS SUMMARIES GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx}
              className={`p-5 rounded-2xl bg-white dark:bg-dark-card border shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow border-slate-100 dark:border-dark-border/40 ${card.title === 'Urgent Alert' && urgentTasks > 0 ? 'border-rose-500/30' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{card.title}</span>
                <div className={`p-2 rounded-xl bg-gradient-to-tr ${card.gradient} border shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold tracking-tight leading-none mb-1">{card.value}</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">{card.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. ANALYTICAL CHARTS GRID */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Productivity Area Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border/30 shadow-sm md:col-span-2 space-y-6 flex flex-col text-left">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-lg leading-none">Productivity Timeline</h3>
              <p className="text-xs text-slate-400">Weekly task velocity trends</p>
            </div>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>
          
          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-dark-border/10" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px'
                  }} 
                />
                <Area type="monotone" dataKey="created" name="Created" stroke="#a855f7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCreated)" />
                <Area type="monotone" dataKey="completed" name="Completed" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCompleted)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Allocation Pie Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border/30 shadow-sm space-y-6 flex flex-col justify-between text-left">
          <div>
            <h3 className="font-bold text-lg leading-none mb-1">Status Allocation</h3>
            <p className="text-xs text-slate-400 font-medium">Breakdown by current workflow states</p>
          </div>

          <div className="h-44 flex items-center justify-center relative">
            {pieData.length === 0 ? (
              <div className="text-xs text-slate-400">Create tasks to view allocation</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-extrabold">{totalTasks}</span>
              <span className="text-[9px] uppercase font-bold text-slate-400">Total Items</span>
            </div>
          </div>

          {/* Pie Legends */}
          <div className="space-y-2">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="font-medium text-slate-500 dark:text-slate-400">{d.name}</span>
                </div>
                <span className="font-extrabold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. DEADLINES & ACTIVITY TIMELINE GRID */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Deadlines Component */}
        <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border/30 shadow-sm space-y-6 text-left">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg leading-none">Upcoming Deadlines</h3>
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-4">
            {upcomingDeadlines.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No pending deadlines! Nice.</div>
            ) : (
              upcomingDeadlines.map(t => {
                const isOverdue = new Date(t.dueDate) < new Date();
                return (
                  <div key={t._id} className="p-3.5 rounded-2xl bg-slate-50/50 dark:bg-dark-bg/30 border border-slate-100 dark:border-dark-border/20 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <span className="font-semibold text-xs truncate block">{t.title}</span>
                      <span className={`text-[10px] font-bold ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`}>
                        {isOverdue ? 'Overdue' : 'Due'} {new Date(t.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                      t.priority === 'Urgent' ? 'bg-red-500/10 text-red-500' :
                      t.priority === 'High' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-slate-500/10 text-slate-500'
                    }`}>
                      {t.priority}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Activity Logs Timeline */}
        <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border/30 shadow-sm md:col-span-2 space-y-6 text-left">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg leading-none">Recent Activity Timeline</h3>
            <Zap className="w-5 h-5 text-slate-400 animate-pulse" />
          </div>

          <div className="relative border-l border-slate-100 dark:border-dark-border/10 pl-6 ml-2.5 space-y-6 max-h-72 overflow-y-auto pr-2">
            {logs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No activity recorded yet.</div>
            ) : (
              logs.slice(0, 8).map((log, idx) => (
                <div key={log._id || idx} className="relative">
                  {/* Orb node indicator */}
                  <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-brand-indigo border border-white dark:border-dark-card ring-4 ring-brand-indigo/15 shrink-0" />
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-white leading-none">{log.action}</span>
                      <span className="text-[9px] text-slate-400 font-semibold">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-normal">{log.details}</p>
                    {log.user && (
                      <span className="text-[10px] text-brand-indigo/80 dark:text-brand-cyan/80 font-bold">
                        by {log.user.name}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
