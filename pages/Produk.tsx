
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { fetchProducts, processPayment } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ROUTE_PATHS } from '../constants';

const Produk: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
      } catch (err) {
        setError('Gagal memuat produk. Silakan coba lagi nanti.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleBuyClick = async (product: Product) => {
    setPaymentStatus(null); // Clear previous status
    if (!isAuthenticated || !currentUser) {
      alert('Anda harus login terlebih dahulu untuk melakukan pembelian.');
      navigate(ROUTE_PATHS.LOGIN, { state: { from: ROUTE_PATHS.PRODUCTS } });
      return;
    }
    
    // Simulate payment gateway interaction
    const confirmation = window.confirm(`Anda akan membeli "${product.name}" seharga Rp${product.price.toLocaleString('id-ID')}. Lanjutkan?`);
    if (confirmation) {
      // Simulate API call to payment gateway
      // In a real app, this would redirect to Midtrans/Stripe or open their modal
      console.log(`Simulating payment for product ID: ${product.id} by user ID: ${currentUser.id}`);
      alert(`Simulasi: Anda akan diarahkan ke halaman pembayaran untuk ${product.name}.`);
      
      try {
        const paymentResult = await processPayment(product.id, currentUser.id);
        if (paymentResult.success) {
           setPaymentStatus({ message: `${paymentResult.message} Transaksi ID: ${paymentResult.transactionId}`, type: 'success' });
           // Potentially redirect to a success page or update user's purchased products
           // For now, just show a message. In a real app, you'd update user dashboard.
           setTimeout(() => navigate(ROUTE_PATHS.DASHBOARD), 3000);
        } else {
           setPaymentStatus({ message: paymentResult.message, type: 'error' });
        }
      } catch (e) {
        setPaymentStatus({ message: 'Terjadi kesalahan saat proses pembayaran.', type: 'error' });
      }
    }
  };

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = products
    .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) {
    return <div className="container mx-auto px-6 py-8 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div><p className="mt-4">Memuat produk...</p></div>;
  }

  if (error) {
    return <div className="container mx-auto px-6 py-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-primary">Produk Digital CUANLABS</h1>
      <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
        Temukan berbagai tools dan sumber daya digital untuk membantu Anda meningkatkan produktivitas dan meraih cuan online.
      </p>

      {paymentStatus && (
        <div className={`p-4 mb-6 rounded-md text-center ${paymentStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {paymentStatus.message}
        </div>
      )}

      <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {category}
            </button>
          ))}
        </div>
        <input 
          type="text"
          placeholder="Cari produk..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary md:w-1/3 w-full"
        />
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} onBuyClick={handleBuyClick} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-10">
          Tidak ada produk yang cocok dengan kriteria pencarian Anda.
        </p>
      )}
    </div>
  );
};

export default Produk;
