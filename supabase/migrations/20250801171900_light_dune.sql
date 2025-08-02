/*
# Sample Data for E-commerce

Insert sample categories and products for testing and demonstration
*/

-- Insert sample categories
INSERT INTO categories (name, slug, description, image_url) VALUES
('T-Shirts', 't-shirts', 'T-shirts et hauts casual', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'),
('Pants', 'pants', 'Pantalons et jeans', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'),
('Shirts', 'shirts', 'Chemises et tops formels', 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400'),
('Accessories', 'accessories', 'Accessoires de mode', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, slug, description, short_description, price, compare_price, sku, stock_quantity, category_id, images, tags, is_featured) 
SELECT 
  'One Life Graphic T-Shirt',
  'one-life-graphic-t-shirt',
  'T-shirt graphique avec message inspirant "One Life". Fabriqué en coton 100% biologique pour un confort optimal. Coupe moderne et décontractée.',
  'T-shirt graphique en coton bio avec message inspirant',
  24.99,
  34.99,
  'TSHIRT-001',
  50,
  c.id,
  '["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500", "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=500"]'::jsonb,
  ARRAY['t-shirt', 'graphic', 'casual', 'cotton'],
  true
FROM categories c WHERE c.slug = 't-shirts'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, short_description, price, compare_price, sku, stock_quantity, category_id, images, tags, is_featured)
SELECT 
  'Navy Classic Polo',
  'navy-classic-polo',
  'Polo classique en marine, parfait pour un look décontracté-chic. Matière piquée de qualité supérieure avec col et poignets côtelés.',
  'Polo classique en marine, coupe régulière',
  39.99,
  49.99,
  'POLO-001',
  30,
  c.id,
  '["https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500", "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500"]'::jsonb,
  ARRAY['polo', 'navy', 'classic', 'casual'],
  true
FROM categories c WHERE c.slug = 't-shirts'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, short_description, price, compare_price, sku, stock_quantity, category_id, images, tags, is_featured)
SELECT 
  'Slim Fit Jeans',
  'slim-fit-jeans',
  'Jean slim fit en denim stretch pour un confort optimal. Lavage moderne avec finitions soignées. Parfait pour un look quotidien.',
  'Jean slim fit en denim stretch',
  69.99,
  89.99,
  'JEANS-001',
  25,
  c.id,
  '["https://images.unsplash.com/photo-1542272604-787c3835535d?w=500", "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=500"]'::jsonb,
  ARRAY['jeans', 'slim', 'denim', 'casual'],
  true
FROM categories c WHERE c.slug = 'pants'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, short_description, price, compare_price, sku, stock_quantity, category_id, images, tags, is_featured)
SELECT 
  'Checkered Flannel Shirt',
  'checkered-flannel-shirt',
  'Chemise en flanelle à carreaux, parfaite pour les saisons fraîches. Coupe décontractée avec boutons en bois naturel.',
  'Chemise flanelle à carreaux',
  54.99,
  74.99,
  'SHIRT-001',
  20,
  c.id,
  '["https://images.unsplash.com/photo-1603252109303-2751441dd157?w=500", "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500"]'::jsonb,
  ARRAY['shirt', 'flannel', 'checkered', 'casual'],
  false
FROM categories c WHERE c.slug = 'shirts'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, short_description, price, compare_price, sku, stock_quantity, category_id, images, tags, is_featured)
SELECT 
  'Orange Athletic Tee',
  'orange-athletic-tee',
  'T-shirt technique orange pour le sport. Tissu respirant et évacuation de la transpiration. Coupe athlétique.',
  'T-shirt technique orange pour le sport',
  29.99,
  39.99,
  'ATHLETIC-001',
  40,
  c.id,
  '["https://images.unsplash.com/photo-1583743814966-8936f37f4036?w=500", "https://images.unsplash.com/photo-1520694478166-dabd1f56ab56?w=500"]'::jsonb,
  ARRAY['athletic', 'sport', 'orange', 'technical'],
  false
FROM categories c WHERE c.slug = 't-shirts'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, short_description, price, compare_price, sku, stock_quantity, category_id, images, tags, is_featured)
SELECT 
  'Casual Chinos',
  'casual-chinos',
  'Pantalon chino casual en coton premium. Coupe moderne et confortable pour toutes les occasions.',
  'Pantalon chino casual en coton',
  59.99,
  79.99,
  'CHINOS-001',
  35,
  c.id,
  '["https://images.unsplash.com/photo-1624378515195-6bbdb73dff1a?w=500", "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500"]'::jsonb,
  ARRAY['chinos', 'casual', 'cotton', 'pants'],
  false
FROM categories c WHERE c.slug = 'pants'
ON CONFLICT (slug) DO NOTHING;

-- Insert sample reviews only if users exist
-- This will only insert reviews if there are actual users in the auth.users table
INSERT INTO reviews (user_id, product_id, rating, title, comment, is_approved)
SELECT 
  u.id,
  p.id,
  5,
  'Excellent produit !',
  'Très satisfait de cet achat. La qualité est au rendez-vous et la coupe parfaite.',
  true
FROM products p 
CROSS JOIN (SELECT id FROM auth.users LIMIT 1) u
WHERE p.slug = 'one-life-graphic-t-shirt'
AND EXISTS (SELECT 1 FROM auth.users)
ON CONFLICT (user_id, product_id) DO NOTHING;

INSERT INTO reviews (user_id, product_id, rating, title, comment, is_approved)
SELECT 
  u.id,
  p.id,
  4,
  'Bon rapport qualité-prix',
  'Jean confortable et bien taillé. Je recommande.',
  true
FROM products p 
CROSS JOIN (SELECT id FROM auth.users LIMIT 1) u
WHERE p.slug = 'slim-fit-jeans'
AND EXISTS (SELECT 1 FROM auth.users)
ON CONFLICT (user_id, product_id) DO NOTHING;

-- Optional: Create a test user if you want to guarantee reviews are inserted
-- Uncomment the following lines if you want to create a test user
/*
-- Insert a test user (only if using direct user creation - not recommended for production)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Then insert reviews with the test user
INSERT INTO reviews (user_id, product_id, rating, title, comment, is_approved)
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid,
  p.id,
  5,
  'Excellent produit !',
  'Très satisfait de cet achat. La qualité est au rendez-vous et la coupe parfaite.',
  true
FROM products p WHERE p.slug = 'one-life-graphic-t-shirt'
ON CONFLICT (user_id, product_id) DO NOTHING;

INSERT INTO reviews (user_id, product_id, rating, title, comment, is_approved)
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid,
  p.id,
  4,
  'Bon rapport qualité-prix',
  'Jean confortable et bien taillé. Je recommande.',
  true
FROM products p WHERE p.slug = 'slim-fit-jeans'
ON CONFLICT (user_id, product_id) DO NOTHING;
*/