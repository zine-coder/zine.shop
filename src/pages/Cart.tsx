import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';

const Cart = () => {
  const { cart, updateQuantity, removeItem, cartTotal, loading } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const shippingCost = cartTotal > 75 ? 0 : 9.99;
  const taxRate = 0.20;
  const taxAmount = cartTotal * taxRate;
  const finalTotal = cartTotal + shippingCost + taxAmount;

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeItem(productId);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleCheckout = () => {
    // Vérifier si le chargement de l'authentification est terminé
    if (authLoading) {
      return; // Attendre que le chargement soit terminé
    }
    
    // Vérifier si l'utilisateur est authentifié
    if (!user) {
      navigate('/login', { state: { returnTo: '/checkout' } });
      return;
    }
    
    navigate('/checkout');
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg">
                <div className="flex space-x-4">
                  <div className="w-24 h-24 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Votre panier</h1>
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Votre panier est vide
            </h2>
            <p className="text-gray-600 mb-8">
              Découvrez nos produits et ajoutez-les à votre panier
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center bg-black text-white px-8 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
            >
              Continuer les achats
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <span>Accueil</span>
          <span>/</span>
          <span className="text-gray-900">Panier</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Votre panier</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              if (!item.product) return null;
              
              return (
                <div key={item.id} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center space-x-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.images[0] || 'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.product.slug}`}
                        className="text-lg font-medium text-gray-900 hover:text-gray-700 block truncate"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-gray-500 truncate">
                        {item.product.short_description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-semibold text-gray-900">
                          €{item.product.price.toFixed(2)}
                        </span>
                        {item.product.stock_quantity < 10 && (
                          <span className="text-sm text-orange-600">
                            Plus que {item.product.stock_quantity} en stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                          onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-50 disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 min-w-[50px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-50 disabled:opacity-50"
                          disabled={item.quantity >= item.product.stock_quantity}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.product_id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right">
                      <span className="text-lg font-semibold text-gray-900">
                        €{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Résumé de commande
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">€{cartTotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Livraison {cartTotal > 75 && (
                      <span className="text-green-600 text-sm">(Gratuite)</span>
                    )}
                  </span>
                  <span className="font-medium">
                    {shippingCost === 0 ? 'Gratuite' : `€${shippingCost.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">TVA (20%)</span>
                  <span className="font-medium">€{taxAmount.toFixed(2)}</span>
                </div>

                {cartTotal <= 75 && (
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                    <span className="text-blue-600 font-medium">
                      Ajoutez €{(75 - cartTotal).toFixed(2)} pour la livraison gratuite
                    </span>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>€{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={authLoading}
                className={`w-full bg-black text-white py-3 rounded-md font-medium transition-colors mt-6 ${authLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-800'}`}
              >
                {authLoading ? 'Chargement...' : 'Procéder au paiement'}
              </button>

              <Link
                to="/shop"
                className="block text-center text-gray-600 hover:text-gray-900 mt-4 underline"
              >
                Continuer les achats
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;