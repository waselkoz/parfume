"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface Props {
  onCartOpen?: () => void;
}

export function MobileBottomNav({ onCartOpen }: Props) {
  const { language } = useApp();
  const pathname = usePathname();

  const nav = [
    { icon: Home,       label: language === "ar" ? "الرئيسية" : language === "en" ? "Home"       : "Accueil",    href: "/",           active: pathname === "/" },
    { icon: LayoutGrid, label: language === "ar" ? "الفئات"   : language === "en" ? "Categories" : "Catégories", href: "/categories",  active: pathname === "/categories" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="mx-3 mb-3 rounded-2xl shadow-2xl overflow-hidden relative" style={{ background: "linear-gradient(160deg,#1a1208 0%,#0d0b08 50%,#1a1612 100%)" }}>

        {/* Gold shimmer line at top */}
        <div className="h-px bg-linear-to-r from-transparent via-amber-400/60 to-transparent" />

        {/* Perfume bottle watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.045 }}>
          <svg viewBox="0 0 60 100" width="48" height="80" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="22" y="2" width="16" height="7" rx="2" fill="white" fillOpacity="0.6" />
            <rect x="18" y="9" width="24" height="5" rx="1.5" fill="white" fillOpacity="0.4" />
            <path d="M12 20 Q10 26 10 36 L10 72 Q10 86 30 86 Q50 86 50 72 L50 36 Q50 26 48 20 Z" fill="white" fillOpacity="0.15" />
            <path d="M12 20 Q10 26 10 36 L10 72 Q10 86 30 86 Q50 86 50 72 L50 36 Q50 26 48 20 Z" />
            <path d="M18 14 L12 20 M42 14 L48 20" />
            <path d="M10 44 Q30 38 50 44" strokeOpacity="0.5" />
            <rect x="16" y="54" width="28" height="18" rx="1.5" strokeOpacity="0.4" />
          </svg>
        </div>

        {/* Nav items */}
        <div className="flex items-stretch relative z-10">
          {nav.map(({ icon: Icon, label, href, active }) => (
            <Link key={href} href={href} className="flex flex-col items-center justify-center gap-1.5 py-4 flex-1 relative transition-all group">
              {/* Active top indicator */}
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full bg-linear-to-r from-amber-400 to-yellow-300" />
              )}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${active ? "bg-amber-500/20" : "group-hover:bg-white/5"}`}>
                <Icon className={`h-4.5 w-4.5 shrink-0 transition-colors duration-300 ${active ? "text-amber-400" : "text-white/35 group-hover:text-white/60"}`} style={{ width: "18px", height: "18px" }} />
              </div>
              <span className={`text-[7.5px] font-bold uppercase tracking-widest leading-none transition-colors duration-300 ${active ? "text-amber-400" : "text-white/30 group-hover:text-white/50"}`}>
                {label}
              </span>
            </Link>
          ))}
        </div>

        {/* Bottom gold shimmer */}
        <div className="h-px bg-linear-to-r from-transparent via-amber-600/20 to-transparent" />
      </div>
    </div>
  );
}
