import { useState, useEffect } from 'react';
import { supabase, Product } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchWishlist = async () => {
    if (!user) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération de la liste de souhaits:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!user) return { success: false, message: 'Vous devez être connecté' };

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .insert([{ user_id: user.id, product_id: productId }]);

      if (error) throw error;
      await fetchWishlist();
      return { success: true, message: 'Produit ajouté à la liste de souhaits' };
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout à la liste de souhaits:', error);
      return { 
        success: false, 
        message: error.code === '23505' 
          ? 'Ce produit est déjà dans votre liste de souhaits' 
          : 'Erreur lors de l\'ajout à la liste de souhaits'
      };
    }
  };

  const removeFromWishlist = async (wishlistItemId: string) => {
    if (!user) return { success: false, message: 'Vous devez être connecté' };

    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', wishlistItemId);

      if (error) throw error;
      await fetchWishlist();
      return { success: true, message: 'Produit retiré de la liste de souhaits' };
    } catch (error) {
      console.error('Erreur lors du retrait de la liste de souhaits:', error);
      return { success: false, message: 'Erreur lors du retrait de la liste de souhaits' };
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  return {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refreshWishlist: fetchWishlist
  };
};