# zine.shop - Application E-commerce

## 📋 À propos du projet

zine.shop est une application e-commerce moderne développée avec React, TypeScript et Supabase. Cette plateforme offre une expérience d'achat en ligne complète avec une interface utilisateur élégante et réactive.

## 🚀 Fonctionnalités

### 🛍️ Fonctionnalités d'achat
- Parcourir les produits par catégories
- Recherche avancée avec filtres (prix, catégorie)
- Affichage détaillé des produits avec images, descriptions et avis
- Produits similaires et recommandations

### 👤 Gestion des utilisateurs
- Authentification complète (inscription, connexion, récupération de mot de passe)
- Profils utilisateurs personnalisables
- Historique des commandes

### 🛒 Panier et commandes
- Ajout/suppression d'articles au panier
- Mise à jour des quantités
- Processus de paiement sécurisé
- Suivi des commandes

### ❤️ Liste de souhaits
- Ajout/suppression de produits favoris
- Transfert facile vers le panier

### ⭐ Avis et évaluations
- Système d'évaluation par étoiles
- Commentaires sur les produits
- Vérification des avis

## 🛠️ Technologies utilisées

### Frontend
- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **React Router** - Navigation
- **Tailwind CSS** - Styles et composants UI
- **Lucide React** - Icônes
- **Vite** - Build tool et serveur de développement

### Backend
- **Supabase** - Base de données PostgreSQL, authentification et stockage
- **RLS (Row Level Security)** - Sécurité au niveau des lignes pour la protection des données

## 📊 Structure de la base de données

- **categories** - Catégories de produits
- **products** - Produits avec prix, stock, images et descriptions
- **cart_items** - Articles dans le panier utilisateur
- **orders** - Commandes utilisateur avec statut et total
- **order_items** - Détails des articles commandés
- **reviews** - Avis clients sur les produits
- **wishlist** - Liste de souhaits utilisateur

## 🔒 Sécurité

- Authentification sécurisée via Supabase Auth
- Politiques RLS pour contrôler l'accès aux données
- Isolation des données utilisateur
- Rôles administrateur avec permissions spéciales

## 🏗️ Architecture du projet

```
src/
├── assets/         # Images et ressources statiques
├── components/     # Composants réutilisables
│   ├── Layout/     # Composants de mise en page (Header, Footer)
│   ├── Product/    # Composants liés aux produits
│   └── UI/         # Composants d'interface utilisateur génériques
├── contexts/       # Contextes React (Auth, Toast, etc.)
├── hooks/          # Hooks personnalisés (useCart, useWishlist, etc.)
├── lib/            # Bibliothèques et utilitaires
├── pages/          # Pages de l'application
│   └── Auth/       # Pages d'authentification
└── main.tsx        # Point d'entrée de l'application
```

## 🚀 Installation et démarrage

### Prérequis
- Node.js (v14 ou supérieur)
- npm ou yarn

### Installation

1. Cloner le dépôt
   ```bash
   git clone https://github.com/zine-coder/zine.shop.git
   cd zine.shop
   ```

2. Installer les dépendances
   ```bash
   npm install
   ```

3. Configurer les variables d'environnement
   - Copier `.env.example` vers `.env`
   - Remplir avec vos identifiants Supabase

4. Démarrer le serveur de développement
   ```bash
   npm run dev
   ```

5. Ouvrir [http://localhost:5173](http://localhost:5173) dans votre navigateur

## 📝 Licence

Ce projet est sous licence MIT.

---

URL: https://zine-sh.web.app/

Développé avec  zine coder.
