import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Product } from '../../types';
import { fetchProductById, createProductAdmin, updateProductAdmin } from '../../services/api';
import { ADMIN_ROUTE_PATHS } from '../../constants';

const productCategories: Product['category'][] = ['AI Prompt', 'Template', 'Script', 'Mini Course', 'Ebook', 'Bundle'];

const AdminProductForm: React.FC = () => {
  const { productId } = useParams<{ productId?: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(productId);

  const [product, setProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    category: 'Template',
    image_url: '',
    download_url: '',
    is_active: true,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && productId) {
      setLoading(true);
      fetchProductById(productId)
        .then(data => {
          if (data) setProduct(data);
          else setFormError('Produk tidak ditemukan.');
        })
        .catch(err => {
          console.error('Error fetching product details for edit:', err.message || err);
          setFormError(`Gagal memuat data produk: ${err.message || 'Error tidak diketahui'}`);
        })
        .finally(() => setLoading(false));
    }
  }, [productId, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        setProduct(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === 'number') {
        setProduct(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    }
    else {
        setProduct(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    if (!product.name || product.price === undefined || product.price <= 0 || !product.category || !product.description) {
        setFormError("Nama, deskripsi, harga (harus > 0), dan kategori wajib diisi.");
        setLoading(false);
        return;
    }

    try {
      const productDataToSave = {
        name: product.name!,
        description: product.description!,
        price: product.price!,
        category: product.category!,
        image_url: product.image_url || 'https://via.placeholder.com/300x200?text=No+Image', // Default image
        download_url: product.download_url,
        is_active: product.is_active === undefined ? true : product.is_active,
      };

      if (isEditing && productId) {
        await updateProductAdmin(productId, productDataToSave);
        // alert('Produk berhasil diperbarui!');
      } else {
        await createProductAdmin(productDataToSave);
        // alert('Produk berhasil ditambahkan!');
      }
      navigate(ADMIN_ROUTE_PATHS.ADMIN_PRODUCTS);
    } catch (err: any) {
      console.error('Failed to save product:', err.message || err);
      setFormError(`Gagal menyimpan produk: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && isEditing && !formError) { // Show loading only if not already showing an error from fetch
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-3 text-gray-700">Memuat detail produk...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}
      </h1>
      
      {formError && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">{formError}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nama Produk <span className="text-red-500">*</span></label>
          <input type="text" name="name" id="name" value={product.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Deskripsi <span className="text-red-500">*</span></label>
          <textarea name="description" id="description" value={product.description} onChange={handleChange} rows={4} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white"></textarea>
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp) <span className="text-red-500">*</span></label>
          <input type="number" name="price" id="price" value={product.price || ''} onChange={handleChange} required min="0" step="1000" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white" />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Kategori <span className="text-red-500">*</span></label>
          <select name="category" id="category" value={product.category} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white">
            {productCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
          <input type="url" name="image_url" id="image_url" value={product.image_url || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white" placeholder="https://example.com/image.jpg"/>
        </div>
        <div>
          <label htmlFor="download_url" className="block text-sm font-medium text-gray-700 mb-1">URL Download (Opsional)</label>
          <input type="url" name="download_url" id="download_url" value={product.download_url || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white" placeholder="https://example.com/downloadable-file.zip"/>
        </div>
        <div className="flex items-center">
          <input type="checkbox" name="is_active" id="is_active" checked={product.is_active === undefined ? true : product.is_active} onChange={handleChange} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary" />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">Aktifkan Produk</label>
        </div>
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <Link to={ADMIN_ROUTE_PATHS.ADMIN_PRODUCTS} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
            Batal
          </Link>
          <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400">
            {loading ? (isEditing ? 'Menyimpan...' : 'Menambahkan...') : (isEditing ? 'Simpan Perubahan' : 'Tambah Produk')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;