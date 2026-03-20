import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: API_BASE });

export const generateCreature = (prompt) =>
  api.post('/generate', { prompt }).then((r) => r.data);

export const fetchCreatures = (limit = 20, skip = 0) =>
  api.get('/creatures', { params: { limit, skip } }).then((r) => r.data);

export const fetchCreature = (id) =>
  api.get(`/creatures/${id}`).then((r) => r.data);

export const getThumbUrl = (id) => `${API_BASE}/images/${id}/thumb`;
export const getFullUrl  = (id) => `${API_BASE}/images/${id}/full`;
