import { formatDistanceToNow, format, isPast, differenceInDays } from 'date-fns';

// Format date for display
export const formatDate = (date) => {
  return format(new Date(date), 'PPP');
};

// Format date and time
export const formatDateTime = (date) => {
  return format(new Date(date), 'PPP p');
};

// Time ago format
export const timeAgo = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

// Check if date has passed
export const isDatePast = (date) => {
  return isPast(new Date(date));
};

// Get days remaining
export const getDaysRemaining = (date) => {
  const days = differenceInDays(new Date(date), new Date());
  return days > 0 ? days : 0;
};

// Get status badge color
export const getStatusColor = (status) => {
  const colors = {
    'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'CommitteeApproved': 'bg-blue-100 text-blue-800 border-blue-300',
    'Approved': 'bg-green-100 text-green-800 border-green-300',
    'Rejected': 'bg-red-100 text-red-800 border-red-300'
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
};

// Get status label
export const getStatusLabel = (status) => {
  const labels = {
    'Pending': 'Pending Review',
    'CommitteeApproved': 'Committee Approved',
    'Approved': 'Approved',
    'Rejected': 'Rejected'
  };
  return labels[status] || status;
};

// Validate file size
export const validateFileSize = (file, maxSizeMB = 5) => {
  const maxSize = maxSizeMB * 1024 * 1024;
  return file.size <= maxSize;
};

// Validate image file
export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
};

// Validate PDF file
export const validatePDFFile = (file) => {
  return file.type === 'application/pdf';
};

// Download file
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
