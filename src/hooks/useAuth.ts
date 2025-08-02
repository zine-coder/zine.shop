import { useState, useEffect } from 'react';
import { User, UserAttributes } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const isAdmin = user?.user_metadata?.role === 'admin';

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updateUserEmail = async (email: string) => {
    const { data, error } = await supabase.auth.updateUser({ email });
    if (error) throw error;
    return data;
  };

  const updateUserPassword = async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return data;
  };

  const updateUserProfile = async (userData: { full_name?: string }) => {
    const { data, error } = await supabase.auth.updateUser({
      data: userData
    });
    if (error) throw error;
    return data;
  };

  const deleteUser = async () => {
    // Supprimer les données utilisateur dans les tables liées
    try {
      // Supprimer le panier
      await supabase.from('cart_items').delete().eq('user_id', user?.id);
      
      // Supprimer les commandes et les éléments de commande associés
      // Note: Cela dépend de la configuration des contraintes CASCADE dans la base de données
      await supabase.from('orders').delete().eq('user_id', user?.id);
      
      // Supprimer les avis
      await supabase.from('reviews').delete().eq('user_id', user?.id);
      
      // Supprimer la liste de souhaits
      await supabase.from('wishlist').delete().eq('user_id', user?.id);
      
      // Supprimer le compte utilisateur
      const { error } = await supabase.auth.admin.deleteUser(user?.id as string);
      if (error) {
        // Si l'API admin n'est pas disponible, utiliser la déconnexion comme solution de repli
        console.error('Erreur lors de la suppression du compte:', error);
        await signOut();
        throw new Error('La suppression du compte a échoué. Veuillez contacter le support.');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression des données utilisateur:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateUserEmail,
    updateUserPassword,
    updateUserProfile,
    deleteUser,
    isAdmin,
  };
};