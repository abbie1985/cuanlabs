
import { ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  membershipTier: 'free' | 'premium';
  referralCode?: string;
  commission?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'AI Prompt' | 'Template' | 'Script' | 'Mini Course';
  imageUrl: string;
  downloadUrl?: string; // Only for purchased/owned products
}

export interface Transaction {
  id: string;
  productId: string;
  productName: string;
  date: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
}

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string; // Full content, could be markdown or HTML
  author: string;
  date: string;
  imageUrl: string;
  slug: string;
}

export interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, pass: string) => Promise<boolean>; // Simulating login
  logout: () => void;
  register: (name: string, email: string, pass: string) => Promise<boolean>; // Simulating registration
  loading: boolean;
}

export interface ChildrenProps {
  children: ReactNode;
}
