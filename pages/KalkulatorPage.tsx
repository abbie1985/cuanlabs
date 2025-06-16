
import React from 'react';
import KalkulatorCuan from '../components/KalkulatorCuan';

const KalkulatorPage: React.FC = () => {
  return (
    <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-10">
      <div className="max-w-3xl mx-auto"> {/* Wider container for the new calculator */}
        <KalkulatorCuan />
      </div>
      <div className="mt-12 text-center text-gray-700 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4 text-primary">Panduan Menggunakan Kalkulator Bisnis</h2>
        <p className="mb-4 text-left sm:text-center">
          Kalkulator Bisnis CUANLABS dirancang untuk membantu Anda para penjual online, dropshipper, dan reseller dalam merencanakan strategi harga, menganalisis potensi keuntungan, dan memahami metrik penting bisnis Anda.
        </p>
        <div className="bg-gray-50 p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-darktext mb-3">Fitur Utama:</h3>
        <ul className="list-disc list-inside text-left space-y-2 text-gray-600 mx-auto max-w-md">
            <li><strong>Harga Jual Ideal:</strong> Tentukan harga jual optimal dengan memperhitungkan semua biaya dan margin profit yang Anda inginkan.</li>
            <li><strong>Simulasi Omset & Laba:</strong> Proyeksikan pendapatan kotor dan laba bersih berdasarkan target penjualan dan struktur biaya Anda.</li>
            <li><strong>BEP Calculator:</strong> Ketahui titik impas (Break Even Point) bisnis Anda, baik dalam unit maupun rupiah.</li>
            <li><strong>Komisi Reseller:</strong> Hitung pembagian komisi untuk tim penjualan Anda (versi sederhana).</li>
            <li><strong>Simulasi Diskon:</strong> Analisis dampak pemberian diskon atau promo terhadap profitabilitas produk Anda.</li>
        </ul>
        <p className="mt-6 text-sm">
            <strong>Tips:</strong>
        </p>
        <ul className="list-disc list-inside text-left space-y-1 text-gray-600 mx-auto mt-2 max-w-md text-sm">
            <li>Masukkan angka tanpa titik atau koma untuk nominal rupiah.</li>
            <li>Untuk persentase, masukkan angka saja (misal: 10 untuk 10%).</li>
            <li>Gunakan tab di atas kalkulator untuk beralih antar mode perhitungan.</li>
            <li>Hasil akan diperbarui secara otomatis saat Anda mengubah input.</li>
            <li>Manfaatkan tombol "Cetak/Simpan PDF" atau "Bagikan Perhitungan" untuk menyimpan atau membagikan hasil Anda.</li>
        </ul>
        <p className="mt-6 text-xs text-gray-500">
            Kalkulator ini adalah alat bantu. Selalu lakukan riset mendalam dan pertimbangkan semua faktor spesifik bisnis Anda sebelum mengambil keputusan finansial.
        </p>
        </div>
      </div>
    </div>
  );
};

export default KalkulatorPage;
