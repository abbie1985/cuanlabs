
import { Product, BlogPost, Transaction, User } from '../types';
import { MOCK_API_DELAY } from '../constants';

const dummyProducts: Product[] = [
  { id: '1', name: 'Ultimate AI Prompt Pack', description: 'Kumpulan prompt AI terbaik untuk berbagai kebutuhan (ChatGPT, Midjourney, dll). Tingkatkan produktivitas Anda!', price: 150000, category: 'AI Prompt', imageUrl: 'https://picsum.photos/seed/product1/600/400', downloadUrl: '/downloads/ultimate-ai-prompt-pack.zip' },
  { id: '2', name: 'Website Landing Page Template', description: 'Template landing page modern dan responsif menggunakan Tailwind CSS. Mudah dikustomisasi.', price: 250000, category: 'Template', imageUrl: 'https://picsum.photos/seed/product2/600/400', downloadUrl: '/downloads/landing-page-template.zip' },
  { id: '3', name: 'Python Automation Script', description: 'Script Python untuk otomatisasi tugas-tugas repetitive. Hemat waktu dan tenaga.', price: 300000, category: 'Script', imageUrl: 'https://picsum.photos/seed/product3/600/400', downloadUrl: '/downloads/python-automation-script.zip' },
  { id: '4', name: 'Mini Course: Cuan dari Affiliate', description: 'Panduan lengkap memulai dan sukses dalam affiliate marketing. Langkah demi langkah.', price: 450000, category: 'Mini Course', imageUrl: 'https://picsum.photos/seed/product4/600/400', downloadUrl: '/downloads/mini-course-affiliate.pdf' },
  { id: '5', name: 'Social Media Content Calendar', description: 'Template kalender konten siap pakai untuk 1 bulan. Ide konten untuk berbagai platform.', price: 100000, category: 'Template', imageUrl: 'https://picsum.photos/seed/product5/600/400', downloadUrl: '/downloads/social-media-calendar.xlsx' },
  { id: '6', name: 'Ebook: Rahasia Freelancing Sukses', description: 'Kiat dan strategi menjadi freelancer sukses dengan penghasilan tinggi.', price: 120000, category: 'Mini Course', imageUrl: 'https://picsum.photos/seed/product6/600/400', downloadUrl: '/downloads/ebook-freelancing.pdf' },
];

const dummyBlogPosts: BlogPost[] = [
  { id: '1', title: '5 Cara Mudah Hasilkan Uang dari Internet di 2024', summary: 'Temukan strategi praktis untuk memulai perjalanan cuan online Anda tahun ini.', content: 'Detail konten...', author: 'Admin CUANLABS', date: '2024-07-15', imageUrl: 'https://picsum.photos/seed/blog1/800/400', slug: '5-cara-mudah-cuan-online-2024' },
  { id: '2', title: 'Mengapa Tools Digital Penting untuk Bisnis Anda?', summary: 'Pahami peran krusial tools digital dalam meningkatkan efisiensi dan profitabilitas.', content: 'Detail konten...', author: 'Expert Digital', date: '2024-07-10', imageUrl: 'https://picsum.photos/seed/blog2/800/400', slug: 'pentingnya-tools-digital-bisnis' },
  { id: '3', title: 'Tips Memilih Niche Profitable untuk Produk Digital', summary: 'Strategi jitu menentukan niche yang menguntungkan untuk produk digital Anda.', content: 'Detail konten...', author: 'Admin CUANLABS', date: '2024-07-05', imageUrl: 'https://picsum.photos/seed/blog3/800/400', slug: 'tips-memilih-niche-profitable' },
];

const dummyTransactions: Transaction[] = [
    { id: 't1', productId: '1', productName: 'Ultimate AI Prompt Pack', date: '2024-07-01', amount: 150000, status: 'completed' },
    { id: 't2', productId: '3', productName: 'Python Automation Script', date: '2024-06-25', amount: 300000, status: 'completed' },
];

export const fetchProducts = (): Promise<Product[]> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(dummyProducts), MOCK_API_DELAY);
  });
};

export const fetchProductById = (id: string): Promise<Product | undefined> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(dummyProducts.find(p => p.id === id)), MOCK_API_DELAY);
  });
};

export const fetchBlogPosts = (): Promise<BlogPost[]> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(dummyBlogPosts), MOCK_API_DELAY);
  });
};

export const fetchBlogPostBySlug = (slug: string): Promise<BlogPost | undefined> => {
    return new Promise(resolve => {
      setTimeout(() => resolve(dummyBlogPosts.find(p => p.slug === slug)), MOCK_API_DELAY);
    });
};

export const fetchUserTransactions = (_userId: string): Promise<Transaction[]> => {
    return new Promise(resolve => {
      setTimeout(() => resolve(dummyTransactions), MOCK_API_DELAY);
    });
};

// Simulate payment process
export const processPayment = (productId: string, userId: string): Promise<{ success: boolean; message: string; transactionId?: string }> => {
    console.log(`Processing payment for product ${productId} by user ${userId}`);
    return new Promise(resolve => {
        setTimeout(() => {
            // Simulate success or failure
            const success = Math.random() > 0.1; // 90% success rate
            if (success) {
                const newTransactionId = `txn_${Date.now()}`;
                // Here you would typically record the transaction in the backend
                resolve({ success: true, message: 'Pembayaran berhasil!', transactionId: newTransactionId });
            } else {
                resolve({ success: false, message: 'Pembayaran gagal. Silakan coba lagi.' });
            }
        }, MOCK_API_DELAY * 2); // Longer delay for payment
    });
};

// Simulate fetching affiliate data - usually part of user data or a separate endpoint
export const fetchAffiliateData = (user: User | null): Promise<{ referralCode: string; commission: number; referredUsers: number } | null> => {
    return new Promise(resolve => {
        setTimeout(() => {
            if (user && user.referralCode) {
                resolve({
                    referralCode: user.referralCode,
                    commission: user.commission || 0,
                    referredUsers: Math.floor(Math.random() * 20) // Dummy referred users
                });
            } else {
                resolve(null);
            }
        }, MOCK_API_DELAY);
    });
};
