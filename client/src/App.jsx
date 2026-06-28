import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { 
  CheckCircle2, 
  Clock, 
  Play, 
  ListTodo, 
  AlertTriangle, 
  Sun, 
  Moon, 
  RefreshCw, 
  Activity 
} from 'lucide-react';

import { 
  getTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  checkHealth 
} from './api/tasks';

import FilterBar from './components/FilterBar';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import Modal from './components/Modal';
import SkeletonLoader from './components/SkeletonLoader';

const App = () => {
  // Theme State
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Task List State
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]); // Used for global stats computation
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Health Uptime State
  const [apiStatus, setApiStatus] = useState('checking');

  // Filter State
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    sortBy: 'createdAt',
    order: 'desc'
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Sync Dark Mode class
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Check API health status on load
  useEffect(() => {
    const verifyApi = async () => {
      try {
        await checkHealth();
        setApiStatus('online');
      } catch (err) {
        setApiStatus('offline');
      }
    };
    verifyApi();
  }, []);

  // Fetch tasks matching current filters
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await getTasks(filters);
      setTasks(response.data);
      setError(null);
    } catch (err) {
      setError('Could not connect to the server. Please check that the backend is running.');
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all tasks for general dashboard stats
  const fetchStats = async () => {
    try {
      const response = await getTasks({});
      setAllTasks(response.data);
    } catch (err) {
      console.error('Stats loading failed', err);
    }
  };

  // Fetch on filters change
  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      search: '',
      sortBy: 'createdAt',
      order: 'desc'
    });
    toast.success('Filters reset');
  };

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // CRUD operation: Create or Update Task
  const handleFormSubmit = async (taskData) => {
    try {
      if (editingTask) {
        // Update task
        const response = await updateTask(editingTask._id, taskData);
        toast.success('Task updated successfully');
        // Optimistic state updates
        setTasks(prev => prev.map(t => t._id === editingTask._id ? response.data : t));
        setAllTasks(prev => prev.map(t => t._id === editingTask._id ? response.data : t));
      } else {
        // Create task
        const response = await createTask(taskData);
        toast.success('Task created successfully');
        // Refetch or prepend to list
        setTasks(prev => [response.data, ...prev]);
        setAllTasks(prev => [response.data, ...prev]);
      }
      setIsModalOpen(false);
      setEditingTask(null);
      
      // Sync complete stats list in the background
      fetchStats();
    } catch (err) {
      throw err; // Form component will handle showing validation errors
    }
  };

  // CRUD operation: Delete Task
  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      toast.success('Task deleted successfully');
      setTasks((prev) => prev.filter((t) => t._id !== id));
      setAllTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      toast.error('Failed to delete task');
      throw err;
    }
  };

  // CRUD operation: Status fast toggle from card checkbox
  const handleStatusChange = async (id, nextStatus) => {
    try {
      const response = await updateTask(id, { status: nextStatus });
      toast.success(`Task marked as ${nextStatus.replace('-', ' ')}`);
      
      // Update local state list
      setTasks(prev => prev.map(t => t._id === id ? response.data : t));
      setAllTasks(prev => prev.map(t => t._id === id ? response.data : t));
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  // Compute stats metrics
  const totalTasks = allTasks.length;
  const pendingCount = allTasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = allTasks.filter((t) => t.status === 'in-progress').length;
  const completedCount = allTasks.filter((t) => t.status === 'completed').length;

  // Calculate overdue count (dueDate is in the past, status is not completed)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueCount = allTasks.filter((t) => {
    if (!t.dueDate || t.status === 'completed') return false;
    const due = new Date(t.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }).length;

  return (
    <div className="min-h-screen pb-12 transition-colors duration-300">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      {/* Header Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#0b0f19]/80">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-brand-600 p-2 text-white shadow-md shadow-brand-500/20">
              <ListTodo size={20} />
            </div>
            <div>
              <h1 className="font-heading text-lg font-extrabold tracking-tight text-slate-800 dark:text-white m-0 leading-none">
                Task Tracker
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`h-2 w-2 rounded-full ${
                  apiStatus === 'online' ? 'bg-emerald-500 animate-pulse' : apiStatus === 'offline' ? 'bg-rose-500' : 'bg-slate-400'
                }`} />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  {apiStatus === 'online' ? 'API Online' : apiStatus === 'offline' ? 'API Offline' : 'Connecting...'}
                </span>
              </div>
            </div>
          </div>

          {/* Theme switcher */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-xl border border-slate-200 p-2.5 hover:bg-slate-50 text-slate-500 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-400 transition-all cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* Main App Container */}
      <main className="mx-auto max-w-7xl px-4 mt-6 sm:px-6 lg:px-8">
        
        {/* Overdue Banner Notification */}
        {overdueCount > 0 && (
          <div className="mb-6 flex items-center justify-between rounded-xl bg-rose-50/80 border border-rose-200/50 p-4 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-300 animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="shrink-0 text-rose-600 dark:text-rose-400 animate-bounce" />
              <p className="text-sm font-semibold">
                Attention: You have {overdueCount} task{overdueCount > 1 ? 's' : ''} overdue!
              </p>
            </div>
          </div>
        )}

        {/* Dashboard Statistics Metrics */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
          {/* Total tasks */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-xs dark:border-slate-850 dark:bg-[#111827] flex items-center gap-4 transition-all duration-300 hover:shadow-md">
            <div className="rounded-xl bg-slate-100 p-3 text-slate-500 dark:bg-slate-850 dark:text-slate-400">
              <ListTodo size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{totalTasks}</p>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Tasks</p>
            </div>
          </div>

          {/* Pending tasks */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-xs dark:border-slate-850 dark:bg-[#111827] flex items-center gap-4 transition-all duration-300 hover:shadow-md">
            <div className="rounded-xl bg-amber-50 p-3 text-amber-500 dark:bg-amber-950/20 dark:text-amber-400">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{pendingCount}</p>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pending</p>
            </div>
          </div>

          {/* In-progress tasks */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-xs dark:border-slate-850 dark:bg-[#111827] flex items-center gap-4 transition-all duration-300 hover:shadow-md">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-500 dark:bg-blue-950/20 dark:text-blue-400">
              <Play size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{inProgressCount}</p>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">In Progress</p>
            </div>
          </div>

          {/* Completed tasks */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-xs dark:border-slate-850 dark:bg-[#111827] flex items-center gap-4 transition-all duration-300 hover:shadow-md">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-500 dark:bg-emerald-950/20 dark:text-emerald-400">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{completedCount}</p>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Completed</p>
            </div>
          </div>
        </section>

        {/* Filters Controls */}
        <FilterBar 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          onCreateTrigger={handleOpenCreateModal} 
        />

        {/* Task Grid / Content State */}
        {error ? (
          <div className="text-center p-12 rounded-2xl border border-rose-200/60 bg-white shadow-xs dark:border-rose-900/50 dark:bg-[#111827] mt-6 max-w-xl mx-auto animate-fade-in">
            <AlertTriangle className="mx-auto text-rose-500 mb-3" size={32} />
            <h3 className="font-heading text-base font-bold text-slate-800 dark:text-slate-200">
              Connection Failure
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
              {error}
            </p>
            <button
              onClick={fetchTasks}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white px-4 py-2.5 text-xs font-bold hover:opacity-90 active:scale-98 transition-all cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Try Reconnecting</span>
            </button>
          </div>
        ) : isLoading ? (
          <div className="mt-6">
            <SkeletonLoader count={6} />
          </div>
        ) : (
          <TaskList 
            tasks={tasks} 
            onEdit={handleOpenEditModal} 
            onDelete={handleDeleteTask} 
            onStatusChange={handleStatusChange} 
            onClearFilters={handleClearFilters} 
          />
        )}

      </main>

      {/* Modal Dialog for Create / Edit Forms */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Task Settings' : 'Create a New Task'}
      >
        <TaskForm
          editingTask={editingTask}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default App;
