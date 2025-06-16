
import React from 'react';
import KalkulatorCuan from '../components/KalkulatorCuan';

const KalkulatorPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto">
        <KalkulatorCuan />
      </div>
      <div className="mt-12 text-center text-gray-600">
        <h2 className="text-2xl font-semibold mb-4">Tips Menggunakan Kalkulator</h2>
        <ul className="list-disc list-inside inline-block text-left space-y-2">
            <li>Masukkan angka tanpa titik atau koma untuk nominal rupiah.</li>
            <li>Estimasi ROI Tahunan adalah persentase. Masukkan angka saja (misal: 10 untuk 10%).</li>
            <li>Durasi investasi dalam satuan tahun penuh.</li>
            <li>Hasil perhitungan adalah estimasi berdasarkan input Anda. Kinerja investasi riil dapat bervariasi.</li>
        </ul>
        <p className="mt-6 text-sm">
            Kalkulator ini adalah alat bantu untuk perencanaan. Selalu lakukan riset mandiri (DYOR) sebelum mengambil keputusan investasi.
        </p>
      </div>
    </div>
  );
};

export default KalkulatorPage;
