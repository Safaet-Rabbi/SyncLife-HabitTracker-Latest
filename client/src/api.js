import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const getHabits = () => api.get('/habits');
export const createHabit = (habit) => api.post('/habits', habit);
export const updateHabit = (id, habit) => api.put(`/habits/${id}`, habit);
export const deleteHabit = (id) => api.delete(`/habits/${id}`);
export const getCompletions = (params) => api.get('/completions', { params });
export const toggleCompletion = (habitId, date) => api.post('/completions/toggle', { habitId, date });

export default api;