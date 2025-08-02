import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserOrders, Order } from '../lib/supabase';

const Profile = () => {
  const { user, signOut, updateUserEmail, updateUserPassword, updateUserProfile, deleteUser } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // États pour les formulaires de modification
  const [showNameForm, setShowNameForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [newName, setNewName] = useState(user?.user_metadata?.full_name || '');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updateError, setUpdateError] = useState('');
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const ordersData = await getUserOrders();
        setOrders(ordersData);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des commandes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdateError('');
      await updateUserProfile({ full_name: newName });
      setUpdateSuccess('Nom mis à jour avec succès');
      setTimeout(() => setUpdateSuccess(''), 3000);
      setShowNameForm(false);
    } catch (err: any) {
      setUpdateError(err.message || 'Erreur lors de la mise à jour du nom');
    }
  };
  
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdateError('');
      await updateUserEmail(newEmail);
      setUpdateSuccess('Email mis à jour avec succès. Veuillez vérifier votre boîte de réception pour confirmer.');
      setTimeout(() => setUpdateSuccess(''), 3000);
      setShowEmailForm(false);
    } catch (err: any) {
      setUpdateError(err.message || 'Erreur lors de la mise à jour de l\'email');
    }
  };
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setUpdateError('Les mots de passe ne correspondent pas');
      return;
    }
    
    try {
      setUpdateError('');
      await updateUserPassword(newPassword);
      setUpdateSuccess('Mot de passe mis à jour avec succès');
      setTimeout(() => setUpdateSuccess(''), 3000);
      setShowPasswordForm(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setUpdateError(err.message || 'Erreur lors de la mise à jour du mot de passe');
    }
  };
  
  const handleDeleteAccount = async () => {
    try {
      await deleteUser();
      navigate('/');
    } catch (err: any) {
      setUpdateError(err.message || 'Erreur lors de la suppression du compte');
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la déconnexion');
    }
  };
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Vous devez être connecté pour accéder à cette page.</p>
          <button 
            onClick={() => navigate('/login')} 
            className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Titre supprimé comme demandé */}
      
      {updateSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg shadow-sm transition-all duration-300">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {updateSuccess}
          </div>
        </div>
      )}
      
      {updateError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg shadow-sm transition-all duration-300">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {updateError}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fadeIn">
        {/* Informations de compte */}
        <div className="col-span-1 md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Informations de compte</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Nom</p>
                <div className="flex justify-between items-center">
                  <p>{user.user_metadata?.full_name || 'Non défini'}</p>
                  <button 
                    onClick={() => setShowNameForm(!showNameForm)}
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-md transition-colors duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Modifier
                  </button>
                </div>
                
                {showNameForm && (
                  <form onSubmit={handleUpdateName} className="mt-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full p-2 border rounded mb-2"
                      placeholder="Nouveau nom"
                      required
                    />
                    <div className="flex space-x-2">
                      <button 
                        type="submit" 
                        className="px-3 py-1 bg-black text-white text-sm rounded-md hover:bg-gray-800 transition-colors duration-200 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Enregistrer
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setShowNameForm(false)}
                        className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300 transition-colors duration-200 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Annuler
                      </button>
                    </div>
                  </form>
                )}
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <div className="flex justify-between items-center">
                  <p>{user.email}</p>
                  <button 
                    onClick={() => setShowEmailForm(!showEmailForm)}
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-md transition-colors duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Modifier
                  </button>
                </div>
                
                {showEmailForm && (
                  <form onSubmit={handleUpdateEmail} className="mt-2">
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full p-2 border rounded mb-2"
                      placeholder="Nouvel email"
                      required
                    />
                    <div className="flex space-x-2">
                      <button 
                        type="submit" 
                        className="px-3 py-1 bg-black text-white text-sm rounded"
                      >
                        Enregistrer
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setShowEmailForm(false)}
                        className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                )}
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Mot de passe</p>
                <div className="flex justify-between items-center">
                  <p>••••••••</p>
                  <button 
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-md transition-colors duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Modifier
                  </button>
                </div>
                
                {showPasswordForm && (
                  <form onSubmit={handleUpdatePassword} className="mt-2">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-2 border rounded mb-2"
                      placeholder="Nouveau mot de passe"
                      required
                    />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-2 border rounded mb-2"
                      placeholder="Confirmer le mot de passe"
                      required
                    />
                    <div className="flex space-x-2">
                      <button 
                        type="submit" 
                        className="px-3 py-1 bg-black text-white text-sm rounded"
                      >
                        Enregistrer
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setShowPasswordForm(false)}
                        className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t">
              <button 
                onClick={handleSignOut}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Déconnexion
              </button>
            </div>
            
            <div className="mt-8 pt-4 border-t">
              <h3 className="text-lg font-medium text-red-600 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Zone dangereuse
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                La suppression de votre compte est irréversible et entraînera la perte de toutes vos données.
              </p>
              
              {!showDeleteConfirm ? (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer mon compte
                </button>
              ) : (
                <div className="bg-red-50 p-4 border border-red-200 rounded-lg shadow-sm animate-pulse">
                  <p className="text-red-600 font-medium mb-4">
                    Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.
                  </p>
                  <div className="flex space-x-3">
                    <button 
                      onClick={handleDeleteAccount}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Oui, supprimer mon compte
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mes commandes */}
        <div className="col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Mes commandes
            </h2>
            
            {loading ? (
              <p>Chargement des commandes...</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : orders.length === 0 ? (
              <p>Vous n'avez pas encore passé de commande.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-3 hover:shadow-md transition-all duration-200 bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{order.order_number}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        {order.status === 'pending' && 'En attente'}
                        {order.status === 'confirmed' && 'Confirmée'}
                        {order.status === 'processing' && 'En traitement'}
                        {order.status === 'shipped' && 'Expédiée'}
                        {order.status === 'delivered' && 'Livrée'}
                        {order.status === 'cancelled' && 'Annulée'}
                        {order.status === 'refunded' && 'Remboursée'}
                      </span>
                      <span className="font-medium">{order.total_amount.toFixed(2)} €</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;