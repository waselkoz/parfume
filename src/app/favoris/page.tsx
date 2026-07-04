"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { translations } from "@/lib/translations";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import {
  Heart, Trash2, ArrowLeft, Star, Sparkles
} from "lucide-react";

const formatDZD = (price: number) => Math.round(price).toLocaleString("fr-FR") + " DA";

export default function FavoritesPage() {
  const {
    products,
    favorites,
    toggleFavorite,
    language,
  } = useApp();

  const t = translations[language] || translations.fr;
  const isRtl = language === "ar";

  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  const clearAllFavorites = () => {
    // Loop and toggle off all favorites
    favorites.forEach((favId) => {
      toggleFavorite(favId);
    });
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] text-neutral-900 font-sans pb-16 lg:pb-0" dir={isRtl ? "rtl" : "ltr"}>


      {/* HERO SECTION */}
      <section className="relative bg-neutral-950 text-white overflow-hidden py-16 sm:py-24">
        {/* Background Image / Decoration */}
        <div className="absolute inset-0">
          <Image src="/background.jpg" alt="" width={1400} height={600} className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-950/80 to-neutral-950" />
        </div>

        {/* Abstract Concentric Circles Decoration */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice">
          <circle cx="700" cy="150" r="140" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <circle cx="700" cy="150" r="100" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
          <circle cx="700" cy="150" r="60" fill="none" stroke="rgba(255,255,255,0.01)" strokeWidth="1" />
        </svg>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 block mb-2">
              {language === "ar" ? "مجموعتي" : language === "en" ? "My Collection" : "Ma Collection"}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none text-white">
              {language === "ar" ? "العطور المفضلة" : language === "en" ? "My Favorites" : "Mes Favoris"}
            </h1>
            <p className="text-sm text-white/60 mt-3 max-w-md font-medium">
              {language === "ar"
                ? "قائمة مخصصة تضم أفضل خياراتك من العطور الفاخرة لتسهيل العثور عليها وطلبها."
                : language === "en"
                ? "A curated collection of your premium fragrances, kept safe for easy tracking and ordering."
                : "Votre sélection personnelle de créations olfactives d'exception, enregistrée pour faciliter vos choix."}
            </p>
          </div>

          {favoriteProducts.length > 0 && (
            <button
              onClick={clearAllFavorites}
              className="self-start sm:self-auto flex items-center gap-2 bg-white/10 hover:bg-red-500/20 hover:text-red-400 border border-white/20 hover:border-red-500/30 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all backdrop-blur-sm"
            >
              <Trash2 className="h-4 w-4" />
              {language === "ar" ? "مسح الكل" : language === "en" ? "Clear All" : "Tout effacer"}
            </button>
          )}
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <AnimatePresence mode="wait">
          {favoriteProducts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 bg-white border border-neutral-100 rounded-3xl p-8 shadow-sm max-w-md mx-auto relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-neutral-50 rounded-bl-full -z-10" />
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative">
                <Heart className="h-7 w-7 fill-red-500 animate-pulse" />
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-neutral-800">
                {language === "ar" ? "قائمة المفضلات فارغة" : language === "en" ? "Your favorites list is empty" : "Votre liste de favoris est vide"}
              </h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                {language === "ar"
                  ? "تصفح كتالوج العطور لدينا واضغط على زر القلب لحفظ الروائح المفضلة لديك هنا."
                  : language === "en"
                  ? "Explore our fragrance catalog and press the heart button on any perfume to save your favorites here."
                  : "Parcourez notre catalogue et cliquez sur l'icône de cœur de vos parfums préférés pour les retrouver ici."}
              </p>
              <div className="mt-8 flex flex-col gap-2.5">
                <Link
                  href="/categories"
                  className="inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-black text-white font-bold text-xs py-3.5 px-6 rounded-xl transition-all shadow-md shadow-neutral-900/10"
                >
                  {language === "ar" ? "تصفح العطور" : language === "en" ? "Browse Fragrances" : "Découvrir nos Parfums"}
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 text-neutral-500 hover:text-neutral-800 font-semibold text-xs py-2 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {t.retourAccueil}
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                  {favoriteProducts.length} {language === "ar" ? "منتج مفضل" : language === "en" ? "Favorite items" : "Articles favoris"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {favoriteProducts.map((product) => {
                  const totalStock = (product.variants || []).reduce((sum, v) => sum + v.stock, 0);
                  const isOut = totalStock === 0;
                  const isLow = totalStock > 0 && totalStock <= 5;
                  const hasPromo = (product.discountPercent ?? 0) > 0;
                  const finalPrice = hasPromo ? (product.variants?.[0]?.price || 0) * (1 - (product.discountPercent ?? 0) / 100) : null;

                  return (
                    <motion.div
                      key={product.id}
                      layout
                      className="group bg-white rounded-2xl border border-neutral-100 hover:shadow-xl hover:shadow-neutral-900/5 transition-all duration-300 overflow-hidden flex flex-col h-full"
                    >
                      <Link href={`/product/${product.id}`} className="relative aspect-[3/4] block overflow-hidden bg-neutral-50">
                        <Image
                          src={product.image || "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=400"}
                          alt={product.name}
                          width={400}
                          height={533}
                          className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${isOut ? "grayscale opacity-60" : ""}`}
                          loading="lazy"
                        />

                        {isOut && (
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-20">
                            <span className="text-white text-[9px] font-bold uppercase tracking-[0.2em] border border-white/30 px-3 py-1.5 rounded-full bg-black/30">
                              {language === "ar" ? "نفذ" : language === "en" ? "Out of Stock" : "Épuisé"}
                            </span>
                          </div>
                        )}

                        {/* Unified Sticker Styling */}
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-30 pointer-events-none">
                          {isOut && (
                            <span className="bg-neutral-900/80 text-white text-[8px] sm:text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase border border-white/10 shadow-sm backdrop-blur-sm">
                              {language === "ar" ? "نفذ" : language === "en" ? "OOS" : "ÉPUISÉ"}
                            </span>
                          )}
                          {!isOut && hasPromo && (
                            <span className="bg-red-500 text-white text-[8px] sm:text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase border border-red-400/20 shadow-sm">
                              -{product.discountPercent}%
                            </span>
                          )}
                          {!isOut && product.isTendance && (
                            <span className="bg-amber-500 text-white text-[8px] sm:text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase border border-amber-400/20 shadow-sm">
                              {language === "ar" ? "رائج" : language === "en" ? "HOT" : "TENDANCE"}
                            </span>
                          )}
                          {!isOut && product.isBestSeller && (
                            <span className="bg-white text-neutral-900 text-[8px] sm:text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase border border-neutral-200 shadow-sm">
                              {language === "ar" ? "الأكثر مبيعاً" : language === "en" ? "BEST" : "BEST-SELLER"}
                            </span>
                          )}
                          {!isOut && isLow && (
                            <span className="bg-neutral-800/95 text-white text-[8px] sm:text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase border border-white/10 shadow-sm">
                              {language === "ar" ? "محدود" : language === "en" ? "LOW STOCK" : "STOCK BAS"}
                            </span>
                          )}
                        </div>

                        {/* Heart icon button to toggle off favorite */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(product.id, e);
                          }}
                          className="absolute top-2.5 right-2.5 z-30 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm border transition-all shadow-sm bg-red-500 border-red-400 text-white hover:scale-105"
                        >
                          <Heart className="h-3.5 w-3.5 fill-white text-white" />
                        </button>
                      </Link>

                      <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-400 block">{product.category}</span>
                          <h3 className="text-xs sm:text-sm font-bold leading-snug line-clamp-2 text-neutral-800 group-hover:text-neutral-900 transition-colors">
                            {product.name}
                          </h3>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-neutral-50/50">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {hasPromo && finalPrice !== null ? (
                              <>
                                <span className="text-[10px] text-neutral-400 line-through">{formatDZD(product.variants?.[0]?.price || 0)}</span>
                                <span className="text-xs sm:text-sm font-black text-red-500">{formatDZD(finalPrice)}</span>
                              </>
                            ) : (
                              <span className="text-xs sm:text-sm font-bold text-neutral-700">{formatDZD(product.variants?.[0]?.price || 0)}</span>
                            )}
                          </div>

                          {product.rating >= 4 && (
                            <div className="flex items-center gap-0.5">
                              <Star className="h-3 w-3 fill-neutral-800 text-neutral-800" />
                              <span className="text-[10px] font-bold text-neutral-500">{product.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="bg-neutral-950 text-white border-t border-white/5 pt-14 pb-8 px-4 sm:px-6 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            {/* Enlarged Logo */}
            <Image src="/logo.jpg" alt="M&D Parfum Logo" width={56} height={56} className="w-14 h-14 rounded-full border border-white/10 object-cover" />
            <div>
              <span className="text-sm font-black tracking-widest uppercase block">M&D Parfum</span>
              <span className="text-[9px] text-white/25 uppercase tracking-widest">Luxury Fragrances</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:text-right">
            <p className="text-[10px] uppercase tracking-[0.15em] font-medium text-white/30">
              &copy; {new Date().getFullYear()} M&D Parfum. {t.rightsReserved}
            </p>
            <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-white/80">
              MADE BY WASSIM SELAMA (PROXIMITY AGENCY)
            </p>
          </div>
        </div>
      </footer>

      <MobileBottomNav />

      {/* Mobile nav spacing */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}
