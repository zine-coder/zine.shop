import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingCart, Star } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';

const Wishlist = () => {
  const { wishlistItems, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState<Record<string, boolean>>({});

  const handleAddToCart = async (productId: string) => {
    setAddingToCart(prev => ({ ...prev, [productId]: true }));
    try {
      await addToCart(productId);
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Ma Liste de Souhaits</h1>
            <div className="flex justify-center items-center h-64">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-t-transparent absolute top-0"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Ma Liste de Souhaits</h1>
            
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Votre liste est vide</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Découvrez nos produits exceptionnels et ajoutez vos favoris à votre liste de souhaits.
              </p>
              <Link 
                to="/shop" 
                className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Star className="w-5 h-5" />
                Découvrir nos produits
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Ma Liste de Souhaits</h1>
          <p className="text-gray-600 text-lg">
            {wishlistItems.length} produit{wishlistItems.length > 1 ? 's' : ''} dans votre liste
          </p>
        </div>
        
        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {wishlistItems.map((item) => (
            <div key={item.id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-gray-200">
              {/* Product Image */}
              <div className="relative overflow-hidden">
                {item.product?.images && item.product.images.length > 0 && (
                  <Link to={`/product/${item.product.slug}`} className="block">
                    <div className="aspect-square overflow-hidden bg-gray-100">
                      <img 
                        src={item.product.images[0]} 
                        alt={item.product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </Link>
                )}
                
                {/* Remove Button */}
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-white transition-all duration-300 shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                  title="Retirer de la liste de souhaits"
                >
                  <Trash2 size={18} />
                </button>

                {/* Stock Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.product?.stock_quantity 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {item.product?.stock_quantity ? 'En stock' : 'Rupture'}
                  </span>
                </div>
              </div>
              
              {/* Product Info */}
              <div className="p-6">
                <Link to={`/product/${item.product?.slug}`} className="block mb-4">
                  <h2 className="text-lg font-bold text-gray-900 hover:text-gray-700 transition-colors duration-300 line-clamp-2 leading-tight">
                    {item.product?.name}
                  </h2>
                </Link>
                
                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-900">
                      {item.product?.price.toFixed(2)} €
                    </span>
                    {item.product?.compare_price && (
                      <span className="text-base text-gray-500 line-through">
                        {item.product.compare_price.toFixed(2)} €
                      </span>
                    )}
                  </div>
                  {item.product?.compare_price && (
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        -{Math.round(((item.product.compare_price - item.product.price) / item.product.compare_price) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(item.product_id)}
                  disabled={!item.product?.stock_quantity || addingToCart[item.product_id]}
                  className="w-full bg-black text-white py-4 px-6 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
                >
                  {addingToCart[item.product_id] ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Ajout en cours...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      Ajouter au panier
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Continuez vos découvertes</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Explorez notre collection complète et trouvez d'autres produits qui vous plairont.
            </p>
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Star className="w-5 h-5" />
              Voir tous les produits
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;