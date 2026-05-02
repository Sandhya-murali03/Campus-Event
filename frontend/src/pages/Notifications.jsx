import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { timeAgo } from '../utils/helpers';
import { FaBell, FaCheckCircle, FaTrash } from 'react-icons/fa';
import Navbar from '../components/Navbar';

const Notifications = () => {
  const navigate = useNavigate();
  const { updateUnreadCount } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      const params = filter === 'unread' ? { unreadOnly: true } : {};
      const res = await notificationAPI.getAll(params);
      setNotifications(res.data.notifications);
      updateUnreadCount(res.data.unreadCount);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      fetchNotifications();
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      fetchNotifications();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return;

    try {
      await notificationAPI.delete(id);
      fetchNotifications();
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleNotificationClick = (notification) => {
    if (notification.event) {
      navigate(`/event/${notification.event._id || notification.event}`);
    }
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <button
            onClick={handleMarkAllAsRead}
            className="bg-gradient-blue-purple text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-all"
          >
            Mark All as Read
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-gradient-blue-purple text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'unread'
                ? 'bg-gradient-blue-purple text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Unread
          </button>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white bg-opacity-60 backdrop-blur-lg rounded-2xl shadow-xl p-12 text-center border border-white border-opacity-50">
            <FaBell className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg">No notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white bg-opacity-60 backdrop-blur-lg rounded-xl shadow-lg p-4 border transition-all hover:shadow-xl cursor-pointer ${
                  notification.isRead
                    ? 'border-gray-200 bg-opacity-40'
                    : 'border-purple-300 bg-opacity-80'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                      )}
                      <p className={`${notification.isRead ? 'text-gray-700' : 'text-gray-900 font-semibold'}`}>
                        {notification.message}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">{timeAgo(notification.createdAt)}</p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification._id);
                        }}
                        className="text-green-600 hover:text-green-700 transition-colors"
                        title="Mark as read"
                      >
                        <FaCheckCircle size={18} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification._id);
                      }}
                      className="text-red-600 hover:text-red-700 transition-colors"
                      title="Delete"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
