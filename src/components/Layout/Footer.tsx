import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-2xl font-bold text-black mb-3 block">
              zine.shop
            </Link>
            <p className="text-gray-600 text-sm mb-3">
              Nous avons des vêtements qui conviennent à votre style et dont vous êtes fier de porter.
            </p>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">ENTREPRISE</h3>
            <ul className="space-y-1 text-sm">
              <li><Link to="#" className="text-gray-600 hover:text-black transition-colors">À propos</Link></li>
              <li><Link to="#" className="text-gray-600 hover:text-black transition-colors">Fonctionnalités</Link></li>
              <li><Link to="#" className="text-gray-600 hover:text-black transition-colors">Travaux</Link></li>
              <li><Link to="#" className="text-gray-600 hover:text-black transition-colors">Carrière</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">AIDE</h3>
            <ul className="space-y-1 text-sm">
              <li><Link to="#" className="text-gray-600 hover:text-black transition-colors">Support client</Link></li>
              <li><Link to="#" className="text-gray-600 hover:text-black transition-colors">Détails de livraison</Link></li>
              <li><Link to="#" className="text-gray-600 hover:text-black transition-colors">Termes & Conditions</Link></li>
              <li><Link to="#" className="text-gray-600 hover:text-black transition-colors">Politique de confidentialité</Link></li>
            </ul>
          </div>
        </div>

        {/* Contact Links & Bottom */}
        <div className="border-t mt-6 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-xs md:text-sm">
              zine.shop © 2000-2025, Tous droits réservés
            </p>
            
            {/* Social Media Icons */}
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <a 
                href="https://github.com/zine-coder" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a 
                href="https://www.linkedin.com/in/zine-coder-548659340/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a 
                href="mailto:zinecoder.dev@gmail.com" 
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;