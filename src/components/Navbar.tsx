"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, X, Shield, LogOut, ShoppingBag } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { CartDrawer } from "@/components/CartDrawer";
import { LoginModal } from "@/components/LoginModal";

export function Navbar() {
  const { cart, currentUser, logout, language, setLanguage } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

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
      if (!e.key) return;
      keys.push(e.key.toLowerCase());
      keys = keys.slice(-secret.length);
      if (JSON.stringify(keys) === JSON.stringify(secret)) window.location.href = "/admin";
    };
    const onOpenCart = () => setIsCartOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-cart", onOpenCart);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-cart", onOpenCart);
    };
  }, []);

  // When landing on home page, check if we need to scroll to a section
  useEffect(() => {
    if (pathname === "/") {
      const target = sessionStorage.getItem("scrollTo");
      if (target) {
        sessionStorage.removeItem("scrollTo");
        // Wait for page to render, then smooth scroll
        setTimeout(() => {
          document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
        }, 400);
      }
    }
  }, [pathname]);

  const cartItemsCount = cart.reduce((s, i) => s + i.quantity, 0);

  // Smart scroll: if on home page, scroll in-place; if on another page, navigate home then scroll
  const handleScrollNav = (sectionId: string) => {
    if (pathname === "/") {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    } else {
      sessionStorage.setItem("scrollTo", sectionId);
      router.push("/");
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/categories?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-2xl border-b border-neutral-200/50 shadow-sm"
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 sm:h-20">

          {/* Logo */}
          <Link href="/" onClick={handleLogoClick} className="flex items-center gap-3 cursor-pointer select-none group">
            <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black shadow-md transition-transform duration-500 group-hover:scale-105 overflow-hidden">
              <Image src="/logo.jpg" alt="M&D Parfum Logo" width={200} height={200} className="h-full w-full object-cover" />
            </div>
            <span className="text-[15px] sm:text-[18px] font-black tracking-widest uppercase text-neutral-900 leading-none">
              M&D PARFUM
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-10">
            {[
              { key: "arrivals", label: language === "ar" ? "وصل حديثاً" : language === "en" ? "NEW ARRIVALS" : "NOUVEAUTÉS", scrollId: "nouveautes" },
              { key: "promo",    label: language === "ar" ? "عروض" : language === "en" ? "SALE" : "PROMO",                     scrollId: "promo" },
            ].map(item => (
              <button
                key={item.key}
                onClick={() => handleScrollNav(item.scrollId)}
                className="relative text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-900 transition-colors group"
              >
                {item.label}
                <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-neutral-900 transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
            {[
              { key: "cats", label: language === "ar" ? "الفئات" : language === "en" ? "CATEGORIES" : "CATÉGORIES", href: "/categories" },
              { key: "favs", label: language === "ar" ? "المفضلة" : language === "en" ? "FAVORITES" : "FAVORIS",   href: "/favoris" },
            ].map(item => (
              <Link
                key={item.key}
                href={item.href}
                className="relative text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-900 transition-colors group"
              >
                {item.label}
                <span className="absolute -bottom-1.5 left-0 w-0 h-[2px] bg-neutral-900 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Language switcher — FR | عر | EN */}
            <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold text-neutral-400">
              {(["fr", "ar", "en"] as const).map((l, i) => (
                <React.Fragment key={l}>
                  {i > 0 && <span className="text-neutral-200 mx-0.5">|</span>}
                  <button
                    onClick={() => setLanguage(l)}
                    className={`hover:text-neutral-900 transition-colors px-0.5 ${language === l ? "text-neutral-900 font-black" : ""}`}
                  >
                    {l === "fr" ? "FR" : l === "ar" ? "عر" : "EN"}
                  </button>
                </React.Fragment>
              ))}
            </div>

            {/* Search */}
            <button onClick={() => setSearchOpen(s => !s)} className="p-2 text-neutral-500 hover:text-neutral-900 transition-colors rounded-lg hover:bg-neutral-100">
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* Admin + Logout */}
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

        {/* Search bar drop down */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-neutral-100 overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder={language === "ar" ? "ابحث عن عطر..." : language === "en" ? "Search a fragrance..." : "Rechercher une fragrance..."}
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900 text-neutral-800 placeholder-neutral-400 transition-colors"
                  />
                  <button onClick={() => setSearchOpen(false)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
