import React, { useState, FormEvent } from 'react';
import { GoogleGenAI } from '@google/genai';

const ProductDescriptionGeneratorPage = () => {
  const [productName, setProductName] = useState<string>('');
  const [features, setFeatures] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [tone, setTone] = useState<string>('Persuasif');
  const [generatedDescription, setGeneratedDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Attempt to get API_KEY from standard process.env, then from window.process.env (fallback)
  const apiKeyFromProcessEnv = typeof process !== 'undefined' && process.env && process.env.API_KEY;
  const apiKeyFromWindow = (window as any).process?.env?.API_KEY;
  const API_KEY = apiKeyFromProcessEnv || apiKeyFromWindow;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setGeneratedDescription('');
    setCopied(false);

    if (!productName.trim() || !features.trim()) {
      setError('Nama produk dan fitur utama harus diisi.');
      return;
    }

    if (!API_KEY) {
      const errorMsg = "Kunci API untuk Generator Deskripsi belum dikonfigurasi. \nPastikan 'API_KEY' tersedia di process.env (untuk build environment) atau window.process.env (untuk fallback static HTML). \nFitur ini tidak akan berfungsi.";
      setError(errorMsg);
      console.error("Gemini API Key is missing for Product Description Generator. Checked process.env.API_KEY and window.process.env.API_KEY.");
      return;
    }

    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      
      let prompt = `Anda adalah seorang copywriter AI ahli yang berspesialisasi dalam membuat deskripsi produk e-commerce yang menarik dan menjual.
Tugas Anda adalah membuat deskripsi produk berdasarkan detail berikut:

Nama Produk: ${productName}

Fitur Utama / Keunggulan (pisahkan dengan baris baru jika lebih dari satu):
${features}
`;

      if (targetAudience.trim()) {
        prompt += `\nTarget Audiens: ${targetAudience}`;
      }

      prompt += `\nNada Suara / Gaya Bahasa: ${tone}`;

      prompt += `\n\nInstruksi Tambahan:
- Buat deskripsi produk yang menarik, persuasif, dan informatif.
- Fokus pada bagaimana fitur produk memberikan manfaat bagi target audiens.
- Panjang deskripsi idealnya antara 75 hingga 150 kata.
- Gunakan nama produk secara alami dalam deskripsi.
- Akhiri dengan ajakan bertindak (call-to-action) yang halus jika sesuai.
- Pastikan deskripsi mudah dibaca dan dimengerti.
- Output HANYA berupa teks deskripsi produk, tanpa markdown, judul, atau komentar tambahan.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
      });

      setGeneratedDescription(response.text.trim());

    } catch (err: any) {
      console.error('Error generating product description with Gemini:', err.message || err);
      setError(`Maaf, terjadi kesalahan saat membuat deskripsi: ${err.message || 'Coba lagi beberapa saat.'}`);
      setGeneratedDescription('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedDescription) {
      navigator.clipboard.writeText(generatedDescription)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => console.error('Failed to copy text: ', err));
    }
  };

  const toneOptions = [
    "Persuasif",
    "Informatif",
    "Kasual & Ramah",
    "Profesional & Formal",
    "Kreatif & Unik"
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-2xl">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2 text-center">
          <i className="fas fa-magic mr-2"></i>Generator Deskripsi Produk AI
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Buat deskripsi produk yang menjual dengan bantuan AI dalam hitungan detik!
        </p>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md whitespace-pre-wrap" role="alert">
            <p className="font-bold">Oops! Terjadi Kesalahan</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Produk <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-white"
              placeholder="Contoh: Kopi Arabika Super Premium"
              required
              disabled={!API_KEY && !error?.includes("Kunci API")} // Keep enabled if API key missing error is already shown.
            />
          </div>

          <div>
            <label htmlFor="features" className="block text-sm font-medium text-gray-700 mb-1">
              Fitur Utama / Keunggulan <span className="text-red-500">*</span>
            </label>
            <textarea
              id="features"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-white"
              placeholder="Contoh:\n- Biji kopi pilihan dari dataran tinggi\n- Aroma khas dan rasa yang nikmat\n- Diproses secara alami"
              required
              disabled={!API_KEY && !error?.includes("Kunci API")}
            />
            <p className="text-xs text-gray-500 mt-1">Pisahkan setiap poin dengan baris baru (Enter).</p>
          </div>

          <div>
            <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-1">
              Target Audiens (Opsional)
            </label>
            <input
              type="text"
              id="targetAudience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-white"
              placeholder="Contoh: Penikmat kopi, pekerja kantoran"
              disabled={!API_KEY && !error?.includes("Kunci API")}
            />
          </div>

          <div>
            <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-1">
              Gaya Bahasa / Nada Suara
            </label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-white"
              disabled={!API_KEY && !error?.includes("Kunci API")}
            >
              {toneOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !API_KEY}
              className="w-full flex justify-center items-center bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Membuat Deskripsi...
                </>
              ) : (
                <><i className="fas fa-cogs mr-2"></i>Buat Deskripsi</>
              )}
            </button>
            {!API_KEY && !error?.includes("Kunci API") && <p className="text-xs text-red-500 mt-1 text-center">Fitur dinonaktifkan karena Kunci API belum terkonfigurasi.</p>}
          </div>
        </form>

        {generatedDescription && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-darktext mb-3">Hasil Deskripsi Produk:</h2>
            <div className="relative bg-gray-50 p-4 rounded-lg shadow">
              <textarea
                value={generatedDescription}
                readOnly
                rows={8}
                className="w-full p-2 border border-gray-200 rounded-md bg-white resize-none focus:outline-none"
                aria-label="Deskripsi produk yang dihasilkan"
              />
              <button
                onClick={handleCopy}
                className="absolute top-6 right-6 bg-accent hover:bg-accent-hover text-white text-xs font-semibold py-1 px-3 rounded-md transition-colors"
                aria-label="Salin deskripsi"
              >
                {copied ? <><i className="fas fa-check mr-1"></i>Tersalin</> : <><i className="fas fa-copy mr-1"></i>Salin</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDescriptionGeneratorPage;