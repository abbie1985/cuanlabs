
import React from 'react';

const AdminPagesManagementPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manajemen Halaman Statis</h1>
      <div className="bg-white p-6 rounded-xl shadow-lg text-center">
        <i className="fas fa-file-alt fa-3x text-accent mb-4"></i>
        <p className="text-gray-600 text-lg">
          Fitur manajemen halaman statis (seperti Tentang Kami, Kontak, dll.) akan segera hadir!
        </p>
        <p className="text-gray-500 mt-2">
          Ini akan memungkinkan Anda untuk membuat dan mengedit konten halaman dengan mudah.
        </p>
      </div>
    </div>
  );
};

export default AdminPagesManagementPage;
