import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchAllProductsAdmin, deleteProductAdmin } from '../../services/api';
import { Product } from '../../types';
import { ADMIN_ROUTE_PATHS } from '../../constants';

const ProductManagementPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllProductsAdmin();
      setProducts(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Gagal memuat data produk.';
      console.error('Failed to load products:', errorMessage, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (window.confirm(`Anda yakin ingin menghapus produk "${productName}"? Ini akan menonaktifkannya.`)) {
      try {
        await deleteProductAdmin(productId); // This now soft-deletes (sets is_active to false)
        // alert(`Produk "${productName}" telah dinonaktifkan.`);
        loadProducts(); // Refresh the list
      } catch (err: any) {
        alert(`Gagal menghapus produk: ${err.message || 'Unknown error'}`);
        console.error('Failed to delete product:', err.message || err);
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-3 text-gray-700">Memuat produk...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{error}</div>;
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen Produk</h1>
        <Link
          to={ADMIN_ROUTE_PATHS.ADMIN_PRODUCTS_NEW}
          className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center"
        >
          <i className="fas fa-plus mr-2"></i>Tambah Produk Baru
        </Link>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Cari produk berdasarkan nama atau kategori..."
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Produk</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Dibuat</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.length > 0 ? filteredProducts.map(product => (
              <tr key={product.id} className={`${!product.is_active ? 'bg-gray-100 opacity-70' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp{product.price.toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.created_at ? new Date(product.created_at).toLocaleDateString('id-ID') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                  <button
                    onClick={() => navigate(`${ADMIN_ROUTE_PATHS.ADMIN_PRODUCTS}/edit/${product.id}`)}
                    className="text-indigo-600 hover:text-indigo-900 hover:underline"
                    aria-label={`Edit ${product.name}`}
                  >
                    <i className="fas fa-edit"></i> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id, product.name)}
                    className="text-red-600 hover:text-red-900 hover:underline"
                    aria-label={`Hapus ${product.name}`}
                  >
                    <i className="fas fa-trash"></i> Hapus
                  </button>
                </td>
              </tr>
            )) : (
               <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">Tidak ada produk yang cocok dengan pencarian Anda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filteredProducts.length === 0 && searchTerm === '' && (
          <p className="text-center text-gray-500 py-10">Belum ada produk yang ditambahkan.</p>
      )}
    </div>
  );
};

export default ProductManagementPage;