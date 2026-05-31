"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Shield, ShoppingBag, LogOut, Heart } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { translations } from "@/lib/translations";
import { CartDrawer } from "@/components/CartDrawer";
import { LoginModal } from "@/components/LoginModal";
import { MobileBottomNav } from "@/components/MobileBottomNav";

const getBrandLogo = (name: string) => {
  const c = "fill-current w-12 h-12 mx-auto text-current transition-all duration-300";
  switch (name) {
    case "C H A N E L":
      return (
        <svg className={c} viewBox="0 0 100 100">
          <path d="M 38,50 A 18,18 0 1,1 38,22 M 38,78 A 18,18 0 1,1 38,50" fill="none" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" />
          <path d="M 62,50 A 18,18 0 1,0 62,22 M 62,78 A 18,18 0 1,0 62,50" fill="none" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" />
        </svg>
      );
    case "D I O R":
      return (
        <svg className={c} viewBox="0 0 100 100">
          <path d="M 38,25 L 38,75 C 58,75 58,25 38,25 Z M 44,32 C 51,36 51,64 44,68 Z" fill="currentColor" />
          <path d="M 28,25 L 48,25" stroke="currentColor" strokeWidth="2.5" />
          <path d="M 28,75 L 48,75" stroke="currentColor" strokeWidth="2.5" />
        </svg>
      );
    case "G U E R L A I N":
      return (
        <svg className={c} viewBox="0 0 100 100">
          <path d="M50,15 C53,15 55,20 50,32 C45,20 47,15 50,15 Z" fill="currentColor" />
          <circle cx="50" cy="36" r="4.5" fill="currentColor" />
          <path d="M50,42 C44,42 39,47 39,56 C39,70 50,83 50,83 C50,83 61,70 61,56 C61,47 56,42 50,42 Z" fill="currentColor" />
          <path d="M37,44 C24,42 21,52 34,57 C21,62 24,72 37,64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M63,44 C76,42 79,52 66,57 C79,62 76,72 63,64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case "H E R M È S":
      return (
        <svg className={c} viewBox="0 0 100 100">
          <circle cx="50" cy="58" r="13" fill="none" stroke="currentColor" strokeWidth="3.5" />
          <path d="M 37,58 L 63,58 M 50,45 L 50,71" stroke="currentColor" strokeWidth="2" />
          <path d="M 40,28 L 40,45 M 60,28 L 60,45" stroke="currentColor" strokeWidth="2" />
          <path d="M 32,28 L 68,28" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 68,36 C 70,36 74,40 76,36 L 78,44 C 74,44 70,40 68,36 Z" fill="currentColor" />
        </svg>
      );
    case "Y V E S   S A I N T   L A U R E N T":
      return (
        <svg className={c} viewBox="0 0 100 100">
          <path d="M 32,20 L 48,50 L 48,80" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" fill="none" />
          <path d="M 68,20 L 48,50" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M 36,38 C 36,28 64,28 64,43 C 64,58 36,58 36,68 C 36,78 64,78 64,68" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
        </svg>
      );
    case "C R E E D":
      return (
        <svg className={c} viewBox="0 0 100 100">
          <path d="M 28,68 L 33,43 C 36,38 40,38 38,28 C 36,38 30,43 28,68 Z" fill="currentColor" />
          <path d="M 72,68 L 67,43 C 64,38 60,38 62,28 C 64,38 70,43 72,68 Z" fill="currentColor" />
          <path d="M 50,68 L 50,33 C 50,28 50,28 50,20 C 48,28 48,28 50,68 Z" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M 22,73 L 78,73" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
};

export default function MarquesPage() {
  const { cart, currentUser, logout, language, setLanguage } = useApp();
  const t = translations[language] || translations.fr;
  const isRtl = language === "ar";
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);


  const [logoClicks, setLogoClicks] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleLogoClick = (e: React.MouseEvent) => {
    const currentTime = Date.now();
    if (currentTime - lastClickTime < 1000) {
      const newClicks = logoClicks + 1;
      setLogoClicks(newClicks);
      if (newClicks >= 2) {
        e.preventDefault();
        window.location.href = "/admin";
        return;
      }
    } else {
      setLogoClicks(0);
    }
    setLastClickTime(currentTime);
  };

  useEffect(() => {
    let keysPressed: string[] = [];
    const secretCode = ["a", "d", "m", "i", "n"];

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.push(e.key.toLowerCase());
      keysPressed = keysPressed.slice(-secretCode.length);

      if (JSON.stringify(keysPressed) === JSON.stringify(secretCode)) {
        window.location.href = "/admin";
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const { brands } = useApp();

  const localizedBrands = useMemo(() => {
    const b = (key: string) => {
      const dict: Record<string, Record<string, { sub: string, desc: string, origin: string, year: string }>> = {
        fr: {
          chanel: { sub: "Haute Parfumerie", desc: "L'élégance intemporelle et la sophistication à la française. Des créations légendaires qui ont redéfini l'histoire du parfum.", origin: "Paris, France", year: "Depuis 1910" },
          dior: { sub: "Maison de Prestige", desc: "L'expression ultime du luxe et de l'audace créative. Des sillages d'exception conçus comme des robes de haute couture.", origin: "Paris, France", year: "Depuis 1946" },
          guerlain: { sub: "Parfumeur de Légende", desc: "L'art de la formulation depuis près de deux siècles. Une alchimie unique alliant matières premières d'exception et flacons d'art.", origin: "Paris, France", year: "Depuis 1828" },
          hermes: { sub: "Artisan Parfumeur", desc: "Une parfumerie de conteurs, de matières et d'émotions. Des créations épurées, poétiques et profondément artisanales.", origin: "Paris, France", year: "Depuis 1837" },
          ysl: { sub: "Audace Olfactive", desc: "L'expression de la sensualité moderne et de la liberté absolue. Des sillages contrastés aux notes puissantes et rebelles.", origin: "Paris, France", year: "Depuis 1961" },
          creed: { sub: "Maison Dynastique", desc: "De père en fils, une tradition de parfums impériaux hautement concentrés. L'art de l'infusion et des essences rares.", origin: "Londres / Paris", year: "Depuis 1760" }
        },
        en: {
          chanel: { sub: "Haute Perfumery", desc: "Timeless elegance and French sophistication. Legendary creations that redefined the history of perfume.", origin: "Paris, France", year: "Since 1910" },
          dior: { sub: "Prestige House", desc: "The ultimate expression of luxury and creative boldness. Exceptional trails designed like haute couture gowns.", origin: "Paris, France", year: "Since 1946" },
          guerlain: { sub: "Legendary Perfumer", desc: "The art of formulation for nearly two centuries. A unique alchemy combining exceptional raw materials and artistic bottles.", origin: "Paris, France", year: "Since 1828" },
          hermes: { sub: "Artisan Perfumer", desc: "A perfumery of storytellers, materials, and emotions. Clean, poetic, and deeply artisanal creations.", origin: "Paris, France", year: "Since 1837" },
          ysl: { sub: "Olfactory Boldness", desc: "The expression of modern sensuality and absolute freedom. Contrasting trails with powerful, rebellious notes.", origin: "Paris, France", year: "Since 1961" },
          creed: { sub: "Dynastic House", desc: "From father to son, a tradition of highly concentrated imperial fragrances. The art of infusion and rare essences.", origin: "London / Paris", year: "Since 1760" }
        },
        ar: {
          chanel: { sub: "العطور الراقية", desc: "الأناقة الخالدة والرقي الباريسي الفرنسي. ابتكارات أسطورية أعادت صياغة تاريخ العطور الفاخرة.", origin: "باريس، فرنسا", year: "منذ عام 1910" },
          dior: { sub: "دار عريقة", desc: "التعبير الأسمى عن الفخامة والجرأة الإبداعية. عطور استثنائية صُممت كفساتين الهوت كوتور الراقية.", origin: "باريس، فرنسا", year: "منذ عام 1946" },
          guerlain: { sub: "عطور أسطورية", desc: "فن صياغة العطور منذ ما يقرب من قرنين من الزمان. كيمياء فريدة تجمع بين المواد الخام النادرة وقوارير فنية.", origin: "باريس، فرنسا", year: "منذ عام 1828" },
          hermes: { sub: "صانع عطور حرفي", desc: "دار عطور تعبر عن الرواة، والمواد الثمينة والمشاعر الجياشة. ابتكارات نقية، شاعرية وحرفية للغاية.", origin: "باريس، فرنسا", year: "منذ عام 1837" },
          ysl: { sub: "جرأة عطرية", desc: "التعبير الصادق عن الجاذبية العصرية والحرية المطلقة. عطور متباينة بنوتات قوية متمردة.", origin: "باريس، فرنسا", year: "منذ عام 1961" },
          creed: { sub: "دار عريقة متوارثة", desc: "من الآباء إلى الأبناء، تقاليد عريقة من العطور الإمبراطورية عالية التركيز. فن النقع والمستخلصات النادرة.", origin: "لندن / باريس", year: "منذ عام 1760" }
        }
      };
      return dict[language]?.[key] || dict.fr[key];
    };

    return [
      { name: "C H A N E L", ...b("chanel") },
      { name: "D I O R", ...b("dior") },
      { name: "G U E R L A I N", ...b("guerlain") },
      { name: "H E R M È S", ...b("hermes") },
      { name: "Y V E S   S A I N T   L A U R E N T", ...b("ysl") },
      { name: "C R E E D", ...b("creed") }
    ];
  }, [language]);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-neutral-900 flex flex-col font-sans selection:bg-black/10 selection:text-black leading-relaxed pb-16 lg:pb-0" dir={isRtl ? "rtl" : "ltr"}>
      

      <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-[#faf9f6]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-8 py-4">
          <Link href="/" onClick={handleLogoClick} className="flex items-center gap-2 sm:gap-4 group select-none">
            <span className="font-sans text-base sm:text-xl tracking-[0.1em] sm:tracking-[0.15em] text-black font-bold uppercase">Perfum</span>
            <span className="hidden sm:block w-[1px] h-5 bg-black/20" />
            <span className="hidden sm:block text-[8px] tracking-[0.4em] text-black/40 font-medium uppercase">guy</span>
          </Link>

          <nav className={`hidden lg:flex items-center gap-8 ${isRtl ? "flex-row-reverse" : ""}`}>
            <Link href="/#nouveautes" className="text-[10px] font-medium uppercase tracking-[0.2em] text-black/50 hover:text-black transition-colors">{t.nouveautes}</Link>
            <Link href="/#promo" className="text-[10px] font-medium uppercase tracking-[0.2em] text-black/50 hover:text-black transition-colors">{t.promo}</Link>
            <Link href="/categories" className="text-[10px] font-medium uppercase tracking-[0.2em] text-black/50 hover:text-black transition-colors">{t.categories}</Link>
            <Link href="/marques" className="text-[10px] font-bold uppercase tracking-[0.2em] text-black transition-colors">{t.nosMarques}</Link>
          </nav>

          <div className="flex items-center gap-5">

            <div className={`flex items-center gap-1.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.05em] text-black/35 ${isRtl ? 'border-l pl-2 sm:pl-3 ml-1 sm:ml-2' : 'border-r pr-2 sm:pr-3 mr-1 sm:mr-2'} border-black/10`}>
              <button onClick={() => setLanguage("fr")} className={`hover:text-black transition-colors cursor-pointer border-none bg-transparent p-0 ${language === "fr" ? "text-black font-extrabold" : ""}`}>FR</button>
              <span className="text-black/10 select-none text-[8px]">|</span>
              <button onClick={() => setLanguage("en")} className={`hover:text-black transition-colors cursor-pointer border-none bg-transparent p-0 ${language === "en" ? "text-black font-extrabold" : ""}`}>EN</button>
              <span className="text-black/10 select-none text-[8px]">|</span>
              <button onClick={() => setLanguage("ar")} className={`hover:text-black transition-colors cursor-pointer border-none bg-transparent p-0 ${language === "ar" ? "text-black font-extrabold" : ""}`}>AR</button>
            </div>

            {currentUser?.role === "admin" && (
              <div className={`flex items-center gap-3 ${isRtl ? 'border-r pr-3 sm:pr-4 mr-1 sm:mr-2' : 'border-l pl-3 sm:pl-4 ml-1 sm:ml-2'} border-black/10`}>
                <Link href="/admin" className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-black/40 hover:text-black transition-colors flex items-center gap-1">
                  <Shield className="h-3 w-3" /> <span className="hidden sm:inline">Admin</span>
                </Link>
                <button onClick={logout} className="text-black/35 hover:text-black transition-colors border-none bg-transparent cursor-pointer p-0"><LogOut className="h-3.5 w-3.5" /></button>
              </div>
            )}

            <button onClick={() => setIsCartOpen(true)} className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center border border-black/10 hover:border-black/40 text-black/40 hover:text-black transition-all bg-transparent cursor-pointer">
              <ShoppingBag className="h-3.5 w-3.5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center bg-black text-[7px] sm:text-[8px] font-bold text-white rounded-none">{cartItemsCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>


      <main className="grow py-12 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-12 sm:space-y-16">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[8px] uppercase tracking-[0.25em] text-black/40 hover:text-black transition-colors">
            <ArrowLeft className="h-2.5 w-2.5" /> {t.retourAccueil}
          </Link>
          <h1 className="font-serif text-3xl sm:text-5xl font-light tracking-[0.25em] uppercase text-black">{t.brandsTitle}</h1>
          <div className="h-[1px] w-12 bg-black/20" />
          <p className="text-xs sm:text-sm text-black/50 font-medium max-w-lg">
            {t.brandsDesc}
          </p>
        </div>


        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localizedBrands.map((brand, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <motion.div
                key={brand.name}
                className="border border-black/5 relative overflow-hidden flex flex-col justify-between p-8 sm:p-10 cursor-pointer min-h-[380px] transition-all bg-white"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => {}}
                animate={{
                  backgroundColor: isHovered ? "#111111" : "#ffffff",
                  color: isHovered ? "#ffffff" : "#1a1a1a"
                }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >

                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-black/10 pb-4">
                    <span className="text-[8px] font-bold uppercase tracking-[0.2em] opacity-40">{brand.sub}</span>
                    <span className="text-[8px] font-bold uppercase tracking-[0.1em] opacity-40">{brand.year}</span>
                  </div>
                  

                  <div className="py-6 text-center flex flex-col items-center justify-center gap-4">
                    <div className="text-current transition-colors duration-300">
                      {getBrandLogo(brand.name)}
                    </div>
                    <h2 className="font-serif text-sm sm:text-base font-light tracking-[0.3em] uppercase mt-2">
                      {brand.name}
                    </h2>
                  </div>
                  
                  <p 
                    className="text-xs font-light leading-relaxed transition-colors duration-300 text-center"
                    style={{ color: isHovered ? "#e5e5e5" : "#737373" }}
                  >
                    {brand.desc}
                  </p>
                </div>

                <div className="flex items-end justify-between pt-8 border-t border-black/5 mt-8">
                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] opacity-50">{brand.origin}</span>
                  <motion.div
                    className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em]"
                    animate={{ x: isHovered ? 4 : 0 }}
                  >
                    {t.decouvrir} <ArrowRight className="h-3 w-3" />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}


          {brands.map((brand, idx) => {
            const isHov = hoveredIndex === 100 + idx;
            return (
              <motion.div
                key={brand.id}
                className="border border-black/5 relative overflow-hidden flex flex-col items-center justify-center p-8 sm:p-10 cursor-pointer min-h-70 transition-all bg-white"
                onMouseEnter={() => setHoveredIndex(100 + idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                animate={{ backgroundColor: isHov ? "#111111" : "#ffffff" }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                <div className="flex flex-col items-center gap-6 text-center">
                  <div
                    className="w-28 h-20 flex items-center justify-center rounded-xl p-3"
                    style={{ backgroundColor: isHov ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.03)" }}
                  >
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="max-h-full max-w-full object-contain transition-all duration-300"
                      style={{ mixBlendMode: isHov ? "screen" : "multiply" }}
                    />
                  </div>
                  <h2
                    className="font-serif text-sm font-light tracking-[0.3em] uppercase transition-colors duration-300"
                    style={{ color: isHov ? "#ffffff" : "#1a1a1a" }}
                  >
                    {brand.name}
                  </h2>
                </div>
              </motion.div>
            );
          })}
        </section>
      </main>


      <footer className="border-t border-black/5 bg-black/[0.015] py-8 px-4 sm:px-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-sans text-xs tracking-[0.15em] text-black font-bold uppercase">VÉLOURS Paris</span>
          <p className="text-[8px] text-black/30 uppercase tracking-[0.1em] font-medium">
            &copy; {new Date().getFullYear()} Vélours Paris. {t.rightsReserved}
          </p>
        </div>
      </footer>


      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      <MobileBottomNav onCartOpen={() => setIsCartOpen(true)} />
    </div>
  );
}
