import { useState, useEffect } from 'react';
import { registrationAPI } from '../services/api';
import { toast } from 'react-toastify';
import { formatDate } from '../utils/helpers';
import { FaCalendar, FaMapMarkerAlt } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await registrationAPI.getMyRegistrations();
      setRegistrations(res.data.registrations);
    } catch (error) {
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Registrations</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        ) : registrations.length === 0 ? (
          <div className="bg-white bg-opacity-60 backdrop-blur-lg rounded-2xl shadow-xl p-12 text-center border border-white border-opacity-50">
            <p className="text-gray-600 text-lg mb-4">You haven't registered for any events yet</p>
            <Link
              to="/dashboard"
              className="inline-block bg-gradient-blue-purple text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registrations.map(({ event, registeredAt }) => (
              <div
                key={event._id}
                className="bg-white bg-opacity-60 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white border-opacity-50 hover:shadow-2xl transition-all"
              >
                <div className="h-40 bg-gradient-blue-purple flex items-center justify-center text-white text-5xl">
                  🎉
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-700 text-sm">
                      <FaCalendar className="mr-2 text-purple-600" />
                      <span>{formatDate(event.eventDate)}</span>
                    </div>

                    <div className="flex items-center text-gray-700 text-sm">
                      <FaMapMarkerAlt className="mr-2 text-purple-600" />
                      <span>{event.venue}</span>
                    </div>

                    <div className="text-xs text-gray-500">
                      Registered on: {formatDate(registeredAt)}
                    </div>
                  </div>

                  <Link
                    to={`/event/${event._id}`}
                    className="block w-full bg-gradient-blue-purple text-white text-center px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-all"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRegistrations;
