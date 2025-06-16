
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { ROUTE_PATHS, ADMIN_ROUTE_PATHS } from '../constants.ts';

const Navbar: React.FC = () => {
  const { isAuthenticated, currentUser, logout, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    navigate(ROUTE_PATHS.LOGIN);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Diagnostic logs
  if (!loading && isAuthenticated && currentUser) {
    if (!currentUser.name) {
        console.warn('[Navbar] User is authenticated, but currentUser.name is missing. CurrentUser:', JSON.stringify(currentUser));
    }
  } else if (!loading && isAuthenticated && !currentUser) {
     console.warn('[Navbar] Anomaly: isAuthenticated is true, but currentUser is falsy and not loading.');
  }

  const userNameDisplay = currentUser?.name 
    ? currentUser.name.split(' ')[0] 
    : (currentUser?.email ? currentUser.email.split('@')[0] : 'User');

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to={ROUTE_PATHS.HOME} className="text-2xl font-bold text-primary hover:text-primary-hover">
          CUANLABS
        </Link>
        <div className="flex items-center space-x-2 md:space-x-4">
          <Link to={ROUTE_PATHS.HOME} className="text-gray-700 hover:text-primary transition-colors">Home</Link>
          <Link to={ROUTE_PATHS.PRODUCTS} className="text-gray-700 hover:text-primary transition-colors">Produk</Link>
          <Link to={ROUTE_PATHS.CALCULATOR} className="text-gray-700 hover:text-primary transition-colors">Kalkulator</Link>
          <Link to={ROUTE_PATHS.BLOG} className="text-gray-700 hover:text-primary transition-colors">Blog</Link>
          
          {loading ? (
            <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
          ) : isAuthenticated && currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center text-gray-700 hover:text-primary focus:outline-none"
                aria-haspopup="true"
                aria-expanded={isProfileDropdownOpen}
                aria-controls="profile-dropdown"
              >
                Halo, {userNameDisplay}!
                <i className={`fas fa-chevron-down ml-2 transform transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`}></i>
              </button>
              {isProfileDropdownOpen && (
                <div 
                  id="profile-dropdown"
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-50 py-1 border border-gray-200"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                >
                  <Link
                    to={ROUTE_PATHS.DASHBOARD}
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary"
                    role="menuitem"
                  >
                    <i className="fas fa-tachometer-alt mr-2"></i>Dashboard
                  </Link>
                  <Link
                    to={ROUTE_PATHS.AFFILIATE}
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary"
                    role="menuitem"
                  >
                    <i className="fas fa-handshake mr-2"></i>Afiliasi
                  </Link>
                  {isAdmin && (
                    <Link
                      to={ADMIN_ROUTE_PATHS.ADMIN_DASHBOARD}
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold"
                      role="menuitem"
                    >
                      <i className="fas fa-user-shield mr-2"></i>Panel Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary"
                    role="menuitem"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i>Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to={ROUTE_PATHS.LOGIN} className="text-gray-700 hover:text-primary transition-colors">Login</Link>
              <Link
                to={ROUTE_PATHS.REGISTER}
                className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-3 md:px-4 rounded-lg transition-colors text-sm md:text-base"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
