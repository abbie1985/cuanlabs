
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ADMIN_ROUTE_PATHS } from '../../constants';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  const navItems = [
    { path: ADMIN_ROUTE_PATHS.ADMIN_DASHBOARD, label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { path: ADMIN_ROUTE_PATHS.ADMIN_USERS, label: 'Manajemen User', icon: 'fas fa-users-cog' },
    { path: ADMIN_ROUTE_PATHS.ADMIN_PRODUCTS, label: 'Manajemen Produk', icon: 'fas fa-box-open' },
    { path: ADMIN_ROUTE_PATHS.ADMIN_POSTS, label: 'Manajemen Artikel', icon: 'fas fa-newspaper' },
    { path: ADMIN_ROUTE_PATHS.ADMIN_ANALYTICS, label: 'Analitik', icon: 'fas fa-chart-line' },
    { path: ADMIN_ROUTE_PATHS.ADMIN_PAGES, label: 'Manajemen Halaman', icon: 'fas fa-file-alt' },
    // { path: ADMIN_ROUTE_PATHS.ADMIN_SETTINGS, label: 'Pengaturan', icon: 'fas fa-cogs' },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen p-4 space-y-2 fixed top-0 left-0 pt-20 shadow-lg md:relative md:pt-4 z-30"> {/* pt-20 for fixed navbar */}
      <div className="text-center mb-6 hidden md:block">
        <h2 className="text-xl font-semibold">Admin Panel</h2>
        {currentUser && <p className="text-sm text-gray-400">Welcome, {currentUser.name}</p>}
      </div>
      <nav>
        <ul>
          {navItems.map(item => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors ${
                  location.pathname === item.path || (item.path !== ADMIN_ROUTE_PATHS.ADMIN_DASHBOARD && location.pathname.startsWith(item.path))
                    ? 'bg-primary text-white font-semibold shadow-md'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <i className={`${item.icon} w-5 text-center`}></i>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};


const AdminLayout: React.FC = () => {
  return (
    <div className="flex bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-10 min-h-screen"> {/* Add min-h-screen for full height content area */}
        <Outlet /> {/* Child routes will be rendered here */}
      </main>
    </div>
  );
};

export default AdminLayout;
