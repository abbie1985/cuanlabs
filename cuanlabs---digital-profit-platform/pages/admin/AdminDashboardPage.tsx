
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminDashboardStats } from '../../services/api';
import { AdminDashboardStats } from '../../types';
import { ADMIN_ROUTE_PATHS } from '../../constants';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  colorClass: string;
  linkTo?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass, linkTo }) => {
  const cardContent = (
    <>
      <div className={`p-3 rounded-full ${colorClass} text-white inline-block mb-3`}>
        <i className={`${icon} fa-2x`}></i>
      </div>
      <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
      <p className="text-gray-500">{title}</p>
    </>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="block bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1">
        {cardContent}
      </Link>
    );
  }
  return <div className="bg-white p-6 rounded-xl shadow-lg">{cardContent}</div>;
};

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAdminDashboardStats();
        setStats(data);
      } catch (err: any) {
        const errorMessage = err.message || 'Gagal memuat statistik dashboard.';
        console.error('Failed to load admin stats:', errorMessage, err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-3 text-gray-700">Memuat statistik...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{error}</div>;
  }

  if (!stats) {
    return <div className="text-center py-10 text-gray-500">Data statistik tidak tersedia.</div>;
  }

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Pengguna" value={stats.totalUsers} icon="fas fa-users" colorClass="bg-blue-500" linkTo={ADMIN_ROUTE_PATHS.ADMIN_USERS} />
        <StatCard title="Total Produk" value={stats.totalProducts} icon="fas fa-box" colorClass="bg-green-500" linkTo={ADMIN_ROUTE_PATHS.ADMIN_PRODUCTS} />
        <StatCard title="Produk Aktif" value={stats.totalActiveProducts} icon="fas fa-toggle-on" colorClass="bg-teal-500" linkTo={ADMIN_ROUTE_PATHS.ADMIN_PRODUCTS} />
        <StatCard title="Total Artikel Blog" value={stats.totalBlogPosts} icon="fas fa-newspaper" colorClass="bg-purple-500" linkTo={ADMIN_ROUTE_PATHS.ADMIN_POSTS} />
        <StatCard title="Artikel Terbit" value={stats.totalPublishedPosts} icon="fas fa-check-circle" colorClass="bg-indigo-500" linkTo={ADMIN_ROUTE_PATHS.ADMIN_POSTS} />
        {/* Placeholder for future stats */}
        {/* <StatCard title="Total Penjualan" value={`Rp ${stats.totalSales?.toLocaleString('id-ID') || 0}`} icon="fas fa-dollar-sign" colorClass="bg-yellow-500" /> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Aktivitas Terbaru</h2>
          <p className="text-gray-500">Belum ada aktivitas terbaru untuk ditampilkan.</p>
          {/* Placeholder for recent activities like new users, new orders, new posts */}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Pintasan Cepat</h2>
          <ul className="space-y-2">
            <li><Link to={ADMIN_ROUTE_PATHS.ADMIN_PRODUCTS_NEW} className="text-primary hover:underline"><i className="fas fa-plus-circle mr-2"></i>Tambah Produk Baru</Link></li>
            <li><Link to={ADMIN_ROUTE_PATHS.ADMIN_POSTS_NEW} className="text-primary hover:underline"><i className="fas fa-edit mr-2"></i>Tulis Artikel Baru</Link></li>
            <li><Link to={ADMIN_ROUTE_PATHS.ADMIN_USERS} className="text-primary hover:underline"><i className="fas fa-user-friends mr-2"></i>Lihat Semua Pengguna</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
