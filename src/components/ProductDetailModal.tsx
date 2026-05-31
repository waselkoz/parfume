"use client";

import React, { useState, useEffect } from "react";
import { Product, useApp } from "../context/AppContext";
import { X, Star, ShoppingBag, Wind, Layers, Anchor, Minus, Plus, ChevronRight, Check } from "lucide-react";

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const USD_TO_DZD = 135;
const formatDZD = (usd: number) => Math.round(usd * USD_TO_DZD).toLocaleString("fr-DZ") + " DA";

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart, products } = useApp();
  const [current, setCurrent] = useState<Product | null>(product);
  const [selectedSize, setSelectedSize] = useState<"50ml" | "100ml">("50ml");
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  useEffect(() => {
    setCurrent(product);
    setSelectedSize("50ml");
    setQuantity(1);
    setJustAdded(false);
  }, [product]);

  const switchProduct = (p: Product) => {
    setCurrent(p);
    setSelectedSize("50ml");
    setQuantity(1);
    setJustAdded(false);
    document.getElementById("pdm-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isOpen || !current) return null;

  const availableStock = current.stock[selectedSize];
  const unitPrice = selectedSize === "100ml" ? current.price * 1.5 : current.price;
  const totalPrice = unitPrice * quantity;

  const moreLikeIt = products
    .filter(p => p.category === current.category && p.id !== current.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(current, selectedSize);
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2200);
  };

  const handleSizeChange = (size: "50ml" | "100ml") => {
    setSelectedSize(size);
    setQuantity(1);
  };

  return (
    
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      style={{ background: "rgba(20,18,15,0.65)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
            <div
        id="pdm-scroll"
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-5xl max-h-[94vh] overflow-y-auto bg-white shadow-2xl animate-slide-up"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#e5e0d8 transparent" }}
      >
                <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 flex items-center justify-center border border-black/10 hover:border-black/50 text-black/35 hover:text-black transition-all bg-white/95 backdrop-blur-sm"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr]">

                    <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[560px] overflow-hidden bg-[#f5f3ef] select-none">
            <img
              src={current.image}
              alt={current.name}
              className="h-full w-full object-cover transition-all duration-700"
            />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-transparent pointer-events-none" />

                        <div className="absolute top-4 left-4">
              <span className="bg-white/90 backdrop-blur-sm text-[7.5px] font-black uppercase tracking-[0.35em] text-black/60 px-3 py-1.5">
                {current.category}
              </span>
            </div>

                        {(current.discountPercent ?? 0) > 0 && (
              <div className="absolute top-4 right-14">
                <span className="bg-black text-white text-[8px] font-black uppercase tracking-[0.12em] px-2.5 py-1.5">
                  −{current.discountPercent}%
                </span>
              </div>
            )}

                        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5">
              <Star className="h-3 w-3 fill-black text-black" />
              <span className="text-[11px] font-black text-black">{current.rating.toFixed(1)}</span>
              <span className="text-[9px] text-black/45 font-medium">({current.reviewsCount} avis)</span>
            </div>
          </div>

                    <div className="flex flex-col p-7 sm:p-10 lg:p-12 bg-white min-h-0">

                        <div className="pb-6 border-b border-black/6 mb-6">
              <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-black/30 mb-2">
                {current.brand ?? "Vélours"}
              </p>
              <h2 className="font-serif text-3xl sm:text-[2.5rem] font-light leading-tight tracking-wide text-black mb-3">
                {current.name}
              </h2>
              <p className="text-[11px] sm:text-xs leading-relaxed text-black/50 font-medium">
                {current.description}
              </p>
            </div>

                        <div className="mb-6">
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-black/25 mb-3">
                Pyramide Olfactive
              </p>
              <div className="space-y-2.5">
                {[
                  { Icon: Wind,   label: "Tête",   notes: current.topNotes },
                  { Icon: Layers, label: "Cœur",   notes: current.heartNotes },
                  { Icon: Anchor, label: "Fond",   notes: current.baseNotes },
                ].map(({ Icon, label, notes }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-7 h-7 flex items-center justify-center border border-black/8 bg-[#faf9f6] shrink-0 mt-0.5">
                      <Icon className="h-3 w-3 text-black/35" />
                    </div>
                    <div className="flex flex-wrap gap-x-1 gap-y-0.5 items-baseline">
                      <span className="text-[7.5px] font-black uppercase tracking-[0.25em] text-black/30 w-9 shrink-0 pt-0.5">
                        {label}
                      </span>
                      <span className="text-[10.5px] font-medium text-black/65 leading-snug">
                        {notes.join(" · ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

                        <div className="mb-5">
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-black/25 mb-2.5">Contenance</p>
              <div className="flex gap-2">
                {(["50ml", "100ml"] as const).map(size => (
                  <button
                    key={size}
                    onClick={() => handleSizeChange(size)}
                    className={`flex-1 py-3 border text-xs font-bold transition-all duration-200 ${
                      selectedSize === size
                        ? "border-black bg-black text-white"
                        : "border-black/10 text-black/45 hover:border-black/35 hover:text-black"
                    }`}
                  >
                    {size}
                    {size === "100ml" && (
                      <span className="block text-[7.5px] font-semibold mt-0.5 opacity-70">
                        Volume Premium
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

                        <div className="mb-7">
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-black/25 mb-2.5">Quantité</p>
              <div className="flex items-center gap-0">
                <div className="flex items-center border border-black/10">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-black/40 hover:text-black hover:bg-black/4 transition-colors"
                    aria-label="Diminuer"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-11 text-center text-sm font-black text-black select-none tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(availableStock, q + 1))}
                    disabled={quantity >= availableStock}
                    className="w-10 h-10 flex items-center justify-center text-black/40 hover:text-black hover:bg-black/4 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                    aria-label="Augmenter"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <span className="ml-3 text-[9px] text-black/30 font-medium">
                  {availableStock} en stock
                </span>
              </div>
            </div>

                        <div className="mt-auto pt-6 border-t border-black/6">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <span className="text-[8px] uppercase tracking-[0.3em] text-black/30 font-bold block mb-1">
                    Total
                  </span>
                  <span className="font-serif text-3xl font-bold text-black tracking-wide">
                    {formatDZD(totalPrice)}
                  </span>
                  {quantity > 1 && (
                    <span className="text-[9px] text-black/35 block mt-1">
                      {formatDZD(unitPrice)} / unité
                    </span>
                  )}
                </div>

                {(current.discountPercent ?? 0) > 0 && (
                  <div className="text-right">
                    <span className="text-[8px] uppercase tracking-[0.2em] text-black/25 block mb-0.5">
                      Prix original
                    </span>
                    <span className="text-sm font-bold text-black/30 line-through">
                      {formatDZD(unitPrice / (1 - (current.discountPercent ?? 0) / 100) * quantity)}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={availableStock === 0}
                className={`group w-full flex items-center justify-center gap-3 py-4 font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs transition-all duration-300 ${
                  justAdded
                    ? "bg-black/80 text-white"
                    : availableStock === 0
                      ? "bg-black/10 text-black/25 cursor-not-allowed"
                      : "bg-black text-white hover:bg-black/88 active:scale-[0.99]"
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="h-4 w-4" />
                    Ajouté au panier
                  </>
                ) : availableStock === 0 ? (
                  "Rupture de stock"
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                    Ajouter au panier — {selectedSize}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

                {moreLikeIt.length > 0 && (
          <div className="border-t border-black/6 bg-[#faf9f6]">
                        <div className="px-7 sm:px-10 lg:px-12 pt-8 pb-6 flex items-center justify-between">
              <div>
                <p className="text-[7.5px] font-black uppercase tracking-[0.45em] text-black/25 mb-1">
                  Dans la même veine
                </p>
                <h3 className="font-serif text-xl sm:text-2xl font-light text-black tracking-wide">
                  Vous aimerez aussi
                </h3>
              </div>
              <ChevronRight className="h-5 w-5 text-black/15" />
            </div>

                        <div className="px-7 sm:px-10 lg:px-12 pb-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {moreLikeIt.map(related => {
                const rStock = (related.stock["50ml"] ?? 0) + (related.stock["100ml"] ?? 0);
                const isOut = rStock === 0;
                const hasDiscount = (related.discountPercent ?? 0) > 0;
                const displayPrice = hasDiscount
                  ? related.price * (1 - (related.discountPercent ?? 0) / 100)
                  : related.price;

                return (
                  <button
                    key={related.id}
                    onClick={() => !isOut && switchProduct(related)}
                    disabled={isOut}
                    className={`group text-left border overflow-hidden transition-all duration-300 bg-white ${
                      isOut
                        ? "border-black/5 opacity-45 cursor-not-allowed"
                        : "border-black/5 hover:border-black/20 hover:shadow-xl hover:shadow-black/6 hover:-translate-y-0.5"
                    }`}
                  >
                                        <div className="aspect-[3/4] overflow-hidden relative bg-[#f5f3ef]">
                      <img
                        src={related.image}
                        alt={related.name}
                        className={`w-full h-full object-cover transition-transform duration-700 ${
                          isOut ? "grayscale opacity-60" : "group-hover:scale-105"
                        }`}
                      />

                                            {!isOut && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end p-3">
                          <span className="text-white text-[8px] font-black uppercase tracking-[0.25em]">
                            Voir →
                          </span>
                        </div>
                      )}

                                            {isOut && (
                        <div className="absolute inset-0 bg-white/55 flex items-center justify-center">
                          <span className="text-[7.5px] font-black uppercase tracking-[0.25em] text-black/35">
                            Épuisé
                          </span>
                        </div>
                      )}

                                            {hasDiscount && !isOut && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-black text-white text-[6.5px] font-black uppercase tracking-[0.1em] px-1.5 py-0.5">
                            −{related.discountPercent}%
                          </span>
                        </div>
                      )}
                    </div>

                                        <div className="p-3">
                      <p className="text-[7px] font-bold uppercase tracking-[0.15em] text-black/25 mb-0.5 truncate">
                        {related.category}
                      </p>
                      <h4 className="text-[10.5px] font-bold text-black leading-snug line-clamp-2 mb-1.5">
                        {related.name}
                      </h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-1">
                          {hasDiscount && (
                            <span className="text-[8.5px] font-bold text-black/25 line-through leading-none">
                              {formatDZD(related.price)}
                            </span>
                          )}
                          <span className={`text-[10px] font-black leading-none ${isOut ? "text-black/25" : "text-black"}`}>
                            {formatDZD(displayPrice)}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <Star className="h-2.5 w-2.5 fill-black/30 text-black/30" />
                          <span className="text-[8px] font-bold text-black/35">
                            {related.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
