import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBell, FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { notificationAPI } from '../services/api';

const Navbar = () => {
  const { user, logout, unreadNotifications, updateUnreadCount } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  // Poll for notifications every 30 seconds
  useEffect(() => {
    if (user) {
      const interval = setInterval(async () => {
        try {
          const res = await notificationAPI.getUnreadCount();
          updateUnreadCount(res.data.count);
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user, updateUnreadCount]);

  const getRoleBasedLinks = () => {
    switch (user?.role) {
      case 'student':
        return [
          { to: '/dashboard', label: 'Events' },
          { to: '/my-registrations', label: 'My Registrations' }
        ];
      case 'organizer':
        return [
          { to: '/dashboard', label: 'My Events' },
          { to: '/create-event', label: 'Create Event' }
        ];
      case 'committee':
        return [
          { to: '/dashboard', label: 'Review Events' }
        ];
      case 'principal':
        return [
          { to: '/dashboard', label: 'Approve Events' }
        ];
      default:
        return [];
    }
  };

  const navLinks = getRoleBasedLinks();

  return (
    <nav className="bg-gradient-blue-purple shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-white">
              🎓 Campus Events
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-white hover:text-purple-200 font-medium transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}

            {/* Notification Bell */}
            <button
              onClick={handleNotificationClick}
              className="relative text-white hover:text-purple-200 transition-colors duration-200"
            >
              <FaBell size={20} />
              {unreadNotifications > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-white hover:text-purple-200 transition-colors duration-200"
              >
                <FaUser />
                <span className="font-medium">{user?.name}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 animate-slide-down">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm text-gray-600">{user?.email}</p>
                    <p className="text-xs text-purple-600 font-semibold mt-1 capitalize">
                      {user?.role}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden text-white"
          >
            {showMobileMenu ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden pb-4 animate-slide-down">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setShowMobileMenu(false)}
                  className="text-white hover:text-purple-200 py-2 font-medium"
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  handleNotificationClick();
                  setShowMobileMenu(false);
                }}
                className="text-white hover:text-purple-200 py-2 font-medium text-left flex items-center space-x-2"
              >
                <FaBell />
                <span>Notifications</span>
                {unreadNotifications > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="text-white hover:text-purple-200 py-2 font-medium text-left flex items-center space-x-2"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
