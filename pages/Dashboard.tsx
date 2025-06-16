
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Transaction, Product } from '../types';
import { fetchUserTransactions, fetchProducts } from '../services/api'; // Assuming fetchProducts gives all product details including download links
import KalkulatorCuan from '../components/KalkulatorCuan';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [purchasedProducts, setPurchasedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (currentUser) {
        setLoading(true);
        try {
          const userTransactions = await fetchUserTransactions(currentUser.id);
          setTransactions(userTransactions);

          // Fetch all products to find details of purchased ones
          // In a real app, the transaction data might already contain full product details or dedicated endpoint for purchased products
          const allProducts = await fetchProducts();
          const userPurchasedProducts = allProducts.filter(product => 
            userTransactions.some(t => t.productId === product.id && t.status === 'completed')
          );
          setPurchasedProducts(userPurchasedProducts);

        } catch (error) {
          console.error("Error loading dashboard data:", error);
          // Handle error display if necessary
        } finally {
          setLoading(false);
        }
      }
    };

    loadDashboardData();
  }, [currentUser]);

  if (loading) {
    return <div className="container mx-auto px-6 py-8 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div><p className="mt-4">Memuat dashboard...</p></div>;
  }

  if (!currentUser) {
    return <div className="container mx-auto px-6 py-8 text-center text-red-500">User tidak ditemukan.</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8">Dashboard Pengguna</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Purchase History */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-darktext mb-4">Riwayat Pembelian</h2>
            {transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map(tx => (
                      <tr key={tx.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.productName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(tx.date).toLocaleDateString('id-ID')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp{tx.amount.toLocaleString('id-ID')}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                             tx.status === 'completed' ? 'bg-green-100 text-green-800' : 
                             tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                           }`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">Anda belum memiliki riwayat pembelian.</p>
            )}
          </div>

          {/* Downloadable Products */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-darktext mb-4">Produk Digital Saya</h2>
            {purchasedProducts.length > 0 ? (
              <ul className="space-y-3">
                {purchasedProducts.map(product => (
                  <li key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100">
                    <span className="text-gray-700">{product.name}</span>
                    {product.downloadUrl ? (
                       <a href={product.downloadUrl} target="_blank" rel="noopener noreferrer" download className="text-sm bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-3 rounded-md transition-colors">
                         <i className="fas fa-download mr-2"></i>Download
                       </a>
                    ) : (
                      <span className="text-sm text-gray-400">Link tidak tersedia</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Anda belum memiliki produk digital yang dapat diunduh.</p>
            )}
          </div>
        </div>

        {/* Sidebar / Exclusive Features */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-darktext mb-2">Profil Saya</h2>
            <p className="text-gray-600"><span className="font-medium">Nama:</span> {currentUser.name}</p>
            <p className="text-gray-600"><span className="font-medium">Email:</span> {currentUser.email}</p>
            <p className="text-gray-600 capitalize"><span className="font-medium">Membership:</span> 
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${currentUser.membershipTier === 'premium' ? 'bg-yellow-400 text-yellow-800' : 'bg-gray-200 text-gray-700'}`}>
                    {currentUser.membershipTier}
                </span>
            </p>
            {currentUser.membershipTier === 'free' && (
                <button className="mt-4 w-full bg-accent hover:bg-accent-hover text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                    Upgrade ke Premium
                </button>
            )}
          </div>
          
          {/* Exclusive Calculator for Premium Members */}
          {currentUser.membershipTier === 'premium' ? (
            <KalkulatorCuan isExclusive={true} />
          ) : (
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-6 rounded-lg shadow-lg text-white">
              <h2 className="text-xl font-semibold mb-3">Kalkulator Eksklusif</h2>
              <p className="text-sm mb-4 text-gray-300">Upgrade ke Premium untuk mengakses kalkulator dengan fitur lebih canggih dan analisis mendalam.</p>
              <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors">
                Lihat Keuntungan Premium
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
