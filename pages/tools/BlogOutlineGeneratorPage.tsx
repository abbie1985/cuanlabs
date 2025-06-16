import React, { useState, FormEvent } from 'react';
import { GoogleGenAI } from '@google/genai'; // Already imported in api.ts, but direct use is also fine.
import { generateBlogPostOutline } from '../../services/api.ts'; // Import the new API function

const BlogOutlineGeneratorPage: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [numPoints, setNumPoints] = useState<string>(''); // e.g., "3-5"
  const [writingStyle, setWritingStyle] = useState<string>('Informatif');
  
  const [generatedOutline, setGeneratedOutline] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Attempt to get API_KEY (primarily for enabling/disabling UI elements if key is missing)
  const apiKeyFromProcessEnv = typeof process !== 'undefined' && process.env && process.env.API_KEY;
  const apiKeyFromWindow = (window as any).process?.env?.API_KEY;
  const API_KEY = apiKeyFromProcessEnv || apiKeyFromWindow;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setGeneratedOutline('');
    setCopied(false);

    if (!topic.trim()) {
      setError('Topik artikel harus diisi.');
      return;
    }

    if (!API_KEY) {
      const errorMsg = "Kunci API untuk Generator Outline Blog belum dikonfigurasi. \nPastikan 'API_KEY' tersedia di process.env (untuk build environment) atau window.process.env (untuk fallback static HTML). \nFitur ini tidak akan berfungsi.";
      setError(errorMsg);
      console.error("Gemini API Key is missing for Blog Outline Generator. Checked process.env.API_KEY and window.process.env.API_KEY.");
      return;
    }

    setIsLoading(true);

    try {
      const outline = await generateBlogPostOutline(
        topic,
        targetAudience,
        numPoints,
        writingStyle
      );
      setGeneratedOutline(outline);
    } catch (err: any) {
      console.error('Error generating blog post outline:', err.message || err);
      setError(`Maaf, terjadi kesalahan saat membuat outline: ${err.message || 'Coba lagi beberapa saat.'}`);
      setGeneratedOutline('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedOutline) {
      navigator.clipboard.writeText(generatedOutline)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => console.error('Failed to copy text: ', err));
    }
  };

  const writingStyleOptions = [
    "Informatif",
    "Persuasif",
    "Kasual & Ramah",
    "Profesional & Formal",
    "Tutorial Langkah-demi-Langkah",
    "Naratif / Bercerita",
    "Analitis & Mendalam"
  ];

  const numPointsOptions = ["", "2-3", "3-4", "4-5", "5+", "Fleksibel"];


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-2xl">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2 text-center">
          <i className="fas fa-stream mr-2"></i>AI Blog Post Outline Generator
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Masukkan topik artikel Anda, dan biarkan AI membantu menyusun kerangka (outline) yang terstruktur!
        </p>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md whitespace-pre-wrap" role="alert">
            <p className="font-bold">Oops! Terjadi Kesalahan</p>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
              Topik atau Ide Utama Artikel <span className="text-red-500">*</span>
            </label>
            <textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary"
              placeholder="Contoh: Cara memulai investasi saham untuk pemula, Tips meningkatkan produktivitas saat WFH"
              required
              disabled={!API_KEY && !error?.includes("Kunci API")}
            />
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
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary"
              placeholder="Contoh: Mahasiswa, profesional muda, ibu rumah tangga"
              disabled={!API_KEY && !error?.includes("Kunci API")}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="numPoints" className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah Poin Utama (Opsional)
              </label>
              <select
                id="numPoints"
                value={numPoints}
                onChange={(e) => setNumPoints(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-white"
                disabled={!API_KEY && !error?.includes("Kunci API")}
              >
                {numPointsOptions.map(opt => <option key={opt} value={opt}>{opt === "" ? "Pilih jumlah (opsional)" : opt}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="writingStyle" className="block text-sm font-medium text-gray-700 mb-1">
                Gaya Penulisan (Opsional)
              </label>
              <select
                id="writingStyle"
                value={writingStyle}
                onChange={(e) => setWritingStyle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-white"
                disabled={!API_KEY && !error?.includes("Kunci API")}
              >
                {writingStyleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
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
                  Membuat Outline...
                </>
              ) : (
                <><i className="fas fa-lightbulb mr-2"></i>Buat Outline Artikel</>
              )}
            </button>
            {!API_KEY && !error?.includes("Kunci API") && <p className="text-xs text-red-500 mt-1 text-center">Fitur dinonaktifkan karena Kunci API belum terkonfigurasi.</p>}
          </div>
        </form>

        {generatedOutline && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold text-darktext">Hasil Outline Artikel:</h2>
                <button
                    onClick={handleCopy}
                    className="bg-accent hover:bg-accent-hover text-white text-sm font-semibold py-2 px-3 rounded-md transition-colors"
                    aria-label="Salin outline"
                >
                    {copied ? <><i className="fas fa-check mr-1"></i>Tersalin</> : <><i className="fas fa-copy mr-1"></i>Salin Outline</>}
                </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow prose prose-sm max-w-none">
              {/* Using a div with whitespace-pre-wrap to render Markdown-like text */}
              <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: generatedOutline.replace(/## (.*)/g, '<strong class="text-lg block mt-2 mb-1">$1</strong>').replace(/### (.*)/g, '<strong class="text-md block mt-1 mb-0.5">$1</strong>').replace(/- (.*)/g, '• $1') }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogOutlineGeneratorPage;