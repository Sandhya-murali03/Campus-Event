import { Link } from 'react-router-dom';
import {
  FaCalendar,
  FaMapMarkerAlt,
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaTrash
} from 'react-icons/fa';
import { formatDate, getStatusColor, getStatusLabel, getDaysRemaining, isDatePast } from '../utils/helpers';

const EventCard = ({
  event,
  userRole,
  onRegister,
  onCancelRegistration,
  onApprove,
  onReject,
  onRefresh
}) => {
  const registrationClosed = event.registrationClosed || isDatePast(event.lastRegistrationDate);
  const daysRemaining = getDaysRemaining(event.lastRegistrationDate);

  const canRegister =
    userRole === 'student' &&
    event.status === 'Approved' &&
    !event.isRegistered &&
    !registrationClosed;

  const canCancelRegistration =
    userRole === 'student' &&
    event.isRegistered &&
    !isDatePast(event.eventDate);

  const canEdit =
    userRole === 'organizer' &&
    (event.status === 'Pending' || event.status === 'Rejected');

  const canDelete =
    userRole === 'organizer' &&
    event.status === 'Pending';

  const canCommitteeApprove =
    userRole === 'committee' &&
    event.status === 'Pending';

  const canPrincipalApprove =
    userRole === 'principal' &&
    event.status === 'CommitteeApproved';

  const canReject =
    (userRole === 'committee' || userRole === 'principal') &&
    (event.status === 'Pending' || event.status === 'CommitteeApproved');

  return (
    <div className="bg-white bg-opacity-40 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white border-opacity-50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in">
      {/* Event Image */}
      <div className="relative h-48 bg-gradient-blue-purple overflow-hidden">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-6xl">
            🎉
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(event.status)}`}>
            {getStatusLabel(event.status)}
          </span>
        </div>

        {/* Category Badge */}
        {event.category && (
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white bg-opacity-90 text-purple-700">
              {event.category}
            </span>
          </div>
        )}
      </div>

      {/* Event Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {event.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-700 text-sm">
            <FaCalendar className="mr-2 text-purple-600" />
            <span>{formatDate(event.eventDate)}</span>
          </div>

          <div className="flex items-center text-gray-700 text-sm">
            <FaMapMarkerAlt className="mr-2 text-purple-600" />
            <span>{event.venue}</span>
          </div>

          <div className="flex items-center text-gray-700 text-sm">
            <FaUsers className="mr-2 text-purple-600" />
            <span>{event.registrationCount || 0} registered</span>
            {event.maxParticipants && (
              <span className="ml-1">/ {event.maxParticipants}</span>
            )}
          </div>

          {event.status === 'Approved' && !registrationClosed && (
            <div className="flex items-center text-sm">
              <FaClock className="mr-2 text-orange-600" />
              <span className="text-orange-600 font-semibold">
                {daysRemaining === 0 ? 'Last day to register!' : `${daysRemaining} days left`}
              </span>
            </div>
          )}

          {registrationClosed && event.status === 'Approved' && (
            <div className="flex items-center text-sm">
              <FaTimesCircle className="mr-2 text-red-600" />
              <span className="text-red-600 font-semibold">Registration Closed</span>
            </div>
          )}
        </div>

        {/* Rejection Reason */}
        {event.status === 'Rejected' && event.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-xs font-semibold text-red-800 mb-1">Rejection Reason:</p>
            <p className="text-xs text-red-700">{event.rejectionReason}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Student Actions */}
          {canRegister && (
            <button
              onClick={() => onRegister(event._id)}
              className="flex-1 bg-gradient-blue-purple text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-all transform hover:scale-105"
            >
              Register Now
            </button>
          )}

          {canCancelRegistration && (
            <button
              onClick={() => onCancelRegistration(event._id)}
              className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-all"
            >
              Cancel Registration
            </button>
          )}

          {event.isRegistered && (
            <div className="flex-1 bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold text-center flex items-center justify-center">
              <FaCheckCircle className="mr-2" />
              Registered
            </div>
          )}

          {/* Committee Actions */}
          {canCommitteeApprove && (
            <>
              <button
                onClick={() => onApprove(event._id, 'committee')}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-all"
              >
                Approve
              </button>
              <button
                onClick={() => onReject(event._id)}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-all"
              >
                Reject
              </button>
            </>
          )}

          {/* Principal Actions */}
          {canPrincipalApprove && (
            <>
              <button
                onClick={() => onApprove(event._id, 'principal')}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-all"
              >
                Final Approve
              </button>
              <button
                onClick={() => onReject(event._id)}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-all"
              >
                Reject
              </button>
            </>
          )}

          {/* Organizer Actions */}
          {canEdit && (
            <Link
              to={`/edit-event/${event._id}`}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-all text-center flex items-center justify-center"
            >
              <FaEdit className="mr-2" />
              Edit
            </Link>
          )}

          {/* View Details */}
          <Link
            to={`/event/${event._id}`}
            className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-600 transition-all text-center"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
