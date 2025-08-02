/*
# Row Level Security Policies

1. Categories & Products
   - Public read access for active items
   - Admin write access

2. Cart Items
   - Users can only access their own cart
   - Admin can view all carts

3. Orders & Order Items
   - Users can only access their own orders
   - Admin can access all orders

4. Reviews & Wishlist
   - Users can manage their own data
   - Public read access for approved reviews
*/

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Categories policies
CREATE POLICY "Public can view active categories"
  ON categories FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admin can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (is_admin());

-- Products policies
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admin can manage products"
  ON products FOR ALL
  TO authenticated
  USING (is_admin());

-- Cart items policies
CREATE POLICY "Users can manage their own cart"
  ON cart_items FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all carts"
  ON cart_items FOR SELECT
  TO authenticated
  USING (is_admin());

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage all orders"
  ON orders FOR ALL
  TO authenticated
  USING (is_admin());

-- Order items policies
CREATE POLICY "Users can view their own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for their orders"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can manage all order items"
  ON order_items FOR ALL
  TO authenticated
  USING (is_admin());

-- Reviews policies
CREATE POLICY "Public can view approved reviews"
  ON reviews FOR SELECT
  TO public
  USING (is_approved = true);

CREATE POLICY "Users can manage their own reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage all reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (is_admin());

-- Wishlist policies
CREATE POLICY "Users can manage their own wishlist"
  ON wishlist FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all wishlists"
  ON wishlist FOR SELECT
  TO authenticated
  USING (is_admin());