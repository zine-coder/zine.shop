/*
# Database Functions

1. Cart Management
   - add_to_cart: Add or update item in cart
   - remove_from_cart: Remove item from cart
   - clear_cart: Clear user's cart
   - get_cart_total: Calculate cart total

2. Order Management
   - create_order_from_cart: Convert cart to order
   - update_order_status: Update order status
   - cancel_order: Cancel an order

3. Product Management
   - update_product_stock: Update stock quantity
   - get_product_reviews_summary: Get review statistics

4. Search & Filtering
   - search_products: Full-text search on products
*/

-- Add item to cart (upsert)
CREATE OR REPLACE FUNCTION add_to_cart(
  p_user_id uuid,
  p_product_id uuid,
  p_quantity integer
)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  product_stock integer;
BEGIN
  -- Check if product exists and has sufficient stock
  SELECT stock_quantity INTO product_stock
  FROM products
  WHERE id = p_product_id AND is_active = true;
  
  IF product_stock IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Produit non trouvé');
  END IF;
  
  IF product_stock < p_quantity THEN
    RETURN jsonb_build_object('success', false, 'message', 'Stock insuffisant');
  END IF;
  
  -- Upsert cart item
  INSERT INTO cart_items (user_id, product_id, quantity)
  VALUES (p_user_id, p_product_id, p_quantity)
  ON CONFLICT (user_id, product_id)
  DO UPDATE SET 
    quantity = CASE 
      WHEN cart_items.quantity + p_quantity <= product_stock 
      THEN cart_items.quantity + p_quantity
      ELSE cart_items.quantity
    END,
    updated_at = NOW();
  
  RETURN jsonb_build_object('success', true, 'message', 'Produit ajouté au panier');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove item from cart
CREATE OR REPLACE FUNCTION remove_from_cart(
  p_user_id uuid,
  p_product_id uuid
)
RETURNS jsonb AS $$
BEGIN
  DELETE FROM cart_items
  WHERE user_id = p_user_id AND product_id = p_product_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'Produit supprimé du panier');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update cart item quantity
CREATE OR REPLACE FUNCTION update_cart_quantity(
  p_user_id uuid,
  p_product_id uuid,
  p_quantity integer
)
RETURNS jsonb AS $$
DECLARE
  product_stock integer;
BEGIN
  -- Check stock
  SELECT stock_quantity INTO product_stock
  FROM products
  WHERE id = p_product_id AND is_active = true;
  
  IF product_stock < p_quantity THEN
    RETURN jsonb_build_object('success', false, 'message', 'Stock insuffisant');
  END IF;
  
  IF p_quantity <= 0 THEN
    DELETE FROM cart_items
    WHERE user_id = p_user_id AND product_id = p_product_id;
  ELSE
    UPDATE cart_items
    SET quantity = p_quantity, updated_at = NOW()
    WHERE user_id = p_user_id AND product_id = p_product_id;
  END IF;
  
  RETURN jsonb_build_object('success', true, 'message', 'Quantité mise à jour');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clear cart
CREATE OR REPLACE FUNCTION clear_cart(p_user_id uuid)
RETURNS jsonb AS $$
BEGIN
  DELETE FROM cart_items WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'Panier vidé');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get cart total
CREATE OR REPLACE FUNCTION get_cart_total(p_user_id uuid)
RETURNS decimal AS $$
DECLARE
  total decimal;
BEGIN
  SELECT COALESCE(SUM(ci.quantity * p.price), 0)
  INTO total
  FROM cart_items ci
  JOIN products p ON p.id = ci.product_id
  WHERE ci.user_id = p_user_id AND p.is_active = true;
  
  RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create order from cart
CREATE OR REPLACE FUNCTION create_order_from_cart(
  p_user_id uuid,
  p_shipping_address jsonb,
  p_billing_address jsonb DEFAULT NULL,
  p_payment_method text DEFAULT 'card'
)
RETURNS jsonb AS $$
DECLARE
  order_id uuid;
  order_num text;
  subtotal decimal;
  shipping_cost decimal := 9.99;
  tax_rate decimal := 0.20;
  tax_amount decimal;
  total decimal;
  cart_item RECORD;
BEGIN
  -- Check if cart is not empty
  IF NOT EXISTS (SELECT 1 FROM cart_items WHERE user_id = p_user_id) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Panier vide');
  END IF;
  
  -- Calculate totals
  SELECT get_cart_total(p_user_id) INTO subtotal;
  tax_amount := subtotal * tax_rate;
  total := subtotal + shipping_cost + tax_amount;
  
  -- Generate order number
  SELECT generate_order_number() INTO order_num;
  
  -- Create order
  INSERT INTO orders (
    order_number, user_id, subtotal, tax_amount, 
    shipping_amount, total_amount, shipping_address, 
    billing_address, payment_method
  )
  VALUES (
    order_num, p_user_id, subtotal, tax_amount,
    shipping_cost, total, p_shipping_address,
    COALESCE(p_billing_address, p_shipping_address), p_payment_method
  )
  RETURNING id INTO order_id;
  
  -- Create order items from cart
  FOR cart_item IN 
    SELECT ci.product_id, ci.quantity, p.price, p.name, p.images
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = p_user_id AND p.is_active = true
  LOOP
    INSERT INTO order_items (
      order_id, product_id, quantity, unit_price, total_price, product_snapshot
    )
    VALUES (
      order_id, cart_item.product_id, cart_item.quantity,
      cart_item.price, cart_item.quantity * cart_item.price,
      jsonb_build_object(
        'name', cart_item.name,
        'price', cart_item.price,
        'images', cart_item.images
      )
    );
    
    -- Update product stock
    UPDATE products 
    SET stock_quantity = stock_quantity - cart_item.quantity
    WHERE id = cart_item.product_id;
  END LOOP;
  
  -- Clear cart
  DELETE FROM cart_items WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Commande créée avec succès',
    'order_id', order_id,
    'order_number', order_num
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update order status
CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id uuid,
  p_status text,
  p_tracking_number text DEFAULT NULL
)
RETURNS jsonb AS $$
BEGIN
  UPDATE orders
  SET 
    status = p_status,
    tracking_number = COALESCE(p_tracking_number, tracking_number),
    updated_at = NOW()
  WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Commande non trouvée');
  END IF;
  
  RETURN jsonb_build_object('success', true, 'message', 'Statut mis à jour');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search products with full-text search
CREATE OR REPLACE FUNCTION search_products(
  search_query text DEFAULT '',
  category_filter uuid DEFAULT NULL,
  min_price decimal DEFAULT NULL,
  max_price decimal DEFAULT NULL,
  sort_by text DEFAULT 'created_at',
  sort_order text DEFAULT 'desc',
  page_limit integer DEFAULT 20,
  page_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  short_description text,
  price decimal,
  compare_price decimal,
  images jsonb,
  stock_quantity integer,
  is_featured boolean,
  category_name text,
  avg_rating decimal,
  review_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.slug,
    p.short_description,
    p.price,
    p.compare_price,
    p.images,
    p.stock_quantity,
    p.is_featured,
    c.name as category_name,
    COALESCE(AVG(r.rating), 0) as avg_rating,
    COUNT(r.id) as review_count
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN reviews r ON r.product_id = p.id AND r.is_approved = true
  WHERE 
    p.is_active = true
    AND (search_query = '' OR p.name ILIKE '%' || search_query || '%' OR p.description ILIKE '%' || search_query || '%')
    AND (category_filter IS NULL OR p.category_id = category_filter)
    AND (min_price IS NULL OR p.price >= min_price)
    AND (max_price IS NULL OR p.price <= max_price)
  GROUP BY p.id, c.name
  ORDER BY 
    CASE WHEN sort_by = 'price' AND sort_order = 'asc' THEN p.price END ASC,
    CASE WHEN sort_by = 'price' AND sort_order = 'desc' THEN p.price END DESC,
    CASE WHEN sort_by = 'name' AND sort_order = 'asc' THEN p.name END ASC,
    CASE WHEN sort_by = 'name' AND sort_order = 'desc' THEN p.name END DESC,
    CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN p.created_at END DESC,
    CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN p.created_at END ASC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get product with reviews and related products
CREATE OR REPLACE FUNCTION get_product_details(p_product_id uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'product', to_jsonb(p.*),
    'category', to_jsonb(c.*),
    'reviews', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', r.id,
          'rating', r.rating,
          'title', r.title,
          'comment', r.comment,
          'created_at', r.created_at,
          'user_email', COALESCE(u.email, 'Anonyme'),
          'is_verified', r.is_verified
        )
      )
      FROM reviews r
      LEFT JOIN auth.users u ON u.id = r.user_id
      WHERE r.product_id = p.id AND r.is_approved = true
      ORDER BY r.created_at DESC
      LIMIT 10
    ),
    'related_products', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', rp.id,
          'name', rp.name,
          'slug', rp.slug,
          'price', rp.price,
          'images', rp.images
        )
      )
      FROM products rp
      WHERE rp.category_id = p.category_id 
        AND rp.id != p.id 
        AND rp.is_active = true
      ORDER BY rp.created_at DESC
      LIMIT 4
    ),
    'avg_rating', (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE product_id = p.id AND is_approved = true
    ),
    'review_count', (
      SELECT COUNT(*)
      FROM reviews
      WHERE product_id = p.id AND is_approved = true
    )
  )
  INTO result
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
  WHERE p.id = p_product_id AND p.is_active = true;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;