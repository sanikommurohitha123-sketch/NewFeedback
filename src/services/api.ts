import type { Consultant, Feedback, Country, Notification } from '../types';

const BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // GTM Manager endpoints
  getCountries: async (): Promise<Country[]> => {
    const res = await fetch(`${BASE_URL}/General/countries`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch countries');
    return res.json();
  },

  getAllConsultants: async (): Promise<Consultant[]> => {
    const res = await fetch(`${BASE_URL}/Consultant`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch consultants');
    return res.json();
  },

  // CU Manager endpoints
  getAssignedConsultants: async (_cuManagerId: number): Promise<Consultant[]> => {
    const res = await fetch(`${BASE_URL}/Consultant/assigned`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch assigned consultants');
    return res.json();
  },

  // Shared endpoints
  getFeedbackHistory: async (consultantId: number): Promise<Feedback[]> => {
    const res = await fetch(`${BASE_URL}/Feedback/${consultantId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch feedback history');
    return res.json();
  },

  submitFeedback: async (feedback: Omit<Feedback, 'id' | 'createdAt'>): Promise<Feedback> => {
    const res = await fetch(`${BASE_URL}/Feedback`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(feedback)
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || 'Failed to submit feedback');
    }
    return res.json();
  },

  getNotifications: async (_userId: number): Promise<Notification[]> => {
    const res = await fetch(`${BASE_URL}/General/notifications`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  markNotificationsRead: async (_userId: number): Promise<void> => {
    const res = await fetch(`${BASE_URL}/General/notifications/read`, { 
      method: 'POST', 
      headers: getHeaders() 
    });
    if (!res.ok) throw new Error('Failed to mark notifications as read');
  }
};
