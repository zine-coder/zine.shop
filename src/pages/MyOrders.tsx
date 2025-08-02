import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Order, getUserOrders } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const location = useLocation();

  const orderCreated = location.state?.orderCreated;
  const orderNumber = location.state?.orderNumber;

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        const data = await getUserOrders();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
      case 'refunded':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'confirmed':
        return 'Confirmée';
      case 'processing':
        return 'En préparation';
      case 'shipped':
        return 'Expédiée';
      case 'delivered':
        return 'Livrée';
      case 'cancelled':
        return 'Annulée';
      case 'refunded':
        return 'Remboursée';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
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
          <span className="text-gray-900">Mes commandes</span>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mes commandes</h1>
          <Link
            to="/shop"
            className="bg-black text-white px-6 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors"
          >
            Continuer les achats
          </Link>
        </div>

        {/* Success message */}
        {orderCreated && orderNumber && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-6 py-4 rounded-lg mb-8">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <div>
                <p className="font-medium">Commande créée avec succès !</p>
                <p className="text-sm">
                  Votre commande #{orderNumber} a été enregistrée et sera traitée sous peu.
                </p>
              </div>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Aucune commande
            </h2>
            <p className="text-gray-600 mb-8">
              Vous n'avez pas encore passé de commande
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center bg-black text-white px-8 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
            >
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Commande #{order.order_number}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Passée le {new Date(order.created_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <span className="text-xl font-bold text-gray-900">
                        €{order.total_amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Shipping Address */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Adresse de livraison
                      </h4>
                      <div className="text-sm text-gray-600">
                        <p>{order.shipping_address?.name}</p>
                        <p>{order.shipping_address?.address}</p>
                        {order.shipping_address?.apartment && (
                          <p>{order.shipping_address.apartment}</p>
                        )}
                        <p>
                          {order.shipping_address?.postal_code} {order.shipping_address?.city}
                        </p>
                        <p>{order.shipping_address?.country}</p>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Mode de paiement
                      </h4>
                      <div className="text-sm text-gray-600">
                        <p className="capitalize">{order.payment_method}</p>
                        <p className={`capitalize ${
                          order.payment_status === 'paid' 
                            ? 'text-green-600' 
                            : order.payment_status === 'failed'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                        }`}>
                          {order.payment_status === 'paid' ? 'Payé' : 
                           order.payment_status === 'failed' ? 'Échec' : 
                           'En attente'}
                        </p>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Résumé
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Sous-total:</span>
                          <span>€{order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Livraison:</span>
                          <span>€{order.shipping_amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>TVA:</span>
                          <span>€{order.tax_amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-gray-900 border-t pt-1">
                          <span>Total:</span>
                          <span>€{order.total_amount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tracking */}
                  {order.tracking_number && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <Truck className="w-5 h-5 text-blue-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">
                            Numéro de suivi
                          </p>
                          <p className="text-sm text-blue-700">
                            {order.tracking_number}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;