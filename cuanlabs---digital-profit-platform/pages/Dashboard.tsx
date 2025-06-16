
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { Transaction, Product } from '../types.ts';
import { fetchUserTransactions, fetchProductById, simulateUpgradeToPremium } from '../services/api.ts'; 
import KalkulatorCuan from '../components/KalkulatorCuan.tsx';
import { ROUTE_PATHS } from '../constants.ts';

const ToolCard: React.FC<{ title: string; description: string; icon: string; linkTo: string; bgColorClass: string }> = ({ title, description, icon, linkTo, bgColorClass }) => (
  <Link to={linkTo} className={`block p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1 ${bgColorClass}`}>
    <div className="flex items-center mb-3">
      <i className={`${icon} fa-2x text-white mr-4`}></i>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
    </div>
    <p className="text-sm text-gray-100">{description}</p>
  </Link>
);


const Dashboard = (): React.ReactElement => {
  const { currentUser, loading: authLoading, refreshCurrentUserProfile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [purchasedProducts, setPurchasedProducts] = useState<Product[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSimulatingUpgrade, setIsSimulatingUpgrade] = useState<boolean>(false);
  const [upgradeMessage, setUpgradeMessage] = useState<string | null>(null);


  useEffect(() => {
    const loadDashboardData = async () => {
      if (currentUser && currentUser.id) {
        setDataLoading(true);
        setError(null);
        setUpgradeMessage(null); 
        try {
          const userTransactions = await fetchUserTransactions(currentUser.id);
          setTransactions(userTransactions);

          const productIds = [...new Set(userTransactions
            .filter(t => t.status === 'completed')
            .map(t => t.product_id))];
          
          const fetchedProductsDetails: Product[] = [];
          for (const productId of productIds) {
            const productDetail = await fetchProductById(productId);
            if (productDetail) {
              fetchedProductsDetails.push(productDetail);
            }
          }
          setPurchasedProducts(fetchedProductsDetails);

        } catch (err: any) {
          const errorMessage = err.message || "Gagal memuat data dashboard.";
          console.error("Error loading dashboard data:", errorMessage, err);
          setError(errorMessage);
        } finally {
          setDataLoading(false);
        }
      } else if (!authLoading) {
        setDataLoading(false); 
      }
    };

    if (!authLoading) {
        loadDashboardData();
    }
  }, [currentUser, authLoading]);

  const handleSimulateUpgrade = async () => {
    if (!currentUser || !currentUser.id) return;
    if (!window.confirm("Ini hanya simulasi untuk tujuan pengembangan dan akan mengubah status membership Anda menjadi Premium di database. Lanjutkan?")) return;

    setIsSimulatingUpgrade(true);
    setUpgradeMessage(null);
    try {
      await simulateUpgradeToPremium(currentUser.id);
      await refreshCurrentUserProfile(); 
      setUpgradeMessage("Selamat! Anda sekarang adalah member Premium (Simulasi Berhasil).");
    } catch (err: any) {
      console.error("Error simulating premium upgrade:", err.message || err);
      setUpgradeMessage(`Gagal simulasi upgrade: ${err.message || 'Error tidak diketahui'}`);
    } finally {
      setIsSimulatingUpgrade(false);
    }
  };

  const isLoading = authLoading || dataLoading;

  if (isLoading) {
    return <div className="container mx-auto px-6 py-8 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div><p className="mt-4">Memuat dashboard...</p></div>;
  }

  if (error) {
    return <div className="container mx-auto px-6 py-8 text-center text-red-500 bg-red-100 p-4 rounded-md">{error}</div>;
  }

  if (!currentUser) {
    return <div className="container mx-auto px-6 py-8 text-center text-red-500">Anda harus login untuk melihat dashboard.</div>;
  }

  const getProductNameForTransaction = (productId: string): string => {
    const product = purchasedProducts.find(p => p.id === productId);
    return product ? product.name : `ID: ${productId}`;
  };


  return (
    <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-8"> {/* Adjusted padding */}
      <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8">Dashboard Pengguna</h1>
      
      {upgradeMessage && (
        <div className={`p-4 mb-6 rounded-md text-center ${upgradeMessage.includes('Gagal') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {upgradeMessage}
        </div>
      )}

      {/* AI Tools Hub Section */}
      <div className="mb-10 bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-2xl font-semibold text-darktext mb-6 text-center md:text-left">
          <i className="fas fa-brain mr-2 text-primary"></i>Pusat Alat AI CUANLABS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ToolCard 
            title="Generator Deskripsi Produk"
            description="Buat deskripsi produk memukau dengan AI untuk meningkatkan penjualan."
            icon="fas fa-magic"
            linkTo={ROUTE_PATHS.PRODUCT_DESCRIPTION_GENERATOR}
            bgColorClass="bg-gradient-to-br from-purple-500 to-indigo-600"
          />
          <ToolCard 
            title="AI Blog Post Outline"
            description="Susun kerangka artikel blog yang terstruktur dan komprehensif dengan cepat."
            icon="fas fa-stream"
            linkTo={ROUTE_PATHS.BLOG_OUTLINE_GENERATOR}
            bgColorClass="bg-gradient-to-br from-teal-500 to-cyan-600"
          />
          <ToolCard 
            title="Cuan Assistant"
            description="Tanya AI seputar strategi cuan online, produk, dan topik digital lainnya."
            icon="fas fa-robot"
            linkTo={ROUTE_PATHS.CUAN_ASSISTANT}
            bgColorClass="bg-gradient-to-br from-orange-500 to-red-600"
          />
        </div>
      </div>
      {/* End AI Tools Hub Section */}


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getProductNameForTransaction(tx.product_id)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(tx.transaction_date).toLocaleDateString('id-ID')}</td>
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

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-darktext mb-4">Produk Digital Saya</h2>
            {purchasedProducts.length > 0 ? (
              <ul className="space-y-3">
                {purchasedProducts.map(product => (
                  <li key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100">
                    <span className="text-gray-700">{product.name}</span>
                    {product.download_url ? (
                       <a href={product.download_url} target="_blank" rel="noopener noreferrer" download className="text-sm bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-3 rounded-md transition-colors">
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
              <>
                <Link 
                  to={ROUTE_PATHS.UPGRADE_PREMIUM}
                  className="mt-4 w-full block text-center bg-accent hover:bg-accent-hover text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    Upgrade ke Premium
                </Link>
                <button
                  onClick={handleSimulateUpgrade}
                  disabled={isSimulatingUpgrade}
                  className="mt-3 w-full block text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400"
                >
                  {isSimulatingUpgrade ? 'Memproses...' : 'Simulasikan Upgrade ke Premium'}
                </button>
              </>
            )}
          </div>
          
          {/* Kalkulator Cuan is now a core tool, not exclusive */}
          <div className="max-w-3xl mx-auto"> {/* Give it some space */}
             <KalkulatorCuan />
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
