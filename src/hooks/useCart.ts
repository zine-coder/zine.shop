import { useState, useEffect } from 'react';
import { CartItem, getCart, addToCart as addToCartApi, updateCartQuantity as updateCartQuantityApi, removeFromCart as removeFromCartApi } from '../lib/supabase';
import { useAuth } from './useAuth';

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCart = async () => {
    if (!user) {
      setCart([]);
      return;
    }
    
    try {
      setLoading(true);
      const data = await getCart();
      setCart(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      await addToCartApi(productId, quantity);
      await fetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      await updateCartQuantityApi(productId, quantity);
      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  const removeItem = async (productId: string) => {
    try {
      await removeFromCartApi(productId);
      await fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
      throw error;
    }
  };

  const cartTotal = cart.reduce((total, item) => {
    if (item.product) {
      return total + (item.product.price * item.quantity);
    }
    return total;
  }, 0);

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Vérifier si un produit est déjà dans le panier
  const isInCart = (productId: string) => {
    return cart.some(item => item.product_id === productId);
  };

  // Obtenir la quantité d'un produit dans le panier
  const getCartItemQuantity = (productId: string) => {
    const item = cart.find(item => item.product_id === productId);
    return item ? item.quantity : 0;
  };

  return {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeItem,
    cartTotal,
    cartCount,
    refetch: fetchCart,
    isInCart,
    getCartItemQuantity
  };
};