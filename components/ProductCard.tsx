
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onBuyClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onBuyClick }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
      <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover"/>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-darktext">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-1">Kategori: {product.category}</p>
        <p className="text-gray-700 mb-4 h-20 overflow-y-auto text-sm">{product.description}</p>
        <div className="flex justify-between items-center">
          <p className="text-2xl font-bold text-primary">
            Rp{product.price.toLocaleString('id-ID')}
          </p>
          <button
            onClick={() => onBuyClick(product)}
            className="bg-accent hover:bg-accent-hover text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Beli Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
