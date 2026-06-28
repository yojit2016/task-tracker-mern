import axios from 'axios';

// Fallback to localhost if environment variable is not defined
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Fetch tasks matching the optional filters and sorting parameters.
 * @param {object} params - Query parameters: { status, priority, search, sortBy, order }
 */
export const getTasks = async (params = {}) => {
  const response = await api.get('/api/tasks', { params });
  return response.data;
};

/**
 * Fetch a single task by ID.
 * @param {string} id - Task ID
 */
export const getTask = async (id) => {
  const response = await api.get(`/api/tasks/${id}`);
  return response.data;
};

/**
 * Create a new task.
 * @param {object} taskData - Task payload: { title, description, status, priority, dueDate }
 */
export const createTask = async (taskData) => {
  const response = await api.post('/api/tasks', taskData);
  return response.data;
};

/**
 * Update an existing task.
 * @param {string} id - Task ID
 * @param {object} taskData - Fields to update
 */
export const updateTask = async (id, taskData) => {
  const response = await api.put(`/api/tasks/${id}`, taskData);
  return response.data;
};

/**
 * Delete a task.
 * @param {string} id - Task ID
 */
export const deleteTask = async (id) => {
  const response = await api.delete(`/api/tasks/${id}`);
  return response.data;
};

/**
 * Perform a health check uptime check.
 */
export const checkHealth = async () => {
  const response = await api.get('/api/health');
  return response.data;
};

export default api;
