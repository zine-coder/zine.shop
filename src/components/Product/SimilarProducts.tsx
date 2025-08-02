import React from 'react';
import { Product } from '../../lib/supabase';
import ProductCard from './ProductCard';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';

interface SimilarProductsProps {
  products: Partial<Product>[];
}

const SimilarProducts: React.FC<SimilarProductsProps> = ({ products }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();

  if (!products || products.length === 0) {
    return null;
  }
  
  const handleQuickAddToCart = async (productId: string) => {
    if (!user) {
      // Rediriger vers la page de connexion ou afficher un message
      return;
    }
    
    try {
      await addToCart(productId, 1);
      // Afficher un message de succès ou une notification
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-center mb-8">
        VOUS POURRIEZ AUSSI AIMER
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="group relative">
            <ProductCard 
              product={product as Product} 
            />
            {/* Quick add to cart button - visible on hover */}
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
              <button 
                onClick={() => product.id && handleQuickAddToCart(product.id)}
                className="w-full bg-black text-white py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                disabled={!product.stock_quantity || product.stock_quantity <= 0}
              >
                {!product.stock_quantity || product.stock_quantity <= 0 ? 'Rupture de stock' : 'Ajouter au panier'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarProducts;