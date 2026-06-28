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
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
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
        toast.success('Saved');
        // Optimistic state updates
        setTasks(prev => prev.map(t => t._id === editingTask._id ? response.data : t));
        setAllTasks(prev => prev.map(t => t._id === editingTask._id ? response.data : t));
      } else {
        // Create task
        const response = await createTask(taskData);
        toast.success('Created');
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
      toast.success('Deleted');
      setTasks((prev) => prev.filter((t) => t._id !== id));
      setAllTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      toast.error('Failed to delete');
      throw err;
    }
  };

  // CRUD operation: Status fast toggle from card checkbox
  const handleStatusChange = async (id, nextStatus) => {
    try {
      const response = await updateTask(id, { status: nextStatus });
      toast.success(`Marked as ${nextStatus.replace('-', ' ')}`);
      
      // Update local state list
      setTasks(prev => prev.map(t => t._id === id ? response.data : t));
      setAllTasks(prev => prev.map(t => t._id === id ? response.data : t));
    } catch (err) {
      toast.error('Failed to update status');
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
    <div className="min-h-screen pb-12 bg-ledger-bg text-ledger-ink transition-colors duration-300">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      {/* Header Bar */}
      <header className="sticky top-0 z-40 border-b border-ledger-border bg-ledger-bg/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-sm bg-ledger-brass p-2 text-ledger-bg shadow-xs flex items-center justify-center">
              <ListTodo size={20} className="text-[#15201C]" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-ledger-ink m-0 leading-none">
              Ledger
            </h1>
          </div>

          {/* Theme switcher */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-sm border border-ledger-border p-2.5 hover:bg-ledger-surface/60 text-ledger-ink transition-all cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-ledger-brass"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={15} className="text-ledger-brass" /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      {/* Main App Container */}
      <main className="mx-auto max-w-7xl px-4 mt-6 sm:px-6 lg:px-8">
        
        {/* Overdue Banner Notification */}
        {overdueCount > 0 && (
          <div className="mb-6 flex items-center justify-between rounded-sm bg-status-high/10 border border-status-high/30 p-4 text-status-high animate-fade-in font-mono text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0 text-status-high animate-bounce" />
              <p className="font-bold">
                Attention: {overdueCount} task{overdueCount > 1 ? 's' : ''} overdue!
              </p>
            </div>
          </div>
        )}

        {/* Ledger Summary Strip */}
        <section className="border border-ledger-border bg-ledger-surface py-3 mb-6 grid grid-cols-2 md:grid-cols-4 rounded-sm divide-x divide-y md:divide-y-0 divide-ledger-border">
          <div className="p-2 text-center flex flex-col justify-center">
            <p className="font-mono text-3xl font-extrabold text-ledger-ink">{totalTasks}</p>
            <p className="font-mono text-[9px] font-semibold uppercase tracking-widest text-ledger-ink/50 mt-1">Total Entries</p>
          </div>
          <div className="p-2 text-center flex flex-col justify-center border-t border-ledger-border md:border-t-0">
            <p className="font-mono text-3xl font-extrabold text-status-pending">{pendingCount}</p>
            <p className="font-mono text-[9px] font-semibold uppercase tracking-widest text-ledger-ink/50 mt-1">Pending</p>
          </div>
          <div className="p-2 text-center flex flex-col justify-center border-t border-ledger-border md:border-t-0">
            <p className="font-mono text-3xl font-extrabold text-status-progress">{inProgressCount}</p>
            <p className="font-mono text-[9px] font-semibold uppercase tracking-widest text-ledger-ink/50 mt-1">In Progress</p>
          </div>
          <div className="p-2 text-center flex flex-col justify-center border-t border-ledger-border md:border-t-0">
            <p className="font-mono text-3xl font-extrabold text-status-completed">{completedCount}</p>
            <p className="font-mono text-[9px] font-semibold uppercase tracking-widest text-ledger-ink/50 mt-1">Completed</p>
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
          <div className="text-center p-12 rounded-sm border border-ledger-border bg-ledger-surface mt-6 max-w-xl mx-auto animate-fade-in">
            <AlertTriangle className="mx-auto text-status-high mb-3" size={28} />
            <h3 className="font-display text-base font-bold text-ledger-ink">
              Connection Failure
            </h3>
            <p className="text-xs text-ledger-ink/65 mt-1 max-w-sm mx-auto leading-relaxed">
              {error}
            </p>
            <button
              onClick={fetchTasks}
              className="mt-5 inline-flex items-center gap-2 rounded-sm bg-ledger-brass text-[#15201C] px-4 py-2 text-xs font-bold hover:bg-ledger-brass-hover transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-ledger-brass/45"
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
        title={editingTask ? 'Save' : 'New Task'}
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
