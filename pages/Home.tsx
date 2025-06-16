
import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '../constants';
import KalkulatorCuan from '../components/KalkulatorCuan'; // Import the calculator

const StatCard: React.FC<{ icon: string; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform duration-300">
    <i className={`${icon} text-4xl text-primary mb-4`}></i>
    <h3 className="text-xl font-semibold mb-2 text-darktext">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Home: React.FC = () => {
  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20 md:py-32">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Selamat Datang di CUANLABS</h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Platform lengkap untuk belajar, menggunakan tools digital, dan meraih potensi penghasilan online Anda.
          </p>
          <Link
            to={ROUTE_PATHS.PRODUCTS}
            className="bg-white text-primary hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg transition-colors shadow-md hover:shadow-lg"
          >
            Jelajahi Produk Digital
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-light">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-darktext">Kenapa Memilih CUANLABS?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <StatCard 
              icon="fas fa-store" 
              title="Marketplace Produk Digital" 
              description="Temukan AI Prompts, template, script, dan mini course berkualitas untuk menunjang cuan Anda."
            />
            <StatCard 
              icon="fas fa-calculator" 
              title="Kalkulator Bisnis Online" 
              description="Hitung harga jual, BEP, simulasi profit, dan komisi dengan kalkulator canggih kami."
            />
            <StatCard 
              icon="fas fa-users" 
              title="Komunitas & Support" 
              description="Bergabung dengan komunitas pembelajar dan dapatkan dukungan untuk berkembang."
            />
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-2 sm:px-4 lg:px-6"> {/* Adjusted padding for calculator */}
          <div className="max-w-3xl mx-auto"> {/* Wider container for calculator */}
            <KalkulatorCuan />
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Siap Memulai Perjalanan Cuan Anda?</h2>
          <p className="text-lg mb-8 max-w-xl mx-auto">
            Daftar sekarang dan dapatkan akses ke berbagai sumber daya eksklusif untuk membantu Anda sukses secara online.
          </p>
          <Link
            to={ROUTE_PATHS.REGISTER}
            className="bg-accent hover:bg-accent-hover text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors shadow-md hover:shadow-lg"
          >
            Daftar Gratis Sekarang
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
