import React, { useEffect, useState, FormEvent } from 'react';
import { fetchAllUsersAdmin, updateUserProfileAdmin, deleteUserProfileAdmin, createUserAdmin } from '../../services/api';
import { Profile } from '../../types';

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editFormData, setEditFormData] = useState<{ name: string; role: 'user' | 'admin'; membershipTier: 'free' | 'premium' }>({
    name: '',
    role: 'user',
    membershipTier: 'free',
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState<boolean>(false);

  // State for Add User Modal
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState<boolean>(false);
  const initialNewUserFormData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as 'user' | 'admin',
    membershipTier: 'free' as 'free' | 'premium',
  };
  const [newUserFormData, setNewUserFormData] = useState(initialNewUserFormData);
  const [isSubmittingNewUser, setIsSubmittingNewUser] = useState<boolean>(false);
  const [addUserFormError, setAddUserFormError] = useState<string | null>(null);


  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllUsersAdmin();
      setUsers(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Gagal memuat data pengguna.';
      console.error('Failed to load users:', errorMessage, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenEditModal = (user: Profile) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      role: user.role,
      membershipTier: user.membershipTier,
    });
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!window.confirm(`Anda yakin ingin memperbarui data pengguna ${editingUser.name}?`)) return;
    
    setIsSubmittingEdit(true);
    try {
      await updateUserProfileAdmin(editingUser.id, {
        name: editFormData.name,
        role: editFormData.role,
        membershipTier: editFormData.membershipTier,
      });
      alert('Data pengguna berhasil diperbarui.');
      setEditingUser(null);
      loadUsers(); // Refresh list
    } catch (err: any) {
      alert(`Gagal memperbarui data pengguna: ${err.message || 'Unknown error'}`);
      console.error('Error updating user:', err.message || err);
    } finally {
      setIsSubmittingEdit(false);
    }
  };
  
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Anda yakin ingin menghapus profil pengguna "${userName}"? Ini akan menghapus data mereka dari tabel profiles, tetapi tidak dari sistem autentikasi Supabase (auth.users). Penghapusan dari auth.users harus dilakukan manual di dashboard Supabase untuk keamanan.`)) return;
    
    try {
      await deleteUserProfileAdmin(userId);
      alert(`Profil pengguna "${userName}" berhasil dihapus dari tabel profiles.`);
      loadUsers(); // Refresh list
    } catch (err: any) {
      alert(`Gagal menghapus profil pengguna: ${err.message || 'Unknown error'}`);
      console.error('Error deleting user profile:', err.message || err);
    }
  };

  // Handlers for Add User Modal
  const handleOpenAddUserModal = () => {
    setNewUserFormData(initialNewUserFormData);
    setAddUserFormError(null);
    setIsAddUserModalOpen(true);
  };

  const handleNewUserFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUserFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateNewUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAddUserFormError(null);

    if (!newUserFormData.name || !newUserFormData.email || !newUserFormData.password || !newUserFormData.confirmPassword) {
      setAddUserFormError('Semua field wajib diisi (Nama, Email, Password, Konfirmasi Password).');
      return;
    }
    if (newUserFormData.password !== newUserFormData.confirmPassword) {
      setAddUserFormError('Password dan konfirmasi password tidak cocok.');
      return;
    }
    if (newUserFormData.password.length < 6) {
      setAddUserFormError('Password minimal harus 6 karakter.');
      return;
    }

    setIsSubmittingNewUser(true);
    try {
      const { success, error: createUserError } = await createUserAdmin({
        name: newUserFormData.name,
        email: newUserFormData.email,
        password: newUserFormData.password,
        role: newUserFormData.role,
        membershipTier: newUserFormData.membershipTier,
      });

      if (success) {
        alert('Pengguna baru berhasil dibuat.');
        setIsAddUserModalOpen(false);
        loadUsers(); // Refresh user list
      } else {
        setAddUserFormError(createUserError || 'Gagal membuat pengguna baru. Silakan coba lagi.');
      }
    } catch (err: any) {
      setAddUserFormError(`Terjadi kesalahan: ${err.message || 'Unknown error'}`);
      console.error('Error creating new user:', err.message || err);
    } finally {
      setIsSubmittingNewUser(false);
    }
  };


  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-3 text-gray-700">Memuat pengguna...</p>
      </div>
    );
  }

  if (error) {
     return <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{error}</div>;
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen Pengguna</h1>
        <button
            onClick={handleOpenAddUserModal}
            className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition-colors"
        >
            <i className="fas fa-plus mr-2"></i>Tambah User Baru
        </button>
      </div>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Cari pengguna berdasarkan nama atau email..."
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setIsAddUserModalOpen(false)}>
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4">Tambah Pengguna Baru</h2>
            {addUserFormError && <p className="text-red-500 text-sm bg-red-100 p-3 rounded-md mb-3">{addUserFormError}</p>}
            <form onSubmit={handleCreateNewUser} className="space-y-4">
              <div>
                <label htmlFor="new-name" className="block text-sm font-medium text-gray-700">Nama Lengkap <span className="text-red-500">*</span></label>
                <input type="text" id="new-name" name="name" value={newUserFormData.name} onChange={handleNewUserFormChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-white" />
              </div>
              <div>
                <label htmlFor="new-email" className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                <input type="email" id="new-email" name="email" value={newUserFormData.email} onChange={handleNewUserFormChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-white" />
              </div>
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">Password <span className="text-red-500">*</span></label>
                <input type="password" id="new-password" name="password" value={newUserFormData.password} onChange={handleNewUserFormChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-white" />
              </div>
              <div>
                <label htmlFor="new-confirmPassword" className="block text-sm font-medium text-gray-700">Konfirmasi Password <span className="text-red-500">*</span></label>
                <input type="password" id="new-confirmPassword" name="confirmPassword" value={newUserFormData.confirmPassword} onChange={handleNewUserFormChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-white" />
              </div>
              <div>
                <label htmlFor="new-role" className="block text-sm font-medium text-gray-700">Peran</label>
                <select id="new-role" name="role" value={newUserFormData.role} onChange={handleNewUserFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label htmlFor="new-membershipTier" className="block text-sm font-medium text-gray-700">Tier Membership</label>
                <select id="new-membershipTier" name="membershipTier" value={newUserFormData.membershipTier} onChange={handleNewUserFormChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm">
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400" disabled={isSubmittingNewUser}>
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:bg-gray-400" disabled={isSubmittingNewUser}>
                  {isSubmittingNewUser ? 'Menambahkan...' : 'Tambah Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setEditingUser(null)}>
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4">Edit Pengguna: {editingUser.name}</h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Nama</label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditFormChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700">Peran</label>
                <select
                  id="edit-role"
                  name="role"
                  value={editFormData.role}
                  onChange={handleEditFormChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label htmlFor="edit-membershipTier" className="block text-sm font-medium text-gray-700">Tier Membership</label>
                <select
                  id="edit-membershipTier"
                  name="membershipTier"
                  value={editFormData.membershipTier}
                  onChange={handleEditFormChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  disabled={isSubmittingEdit}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:bg-gray-400"
                  disabled={isSubmittingEdit}
                >
                  {isSubmittingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membership</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peran</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terdaftar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length > 0 ? filteredUsers.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`capitalize px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                       user.membershipTier === 'premium' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                       {user.membershipTier}
                   </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <span className={`capitalize px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                       user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                   }`}>
                       {user.role}
                   </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                  <button 
                    onClick={() => handleOpenEditModal(user)}
                    className="text-indigo-600 hover:text-indigo-900 hover:underline"
                    aria-label={`Edit ${user.name}`}
                  >
                    <i className="fas fa-edit mr-1"></i>Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(user.id, user.name)}
                    className="text-red-600 hover:text-red-900 hover:underline"
                    aria-label={`Hapus ${user.name}`}
                  >
                    <i className="fas fa-trash mr-1"></i>Hapus
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">Tidak ada pengguna yang cocok dengan pencarian Anda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filteredUsers.length === 0 && searchTerm === '' && (
          <p className="text-center text-gray-500 py-10">Belum ada pengguna terdaftar.</p>
      )}
    </div>
  );
};

export default UserManagementPage;