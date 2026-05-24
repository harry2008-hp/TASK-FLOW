import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  Users as UsersIcon, 
  ShieldCheck, 
  Trash2, 
  Edit3, 
  Search, 
  Calendar,
  AlertTriangle,
  FolderLock,
  UserPlus
} from 'lucide-react';
import axios from 'axios';
import { fetchTasks, deleteTask } from '../redux/taskSlice';

const AdminPanel = () => {
  const dispatch = useDispatch();

  const { tasks } = useSelector(state => state.tasks);
  const { user: currentUser } = useSelector(state => state.auth);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');
  const [tasksSearch, setTasksSearch] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'tasks'
  const [operationMsg, setOperationMsg] = useState('');

  useEffect(() => {
    dispatch(fetchTasks());
    fetchUsers();
  }, [dispatch]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem('tf_token') || sessionStorage.getItem('tf_token');
      if (!token) return;

      const res = await axios.get('http://localhost:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.data.users);
    } catch (err) {
      console.error('Failed to fetch users:', err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    if (userId === currentUser._id) {
      alert('You cannot change your own admin privileges!');
      return;
    }

    const nextRole = currentRole === 'Admin' ? 'User' : 'Admin';
    if (!window.confirm(`Are you sure you want to change this user's role to ${nextRole}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('tf_token') || sessionStorage.getItem('tf_token');
      await axios.put(`http://localhost:5000/api/auth/users/${userId}/role`, 
        { role: nextRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOperationMsg(`Successfully updated role to ${nextRole}!`);
      setTimeout(() => setOperationMsg(''), 3000);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteTaskAdmin = (id) => {
    if (window.confirm('ADMIN ALERT: Are you sure you want to delete this task?')) {
      dispatch(deleteTask(id));
    }
  };

  // Calculations
  const totalUsersCount = users.length;
  const adminUsersCount = users.filter(u => u.role === 'Admin').length;
  const regularUsersCount = users.filter(u => u.role === 'User').length;
  const platformTasksCount = tasks.length;

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(usersSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(usersSearch.toLowerCase())
  );

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(tasksSearch.toLowerCase()) ||
    (t.createdBy?.name || '').toLowerCase().includes(tasksSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      
      {/* Admin Title Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-[#121c32] text-white border border-white/10 relative overflow-hidden flex items-center justify-between">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <FolderLock className="w-5 h-5 text-brand-cyan" />
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Enterprise Console</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">Security Admin Controls</h1>
          <p className="text-xs text-slate-400">Manage all registered users, tasks, and system role settings across the tenant.</p>
        </div>
        
        <ShieldCheck className="w-16 h-16 text-brand-cyan/20 absolute -right-2 top-2 shrink-0 pointer-events-none" />
      </div>

      {/* Admin Statistics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border/30 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-2">Total Tenants</span>
          <h3 className="text-2xl font-extrabold tracking-tight leading-none">{totalUsersCount}</h3>
          <p className="text-[9px] text-slate-400 mt-1">Active registered members</p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border/30 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-2">Platform Tasks</span>
          <h3 className="text-2xl font-extrabold tracking-tight leading-none">{platformTasksCount}</h3>
          <p className="text-[9px] text-slate-400 mt-1">Aggregated task volume</p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border/30 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-2">System Admins</span>
          <h3 className="text-2xl font-extrabold tracking-tight leading-none text-brand-cyan">{adminUsersCount}</h3>
          <p className="text-[9px] text-slate-400 mt-1">Highest privilege roles</p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border/30 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-2">Regular Users</span>
          <h3 className="text-2xl font-extrabold tracking-tight leading-none text-brand-purple">{regularUsersCount}</h3>
          <p className="text-[9px] text-slate-400 mt-1">Standard workspace accounts</p>
        </div>
      </div>

      {operationMsg && (
        <div className="p-3 text-xs bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-xl">
          {operationMsg}
        </div>
      )}

      {/* Main Console Layout */}
      <div className="bg-white dark:bg-dark-card rounded-3xl border border-slate-100 dark:border-dark-border/20 shadow-sm overflow-hidden">
        
        {/* Toggle tabs */}
        <div className="flex border-b border-slate-100 dark:border-dark-border/10 bg-slate-50/50 dark:bg-dark-card/20 px-6 py-2">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition ${activeTab === 'users' ? 'border-brand-indigo text-brand-indigo' : 'border-transparent text-slate-400'}`}
          >
            Users Registry ({totalUsersCount})
          </button>
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition ${activeTab === 'tasks' ? 'border-brand-indigo text-brand-indigo' : 'border-transparent text-slate-400'}`}
          >
            System Tasks List ({platformTasksCount})
          </button>
        </div>

        {/* Console Body */}
        <div className="p-6">
          
          {activeTab === 'users' ? (
            
            /* USERS MANAGER VIEW */
            <div className="space-y-4">
              {/* Search user */}
              <div className="relative max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-dark-bg/60 border border-slate-200/60 dark:border-dark-border/50 rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-indigo/40"
                />
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-dark-border/15 text-slate-400 uppercase font-bold tracking-wider">
                      <th className="pb-3 pl-2">User details</th>
                      <th className="pb-3">Role</th>
                      <th className="pb-3">Email Address</th>
                      <th className="pb-3 text-right pr-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-dark-border/10">
                    {loadingUsers ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-slate-400">Loading directory...</td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-slate-400">No users found.</td>
                      </tr>
                    ) : (
                      filteredUsers.map(u => (
                        <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-dark-bg/25 transition">
                          <td className="py-3.5 pl-2 flex items-center gap-3">
                            <div className={`w-8 h-8 rounded bg-gradient-to-tr ${u.avatar || 'from-indigo-500 to-purple-500'} text-white font-bold flex items-center justify-center`}>
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-left">
                              <span className="font-semibold text-slate-800 dark:text-white block leading-none mb-1">{u.name}</span>
                              <span className="text-[10px] text-slate-400 font-medium">UID: {u._id}</span>
                            </div>
                          </td>
                          <td className="py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${u.role === 'Admin' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25' : 'bg-slate-500/10 text-slate-400 border border-slate-500/15'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-500 dark:text-slate-400">
                            {u.email}
                          </td>
                          <td className="py-3.5 text-right pr-2">
                            <button 
                              onClick={() => handleToggleRole(u._id, u.role)}
                              disabled={u._id === currentUser._id}
                              className={`px-3 py-1.5 rounded-lg font-bold text-[10px] transition disabled:opacity-50 ${u.role === 'Admin' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20' : 'bg-brand-indigo/10 text-brand-indigo dark:bg-brand-cyan/10 dark:text-brand-cyan border border-brand-indigo/20 hover:bg-brand-indigo/25'}`}
                            >
                              {u.role === 'Admin' ? 'Demote' : 'Promote'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            
            /* PLATFORM TASKS VIEW */
            <div className="space-y-4">
              {/* Search tasks */}
              <div className="relative max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search tasks title or creator..." 
                  value={tasksSearch}
                  onChange={(e) => setTasksSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-dark-bg/60 border border-slate-200/60 dark:border-dark-border/50 rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-indigo/40"
                />
              </div>

              {/* Tasks table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-dark-border/15 text-slate-400 uppercase font-bold tracking-wider">
                      <th className="pb-3 pl-2">Task Details</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Creator</th>
                      <th className="pb-3">Due Date</th>
                      <th className="pb-3 text-right pr-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-dark-border/10">
                    {filteredTasks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-400">No matching tasks found.</td>
                      </tr>
                    ) : (
                      filteredTasks.map(t => (
                        <tr key={t._id} className="hover:bg-slate-50/50 dark:hover:bg-dark-bg/25 transition">
                          <td className="py-3.5 pl-2 text-left">
                            <span className="font-semibold text-slate-800 dark:text-white block truncate max-w-xs">{t.title}</span>
                            <span className="text-[10px] text-slate-400 leading-none">Priority: {t.priority}</span>
                          </td>
                          <td className="py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              t.status === 'Completed' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/15' :
                              t.status === 'In Progress' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/15' :
                              'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span className="font-medium">{t.createdBy?.name || 'Unknown User'}</span>
                          </td>
                          <td className="py-3.5 text-slate-400">
                            {new Date(t.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="py-3.5 text-right pr-2">
                            <button 
                              onClick={() => handleDeleteTaskAdmin(t._id)}
                              className="p-2 rounded text-slate-400 hover:text-rose-500 transition"
                              title="Delete Task (Force)"
                            >
                              <Trash2 className="w-4 h-4 inline" />
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

      </div>

    </div>
  );
};

export default AdminPanel;
