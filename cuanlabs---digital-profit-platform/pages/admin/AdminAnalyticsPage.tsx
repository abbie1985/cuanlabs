
import React, { useEffect, useState } from 'react';
import { fetchAdminDashboardStats } from '../../services/api'; 
import { AdminDashboardStats } from '../../types';

const StatDisplayCard: React.FC<{ title: string; value: string | number; icon: string; colorClass?: string }> = ({ title, value, icon, colorClass = "bg-primary" }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg text-center">
    <div className={`p-3 rounded-full ${colorClass} text-white inline-block mb-3`}>
        <i className={`${icon} fa-2x`}></i>
    </div>
    <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
    <p className="text-gray-500">{title}</p>
  </div>
);

const AdminAnalyticsPage: React.FC = () => {
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
        const errorMessage = err.message || 'Gagal memuat statistik pengguna.';
        console.error('Failed to load admin stats for analytics:', errorMessage, err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Analitik & Statistik Pengunjung</h1>
      
      {loading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="ml-3 text-gray-700">Memuat data pengguna...</p>
        </div>
      )}

      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatDisplayCard 
                title="Total Pengguna Terdaftar" 
                value={stats.totalUsers} 
                icon="fas fa-users"
                colorClass="bg-blue-500"
            />
            {/* Placeholder for future, more detailed visitor stats */}
             <div className="bg-white p-6 rounded-xl shadow-lg text-center border border-dashed border-gray-300">
                <div className="p-3 rounded-full bg-gray-200 text-gray-500 inline-block mb-3">
                    <i className="fas fa-chart-line fa-2x"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-400">Pengunjung Unik Harian</h3>
                <p className="text-gray-400">(Segera Hadir)</p>
            </div>
             <div className="bg-white p-6 rounded-xl shadow-lg text-center border border-dashed border-gray-300">
                 <div className="p-3 rounded-full bg-gray-200 text-gray-500 inline-block mb-3">
                    <i className="fas fa-eye fa-2x"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-400">Total Kunjungan Halaman</h3>
                <p className="text-gray-400">(Segera Hadir)</p>
            </div>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-xl shadow-lg mt-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Rencana Pengembangan Fitur Analitik</h2>
        <p className="text-gray-600">
          Ini adalah tampilan awal untuk analitik. Saat ini, kami menampilkan jumlah total pengguna yang telah mendaftar di platform CUANLABS.
        </p>
        <p className="text-gray-500 mt-3">
          Ke depannya, kami berencana untuk menambahkan metrik yang lebih detail dan berguna untuk Anda, seperti:
        </p>
        <ul className="list-disc list-inside text-gray-500 mt-2 ml-4 space-y-1">
            <li>Pengunjung unik harian, mingguan, dan bulanan.</li>
            <li>Rata-rata waktu yang dihabiskan di situs oleh pengunjung.</li>
            <li>Halaman-halaman yang paling sering dikunjungi.</li>
            <li>Sumber lalu lintas (misalnya, dari mesin pencari, media sosial, atau langsung).</li>
            <li>Analisis perilaku pengguna di dalam platform.</li>
            <li>Statistik demografi pengunjung (jika memungkinkan dan relevan).</li>
            <li>Dan banyak lagi fitur analitik lainnya untuk membantu Anda memahami audiens dan kinerja platform.</li>
        </ul>
         <p className="text-gray-500 mt-4">
          Kami sedang bekerja keras untuk menyediakan data dan insight yang berguna. Terima kasih atas kesabaran Anda!
        </p>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
