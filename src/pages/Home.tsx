import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import ProductCard from '../components/Product/ProductCard';
import { Product, getFeaturedProducts, getCategories, Category } from '../lib/supabase';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [topRatedProducts, setTopRatedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const products = await getFeaturedProducts();
        setFeaturedProducts(products);
        
        // Trier les produits par note moyenne pour obtenir les mieux notés
        const sortedByRating = [...products].sort((a, b) => {
          const ratingA = a.avg_rating || 0;
          const ratingB = b.avg_rating || 0;
          return ratingB - ratingA;
        });
        
        setTopRatedProducts(sortedByRating.slice(0, 4));
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchFeaturedProducts();
    fetchCategories();
  }, []);

  const brands = ['VERSACE', 'ZARA', 'GUCCI', 'PRADA', 'Calvin Klein'];

  const stats = [
    { value: '200+', label: 'Marques internationales' },
    { value: '2,000+', label: 'Produits de haute qualité' },
    { value: '30,000+', label: 'Clients satisfaits' }
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      rating: 5,
      comment: 'Je suis obsédée par leurs t-shirts ! La coupe et la qualité sont phénoménales.',
      verified: true
    },
    {
      name: 'Alex K.',
      rating: 5,
      comment: 'La meilleure boutique en ligne que j\'ai trouvée. Vraiment excellent !',
      verified: true
    },
    {
      name: 'James L.',
      rating: 5,
      comment: 'Service client incroyable et produits de très haute qualité. Highly recommended!',
      verified: true
    }
  ];

  // Les catégories sont maintenant chargées dynamiquement depuis Supabase

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                TROUVEZ DES VÊTEMENTS QUI CORRESPONDENT À
                <span className="block">VOTRE STYLE</span>
              </h1>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Parcourez notre collection diversifiée de vêtements méticuleusement confectionnés, 
                conçus pour mettre en valeur votre individualité et répondre à votre sens du style.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors group"
              >
                Acheter maintenant
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-8 mt-12">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src="src\assets\home.png"
                  alt="Hero"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute top-8 right-8 w-16 h-16 bg-black rounded-full opacity-10"></div>
              <div className="absolute bottom-8 left-8 w-12 h-12 bg-black rounded-full opacity-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="bg-black py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
            {brands.map((brand, index) => (
              <div key={index} className="text-white text-lg lg:text-xl font-bold">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
            NOUVEAUTÉS
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link
              to="/shop"
              className="inline-flex items-center border border-gray-300 px-8 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors"
            >
              Voir tout
            </Link>
          </div>
        </div>
      </section>

      {/* Top Selling */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
            MEILLEURES VENTES
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {topRatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link
              to="/shop"
              className="inline-flex items-center border border-gray-300 px-8 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors"
            >
              Voir tout
            </Link>
          </div>
        </div>
      </section>

      {/* Browse by Style */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
            PARCOURIR PAR STYLE VESTIMENTAIRE
          </h2>
          
          {categoriesLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="animate-pulse relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
                  <div className="absolute bottom-4 left-4 h-6 w-24 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/shop?category=${category.slug}`}
                  className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group"
                >
                  <img
                    src={category.image_url || 'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg'}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-white font-semibold text-lg">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
            NOS CLIENTS SATISFAITS
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "{testimonial.comment}"
                </p>
                <div className="flex items-center">
                  <span className="font-semibold">{testimonial.name}</span>
                  {testimonial.verified && (
                    <span className="ml-2 text-green-600 text-sm">✓ Vérifié</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;