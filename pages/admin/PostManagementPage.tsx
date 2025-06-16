import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchAllBlogPostsAdmin, deleteBlogPostAdmin } from '../../services/api';
import { BlogPost } from '../../types';
import { ADMIN_ROUTE_PATHS } from '../../constants';

const PostManagementPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllBlogPostsAdmin();
      setPosts(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Gagal memuat data artikel.';
      console.error('Failed to load posts:', errorMessage, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDeletePost = async (postId: string, postTitle: string) => {
    if (window.confirm(`Anda yakin ingin menghapus artikel "${postTitle}"? Tindakan ini tidak dapat diurungkan.`)) {
      try {
        await deleteBlogPostAdmin(postId);
        // alert(`Artikel "${postTitle}" telah dihapus.`);
        loadPosts(); // Refresh the list
      } catch (err: any) {
        alert(`Gagal menghapus artikel: ${err.message || 'Unknown error'}`);
        console.error('Failed to delete post:', err.message || err);
      }
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.author_name && post.author_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-3 text-gray-700">Memuat artikel...</p>
      </div>
    );
  }

  if (error) {
     return <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{error}</div>;
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen Artikel</h1>
        <Link
          to={ADMIN_ROUTE_PATHS.ADMIN_POSTS_NEW}
          className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center"
        >
          <i className="fas fa-plus mr-2"></i>Tulis Artikel Baru
        </Link>
      </div>

       <div className="mb-6">
        <input
          type="text"
          placeholder="Cari artikel berdasarkan judul atau penulis..."
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul Artikel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penulis</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tgl Terbit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPosts.length > 0 ? filteredPosts.map(post => (
              <tr key={post.id} className={`${!post.is_published ? 'bg-gray-100 opacity-80' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{post.title}</div>
                  <div className="text-xs text-gray-500">/{post.slug}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.author_name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    post.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {post.is_published ? 'Terbit' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {post.published_at ? new Date(post.published_at).toLocaleDateString('id-ID') : (post.is_published ? 'Segera' : '-')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                  <button
                    onClick={() => navigate(`${ADMIN_ROUTE_PATHS.ADMIN_POSTS}/edit/${post.id}`)}
                    className="text-indigo-600 hover:text-indigo-900 hover:underline"
                    aria-label={`Edit ${post.title}`}
                  >
                   <i className="fas fa-edit"></i> Edit
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.id, post.title)}
                    className="text-red-600 hover:text-red-900 hover:underline"
                    aria-label={`Hapus ${post.title}`}
                  >
                    <i className="fas fa-trash"></i> Hapus
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">Tidak ada artikel yang cocok dengan pencarian Anda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
       {filteredPosts.length === 0 && searchTerm === '' && (
          <p className="text-center text-gray-500 py-10">Belum ada artikel yang ditulis.</p>
      )}
    </div>
  );
};

export default PostManagementPage;