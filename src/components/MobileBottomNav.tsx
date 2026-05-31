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
    { icon: Home, label: language === "ar" ? "الرئيسية" : language === "en" ? "Home" : "Accueil", href: "/", active: pathname === "/" },
    { icon: LayoutGrid, label: language === "ar" ? "الفئات" : language === "en" ? "Categories" : "Catégories", href: "/categories", active: pathname === "/categories" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div
        className="mx-3 mb-3 rounded-2xl overflow-hidden relative"
        style={{
          background: "linear-gradient(160deg,#1c1208 0%,#0e0a06 45%,#160f09 100%)",
          boxShadow: "0 -2px 40px rgba(180,120,30,0.18),0 8px 32px rgba(0,0,0,0.55)",
        }}
      >
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg,transparent 0%,#d4a843 30%,#f0d88a 50%,#d4a843 70%,transparent 100%)" }} />

        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.055 }}>
          <svg width="100%" height="100%" viewBox="0 0 300 64" preserveAspectRatio="xMidYMid slice" fill="none">
            <ellipse cx="150" cy="34" rx="16" ry="24" stroke="white" strokeWidth="0.8" />
            <ellipse cx="150" cy="34" rx="10" ry="17" stroke="white" strokeWidth="0.5" />
            <rect x="144" y="10" width="12" height="6" rx="2" fill="white" fillOpacity="0.6" />
            <rect x="142" y="16" width="16" height="4" rx="1" fill="white" fillOpacity="0.3" />
            <line x1="150" y1="32" x2="150" y2="46" stroke="white" strokeWidth="0.5" />
            <line x1="144" y1="39" x2="156" y2="39" stroke="white" strokeWidth="0.5" />
            {[18,38,58,78,222,242,262,282].map((x,i) => <circle key={i} cx={x} cy={10+(i%3)*14} r="1.2" fill="white" fillOpacity="0.45" />)}
            {[28,68,232,272].map((x,i) => <circle key={`b${i}`} cx={x} cy={46+(i%2)*9} r="0.8" fill="white" fillOpacity="0.25" />)}
          </svg>
        </div>

        <div className="flex items-stretch relative z-10">
          {nav.map(({ icon: Icon, label, href, active }) => (
            <Link key={href} href={href} className="flex flex-col items-center justify-center gap-1.5 py-4 flex-1 relative group">
              {active && (
                <span className="absolute top-0 inset-x-4 h-0.5 rounded-full" style={{ background: "linear-gradient(90deg,transparent,#e8c060,#f5d98a,#e8c060,transparent)" }} />
              )}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
                style={active
                  ? { background: "linear-gradient(135deg,rgba(212,168,67,0.22),rgba(180,100,40,0.12))", border: "1px solid rgba(212,168,67,0.28)" }
                  : { border: "1px solid transparent" }}
              >
                <Icon
                  className="shrink-0 transition-all duration-300"
                  style={{ width: 18, height: 18, color: active ? "#e8c060" : "rgba(255,255,255,0.28)", filter: active ? "drop-shadow(0 0 6px rgba(232,192,96,0.55))" : "none" }}
                />
              </div>
              <span
                className="text-[7.5px] font-bold uppercase leading-none transition-all duration-300"
                style={{ color: active ? "#e8c060" : "rgba(255,255,255,0.22)", letterSpacing: "0.13em" }}
              >
                {label}
              </span>
            </Link>
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(180,120,30,0.2),transparent)" }} />
      </div>
    </div>
  );
}
