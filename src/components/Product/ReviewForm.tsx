import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onReviewSubmitted }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [title, setTitle] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Vous devez être connecté pour laisser un avis');
      return;
    }

    if (rating < 1) {
      setError('Veuillez sélectionner une note');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // Vérifier si l'utilisateur a déjà laissé un avis pour ce produit
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (existingReview) {
        // Mettre à jour l'avis existant
        const { error: updateError } = await supabase
          .from('reviews')
          .update({
            rating,
            title,
            comment,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingReview.id);

        if (updateError) throw updateError;
      } else {
        // Créer un nouvel avis
        const { error: insertError } = await supabase
          .from('reviews')
          .insert({
            user_id: user.id,
            product_id: productId,
            rating,
            title,
            comment,
            is_verified: false, // À définir par l'administrateur
            is_approved: true, // Auto-approuvé ou à modifier selon les besoins
          });

        if (insertError) throw insertError;
      }

      setSuccess(true);
      setRating(5);
      setTitle('');
      setComment('');
      onReviewSubmitted();

      // Réinitialiser le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la soumission de votre avis');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => setRating(i + 1)}
        className="focus:outline-none"
      >
        <Star
          className={`w-6 h-6 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      </button>
    ));
  };

  if (!user) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Connectez-vous pour laisser un avis
        </h3>
        <p className="text-gray-500">
          Vous devez être connecté pour partager votre expérience avec ce produit.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Partagez votre avis
      </h3>

      {success && (
        <div className="bg-green-50 text-green-800 p-4 rounded-md mb-4">
          Votre avis a été soumis avec succès. Merci pour votre contribution !
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Votre note
          </label>
          <div className="flex space-x-1">{renderStars()}</div>
        </div>

        <div>
          <label htmlFor="review-title" className="block text-sm font-medium text-gray-700 mb-1">
            Titre de votre avis
          </label>
          <input
            type="text"
            id="review-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="Résumez votre expérience en quelques mots"
          />
        </div>

        <div>
          <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-1">
            Votre commentaire
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="Partagez votre expérience avec ce produit"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-black text-white py-2 px-4 rounded-md font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Envoi en cours...' : 'Soumettre mon avis'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;