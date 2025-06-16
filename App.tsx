
import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom'; // Added Link import
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Produk from './pages/Produk';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Blog, { SingleBlogPostPage } from './pages/Blog'; // Assuming SingleBlogPostPage is exported for routing
import Affiliate from './pages/Affiliate';
import KalkulatorPage from './pages/KalkulatorPage'; // Import the new KalkulatorPage
import { ROUTE_PATHS } from './constants';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path={ROUTE_PATHS.HOME} element={<Home />} />
              <Route path={ROUTE_PATHS.PRODUCTS} element={<Produk />} />
              <Route path={ROUTE_PATHS.LOGIN} element={<Login />} />
              <Route path={ROUTE_PATHS.REGISTER} element={<Register />} />
              <Route path={ROUTE_PATHS.BLOG} element={<Blog />} />
              <Route path="/blog/:slug" element={<SingleBlogPostPage />} /> {/* Placeholder route for single blog post */}
              <Route path={ROUTE_PATHS.CALCULATOR} element={<KalkulatorPage />} /> {/* Route for Kalkulator Page */}
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path={ROUTE_PATHS.DASHBOARD} element={<Dashboard />} />
                <Route path={ROUTE_PATHS.AFFILIATE} element={<Affiliate />} />
              </Route>
              
              {/* Fallback for undefined routes - optional */}
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
