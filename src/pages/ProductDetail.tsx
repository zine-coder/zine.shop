import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Minus, Plus, Truck, Shield, RotateCcw, Heart, Check, ShoppingCart } from 'lucide-react';
import ReviewSection from '../components/Product/ReviewSection';
import SimilarProducts from '../components/Product/SimilarProducts';
import { Product, getProduct } from '../lib/supabase';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useWishlist } from '../hooks/useWishlist';
import { useToast } from '../contexts/ToastContext';

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, isInCart, getCartItemQuantity } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, wishlistItems } = useWishlist();
  const { showToast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  
  const inCart = product ? isInCart(product.id) : false;
  const cartQuantity = product ? getCartItemQuantity(product.id) : 0;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const data = await getProduct(slug);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, navigate]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setIsAddingToCart(true);
      await addToCart(product.id, quantity);
      
      // Créer l'élément pour l'animation "fly to cart"
      const productImage = document.querySelector('.product-main-image img');
      const cartIcon = document.querySelector('.cart-icon');
      
      if (productImage && cartIcon) {
        // Créer un clone de l'image pour l'animation
        const flyingImage = document.createElement('img');
        flyingImage.src = (productImage as HTMLImageElement).src;
        flyingImage.className = 'fixed z-50 rounded-md shadow-md animate-fly-to-cart';
        flyingImage.style.width = '75px';
        flyingImage.style.height = '75px';
        flyingImage.style.objectFit = 'cover';
        
        // Positionner l'image au même endroit que l'image du produit
        const rect = productImage.getBoundingClientRect();
        flyingImage.style.top = `${rect.top}px`;
        flyingImage.style.left = `${rect.left}px`;
        
        document.body.appendChild(flyingImage);
        
        // Supprimer l'élément après l'animation
        setTimeout(() => {
          document.body.removeChild(flyingImage);
          // Ajouter l'animation de rebond au panier
          cartIcon.classList.add('animate-cart-bounce');
          setTimeout(() => {
            cartIcon.classList.remove('animate-cart-bounce');
          }, 500);
        }, 600);
      }
      
      // Afficher le toast de succès
      showToast(`${product.name} a été ajouté au panier`, 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Erreur lors de l\'ajout au panier', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  const handleToggleWishlist = async () => {
    if (!product) return;
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      setIsTogglingWishlist(true);
      const inWishlist = isInWishlist(product.id);
      const wishlistItemId = wishlistItems.find(item => item.product_id === product.id)?.id;
      
      if (inWishlist && wishlistItemId) {
        await removeFromWishlist(wishlistItemId);
      } else {
        await addToWishlist(product.id);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
              <div className="flex space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-20 h-20 bg-gray-200 rounded-md"></div>
                ))}
              </div>
            </div>
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produit non trouvé</h1>
          <button
            onClick={() => navigate('/shop')}
            className="text-black hover:underline"
          >
            Retour à la boutique
          </button>
        </div>
      </div>
    );
  }

  const hasDiscount = product.compare_price && product.compare_price > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.compare_price! - product.price) / product.compare_price!) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>Accueil</span>
          <span>/</span>
          <span>Boutique</span>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-white rounded-lg overflow-hidden mb-4 relative product-main-image">
              <img
                src={product.images[selectedImageIndex] || 'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {hasDiscount && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  -{discountPercentage}%
                </div>
              )}
            </div>
            
            {/* Thumbnail images */}
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                    selectedImageIndex === index ? 'border-black' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {renderStars(product.avg_rating || 0)}
                </div>
                <span className="text-sm text-gray-500">
                  {product.avg_rating ? product.avg_rating.toFixed(1) : '0.0'} ({product.review_count || 0} avis)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  €{product.price.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-gray-500 line-through">
                    €{product.compare_price!.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Short Description */}
            {product.short_description && (
              <p className="text-gray-600 leading-relaxed">
                {product.short_description}
              </p>
            )}

            {/* Stock Status */}
            <div className="space-y-2">
              {product.stock_quantity > 0 ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">En stock</span>
                  {product.stock_quantity < 10 && (
                    <span className="text-sm text-orange-600">
                      (Plus que {product.stock_quantity} restant${product.stock_quantity > 1 ? 's' : ''})
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-red-600">Rupture de stock</span>
                </div>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-50"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 min-w-[50px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    className="p-2 hover:bg-gray-50"
                    disabled={quantity >= product.stock_quantity}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0 || isAddingToCart || inCart}
                  className={`flex-1 py-3 px-6 rounded-md font-medium transition-colors disabled:cursor-not-allowed ${inCart ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-black text-white hover:bg-gray-800 disabled:bg-gray-300'}`}
                >
                  {isAddingToCart ? 'Ajout en cours...' : inCart ? (
                    <div className="flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>Dans le panier ({cartQuantity})</span>
                    </div>
                  ) : product.stock_quantity === 0 ? 'Rupture de stock' : (
                    <div className="flex items-center justify-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      <span>Ajouter au panier</span>
                    </div>
                  )}
                </button>

                <button 
                  onClick={handleToggleWishlist}
                  disabled={isTogglingWishlist}
                  className="p-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                  title={isInWishlist(product.id) ? 'Retirer de la liste de souhaits' : 'Ajouter à la liste de souhaits'}
                >
                  <Heart 
                    className={`w-5 h-5 transition-colors duration-300 ${isInWishlist(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} 
                  />
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center space-x-3">
                <Truck className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">Livraison gratuite dès 75€</span>
              </div>
              <div className="flex items-center space-x-3">
                <RotateCcw className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">Retours gratuits sous 30 jours</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">Garantie 2 ans</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b">
            <div className="flex space-x-8">
              {['description', 'avis'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'description' ? 'Description' : 'Avis clients'}
                </button>
              ))}
            </div>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-600 leading-relaxed">
                  {product.description || 'Aucune description disponible pour ce produit.'}
                </p>
              </div>
            )}

            {activeTab === 'avis' && (
              <div className="space-y-6">
                {product.reviews ? (
                  <ReviewSection 
                    reviews={product.reviews} 
                    avgRating={product.avg_rating || 0} 
                    reviewCount={product.review_count || 0}
                    productId={product.id}
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <p>Aucun avis pour le moment</p>
                    <p className="text-sm mt-2">Soyez le premier à donner votre avis sur ce produit !</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {product.related_products ? (
          <SimilarProducts products={product.related_products} />
        ) : (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8">
              VOUS POURRIEZ AUSSI AIMER
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center text-gray-500 col-span-full py-8">
                <p>Produits similaires en cours de chargement...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;