"use client";

import React, { useState, use } from "react";
import { useApp } from "@/context/AppContext";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Star,
  ShoppingBag,
  Heart,
  Share2,
  ChevronRight,
  Package,
  Shield,
  Truck,
  Plus,
  Minus,
  Check,
  LogOut,
} from "lucide-react";
import { getRecommendations } from "@/lib/recommendations";
import { CartDrawer } from "@/components/CartDrawer";
import { LoginModal } from "@/components/LoginModal";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import ReviewSection from "@/components/ReviewSection";
import { toast } from "react-toastify";

const formatDZD = (price: number) => Math.round(price).toLocaleString("fr-DZ") + " DA";

// Alternate "package / bottle" images per product id
const SECONDARY_IMAGES: Record<string, string[]> = {
  "prod-1": [
    "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=800&auto=format&fit=crop",
  ],
  "prod-2": [
    "https://images.unsplash.com/photo-1615655404746-8f041380969b?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1557170330-1b13ae914f44?q=80&w=800&auto=format&fit=crop",
  ],
  "prod-3": [
    "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1563170351-be82bc888aa4?q=80&w=800&auto=format&fit=crop",
  ],
  "prod-4": [
    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1615655404746-8f041380969b?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1588405748373-122b2321bc31?q=80&w=800&auto=format&fit=crop",
  ],
  "prod-5": [
    "https://images.unsplash.com/photo-1588405748373-122b2321bc31?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=800&auto=format&fit=crop",
  ],
};

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { products, cart, addToCart, logout, currentUser } = useApp();

  const product = products.find((p) => p.id === id);
  const [selectedSize, setSelectedSize] = useState<string>(product?.variants?.[0]?.size || "50ml");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 px-6">
        <div className="w-20 h-20 border-2 border-black/10 flex items-center justify-center">
          <Package className="h-8 w-8 text-black/20" />
        </div>
        <h1 className="font-serif text-2xl text-black/60 font-light">Produit introuvable</h1>
        <Link
          href="/categories"
          className="text-[10px] font-bold uppercase tracking-[0.25em] text-black border border-black px-6 py-3 hover:bg-black hover:text-white transition-all"
        >
          Retour au Catalogue
        </Link>
      </div>
    );
  }

  const images =
    SECONDARY_IMAGES[product.id] || [product.image, product.image];
  const allImages = [product.image, ...images.slice(1)];

  const currentVariant = product.variants?.find((v) => v.size === selectedSize) || product.variants?.[0];
  const variantPrice = currentVariant?.price || 0;
  
  const discountedPrice =
    (product.discountPercent ?? 0) > 0
      ? variantPrice * (1 - (product.discountPercent ?? 0) / 100)
      : variantPrice;

  const totalStock = (product.variants || []).reduce((sum, v) => sum + v.stock, 0);
  const isOutOfStock = totalStock === 0;
  const isLowStock = totalStock > 0 && totalStock <= 5;

  const relatedProducts = getRecommendations(product, products, 3);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize);
    }
    setAddedToCart(true);
    toast.success(`${product.name} ajouté au panier`);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-8 py-3">
          <Link href="/categories" className="flex items-center gap-2 text-black/50 hover:text-black transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Catalogue</span>
          </Link>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-1.5 text-[8px] text-black/30 font-medium uppercase tracking-[0.15em]">
            <Link href="/" className="hover:text-black transition-colors">Accueil</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/categories" className="hover:text-black transition-colors">Catalogue</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-black/60 truncate max-w-[120px]">{product.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-black/50 hover:text-black transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 text-[7px] bg-black text-white font-bold flex items-center justify-center rounded-full">
                  {cartItemsCount}
                </span>
              )}
            </button>
            {currentUser && (
              <button onClick={logout} className="text-black/30 hover:text-red-500 transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 xl:gap-24">
          
          {/* ── LEFT: IMAGE GALLERY ── */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="relative aspect-[4/5] bg-neutral-50 border border-black/5 overflow-hidden group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={allImages[activeImage]}
                  alt={product.name}
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.45 }}
                />
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                {(product.discountPercent ?? 0) > 0 && (
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1 bg-black text-white">
                    -{product.discountPercent}%
                  </span>
                )}
                {isOutOfStock && (
                  <span className="text-[9px] font-black uppercase tracking-[0.1em] px-3 py-1 bg-red-500 text-white">
                    Épuisé
                  </span>
                )}
                {isLowStock && !isOutOfStock && (
                  <span className="text-[9px] font-black uppercase tracking-[0.1em] px-3 py-1 bg-neutral-800 text-white">
                    Stock limité
                  </span>
                )}
              </div>

              {/* Fav button */}
              <button
                onClick={() => setIsFav(!isFav)}
                className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-white/90 border border-black/5 shadow-sm hover:border-black/20 transition-all"
              >
                <Heart className={`h-4 w-4 transition-all ${isFav ? "fill-red-500 text-red-500" : "text-black/30"}`} />
              </button>

              {/* Image counter */}
              <div className="absolute bottom-4 right-4 bg-black/70 text-white text-[8px] font-bold px-2.5 py-1 tracking-wider">
                {activeImage + 1} / {allImages.length}
              </div>
            </div>

            {/* Thumbnail strip */}
            <div className="grid grid-cols-4 gap-2">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative aspect-square overflow-hidden border-2 transition-all ${
                    activeImage === i ? "border-black" : "border-transparent hover:border-black/20"
                  }`}
                >
                  <Image src={img} alt="" width={100} height={100} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* ── RIGHT: PRODUCT INFO ── */}
          <div className="space-y-6 lg:pt-4">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-neutral-600 border border-neutral-300 px-2.5 py-1">
                  {product.category}
                </span>
                {product.brand && (
                  <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-neutral-600">
                    {product.brand}
                  </span>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-wide text-black leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3.5 w-3.5 ${
                        star <= Math.round(product.rating)
                          ? "fill-neutral-800 text-neutral-800"
                          : "text-black/10"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-neutral-600">
                  {product.rating.toFixed(1)} ({product.reviewsCount} avis)
                </span>
              </div>
            </div>

            <div className="h-px bg-neutral-200" />

            {/* Price */}
            <div className="space-y-1">
              {(product.discountPercent ?? 0) > 0 ? (
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-black">
                    {formatDZD(discountedPrice)}
                  </span>
                  <span className="text-base text-neutral-500 line-through font-medium">
                    {formatDZD(variantPrice)}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] bg-black text-white px-2 py-0.5">
                    Promo
                  </span>
                </div>
              ) : (
                <span className="font-serif text-2xl sm:text-3xl font-bold text-black">
                  {formatDZD(discountedPrice)}
                </span>
              )}
              <p className="text-[9px] text-neutral-500 font-medium">Prix pour 50ml · Tous les flacons sont authentiques et scellés</p>
            </div>

            {/* Size selector */}
            <div className="space-y-2.5">
              <label className="text-[8px] font-bold uppercase tracking-[0.25em] text-neutral-600">
                Taille du flacon
              </label>
              <div className="flex gap-3">
                {product.variants?.map((v) => {
                  const stock = v.stock;
                  const priceToDisplay = (product.discountPercent ?? 0) > 0 ? v.price * (1 - (product.discountPercent ?? 0) / 100) : v.price;
                  return (
                    <button
                      key={v.size}
                      onClick={() => setSelectedSize(v.size)}
                      className={`relative flex flex-col items-center gap-1.5 border px-6 py-3 transition-all text-center ${
                        selectedSize === v.size
                          ? "border-black bg-black text-white"
                          : "border-neutral-300 hover:border-neutral-500 text-neutral-800"
                      } ${stock === 0 ? "bg-neutral-100 !border-neutral-200 !text-neutral-400 cursor-not-allowed" : ""}`}
                      disabled={stock === 0}
                    >
                      <span className="text-xs font-bold tracking-wide">{v.size}</span>
                      <span className="text-[8px] opacity-60">
                        {formatDZD(priceToDisplay)}
                      </span>
                      {stock > 0 && stock <= 5 && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[7px] bg-neutral-800 text-white font-bold px-1.5 py-0.5 whitespace-nowrap">
                          {stock} restant{stock > 1 ? "s" : ""}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity + Add to cart */}
            <div className="flex gap-3">
              <div className="flex items-center border border-neutral-300">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-12 flex items-center justify-center text-neutral-600 hover:text-black hover:bg-neutral-100 transition-all"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-bold text-black">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="w-10 h-12 flex items-center justify-center text-neutral-600 hover:text-black hover:bg-neutral-100 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 flex items-center justify-center gap-2.5 h-12 font-bold uppercase tracking-[0.2em] text-[10px] transition-all ${
                  addedToCart
                    ? "bg-emerald-600 text-white"
                    : isOutOfStock
                    ? "bg-neutral-200 text-neutral-500 cursor-not-allowed border border-neutral-300"
                    : "bg-black text-white hover:bg-neutral-800 active:scale-[0.98]"
                }`}
              >
                <AnimatePresence mode="wait">
                  {addedToCart ? (
                    <motion.span key="added" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <Check className="h-4 w-4" /> Ajouté au panier
                    </motion.span>
                  ) : (
                    <motion.span key="add" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      {isOutOfStock ? "Épuisé" : "Ajouter au panier"}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              <button
                className="w-12 h-12 flex items-center justify-center border border-neutral-300 hover:border-neutral-500 text-neutral-600 hover:text-black transition-all"
                onClick={() => navigator.share?.({ title: product.name, url: window.location.href }).catch(() => {})}
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3 py-4 border-y border-neutral-200">
              {[
                { icon: Truck, label: "Livraison rapide", sub: "Wilaya & domicile" },
                { icon: Shield, label: "100% Authentique", sub: "Flacons scellés" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1.5">
                  <Icon className="h-4 w-4 text-neutral-500" />
                  <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-neutral-600">{label}</span>
                  <span className="text-[7px] text-neutral-400">{sub}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h2 className="text-[9px] font-bold uppercase tracking-[0.25em] text-neutral-600">Description</h2>
              <p className="text-sm text-neutral-600 leading-relaxed font-light">{product.description}</p>
            </div>

          </div>
        </div>

        {/* ── REVIEWS SECTION ── */}
        <ReviewSection productId={product.id} />

        {/* ── RELATED PRODUCTS ── */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-black/5">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-xl font-light tracking-wide text-black">
                Vous aimerez aussi
              </h2>
              <Link
                href="/categories"
                className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/30 hover:text-black transition-colors flex items-center gap-1"
              >
                Tout voir <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-6">
              {relatedProducts.map((rel) => {
                const relDiscount = (rel.discountPercent ?? 0) > 0
                  ? (rel.variants?.[0]?.price || 0) * (1 - (rel.discountPercent ?? 0) / 100)
                  : (rel.variants?.[0]?.price || 0);
                const relImages = SECONDARY_IMAGES[rel.id] || [rel.image];

                return (
                  <Link key={rel.id} href={`/product/${rel.id}`} className="group block">
                    <div className="relative aspect-[3/4] bg-neutral-50 border border-black/5 overflow-hidden mb-3">
                      {/* Primary image */}
                      <Image
                        src={rel.image}
                        alt={rel.name}
                        width={400}
                        height={533}
                        className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:opacity-0"
                      />
                      {/* Secondary image fades in on hover */}
                      <Image
                        src={relImages[1] || rel.image}
                        alt={`${rel.name} — packaging`}
                        width={400}
                        height={533}
                        className="absolute inset-0 h-full w-full object-cover transition-all duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-105"
                      />
                      {/* Hover CTA */}
                      <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-400 bg-gradient-to-t from-black/70 to-transparent">
                        <span className="block text-center text-[9px] font-bold uppercase tracking-[0.2em] text-white">
                          Découvrir
                        </span>
                      </div>
                    </div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-black/30 mb-1">{rel.category}</p>
                    <h3 className="text-sm font-medium text-black group-hover:text-black/60 transition-colors">{rel.name}</h3>
                    <p className="text-[11px] font-bold text-black/50 mt-0.5">{formatDZD(relDiscount)}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 border border-black/10 hover:border-black text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 hover:text-black px-8 py-4 transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour au catalogue
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/5 mt-20 py-8 px-4 sm:px-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-serif text-sm tracking-[0.2em] font-bold uppercase text-neutral-800">Perfum</Link>
            <span className="w-px h-4 bg-neutral-200" />
            <span className="text-[9px] text-neutral-400 font-medium">guy</span>
          </div>
          <p className="text-[8px] text-neutral-300 uppercase tracking-[0.15em]">
            &copy; {new Date().getFullYear()} Perfum Guy. Tous droits réservés.
          </p>
        </div>
      </footer>

      <MobileBottomNav onCartOpen={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
