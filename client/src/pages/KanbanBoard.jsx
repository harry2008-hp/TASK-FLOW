import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Tag, 
  AlertCircle,
  MoreVertical,
  CheckCircle,
  Clock,
  Circle,
  Trash2,
  Edit3,
  UserPlus,
  Grid,
  List as ListIcon,
  X,
  User as UserIcon
} from 'lucide-react';
import axios from 'axios';
import { 
  fetchTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  moveTaskStatus,
  setFilter,
  resetFilters
} from '../redux/taskSlice';

const KanbanBoard = () => {
  const dispatch = useDispatch();

  const { tasks, filters, loading } = useSelector(state => state.tasks);
  const { user: currentUser } = useSelector(state => state.auth);

  // Component UI States
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [modalOpen, setModalOpen] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [activeTaskId, setActiveTaskId] = useState(null); // for editing
  
  // Task Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Pending');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [assignedTo, setAssignedTo] = useState('');

  useEffect(() => {
    dispatch(fetchTasks());
    fetchWorkspaceUsers();
  }, [dispatch, filters]);

  // Fetch registered users for dropdown assignments
  const fetchWorkspaceUsers = async () => {
    try {
      const token = localStorage.getItem('tf_token') || sessionStorage.getItem('tf_token');
      if (!token) return;
      const res = await axios.get('http://localhost:5000/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsersList(res.data.data.users);
    } catch (err) {
      console.error('Error fetching users:', err.message);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const openCreateModal = () => {
    setActiveTaskId(null);
    setTitle('');
    setDescription('');
    setDueDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]); // Tomorrow
    setPriority('Medium');
    setStatus('Pending');
    setTags([]);
    setAssignedTo('');
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setActiveTaskId(task._id);
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setPriority(task.priority);
    setStatus(task.status);
    setTags(task.tags || []);
    setAssignedTo(task.assignedTo?._id || task.assignedTo || '');
    setModalOpen(true);
  };

  const handleSaveTask = (e) => {
    e.preventDefault();
    if (!title || !dueDate) return;

    const taskPayload = {
      title,
      description,
      dueDate,
      priority,
      status,
      tags,
      assignedTo: assignedTo || null
    };

    if (activeTaskId) {
      dispatch(updateTask({ id: activeTaskId, taskData: taskPayload }));
    } else {
      dispatch(createTask(taskPayload));
    }
    setModalOpen(false);
  };

  const handleDeleteTask = (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTask(id));
    }
  };

  const columns = [
    { id: 'Pending', name: 'Pending Pipeline', icon: Circle, color: 'text-indigo-400 border-indigo-500/20' },
    { id: 'In Progress', name: 'In Execution', icon: Clock, color: 'text-purple-400 border-purple-500/20' },
    { id: 'Completed', name: 'Completed Work', icon: CheckCircle, color: 'text-cyan-400 border-cyan-500/20' }
  ];

  const getPriorityColor = (lvl) => {
    switch (lvl) {
      case 'Urgent': return 'bg-red-500/10 text-red-500';
      case 'High': return 'bg-amber-500/10 text-amber-500';
      case 'Medium': return 'bg-purple-500/10 text-brand-purple';
      default: return 'bg-slate-500/10 text-slate-500';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. FILTER BAR PANEL */}
      <div className="p-4 rounded-3xl bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={filters.search}
            onChange={(e) => dispatch(setFilter({ search: e.target.value }))}
            className="w-full bg-slate-50 dark:bg-dark-bg/60 border border-slate-200/60 dark:border-dark-border/50 rounded-2xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-indigo/40"
          />
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Priority Filter */}
          <select 
            value={filters.priority}
            onChange={(e) => dispatch(setFilter({ priority: e.target.value }))}
            className="bg-slate-50 dark:bg-dark-bg/60 border border-slate-200/60 dark:border-dark-border/50 rounded-2xl px-3 py-2.5 text-xs focus:outline-none text-slate-500 dark:text-slate-400"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>

          {/* Status Filter */}
          {viewMode === 'list' && (
            <select 
              value={filters.status}
              onChange={(e) => dispatch(setFilter({ status: e.target.value }))}
              className="bg-slate-50 dark:bg-dark-bg/60 border border-slate-200/60 dark:border-dark-border/50 rounded-2xl px-3 py-2.5 text-xs focus:outline-none text-slate-500 dark:text-slate-400"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          )}

          {/* Clear filters */}
          {(filters.search || filters.priority || filters.status || filters.tag) && (
            <button 
              onClick={() => dispatch(resetFilters())}
              className="text-xs text-rose-500 font-bold hover:underline"
            >
              Reset
            </button>
          )}

          {/* View Toggles */}
          <div className="flex bg-slate-100 dark:bg-dark-bg/80 p-1 rounded-xl border border-slate-200/30 dark:border-dark-border/10 shrink-0">
            <button 
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'kanban' ? 'bg-white dark:bg-dark-card text-brand-indigo shadow' : 'text-slate-400'}`}
              title="Kanban Board"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-white dark:bg-dark-card text-brand-indigo shadow' : 'text-slate-400'}`}
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Add Task Trigger */}
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-xs font-bold shadow-lg shadow-brand-indigo/25 hover:brightness-110 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>

        </div>
      </div>

      {/* 2. BOARDS CONTAINER */}
      <AnimatePresence mode="wait">
        {viewMode === 'kanban' ? (
          
          /* KANBAN BOARD VIEW */
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {columns.map(col => {
              const colTasks = tasks.filter(t => t.status === col.id);
              const ColIcon = col.icon;
              return (
                <div 
                  key={col.id}
                  className="rounded-3xl p-5 bg-slate-50/50 dark:bg-dark-card/25 border border-slate-200/50 dark:border-dark-border/10 min-h-[500px] flex flex-col"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const taskId = e.dataTransfer.getData('taskId');
                    if (taskId) {
                      dispatch(moveTaskStatus({ id: taskId, status: col.id }));
                    }
                  }}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <ColIcon className={`w-4 h-4 ${col.id === 'Completed' ? 'text-cyan-400' : col.id === 'In Progress' ? 'text-purple-400' : 'text-slate-400'}`} />
                      <span className="font-extrabold text-sm tracking-tight">{col.name}</span>
                    </div>
                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-dark-bg/60 text-slate-400 text-xs font-bold flex items-center justify-center">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Kanban Cards Scroll Column */}
                  <div className="flex-1 space-y-4 kanban-column-scroll pr-1">
                    {colTasks.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400/80 border-2 border-dashed border-slate-200/50 dark:border-dark-border/20 rounded-2xl">
                        Drop items here
                      </div>
                    ) : (
                      colTasks.map(task => (
                        <motion.div
                          key={task._id}
                          layoutId={task._id}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('taskId', task._id)}
                          whileHover={{ y: -3 }}
                          className="p-5 rounded-2xl glass-card text-left relative cursor-grab active:cursor-grabbing group"
                        >
                          {/* Card Content */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-extrabold tracking-wide ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                              
                              {/* Edit/Delete triggers on hover */}
                              <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                                <button 
                                  onClick={() => openEditModal(task)}
                                  className="p-1 rounded text-slate-400 hover:text-brand-indigo dark:hover:text-brand-cyan"
                                  title="Edit Task"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteTask(task._id)}
                                  className="p-1 rounded text-slate-400 hover:text-rose-500"
                                  title="Delete Task"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <h4 className="font-bold text-sm tracking-tight text-slate-800 dark:text-white leading-tight">
                              {task.title}
                            </h4>

                            {task.description && (
                              <p className="text-slate-400 text-[11px] leading-relaxed truncate-2-lines">
                                {task.description}
                              </p>
                            )}

                            {/* Tags list */}
                            {task.tags && task.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {task.tags.map((t, idx) => (
                                  <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-dark-bg/60 text-[9px] font-semibold text-slate-400 dark:text-slate-500">
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-dark-border/20 text-[10px] text-slate-400">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 shrink-0" />
                                <span>{new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                              </div>
                              
                              {/* Assigned User badge */}
                              {task.assignedTo ? (
                                <div 
                                  className={`w-6 h-6 rounded bg-gradient-to-tr ${task.assignedTo.avatar || 'from-indigo-500 to-purple-500'} text-white font-bold flex items-center justify-center shadow-sm`}
                                  title={`Assigned to ${task.assignedTo.name}`}
                                >
                                  {task.assignedTo.name.charAt(0).toUpperCase()}
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full border border-dashed border-slate-200 dark:border-dark-border/50 text-slate-400 flex items-center justify-center">
                                  <UserIcon className="w-3 h-3" />
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : (
          
          /* LIST VIEW */
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="rounded-3xl p-5 bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border/20 shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-dark-border/10 text-slate-400 uppercase font-bold tracking-wider">
                    <th className="pb-4 pl-4">Task Name</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Priority</th>
                    <th className="pb-4">Due Date</th>
                    <th className="pb-4">Assignee</th>
                    <th className="pb-4 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-border/10">
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        No active tasks found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    tasks.map(task => (
                      <tr key={task._id} className="hover:bg-slate-50/50 dark:hover:bg-dark-bg/25 transition">
                        <td className="py-4 pl-4 font-semibold text-slate-800 dark:text-white max-w-xs truncate">
                          {task.title}
                        </td>
                        <td className="py-4">
                          <select 
                            value={task.status}
                            onChange={(e) => dispatch(moveTaskStatus({ id: task._id, status: e.target.value }))}
                            className="bg-slate-50 dark:bg-dark-bg/40 border border-slate-200 dark:border-dark-border/50 rounded-lg px-2 py-1 focus:outline-none"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="py-4 text-slate-400">
                          {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-4">
                          {task.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded bg-gradient-to-tr ${task.assignedTo.avatar || 'from-indigo-500 to-purple-500'} text-white text-[10px] font-bold flex items-center justify-center`}>
                                {task.assignedTo.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-[11px]">{task.assignedTo.name}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Unassigned</span>
                          )}
                        </td>
                        <td className="py-4 text-right pr-4 space-x-2 shrink-0">
                          <button 
                            onClick={() => openEditModal(task)}
                            className="p-1 rounded text-slate-400 hover:text-brand-indigo"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4 inline" />
                          </button>
                          <button 
                            onClick={() => handleDeleteTask(task._id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-500"
                            title="Delete"
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. PREMIUM DIALOG MODAL (Slide Over / Center Box) */}
      <AnimatePresence>
        {modalOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            
            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg p-8 rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border/40 shadow-2xl z-50 overflow-hidden text-left"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-dark-border/10 mb-6">
                <h3 className="font-extrabold text-lg tracking-tight leading-none">
                  {activeTaskId ? 'Modify Task Details' : 'Create New Project Task'}
                </h3>
                <button 
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTask} className="space-y-4">
                
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Task Title</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. JWT Token Validation Middleware"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-dark-bg/60 border border-slate-200/60 dark:border-dark-border/50 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-indigo/50"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Task Description</label>
                  <textarea 
                    placeholder="Provide a detailed scope of this task..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-dark-bg/60 border border-slate-200/60 dark:border-dark-border/50 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-indigo/50"
                  />
                </div>

                {/* Priority, Status, Due date grid */}
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Due Date */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Due Date</label>
                    <input 
                      type="date" 
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-dark-bg/60 border border-slate-200/60 dark:border-dark-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/50"
                    />
                  </div>

                  {/* Priority */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Priority Level</label>
                    <select 
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-dark-bg/60 border border-slate-200/60 dark:border-dark-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 text-slate-600 dark:text-slate-300"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  {/* Assignee */}
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Assign User</label>
                    <select 
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-dark-bg/60 border border-slate-200/60 dark:border-dark-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 text-slate-600 dark:text-slate-300"
                    >
                      <option value="">Unassigned</option>
                      {usersList.map(u => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>

                </div>

                {/* Tags Inputs */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Tags / Categories (Press Enter)</label>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-dark-bg/60 border border-slate-200/60 dark:border-dark-border/50 flex flex-wrap gap-2 items-center">
                    {tags.map((t, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded bg-brand-indigo/15 text-brand-indigo dark:text-brand-cyan text-[10px] font-bold flex items-center gap-1">
                        <span>#{t}</span>
                        <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => handleRemoveTag(idx)} />
                      </span>
                    ))}
                    <input 
                      type="text" 
                      placeholder="Add tag..." 
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="bg-transparent text-xs outline-none flex-grow min-w-[80px]"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-dark-border/10">
                  <button 
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-dark-bg/40 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-indigo to-brand-purple hover:brightness-110 shadow-lg shadow-brand-indigo/20 transition"
                  >
                    Save Changes
                  </button>
                </div>

              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default KanbanBoard;
