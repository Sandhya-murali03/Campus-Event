import axios from 'axios';

const API_URL = '/api';

// Events API
export const eventAPI = {
  getAll: () => axios.get(`${API_URL}/events`),
  getById: (id) => axios.get(`${API_URL}/events/${id}`),
  create: (formData) => axios.post(`${API_URL}/events`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => axios.put(`${API_URL}/events/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => axios.delete(`${API_URL}/events/${id}`),
  committeeApprove: (id) => axios.put(`${API_URL}/events/${id}/committee-approve`),
  principalApprove: (id) => axios.put(`${API_URL}/events/${id}/principal-approve`),
  reject: (id, reason) => axios.put(`${API_URL}/events/${id}/reject`, { reason }),
  uploadFiles: (id, formData) => axios.post(`${API_URL}/events/${id}/upload-files`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getParticipants: (id) => axios.get(`${API_URL}/events/${id}/participants`),
  downloadParticipants: (id) => axios.get(`${API_URL}/events/${id}/download-participants`, {
    responseType: 'blob'
  })
};

// Registration API
export const registrationAPI = {
  register: (eventId) => axios.post(`${API_URL}/registrations/${eventId}`),
  cancel: (eventId) => axios.delete(`${API_URL}/registrations/${eventId}`),
  getMyRegistrations: () => axios.get(`${API_URL}/registrations/my-registrations`)
};

// Notifications API
export const notificationAPI = {
  getAll: (params) => axios.get(`${API_URL}/notifications`, { params }),
  markAsRead: (id) => axios.put(`${API_URL}/notifications/${id}/read`),
  markAllAsRead: () => axios.put(`${API_URL}/notifications/mark-all-read`),
  delete: (id) => axios.delete(`${API_URL}/notifications/${id}`),
  getUnreadCount: () => axios.get(`${API_URL}/notifications/unread-count`)
};

export default {
  eventAPI,
  registrationAPI,
  notificationAPI
};
