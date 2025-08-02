import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, Truck } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { createOrder } from '../lib/supabase';

const Checkout = () => {
  const { cart, cartTotal, loading: cartLoading } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  // Shipping form
  const [shippingForm, setShippingForm] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    postalCode: '',
    country: 'France'
  });

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');

  const [sameAsBilling, setSameAsBilling] = useState(true);

  useEffect(() => {
    // Ne rien faire si l'authentification ou le panier est en cours de chargement
    if (authLoading || cartLoading) {
      return;
    }
    
    // Vérifier si l'utilisateur est authentifié
    if (!user) {
      // Rediriger vers la page de connexion avec un paramètre de retour
      navigate('/login', { state: { returnTo: '/checkout' } });
      return;
    }

    // Vérifier si le panier est vide
    if (cart.length === 0) {
      navigate('/cart');
      return;
    }
    
    // Pré-remplir le formulaire avec les informations de l'utilisateur si disponibles
    if (user?.user_metadata?.full_name) {
      const nameParts = user.user_metadata.full_name.split(' ');
      setShippingForm(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || ''
      }));
    }
  }, [user, authLoading, cart, cartLoading, navigate]);

  const shippingCost = cartTotal > 75 ? 0 : 9.99;
  const taxRate = 0.20;
  const taxAmount = cartTotal * taxRate;
  const finalTotal = cartTotal + shippingCost + taxAmount;

  const steps = [
    { name: 'Livraison', icon: MapPin },
    { name: 'Paiement', icon: CreditCard },
    { name: 'Confirmation', icon: Truck }
  ];

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveStep(1);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');

      const shippingAddress = {
        name: `${shippingForm.firstName} ${shippingForm.lastName}`,
        email: shippingForm.email,
        phone: shippingForm.phone,
        address: shippingForm.address,
        apartment: shippingForm.apartment,
        city: shippingForm.city,
        postal_code: shippingForm.postalCode,
        country: shippingForm.country
      };

      const billingAddress = sameAsBilling ? shippingAddress : shippingAddress; // For simplicity

      // Créer la commande avec la méthode de paiement à la livraison
      const result = await createOrder(shippingAddress, billingAddress, paymentMethod);
      
      if (result.success) {
        // Pas besoin de simuler le traitement du paiement pour le paiement à la livraison
        navigate('/order-success', { 
          state: { 
            orderCreated: true, 
            orderNumber: result.order_number,
            orderTotal: finalTotal,
            shippingAddress: shippingAddress,
            paymentMethod: paymentMethod
          } 
        });
      } else {
        setError(result.message || 'Erreur lors de la création de la commande');
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la création de la commande');
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
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
          <span>Panier</span>
          <span>/</span>
          <span className="text-gray-900">Commande</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Finaliser la commande</h1>

        {/* Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                index <= activeStep 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-gray-400 border-gray-300'
              }`}>
                <step.icon className="w-5 h-5" />
              </div>
              <span className={`ml-2 mr-6 text-sm font-medium ${
                index <= activeStep ? 'text-black' : 'text-gray-400'
              }`}>
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mr-6 ${
                  index < activeStep ? 'bg-black' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
                {error}
              </div>
            )}

            {/* Shipping Form */}
            {activeStep === 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Adresse de livraison
                </h2>
                
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingForm.firstName}
                        onChange={(e) => setShippingForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingForm.lastName}
                        onChange={(e) => setShippingForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={shippingForm.email}
                        onChange={(e) => setShippingForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={shippingForm.phone}
                        onChange={(e) => setShippingForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingForm.address}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Appartement, suite, etc. (optionnel)
                    </label>
                    <input
                      type="text"
                      value={shippingForm.apartment}
                      onChange={(e) => setShippingForm(prev => ({ ...prev, apartment: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ville *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingForm.city}
                        onChange={(e) => setShippingForm(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Code postal *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingForm.postalCode}
                        onChange={(e) => setShippingForm(prev => ({ ...prev, postalCode: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pays *
                      </label>
                      <select
                        required
                        value={shippingForm.country}
                        onChange={(e) => setShippingForm(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        <option value="France">France</option>
                        <option value="Belgique">Belgique</option>
                        <option value="Suisse">Suisse</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full bg-black text-white py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
                    >
                      Continuer vers le paiement
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Payment Form */}
            {activeStep === 1 && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Informations de paiement
                </h2>
                
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <div className="flex items-center">
                      <div className="h-5">
                        <input
                          id="cash-on-delivery"
                          name="payment-method"
                          type="radio"
                          checked={true}
                          className="h-4 w-4 text-black border-gray-300 focus:ring-black"
                          readOnly
                        />
                      </div>
                      <div className="ml-3">
                        <label htmlFor="cash-on-delivery" className="font-medium text-gray-900">
                          Paiement à la livraison
                        </label>
                      </div>
                    </div>
                    <p className="text-gray-500 mt-2 ml-7 text-sm">
                      Vous paierez en espèces ou par carte bancaire à la réception de votre commande.
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveStep(0)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-md font-medium hover:bg-gray-300 transition-colors"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-black text-white py-3 rounded-md font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Traitement...' : 'Finaliser la commande'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Résumé de commande
              </h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.map((item) => {
                  if (!item.product) return null;
                  
                  return (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.images[0] || 'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg'}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        €{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">€{cartTotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Livraison</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? 'Gratuite' : `€${shippingCost.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">TVA (20%)</span>
                  <span className="font-medium">€{taxAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-xl font-semibold border-t pt-3">
                  <span>Total</span>
                  <span>€{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;