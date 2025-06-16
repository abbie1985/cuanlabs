
import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '../constants';

const UpgradePremiumPage: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-20 text-center">
      <div className="bg-white p-10 rounded-xl shadow-2xl max-w-lg mx-auto">
        <i className="fas fa-rocket text-5xl text-primary mb-6"></i>
        <h1 className="text-3xl font-bold text-darktext mb-4">Upgrade ke Premium</h1>
        <p className="text-gray-600 mb-8">
          Fitur untuk upgrade ke akun Premium akan segera hadir! Dengan akun Premium, Anda akan mendapatkan akses ke fitur-fitur eksklusif, konten premium, dan berbagai keuntungan lainnya untuk memaksimalkan potensi cuan Anda.
        </p>
        <p className="text-gray-500 mb-8">
          Kami sedang bekerja keras untuk menyiapkannya. Nantikan pengumuman selanjutnya!
        </p>
        <Link 
          to={ROUTE_PATHS.DASHBOARD} 
          className="bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
};

export default UpgradePremiumPage;