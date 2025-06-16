
import React from 'react';
import { HashRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';

import Home from './pages/Home.tsx';
import Produk from './pages/Produk.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Blog, { SingleBlogPostPage } from './pages/Blog.tsx';
import Affiliate from './pages/Affiliate.tsx';
import KalkulatorPage from './pages/KalkulatorPage.tsx';
import CuanAssistantPage from './pages/CuanAssistantPage.tsx';
import ProductDescriptionGeneratorPage from './pages/ProductDescriptionGeneratorPage.tsx';
import BlogOutlineGeneratorPage from './pages/tools/BlogOutlineGeneratorPage.tsx'; // New Page
import UpgradePremiumPage from './pages/UpgradePremiumPage.tsx'; // Import new page
import { ROUTE_PATHS, ADMIN_ROUTE_PATHS } from './constants.ts';

// Admin Components
import AdminProtectedRoute from './components/admin/AdminProtectedRoute.tsx';
import AdminLayout from './components/admin/AdminLayout.tsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.tsx';
import UserManagementPage from './pages/admin/UserManagementPage.tsx';
import ProductManagementPage from './pages/admin/ProductManagementPage.tsx';
import PostManagementPage from './pages/admin/PostManagementPage.tsx';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage.tsx';
import AdminPagesManagementPage from './pages/admin/AdminPagesManagementPage.tsx';
import AdminProductForm from './pages/admin/AdminProductForm.tsx'; // For create/edit products
import AdminPostForm from './pages/admin/AdminPostForm.tsx'; // For create/edit posts


const App: React.FC = () => {
  console.log('[App.tsx] App component rendering...');
  return (
    <AuthProvider>
      <HashRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path={ROUTE_PATHS.HOME} element={<Home />} />
              <Route path={ROUTE_PATHS.PRODUCTS} element={<Produk />} />
              <Route path={ROUTE_PATHS.LOGIN} element={<Login />} />
              <Route path={ROUTE_PATHS.REGISTER} element={<Register />} />
              <Route path={ROUTE_PATHS.BLOG} element={<Blog />} />
              <Route path="/blog/:slug" element={<SingleBlogPostPage />} />
              <Route path={ROUTE_PATHS.CALCULATOR} element={<KalkulatorPage />} />
              <Route path={ROUTE_PATHS.CUAN_ASSISTANT} element={<CuanAssistantPage />} />
              <Route path={ROUTE_PATHS.PRODUCT_DESCRIPTION_GENERATOR} element={<ProductDescriptionGeneratorPage />} />
              <Route path={ROUTE_PATHS.BLOG_OUTLINE_GENERATOR} element={<BlogOutlineGeneratorPage />} /> {/* New Route */}
              
              {/* Protected User Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path={ROUTE_PATHS.DASHBOARD} element={<Dashboard />} />
                <Route path={ROUTE_PATHS.AFFILIATE} element={<Affiliate />} />
                <Route path={ROUTE_PATHS.UPGRADE_PREMIUM} element={<UpgradePremiumPage />} /> 
              </Route>

              {/* Admin Routes */}
              <Route element={<AdminProtectedRoute />}>
                <Route path={ADMIN_ROUTE_PATHS.ADMIN_PREFIX} element={<AdminLayout />}> {/* Use Outlet in AdminLayout */}
                  <Route index element={<AdminDashboardPage />} /> {/* Default admin page */}
                  <Route path={ADMIN_ROUTE_PATHS.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
                  <Route path={ADMIN_ROUTE_PATHS.ADMIN_USERS} element={<UserManagementPage />} />
                  <Route path={ADMIN_ROUTE_PATHS.ADMIN_PRODUCTS} element={<ProductManagementPage />} />
                  <Route path={ADMIN_ROUTE_PATHS.ADMIN_PRODUCTS_NEW} element={<AdminProductForm />} />
                  <Route path={ADMIN_ROUTE_PATHS.ADMIN_PRODUCTS_EDIT} element={<AdminProductForm />} />
                  <Route path={ADMIN_ROUTE_PATHS.ADMIN_POSTS} element={<PostManagementPage />} />
                  <Route path={ADMIN_ROUTE_PATHS.ADMIN_POSTS_NEW} element={<AdminPostForm />} />
                  <Route path={ADMIN_ROUTE_PATHS.ADMIN_POSTS_EDIT} element={<AdminPostForm />} />
                  <Route path={ADMIN_ROUTE_PATHS.ADMIN_ANALYTICS} element={<AdminAnalyticsPage />} />
                  <Route path={ADMIN_ROUTE_PATHS.ADMIN_PAGES} element={<AdminPagesManagementPage />} />
                  {/* Add other admin sub-routes here */}
                </Route>
              </Route>
              
              {/* Fallback for undefined routes */}
              <Route path="*" element={
                <div className="text-center py-20">
                  <h1 className="text-4xl font-bold text-primary">404 - Halaman Tidak Ditemukan</h1>
                  <p className="mt-4">Maaf, halaman yang Anda cari tidak ada.</p>
                  <Link to={ROUTE_PATHS.HOME} className="mt-6 inline-block bg-primary text-white py-2 px-4 rounded hover:bg-primary-hover">
                    Kembali ke Home
                  </Link>
                </div>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
