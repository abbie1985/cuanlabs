import { Product, BlogPost, Transaction, User, Profile, AdminDashboardStats, SeoSuggestions } from '../types';
import { supabase } from './supabaseClient';
import { GoogleGenAI } from '@google/genai';

// Define AffiliateInfo interface locally or import if it's moved to types.ts
interface AffiliateInfo {
    referralCode: string;
    commission: number;
    referredUsers: number;
}


const handleSupabaseError = (error: any, tableNameInDb: string, operation: string): Error => {
  const errorMessage = error.message || String(error);
  const specificMessage = `Error ${operation} data from '${tableNameInDb}': ${errorMessage}`;
  console.error(specificMessage, error);

  if (errorMessage.includes(`relation "public.${tableNameInDb}" does not exist`)) {
    return new Error(`Tabel '${tableNameInDb}' tidak ditemukan di database Anda. Pastikan tabel sudah dibuat dengan benar agar aplikasi dapat berfungsi. Operasi: ${operation}.`);
  }
  return new Error(`Gagal ${operation} data dari '${tableNameInDb}': ${errorMessage}`);
};


// --- Products ---
export const fetchProducts = async (): Promise<Product[]> => {
  const tableName = 'products';
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('is_active', true) 
    .order('created_at', { ascending: false });

  if (error) throw handleSupabaseError(error, tableName, 'fetching products');
  return data || [];
};

export const fetchProductById = async (id: string): Promise<Product | undefined> => {
  const tableName = 'products';
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return undefined; // Row not found is not a critical error here
    throw handleSupabaseError(error, tableName, `fetching product by id ${id}`);
  }
  return data || undefined;
};

// --- Blog Posts ---
export const fetchBlogPosts = async (): Promise<BlogPost[]> => {
  const tableName = 'blog_posts';
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('is_published', true) 
    .order('published_at', { ascending: false });

  if (error) throw handleSupabaseError(error, tableName, 'fetching blog posts');
  return data || [];
};

export const fetchBlogPostBySlug = async (slug: string): Promise<BlogPost | undefined> => {
  const tableName = 'blog_posts';
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return undefined;
    throw handleSupabaseError(error, tableName, `fetching blog post by slug ${slug}`);
  }
  return data || undefined;
};

// --- Transactions ---
export const fetchUserTransactions = async (userId: string): Promise<Transaction[]> => {
  const tableName = 'transactions';
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from(tableName)
    .select('*') 
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false });

  if (error) throw handleSupabaseError(error, tableName, `fetching user transactions for user ${userId}`);
  return data?.map(tx => ({...tx, productName: tx.product_id })) || [];
};

export const processPayment = async (
  productId: string, 
  userId: string, 
  productPrice: number,
  productName: string 
): Promise<{ success: boolean; message: string; transactionId?: string }> => {
  const tableName = 'transactions';
  console.log(`Processing payment for product ${productId} by user ${userId}`);
  
  await new Promise(resolve => setTimeout(resolve, 1000)); 
  const paymentSuccess = Math.random() > 0.1; 

  if (paymentSuccess) {
    const transactionPayload = {
      user_id: userId,
      product_id: productId,
      amount: productPrice,
      status: 'completed' as const,
      transaction_date: new Date().toISOString(),
      payment_gateway_id: `sim_txn_${Date.now()}`,
      payment_method: 'simulated_gateway',
    };

    const { data: newTransaction, error } = await supabase
      .from(tableName)
      .insert(transactionPayload)
      .select()
      .single();

    if (error) {
      console.error(`Error recording transaction:`, error.message || error);
       if (error.message.includes(`relation "public.${tableName}" does not exist`)) {
         return { success: false, message: `Pembayaran berhasil, tapi gagal mencatat transaksi: Tabel '${tableName}' tidak ditemukan di database. Harap buat tabelnya.` };
       }
      return { success: false, message: `Pembayaran berhasil, tapi gagal mencatat transaksi: ${error.message}` };
    }
    return { success: true, message: 'Pembayaran berhasil dan transaksi dicatat!', transactionId: newTransaction?.id };
  } else {
     const { error: insertFailError } = await supabase
      .from(tableName)
      .insert({
        user_id: userId,
        product_id: productId,
        amount: productPrice,
        status: 'failed' as const,
        transaction_date: new Date().toISOString(),
        payment_gateway_id: `sim_fail_${Date.now()}`,
      });
      if (insertFailError) {
        console.error(`Error recording FAILED transaction:`, insertFailError.message || insertFailError);
         if (insertFailError.message.includes(`relation "public.${tableName}" does not exist`)) {
          // If table doesn't exist, even recording a failed transaction won't work
          return { success: false, message: `Pembayaran gagal dan gagal mencatat kegagalan transaksi: Tabel '${tableName}' tidak ditemukan.` };
        }
      }
    return { success: false, message: 'Pembayaran gagal. Silakan coba lagi.' };
  }
};


// --- Affiliate Data ---
export const fetchAffiliateData = async (currentUser: User): Promise<AffiliateInfo> => {
  await new Promise(resolve => setTimeout(resolve, 500)); 

  if (!currentUser.referralCode) {
    console.warn("User does not have a referral code. Returning default affiliate info.");
    return {
        referralCode: 'N/A',
        commission: currentUser.total_commission_earned || 0,
        referredUsers: 0, 
    };
  }
  
  return {
    referralCode: currentUser.referralCode,
    commission: currentUser.total_commission_earned || 0,
    referredUsers: 0, 
  };
};


// --- Admin Panel Specific API Calls ---

export const fetchAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
  const tableNameProducts = 'products';
  const tableNameUsers = 'profiles';
  const tableNameBlogPosts = 'blog_posts';

  try {
    const { count: totalUsers, error: usersError } = await supabase
      .from(tableNameUsers)
      .select('*', { count: 'exact', head: true });
    if (usersError) throw handleSupabaseError(usersError, tableNameUsers, 'counting users');

    const { count: totalProducts, error: productsError } = await supabase
      .from(tableNameProducts)
      .select('*', { count: 'exact', head: true });
    if (productsError) throw handleSupabaseError(productsError, tableNameProducts, 'counting products');
    
    const { count: totalActiveProducts, error: activeProductsError } = await supabase
      .from(tableNameProducts)
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    if (activeProductsError) throw handleSupabaseError(activeProductsError, tableNameProducts, 'counting active products');

    const { count: totalBlogPosts, error: blogPostsError } = await supabase
      .from(tableNameBlogPosts)
      .select('*', { count: 'exact', head: true });
    if (blogPostsError) throw handleSupabaseError(blogPostsError, tableNameBlogPosts, 'counting blog posts');

    const { count: totalPublishedPosts, error: publishedPostsError } = await supabase
      .from(tableNameBlogPosts)
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);
    if (publishedPostsError) throw handleSupabaseError(publishedPostsError, tableNameBlogPosts, 'counting published posts');

    return {
      totalUsers: totalUsers || 0,
      totalProducts: totalProducts || 0,
      totalActiveProducts: totalActiveProducts || 0,
      totalBlogPosts: totalBlogPosts || 0,
      totalPublishedPosts: totalPublishedPosts || 0,
    };
  } catch (error: any) {
    if (error.message && (error.message.startsWith('Tabel') || error.message.startsWith('Gagal'))) throw error;
    console.error("Unexpected error in fetchAdminDashboardStats:", error);
    throw new Error(`Gagal memuat statistik admin: ${error.message || 'Error tidak diketahui'}`);
  }
};

export const fetchAllUsersAdmin = async (): Promise<Profile[]> => {
  const tableName = 'profiles';
  const { data, error } = await supabase
    .from(tableName)
    .select('id, name, email, membership_tier, role, referral_code, total_commission_earned, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) throw handleSupabaseError(error, tableName, 'fetching all users for admin');
  
  return (data || []).map(profile => ({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      membershipTier: profile.membership_tier as 'free' | 'premium',
      role: profile.role as 'user' | 'admin',
      referralCode: profile.referral_code,
      total_commission_earned: profile.total_commission_earned,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
  }));
};

export const createUserAdmin = async (
  userData: { name: string; email: string; password: string; role: 'user' | 'admin'; membershipTier: 'free' | 'premium' }
): Promise<{ success: boolean; error?: string | null; userId?: string }> => {
  const tableNameProfiles = 'profiles';
  const { name, email, password, role, membershipTier } = userData;

  // 1. Create Auth User
  // Note: Supabase signUp might trigger email verification if enabled.
  // For admin creation, this might not be desired. If so, a server-side function (Supabase Edge Function)
  // using the service_role key to call supabase.auth.admin.createUser would be better
  // to bypass email verification and directly set email_confirmed_at.
  // However, for client-side, signUp is the way.
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name: name } // This goes to user_metadata on auth.users
    }
  });

  if (signUpError) {
    console.error('Admin Create User: SignUp error:', signUpError.message);
    return { success: false, error: `Gagal membuat pengguna (autentikasi): ${signUpError.message}` };
  }

  if (!authData.user) {
    console.error('Admin Create User: SignUp successful but no user data returned.');
    return { success: false, error: 'Gagal membuat pengguna: Tidak ada data pengguna setelah pendaftaran autentikasi.' };
  }

  // 2. Create Profile Entry
  const newReferralCode = 'CUAN' + crypto.randomUUID().replace(/-/g, '').substring(0, 7).toUpperCase();
  const profilePayload = {
    id: authData.user.id,
    name: name,
    email: email, // Denormalized email for convenience
    membership_tier: membershipTier,
    role: role,
    referral_code: newReferralCode,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error: profileError } = await supabase
    .from(tableNameProfiles)
    .insert(profilePayload);

  if (profileError) {
    console.error('Admin Create User: Profile creation error:', profileError.message);
    // Important: If profile creation fails, the auth user still exists.
    // This could lead to inconsistencies. Admin might need to manually resolve.
    // A more robust solution involves a Supabase Edge Function to do this atomically or handle cleanup.
    return { 
        success: false, 
        error: `Pengguna berhasil dibuat di sistem autentikasi (ID: ${authData.user.id}), tetapi gagal membuat profil di database: ${profileError.message}. Harap periksa konsistensi data, atau hapus pengguna dari Supabase Auth dan coba lagi.` 
    };
  }

  return { success: true, userId: authData.user.id };
};


// Updated function to handle name, role, and membershipTier
export const updateUserProfileAdmin = async (userId: string, profileData: Partial<Pick<Profile, 'name' | 'role' | 'membershipTier'>>): Promise<void> => {
  const tableName = 'profiles';
  const { error } = await supabase
    .from(tableName)
    .update({ ...profileData, updated_at: new Date().toISOString() })
    .eq('id', userId);
  
  if (error) throw handleSupabaseError(error, tableName, `updating profile for user ${userId}`);
};

// New function to delete a user profile
export const deleteUserProfileAdmin = async (userId: string): Promise<void> => {
  const tableName = 'profiles';
  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq('id', userId);

  if (error) throw handleSupabaseError(error, tableName, `deleting profile for user ${userId}`);
};


export const fetchAllProductsAdmin = async (): Promise<Product[]> => {
  const tableName = 'products';
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw handleSupabaseError(error, tableName, 'fetching all products for admin');
  return data || [];
};

export const createProductAdmin = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
  const tableName = 'products';
  const { data, error } = await supabase
    .from(tableName)
    .insert([{ ...productData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
    .select()
    .single();
  
  if (error) throw handleSupabaseError(error, tableName, 'creating new product');
  return data;
};

export const updateProductAdmin = async (productId: string, productData: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Promise<Product> => {
  const tableName = 'products';
  const { data, error } = await supabase
    .from(tableName)
    .update({ ...productData, updated_at: new Date().toISOString() })
    .eq('id', productId)
    .select()
    .single();

  if (error) throw handleSupabaseError(error, tableName, `updating product ${productId}`);
  return data;
};

export const deleteProductAdmin = async (productId: string): Promise<void> => {
  const tableName = 'products';
  const { error } = await supabase
    .from(tableName)
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', productId);

  if (error) throw handleSupabaseError(error, tableName, `deleting (soft) product ${productId}`);
};

export const fetchAllBlogPostsAdmin = async (): Promise<BlogPost[]> => {
  const tableName = 'blog_posts';
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw handleSupabaseError(error, tableName, 'fetching all blog posts for admin');
  return data || [];
};

export const createBlogPostAdmin = async (postData: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>): Promise<BlogPost> => {
  const tableName = 'blog_posts';
  const payload: Partial<BlogPost> = { 
    ...postData, 
    created_at: new Date().toISOString(), 
    updated_at: new Date().toISOString() 
  };
  
  if (payload.is_published && !postData.published_at) {
    payload.published_at = new Date().toISOString();
  } else if (!payload.is_published) {
    payload.published_at = null;
  }

  const { data, error } = await supabase
    .from(tableName)
    .insert([payload])
    .select()
    .single();
  
  if (error) throw handleSupabaseError(error, tableName, 'creating new blog post');
  return data;
};

export const updateBlogPostAdmin = async (postId: string, postData: Partial<Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>>): Promise<BlogPost> => {
  const tableName = 'blog_posts';
  const payload: Partial<BlogPost> = { ...postData, updated_at: new Date().toISOString() };

  if (payload.is_published && !postData.published_at) { 
    payload.published_at = new Date().toISOString();
  } else if (payload.is_published === false) { 
    payload.published_at = null;
  }

  const { data, error } = await supabase
    .from(tableName)
    .update(payload)
    .eq('id', postId)
    .select()
    .single();

  if (error) throw handleSupabaseError(error, tableName, `updating blog post ${postId}`);
  return data;
};

export const deleteBlogPostAdmin = async (postId: string): Promise<void> => {
  const tableName = 'blog_posts';
  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq('id', postId);

  if (error) throw handleSupabaseError(error, tableName, `deleting blog post ${postId}`);
};

// --- Membership Simulation ---
export const simulateUpgradeToPremium = async (userId: string): Promise<void> => {
  const tableName = 'profiles';
  const { error } = await supabase
    .from(tableName)
    .update({ membership_tier: 'premium', updated_at: new Date().toISOString() })
    .eq('id', userId);
  
  if (error) throw handleSupabaseError(error, tableName, `simulating premium upgrade for user ${userId}`);
};

// --- AI SEO Suggestions ---
export const generateSeoSuggestions = async (title: string, contentSummary: string): Promise<SeoSuggestions> => {
  const apiKeyFromProcessEnv = typeof process !== 'undefined' && process.env && process.env.API_KEY;
  const apiKeyFromWindow = (window as any).process?.env?.API_KEY;
  const API_KEY = apiKeyFromProcessEnv || apiKeyFromWindow;

  if (!API_KEY) {
    console.error("Gemini API Key is missing for SEO Suggestions.");
    throw new Error("Kunci API untuk Gemini belum dikonfigurasi.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `Anda adalah seorang ahli SEO dan copywriter AI. Tugas Anda adalah memberikan rekomendasi SEO untuk sebuah artikel blog berdasarkan judul dan ringkasan konten berikut:

Judul Artikel: "${title}"
Ringkasan Konten: "${contentSummary}"

Berikan rekomendasi dalam format JSON dengan struktur berikut:
{
  "seoTitle": "Judul SEO yang dioptimalkan (maksimal 60 karakter, menarik, dan mengandung kata kunci utama)",
  "metaDescription": "Meta deskripsi yang menarik dan informatif (maksimal 160 karakter, mengandung kata kunci, dan mendorong klik)",
  "keywords": ["kata kunci utama", "kata kunci sekunder", "LSI keyword 1", "LSI keyword 2", "dst (berikan 5-7 kata kunci relevan)"]
}

Pastikan output HANYA berupa JSON string yang valid tanpa komentar atau teks tambahan.
Fokus pada relevansi dengan judul dan ringkasan yang diberikan.
Gunakan Bahasa Indonesia.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    try {
      const parsedData: SeoSuggestions = JSON.parse(jsonStr);
      return parsedData;
    } catch (e) {
      console.error("Failed to parse JSON response from Gemini for SEO:", e, "\nRaw response:", jsonStr);
      throw new Error("Gagal memproses respons AI. Format tidak valid.");
    }

  } catch (err: any) {
    console.error('Error generating SEO suggestions with Gemini:', err.message || err);
    throw new Error(`Gagal membuat rekomendasi SEO: ${err.message || 'Error tidak diketahui'}`);
  }
};

// --- AI Blog Post Outline Generator ---
export const generateBlogPostOutline = async (
  topic: string,
  targetAudience?: string,
  numPoints?: string,
  writingStyle?: string
): Promise<string> => {
  const apiKeyFromProcessEnv = typeof process !== 'undefined' && process.env && process.env.API_KEY;
  const apiKeyFromWindow = (window as any).process?.env?.API_KEY;
  const API_KEY = apiKeyFromProcessEnv || apiKeyFromWindow;

  if (!API_KEY) {
    console.error("Gemini API Key is missing for Blog Post Outline Generator.");
    throw new Error("Kunci API untuk Gemini belum dikonfigurasi.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    let prompt = `Anda adalah AI ahli dalam membuat kerangka artikel blog yang terstruktur dan komprehensif.
Tugas Anda adalah membuat kerangka artikel blog (blog post outline) berdasarkan detail berikut:

Topik Utama: "${topic}"
${targetAudience ? `Target Audiens: "${targetAudience}"\n` : ''}
${numPoints ? `Perkiraan Jumlah Poin Utama yang Diinginkan: "${numPoints}"\n` : ''}
${writingStyle ? `Gaya Penulisan yang Diinginkan: "${writingStyle}"\n` : ''}

Format Output:
Berikan output dalam format Markdown list yang jelas dan terstruktur. Gunakan heading level 2 (##) untuk judul utama outline, dan list item (-) untuk poin-poinnya. Jika ada sub-poin, gunakan indentasi.
Contoh:
## Judul Artikel yang Disarankan

### Pendahuluan
- Latar belakang singkat topik.
- Apa yang akan dipelajari pembaca dari artikel ini.
- Hook untuk menarik perhatian pembaca.

### Poin Utama 1: [Judul Poin Utama 1]
- Sub-poin 1.1: Penjelasan detail.
- Sub-poin 1.2: Contoh atau studi kasus.

### Poin Utama 2: [Judul Poin Utama 2]
- Sub-poin 2.1: Penjelasan detail.
- Sub-poin 2.2: Tips atau trik terkait.

### Poin Utama 3: [Judul Poin Utama 3]
- Sub-poin 3.1: Penjelasan detail.

### Kesimpulan
- Rangkuman poin-poin penting.
- Call to action atau pemikiran penutup.

Instruksi Tambahan:
- Pastikan kerangka mencakup pendahuluan, beberapa poin utama/isi (sesuaikan jumlahnya berdasarkan kompleksitas topik dan input pengguna jika ada), dan kesimpulan.
- Usahakan untuk menyarankan judul artikel yang menarik dan relevan di awal outline.
- Setiap poin utama sebaiknya membahas satu aspek spesifik dari topik.
- Jika pengguna memberikan "Jumlah Poin Utama", usahakan untuk mendekati jumlah tersebut.
- Fokus pada pembuatan outline yang logis, mudah diikuti, dan memberikan nilai bagi pembaca.
- Gunakan Bahasa Indonesia.
- Output HANYA berupa kerangka artikel dalam format Markdown seperti contoh di atas, tanpa teks pembuka atau penutup lainnya di luar format tersebut.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: prompt,
    });

    return response.text.trim();

  } catch (err: any) {
    console.error('Error generating blog post outline with Gemini:', err.message || err);
    throw new Error(`Gagal membuat kerangka artikel: ${err.message || 'Error tidak diketahui'}`);
  }
};