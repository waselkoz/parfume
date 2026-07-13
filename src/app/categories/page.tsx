"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useApp, Brand, Product } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { translations } from "@/lib/translations";
import { CartDrawer } from "@/components/CartDrawer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { fuzzySearch } from "@/lib/fuzzy";
import {
  Search, X, Grid3X3, LayoutGrid, Layout,
  Flower2, Gem, Star, Crown, Flame, Sparkles, TrendingUp, Award, Heart,
  Filter, Zap, Trophy, Tag,
} from "lucide-react";

type GridSize = "2x2" | "4x4" | "6x6";
type SortOption = "default" | "price-asc" | "price-desc" | "name" | "rating" | "newest";
type GenderFilter = "all" | "homme" | "femme" | "mixte";

const formatDZD = (price: number) => Math.round(price).toLocaleString("fr-FR") + " DA";

const gridConfig: Record<GridSize, { cols: string; gap: string }> = {
  "2x2": { cols: "grid-cols-2", gap: "gap-5 sm:gap-6" },
  "4x4": { cols: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4", gap: "gap-5 sm:gap-6" },
  "6x6": { cols: "grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6", gap: "gap-3 sm:gap-4" },
};

const SECONDARY_IMAGES: Record<string, string> = {
  "prod-1": "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=400",
  "prod-2": "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=400",
  "prod-3": "https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=400",
  "prod-4": "https://images.unsplash.com/photo-1557170330-1b13ae914f44?q=80&w=400",
  "prod-5": "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=400",
};

interface CategoryTheme {
  pageBg: string; heroBg: string; heroAccent: string;
  accent: string; accentRgb: string; softBg: string;
  heroText: string; heroSub: string; isDark: boolean;
  bannerImg: string; tagline: { fr: string; en: string; ar: string };
}

const THEMES: Record<string, CategoryTheme> = {
  default: {
    pageBg: "#fafaf8", heroBg: "#1a1a1a", heroAccent: "#2d2d2d",
    accent: "#171717", accentRgb: "23,23,23", softBg: "#f0f0ee",
    heroText: "#ffffff", heroSub: "rgba(255,255,255,0.50)", isDark: false,
    bannerImg: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1400&auto=format&fit=crop",
    tagline: { fr: "Toute la collection", en: "The full collection", ar: "المجموعة الكاملة" },
  },
  "pour-femme": {
    pageBg: "#fff8fa", heroBg: "#3b0620", heroAccent: "#9d174d",
    accent: "#be185d", accentRgb: "190,24,93", softBg: "#fce7f3",
    heroText: "#fff1f5", heroSub: "rgba(255,228,235,0.70)", isDark: false,
    bannerImg: "/categories-bg/femme.png",
    tagline: { fr: "Pétales de rose & douceur infinie — la féminité en fleur", en: "Rose petals & infinite softness — femininity in bloom", ar: "بتلات الورد والأنوثة في ازدهار" },
  },
  "pour-homme": {
    pageBg: "#f2f4f8", heroBg: "#060912", heroAccent: "#0f1f40",
    accent: "#1d3461", accentRgb: "29,52,97", softBg: "#dde3f0",
    heroText: "#e8edf8", heroSub: "rgba(200,215,240,0.65)", isDark: false,
    bannerImg: "/categories-bg/homme.png",
    tagline: { fr: "Bois brûlé, cuir & caractère — la virilité comme signature", en: "Burnt wood, leather & character — virility as a signature", ar: "الخشب المحروق والجلد والشخصية — الرجولة كبصمة" },
  },
  niche: {
    pageBg: "#fdf9f3", heroBg: "#1c0e02", heroAccent: "#78340f",
    accent: "#92400e", accentRgb: "146,64,14", softBg: "#fef3c7",
    heroText: "#fef3e2", heroSub: "rgba(254,235,200,0.65)", isDark: false,
    bannerImg: "/categories-bg/niche.png",
    tagline: { fr: "Olfaction d'auteur — des matières premières d'exception", en: "Artisan olfaction — exceptional raw materials", ar: "عطور فنية من مواد نادرة" },
  },
  top: {
    pageBg: "#f1faf5", heroBg: "#021a0c", heroAccent: "#064e2b",
    accent: "#065f46", accentRgb: "6,95,70", softBg: "#d1fae5",
    heroText: "#ecfdf5", heroSub: "rgba(209,250,229,0.65)", isDark: false,
    bannerImg: "/categories-bg/top.png",
    tagline: { fr: "Les fragrances plébiscitées — choix de la clientèle", en: "The acclaimed fragrances — chosen by clients", ar: "العطور الأكثر إقبالاً من قِبل العملاء" },
  },
  nouveautes: {
    pageBg: "#f8f6ff", heroBg: "#1a0538", heroAccent: "#5b21b6",
    accent: "#7c3aed", accentRgb: "124,58,237", softBg: "#ede9fe",
    heroText: "#f5f0ff", heroSub: "rgba(237,233,254,0.65)", isDark: false,
    bannerImg: "/categories-bg/new.png",
    tagline: { fr: "Fraîchement arrivés — les créations de la saison", en: "Just arrived — the season's new creations", ar: "وصل حديثاً — إبداعات الموسم الجديدة" },
  },
  exclusif: {
    pageBg: "#0c0c0c", heroBg: "#000000", heroAccent: "#111007",
    accent: "#b8973a", accentRgb: "184,151,58", softBg: "#1c1a14",
    heroText: "#fef9ee", heroSub: "rgba(254,243,210,0.55)", isDark: true,
    bannerImg: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1400&auto=format&fit=crop",
    tagline: { fr: "Éditions numérotées — le privilège du rare", en: "Numbered editions — the privilege of the rare", ar: "إصدارات محدودة — امتياز النادر" },
  },
  promo: {
    pageBg: "#fff5f5", heroBg: "#450a0a", heroAccent: "#991b1b",
    accent: "#dc2626", accentRgb: "220,38,38", softBg: "#fef2f2",
    heroText: "#fef2f2", heroSub: "rgba(254,242,242,0.65)", isDark: true,
    bannerImg: "/categories-bg/promo.png",
    tagline: { fr: "Offres exceptionnelles — à ne pas rater", en: "Exceptional offers — don't miss out", ar: "عروض استثنائية — لا تفوتها" },
  },
};

const getCategoryIcon = (iconName?: string) => {
  switch (iconName) {
    case "Crown": return Crown; case "Flower2": return Flower2;
    case "Gem": return Gem; case "Flame": return Flame;
    case "Sparkles": return Sparkles; default: return Tag;
  }
};

export function CategoriesPageContent() {
  const { products, categories, brands, cart, language, favorites, toggleFavorite } = useApp();
  const t = translations[language] || translations.fr;
  const isRtl = language === "ar";

  const allCategories = useMemo(() => {
    const adminCats = categories.map(c => ({ id: c.id, name: c.name, icon: getCategoryIcon(c.icon), description: c.description }));
    const defaults = [
      { id: "pour-femme", name: t.pourFemme, icon: Flower2, description: t.fragrancesFeminines },
      { id: "pour-homme", name: t.pourHomme, icon: Crown, description: t.parfumsMasculins },
      { id: "niche", name: t.niche, icon: Gem, description: t.creationsRares },
      { id: "top", name: t.topVentes, icon: TrendingUp, description: t.bestSellers },
      { id: "nouveautes", name: t.nouveautes, icon: Sparkles, description: t.dernieresCreationsDesc },
      { id: "promo", name: language === "ar" ? "تخفيضات" : language === "en" ? "Sale" : "Promo", icon: Tag, description: language === "ar" ? "عروض حصرية" : language === "en" ? "Exclusive Offers" : "Offres Exclusives" },
      { id: "exclusif", name: t.editionsLimitees, icon: Award, description: t.piecesRares },
    ];
    const combined = [...defaults];
    const hiddenCats = ["oud & wood", "floral elixirs", "fresh citrus"];
    adminCats.forEach(ac => { 
      if (!hiddenCats.includes(ac.name.toLowerCase()) && !combined.find(dc => dc.name.toLowerCase() === ac.name.toLowerCase())) {
        combined.push(ac); 
      }
    });
    return combined;
  }, [categories, t, language]);

  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || null;
  const initialBrand = searchParams.get("brand") || null;
  const initialPromo = searchParams.get("promo") === "true";

  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory);
  const [gridSize, setGridSize] = useState<GridSize>("4x4");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialBrand ? [initialBrand] : []);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [promoOnly, setPromoOnly] = useState(initialPromo);
  const [selectedOlfactory, setSelectedOlfactory] = useState<string[]>([]);
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const theme = THEMES[activeCategory || "default"] || THEMES.default;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    let keys: string[] = [];
    const code = ["a", "d", "m", "i", "n"];
    const onKey = (e: KeyboardEvent) => {
      keys.push(e.key.toLowerCase());
      keys = keys.slice(-code.length);
      if (JSON.stringify(keys) === JSON.stringify(code)) window.location.href = "/admin";
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const topRated = useMemo(() => [...products].sort((a, b) => b.rating - a.rating).slice(0, 3), [products]);

  const isRegex = useMemo(() => {
    if (!searchQuery || !/[.*+?^${}()|[\]\\]/.test(searchQuery)) return false;
    try { new RegExp(searchQuery); return true; } catch { return false; }
  }, [searchQuery]);

  const filteredProducts = useMemo(() => {
    let f = [...products];
    if (activeCategory) {
      if (activeCategory === "pour-femme") {
        f = f.filter(p => {
          const txt = `${p.category} ${p.name} ${p.description}`.toLowerCase();
          return txt.includes("femme") || txt.includes("woman") || txt.includes("women");
        });
      } else if (activeCategory === "pour-homme") {
        f = f.filter(p => {
          const txt = `${p.category} ${p.name} ${p.description}`.toLowerCase();
          return txt.includes("homme") || txt.includes("man") || txt.includes("men");
        });
      } else if (activeCategory === "niche") {
        f = f.filter(p => {
          const txt = `${p.category} ${p.name} ${p.description}`.toLowerCase();
          return txt.includes("niche");
        });
      } else if (activeCategory === "top") {
        f = f.filter(p => p.rating >= 4.8 || p.isBestSeller);
      } else if (activeCategory === "nouveautes") {
        f = f.filter((p, idx) => idx < 8);
      } else if (activeCategory === "exclusif") {
        f = f.filter(p => (p.discountPercent ?? 0) > 0);
      } else if (activeCategory === "promo") {
        f = f.filter(p => (p.discountPercent ?? 0) > 0);
      } else {
        const cat = allCategories.find(c => c.id === activeCategory);
        if (cat) {
          f = f.filter(p => {
            const productCategories = (p.category || "").split(',').map(s => s.trim().toLowerCase());
            return productCategories.includes(cat.name.toLowerCase());
          });
        }
      }
    }

    if (searchQuery) {
      f = f.filter(p => 
        fuzzySearch(p.name, searchQuery) || 
        fuzzySearch(p.description, searchQuery) || 
        fuzzySearch(p.category ?? "", searchQuery) || 
        fuzzySearch(p.brand ?? "", searchQuery)
      );
    }

    if (selectedBrands.length > 0) f = f.filter(p => selectedBrands.includes(p.brand || ""));
    f = f.filter(p => { const d = (p.variants?.[0]?.price || 0); return d >= priceRange[0] && d <= priceRange[1]; });
    if (minRating > 0) f = f.filter(p => p.rating >= minRating);
    if (inStockOnly) f = f.filter(p => (p.variants || []).some(v => v.stock > 0));
    if (promoOnly) f = f.filter(p => (p.discountPercent ?? 0) > 0);
    if (selectedSizes.length > 0) f = f.filter(p => selectedSizes.some(s => (p.variants?.find(v => v.size === s)?.stock || 0) > 0));
    if (genderFilter !== "all") {
      f = f.filter(p => {
        const txt = `${p.category} ${p.name}`.toLowerCase();
        if (genderFilter === "femme") return txt.includes("femme") || txt.includes("woman");
        if (genderFilter === "homme") return txt.includes("homme") || txt.includes("man");
        if (genderFilter === "mixte") return txt.includes("mixte") || txt.includes("unisex");
        return true;
      });
    }
    if (selectedOlfactory.length > 0) {
      f = f.filter(p => { const txt = `${p.name} ${p.description}`.toLowerCase(); return selectedOlfactory.some(o => txt.includes(o)); });
    }
    switch (sortBy) {
      case "price-asc": f.sort((a, b) => (a.variants?.[0]?.price || 0) - (b.variants?.[0]?.price || 0)); break;
      case "price-desc": f.sort((a, b) => (b.variants?.[0]?.price || 0) - (a.variants?.[0]?.price || 0)); break;
      case "name": f.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "rating": f.sort((a, b) => b.rating - a.rating); break;
      case "newest": f.reverse(); break;
    }
    return f;
  }, [products, activeCategory, searchQuery, selectedBrands, priceRange, sortBy, minRating, inStockOnly, promoOnly, selectedSizes, genderFilter, selectedOlfactory, allCategories]);

  const toggleBrand = (b: string) => setSelectedBrands(p => p.includes(b) ? p.filter(x => x !== b) : [...p, b]);
  const clearAll = () => { setActiveCategory(null); setSelectedBrands([]); setPriceRange([0, 100000]); setSearchQuery(""); setSortBy("default"); setMinRating(0); setInStockOnly(false); setPromoOnly(false); setSelectedOlfactory([]); setGenderFilter("all"); setSelectedSizes([]); };

  const activeFiltersCount = [activeCategory !== null, selectedBrands.length > 0, priceRange[0] > 0 || priceRange[1] < 100000, minRating > 0, inStockOnly, promoOnly, selectedOlfactory.length > 0, genderFilter !== "all", selectedSizes.length > 0, searchQuery !== ""].filter(Boolean).length;
  const hasActiveFilters = activeFiltersCount > 0;
  const activeCategoryData = allCategories.find(c => c.id === activeCategory);

  const card = theme.isDark ? "bg-white/5 border-white/10" : "bg-white border-neutral-200 shadow-sm";
  const txt = theme.isDark ? "text-white/80" : "text-neutral-800";
  const sub = theme.isDark ? "text-white/40" : "text-neutral-400";
  const inp = theme.isDark ? "bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-white/30" : "bg-neutral-50 border-neutral-200 text-neutral-800 placeholder-neutral-400 focus:border-neutral-400";
  const stripBg = theme.isDark ? "bg-black/90 border-white/10" : "bg-white/90 border-neutral-200";

  return (
    <motion.div className="min-h-screen font-sans pb-16 lg:pb-0" animate={{ backgroundColor: theme.pageBg }} transition={{ duration: 0.5 }} dir={isRtl ? "rtl" : "ltr"}>


      {/* HERO BANNER */}
      <div className="relative overflow-hidden h-52 sm:h-72">
        <motion.div className="absolute inset-0" animate={{ backgroundColor: theme.heroBg }} transition={{ duration: 0.6 }} style={{ opacity: 0.6 }} />
        <AnimatePresence mode="wait">
          <motion.img key={activeCategory || "default"} src={theme.bannerImg} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.65 }} initial={{ scale: 1.08, opacity: 0 }} animate={{ scale: 1, opacity: 0.65 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }} />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.7)] via-[rgba(0,0,0,0.3)] to-[rgba(0,0,0,0.1)] pointer-events-none" />

        {/* Pour Femme — rose petals */}
        <AnimatePresence>
          {activeCategory === "pour-femme" && (
            <motion.svg key="femme-deco" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice">
              {[{cx:680,cy:40,rx:38,ry:18,rot:-35},{cx:710,cy:80,rx:30,ry:14,rot:20},{cx:640,cy:110,rx:42,ry:20,rot:-55},{cx:730,cy:150,rx:28,ry:13,rot:45},{cx:600,cy:60,rx:22,ry:10,rot:10},{cx:760,cy:220,rx:35,ry:16,rot:-20},{cx:620,cy:200,rx:26,ry:12,rot:60},{cx:680,cy:260,rx:32,ry:15,rot:-40},{cx:560,cy:150,rx:18,ry:8,rot:30},{cx:790,cy:100,rx:20,ry:9,rot:-15}].map((p,i)=>(
                <ellipse key={i} cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} fill="rgba(255,180,200,0.18)" transform={`rotate(${p.rot} ${p.cx} ${p.cy})`} />
              ))}
            </motion.svg>
          )}
        </AnimatePresence>

        {/* Pour Homme — angular geometry */}
        <AnimatePresence>
          {activeCategory === "pour-homme" && (
            <motion.svg key="homme-deco" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice">
              {[0,1,2,3,4,5,6].map(i=><line key={`d-${i}`} x1={500+i*50} y1={0} x2={300+i*50} y2={300} stroke="rgba(150,180,255,0.10)" strokeWidth="1"/>)}
              {[0,1,2,3].map(i=><line key={`h-${i}`} x1={480} y1={i*100} x2={800} y2={i*100+30} stroke="rgba(150,180,255,0.07)" strokeWidth="1"/>)}
              <rect x="580" y="30" width="180" height="180" fill="none" stroke="rgba(150,180,255,0.08)" strokeWidth="1" transform="rotate(15 670 120)" />
              <rect x="620" y="60" width="120" height="120" fill="none" stroke="rgba(150,180,255,0.06)" strokeWidth="1" transform="rotate(15 680 120)" />
            </motion.svg>
          )}
        </AnimatePresence>

        {/* Niche — concentric rings */}
        <AnimatePresence>
          {activeCategory === "niche" && (
            <motion.svg key="niche-deco" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice">
              <circle cx="680" cy="150" r="120" fill="none" stroke="rgba(255,210,140,0.12)" strokeWidth="1"/>
              <circle cx="680" cy="150" r="90"  fill="none" stroke="rgba(255,210,140,0.10)" strokeWidth="1"/>
              <circle cx="680" cy="150" r="60"  fill="none" stroke="rgba(255,210,140,0.08)" strokeWidth="1"/>
              <circle cx="680" cy="150" r="30"  fill="rgba(255,210,140,0.06)"/>
              <circle cx="750" cy="60"  r="50"  fill="none" stroke="rgba(255,210,140,0.07)" strokeWidth="1"/>
            </motion.svg>
          )}
        </AnimatePresence>

        {/* Exclusif — gold diamonds */}
        <AnimatePresence>
          {activeCategory === "exclusif" && (
            <motion.svg key="excl-deco" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice">
              {[0,1,2,3,4].map(i=>[0,1,2].map(j=>(
                <polygon key={`${i}-${j}`} points={`${580+i*55},${60+j*100} ${607+i*55},${100+j*100} ${580+i*55},${140+j*100} ${553+i*55},${100+j*100}`} fill="none" stroke="rgba(220,190,100,0.12)" strokeWidth="0.8"/>
              )))}
            </motion.svg>
          )}
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        <div className="relative h-full flex items-center mx-auto max-w-[1400px] px-6 sm:px-10 z-10">
          <div className="flex items-center justify-between w-full gap-6">
            <div>
              <AnimatePresence mode="wait">
                <motion.p key={`sub-${activeCategory}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[9px] font-bold uppercase tracking-[0.4em] mb-2" style={{ color: theme.heroSub }}>
                  {language === "ar" ? "عطور فاخرة • Perfum Guy" : language === "en" ? "Luxury Fragrances • Perfum Guy" : "Parfums de Luxe • Perfum Guy"}
                </motion.p>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.h1 key={`h1-${activeCategory}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.05 }} className="font-sans font-black text-3xl sm:text-5xl tracking-tight leading-tight" style={{ color: theme.heroText }}>
                  {activeCategoryData ? activeCategoryData.name : (language === "ar" ? "كل المجموعات" : language === "en" ? "All Fragrances" : "Toutes les Fragrances")}
                </motion.h1>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.p key={`tag-${activeCategory}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.1 }} className="mt-2 text-sm font-medium max-w-md" style={{ color: theme.heroSub }}>
                  {activeCategoryData?.id && !THEMES[activeCategoryData.id] ? activeCategoryData.description : (theme.tagline[language] || theme.tagline.fr)}
                </motion.p>
              </AnimatePresence>
            </div>
            <motion.div key={`count-${activeCategory}`} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} className="hidden sm:flex flex-col items-center flex-shrink-0 px-8 py-5 rounded-2xl border backdrop-blur-sm" style={{ borderColor: "rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.07)" }}>
              <span className="text-4xl font-black" style={{ color: theme.heroText }}>{filteredProducts.length}</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] mt-1" style={{ color: theme.heroSub }}>{language === "ar" ? "عطر" : language === "en" ? "Items" : "Fragrances"}</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CATEGORY STRIP */}
      <div className={`sticky top-14 z-30 border-b overflow-x-auto transition-colors duration-500 ${stripBg} backdrop-blur-xl`} style={{ scrollbarWidth: "none" }}>
        <div className="flex items-center gap-2 px-4 sm:px-10 py-3 min-w-max">
          <button onClick={() => setActiveCategory(null)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] border transition-all duration-300 ${!activeCategory ? "text-white shadow-md" : theme.isDark ? "border-white/10 text-white/50 hover:text-white" : "border-neutral-200 text-neutral-500 hover:text-neutral-800"}`}
            style={!activeCategory ? { backgroundColor: theme.accent, borderColor: theme.accent } : {}}>
            <Sparkles className="h-3 w-3" />
            {language === "ar" ? "الكل" : language === "en" ? "All" : "Tout"}
          </button>
          {allCategories.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            const catTheme = THEMES[cat.id] || THEMES.default;
            return (
              <motion.button key={cat.id} onClick={() => setActiveCategory(isActive ? null : cat.id)} whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] border transition-all duration-300 ${isActive ? "text-white shadow-md" : theme.isDark ? "border-white/10 text-white/50 hover:text-white" : "border-neutral-200 text-neutral-500 hover:text-neutral-800"}`}
                style={isActive ? { backgroundColor: catTheme.accent, borderColor: catTheme.accent } : {}}>
                <Icon className="h-3 w-3" />{cat.name}
              </motion.button>
            );
          })}
        </div>
      </div>

      <main className="mx-auto max-w-[1400px] px-4 sm:px-10 py-8">
        <div className="flex gap-8 xl:gap-10">

          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:block w-[260px] flex-shrink-0">
            <div className="sticky top-[170px] space-y-4 max-h-[calc(100vh-190px)] overflow-y-auto pr-1" style={{ scrollbarWidth: "none" }}>

              {/* Search */}
              <div className={`rounded-2xl p-4 border transition-colors duration-500 ${card}`}>
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${sub}`} />
                  <input type="text" placeholder={t.rechercherFragrance} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-8 py-2.5 text-[11px] font-medium rounded-xl border focus:outline-none transition-colors ${inp}`} />
                  {searchQuery && <button onClick={() => setSearchQuery("")} className={`absolute right-3 top-1/2 -translate-y-1/2 ${sub}`}><X className="h-4 w-4" /></button>}
                </div>
                {isRegex && (
                  <p className="mt-1.5 text-[9px] font-bold uppercase tracking-wider" style={{ color: theme.accent }}>
                    {language === "ar" ? "وضع Regex" : language === "en" ? "Regex mode" : "Mode Regex"}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className={`rounded-2xl p-4 border transition-colors duration-500 ${card}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`text-[10px] font-bold uppercase tracking-[0.2em] ${sub}`}>{t.budget}</h4>
                  <Zap className="h-3.5 w-3.5" style={{ color: theme.accent }} />
                </div>
                <div className={`flex items-baseline gap-2 mb-3 text-xs font-bold ${txt}`}>
                  <span>{priceRange[0].toLocaleString("fr-FR")} DA</span>
                  <span className="opacity-30">—</span>
                  <span>{priceRange[1].toLocaleString("fr-FR")} DA</span>
                </div>
                <div className="relative h-6 mb-3 flex items-center w-full">
                  <input type="range" min={0} max={100000} step={1000} value={priceRange[0]} onChange={e => setPriceRange([Math.min(parseInt(e.target.value), priceRange[1]), priceRange[1]])} className="absolute w-full h-1.5 rounded-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neutral-800 z-20 cursor-pointer" />
                  <input type="range" min={0} max={100000} step={1000} value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], Math.max(parseInt(e.target.value), priceRange[0])])} className="absolute w-full h-1.5 rounded-full appearance-none bg-neutral-200 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neutral-800 z-10 cursor-pointer" />
                  <div className="absolute h-1.5 rounded-full pointer-events-none z-10" style={{ backgroundColor: theme.accent, left: `${(priceRange[0] / 100000) * 100}%`, right: `${100 - (priceRange[1] / 100000) * 100}%` }} />
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[{ l: "<10k", r: [0, 10000] }, { l: "10-25k", r: [10000, 25000] }, { l: "25-50k", r: [25000, 50000] }, { l: "50-75k", r: [50000, 75000] }, { l: "75k+", r: [75000, 100000] }, { l: t.budgetAll, r: [0, 100000] }].map(p => {
                    const on = priceRange[0] === p.r[0] && priceRange[1] === p.r[1];
                    return <button key={p.l} onClick={() => setPriceRange(p.r as [number, number])} className={`text-[9px] font-bold py-1.5 rounded-lg border transition-all ${on ? "text-white" : theme.isDark ? "border-white/10 text-white/40" : "border-neutral-200 text-neutral-400"}`} style={on ? { backgroundColor: theme.accent, borderColor: theme.accent } : {}}>{p.l}</button>;
                  })}
                </div>
              </div>

              {/* Brands */}
              {brands.length > 0 && (
                <div className={`rounded-2xl p-4 border transition-colors duration-500 ${card}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`text-[10px] font-bold uppercase tracking-[0.2em] ${sub}`}>{t.marques}</h4>
                    {selectedBrands.length > 0 && <button onClick={() => setSelectedBrands([])} className="text-[9px] text-red-400 font-medium">{language === "ar" ? "مسح" : language === "en" ? "Clear" : "Effacer"}</button>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {brands.map((brand: Brand) => {
                      const on = selectedBrands.includes(brand.name);
                      return (
                        <button key={brand.id} onClick={() => toggleBrand(brand.name)} title={brand.name}
                          className={`relative h-14 rounded-xl border-2 transition-all flex items-center justify-center p-2 bg-white ${on ? "border-neutral-900 shadow-sm ring-1 ring-neutral-900" : "border-neutral-200 hover:border-neutral-400"}`}>
                          <img src={brand.logo} alt={brand.name} className="max-h-9 max-w-full object-contain" style={{ mixBlendMode: "multiply" }} />
                          {on && <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-neutral-900" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Top Rated */}
              <div className={`rounded-2xl p-4 border transition-colors duration-500 ${card}`}>
                <div className="flex items-center gap-2 mb-3"><Trophy className="h-4 w-4 text-neutral-500" /><h4 className={`text-[10px] font-bold uppercase tracking-[0.2em] ${sub}`}>{language === "ar" ? "الأعلى تقييماً" : language === "en" ? "Top Rated" : "Mieux Notés"}</h4></div>
                <div className="space-y-3">
                  {topRated.map((p, i) => (
                    <Link key={p.id} href={`/product/${p.id}`} className="flex items-center gap-3 group">
                      <div className="relative shrink-0">
                        <div className={`w-12 h-12 rounded-xl overflow-hidden border ${theme.isDark ? "border-white/10" : "border-neutral-200"}`}><img src={p.image} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
                        <div className={`absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm ${i === 0 ? "bg-neutral-900" : i === 1 ? "bg-neutral-500" : "bg-neutral-700"}`}>{i + 1}</div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-[10px] font-bold truncate ${txt}`}>{p.name}</p>
                        <div className="flex items-center gap-1 mt-0.5"><Star className="h-2.5 w-2.5 fill-neutral-800 text-neutral-800" /><span className="text-[9px] font-bold text-neutral-700">{p.rating}</span></div>
                        <p className={`text-[9px] font-bold mt-0.5 ${sub}`}>{formatDZD(p.variants?.[0]?.price || 0)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <button onClick={clearAll} className="w-full text-[10px] font-bold uppercase tracking-[0.15em] text-red-400 hover:text-red-500 flex items-center justify-center gap-2 py-3 border-2 border-red-300/30 hover:border-red-300/50 rounded-xl transition-all">
                  <X className="h-3.5 w-3.5" />{t.reinitialiser}
                </button>
              )}
            </div>
          </aside>

          {/* PRODUCTS */}
          <div className="flex-1 min-w-0">
            <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-5 border-b transition-colors duration-500 ${theme.isDark ? "border-white/10" : "border-neutral-200"}`}>
              <p className={`text-[11px] font-medium ${sub}`}>
                <span className="font-bold" style={{ color: theme.accent }}>{filteredProducts.length}</span>{" "}
                {language === "ar" ? "نتيجة" : language === "en" ? "results" : "résultats"}
                {activeFiltersCount > 0 && <button onClick={clearAll} className={`ml-2 text-[10px] underline ${sub}`}>({activeFiltersCount} {language === "ar" ? "فلتر" : language === "en" ? "filters" : "filtres"})</button>}
              </p>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowMobileFilters(true)}
                  className={`lg:hidden flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] rounded-xl border transition-all ${theme.isDark ? "border-white/10 text-white/50 hover:text-white" : "border-neutral-200 text-neutral-500 hover:text-neutral-800"}`}>
                  <Filter className="h-4 w-4" />{t.filtres}
                  {activeFiltersCount > 0 && <span className="w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center text-white" style={{ backgroundColor: theme.accent }}>{activeFiltersCount}</span>}
                </button>
                <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)}
                  className={`px-4 py-2.5 text-[10px] rounded-xl border font-medium cursor-pointer focus:outline-none transition-colors ${theme.isDark ? "bg-white/5 border-white/10 text-white/70" : "bg-white border-neutral-200 text-neutral-600"}`}>
                  <option value="default">{t.triDefaut}</option>
                  <option value="price-asc">{t.triPrixCroissant}</option>
                  <option value="price-desc">{t.triPrixDecroissant}</option>
                  <option value="name">{t.triNom}</option>
                  <option value="rating">{t.triRating}</option>
                  <option value="newest">{t.triNewest}</option>
                </select>
                <div className={`hidden sm:flex items-center border rounded-xl overflow-hidden ${theme.isDark ? "border-white/10" : "border-neutral-200"}`}>
                  {(["2x2", "4x4", "6x6"] as GridSize[]).map(s => (
                    <button key={s} onClick={() => setGridSize(s)}
                      className={`p-2.5 transition-all ${gridSize === s ? "text-white" : theme.isDark ? "text-white/30 hover:text-white/60" : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"}`}
                      style={gridSize === s ? { backgroundColor: theme.accent } : {}}>
                      {s === "2x2" ? <Layout className="h-4 w-4" /> : s === "4x4" ? <LayoutGrid className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile search bar directly on page */}
            <div className="lg:hidden mb-6">
              <div className="relative">
                <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${sub}`} />
                <input
                  type="text"
                  placeholder={t.rechercherFragrance}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-9 py-3 text-xs font-semibold rounded-2xl border focus:outline-none transition-all ${inp}`}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${sub}`}>
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile filter — handled by slide drawer */}

            {filteredProducts.length === 0 ? (
              <div className="text-center py-32">
                <div className={`w-20 h-20 mx-auto mb-6 border-2 rounded-2xl flex items-center justify-center ${theme.isDark ? "border-white/10" : "border-neutral-200"}`}>
                  <Search className={`h-8 w-8 ${theme.isDark ? "text-white/20" : "text-neutral-300"}`} />
                </div>
                <p className={`text-base font-black uppercase tracking-wider ${theme.isDark ? "text-white/20" : "text-neutral-300"}`}>{t.noProducts}</p>
                <p className={`text-[11px] mt-2 max-w-sm mx-auto ${sub}`}>{t.noProductsDesc}</p>
                <button onClick={clearAll} className={`mt-6 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors ${theme.isDark ? "text-white/30 hover:text-white" : "text-neutral-400 hover:text-neutral-900"}`}>{t.reinitialiser}</button>
              </div>
            ) : (
              <motion.div layout className={`grid ${gridConfig[gridSize].cols} ${gridConfig[gridSize].gap}`}>
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product, idx) => {
                    const totalStock = (product.variants || []).reduce((sum, v) => sum + v.stock, 0);
                    const isOut = totalStock === 0;
                    const isLow = totalStock > 0 && totalStock <= 5;
                    const isFav = favorites.includes(product.id);
                    const hasPromo = (product.discountPercent ?? 0) > 0;
                    const secondaryImg = product.hoverImage;
                    return (
                      <motion.div key={product.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92 }} transition={{ duration: 0.3, delay: idx * 0.025 }} className="group">
                        <div onClick={() => setSelectedProduct(product)} className="block cursor-pointer">
                          <div className={`relative aspect-3/4 rounded-2xl overflow-hidden mb-3 ${theme.isDark ? "bg-white/5 border border-white/10" : "bg-neutral-100 border border-neutral-200/50"}`}>
                            <img src={product.image || "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=400"} alt={product.name} className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ${secondaryImg ? "group-hover:opacity-0 group-hover:scale-110" : ""}`} />
                            {secondaryImg && (
                              <img src={secondaryImg} alt={`${product.name} — packaging`} className="absolute inset-0 h-full w-full object-cover transition-all duration-700 opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100" />
                            )}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-6"
                              style={{ background: `linear-gradient(to top, rgba(${theme.accentRgb},0.80) 0%, transparent 55%)` }}>
                              <span className="text-white text-[9px] font-bold uppercase tracking-[0.2em] px-5 py-2 rounded-full border border-white/30 backdrop-blur-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-400">
                                {language === "ar" ? "اكتشف" : language === "en" ? "Discover" : "Découvrir"}
                              </span>
                            </div>
                            <button onClick={e => toggleFavorite(product.id, e)} className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-sm border transition-all shadow-sm ${theme.isDark ? "bg-black/40 border-white/10" : "bg-white/80 border-neutral-200/60 hover:bg-white"}`}>
                              <Heart className={`h-3.5 w-3.5 transition-all ${isFav ? "fill-red-500 text-red-500" : theme.isDark ? "text-white/50" : "text-neutral-400"}`} />
                            </button>
                            {/* Unified Sticker Styling */}
                            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-30 pointer-events-none">
                              {isOut && (
                                <span className="bg-neutral-900/90 text-white text-[8px] sm:text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase border border-neutral-800 shadow-sm backdrop-blur-sm">
                                  {t.outOfStock}
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
                                <span className="bg-neutral-800/95 text-white text-[8px] sm:text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase border border-neutral-700 shadow-sm">
                                  {t.lowStock}
                                </span>
                              )}
                            </div>
                            {product.rating >= 4.5 && gridSize !== "6x6" && (
                              <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg backdrop-blur-sm bg-black/50">
                                <Star className="h-2.5 w-2.5 fill-neutral-800 text-neutral-800" />
                                <span className="text-[9px] font-bold text-white">{product.rating}</span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-1 px-1">
                            <div className="flex items-center justify-between">
                              <p className={`uppercase tracking-widest font-bold ${gridSize === "6x6" ? "text-[7px]" : "text-[9px]"} ${sub}`}>{product.category}</p>
                              {product.brand && gridSize !== "6x6" && <p className={`text-[8px] font-medium ${sub}`}>{product.brand}</p>}
                            </div>
                            <h3 className={`font-bold leading-snug line-clamp-2 ${gridSize === "6x6" ? "text-[10px]" : "text-[13px]"} ${txt}`}>{product.name}</h3>
                            <div className="flex items-center gap-2">
                              {hasPromo ? (
                                <>
                                  <p className={`font-black ${gridSize === "6x6" ? "text-[10px]" : "text-sm"}`} style={{ color: theme.accent }}>{formatDZD((product.variants?.[0]?.price || 0) * (1 - (product.discountPercent ?? 0) / 100))}</p>
                                  <p className={`font-medium line-through opacity-40 ${gridSize === "6x6" ? "text-[9px]" : "text-[11px]"} ${txt}`}>{formatDZD(product.variants?.[0]?.price || 0)}</p>
                                </>
                              ) : (
                                <p className={`font-black ${gridSize === "6x6" ? "text-[10px]" : "text-sm"} ${txt}`}>{formatDZD(product.variants?.[0]?.price || 0)}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}

            {filteredProducts.length > 0 && (
              <div className={`text-center mt-16 pt-8 border-t ${theme.isDark ? "border-white/10" : "border-neutral-200"}`}>
                <p className={`text-[10px] font-medium ${sub}`}>
                  {language === "ar" ? `عرض ${filteredProducts.length} من ${products.length}` : language === "en" ? `Showing ${filteredProducts.length} of ${products.length} fragrances` : `${filteredProducts.length} sur ${products.length} fragrances`}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className={`border-t mt-20 py-10 px-6 sm:px-10 transition-colors duration-500 ${theme.isDark ? "border-white/10 bg-black" : "border-neutral-200 bg-white"}`}>
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src="/logo.jpg" alt="M&D Parfum Logo" className="w-14 h-14 rounded-full border border-neutral-200 object-cover inline" />
            <span className={`font-sans text-sm tracking-[0.2em] font-bold uppercase ${theme.isDark ? "text-white/60" : "text-neutral-800"}`}>M&D Parfum</span>
          </div>
          <div className="flex flex-col gap-2 sm:text-right">
            <p className={`text-[9px] uppercase tracking-[0.15em] font-medium ${sub}`}>
              &copy; {new Date().getFullYear()} M&D Parfum. {t.rightsReserved}
            </p>
            <p className={`text-xs sm:text-sm font-black uppercase tracking-widest ${theme.isDark ? "text-white/80" : "text-neutral-900"}`}>
              MADE BY WASSIM SELAMA (PROXIMITY AGENCY)
            </p>
          </div>
        </div>
      </footer>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* MOBILE FILTER SIDE DRAWER */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] lg:hidden" />

            <motion.div key="drawer" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              className="fixed left-0 top-0 bottom-0 w-[82vw] max-w-[310px] z-[70] lg:hidden flex flex-col overflow-hidden"
              style={{ backgroundColor: theme.pageBg }}>

              <div className={`flex items-center justify-between px-5 py-4 border-b ${theme.isDark ? "border-white/10" : "border-neutral-200"}`}>
                <div className="flex items-center gap-2">
                  <Filter className={`h-4 w-4 ${theme.isDark ? "text-white/60" : "text-neutral-500"}`} />
                  <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme.isDark ? "text-white/80" : "text-neutral-800"}`}>{t.filtres}</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center text-white" style={{ backgroundColor: theme.accent }}>{activeFiltersCount}</span>
                  )}
                </div>
                <button onClick={() => setShowMobileFilters(false)} className={`p-2 rounded-xl transition-colors ${theme.isDark ? "text-white/50 hover:text-white hover:bg-white/10" : "text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100"}`}>
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Categories scroll */}
              <div className={`border-b px-5 py-3 ${theme.isDark ? "border-white/10" : "border-neutral-100"}`}>
                <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-2.5 ${sub}`}>{t.categories}</p>
                <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                  <button onClick={() => setActiveCategory(null)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase border transition-all ${!activeCategory ? "text-white" : theme.isDark ? "border-white/10 text-white/50" : "border-neutral-200 text-neutral-500"}`}
                    style={!activeCategory ? { backgroundColor: theme.accent, borderColor: theme.accent } : {}}>
                    <Sparkles className="h-3 w-3" />{language === "ar" ? "الكل" : language === "en" ? "All" : "Tout"}
                  </button>
                  {allCategories.map(cat => {
                    const Icon = cat.icon;
                    const isActive = activeCategory === cat.id;
                    const catTheme = THEMES[cat.id] || THEMES.default;
                    return (
                      <button key={cat.id} onClick={() => setActiveCategory(isActive ? null : cat.id)}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase border transition-all ${isActive ? "text-white" : theme.isDark ? "border-white/10 text-white/50" : "border-neutral-200 text-neutral-500"}`}
                        style={isActive ? { backgroundColor: catTheme.accent, borderColor: catTheme.accent } : {}}>
                        <Icon className="h-3 w-3" />{cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter body */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ scrollbarWidth: "none" }}>

                {/* Search */}
                <div className={`rounded-2xl p-4 border ${card}`}>
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${sub}`} />
                    <input type="text" placeholder={t.rechercherFragrance} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-8 py-2.5 text-[11px] font-medium rounded-xl border focus:outline-none transition-colors ${inp}`} />
                    {searchQuery && <button onClick={() => setSearchQuery("")} className={`absolute right-3 top-1/2 -translate-y-1/2 ${sub}`}><X className="h-4 w-4" /></button>}
                  </div>
                  {isRegex && (
                    <p className="mt-1.5 text-[9px] font-bold uppercase tracking-wider" style={{ color: theme.accent }}>
                      {language === "ar" ? "وضع Regex" : language === "en" ? "Regex mode" : "Mode Regex"}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className={`rounded-2xl p-4 border ${card}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`text-[9px] font-black uppercase tracking-[0.2em] ${sub}`}>{t.budget}</h4>
                    <Zap className="h-3.5 w-3.5" style={{ color: theme.accent }} />
                  </div>
                  <div className={`flex items-baseline gap-2 mb-3 text-xs font-bold ${txt}`}>
                    <span>{priceRange[0].toLocaleString("fr-FR")} DA</span>
                    <span className="opacity-30">—</span>
                    <span>{priceRange[1].toLocaleString("fr-FR")} DA</span>
                  </div>
                  <div className="relative h-6 mb-3 flex items-center w-full">
                    <input type="range" min={0} max={100000} step={1000} value={priceRange[0]} onChange={e => setPriceRange([Math.min(parseInt(e.target.value), priceRange[1]), priceRange[1]])} className="absolute w-full h-1.5 rounded-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neutral-800 z-20 cursor-pointer" />
                    <input type="range" min={0} max={100000} step={1000} value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], Math.max(parseInt(e.target.value), priceRange[0])])} className="absolute w-full h-1.5 rounded-full appearance-none bg-neutral-200 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neutral-800 z-10 cursor-pointer" />
                    <div className="absolute h-1.5 rounded-full pointer-events-none z-10" style={{ backgroundColor: theme.accent, left: `${(priceRange[0] / 100000) * 100}%`, right: `${100 - (priceRange[1] / 100000) * 100}%` }} />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[{ l: "<10k", r: [0, 10000] }, { l: "10-25k", r: [10000, 25000] }, { l: "25-50k", r: [25000, 50000] }, { l: "50-75k", r: [50000, 75000] }, { l: "75k+", r: [75000, 100000] }, { l: t.budgetAll, r: [0, 100000] }].map(p => {
                      const on = priceRange[0] === p.r[0] && priceRange[1] === p.r[1];
                      return <button key={p.l} onClick={() => setPriceRange(p.r as [number, number])} className={`text-[9px] font-bold py-1.5 rounded-lg border transition-all ${on ? "text-white" : theme.isDark ? "border-white/10 text-white/40" : "border-neutral-200 text-neutral-400"}`} style={on ? { backgroundColor: theme.accent, borderColor: theme.accent } : {}}>{p.l}</button>;
                    })}
                  </div>
                </div>

                {/* Brands */}
                {brands.length > 0 && (
                  <div className={`rounded-2xl p-4 border ${card}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`text-[9px] font-black uppercase tracking-[0.2em] ${sub}`}>{t.marques}</h4>
                      {selectedBrands.length > 0 && <button onClick={() => setSelectedBrands([])} className="text-[9px] text-red-400 font-medium">{language === "ar" ? "مسح" : language === "en" ? "Clear" : "Effacer"}</button>}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {brands.map((brand: Brand) => {
                        const on = selectedBrands.includes(brand.name);
                        return (
                          <button key={brand.id} onClick={() => toggleBrand(brand.name)} title={brand.name}
                            className={`relative h-12 rounded-xl border-2 transition-all flex items-center justify-center p-2 bg-white ${on ? "border-neutral-900 ring-1 ring-neutral-900" : "border-neutral-200 hover:border-neutral-400"}`}>
                            <img src={brand.logo} alt={brand.name} className="max-h-8 max-w-full object-contain" style={{ mixBlendMode: "multiply" }} />
                            {on && <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-neutral-900" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Top Rated */}
                <div className={`rounded-2xl p-4 border ${card}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy className={`h-4 w-4 ${theme.isDark ? "text-white/40" : "text-neutral-400"}`} />
                    <h4 className={`text-[9px] font-black uppercase tracking-[0.2em] ${sub}`}>{language === "ar" ? "الأعلى تقييماً" : language === "en" ? "Top Rated" : "Mieux Notés"}</h4>
                  </div>
                  <div className="space-y-3">
                    {topRated.map((p, i) => (
                      <div key={p.id} onClick={() => { setShowMobileFilters(false); setSelectedProduct(p); }} className="flex items-center gap-3 group cursor-pointer">
                        <div className="relative shrink-0">
                          <div className={`w-11 h-11 rounded-xl overflow-hidden border ${theme.isDark ? "border-white/10" : "border-neutral-200"}`}>
                            <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                          </div>
                          <div className={`absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${i === 0 ? "bg-neutral-900" : i === 1 ? "bg-neutral-500" : "bg-neutral-700"}`}>{i + 1}</div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-[10px] font-bold truncate ${txt}`}>{p.name}</p>
                          <div className="flex items-center gap-1 mt-0.5"><Star className="h-2.5 w-2.5 fill-neutral-800 text-neutral-800" /><span className="text-[9px] font-bold text-neutral-700">{p.rating}</span></div>
                          <p className={`text-[9px] font-bold mt-0.5 ${sub}`}>{formatDZD(p.variants?.[0]?.price || 0)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className={`px-5 py-4 border-t space-y-2 ${theme.isDark ? "border-white/10" : "border-neutral-200"}`}>
                {hasActiveFilters && (
                  <button onClick={clearAll} className="w-full text-[10px] font-black uppercase tracking-[0.15em] text-red-400 flex items-center justify-center gap-2 py-3 border-2 border-red-300/40 rounded-xl transition-all">
                    <X className="h-3.5 w-3.5" />{t.reinitialiser}
                  </button>
                )}
                <button onClick={() => setShowMobileFilters(false)} className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all" style={{ backgroundColor: theme.accent }}>
                  {language === "ar" ? `عرض ${filteredProducts.length} نتيجة` : language === "en" ? `Show ${filteredProducts.length} results` : `Voir ${filteredProducts.length} résultats`}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ProductDetailModal product={selectedProduct} isOpen={selectedProduct !== null} onClose={() => setSelectedProduct(null)} />
      <MobileBottomNav onCartOpen={() => setIsCartOpen(true)} />
    </motion.div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#fafaf8] text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Chargement...</div>}>
      <CategoriesPageContent />
    </Suspense>
  );
}
