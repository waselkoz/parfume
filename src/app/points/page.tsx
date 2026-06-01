"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { CartDrawer } from "@/components/CartDrawer";
import { LoginModal } from "@/components/LoginModal";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift, Star, ShoppingBag, ArrowLeft, LogOut,
  Shield, ChevronRight, Lock, CheckCircle, Sparkles,
} from "lucide-react";

const TIERS = [
  { label: "Bronze",  min: 0,    next: 500  },
  { label: "Argent",  min: 500,  next: 1500 },
  { label: "Or",      min: 1500, next: 4000 },
  { label: "Platine", min: 4000, next: null },
];

export default function PointsPage() {
  const {
    currentUser, logout, userPoints, rewards,
    cart, pendingRedemption, setPendingRedemption,
  } = useApp();

  const [isCartOpen,  setIsCartOpen]  = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const cartCount     = cart.reduce((s, i) => s + i.quantity, 0);
  const activeRewards = rewards.filter(r => r.isActive);
  const affordable    = activeRewards.filter(r => r.pointsCost <= userPoints);
  const locked        = activeRewards.filter(r => r.pointsCost > userPoints);

  const currentTier = [...TIERS].reverse().find(t => userPoints >= t.min) ?? TIERS[0];
  const nextTier    = TIERS.find(t => t.min > userPoints);
  const progressPct = nextTier
    ? Math.min(100, Math.round(((userPoints - currentTier.min) / (nextTier.min - currentTier.min)) * 100))
    : 100;

  return (
    <div className="min-h-screen bg-white text-neutral-900" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* HEADER */}
      <header className="fixed top-0 inset-x-0 z-50" style={{ background: "#0f172a" }}>
        <div className="max-w-4xl mx-auto px-5 sm:px-8 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2" style={{ color: "rgba(255,255,255,0.45)" }}>
            <ArrowLeft className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] hidden sm:inline">Boutique</span>
          </Link>
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-white">Programme Fidélité</span>
          <div className="flex items-center gap-3">
            {currentUser?.role === "admin" && (
              <Link href="/admin" className="hidden sm:block" style={{ color: "rgba(255,255,255,0.3)" }}>
                <Shield className="h-4 w-4" />
              </Link>
            )}
            {currentUser ? (
              <button onClick={logout} style={{ color: "rgba(255,255,255,0.3)" }}>
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={() => setIsLoginOpen(true)}
                className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5"
                style={{ color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.15)" }}>
                Connexion
              </button>
            )}
            <button onClick={() => setIsCartOpen(true)} className="relative p-2"
              style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
              <ShoppingBag className="h-4 w-4" style={{ color: "rgba(255,255,255,0.6)" }} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-white text-black text-[9px] font-black rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {!currentUser ? (
        /* ── NOT LOGGED IN ── */
        <section className="min-h-screen flex items-center justify-center px-5 pt-14">
          <div className="max-w-md w-full text-center space-y-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="w-16 h-16 border border-neutral-200 flex items-center justify-center mx-auto mb-8">
                <Gift className="h-6 w-6 text-neutral-300" />
              </div>
              <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-neutral-400 mb-4">Maison Perfum Guy</p>
              <h1 className="text-5xl sm:text-6xl font-black leading-none tracking-tight text-neutral-900"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Fidélité
              </h1>
              <div className="w-8 h-px bg-neutral-200 mx-auto mt-5" />
              <p className="text-sm text-neutral-400 leading-relaxed mt-5 font-light">
                Gagnez des points à chaque achat.<br />Échangez-les contre des remises exclusives.
              </p>
            </motion.div>

            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              onClick={() => setIsLoginOpen(true)}
              className="w-full font-bold text-xs uppercase tracking-[0.2em] py-4 flex items-center justify-center gap-3"
              style={{ background: "#0f172a", color: "white" }}>
              Accéder à mon compte <ChevronRight className="h-4 w-4" />
            </motion.button>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
              className="grid grid-cols-3 gap-px bg-neutral-100 border border-neutral-100 overflow-hidden text-left">
              {[
                { icon: ShoppingBag, label: "Achetez",  sub: "Points par produit" },
                { icon: Star,        label: "Montez",   sub: "4 rangs exclusifs"  },
                { icon: Gift,        label: "Échangez", sub: "Remises & cadeaux"  },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="p-4 space-y-2 bg-white">
                  <Icon className="h-4 w-4 text-neutral-300" />
                  <p className="text-[10px] font-black uppercase tracking-wider text-neutral-700">{label}</p>
                  <p className="text-[9px] text-neutral-400 leading-tight">{sub}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

      ) : (
        /* ── LOGGED IN ── */
        <div className="pt-14">

          {/* BALANCE HERO */}
          <section className="border-b border-neutral-100 py-16 sm:py-20 bg-white">
            <div className="max-w-4xl mx-auto px-5 sm:px-8">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
                <div className="space-y-2">
                  <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-neutral-400">{currentUser.email}</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-8xl sm:text-9xl font-black leading-none tabular-nums text-neutral-900"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {userPoints}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 pb-3">pts</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">Points fidélité</p>
                </div>

                <div className="sm:text-right space-y-4 sm:pb-2">
                  <div className="inline-flex items-center gap-2 border border-neutral-200 px-4 py-2">
                    <Star className="h-3.5 w-3.5 text-neutral-400" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-neutral-800">
                      Rang {currentTier.label}
                    </span>
                  </div>

                  {nextTier ? (
                    <div className="space-y-2 sm:max-w-50 sm:ml-auto">
                      <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                        <span>{currentTier.label}</span>
                        <span>{nextTier.min - userPoints} pts → {nextTier.label}</span>
                      </div>
                      <div className="h-px bg-neutral-200 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-neutral-900" />
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center sm:justify-end gap-1.5">
                      <Sparkles className="h-3 w-3" /> Rang maximum
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          </section>

          <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10 pb-36 lg:pb-14 space-y-12">

            {/* TIERS */}
            <section className="space-y-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-neutral-400">Rangs</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-neutral-100 border border-neutral-100 overflow-hidden">
                {TIERS.map((tier, i) => {
                  const reached   = userPoints >= tier.min;
                  const isCurrent = tier.label === currentTier.label;
                  return (
                    <motion.div key={tier.label}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.07 }}
                      className="relative p-5 space-y-3 bg-white"
                      style={{ opacity: reached ? 1 : 0.4 }}>
                      {isCurrent && <div className="absolute top-0 inset-x-0 h-0.5 bg-neutral-900" />}
                      <Star className="h-4 w-4" style={{ color: reached ? "#0f172a" : "#d1d5db" }} />
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-neutral-900">{tier.label}</p>
                        <p className="text-[9px] text-neutral-400 mt-0.5">
                          {tier.min === 0 ? "Dès 0 pt" : `${tier.min.toLocaleString()}+ pts`}
                        </p>
                      </div>
                      {isCurrent && (
                        <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400">Actuel</span>
                      )}
                      {reached && !isCurrent && (
                        <CheckCircle className="h-3 w-3 text-neutral-300" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* REWARDS */}
            <section className="space-y-5">
              <div className="flex items-baseline justify-between">
                <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-neutral-400">Récompenses</p>
                {affordable.length > 0 && (
                  <span className="text-[9px] font-bold text-neutral-400">
                    {affordable.length} disponible{affordable.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {activeRewards.length === 0 && (
                <div className="border border-neutral-100 py-12 text-center">
                  <Gift className="h-6 w-6 mx-auto mb-3 text-neutral-200" />
                  <p className="text-xs text-neutral-400">Aucune récompense pour le moment</p>
                </div>
              )}

              {/* Affordable */}
              <div className="space-y-px bg-neutral-100 border border-neutral-100 overflow-hidden">
                {affordable.map((rw, i) => {
                  const isSelected = pendingRedemption?.id === rw.id;
                  return (
                    <motion.button key={rw.id} type="button"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      onClick={() => setPendingRedemption(isSelected ? null : rw)}
                      className="w-full text-left flex items-center gap-5 px-5 py-4 bg-white border-l-4 transition-none"
                      style={{ borderLeftColor: isSelected ? "#0f172a" : "transparent" }}>
                      <div className="w-10 h-10 border border-neutral-100 shrink-0 flex items-center justify-center bg-neutral-50">
                        <Gift className="h-4 w-4 text-neutral-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-neutral-900 truncate">{rw.name}</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">{rw.description}</p>
                        <p className="text-[9px] text-neutral-400 mt-0.5">
                          {rw.type === "discount" ? `−${rw.discountPercent}% sur votre commande` : rw.giftDescription}
                        </p>
                      </div>
                      <div className="shrink-0 text-right space-y-2">
                        <p className="text-sm font-black text-neutral-900">{rw.pointsCost}<span className="text-[9px] font-normal text-neutral-400 ml-1">pts</span></p>
                        <AnimatePresence mode="wait">
                          {isSelected ? (
                            <motion.span key="on" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-1 bg-neutral-900 text-white">
                              <CheckCircle className="h-2.5 w-2.5" /> Appliqué
                            </motion.span>
                          ) : (
                            <motion.span key="off" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-1 border border-neutral-200 text-neutral-500">
                              Utiliser
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Locked */}
              {locked.length > 0 && (
                <div className="space-y-px pt-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-300 pb-3">Bientôt disponibles</p>
                  <div className="space-y-px bg-neutral-100 border border-neutral-100 overflow-hidden">
                    {locked.map((rw, i) => (
                      <motion.div key={rw.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-5 px-5 py-4 bg-white opacity-50">
                        <div className="w-10 h-10 border border-neutral-100 shrink-0 flex items-center justify-center bg-neutral-50">
                          <Lock className="h-4 w-4 text-neutral-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-neutral-500 truncate">{rw.name}</p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">{rw.description}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-black text-neutral-400">{rw.pointsCost}<span className="text-[9px] font-normal ml-1">pts</span></p>
                          <p className="text-[9px] text-neutral-300 mt-0.5">−{rw.pointsCost - userPoints} pts</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* HOW TO EARN */}
            <section className="border border-neutral-100 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center gap-2 bg-neutral-50">
                <Sparkles className="h-3 w-3 text-neutral-400" />
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-500">Comment gagner des points</p>
              </div>
              {[
                { label: "Acheter un produit", detail: "Points indiqués sur chaque fiche produit" },
                { label: "Rang Bronze",        detail: "0 – 499 pts" },
                { label: "Rang Argent",        detail: "500 – 1 499 pts" },
                { label: "Rang Or",            detail: "1 500 – 3 999 pts" },
                { label: "Rang Platine",       detail: "4 000+ pts" },
              ].map(({ label, detail }, i) => (
                <div key={label} className="flex items-center justify-between px-5 py-3.5"
                  style={{ borderTop: i === 0 ? "none" : "1px solid #f5f5f5" }}>
                  <span className="text-xs font-semibold text-neutral-600">{label}</span>
                  <span className="text-[10px] text-neutral-400">{detail}</span>
                </div>
              ))}
            </section>
          </div>

          {/* STICKY REDEEM BANNER */}
          <AnimatePresence>
            {pendingRedemption && (
              <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
                className="fixed bottom-20 lg:bottom-6 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:min-w-80 z-40 border border-neutral-200 bg-white shadow-xl shadow-black/10">
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Récompense active</p>
                    <p className="text-sm font-black text-neutral-900">{pendingRedemption.name}</p>
                  </div>
                  <button onClick={() => setIsCartOpen(true)}
                    className="shrink-0 flex items-center gap-2 font-black text-[10px] uppercase tracking-wider px-4 py-2.5"
                    style={{ background: "#0f172a", color: "white" }}>
                    Panier <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <MobileBottomNav />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
