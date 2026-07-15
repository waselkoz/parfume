"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import React, { useState, useEffect, startTransition } from "react";
import { useApp, Product } from "@/context/AppContext";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { translations } from "@/lib/translations";
import Link from "next/link";
import {
  ShoppingBag, Sparkles, ArrowRight,
  Star, Mail, MessageSquare, Heart,
  Tag, X, Flame,
} from "lucide-react";

const formatDZD = (price: number) => Math.round(price).toLocaleString("fr-DZ") + " DA";


const HB = "/Hugo-Boss-Boss-Selection-Mens-Eau-De-Toilette-EDT-Spray-1.6-oz.-Best-Price-Fragrance-Parfume-MAIN_1024x1024.webp";
const P2 = "/2000043400_01.jpg";
const PA = "/images.avif";
const PJ = "/images.jpeg";
const PT = "/téléchargé.jpeg";

// Each image hugs the screen edge so on mobile it peeks dramatically,
// on desktop it sits fully in the margin. w is the image width in px.
const SCATTERED_IMGS: { src: string; top: string; left?: string; right?: string; rot: number; w: number; op: number }[] = [
  // Left side floating perfumes
  { src: HB, top: "2%", left: "0px", rot: 15, w: 90, op: 0.65 },
  { src: PA, top: "18%", left: "0px", rot: -8, w: 75, op: 0.5 },
  { src: P2, top: "35%", left: "0px", rot: 12, w: 85, op: 0.6 },
  { src: PJ, top: "52%", left: "0px", rot: -15, w: 80, op: 0.55 },
  { src: PT, top: "70%", left: "0px", rot: 10, w: 95, op: 0.6 },
  { src: HB, top: "85%", left: "0px", rot: -5, w: 70, op: 0.45 },
  { src: P2, top: "95%", left: "0px", rot: 18, w: 88, op: 0.65 },
  
  // Right side floating perfumes
  { src: PT, top: "5%", right: "0px", rot: -12, w: 85, op: 0.6 },
  { src: P2, top: "22%", right: "0px", rot: 10, w: 78, op: 0.5 },
  { src: PJ, top: "38%", right: "0px", rot: -18, w: 90, op: 0.65 },
  { src: HB, top: "55%", right: "0px", rot: 15, w: 82, op: 0.55 },
  { src: PA, top: "72%", right: "0px", rot: -10, w: 88, op: 0.6 },
  { src: PT, top: "88%", right: "0px", rot: 12, w: 75, op: 0.45 },
];

export default function StorefrontPage() {
  const { products, brands, cart, language, favorites, toggleFavorite, isFav } = useApp();
  const t = translations[language] ?? translations["fr"];
  const isRtl = language === "ar";
  const [heroBgUrl, setHeroBgUrl] = useState<string>("/background.jpg");
  const [heroProductIds, setHeroProductIds] = useState<string[]>([]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedHeroBg = localStorage.getItem("parfumguy-hero-bg");
      if (storedHeroBg) setHeroBgUrl(storedHeroBg);

      const storedHeroIds = localStorage.getItem("parfumguy-hero-ids");
      if (storedHeroIds) {
        try {
          setHeroProductIds(JSON.parse(storedHeroIds));
        } catch (_e) {}
      }
    }
  }, []);


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [siteSettings, setSiteSettings] = useState<any>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("velours-settings");
      if (saved) {
        // eslint-disable-next-line
        try { startTransition(() => { setSiteSettings(JSON.parse(saved)); }); } catch (_e) {}
      }
    }
  }, []);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const cartItemsCount = cart.reduce((s, i) => s + i.quantity, 0);

  // Helper to render a clean luxury carousel without emojis
  const renderProductCarousel = (title: string, subtitle: string, items: Product[], id: string, viewAllHref: string) => {
    const chunkSize = 10;
    const chunks = [];
    for (let i = 0; i < items.length; i += chunkSize) {
      chunks.push(items.slice(i, i + chunkSize));
    }
    
    if (chunks.length === 0) return null;

    return (
      <section id={id} className="relative z-[1] py-12 sm:py-20 px-0 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="px-4 sm:px-0 flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 sm:mb-10">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight">{title}</h2>
              <p className="text-sm font-medium text-neutral-400">{subtitle}</p>
            </div>
            <Link href={viewAllHref} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-900 hover:text-[#b39268] transition-colors group">
              {language === "ar" ? "عرض الكل" : language === "en" ? "View All" : "Voir Tout"}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="space-y-8">
            {chunks.map((chunk, chunkIdx) => (
              <div
                key={chunkIdx}
                className="flex gap-3 sm:gap-5 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 snap-x snap-mandatory"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
              >
                {chunk.map((product, idx) => {
              const totalStock = (product.variants || []).reduce((sum, v) => sum + v.stock, 0);
              const isOut = totalStock === 0;
              const isLow = totalStock > 0 && totalStock <= 5;
              const hasPromo = (product.discountPercent ?? 0) > 0;
              const finalPrice = hasPromo ? (product.variants?.[0]?.price || 0) * (1 - (product.discountPercent ?? 0) / 100) : null;
              const fav = isFav(product.id);

              return (
                <motion.div
                  key={`${title}-${product.id}`}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                  className="group flex-shrink-0 w-[46vw] sm:w-[210px] lg:w-[230px] snap-start"
                >
                  <div
                    onClick={() => !isOut && setSelectedProduct(product)}
                    className={`relative rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-100 h-full ${isOut ? "cursor-not-allowed" : "cursor-pointer hover:shadow-xl hover:shadow-neutral-900/10 transition-all duration-300 hover:-translate-y-1"}`}
                  >
                    {/* Image */}
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <Image width={800} height={800}
                        src={product.image || "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=400"}
                        alt={product.name}
                        className={`h-full w-full object-cover transition-all duration-700 ${isOut ? "grayscale opacity-60" : "group-hover:scale-105"}`}
                        loading="lazy"
                      />

                      {/* Out of stock overlay (clean text, no emojis or symbols) */}
                      {isOut && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                          <span className="text-white text-[9px] font-black uppercase tracking-[0.2em] border border-white/30 px-2.5 py-1 rounded-full">
                            {language === "ar" ? "نفذ" : language === "en" ? "Out of Stock" : "Épuisé"}
                          </span>
                        </div>
                      )}

                      {/* Hover overlay */}
                      {!isOut && (
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4 z-10">
                          <span className="text-white text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-full translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            {language === "ar" ? "اكتشف" : language === "en" ? "Discover" : "Découvrir"}
                          </span>
                        </div>
                      )}

                      {/* Badges (No Emojis!) */}
                      <div className="absolute top-2.5 left-2.5 z-30 flex flex-col gap-1 items-start">
                        {hasPromo && !isOut && (
                          <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-lg">
                            <Tag className="h-2.5 w-2.5" />-{product.discountPercent}%
                          </span>
                        )}
                        {product.isTendance && !isOut && (
                          <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-lg uppercase tracking-wider">
                            {language === "ar" ? "رائج" : language === "en" ? "Trending" : "Tendance"}
                          </span>
                        )}
                        {product.isBestSeller && !isOut && (
                          <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-lg uppercase tracking-wider">
                            {language === "ar" ? "الأكثر مبيعاً" : language === "en" ? "Best Seller" : "Meilleure Vente"}
                          </span>
                        )}
                        {isLow && !isOut && (
                          <span className="bg-neutral-800 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-lg uppercase tracking-wider">
                            {language === "ar" ? "محدود" : language === "en" ? "Low Stock" : "Stock Limité"}
                          </span>
                        )}
                      </div>

                      {/* Wishlist */}
                      <button
                        onClick={e => { e.stopPropagation(); toggleFavorite(product.id, e); }}
                        className={`absolute top-2.5 right-2.5 z-30 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm border transition-all shadow-sm ${fav ? "bg-red-500 border-red-400" : "bg-white/80 border-white/60 hover:bg-white"}`}
                      >
                        <Heart className={`h-3.5 w-3.5 transition-all ${fav ? "fill-white text-white" : "text-neutral-500"}`} />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-3 sm:p-4 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-400 truncate">{product.category}</p>
                        {product.brand && (() => {
                          const b = brands.find(br => br.name === product.brand);
                          return b?.logo ? (
                            <Image width={800} height={800} src={b.logo} alt={product.brand} className="h-4 w-auto object-contain opacity-60 mix-blend-multiply" loading="lazy" />
                          ) : (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">{product.brand}</span>
                          );
                        })()}
                      </div>
                      <h3 className={`text-xs sm:text-sm font-bold leading-snug line-clamp-2 ${isOut ? "text-neutral-400" : "text-neutral-800"}`}>{product.name}</h3>
                      <div className="flex items-center justify-between pt-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {hasPromo && finalPrice !== null ? (
                            <>
                              <span className="text-[10px] text-neutral-400 line-through">{formatDZD(product.variants?.[0]?.price || 0)}</span>
                              <span className="text-xs font-black text-red-500">{formatDZD(finalPrice)}</span>
                            </>
                          ) : (
                            <span className={`text-xs font-bold ${isOut ? "text-neutral-400" : "text-neutral-700"}`}>{formatDZD(product.variants?.[0]?.price || 0)}</span>
                          )}
                        </div>
                        {product.rating >= 4 && !isOut && (
                          <div className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-neutral-800 text-neutral-800" />
                            <span className="text-[10px] font-bold text-neutral-500">{product.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
              </div>
            ))}
          </div>

          {/* Page Indicator */}
          {chunks.length > 1 && (
            <div className="mt-8 text-center border-t border-neutral-100 pt-6">
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] bg-neutral-50 px-4 py-2 rounded-full border border-neutral-100">
                {language === "ar" ? `عدد الصفحات: ${chunks.length}` : language === "en" ? `Pages: ${chunks.length}` : `Pages : ${chunks.length}`}
              </span>
            </div>
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900" dir={isRtl ? "rtl" : "ltr"} style={{ fontFamily: "'Inter', sans-serif" }}>


      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden min-h-[94svh] lg:min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        {/* Local background photo */}
        <div className="absolute inset-0">
          <Image width={800} height={800} src={heroBgUrl} alt="" className="w-full h-full object-cover" loading="eager" />
        </div>
        {/* Mobile: stronger bottom fade so content stays readable */}
        <div className="absolute inset-0 bg-neutral-950/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/50 via-transparent to-neutral-950/90 lg:hidden" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/85 via-neutral-950/40 to-transparent hidden lg:block" />

        {/* Animated Background shapes in Hero */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="hidden sm:block absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#b39268] blur-3xl mix-blend-screen pointer-events-none z-0" 
        />
        
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="hidden sm:block absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#91724d] blur-3xl mix-blend-screen pointer-events-none z-0" 
        />

        {/* Corner accents — desktop only */}
        <div className="hidden lg:block absolute top-8 left-8 w-16 h-16 border-t border-l border-white/15 pointer-events-none" />
        <div className="hidden lg:block absolute bottom-8 right-8 w-16 h-16 border-b border-r border-white/15 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24 lg:py-32 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left: Copy content */}
          <div className="lg:col-span-5 text-center lg:text-left space-y-5 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/25 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.2em] text-white/80"
            >
              {/* Perfume bottle mini icon */}
              <svg className="h-3.5 w-3.5 text-white/70 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 3h6M10 3v3M14 3v3" />
                <path d="M7 6h10a2 2 0 012 2v10a4 4 0 01-4 4H9a4 4 0 01-4-4V8a2 2 0 012-2z" />
                <path d="M12 10v5M9.5 12.5h5" />
              </svg>
              {siteSettings?.heroTagline || (language === "ar" ? "عطور فاخرة" : language === "en" ? "Luxury Fragrances" : "Maison de Parfumerie")}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.92] tracking-tight">
                {/* Perfume Flacon SVG Symbol inline */}
                <span className="flex items-start gap-4 justify-center lg:justify-start">
                  <svg
                    className="hidden lg:block flex-shrink-0 mt-2 h-12 w-10 text-white/25"
                    viewBox="0 0 40 60"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {/* Bottle neck */}
                    <rect x="14" y="2" width="12" height="6" rx="2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" />
                    {/* Collar */}
                    <rect x="12" y="8" width="16" height="4" rx="1.5" fill="currentColor" fillOpacity="0.3" />
                    {/* Bottle body */}
                    <path d="M8 16 Q6 20 6 28 L6 46 Q6 54 20 54 Q34 54 34 46 L34 28 Q34 20 32 16 Z" fill="currentColor" fillOpacity="0.1" />
                    <path d="M8 16 Q6 20 6 28 L6 46 Q6 54 20 54 Q34 54 34 46 L34 28 Q34 20 32 16 Z" />
                    {/* Shoulder join */}
                    <path d="M12 12 L8 16 M28 12 L32 16" />
                    {/* Liquid level */}
                    <path d="M8 32 Q20 28 32 32" strokeOpacity="0.5" />
                    {/* Label */}
                    <rect x="11" y="34" width="18" height="12" rx="1" strokeOpacity="0.4" />
                  </svg>
                  <span className="block">
                    <span className="block text-white">{siteSettings?.heroTitle || (language === "ar" ? "اكتشف" : language === "en" ? "Discover" : "L'Art de")}</span>
                    <span className="block italic font-light text-white/85" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {siteSettings?.heroSubtitle2 || (language === "ar" ? "روائح استثنائية" : language === "en" ? "Exceptional Scents" : "la Parfumerie")}
                    </span>
                  </span>
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-sm sm:text-base text-white/55 font-medium leading-relaxed max-w-md mx-auto lg:mx-0"
            >
              {siteSettings?.heroDesc || (language === "ar" ? "تشكيلة حصرية من العطور الفاخرة المختارة بعناية لكل ذوق." : language === "en" ? "An exclusive collection of luxury fragrances carefully curated for every taste." : "Une collection exclusive de fragrances de luxe, soigneusement sélectionnées pour tous les goûts.")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-col sm:flex-row gap-3 items-center justify-center lg:justify-start"
            >
              <a href="#nouveautes" className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-sm px-8 py-4 rounded-2xl transition-all shadow-xl shadow-black/20">
                {siteSettings?.heroCta || (language === "ar" ? "اكتشف المجموعة" : language === "en" ? "Discover Collection" : "Découvrir la collection")}
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link href="/categories" className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm px-8 py-4 rounded-2xl transition-all backdrop-blur-sm">
                {language === "ar" ? "كل الفئات" : language === "en" ? "All Categories" : "Toutes les catégories"}
              </Link>
            </motion.div>

            {/* Trust micro-badges — desktop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="hidden sm:flex flex-wrap items-center gap-4 justify-center lg:justify-start pt-1"
            >
              {[
                language === "ar" ? "أصلي 100%" : language === "en" ? "100% Authentic" : "Authenticité garantie",
                language === "ar" ? "توصيل سريع" : language === "en" ? "Fast Shipping" : "Livraison rapide",
              ].map(text => (
                <span key={text} className="flex items-center gap-1.5 text-[10px] text-white/35 font-medium">
                  <span className="w-1 h-1 rounded-full bg-white/40 shrink-0" />
                  {text}
                </span>
              ))}
            </motion.div>

            {/* Mobile-only: featured product peek card */}
            {products[0] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.6 }}
                className="sm:hidden"
              >
                <div
                  onClick={() => setSelectedProduct(products[0])}
                  className="cursor-pointer flex items-center gap-3.5 bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-3 mx-auto max-w-xs"
                >
                  <div className="w-14 h-18 rounded-xl overflow-hidden shrink-0 border border-white/10" style={{ height: "72px", width: "52px" }}>
                    <Image width={800} height={800} src={products[0].image} alt={products[0].name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[8px] uppercase tracking-[0.2em] text-white/40 font-bold">{products[0].category}</p>
                    <p className="text-sm font-bold text-white leading-tight mt-0.5 truncate">{products[0].name}</p>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className="h-2 w-2 fill-white/60 text-white/60" />)}
                    </div>
                    <p className="text-xs font-black text-white/90 mt-1">{formatDZD(products[0].variants?.[0]?.price || 0)}</p>
                  </div>
                  <div className="shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <ArrowRight className="h-3.5 w-3.5 text-neutral-900" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: 3 Showcase Demo Cards */}
          <div className="lg:col-span-7 w-full">
            <div className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-8 pt-4 hide-scrollbar sm:pl-4">
              {/* Dynamic hero products from admin config */}
              {(() => {
                const heroProducts = heroProductIds.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[];
                if (heroProducts.length === 0) return null;
                
                return heroProducts.map((p, index) => {
                  const isOut = p.variants?.[0]?.stock === 0;
                  const hasPromo = (p.discountPercent ?? 0) > 0;
                  const salePrice = (p.variants?.[0]?.price || 0) * (1 - (p.discountPercent || 0) / 100);
                  
                  return (
                    <motion.div
                      key={`hero-${p.id}`}
                      animate={{ y: [0, -12, 0] }}
                      transition={{ duration: 3.8 + (index * 0.4), repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
                      whileHover={{ scale: 1.04 }}
                      className="flex-shrink-0 w-[70vw] sm:w-[220px] lg:w-auto snap-center"
                    >
                      <div
                        onClick={() => setSelectedProduct(p)}
                        className={`group cursor-pointer bg-white/6 hover:bg-white/12 backdrop-blur-xl border ${hasPromo ? 'border-red-400/30 hover:border-red-400/70' : 'border-white/12 hover:border-white/30'} rounded-2xl p-3 transition-all duration-300 shadow-2xl relative overflow-hidden`}
                      >
                        {/* Promo glow */}
                        {hasPromo && <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />}
                        
                        {/* Image */}
                        <div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-3">
                          <Image width={800} height={800} src={p.image} alt={p.name} className={`h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ${isOut ? 'grayscale opacity-50' : ''}`} loading="eager" />
                          
                          {/* Stickers top left */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                            {hasPromo && !isOut && (
                              <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-red-500/50">
                                <Tag className="h-2.5 w-2.5" />
                                SALE -{p.discountPercent}%
                              </span>
                            )}
                            {p.isTendance && !isOut && (
                              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg shadow-orange-500/40 uppercase tracking-wider">
                                <Flame className="h-2.5 w-2.5" />
                                {language === "ar" ? "رائج" : language === "en" ? "HOT" : "TENDANCE"}
                              </span>
                            )}
                            {p.isBestSeller && !isOut && (
                              <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg shadow-emerald-500/40 uppercase tracking-wider">
                                {language === "ar" ? "الأكثر مبيعاً" : language === "en" ? "BEST SELLER" : "BEST SELLER"}
                              </span>
                            )}
                            {isOut && (
                              <span className="bg-neutral-700 text-neutral-300 text-[8px] font-black px-2 py-1 rounded-full border border-neutral-600 uppercase">
                                {language === "ar" ? "غير متوفر" : language === "en" ? "UNAVAILABLE" : "INDISPONIBLE"}
                              </span>
                            )}
                          </div>
                          
                          {/* Out of stock overlay */}
                          {isOut && (
                            <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2 z-10">
                              <div className="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center mb-1">
                                <X className="h-5 w-5 text-white/50" />
                              </div>
                              <span className="text-white text-[9px] font-black uppercase tracking-[0.2em] border border-white/20 px-3 py-1.5 rounded-full bg-white/5">
                                {language === "ar" ? "نفذ" : language === "en" ? "OUT OF STOCK" : "ÉPUISÉ"}
                              </span>
                            </div>
                          )}

                          <button onClick={e => { e.stopPropagation(); toggleFavorite(p.id, e); }} className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm rounded-full w-7 h-7 flex items-center justify-center border border-white/10 z-20">
                            <Heart className={`h-3 w-3 ${isFav(p.id) ? 'fill-red-400 text-red-400' : 'text-white/70'}`} />
                          </button>
                        </div>

                        {/* Product Info */}
                        <div className={`space-y-1 ${isOut ? 'opacity-50' : ''}`}>
                          <span className={`text-[8px] font-bold uppercase tracking-wider ${hasPromo ? 'text-red-300' : 'text-white/50'} block`}>{p.category}</span>
                          <h4 className={`text-xs sm:text-sm font-bold text-white line-clamp-1 transition-colors ${hasPromo ? 'group-hover:text-red-200' : 'group-hover:text-white/80'}`}>{p.name}</h4>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_,i) => <Star key={i} className={`h-2.5 w-2.5 ${isOut ? 'text-white/10' : (i < Math.floor(p.rating) ? 'fill-white/80 text-white/80' : 'text-white/20')}`} />)}
                            {!isOut && <span className="text-[9px] text-white/50 font-bold ml-1">{p.rating}</span>}
                          </div>
                          
                          <div className="pt-1.5 flex items-center justify-between">
                            {hasPromo && !isOut ? (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] text-white/35 line-through">{formatDZD(p.variants?.[0]?.price || 0)}</span>
                                <span className="text-xs font-black text-red-400">{formatDZD(salePrice)}</span>
                              </div>
                            ) : (
                              <span className={`text-xs font-bold ${isOut ? 'text-neutral-500' : 'text-white/90'}`}>{formatDZD(p.variants?.[0]?.price || 0)}</span>
                            )}
                            
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              isOut 
                                ? 'bg-neutral-700/40 text-neutral-500 border border-neutral-600/30' 
                                : hasPromo 
                                  ? 'bg-red-500/20 text-red-300 border border-red-400/40' 
                                  : 'bg-orange-500/20 text-orange-300 border border-orange-400/30'
                            }`}>
                              {isOut 
                                ? (language === "ar" ? "نفذ" : "N/A") 
                                : (language === "ar" ? (hasPromo ? "اشتري" : "أضف") : (language === "en" ? "Buy" : "Acheter"))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                });
              })()}
            </div>
          </div>

        </div>
      </section>

      {/* ─── BRAND LOGO CAROUSEL ─── */}
      <section className="border-y border-neutral-100 bg-white py-8 overflow-hidden">
        <div className="flex w-max items-center animate-marquee gap-24 pr-24">
            {Array(8).fill([
              "/logos/téléchargé (1).png",
              "/logos/téléchargé (2).png",
              "/logos/téléchargé (3).png",
              "/logos/téléchargé (4).png",
              "/logos/téléchargé.jpeg",
              "/logos/téléchargé.png"
            ]).flat().map((logoUrl, i) => (
              <div key={i} className="shrink-0 group flex items-center justify-center px-4">
                <Image width={800} height={800}
                  src={logoUrl as string}
                  alt={`Marque ${i + 1}`}
                  className="h-16 sm:h-20 max-w-48 object-contain opacity-100 transition-transform duration-300 hover:scale-110 drop-shadow-md"
                  style={{ mixBlendMode: "multiply" }}
                  loading="lazy"
                />
              </div>
            ))}
        </div>
      </section>

      <main className="relative bg-white overflow-hidden">

        {/* Decorative background shapes */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="hidden sm:block absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-[#b39268] opacity-20 rounded-full blur-3xl pointer-events-none z-0" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="hidden sm:block absolute top-[50%] right-[5%] w-[500px] h-[500px] bg-[#dfcbaf] opacity-30 rounded-full blur-3xl pointer-events-none z-0" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], y: [0, -60, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="hidden sm:block absolute bottom-[10%] left-[20%] w-[350px] h-[350px] bg-[#91724d] opacity-20 rounded-full blur-3xl pointer-events-none z-0" 
        />

        {/* ── SCATTERED PARFUM IMAGES on white bg ── */}
        {SCATTERED_IMGS.map((item, i) => {
          const isLeft = item.left !== undefined;
          const nudge = isLeft ? "18%" : "-18%";
          const hideOnMobile = i % 2 !== 0 ? "hidden sm:block" : "";
          return (
            <motion.div
              key={i}
              animate={{ y: [0, isLeft ? -50 : 50, 0], rotate: [0, isLeft ? 10 : -10, 0] }}
              transition={{ duration: 4 + (i % 3) * 2, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute pointer-events-none ${hideOnMobile}`}
              style={{
                top: item.top,
                ...(isLeft ? { left: item.left } : { right: item.right }),
                width: `${item.w}px`,
                height: `${Math.round(item.w * 1.5)}px`,
                opacity: item.op,
                zIndex: 0,
                mixBlendMode: "multiply",
              }}
            >
              <Image width={800} height={800} 
                src={item.src} 
                alt="" 
                className="w-full h-full object-cover" 
                style={{ transform: `rotate(${item.rot}deg) translateX(${nudge})` }}
                loading="lazy" 
              />
            </motion.div>
          );
        })}

        {/* Carousel: Tendance */}
        {renderProductCarousel(
          language === "ar" ? "الرائج" : language === "en" ? "Trending" : "Tendance",
          language === "ar" ? "الأكثر رواجاً الآن" : language === "en" ? "What's hot right now" : "Les plus demandés en ce moment",
          products.filter(p => p.isTendance),
          "tendance",
          "/categories"
        )}

        {/* Carousel: Best Sellers */}
        {renderProductCarousel(
          language === "ar" ? "الأكثر مبيعاً" : language === "en" ? "Best Sellers" : "Meilleures Ventes",
          language === "ar" ? "عطورنا الأكثر شعبية" : language === "en" ? "Our best-selling fragrances" : "Nos créations les plus prisées",
          products.filter(p => p.isBestSeller),
          "best-sellers",
          "/categories"
        )}

        {/* Carousel: Promotions */}
        {renderProductCarousel(
          language === "ar" ? "عروض خاصة" : language === "en" ? "Special Offers" : "Promotions",
          language === "ar" ? "أسعار مخفضة لفترة محدودة" : language === "en" ? "Limited-time discounts" : "Réductions exclusives",
          products.filter(p => (p.discountPercent ?? 0) > 0),
          "promo",
          "/categories"
        )}
        {/* ─── NOTRE HISTOIRE ─── */}
        <section id="about" className="relative z-[1] py-12 sm:py-20 px-4 sm:px-6 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-center">
            <div className="space-y-6 order-2 lg:order-1">
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight leading-tight uppercase">
                  {language === "ar" ? "من نحن" : language === "en" ? "About Us" : "Sur Nous"}
                </h2>
              </div>
              <div className="h-px w-12 bg-neutral-200" />
              <div className="space-y-4 text-sm text-neutral-500 leading-relaxed max-w-lg">
               {language === "ar" ? "مرحباً بكم في MD Parfum، وجهتكم للتميز في عالم العطور. نحن نقدم مجموعة راقية وحصرية من العطور لتناسب ذوقكم الرفيع." : language === "en" ? "Welcome to MD Parfum, your destination for excellence in perfumery. We offer an exclusive selection of luxury fragrances tailored to your taste." : "Bienvenue chez MD Parfum, votre destination pour l'excellence de la parfumerie. Nous vous proposons une sélection rigoureuse de créations olfactives de qualité."}
              </div>
              
              <div className="pt-2 pb-4 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-100 px-5 py-3 rounded-2xl shadow-sm select-none">
                    <MessageSquare className="h-5 w-5 text-neutral-700" />
                    <span className="text-sm font-semibold text-neutral-900">0770381835</span>
                  </div>
                  <a href="https://maps.app.goo.gl/rRTYnvR3CYkRgfVQ8?g_st=iw" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-100 px-5 py-3 rounded-2xl transition-all shadow-sm">
                    <span className="text-xl">📍</span>
                    <span className="text-sm font-semibold text-neutral-900">{language === "ar" ? "موقع المتجر" : language === "en" ? "Our Store" : "Notre Boutique"}</span>
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <a href="https://www.tiktok.com/@md.parfum1?_r=1&_t=ZS-97BG5zZDSHS" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-all shadow-md hover:shadow-lg border border-neutral-800">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 15.68a6.34 6.34 0 0012.67-1.7v-5.45a8.27 8.27 0 004.77 1.52V6.57a4.93 4.93 0 01-2.85-1.12v1.24z"/></svg>
                  </a>
                  <a href="https://www.instagram.com/md_parfum_dz?igsh=dmtucXVwb3Q5NzNp" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center hover:scale-110 transition-all shadow-md hover:shadow-lg">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </a>
                  <a href="https://www.facebook.com/profile.php?id=61572516699373&mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 transition-all shadow-md hover:shadow-lg">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2">
                {[
                  { n: "15+", l: t.expertYears },
                  { n: "50+", l: t.fragrancesCount },
                  { n: "100%", l: t.artisanal },
                ].map(s => (
                  <div key={s.l} className="bg-neutral-50 rounded-2xl p-4 text-center border border-neutral-100 shadow-sm">
                    <span className="text-xl sm:text-2xl font-black text-neutral-900 block">{s.n}</span>
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-neutral-400 font-bold mt-1 block">{s.l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative order-1 lg:order-2 mx-4 sm:mx-0">
              <div className="hidden sm:block absolute -top-3 -right-3 w-full h-full bg-neutral-200/50 rounded-3xl -z-10" />
              <div className="rounded-2xl sm:rounded-3xl overflow-hidden aspect-16/10 sm:aspect-4/5 relative">
                <Image width={800} height={800}
                  src="/store_clean.png"
                  alt="Notre boutique MD Parfum"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Logo badge — desktop */}
              <div className="hidden sm:flex absolute -bottom-5 -left-5 bg-white border border-neutral-200 rounded-2xl px-4 py-3 shadow-xl items-center gap-3">
                <Image width={800} height={800} src="/logo.jpg" alt="M&D Parfum" className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-neutral-900 block">M&D PARFUM</span>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 font-bold">Luxury Fragrances</span>
                </div>
              </div>
              {/* Logo badge — mobile */}
              <div className="sm:hidden absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm border border-neutral-200/60 rounded-xl px-3 py-2 shadow-md flex items-center gap-2">
                <Image width={800} height={800} src="/logo.jpg" alt="M&D Parfum" className="h-7 w-7 rounded-full object-cover" />
                <span className="text-[9px] font-black uppercase tracking-widest text-neutral-900">M&D PARFUM</span>
              </div>
            </div>

          </div>
        </section>

        {/* ─── CONTACT ─── */}
        <section id="contact" className="py-12 sm:py-20 px-4 sm:px-6 bg-[#0f0f0f] text-white">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/60">{t.uneQuestion}</span>
              <h2 className="text-2xl sm:text-4xl font-black">{t.contactezNous}</h2>
            </div>
            <div className="h-px w-12 bg-white/10 mx-auto" />
            <p className="text-sm text-white/60 leading-relaxed">{t.contactDesc}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="mailto:contact@m38dparfum.com" className="inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-sm px-8 py-4 rounded-2xl transition-all">
                <Mail className="h-4 w-4" />
                {t.contactFormBtn}
              </a>
              <a href="https://wa.me/213770381835" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm px-8 py-4 rounded-2xl transition-all">
                <MessageSquare className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="bg-black text-white border-t border-white/10 pt-14 sm:pt-16 pb-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10 pb-10 border-b border-white/8">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-1 space-y-4">
              <div className="flex items-center gap-3">
                <Image width={800} height={800} src="/logo.jpg" alt="M&D Parfum" className="w-12 h-12 object-contain bg-white rounded-xl p-1" />
                <div>
                  <span className="text-sm font-black tracking-widest uppercase block">M&D Parfum</span>
                  <span className="text-[9px] text-white/25 uppercase tracking-widest">Luxury Fragrances</span>
                </div>
              </div>
              <p className="text-xs text-white/35 leading-relaxed max-w-[220px]">
                {language === "ar" ? "دار عطور فاخرة متخصصة في العطور الأصيلة." : language === "en" ? "A luxury perfume house specializing in authentic fragrances." : "Une maison de parfumerie de luxe spécialisée dans les fragrances authentiques."}
              </p>
              <div className="flex items-center gap-2 pt-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-white/50 text-white/50" />)}
                <span className="text-[10px] text-white/30 font-medium ml-1">4.9/5</span>
              </div>
            </div>

            {/* Explore */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
                {language === "ar" ? "استكشف" : language === "en" ? "Explore" : "Explorer"}
              </h4>
              <div className="space-y-2.5">
                {[
                  { label: language === "ar" ? "وصل حديثاً" : language === "en" ? "New Arrivals" : "Nouveautés", href: "#nouveautes", isLink: false },
                  { label: language === "ar" ? "الأكثر طلباً" : language === "en" ? "Best Sellers" : "Best-sellers", href: "#nouveautes", isLink: false },
                  { label: language === "ar" ? "التصنيفات" : language === "en" ? "Categories" : "Catégories", href: "/categories", isLink: true },
                  { label: language === "ar" ? "الماركات" : language === "en" ? "Brands" : "Marques", href: "/marques", isLink: true },
                ].map(item => item.isLink ? (
                  <Link key={item.label} href={item.href} className="block text-xs text-white/35 hover:text-white/70 transition-colors font-medium">{item.label}</Link>
                ) : (
                  <a key={item.label} href={item.href} className="block text-xs text-white/35 hover:text-white/70 transition-colors font-medium">{item.label}</a>
                ))}
              </div>
            </div>

            {/* Service */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
                {language === "ar" ? "خدمة العملاء" : language === "en" ? "Customer Care" : "Service Client"}
              </h4>
              <div className="space-y-2.5">
                {[
                  language === "ar" ? "التوصيل والإرجاع" : language === "en" ? "Delivery & Returns" : "Livraison & Retours",
                  language === "ar" ? "الأسئلة الشائعة" : language === "en" ? "FAQ" : "FAQ",
                  language === "ar" ? "اتصل بنا" : language === "en" ? "Contact Us" : "Contactez-nous",
                  language === "ar" ? "تتبع الطلب" : language === "en" ? "Track Order" : "Suivi commande",
                ].map((label) => (
                  <span key={label} className="block text-xs text-white/35 hover:text-white/70 transition-colors font-medium cursor-pointer">{label}</span>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">Contact & Reseaux</h4>
              <div className="space-y-3">
                <a href="tel:0770381835" className="flex items-center gap-2 text-xs text-white/35 hover:text-white/70 transition-colors">
                  <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
                  0770381835
                </a>
                <a href="https://maps.app.goo.gl/rRTYnvR3CYkRgfVQ8?g_st=iw" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-white/35 hover:text-white/70 transition-colors">
                  <span className="h-3.5 w-3.5 flex-shrink-0">📍</span>
                  Notre Boutique
                </a>
                <div className="flex flex-col gap-2 pt-2">
                  <a href="https://www.tiktok.com/@md.parfum1?_r=1&_t=ZS-97BG5zZDSHS" target="_blank" className="text-white/40 hover:text-white text-xs transition-colors">TikTok</a>
                  <a href="https://www.instagram.com/md_parfum_dz?igsh=dmtucXVwb3Q5NzNp" target="_blank" className="text-white/40 hover:text-[#E1306C] text-xs transition-colors">Instagram</a>
                  <a href="https://www.facebook.com/profile.php?id=61572516699373&mibextid=wwXIfr" target="_blank" className="text-white/40 hover:text-[#1877F2] text-xs transition-colors">Facebook</a>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6">
            <div className="flex flex-col gap-2">
              <p className="text-[10px] text-white/20 font-medium">
                &copy; {new Date().getFullYear()} MD Parfum. {t.rightsReserved}
              </p>
              <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-white/80">
                MADE BY WASSIM SELAMA (PROXIMITY AGENCY)
              </p>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-white/20 font-medium">
              <span className="hover:text-white/50 cursor-pointer transition-colors">
                {language === "ar" ? "سياسة الخصوصية" : language === "en" ? "Privacy Policy" : "Politique de Confidentialité"}
              </span>
              <span className="text-white/10">·</span>
              <Link href="/admin" className="hover:text-white/50 transition-colors">Admin</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ProductDetailModal product={selectedProduct} isOpen={selectedProduct !== null} onClose={() => setSelectedProduct(null)} />

      {/* ─── MOBILE BOTTOM NAV ─── */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden" 
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-3 mb-3 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden">
          <div className="flex items-stretch">
            {[
              { icon: Sparkles, label: language === "ar" ? "الفئات" : language === "en" ? "Shop" : "Boutique", href: "/categories", isLink: true, primary: true },
              { icon: Tag, label: language === "ar" ? "عروض" : language === "en" ? "Promos" : "Promos", href: "#promo", isLink: false },
              { icon: Heart, label: language === "ar" ? "المفضلة" : language === "en" ? "Favorites" : "Favoris", href: "/favoris", isLink: true },
              {
                icon: ShoppingBag,
                label: cartItemsCount > 0 ? String(cartItemsCount) : language === "ar" ? "سلة" : language === "en" ? "Cart" : "Panier",
                href: "#cart",
                isLink: false,
                isCart: true,
              },
            ].map(({ icon: Icon, label, href, isLink, primary, isCart }: { icon: React.ElementType; label: string; href: string; isLink: boolean; primary?: boolean; isCart?: boolean }) => {
              const cls = `flex flex-col items-center justify-center gap-1 py-3 flex-1 transition-colors ${primary ? "bg-white text-neutral-900" : "text-white/60 hover:text-white"}`;
              const inner = (
                <>
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="text-[8px] font-bold uppercase tracking-wide leading-none">{label}</span>
                  {isCart && cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">{cartItemsCount}</span>
                  )}
                </>
              );
              if (isCart) return (
                <button key="cart" onClick={() => window.dispatchEvent(new CustomEvent('open-cart'))} className={`${cls} relative`}>{inner}</button>
              );
              return isLink
                ? <Link key={href} href={href} className={cls}>{inner}</Link>
                : <a key={href} href={href} className={cls}>{inner}</a>;
            })}
          </div>
        </div>
      </motion.div>

      {/* Bottom padding for mobile nav */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}
