"use client";

import { useState, useEffect } from "react";
import { Star, User, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

interface ReviewSectionProps {
  productId: string;
  onReviewAdded?: () => void;
}

export default function ReviewSection({ productId, onReviewAdded }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newReview, setNewReview] = useState({
    user_name: "",
    rating: 5,
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      setReviews(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.user_name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          ...newReview,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit review");
      
      const createdReview = await res.json();
      setReviews([createdReview, ...reviews]);
      setSubmitSuccess(true);
      setNewReview({ user_name: "", rating: 5, comment: "" });
      if (onReviewAdded) onReviewAdded();
      
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-16 border-t border-black/10 pt-16">
      <h2 className="font-serif text-2xl font-light text-black mb-8">Avis Clients</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Write a Review */}
        <div>
          <h3 className="font-sans text-sm font-semibold uppercase tracking-widest text-black/60 mb-6">
            Laisser un avis
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-black/60 uppercase tracking-wider mb-2">
                Votre Note
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${
                        star <= newReview.rating
                          ? "fill-neutral-900 text-neutral-900"
                          : "text-neutral-200"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="user_name" className="block text-xs font-semibold text-black/60 uppercase tracking-wider mb-2">
                Votre Nom
              </label>
              <input
                id="user_name"
                type="text"
                required
                value={newReview.user_name}
                onChange={(e) => setNewReview({ ...newReview, user_name: e.target.value })}
                className="w-full border border-black/10 px-4 py-3 text-sm focus:border-black focus:outline-none transition-colors"
                placeholder="Ex: Sophie L."
              />
            </div>

            <div>
              <label htmlFor="comment" className="block text-xs font-semibold text-black/60 uppercase tracking-wider mb-2">
                Votre Commentaire (Optionnel)
              </label>
              <textarea
                id="comment"
                rows={4}
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                className="w-full border border-black/10 px-4 py-3 text-sm focus:border-black focus:outline-none transition-colors resize-none"
                placeholder="Partagez votre expérience avec ce parfum..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !newReview.user_name.trim()}
              className="w-full bg-black text-white px-6 py-4 text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Envoi en cours..." : "Soumettre mon avis"}
            </button>

            {submitSuccess && (
              <p className="text-green-600 text-sm mt-2 font-medium">
                Merci ! Votre avis a été publié avec succès.
              </p>
            )}
            {error && (
              <p className="text-red-600 text-sm mt-2 font-medium">
                {error}
              </p>
            )}
          </form>
        </div>

        {/* Reviews List */}
        <div>
          <h3 className="font-sans text-sm font-semibold uppercase tracking-widest text-black/60 mb-6">
            Tous les avis ({reviews.length})
          </h3>
          
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-neutral-50 p-8 text-center text-black/40 text-sm italic">
              Soyez le premier à donner votre avis sur ce parfum.
            </div>
          ) : (
            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-black/5 pb-6 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-neutral-400" />
                      </div>
                      <span className="font-serif font-medium text-black">{review.user_name}</span>
                    </div>
                    <span className="text-[10px] text-black/40 uppercase tracking-widest">
                      {new Date(review.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                  
                  <div className="flex gap-1 mb-3 pl-10">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          star <= review.rating
                            ? "fill-neutral-900 text-neutral-900"
                            : "text-neutral-200"
                        }`}
                      />
                    ))}
                  </div>

                  {review.comment && (
                    <div className="pl-10">
                      <div className="flex gap-2 text-black/60">
                        <MessageSquare className="h-4 w-4 mt-1 flex-shrink-0 opacity-50" />
                        <p className="text-sm leading-relaxed italic">{review.comment}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d4d4d4; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a3a3a3; 
        }
      `}</style>
    </div>
  );
}
