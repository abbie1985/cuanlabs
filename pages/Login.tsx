import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { ROUTE_PATHS } from '../constants.ts';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [pageLoading, setPageLoading] = useState<boolean>(false); // Local loading for form submission
  const { login, signInWithGoogle, loading: authLoading } = useAuth(); // Use authLoading for global state
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || ROUTE_PATHS.DASHBOARD;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setPageLoading(true);

    if (!email || !password) {
      setError('Email dan password harus diisi.');
      setPageLoading(false);
      return;
    }

    const { success, error: loginError } = await login(email, password);
    if (success) {
      navigate(from, { replace: true });
    } else {
      setError(loginError || 'Email atau password salah. Silakan coba lagi.');
    }
    setPageLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    // Auth loading state is handled globally by AuthContext
    // No need for setPageLoading(true) here as onAuthStateChange will manage UI updates
    await signInWithGoogle();
    // Navigation will be handled by onAuthStateChange listener effect in AuthContext or ProtectedRoute
  };

  const isLoading = pageLoading || authLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-darktext">
            Login ke Akun Anda
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Atau{' '}
            <Link to={ROUTE_PATHS.REGISTER} className="font-medium text-primary hover:text-primary-hover">
              buat akun baru
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm bg-red-100 p-3 rounded-md">{error}</p>}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-white"
                placeholder="Alamat Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-white"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="#" className="font-medium text-primary hover:text-primary-hover">
                Lupa password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:bg-gray-400"
            >
              {isLoading && !authLoading ? ( // Show spinner only for local form loading
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Login'
              )}
            </button>
          </div>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Atau lanjutkan dengan</span>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              type="button"
              disabled={isLoading}
              className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-200"
            >
              <i className="fab fa-google text-red-500 mr-2 self-center"></i>
              Sign in dengan Google
            </button>
          </div>
        </div>
         {authLoading && (
            <div className="mt-4 text-center text-sm text-gray-600">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2"></div>
                Memproses autentikasi...
            </div>
        )}
      </div>
    </div>
  );
};

export default Login;