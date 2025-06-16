import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { GoogleGenAI, Chat } from '@google/genai'; // Correct import
import { useAuth } from '../context/AuthContext.tsx'; // To potentially personalize or gate features

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

const CuanAssistantPage: React.FC = () => {
  const [userInput, setUserInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth(); // Get current user if needed

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Attempt to get API_KEY from standard process.env, then from window.process.env (fallback)
  const apiKeyFromProcessEnv = typeof process !== 'undefined' && process.env && process.env.API_KEY;
  const apiKeyFromWindow = (window as any).process?.env?.API_KEY;
  const API_KEY = apiKeyFromProcessEnv || apiKeyFromWindow;

  useEffect(() => {
    if (!API_KEY) {
      const errorMsg = "Kunci API untuk Cuan Assistant belum dikonfigurasi. \nPastikan 'API_KEY' tersedia di process.env (untuk build environment) atau window.process.env (untuk fallback static HTML). \nFitur ini tidak akan berfungsi.";
      setError(errorMsg);
      console.error("Gemini API Key is missing. Checked process.env.API_KEY and window.process.env.API_KEY.");
      return;
    }
    setError(null); // Clear previous error if API key is now found

    try {
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const newChat = ai.chats.create({
        model: 'gemini-2.5-flash-preview-04-17',
        config: {
          systemInstruction: `Anda adalah Cuan Assistant, chatbot AI yang ramah dan sangat membantu dari CUANLABS.
          Tugas utama Anda adalah menjawab pertanyaan pengguna terkait:
          1.  Menghasilkan uang secara online.
          2.  Produk-produk digital yang tersedia di CUANLABS (seperti AI Prompts, template, script, mini course, ebook, dan bundle). Jelaskan manfaatnya dan bagaimana produk tersebut bisa membantu pengguna.
          3.  Strategi pemasaran digital, SEO (Search Engine Optimization), affiliate marketing, pembuatan konten, dan topik terkait lainnya yang relevan dengan ekosistem CUANLABS.
          4.  Memberikan panduan atau tips praktis yang actionable.
          5.  Membantu pengguna memahami konsep-konsep yang ada di artikel blog CUANLABS jika mereka bertanya.
          
          Aturan penting:
          - Selalu berkomunikasi dalam Bahasa Indonesia yang sopan dan profesional.
          - Jika relevan, arahkan pengguna ke produk atau artikel blog spesifik di CUANLABS. Sebutkan nama produk atau judul artikel jika memungkinkan.
          - Jaga agar jawaban tetap ringkas namun komprehensif dan mudah dimengerti.
          - HINDARI MEMBERIKAN NASIHAT KEUANGAN ATAU INVESTASI SECARA LANGSUNG. Fokus pada penyediaan informasi, edukasi, dan panduan terkait konten dan produk CUANLABS.
          - Jika tidak tahu jawaban atau pertanyaan di luar lingkup, katakan terus terang dan jangan mengarang.
          - Jika pengguna menyapa, sapa kembali dengan ramah.
          - Anda bisa menggunakan emoji secukupnya untuk membuat interaksi lebih menarik, tapi tetap profesional.
          ${currentUser ? `Pengguna saat ini adalah ${currentUser.name}. Anda bisa menyapanya dengan nama jika relevan.` : ''}
          `,
        },
      });
      setChat(newChat);
      // Add an initial greeting message from the AI if messages are empty
      if (messages.length === 0) {
        setMessages([{ 
          id: crypto.randomUUID(), 
          role: 'model', 
          text: `Halo ${currentUser?.name?.split(' ')[0] || 'Pengguna CUANLABS'}! Saya Cuan Assistant. Ada yang bisa saya bantu terkait strategi cuan online atau produk CUANLABS hari ini? 😊`, 
          timestamp: new Date() 
        }]);
      }
    } catch (e: any) {
      console.error("Error initializing Gemini AI:", e.message || e);
      setError(`Gagal menginisialisasi Cuan Assistant: ${e.message || 'Error tidak diketahui'}. Silakan coba muat ulang halaman.`);
    }
  }, [API_KEY, currentUser]); // Removed messages from dependency array to prevent re-initialization on new message

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !chat) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: userInput.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    // setError(null); // Don't clear API key error on every submit

    try {
      const stream = await chat.sendMessageStream({ message: userMessage.text });
      let currentAiResponseText = '';
      let aiMessageId = crypto.randomUUID();

      // Add a placeholder for AI message immediately for better UX
      setMessages(prev => [...prev, { id: aiMessageId, role: 'model', text: '', timestamp: new Date() }]);

      for await (const chunk of stream) {
        currentAiResponseText += chunk.text;
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageId ? { ...msg, text: currentAiResponseText } : msg
          )
        );
      }
      if (!currentAiResponseText && messages.find(msg => msg.id === aiMessageId && msg.text === '')) { 
         // Remove placeholder if no text was streamed and it's still empty
         setMessages(prev => prev.filter(msg => msg.id !== aiMessageId));
      }
    } catch (err: any) {
      console.error('Error sending message to Gemini:', err.message || err);
      const geminiErrorMessage = `Maaf, terjadi kesalahan saat menghubungi Cuan Assistant: ${err.message || 'Coba lagi beberapa saat.'}`;
      setError(geminiErrorMessage); // Set specific error for this send action
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'model',
        text: 'Oops! Sepertinya ada masalah di pihak saya. Bisakah Anda ulangi pertanyaan Anda? Atau coba muat ulang halaman jika masalah berlanjut.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[calc(100vh-150px)] max-h-[800px]"> {/* Adjust height as needed */}
      <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 text-center">
        <i className="fas fa-robot mr-2"></i>Cuan Assistant
      </h1>
      <p className="text-center text-gray-600 mb-6">Tanya AI CUANLABS seputar strategi cuan online dan produk kami!</p>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md whitespace-pre-wrap" role="alert">
          <p className="font-bold">Error Konfigurasi</p>
          <p>{error}</p>
        </div>
      )}

      <div className="flex-grow bg-white shadow-xl rounded-lg p-4 md:p-6 overflow-y-auto mb-4 flex flex-col space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-2xl p-3 rounded-xl shadow ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-none'
                  : 'bg-gray-200 text-darktext rounded-bl-none'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text || (msg.role === 'model' && isLoading && messages.length > 0 && messages[messages.length-1].id === msg.id ? 'Sedang mengetik...' : '')}</p>
              <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-sky-100' : 'text-gray-500'} text-right`}>
                {msg.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={!API_KEY ? "Kunci API tidak terkonfigurasi..." : "Ketik pertanyaan Anda di sini..."}
          className="flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-white"
          rows={2}
          disabled={isLoading || !chat || !API_KEY}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as any); // Type assertion needed here
            }
          }}
          aria-label="Pesan untuk Cuan Assistant"
        />
        <button
          type="submit"
          disabled={isLoading || !userInput.trim() || !chat || !API_KEY}
          className="bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-5 rounded-lg shadow-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          aria-label="Kirim pesan"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <i className="fas fa-paper-plane"></i>
          )}
        </button>
      </form>
       {isLoading && messages.length > 0 && messages[messages.length -1]?.role === 'user' && (
         <p className="text-sm text-gray-500 mt-2 text-center">Cuan Assistant sedang berpikir...</p>
       )}
    </div>
  );
};

export default CuanAssistantPage;