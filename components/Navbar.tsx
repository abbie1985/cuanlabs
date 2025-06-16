
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTE_PATHS } from '../constants';

const Navbar: React.FC = () => {
  const { isAuthenticated, currentUser, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTE_PATHS.LOGIN);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to={ROUTE_PATHS.HOME} className="text-2xl font-bold text-primary hover:text-primary-hover">
          CUANLABS
        </Link>
        <div className="flex items-center space-x-4">
          <Link to={ROUTE_PATHS.HOME} className="text-gray-700 hover:text-primary transition-colors">Home</Link>
          <Link to={ROUTE_PATHS.PRODUCTS} className="text-gray-700 hover:text-primary transition-colors">Produk</Link>
          <Link to={ROUTE_PATHS.CALCULATOR} className="text-gray-700 hover:text-primary transition-colors">Kalkulator</Link>
          <Link to={ROUTE_PATHS.BLOG} className="text-gray-700 hover:text-primary transition-colors">Blog</Link>
          
          {loading ? (
            <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
          ) : isAuthenticated && currentUser ? (
            <>
              <Link to={ROUTE_PATHS.DASHBOARD} className="text-gray-700 hover:text-primary transition-colors">
                <i className="fas fa-tachometer-alt mr-1"></i> Dashboard
              </Link>
              <Link to={ROUTE_PATHS.AFFILIATE} className="text-gray-700 hover:text-primary transition-colors">
                <i className="fas fa-handshake mr-1"></i> Afiliasi
              </Link>
              <span className="text-gray-700">Hi, {currentUser.name.split(' ')[0]}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to={ROUTE_PATHS.LOGIN} className="text-gray-700 hover:text-primary transition-colors">Login</Link>
              <Link
                to={ROUTE_PATHS.REGISTER}
                className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-lg transition-colors"
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
