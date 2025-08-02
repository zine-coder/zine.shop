import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, Heart, ChevronDown, LogOut, X, Home, ShoppingBag, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

const Header = () => {
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [expandedSearch, setExpandedSearch] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchHistoryRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Fermer les menus déroulants lorsqu'on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (searchHistoryRef.current && !searchHistoryRef.current.contains(event.target as Node) && 
          searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSearchHistory(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && 
          mobileMenuOpen && (event.target as HTMLElement).closest('[data-mobile-menu-toggle]') === null) {
        setMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);
  
  // Empêcher le défilement du body quand le menu mobile est ouvert
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);
  
  // Charger l'historique de recherche depuis localStorage
  useEffect(() => {
    const storedHistory = localStorage.getItem('searchHistory');
    if (storedHistory) {
      setSearchHistory(JSON.parse(storedHistory));
    }
  }, []);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-2 text-sm text-gray-600 border-b">
          <div className="flex items-center space-x-4">
            {/* Contenu supprimé */}
          </div>
        </div>

        {/* Main header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-black">
            zine.shop
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/shop" className="text-gray-700 hover:text-black transition-colors">
              Boutique
            </Link>
          </nav>

          {/* Search bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchHistory.length > 0 && setShowSearchHistory(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    e.preventDefault();
                    // Ajouter à l'historique si pas déjà présent
                    if (!searchHistory.includes(searchQuery)) {
                      const newHistory = [searchQuery, ...searchHistory.slice(0, 9)];
                      setSearchHistory(newHistory);
                      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
                    }
                    navigate(`/search?search=${encodeURIComponent(searchQuery)}`);
                    setShowSearchHistory(false);
                  }
                }}
                placeholder="Rechercher des produits..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              
              {/* Search History Dropdown */}
              {showSearchHistory && searchHistory.length > 0 && (
                <div 
                  ref={searchHistoryRef}
                  className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-dropdown-appear"
                >
                  <div className="flex justify-between items-center px-4 py-1 border-b border-gray-100">
                    <h3 className="text-xs font-medium text-gray-700">Recherches récentes</h3>
                    <button 
                      onClick={() => {
                        setSearchHistory([]);
                        localStorage.removeItem('searchHistory');
                        setShowSearchHistory(false);
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Effacer
                    </button>
                  </div>
                  <ul>
                    {searchHistory.map((query, index) => (
                      <li key={index}>
                        <button
                          onClick={() => {
                            setSearchQuery(query);
                            navigate(`/search?search=${encodeURIComponent(query)}`);
                            setShowSearchHistory(false);
                          }}
                          className="w-full text-left px-4 py-1 hover:bg-gray-100 flex items-center text-sm"
                        >
                          <Search className="w-3 h-3 mr-2 text-gray-400" />
                          <span className="text-gray-700">{query}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Mobile search - Only visible on mobile */}
            <div className="md:hidden relative">
              {expandedSearch ? (
                <div className="fixed inset-0 bg-black bg-opacity-30 z-40 flex items-start justify-center pt-16 px-4 animate-toast-enter">
                  <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden animate-dropdown-appear">
                    <div className="flex items-center border-b border-gray-100">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && searchQuery.trim()) {
                            navigate(`/search?search=${encodeURIComponent(searchQuery)}`);
                            setExpandedSearch(false);
                          }
                        }}
                        placeholder="Rechercher des produits..."
                        className="w-full pl-4 pr-4 py-4 focus:outline-none text-base"
                        autoFocus
                        inputMode="search"
                      />
                      <div className="flex items-center pr-2">
                        {searchQuery && (
                          <button 
                            onClick={() => setSearchQuery('')}
                            className="p-2 text-gray-400 hover:text-gray-600"
                            aria-label="Effacer la recherche"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            if (searchQuery.trim()) {
                              navigate(`/search?search=${encodeURIComponent(searchQuery)}`);
                            }
                            setExpandedSearch(false);
                          }}
                          className="p-2 bg-black text-white rounded-lg ml-1"
                          aria-label="Rechercher"
                        >
                          <Search className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Search History in Mobile Search */}
                    {searchHistory.length > 0 && (
                      <div className="max-h-60 overflow-y-auto">
                        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100">
                          <h3 className="text-xs font-medium text-gray-700">Recherches récentes</h3>
                          <button 
                            onClick={() => {
                              setSearchHistory([]);
                              localStorage.removeItem('searchHistory');
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Effacer
                          </button>
                        </div>
                        <ul>
                          {searchHistory.map((query, index) => (
                            <li key={index}>
                              <button
                                onClick={() => {
                                  setSearchQuery(query);
                                  navigate(`/search?search=${encodeURIComponent(query)}`);
                                  setExpandedSearch(false);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center text-sm border-b border-gray-50"
                              >
                                <Search className="w-4 h-4 mr-3 text-gray-400" />
                                <span className="text-gray-700">{query}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setExpandedSearch(true)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Rechercher"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {/* Wishlist icon - Hidden on mobile */}
            {user && (
              <Link to="/wishlist" className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden md:block">
                <Heart className="w-5 h-5" />
              </Link>
            )}

            {/* Cart icon - Hidden on mobile */}
            <Link 
              to="/cart" 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative cart-icon hidden md:block"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-count-change">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User profile - Hidden on mobile */}
            {user ? (
              <div className="relative hidden md:block" ref={dropdownRef}>
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-1 p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-expanded={profileDropdownOpen}
                  aria-haspopup="true"
                >
                  <User className="w-5 h-5" />
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {/* Dropdown menu */}
                {profileDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200 transform origin-top-right transition-transform duration-200 ease-in-out"
                    style={{ animation: 'dropdown-appear 0.2s ease-out forwards' }}
                  >
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Mon Profil
                    </Link>
                    <button 
                      onClick={() => {
                        signOut();
                        setProfileDropdownOpen(false);
                      }} 
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden md:block">
                <User className="w-5 h-5" />
              </Link>
            )}

            <button 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              data-mobile-menu-toggle
              aria-expanded={mobileMenuOpen}
              aria-label="Menu principal"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ease-in-out">
                {/* Mobile Menu */}
                <div 
                  ref={mobileMenuRef}
                  className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out animate-slide-in-right"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b">
                      <h2 className="text-lg font-semibold">Menu</h2>
                      <button 
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Fermer le menu"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {/* Mobile Search */}
                    <div className="p-4 border-b">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && searchQuery.trim()) {
                              navigate(`/search?search=${encodeURIComponent(searchQuery)}`);
                              setMobileMenuOpen(false);
                            }
                          }}
                          placeholder="Rechercher des produits..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    {/* Navigation Links */}
                    <nav className="flex-1 overflow-y-auto p-4">
                      <ul className="space-y-2">
                        <li>
                          <Link 
                            to="/" 
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Home className="w-5 h-5 text-gray-600" />
                            <span>Accueil</span>
                          </Link>
                        </li>
                        <li>
                          <Link 
                            to="/shop" 
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <ShoppingBag className="w-5 h-5 text-gray-600" />
                            <span>Boutique</span>
                          </Link>
                        </li>
                        <li>
                          <Link 
                            to="/cart" 
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <ShoppingCart className="w-5 h-5 text-gray-600" />
                            <span>Panier</span>
                            {cartCount > 0 && (
                              <span className="ml-auto bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {cartCount}
                              </span>
                            )}
                          </Link>
                        </li>
                        {user && (
                          <li>
                            <Link 
                              to="/wishlist" 
                              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Heart className="w-5 h-5 text-gray-600" />
                              <span>Liste de souhaits</span>
                            </Link>
                          </li>
                        )}
                      </ul>
                      
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 mb-3 px-3">Compte</h3>
                        <ul className="space-y-2">
                          {user ? (
                            <>
                              <li>
                                <Link 
                                  to="/profile" 
                                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  <User className="w-5 h-5 text-gray-600" />
                                  <span>Mon Profil</span>
                                  <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                                </Link>
                              </li>
                              <li>
                                <button 
                                  onClick={() => {
                                    signOut();
                                    setMobileMenuOpen(false);
                                  }} 
                                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                                >
                                  <LogOut className="w-5 h-5 text-gray-600" />
                                  <span>Déconnexion</span>
                                </button>
                              </li>
                            </>
                          ) : (
                            <li>
                              <Link 
                                to="/login" 
                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <User className="w-5 h-5 text-gray-600" />
                                <span>Connexion / Inscription</span>
                                <ChevronRight className="w-4 h-4 ml-auto text-gray-400" />
                              </Link>
                            </li>
                          )}
                        </ul>
                      </div>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;