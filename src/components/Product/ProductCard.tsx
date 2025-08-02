import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Eye, Zap, Check } from 'lucide-react';
import { Product } from '../../lib/supabase';
import { useWishlist } from '../../hooks/useWishlist';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist, wishlistItems } = useWishlist();
  const { user } = useAuth();
  const { addToCart, isInCart, getCartItemQuantity } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  
  const inWishlist = isInWishlist(product.id);
  const inCart = isInCart(product.id);
  const cartQuantity = getCartItemQuantity(product.id);
  
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 transition-colors ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)
    : 0;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      window.location.href = '/login';
      return;
    }
    
    setIsTogglingWishlist(true);
    if (inWishlist) {
      const wishlistItem = wishlistItems.find(item => item.product_id === product.id);
      if (wishlistItem) {
        removeFromWishlist(wishlistItem.id).finally(() => {
          setIsTogglingWishlist(false);
        });
      } else {
        setIsTogglingWishlist(false);
      }
    } else {
      addToWishlist(product.id).finally(() => {
        setIsTogglingWishlist(false);
      });
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      window.location.href = '/login';
      return;
    }
    
    setIsAddingToCart(true);
    addToCart(product.id).finally(() => {
      setIsAddingToCart(false);
    });
  };

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100 overflow-hidden">
      {/* Product Image Container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <Link to={`/product/${product.slug}`}>
          <div className="aspect-square relative">
            <img
              src={product.images[0] || 'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg'}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
            
            {/* Quick view button - appears on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-full p-3 shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                <Eye className="w-6 h-6 text-gray-800" />
              </div>
            </div>
          </div>
        </Link>

        {/* Badges Container */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {/* Discount Badge */}
          {hasDiscount && (
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
              -{discountPercentage}%
            </div>
          )}
          
          {/* Low Stock Badge */}
          {product.stock_quantity < 10 && product.stock_quantity > 0 && (
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {product.stock_quantity} restants
            </div>
          )}
          
          {/* Out of Stock Badge */}
          {product.stock_quantity === 0 && (
            <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              Rupture de stock
            </div>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={handleWishlistToggle}
          className={`absolute top-4 right-4 p-3 bg-white bg-opacity-95 backdrop-blur-sm rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
            isTogglingWishlist ? 'opacity-50' : 'opacity-90 hover:opacity-100'
          } ${inWishlist ? 'bg-red-50' : ''}`}
          disabled={isTogglingWishlist}
        >
          <Heart 
            className={`w-5 h-5 transition-all duration-300 ${
              inWishlist 
                ? 'fill-red-500 text-red-500 scale-110' 
                : 'text-gray-600 hover:text-red-500'
            }`} 
          />
        </button>

        {/* Quick Add to Cart - appears on hover */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          <button 
            onClick={handleAddToCart}
            disabled={!product.stock_quantity || isAddingToCart || inCart}
            className={`w-full backdrop-blur-sm text-white py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed shadow-xl flex items-center justify-center gap-2 ${inCart ? 'bg-green-600 hover:bg-green-700' : 'bg-black bg-opacity-95 hover:bg-gray-800 disabled:bg-gray-400'}`}
          >
            {isAddingToCart ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Ajout...
              </>
            ) : inCart ? (
              <>
                <Check className="w-4 h-4" />
                Dans le panier ({cartQuantity})
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Ajouter au panier
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6 space-y-4">
        {/* Product Name */}
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-bold text-lg text-gray-900 hover:text-gray-700 transition-colors duration-300 line-clamp-2 group-hover:text-black">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {renderStars(product.avg_rating || 0)}
            </div>
            <span className="text-sm text-gray-500 font-medium">
              ({product.review_count || 0})
            </span>
          </div>
          
          {/* Stock indicator */}
          <div className={`w-3 h-3 rounded-full ${
            product.stock_quantity > 10 
              ? 'bg-green-400' 
              : product.stock_quantity > 0 
                ? 'bg-orange-400' 
                : 'bg-red-400'
          }`} />
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-xl text-gray-900">
              €{product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through bg-gray-100 px-2 py-1 rounded">
                €{product.compare_price!.toFixed(2)}
              </span>
            )}
          </div>
          
          {hasDiscount && (
            <div className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
              Économisez €{(product.compare_price! - product.price).toFixed(2)}
            </div>
          )}
        </div>

        {/* Mobile Add to Cart Button */}
        <div className="block sm:hidden pt-2">
          <button 
            onClick={handleAddToCart}
            disabled={!product.stock_quantity || isAddingToCart || inCart}
            className={`w-full text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg ${inCart ? 'bg-green-600 hover:bg-green-700' : 'bg-black hover:bg-gray-800 disabled:bg-gray-300'}`}
          >
            {isAddingToCart ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Ajout...
              </>
            ) : inCart ? (
              <>
                <Check className="w-4 h-4" />
                Dans le panier ({cartQuantity})
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Ajouter au panier
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;