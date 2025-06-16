
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard.tsx';
import { Product } from '../types.ts';
import { fetchProducts, processPayment } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { ROUTE_PATHS } from '../constants.ts';

const Produk: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);


  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();

  useEffect(() => {
    const loadProducts = async () => {
      console.log('Produk.tsx: loadProducts started');
      try {
        setLoading(true);
        setError(null);
        console.log('Produk.tsx: Calling fetchProducts...');
        const fetchedProducts = await fetchProducts();
        console.log('Produk.tsx: fetchProducts returned, product count:', fetchedProducts.length);
        setProducts(fetchedProducts);
      } catch (err: any) {
        const errorMessage = err.message || 'Gagal memuat produk. Silakan coba lagi nanti.';
        console.error('Produk.tsx: Fetch products error caught:', errorMessage, err);
        setError(errorMessage);
      } finally {
        console.log('Produk.tsx: loadProducts finally block, setting loading to false.');
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleBuyClick = async (product: Product) => {
    setPaymentStatus(null);
    if (!isAuthenticated || !currentUser) {
      alert('Anda harus login terlebih dahulu untuk melakukan pembelian.');
      navigate(ROUTE_PATHS.LOGIN, { state: { from: ROUTE_PATHS.PRODUCTS } });
      return;
    }
    
    const confirmation = window.confirm(`Anda akan membeli "${product.name}" seharga Rp${product.price.toLocaleString('id-ID')}. Lanjutkan?`);
    if (confirmation) {
      setIsProcessingPayment(true);
      try {
        // Pass product price and name to processPayment
        const paymentResult = await processPayment(product.id, currentUser.id, product.price, product.name);
        if (paymentResult.success) {
           setPaymentStatus({ message: `${paymentResult.message} Transaksi ID: ${paymentResult.transactionId}`, type: 'success' });
           setTimeout(() => navigate(ROUTE_PATHS.DASHBOARD), 3000);
        } else {
           setPaymentStatus({ message: paymentResult.message, type: 'error' });
        }
      } catch (e: any) {
        setPaymentStatus({ message: e.message || 'Terjadi kesalahan saat proses pembayaran.', type: 'error' });
        console.error('Payment processing error:', e);
      } finally {
        setIsProcessingPayment(false);
      }
    }
  };

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean) as string[])];


  const filteredProducts = products
    .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())));

  if (loading) {
    return <div className="container mx-auto px-6 py-8 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div><p className="mt-4">Memuat produk...</p></div>;
  }

  if (error) {
    return <div className="container mx-auto px-6 py-8 text-center text-red-500 bg-red-100 p-4 rounded-md">{error}</div>;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-primary">Produk Digital CUANLABS</h1>
      <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
        Temukan berbagai tools dan sumber daya digital untuk membantu Anda meningkatkan produktivitas dan meraih cuan online.
      </p>

      {isProcessingPayment && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="ml-3 text-white">Memproses pembayaran...</p>
        </div>
      )}

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
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary md:w-1/3 bg-white"
        />
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} onBuyClick={handleBuyClick} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 text-xl py-10">
          {products.length === 0 ? "Belum ada produk yang tersedia." : "Tidak ada produk yang cocok dengan kriteria pencarian Anda."}
        </p>
      )}
    </div>
  );
};

export default Produk;