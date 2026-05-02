import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { eventAPI, registrationAPI } from '../services/api';
import { toast } from 'react-toastify';
import EventCard from '../components/EventCard';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await eventAPI.getAll();
      setEvents(res.data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      await registrationAPI.register(eventId);
      toast.success('Successfully registered for the event!');
      fetchEvents(); // Refresh to update registration status
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    }
  };

  const handleCancelRegistration = async (eventId) => {
    if (!window.confirm('Are you sure you want to cancel your registration?')) {
      return;
    }

    try {
      await registrationAPI.cancel(eventId);
      toast.success('Registration cancelled');
      fetchEvents();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel registration';
      toast.error(message);
    }
  };

  const handleApprove = async (eventId, type) => {
    try {
      if (type === 'committee') {
        await eventAPI.committeeApprove(eventId);
        toast.success('Event approved and forwarded to Principal');
      } else {
        await eventAPI.principalApprove(eventId);
        toast.success('Event approved! Now visible to all students.');
      }
      fetchEvents();
    } catch (error) {
      const message = error.response?.data?.message || 'Approval failed';
      toast.error(message);
    }
  };

  const handleReject = async (eventId) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await eventAPI.reject(eventId, reason);
      toast.success('Event rejected');
      fetchEvents();
    } catch (error) {
      const message = error.response?.data?.message || 'Rejection failed';
      toast.error(message);
    }
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.status === filter;
  });

  const getWelcomeMessage = () => {
    switch (user?.role) {
      case 'student':
        return 'Browse and register for upcoming campus events';
      case 'organizer':
        return 'Manage your events and track registrations';
      case 'committee':
        return 'Review and approve events for the campus';
      case 'principal':
        return 'Final approval for campus events';
      default:
        return 'Welcome to Campus Event Management';
    }
  };

  const showFilters = user?.role === 'organizer' || user?.role === 'committee' || user?.role === 'principal';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome, {user?.name}!
          </h1>
          <p className="text-lg text-gray-600">{getWelcomeMessage()}</p>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-gradient-blue-purple text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilter('Pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'Pending'
                  ? 'bg-gradient-blue-purple text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('CommitteeApproved')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'CommitteeApproved'
                  ? 'bg-gradient-blue-purple text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Committee Approved
            </button>
            <button
              onClick={() => setFilter('Approved')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'Approved'
                  ? 'bg-gradient-blue-purple text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('Rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'Rejected'
                  ? 'bg-gradient-blue-purple text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Rejected
            </button>
          </div>
        )}

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-lg">
            <p className="text-gray-600 text-lg">No events found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                userRole={user?.role}
                onRegister={handleRegister}
                onCancelRegistration={handleCancelRegistration}
                onApprove={handleApprove}
                onReject={handleReject}
                onRefresh={fetchEvents}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
