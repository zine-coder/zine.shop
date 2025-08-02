-- Add payment method validation to create_order_from_cart function
CREATE OR REPLACE FUNCTION create_order_from_cart(
  p_user_id uuid,
  p_shipping_address jsonb,
  p_billing_address jsonb DEFAULT NULL,
  p_payment_method text DEFAULT 'cash_on_delivery'
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
  -- Validate payment method (only allow cash_on_delivery)
  IF p_payment_method != 'cash_on_delivery' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Méthode de paiement non autorisée');
  END IF;

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

-- Add a comment to explain the function
COMMENT ON FUNCTION create_order_from_cart(uuid, jsonb, jsonb, text) IS 'Creates an order from the user''s cart with validation for payment method';