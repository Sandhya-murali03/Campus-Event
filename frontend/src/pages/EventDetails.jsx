import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI } from '../services/api';
import { toast } from 'react-toastify';
import { formatDateTime, getStatusColor, getStatusLabel } from '../utils/helpers';
import { FaCalendar, FaMapMarkerAlt, FaUsers, FaDownload } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const res = await eventAPI.getById(id);
      setEvent(res.data.event);

      // Fetch participants if user is organizer or event is approved
      if (user?.role !== 'student' || res.data.event.status === 'Approved') {
        try {
          const partRes = await eventAPI.getParticipants(id);
          setParticipants(partRes.data.participants);
        } catch (error) {
          console.log('Could not fetch participants');
        }
      }
    } catch (error) {
      toast.error('Failed to load event details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadParticipants = async () => {
    try {
      const res = await eventAPI.downloadParticipants(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${event.title}_participants.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Participants list downloaded!');
    } catch (error) {
      toast.error('Failed to download participants list');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white bg-opacity-60 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white border-opacity-50">
          {/* Event Image */}
          {event.image && (
            <div className="h-64 md:h-96 overflow-hidden">
              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{event.title}</h1>
                <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold border ${getStatusColor(event.status)}`}>
                  {getStatusLabel(event.status)}
                </span>
              </div>
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-start">
                <FaCalendar className="text-purple-600 mt-1 mr-3" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Event Date</p>
                  <p className="font-semibold">{formatDateTime(event.eventDate)}</p>
                </div>
              </div>

              <div className="flex items-start">
                <FaMapMarkerAlt className="text-purple-600 mt-1 mr-3" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Venue</p>
                  <p className="font-semibold">{event.venue}</p>
                </div>
              </div>

              <div className="flex items-start">
                <FaUsers className="text-purple-600 mt-1 mr-3" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Participants</p>
                  <p className="font-semibold">
                    {event.registrationCount} {event.maxParticipants && `/ ${event.maxParticipants}`}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <FaCalendar className="text-purple-600 mt-1 mr-3" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Registration Deadline</p>
                  <p className="font-semibold">{formatDateTime(event.lastRegistrationDate)}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">About This Event</h3>
              <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
            </div>

            {/* Organizer Info */}
            <div className="bg-purple-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Organized By</h3>
              <p className="text-gray-700">{event.createdBy?.name}</p>
              <p className="text-sm text-gray-600">{event.createdBy?.department}</p>
            </div>

            {/* Participants Section */}
            {(user?.role === 'organizer' || user?.role === 'committee' || user?.role === 'principal' || event.status === 'Approved') && participants.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Participants ({participants.length})</h3>
                  {(user?.role === 'organizer' || user?.role === 'committee' || user?.role === 'principal') && (
                    <button
                      onClick={handleDownloadParticipants}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-600 transition-all"
                    >
                      <FaDownload className="mr-2" />
                      Download Excel
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setShowParticipants(!showParticipants)}
                  className="mb-4 text-purple-600 font-semibold hover:text-purple-700"
                >
                  {showParticipants ? 'Hide' : 'Show'} Participants List
                </button>

                {showParticipants && (
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {participants.map((participant, index) => (
                        <div key={participant.id} className="bg-white rounded-lg p-3 shadow-sm">
                          <p className="font-semibold text-gray-900">{index + 1}. {participant.name}</p>
                          <p className="text-sm text-gray-600">{participant.email}</p>
                          <p className="text-xs text-gray-500">{participant.department} - Year {participant.year}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Back Button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-blue-purple text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
