"use client";

import React, { useState, useEffect, startTransition } from "react";
import { Product, useApp } from "../context/AppContext";
import { X, Save, TrendingUp, Award, Percent, Package, ImageIcon } from "lucide-react";

interface ProductFormModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_IMAGES = [
  { name: "Classic Amber", url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop" },
  { name: "Dark Obsidian", url: "https://images.unsplash.com/photo-1615655404746-8f041380969b?q=80&w=600&auto=format&fit=crop" },
  { name: "Heavy Gold", url: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=600&auto=format&fit=crop" },
  { name: "Delicate Pink", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop" },
  { name: "Rose Imperial", url: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?q=80&w=600&auto=format&fit=crop" },
  { name: "Fresh Citrus", url: "https://images.unsplash.com/photo-1588405748373-122b2321bc31?q=80&w=600&auto=format&fit=crop" },
];

const FlagBtn = ({
  active, onClick, icon: Icon, label, activeClass,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  activeClass: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold transition-all ${active ? activeClass : "bg-white border-neutral-200 text-neutral-400 hover:border-neutral-400 hover:text-neutral-700"}`}
  >
    <Icon className="h-3.5 w-3.5" />
    {label}
    <span className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? "border-current" : "border-neutral-300"}`}>
      {active && <span className="w-2 h-2 rounded-full bg-current" />}
    </span>

  </button>
);

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, isOpen, onClose }) => {
  const { addProduct, updateProduct, categories } = useApp();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(150);
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [topNotesStr, setTopNotesStr] = useState("");
  const [heartNotesStr, setHeartNotesStr] = useState("");
  const [baseNotesStr, setBaseNotesStr] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [pointsEarned, setPointsEarned] = useState<number>(0);
  const [isTendance, setIsTendance] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  const [hoverImage, setHoverImage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    startTransition(() => {
      if (product) {
        setName(product.name);
        setDescription(product.description || "");
        setPrice(product.price);
        setCategory(product.category);
        setImage(product.image);
        setTopNotesStr(product.topNotes.join(", "));
        setHeartNotesStr(product.heartNotes.join(", "));
        setBaseNotesStr(product.baseNotes.join(", "));
        setDiscountPercent(product.discountPercent ?? 0);
        setPointsEarned(product.pointsEarned ?? 0);
        setIsTendance(product.isTendance ?? false);
        setIsBestSeller(product.isBestSeller ?? false);
        setHoverImage(product.hoverImage ?? "");
        const stock = (product.stock?.["50ml"] || 0) + (product.stock?.["100ml"] || 0);
        setIsOutOfStock(stock === 0);
      } else {
        setName(""); setDescription(""); setPrice(150);
        setCategory(categories[0]?.name || "");
        setImage(PRESET_IMAGES[0].url);
        setTopNotesStr(""); setHeartNotesStr(""); setBaseNotesStr("");
        setDiscountPercent(0); setPointsEarned(0); setIsTendance(false); setIsBestSeller(false); setIsOutOfStock(false); setHoverImage("");
      }
      setError("");
    });
  }, [product, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !category || !image) {
      setError("Nom, prix, catégorie et image sont obligatoires.");
      return;
    }
    if (price <= 0) { setError("Le prix doit être positif."); return; }

    const topNotes = topNotesStr.split(",").map(n => n.trim()).filter(Boolean);
    const heartNotes = heartNotesStr.split(",").map(n => n.trim()).filter(Boolean);
    const baseNotes = baseNotesStr.split(",").map(n => n.trim()).filter(Boolean);

    const stockValue = isOutOfStock
      ? { "50ml": 0, "100ml": 0 }
      : product?.stock || { "50ml": 15, "100ml": 8 };

    const itemDetails = {
      name,
      description,
      price: Number(price),
      category,
      image,
      topNotes,
      heartNotes,
      baseNotes,
      stock: stockValue,
      lowStockAlert: product?.lowStockAlert || 5,
      brand: product?.brand || "",
      discountPercent,
      pointsEarned,
      isTendance,
      isBestSeller,
      hoverImage: hoverImage || undefined,
    };

    if (product) { updateProduct(product.id, itemDetails); }
    else { addProduct(itemDetails); }
    onClose();
  };

  const inputCls = "w-full border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 rounded-lg focus:outline-none focus:border-neutral-800 transition-colors placeholder-neutral-400";
  const labelCls = "block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[92vh] flex flex-col border border-neutral-100">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <h3 className="text-base font-black text-neutral-900">
            {product ? "Modifier le parfum" : "Ajouter un parfum"}
          </h3>
          <button type="button" onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-medium px-4 py-2.5 rounded-lg">{error}</div>
          )}

          {/* ── FLAGS ─────────────────────────── */}
          <div>
            <p className={labelCls}>Statut du produit</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <FlagBtn active={isTendance} onClick={() => setIsTendance(v => !v)} icon={TrendingUp} label="Tendance" activeClass="bg-neutral-900 border-neutral-900 text-white" />
              <FlagBtn active={isBestSeller} onClick={() => setIsBestSeller(v => !v)} icon={Award} label="Best Seller" activeClass="bg-neutral-900 border-neutral-900 text-white" />
              <FlagBtn active={discountPercent > 0} onClick={() => setDiscountPercent(v => v > 0 ? 0 : 20)} icon={Percent} label="Promo" activeClass="bg-neutral-900 border-neutral-900 text-white" />
              <FlagBtn active={isOutOfStock} onClick={() => setIsOutOfStock(v => !v)} icon={Package} label="Rupture" activeClass="bg-neutral-900 border-neutral-900 text-white" />
            </div>
            {discountPercent > 0 && (
              <div className="mt-2 flex items-center gap-3">
                <label className="text-xs text-neutral-500 font-medium whitespace-nowrap">Remise (%)</label>
                <input type="number" min={1} max={90} value={discountPercent} onChange={e => setDiscountPercent(Number(e.target.value) || 0)} className="w-24 border border-neutral-200 rounded-lg px-3 py-1.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-800" />
              </div>
            )}
            <div className="mt-2 flex items-center gap-3">
              <label className="text-xs text-neutral-500 font-medium whitespace-nowrap">Points fidélité offerts</label>
              <input type="number" min={0} max={9999} value={pointsEarned} onChange={e => setPointsEarned(Number(e.target.value) || 0)} className="w-24 border border-neutral-200 rounded-lg px-3 py-1.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-800" />
              <span className="text-[10px] text-neutral-400">pts par unité achetée</span>
            </div>
          </div>

          <div className="h-px bg-neutral-100" />

          {/* ── NAME + PRICE + CATEGORY ───────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className={labelCls}>Nom *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="ex. Oud Royal" className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Prix ($) *</label>
              <input type="number" value={price === 0 ? "" : price} onChange={e => setPrice(Number(e.target.value))} placeholder="ex. 240" className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Catégorie *</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls} required>
                {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
              </select>
            </div>
          </div>

          {/* ── DESCRIPTION (optional) ────────── */}
          <div>
            <label className={labelCls}>Description <span className="text-neutral-400 normal-case font-normal">(optionnel)</span></label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description du parfum, ambiance, longevité, sillage..." rows={3} className={`${inputCls} resize-none leading-relaxed`} />
          </div>

          {/* ── NOTES (optional) ─────────────── */}
          <div>
            <p className={labelCls}>Pyramide olfactive <span className="text-neutral-400 normal-case font-normal">(optionnel — séparés par virgule)</span></p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">Notes de tête</label>
                <input type="text" value={topNotesStr} onChange={e => setTopNotesStr(e.target.value)} placeholder="Bergamote, Citron..." className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">Notes de cœur</label>
                <input type="text" value={heartNotesStr} onChange={e => setHeartNotesStr(e.target.value)} placeholder="Rose, Jasmin..." className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">Notes de fond</label>
                <input type="text" value={baseNotesStr} onChange={e => setBaseNotesStr(e.target.value)} placeholder="Santal, Musc..." className={inputCls} />
              </div>
            </div>
          </div>

          {/* ── IMAGE ────────────────────────── */}
          <div>
            <label className={labelCls}>Photo du flacon *</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
              {PRESET_IMAGES.map(preset => (
                <div
                  key={preset.name}
                  onClick={() => setImage(preset.url)}
                  className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${image === preset.url ? "border-neutral-900 ring-1 ring-neutral-900" : "border-neutral-200 hover:border-neutral-400"}`}
                >
                  <img src={preset.url} alt={preset.name} className="h-full w-full object-cover" />
                  {image === preset.url && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-neutral-900 block" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <input type="url" value={image} onChange={e => setImage(e.target.value)} placeholder="Ou coller une URL image personnalisée (https://...)" className={inputCls} />
          </div>

          {/* ── HOVER IMAGE (optional) ────── */}
          <div>
            <label className={labelCls}>
              <span className="flex items-center gap-1.5"><ImageIcon className="h-3 w-3" /> Image au survol <span className="text-neutral-400 normal-case font-normal">(optionnel — apparaît au hover sur la carte)</span></span>
            </label>
            <input type="url" value={hoverImage} onChange={e => setHoverImage(e.target.value)} placeholder="URL de l'image au survol (https://...)" className={inputCls} />
            {hoverImage && (
              <div className="mt-2 flex gap-3 items-start">
                <div className="w-16 h-22 rounded-lg overflow-hidden border border-neutral-200 shrink-0" style={{ height: "88px" }}>
                  <img src={hoverImage} alt="hover preview" className="w-full h-full object-cover" />
                </div>
                <p className="text-[10px] text-neutral-400 leading-relaxed pt-1">Cette image s'affiche quand l'utilisateur survole la carte produit dans le catalogue.</p>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-neutral-100 bg-neutral-50 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-400 rounded-lg transition-colors bg-white">
            Annuler
          </button>
          <button onClick={handleSubmit} className="flex items-center gap-2 bg-neutral-900 hover:bg-black text-white font-bold text-sm px-5 py-2 rounded-lg transition-colors">
            <Save className="h-4 w-4" />
            {product ? "Enregistrer" : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
};
