
import { ReactNode } from 'react';
import type { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';

// Profile data yang disimpan di tabel 'profiles' Supabase
export interface Profile {
  id: string; // Harus sama dengan SupabaseUser.id (UUID)
  name: string;
  email?: string; // Denormalized email, can be useful
  membershipTier: 'free' | 'premium';
  role: 'user' | 'admin';
  referralCode?: string;
  total_commission_earned?: number; // Sesuai skema DB
  updated_at?: string;
  created_at?: string;
}

// Gabungan data dari Supabase Auth User dan Profile kustom kita
export interface User extends SupabaseUser {
  // Explicitly list properties from SupabaseUser that are frequently accessed
  // or for which the app provides fallbacks/overrides, ensuring type clarity.
  id: string; // Directly from SupabaseUser.id, non-optional
  email?: string; // Directly from SupabaseUser.email, optional

  // Fields from 'profiles' table are optional here to support fallback if profile doesn't exist or table is missing
  name?: string; // From Profile, but can be derived if profile missing
  membershipTier?: 'free' | 'premium'; // From Profile
  role: 'user' | 'admin'; // Defaulted to 'user' if not in profile, essential for app logic
  referralCode?: string; // From Profile
  total_commission_earned?: number; // From Profile
  // Other SupabaseUser properties like created_at, app_metadata, user_metadata etc.
  // are still available through inheritance.
}


export interface Product {
  id: string; // Biasanya UUID dari Supabase
  name: string;
  description: string;
  price: number;
  category: 'AI Prompt' | 'Template' | 'Script' | 'Mini Course' | 'Ebook' | 'Bundle'; // Tambahkan tipe sesuai DB
  image_url: string; // Sesuaikan nama kolom jika beda di DB
  download_url?: string;
  is_active?: boolean; // Default true when creating
  created_at?: string;
  updated_at?: string;
  // seller_id?: string;
}

export interface Transaction {
  id: string; // Biasanya UUID dari Supabase
  user_id: string; // FK ke profiles.id / auth.users.id
  product_id: string; // FK ke products.id
  productName?: string; // Bisa di-join atau disimpan denormalisasi
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_gateway_id?: string;
  payment_method?: string;
  transaction_date: string; // Supabase TIMESTAMPTZ
  created_at?: string;
  updated_at?: string;
}

export interface BlogPost {
  id: string; // Biasanya UUID dari Supabase
  title: string;
  slug: string;
  summary?: string;
  content: string;
  author_name?: string; // Sesuaikan nama kolom jika beda di DB
  // author_id?: string;
  image_url?: string; // Sesuaikan nama kolom jika beda di DB
  is_published?: boolean;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthContextType {
  currentUser: User | null;
  session: SupabaseSession | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string | null }>;
  logout: () => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string | null }>;
  signInWithGoogle: () => Promise<void>;
  loading: boolean;
  refreshCurrentUserProfile: () => Promise<void>; // Ensure this is present
}

export interface ChildrenProps {
  children: ReactNode;
}

// For Admin Dashboard Stats
export interface AdminDashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalActiveProducts: number;
  totalBlogPosts: number;
  totalPublishedPosts: number;
}

// For AI SEO Suggestions
export interface SeoSuggestions {
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

// --- E-commerce Business Calculator Types ---
export type CalculatorMode = 
  | 'hargaJual' 
  | 'omsetLaba' 
  | 'bep' 
  | 'komisi' 
  | 'diskon';

export interface HargaJualInputs {
  modalBeliProduk: string;
  biayaAdminMarketplacePersen: string;
  biayaIklanPersenDariHJ: string;
  biayaPackingRp: string;
  ongkirDitanggungPenjualRp: string;
  komisiResellerPersenDariHJ: string;
  marginKeuntunganPersenDariHJ: string;
}

export interface HargaJualOutputs {
  hargaJualIdeal: number;
  profitPerProduk: number;
  totalBiayaPersenPerProduk: number;
  totalBiayaTetapPerProduk: number;
  peringatan?: string;
}

export interface OmsetLabaInputs {
  targetPenjualanUnit: string;
  hargaJualPerUnit: string;
  modalPerUnit: string;
  biayaAdminMarketplacePersen: string;
  totalBiayaIklanRp: string;
  biayaPackingPerUnitRp: string;
}

export interface OmsetLabaOutputs {
  omsetKotor: number;
  totalBiayaAdmin: number;
  totalModalProduk: number;
  totalBiayaPacking: number;
  totalPotonganBiaya: number;
  estimasiLabaBersih: number;
  peringatan?: string;
}

export interface BEPInputs {
  totalBiayaTetapRp: string;
  hargaJualPerUnit: string;
  modalPerUnit: string;
  biayaVariabelLainPersenDariHJ: string;
  biayaVariabelLainPerUnitRp: string;
}

export interface BEPOutputs {
  bepUnit: number;
  bepRupiah: number;
  marginKontribusiPerUnit: number;
  peringatan?: string;
}

export interface KomisiInputs {
  hargaModalProdukSupplier: string;
  hargaJualKeKonsumen: string;
  komisiDropshipperPersenDariProfitSeller: string; // Simplified for now
}

export interface KomisiOutputs {
  profitKotorSeller: number;
  komisiDropshipperRp: number;
  profitBersihSeller: number;
  peringatan?: string;
}

export interface DiskonInputs {
  hargaJualNormal: string;
  modalPerUnit: string;
  biayaVariabelLainPersenDariHJ: string; // e.g., admin fee from selling price
  persentaseDiskon: string;
}

export interface DiskonOutputs {
  hargaJualSetelahDiskon: number;
  profitPerUnitSetelahDiskon: number;
  totalBiayaVariabelSetelahDiskon: number;
  peringatan?: string;
}
