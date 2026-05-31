"use client";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, startTransition } from "react";
import { useApp, Product } from "@/context/AppContext";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { CartDrawer } from "@/components/CartDrawer";
import { LoginModal } from "@/components/LoginModal";
import { translations } from "@/lib/translations";
import Link from "next/link";
import {
  ShoppingBag, LogOut, Sparkles, Search, ArrowRight,
  Shield, Star, Mail, MessageSquare, Heart,
  Gem, Tag, X, Menu, Flame,
} from "lucide-react";
import { MobileBottomNav } from "@/components/MobileBottomNav";

const USD_TO_DZD = 135;
const formatDZD = (usd: number) => Math.round(usd * USD_TO_DZD).toLocaleString("fr-DZ") + " DA";

const BRANDS = ["CHANEL", "DIOR", "GUERLAIN", "HERMÈS", "YSL", "CREED", "BYREDO", "MAISON MARGIELA", "TOM FORD", "NARCISO"];

const HB = "/Hugo-Boss-Boss-Selection-Mens-Eau-De-Toilette-EDT-Spray-1.6-oz.-Best-Price-Fragrance-Parfume-MAIN_1024x1024.webp";
const P2 = "/2000043400_01.jpg";
const PA = "/images.avif";
const PJ = "/images.jpeg";
const PT = "/téléchargé.jpeg";

// One tile of scattered perfume images (pixel offsets within an 800px tile).
// The tile repeats automatically as the page grows.
const TILE_H = 800; // px between each repeat
const TILE_REPEATS = 12; // covers up to ~9600px of content
const SCATTERED_TILE: { src: string; topPx: number; left?: string; right?: string; rot: number; w: number; op: number }[] = [
  { src: HB, topPx:  20, right: "0px", rot: -10, w: 82, op: 0.55 },
  { src: HB, topPx:  80, left:  "0px", rot:  12, w: 80, op: 0.52 },
  { src: P2, topPx: 220, left:  "0px", rot:  15, w: 84, op: 0.55 },
  { src: PA, topPx: 380, right: "0px", rot:  -8, w: 78, op: 0.50 },
  { src: HB, topPx: 480, left:  "0px", rot: -14, w: 74, op: 0.52 },
  { src: P2, topPx: 620, right: "0px", rot:   9, w: 76, op: 0.53 },
  { src: PJ, topPx: 730, left:  "0px", rot:  11, w: 80, op: 0.50 },
];

export default function StorefrontPage() {
  const { products, brands, cart, currentUser, logout, language, setLanguage } = useApp();
  const t = translations[language] ?? translations["fr"];
  const isRtl = language === "ar";

  const [favorites, setFavorites] = useState<string[]>([]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      try { setFavorites(JSON.parse(localStorage.getItem("velours_favorites") || "[]")); } catch (_e) {}
    }
  }, []);
  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      if (typeof window !== "undefined") localStorage.setItem("velours_favorites", JSON.stringify(next));
      return next;
    });
  };

  const [siteSettings, setSiteSettings] = useState<any>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("velours-settings");
      if (saved) {
        try { startTransition(() => { setSiteSettings(JSON.parse(saved)); }); } catch (_e) {}
      }
    }
  }, []);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Secret admin triple-tap on logo
  const [logoClicks, setLogoClicks] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastClickTime < 1000) {
      const n = logoClicks + 1;
      setLogoClicks(n);
      if (n >= 2) window.location.href = "/admin";
    } else { setLogoClicks(0); }
    setLastClickTime(now);
  };

  useEffect(() => {
    let keys: string[] = [];
    const secret = ["a", "d", "m", "i", "n"];
    const onKey = (e: KeyboardEvent) => {
      keys.push(e.key.toLowerCase());
      keys = keys.slice(-secret.length);
      if (JSON.stringify(keys) === JSON.stringify(secret)) window.location.href = "/admin";
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const cartItemsCount = cart.reduce((s, i) => s + i.quantity, 0);

  const isFav = (id: string) => favorites.includes(id);

  const renderProductGrid = (
    title: string,
    subtitle: string,
    items: Product[],
    sticker: "new" | "promo",
    anchorId?: string
  ) => {
    if (items.length === 0) return null;
    return (
      <section id={anchorId} className="relative z-[1] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-7">
            <div className="space-y-1">
              <span className="text-neutral-400 text-[10px] font-bold uppercase tracking-[0.25em] block">{title}</span>
              <h2 className="text-xl sm:text-3xl font-black text-neutral-900 tracking-tight">{subtitle}</h2>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider shrink-0 ${sticker === "promo" ? "text-red-400" : "text-neutral-400"}`}>
              {items.length} {language === "ar" ? "منتج" : language === "en" ? "items" : "articles"}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {items.map((product, idx) => {
              const totalStock = (product.stock?.["50ml"] || 0) + (product.stock?.["100ml"] || 0);
              const isOut = totalStock === 0;
              const hasPromo = (product.discountPercent ?? 0) > 0;
              const finalPrice = hasPromo ? product.price * (1 - (product.discountPercent ?? 0) / 100) : null;
              const fav = isFav(product.id);

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(idx * 0.04, 0.24) }}
                  className="group"
                >
                  <div
                    onClick={() => !isOut && setSelectedProduct(product)}
                    className={`relative rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-100 ${isOut ? "cursor-not-allowed" : "cursor-pointer hover:shadow-xl hover:shadow-neutral-900/10 transition-all duration-300 hover:-translate-y-1"}`}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={product.image || "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=400"}
                        alt={product.name}
                        className={`h-full w-full object-cover transition-all duration-700 ${isOut ? "grayscale opacity-60" : "group-hover:scale-105"}`}
                        loading="lazy"
                      />

                      {isOut && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
                          <span className="text-white text-[9px] font-black uppercase tracking-[0.2em] border border-white/30 px-2.5 py-1 rounded-full">
                            {language === "ar" ? "نفذ" : language === "en" ? "Out of Stock" : "Épuisé"}
                          </span>
                        </div>
                      )}

                      {!isOut && (
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4 z-10">
                          <span className="text-white text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-full translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            {language === "ar" ? "اكتشف" : language === "en" ? "Discover" : "Découvrir"}
                          </span>
                        </div>
                      )}

                      {/* Sticker */}
                      {!isOut && (
                        <div className="absolute top-0 left-0 z-30">
                          {sticker === "new" && (
                            <span className="block bg-neutral-900 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-br-xl">
                              {language === "ar" ? "جديد" : language === "en" ? "NEW" : "NOUVEAU"}
                            </span>
                          )}
                          {sticker === "promo" && (
                            <span className="block bg-red-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-br-xl">
                              -{product.discountPercent}%
                            </span>
                          )}
                        </div>
                      )}

                      {/* Wishlist */}
                      <button
                        onClick={e => { e.stopPropagation(); toggleFavorite(product.id, e); }}
                        className={`absolute top-2.5 right-2.5 z-30 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm border transition-all shadow-sm ${fav ? "bg-red-500 border-red-400" : "bg-white/80 border-white/60 hover:bg-white"}`}
                      >
                        <Heart className={`h-3.5 w-3.5 transition-all ${fav ? "fill-white text-white" : "text-neutral-500"}`} />
                      </button>
                    </div>

                    <div className="p-3 sm:p-4 space-y-1.5">
                      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-400 truncate">{product.category}</p>
                      <h3 className={`text-xs sm:text-sm font-bold leading-snug line-clamp-2 ${isOut ? "text-neutral-400" : "text-neutral-800"}`}>{product.name}</h3>
                      <div className="flex items-center justify-between pt-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {sticker === "promo" && finalPrice !== null ? (
                            <>
                              <span className="text-[10px] text-neutral-400 line-through">{formatDZD(product.price)}</span>
                              <span className="text-sm font-black text-red-500">{formatDZD(finalPrice)}</span>
                            </>
                          ) : (
                            <span className={`text-xs font-bold ${isOut ? "text-neutral-400" : "text-neutral-700"}`}>{formatDZD(product.price)}</span>
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
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900" dir={isRtl ? "rtl" : "ltr"} style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ─── NAVBAR ─── */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">

          {/* Logo */}
          <div onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer select-none">
    
            <span className="text-sm sm:text-base font-black tracking-[0.08em] text-neutral-900 uppercase">Perfum Guy</span>
          </div>

          {/* Desktop nav — centered */}
          <nav className="hidden lg:flex items-center gap-8">
            {[
              { label: t.nouveautes, href: "#nouveautes", isLink: false },
              { label: t.promo, href: "#promo", isLink: false },
              { label: t.categories, href: "/categories", isLink: true },
            ].map(item => item.isLink ? (
              <Link key={item.label} href={item.href} className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500 hover:text-neutral-900 transition-colors">{item.label}</Link>
            ) : (
              <a key={item.label} href={item.href} className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500 hover:text-neutral-900 transition-colors">{item.label}</a>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Language switcher — visible on all sizes */}
            <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold text-neutral-400">
              {["fr", "en", "ar"].map((l, i) => (
                <React.Fragment key={l}>
                  {i > 0 && <span className="text-neutral-200 mx-0.5">|</span>}
                  <button onClick={() => setLanguage(l as any)} className={`hover:text-neutral-900 transition-colors px-0.5 ${language === l ? "text-neutral-900" : ""}`}>{l.toUpperCase()}</button>
                </React.Fragment>
              ))}
            </div>

            {/* Search */}
            <button onClick={() => setSearchOpen(s => !s)} className="p-2 text-neutral-500 hover:text-neutral-900 transition-colors rounded-lg hover:bg-neutral-100">
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* Admin + Logout — shown when logged in */}
            {currentUser?.role === "admin" && (
              <Link href="/admin" className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors">
                <Shield className="h-3.5 w-3.5" /> Admin
              </Link>
            )}
            {currentUser && (
              <button onClick={logout} className="hidden sm:block p-1.5 text-neutral-400 hover:text-red-500 transition-colors rounded-lg hover:bg-neutral-50">
                <LogOut className="h-4 w-4" />
              </button>
            )}

            {/* Cart */}
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 sm:p-2.5 bg-neutral-900 hover:bg-black text-white rounded-lg transition-colors">
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 sm:h-5 sm:w-5 bg-red-500 text-white text-[9px] sm:text-[10px] font-black rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search bar — slides down on both mobile and desktop */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-neutral-100 overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input autoFocus type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={language === "ar" ? "ابحث عن عطر..." : language === "en" ? "Search a fragrance..." : "Rechercher une fragrance..."} className="w-full pl-10 pr-10 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 text-neutral-800 placeholder-neutral-400 transition-colors" />
                  <button onClick={() => setSearchOpen(false)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden min-h-[94svh] lg:min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        {/* Local background photo */}
        <div className="absolute inset-0">
          <img src="/background.jpg" alt="" className="w-full h-full object-cover" loading="eager" />
        </div>
        {/* Mobile: stronger bottom fade so content stays readable */}
        <div className="absolute inset-0 bg-neutral-950/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/50 via-transparent to-neutral-950/90 lg:hidden" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/85 via-neutral-950/40 to-transparent hidden lg:block" />

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
              {siteSettings?.heroTagline || (language === "ar" ? "عطور فاخرة من باريس" : language === "en" ? "Luxury Fragrances from Paris" : "Maison de Parfumerie · Paris")}
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
                language === "ar" ? "إرجاع 7 أيام" : language === "en" ? "7-day Returns" : "Retour sous 7j",
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
                    <img src={products[0].image} alt={products[0].name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[8px] uppercase tracking-[0.2em] text-white/40 font-bold">{products[0].category}</p>
                    <p className="text-sm font-bold text-white leading-tight mt-0.5 truncate">{products[0].name}</p>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className="h-2 w-2 fill-white/60 text-white/60" />)}
                    </div>
                    <p className="text-xs font-black text-white/90 mt-1">{formatDZD(products[0].price)}</p>
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
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-center lg:text-left mb-5"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50 block mb-1">
                {language === "ar" ? "واجهة المتجر" : language === "en" ? "Store Cards" : "Nos Cartes Produits"}
              </span>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white/85">
                {language === "ar" ? "امثلة على البطاقات" : language === "en" ? "Examples: Hot · Promo · Out of Stock" : "Exemples : Tendance · Promo · Épuisé"}
              </h3>
            </motion.div>

            {/* 3 hardcoded demo cards showing different states */}
            <div 
              className="flex gap-4 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-3 lg:gap-4 lg:items-start snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
            >
              {/* ── CARD 1: HOT / BEST SELLER ── */}
              {(() => {
                const p = (products.filter(x => ["prod-1","prod-2","prod-3"].includes(x.id)).length >= 1
                  ? products.filter(x => ["prod-1","prod-2","prod-3"].includes(x.id))
                  : products.slice(0,3))[0];
                if (!p) return null;
                return (
                  <motion.div
                    key="hero-hot"
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                    whileHover={{ scale: 1.04 }}
                    className="flex-shrink-0 w-[70vw] sm:w-[220px] lg:w-auto snap-center"
                  >
                    <div
                      onClick={() => setSelectedProduct(p)}
                      className="group cursor-pointer bg-white/6 hover:bg-white/12 backdrop-blur-xl border border-white/12 hover:border-white/30 rounded-2xl p-3 transition-all duration-300 shadow-2xl relative overflow-hidden"
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-3">
                        <img src={p.image} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="eager" />
                        {/* HOT sticker */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg shadow-orange-500/40">
                            <Flame className="h-2.5 w-2.5" />
                            {language === "ar" ? "رائج" : language === "en" ? "HOT" : "TENDANCE"}
                          </span>
                          <span className="inline-flex items-center gap-1 bg-white text-neutral-900 text-[8px] font-black px-2 py-0.5 rounded-full">
                            <Star className="h-2 w-2 fill-neutral-900" />
                            {language === "ar" ? "الأكثر مبيعاً" : language === "en" ? "BEST SELLER" : "BEST-SELLER"}
                          </span>
                        </div>
                        <button onClick={e => { e.stopPropagation(); toggleFavorite(p.id, e); }} className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm rounded-full w-7 h-7 flex items-center justify-center border border-white/10">
                          <Heart className={`h-3 w-3 ${isFav(p.id) ? 'fill-red-400 text-red-400' : 'text-white/70'}`} />
                        </button>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-white/50 block">{p.category}</span>
                        <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-white/80 transition-colors">{p.name}</h4>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_,i) => <Star key={i} className={`h-2.5 w-2.5 ${i < Math.floor(p.rating) ? 'fill-white/80 text-white/80' : 'text-white/20'}`} />)}
                          <span className="text-[9px] text-white/50 font-bold ml-1">{p.rating}</span>
                        </div>
                        <div className="pt-1.5 flex items-center justify-between">
                          <span className="text-xs font-bold text-white/90">{formatDZD(p.price)}</span>
                          <span className="text-[9px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-400/30 px-2 py-0.5 rounded-md">
                            {language === "ar" ? "أضف" : language === "en" ? "Buy" : "Acheter"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}

              {/* ── CARD 2: PROMO / SALE ── */}
              {(() => {
                const all = (products.filter(x => ["prod-1","prod-2","prod-3"].includes(x.id)).length >= 2
                  ? products.filter(x => ["prod-1","prod-2","prod-3"].includes(x.id))
                  : products.slice(0,3));
                const p = all[1];
                if (!p) return null;
                const salePercent = 20;
                const salePrice = p.price * (1 - salePercent / 100);
                return (
                  <motion.div
                    key="hero-promo"
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.35 }}
                    whileHover={{ scale: 1.04 }}
                    className="flex-shrink-0 w-[70vw] sm:w-[220px] lg:w-auto snap-center"
                  >
                    <div
                      onClick={() => setSelectedProduct(p)}
                      className="group cursor-pointer bg-white/6 hover:bg-white/12 backdrop-blur-xl border border-red-400/30 hover:border-red-400/70 rounded-2xl p-3 transition-all duration-300 shadow-2xl relative overflow-hidden"
                    >
                      {/* Promo glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
                      {/* Image */}
                      <div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-3">
                        <img src={p.image} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="eager" />
                        {/* SALE sticker */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-red-500/50">
                            <Tag className="h-2.5 w-2.5" />
                            SALE -{salePercent}%
                          </span>
                          <span className="bg-white text-red-600 text-[8px] font-black px-2 py-0.5 rounded-full">
                            {language === "ar" ? "عرض محدود" : language === "en" ? "LIMITED OFFER" : "OFFRE LIMITÉE"}
                          </span>
                        </div>
                        <button onClick={e => { e.stopPropagation(); toggleFavorite(p.id, e); }} className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm rounded-full w-7 h-7 flex items-center justify-center border border-white/10">
                          <Heart className={`h-3 w-3 ${isFav(p.id) ? 'fill-red-400 text-red-400' : 'text-white/70'}`} />
                        </button>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-red-300 block">{p.category}</span>
                        <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-red-200 transition-colors">{p.name}</h4>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_,i) => <Star key={i} className={`h-2.5 w-2.5 ${i < Math.floor(p.rating) ? 'fill-white/80 text-white/80' : 'text-white/20'}`} />)}
                          <span className="text-[9px] text-white/50 font-bold ml-1">{p.rating}</span>
                        </div>
                        <div className="pt-1.5 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-white/35 line-through">{formatDZD(p.price)}</span>
                            <span className="text-xs font-black text-red-400">{formatDZD(salePrice)}</span>
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-400/40 px-2 py-0.5 rounded-md">
                            {language === "ar" ? "اشتري" : language === "en" ? "Buy" : "Acheter"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}

              {/* ── CARD 3: OUT OF STOCK ── */}
              {(() => {
                const all = (products.filter(x => ["prod-1","prod-2","prod-3"].includes(x.id)).length >= 3
                  ? products.filter(x => ["prod-1","prod-2","prod-3"].includes(x.id))
                  : products.slice(0,3));
                const p = all[2];
                if (!p) return null;
                return (
                  <motion.div
                    key="hero-oos"
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
                    whileHover={{ scale: 1.02 }}
                    className="flex-shrink-0 w-[70vw] sm:w-[220px] lg:w-auto snap-center"
                  >
                    <div
                      className="cursor-not-allowed bg-white/4 backdrop-blur-xl border border-white/8 rounded-2xl p-3 shadow-2xl relative overflow-hidden"
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-3">
                        <img src={p.image} alt={p.name} className="h-full w-full object-cover grayscale opacity-50" loading="eager" />
                        {/* Out of stock overlay */}
                        <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-[1px] flex flex-col items-center justify-center gap-2">
                          <div className="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center mb-1">
                            <X className="h-5 w-5 text-white/50" />
                          </div>
                          <span className="text-white text-[9px] font-black uppercase tracking-[0.2em] border border-white/20 px-3 py-1.5 rounded-full bg-white/5">
                            {language === "ar" ? "نفذ" : language === "en" ? "OUT OF STOCK" : "ÉPUISÉ"}
                          </span>
                        </div>
                        {/* OOS sticker top */}
                        <div className="absolute top-2 left-2">
                          <span className="bg-neutral-700 text-neutral-300 text-[8px] font-black px-2 py-1 rounded-full border border-neutral-600">
                            {language === "ar" ? "غير متوفر" : language === "en" ? "UNAVAILABLE" : "INDISPONIBLE"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1 opacity-50">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-400 block">{p.category}</span>
                        <h4 className="text-xs sm:text-sm font-bold text-neutral-400 line-clamp-1">{p.name}</h4>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_,i) => <Star key={i} className="h-2.5 w-2.5 text-white/10" />)}
                        </div>
                        <div className="pt-1.5 flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-500">{formatDZD(p.price)}</span>
                          <span className="text-[9px] font-black uppercase tracking-wider bg-neutral-700/40 text-neutral-500 border border-neutral-600/30 px-2 py-0.5 rounded-md">
                            {language === "ar" ? "نفذ" : language === "en" ? "N/A" : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}
            </div>
          </div>

        </div>
      </section>

      {/* ─── BRAND LOGO CAROUSEL ─── */}
      <section className="border-y border-neutral-100 bg-white py-5 overflow-hidden">
        <div className="flex w-full overflow-hidden">
          <div className="flex items-center gap-10 whitespace-nowrap animate-marquee">
            {[...brands, ...brands].map((brand, i) => (
              <Link key={i} href="/categories" className="shrink-0 group flex items-center justify-center px-3">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-10 sm:h-12 max-w-28 object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ mixBlendMode: "multiply" }}
                  loading="lazy"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <main className="relative bg-white overflow-hidden">

        {/* ── SCATTERED PARFUM IMAGES — tiled pattern that repeats as page grows ── */}
        {Array.from({ length: TILE_REPEATS }).flatMap((_, tile) =>
          SCATTERED_TILE.map((item, i) => {
            const isLeft = item.left !== undefined;
            const nudge = isLeft ? "18%" : "-18%";
            return (
              <div
                key={`${tile}-${i}`}
                className="absolute pointer-events-none"
                style={{
                  top: `${tile * TILE_H + item.topPx}px`,
                  ...(isLeft ? { left: item.left } : { right: item.right }),
                  width: `${item.w}px`,
                  height: `${Math.round(item.w * 1.5)}px`,
                  transform: `rotate(${item.rot}deg) translateX(${nudge})`,
                  opacity: item.op,
                  zIndex: 0,
                  mixBlendMode: "multiply",
                }}
            >
              <img src={item.src} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
          );
        })
        )}

        {/* New Arrivals grid */}
        {renderProductGrid(
          t.nouveautes,
          t.dernieresCreations,
          products.slice(0, 8),
          "new",
          "nouveautes"
        )}

        {/* Promo grid */}
        {renderProductGrid(
          t.promo,
          language === "ar" ? "تخفيضات وعروض حصرية" : language === "en" ? "Exclusive Offers" : "Nos Offres Spéciales",
          products.filter(p => (p.discountPercent ?? 0) > 0),
          "promo",
          "promo"
        )}

        {/* ─── NOTRE HISTOIRE ─── */}
        <section id="about" className="relative z-[1] py-12 sm:py-20 px-4 sm:px-6 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-center">
            <div className="space-y-6 order-2 lg:order-1">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-500">{t.notreHistoire}</span>
                <h2 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight leading-tight">
                  {t.excellenceFrancaise}<br />
                  <span className="font-light italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>de la parfumrie </span>
                </h2>
              </div>
              <div className="h-px w-12 bg-neutral-200" />
              <div className="space-y-4 text-sm text-neutral-500 leading-relaxed max-w-lg">
               Bienvenue chez Parfum Guy, une boutique indépendante née d'une véritable passion pour l'univers des fragrances.

Mon but est simple : dénicher pour vous les meilleurs parfums du moment et vous proposer une sélection rigoureuse de créations olfactives de qualité. Ici, pas de chichis, juste une alliance parfaite entre les grands classiques de la parfumerie et les dernières tendances modernes.

Mon Engagement
Je ne fabrique pas les parfums, mais je passe mon temps à tester, comparer et sélectionner les flacons les plus performants du marché pour vous les proposer au juste prix.

Sélection rigoureuse : Des parfums choisis un par un pour leur excellente tenue et leur sillage.

Authenticité : Des produits fiables, sélectionnés avec soin auprès de fournisseurs de confiance.

Conseil de passionné : Une approche simple et transparente pour vous aider à trouver votre signature olfactive.

Ma philosophie : Vous rendre accessible le meilleur de la parfumerie actuelle, avec la transparence et la passion d'un indépendant.
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
              <div className="rounded-2xl sm:rounded-3xl overflow-hidden aspect-16/10 sm:aspect-4/5">
                
              </div>
              {/* Badge — hidden on mobile to avoid overflow */}
              <div className="hidden sm:block absolute -bottom-5 -left-5 bg-white border border-neutral-200 rounded-2xl px-5 py-3 shadow-xl">
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold">{t.depuis2009}</p>
               
              </div>
              {/* Mobile badge — inside the image, no overflow */}
              <div className="sm:hidden absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm border border-neutral-200/60 rounded-xl px-3 py-2 shadow-md">
                <p className="text-[9px] uppercase tracking-[0.15em] text-neutral-400 font-bold">{t.depuis2009}</p>
              
              </div>
            </div>
          </div>
        </section>

        {/* ─── CONTACT ─── */}
        <section id="contact" className="py-12 sm:py-20 px-4 sm:px-6 bg-neutral-900 text-white">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/60">{t.uneQuestion}</span>
              <h2 className="text-2xl sm:text-4xl font-black">{t.contactezNous}</h2>
            </div>
            <div className="h-px w-12 bg-white/10 mx-auto" />
            <p className="text-sm text-white/60 leading-relaxed">{t.contactDesc}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="mailto:contact@perfumguy.com" className="inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-sm px-8 py-4 rounded-2xl transition-all">
                <Mail className="h-4 w-4" />
                {t.contactFormBtn}
              </a>
              <a href="https://wa.me/213000000000" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm px-8 py-4 rounded-2xl transition-all">
                <MessageSquare className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="bg-neutral-950 text-white border-t border-white/5 pt-14 sm:pt-16 pb-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10 pb-10 border-b border-white/8">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="text-sm font-black tracking-widest uppercase block">Perfum Guy</span>
                  <span className="text-[9px] text-white/25 uppercase tracking-widest">Luxury Fragrances</span>
                </div>
              </div>
              <p className="text-xs text-white/35 leading-relaxed max-w-[220px]">
                {language === "ar" ? "دار عطور فاخرة متخصصة في العطور الأصيلة المختارة من باريس." : language === "en" ? "A luxury perfume house specializing in authentic fragrances curated from Paris." : "Une maison de parfumerie de luxe spécialisée dans les fragrances authentiques de Paris."}
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
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">Contact</h4>
              <div className="space-y-3">
                <a href="mailto:contact@perfumguy.com" className="flex items-center gap-2 text-xs text-white/35 hover:text-white/70 transition-colors">
                  <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                  contact@perfumguy.com
                </a>
                <a href="https://wa.me/213000000000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-white/35 hover:text-white/70 transition-colors">
                  <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
                  WhatsApp +213 000 000 000
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6">
            <p className="text-[10px] text-white/20 font-medium">
              &copy; {new Date().getFullYear()} Perfum Guy. {t.rightsReserved}
            </p>
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
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      <MobileBottomNav onCartOpen={() => setIsCartOpen(true)} />

      {/* Bottom padding for mobile nav */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}
