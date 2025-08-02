import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Truck, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Récupérer les informations de commande depuis l'état de navigation
  const orderCreated = location.state?.orderCreated;
  const orderNumber = location.state?.orderNumber;
  const orderTotal = location.state?.orderTotal;
  const shippingAddress = location.state?.shippingAddress;

  // Rediriger vers la page d'accueil si aucune information de commande n'est disponible
  useEffect(() => {
    if (!orderCreated || !orderNumber) {
      navigate('/my-orders');
    }
  }, [orderCreated, orderNumber, navigate]);

  // Si pas d'informations de commande, afficher un message de chargement
  if (!orderCreated || !orderNumber) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des informations de commande...</p>
        </div>
      </div>
    );
  }

  // Simuler un numéro de suivi (dans une vraie application, cela viendrait du backend)
  const trackingNumber = `TR-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Bannière de succès */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Commande confirmée !</h1>
          <p className="text-lg text-gray-600 mb-4">
            Merci pour votre commande. Un email de confirmation a été envoyé à {user?.email}.
          </p>
          <div className="inline-block bg-green-100 text-green-800 font-medium px-4 py-2 rounded-full">
            Commande #{orderNumber}
          </div>
        </div>

        {/* Détails de la commande */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Détails de la commande</h2>
            <p className="text-sm text-gray-500">Passée le {new Date().toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Adresse de livraison */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <Truck className="w-4 h-4 mr-2" />
                  Adresse de livraison
                </h3>
                {shippingAddress ? (
                  <div className="text-sm text-gray-600">
                    <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
                    <p>{shippingAddress.address}</p>
                    {shippingAddress.apartment && <p>{shippingAddress.apartment}</p>}
                    <p>
                      {shippingAddress.postalCode} {shippingAddress.city}
                    </p>
                    <p>{shippingAddress.country}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Adresse de livraison non disponible</p>
                )}
              </div>

              {/* Informations de suivi */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <Truck className="w-4 h-4 mr-2" />
                  Informations de suivi
                </h3>
                <div className="text-sm">
                  <p className="text-gray-600 mb-1">Numéro de suivi:</p>
                  <p className="font-medium text-blue-600">{trackingNumber}</p>
                  <p className="text-gray-500 mt-2 text-xs">
                    Un email avec les informations de suivi vous sera envoyé dès que votre commande sera expédiée.
                  </p>
                </div>
              </div>
            </div>

            {/* Montant total */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Montant total</span>
                <span className="text-xl font-bold text-gray-900">
                  €{orderTotal ? orderTotal.toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            to="/my-orders"
            className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voir mes commandes
          </Link>
          
          <Link
            to="/shop"
            className="flex items-center justify-center px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;