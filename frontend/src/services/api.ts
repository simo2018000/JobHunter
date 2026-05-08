import axios from 'axios';
import { Job, Stats } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
});

export const getJobs = async (status?: string) => {
  const params = status ? { status } : {};
  const response = await api.get<Job[]>('/jobs', { params });
  return response.data;
};

export const getJob = async (id: string) => {
  const response = await api.get<Job>(`/jobs/${id}`);
  return response.data;
};

export const updateJobStatus = async (id: string, status: string) => {
  const response = await api.patch(`/jobs/${id}/status`, { status });
  return response.data;
};

export const updateJobNotes = async (id: string, notes: string) => {
  const response = await api.patch(`/jobs/${id}/notes`, { notes });
  return response.data;
};

export const getStats = async () => {
  const response = await api.get<Stats>('/stats');
  return response.data;
};

export const triggerScraper = async () => {
  const response = await api.post('/scraper/trigger');
  return response.data;
};
