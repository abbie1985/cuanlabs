
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAffiliateData } from '../services/api'; // Assuming an API call for this

interface AffiliateInfo {
    referralCode: string;
    commission: number;
    referredUsers: number;
}

const Affiliate: React.FC = () => {
  const { currentUser } = useAuth();
  const [affiliateData, setAffiliateData] = useState<AffiliateInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);


  useEffect(() => {
    const loadAffiliateData = async () => {
      if (currentUser) {
        setLoading(true);
        setError(null);
        try {
          const data = await fetchAffiliateData(currentUser);
          setAffiliateData(data);
        } catch (err) {
          console.error("Error fetching affiliate data:", err);
          setError("Gagal memuat data afiliasi.");
        } finally {
          setLoading(false);
        }
      } else {
        setError("Anda harus login untuk melihat halaman afiliasi.");
        setLoading(false);
      }
    };
    loadAffiliateData();
  }, [currentUser]);

  const handleCopyCode = () => {
    if (affiliateData?.referralCode) {
        navigator.clipboard.writeText(affiliateData.referralCode)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
            })
            .catch(err => console.error('Failed to copy: ', err));
    }
  };

  if (loading) {
    return <div className="container mx-auto px-6 py-8 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div><p className="mt-4">Memuat data afiliasi...</p></div>;
  }

  if (error) {
    return <div className="container mx-auto px-6 py-8 text-center text-red-500">{error}</div>;
  }
  
  if (!currentUser || !affiliateData) {
    return <div className="container mx-auto px-6 py-8 text-center text-gray-600">Informasi afiliasi tidak tersedia. Pastikan Anda telah login.</div>;
  }


  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-primary mb-8">Program Afiliasi CUANLABS</h1>
        
        <div className="text-center mb-8">
            <p className="text-gray-700 text-lg">
                Bagikan kode referral unik Anda dan dapatkan komisi untuk setiap teman yang bergabung dan melakukan pembelian melalui link Anda!
            </p>
        </div>

        <div className="bg-light p-6 rounded-lg shadow-inner mb-8">
            <h2 className="text-xl font-semibold text-darktext mb-3">Kode Referral Anda:</h2>
            <div className="flex items-center space-x-3 bg-gray-200 p-3 rounded-md">
                <input 
                    type="text" 
                    value={affiliateData.referralCode} 
                    readOnly 
                    className="flex-grow bg-transparent text-gray-800 font-mono text-lg focus:outline-none"
                />
                <button 
                    onClick={handleCopyCode}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-md transition-colors"
                >
                    {copied ? <><i className="fas fa-check mr-1"></i>Tersalin!</> : <><i className="fas fa-copy mr-1"></i>Salin Kode</>}
                </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Gunakan link: <code className="bg-gray-100 p-1 rounded text-primary">{`https://cuanlabs.com/register?ref=${affiliateData.referralCode}`}</code> (Contoh link)</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-green-50 p-6 rounded-lg text-center">
                <i className="fas fa-wallet text-3xl text-green-600 mb-3"></i>
                <p className="text-sm text-green-700">Total Komisi Didapatkan</p>
                <p className="text-3xl font-bold text-green-600">Rp{affiliateData.commission.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg text-center">
                <i className="fas fa-users text-3xl text-blue-600 mb-3"></i>
                <p className="text-sm text-blue-700">Jumlah User Direferensikan</p>
                <p className="text-3xl font-bold text-blue-600">{affiliateData.referredUsers}</p>
            </div>
        </div>

        <div className="mt-8 text-center">
            <h3 className="text-xl font-semibold text-darktext mb-4">Bagaimana Cara Kerjanya?</h3>
            <ol className="list-decimal list-inside text-left text-gray-600 space-y-2 max-w-md mx-auto">
                <li>Bagikan kode referral atau link unik Anda ke teman atau audiens Anda.</li>
                <li>Teman Anda mendaftar di CUANLABS menggunakan kode atau link Anda.</li>
                <li>Anda mendapatkan komisi setiap kali teman yang Anda referensikan melakukan pembelian produk.</li>
                <li>Pantau komisi Anda dan tarik dana dengan mudah (fitur penarikan akan datang).</li>
            </ol>
        </div>

        <div className="mt-10 text-center">
            <button className="bg-accent hover:bg-accent-hover text-white font-bold py-3 px-6 rounded-lg transition-colors">
                Pelajari Lebih Lanjut Syarat & Ketentuan
            </button>
        </div>
      </div>
    </div>
  );
};

export default Affiliate;
