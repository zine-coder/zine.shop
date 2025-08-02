import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  title?: string;
  comment?: string;
  is_verified: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  user_email: string; // Obligatoire pour correspondre à l'interface dans ReviewSection
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  compare_price?: number;
  sku?: string;
  stock_quantity: number;
  category_id?: string;
  images: string[];
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  avg_rating?: number;
  review_count?: number;
  reviews?: Review[];
  related_products?: Partial<Product>[];
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  shipping_address: any;
  billing_address?: any;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  tracking_number?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_snapshot: any;
  created_at: string;
}

// Auth helpers
export const isAdmin = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.user_metadata?.role === 'admin';
};

// Product functions
export const getProducts = async (params?: {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: string;
  limit?: number;
  offset?: number;
}) => {
  const { data, error } = await supabase.rpc('search_products', {
    search_query: params?.search || '',
    category_filter: params?.category || null,
    min_price: params?.minPrice || null,
    max_price: params?.maxPrice || null,
    sort_by: params?.sortBy || 'created_at',
    sort_order: params?.sortOrder || 'desc',
    page_limit: params?.limit || 20,
    page_offset: params?.offset || 0,
  });

  if (error) throw error;
  return data as Product[];
};

export const getProduct = async (slug: string) => {
  // Première approche: utiliser la fonction RPC get_product_details si disponible
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('id')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    
    const { data, error: rpcError } = await supabase
      .rpc('get_product_details', { p_product_id: product.id });
    
    if (!rpcError && data) {
      // Transformer la réponse JSON en objet Product
      // Récupérer les emails des utilisateurs pour les reviews
      const { data: usersData } = await supabase
        .from('users')
        .select('id, email')
        .in('id', (data.reviews || []).map((review: { user_id: string; }) => review.user_id) || []);
      
      const userMap = usersData?.reduce<Record<string, string>>((acc, user) => {
        acc[user.id] = user.email;
        return acc;
      }, {}) || {};
      
      const reviewsWithUserEmail = (data.reviews || []).map((review: { user_id: string }) => ({
        ...review,
        user_email: userMap[review.user_id] || 'Anonyme'
      }));
      
      return {
        ...data.product,
        category: data.category,
        reviews: reviewsWithUserEmail,
        avg_rating: data.avg_rating || 0,
        review_count: data.review_count || 0
      } as Product;
    }
  } catch (e) {
    console.log('Fallback to direct query:', e);
  }
  
  // Fallback: requête directe si la fonction RPC échoue
  // Récupérer d'abord le produit sans les avis pour éviter les erreurs si aucun avis n'existe
  const { data: productData, error: productError } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  
  if (productError) throw productError;
  
  // Récupérer les avis approuvés séparément
  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productData.id)
    .eq('is_approved', true);
  
  // Récupérer les emails des utilisateurs pour les avis
  const { data: usersData } = await supabase
    .from('users')
    .select('id, email')
    .in('id', (reviewsData || []).map(review => review.user_id) || []);
  
  const userMap = usersData?.reduce((acc: Record<string, string>, user) => {
    acc[user.id] = user.email;
    return acc;
  }, {}) || {};
  
  // Ajouter les emails aux avis
  const reviewsWithUserEmail = (reviewsData || []).map(review => ({
    ...review,
    user_email: userMap[review.user_id] || 'Anonyme'
  }));
  
  // Calculer la note moyenne et le nombre d'avis
  const avgRating = reviewsWithUserEmail.length > 0
    ? reviewsWithUserEmail.reduce((sum, review) => sum + review.rating, 0) / reviewsWithUserEmail.length
    : 0;
  
  return {
    ...productData,
    reviews: reviewsWithUserEmail,
    avg_rating: avgRating,
    review_count: reviewsWithUserEmail.length
  } as Product;


};

export const getFeaturedProducts = async () => {
  // Récupérer les produits vedettes avec leurs notes moyennes et nombre d'avis
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories(name),
      reviews(id, rating, is_approved)
    `)
    .eq('is_featured', true)
    .eq('is_active', true)
    .limit(8);

  if (error) throw error;
  
  // Transformer les données pour inclure avg_rating et review_count
  const productsWithRatings = data.map(product => {
    // Filtrer les avis approuvés
    const approvedReviews = (product.reviews as any[]).filter(review => review.is_approved);
    
    // Calculer la note moyenne
    const avgRating = approvedReviews.length > 0
      ? approvedReviews.reduce((sum, review) => sum + review.rating, 0) / approvedReviews.length
      : 0;
    
    // Compter le nombre d'avis
    const reviewCount = approvedReviews.length;
    
    // Retourner le produit avec les informations de notation
    return {
      ...product,
      category_name: product.categories?.name,
      avg_rating: avgRating,
      review_count: reviewCount,
      // Supprimer les données brutes des avis pour alléger l'objet
      reviews: undefined
    };
  });

  return productsWithRatings as Product[];
};

// Cart functions
export const addToCart = async (productId: string, quantity: number = 1) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase.rpc('add_to_cart', {
    p_user_id: user.id,
    p_product_id: productId,
    p_quantity: quantity,
  });

  if (error) throw error;
  return data;
};

export const getCart = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      product:products(*)
    `)
    .eq('user_id', user.id);

  if (error) throw error;
  return data as CartItem[];
};

export const updateCartQuantity = async (productId: string, quantity: number) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase.rpc('update_cart_quantity', {
    p_user_id: user.id,
    p_product_id: productId,
    p_quantity: quantity,
  });

  if (error) throw error;
  return data;
};

export const removeFromCart = async (productId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase.rpc('remove_from_cart', {
    p_user_id: user.id,
    p_product_id: productId,
  });

  if (error) throw error;
  return data;
};

// Order functions
export const createOrder = async (shippingAddress: any, billingAddress?: any, paymentMethod: string = 'cash_on_delivery') => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase.rpc('create_order_from_cart', {
    p_user_id: user.id,
    p_shipping_address: shippingAddress,
    p_billing_address: billingAddress,
    p_payment_method: paymentMethod
  });

  if (error) throw error;
  return data;
};

export const getUserOrders = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items:order_items(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Order[];
};

// Categories
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data as Category[];
};