
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="container mx-auto px-6 text-center">
        <p>&copy; {new Date().getFullYear()} CUANLABS. All rights reserved.</p>
        <p className="text-sm text-gray-400 mt-2">Platform Belajar & Tools Digital untuk Cuan Online</p>
        <div className="mt-4 flex justify-center space-x-4">
          <a href="#" className="hover:text-primary"><i className="fab fa-facebook-f"></i></a>
          <a href="#" className="hover:text-primary"><i className="fab fa-twitter"></i></a>
          <a href="#" className="hover:text-primary"><i className="fab fa-instagram"></i></a>
          <a href="#" className="hover:text-primary"><i className="fab fa-linkedin-in"></i></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
