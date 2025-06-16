
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTE_PATHS } from '../constants';

const Register: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const { register, signInWithGoogle, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setPageLoading(true);

    if (!name || !email || !password || !confirmPassword) {
      setError('Semua field harus diisi.');
      setPageLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      setPageLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      setPageLoading(false);
      return;
    }

    const { success, error: registerError } = await register(name, email, password);
    if (success) {
      navigate(ROUTE_PATHS.DASHBOARD); // Or a "please check your email" page if email confirmation is enabled
    } else {
      setError(registerError || 'Gagal membuat akun. Email mungkin sudah terdaftar atau terjadi kesalahan lain.');
    }
    setPageLoading(false);
  };
  
  const handleGoogleSignIn = async () => {
    setError('');
    // Auth loading state is handled globally by AuthContext
    await signInWithGoogle();
     // Navigation will be handled by onAuthStateChange listener effect
     // Supabase handles if user exists (login) or new (signup + profile creation might need a trigger/function in Supabase for OAuth)
     // For OAuth, profile creation may need to be handled by a DB trigger on new user insert in auth.users,
     // or a check in onAuthStateChange to create profile if doesn't exist.
     // The current AuthContext `fetchAndSetUserProfile` might need adjustment for this OAuth flow if profile is not immediately present.
  };

  const isLoading = pageLoading || authLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-darktext">
            Buat Akun Baru
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sudah punya akun?{' '}
            <Link to={ROUTE_PATHS.LOGIN} className="font-medium text-primary hover:text-primary-hover">
              Login di sini
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm bg-red-100 p-3 rounded-md">{error}</p>}
          <div className="rounded-md shadow-sm">
            <div className="mb-4">
              <label htmlFor="name" className="sr-only">Nama Lengkap</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white"
                placeholder="Nama Lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email-address" className="sr-only">Alamat Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white"
                placeholder="Alamat Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white"
                placeholder="Password (min. 6 karakter)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">Konfirmasi Password</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white"
                placeholder="Konfirmasi Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:bg-gray-400"
            >
              {isLoading && !authLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Register'
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
              <span className="px-2 bg-white text-gray-500">Atau daftar dengan</span>
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
              Sign up dengan Google
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

export default Register;
