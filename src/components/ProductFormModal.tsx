"use client";

import React, { useState, useEffect, startTransition } from "react";
import { Product, useApp } from "../context/AppContext";
import { X, Plus, Trash2, Upload, ImageIcon, TrendingUp, Award, Percent, Save } from "lucide-react";
import { compressImage } from "@/lib/imageUtils";

interface ProductFormModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}



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

  const [activeLangTab, setActiveLangTab] = useState<"fr" | "en" | "ar">("fr");
  const [translations, setTranslations] = useState<Record<string, { name: string; description: string }>>({
    fr: { name: "", description: "" },
    en: { name: "", description: "" },
    ar: { name: "", description: "" },
  });

  const [variants, setVariants] = useState<{ size: string; price: number; stock: number }[]>([
    { size: "50ml", price: 150, stock: 15 }
  ]);

  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [topNotesStr, setTopNotesStr] = useState("");
  const [heartNotesStr, setHeartNotesStr] = useState("");
  const [baseNotesStr, setBaseNotesStr] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isTendance, setIsTendance] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [hoverImage, setHoverImage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    startTransition(() => {
      if (product) {
        setTranslations({
          fr: { name: product.name || "", description: product.description || "" },
          en: { name: product.translations?.en?.name || "", description: product.translations?.en?.description || "" },
          ar: { name: product.translations?.ar?.name || "", description: product.translations?.ar?.description || "" },
        });
        
        setVariants(product.variants && product.variants.length > 0 ? [...product.variants] : [{ size: "50ml", price: 150, stock: 15 }]);
        setCategory(product.category);
        setImage(product.image);
        setTopNotesStr(product.topNotes.join(", "));
        setHeartNotesStr(product.heartNotes.join(", "));
        setBaseNotesStr(product.baseNotes.join(", "));
        setDiscountPercent(product.discountPercent ?? 0);
        setIsTendance(product.isTendance ?? false);
        setIsBestSeller(product.isBestSeller ?? false);
        setHoverImage(product.hoverImage ?? "");
      } else {
        setTranslations({
          fr: { name: "", description: "" },
          en: { name: "", description: "" },
          ar: { name: "", description: "" },
        });
        setVariants([{ size: "50ml", price: 150, stock: 15 }]);
        setCategory(categories[0]?.name || "");
        setImage("");
        setTopNotesStr(""); setHeartNotesStr(""); setBaseNotesStr("");
        setDiscountPercent(0); setIsTendance(false); setIsBestSeller(false); setHoverImage("");
      }
      setError("");
      setActiveLangTab("fr");
    });
  }, [product, isOpen, categories]);

  if (!isOpen) return null;

  const handleTranslationChange = (lang: string, field: "name" | "description", value: string) => {
    setTranslations(prev => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value }
    }));
  };

  const handleVariantChange = (index: number, field: keyof typeof variants[0], value: string | number) => {
    const next = [...variants];
    next[index] = { ...next[index], [field]: value };
    setVariants(next);
  };

  const addVariant = () => setVariants([...variants, { size: "", price: 0, stock: 0 }]);
  const removeVariant = (idx: number) => setVariants(variants.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!translations.fr.name || !category || !image || variants.length === 0) {
      setError("Le nom (FR), la catégorie, l'image et au moins un format (variante) sont obligatoires.");
      return;
    }
    
    if (variants.some(v => !v.size || v.price <= 0)) {
      setError("Chaque format doit avoir une taille valide et un prix positif.");
      return;
    }

    const topNotes = topNotesStr.split(",").map(n => n.trim()).filter(Boolean);
    const heartNotes = heartNotesStr.split(",").map(n => n.trim()).filter(Boolean);
    const baseNotes = baseNotesStr.split(",").map(n => n.trim()).filter(Boolean);

    const itemDetails = {
      name: translations.fr.name,
      description: translations.fr.description,
      category,
      image,
      topNotes,
      heartNotes,
      baseNotes,
      variants,
      translations: {
        en: translations.en,
        ar: translations.ar
      },
      lowStockAlert: product?.lowStockAlert || 5,
      brand: product?.brand || "",
      discountPercent,
      isTendance,
      isBestSeller,
      hoverImage: hoverImage || undefined,
    };

    try {
      if (product) { await updateProduct(product.id, itemDetails); }
      else { await addProduct(itemDetails); }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Une erreur est survenue lors de l'enregistrement.";
      setError(msg);
    }
  };

  const inputCls = "w-full border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 rounded-lg focus:outline-none focus:border-neutral-800 transition-colors placeholder-neutral-400";
  const labelCls = "block text-sm font-bold uppercase tracking-wider text-neutral-500 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[92vh] flex flex-col border border-neutral-100">

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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
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
            </div>
            {discountPercent > 0 && (
              <div className="mt-2 flex items-center gap-3">
                <label className="text-xs text-neutral-500 font-medium whitespace-nowrap">Remise (%)</label>
                <input type="number" min={1} max={90} value={discountPercent} onChange={e => setDiscountPercent(Number(e.target.value) || 0)} className="w-24 border border-neutral-200 rounded-lg px-3 py-1.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-800" />
              </div>
            )}
          </div>

          <div className="h-px bg-neutral-100" />

          {/* ── TRANSLATIONS (Name & Desc) ───────── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <button type="button" onClick={() => setActiveLangTab("fr")} className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition-colors ${activeLangTab === "fr" ? "bg-neutral-900 text-white border-neutral-900" : "bg-neutral-50 text-neutral-500 border-neutral-200 hover:bg-neutral-100"}`}>Français (Defaut)</button>
              <button type="button" onClick={() => setActiveLangTab("en")} className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition-colors ${activeLangTab === "en" ? "bg-neutral-900 text-white border-neutral-900" : "bg-neutral-50 text-neutral-500 border-neutral-200 hover:bg-neutral-100"}`}>English</button>
              <button type="button" onClick={() => setActiveLangTab("ar")} className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition-colors ${activeLangTab === "ar" ? "bg-neutral-900 text-white border-neutral-900" : "bg-neutral-50 text-neutral-500 border-neutral-200 hover:bg-neutral-100"}`}>العربية</button>
            </div>
            
            <div className="space-y-4 p-4 border border-neutral-100 rounded-xl bg-neutral-50/50">
              <div>
                <label className={labelCls}>Nom ({activeLangTab.toUpperCase()}) {activeLangTab === "fr" && "*"}</label>
                <input 
                  type="text" 
                  value={translations[activeLangTab].name} 
                  onChange={e => handleTranslationChange(activeLangTab, "name", e.target.value)} 
                  placeholder={activeLangTab === "ar" ? "مثال: عطر العود" : "ex. Oud Royal"} 
                  className={inputCls} 
                  dir={activeLangTab === "ar" ? "rtl" : "ltr"}
                />
              </div>
              <div>
                <label className={labelCls}>Description ({activeLangTab.toUpperCase()})</label>
                <textarea 
                  value={translations[activeLangTab].description} 
                  onChange={e => handleTranslationChange(activeLangTab, "description", e.target.value)} 
                  placeholder="Description du parfum..." 
                  rows={3} 
                  className={`${inputCls} resize-none leading-relaxed`} 
                  dir={activeLangTab === "ar" ? "rtl" : "ltr"}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Catégories *</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map(c => c.name).map(catName => {
                  const isSelected = category.split(',').map(s => s.trim().toLowerCase()).includes(catName.toLowerCase());
                  return (
                    <button
                      key={catName}
                      type="button"
                      onClick={() => {
                        let current = category.split(',').map(s => s.trim()).filter(Boolean);
                        if (current.map(c => c.toLowerCase()).includes(catName.toLowerCase())) {
                          current = current.filter(c => c.toLowerCase() !== catName.toLowerCase());
                        } else {
                          current.push(catName);
                        }
                        setCategory(current.join(', '));
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${isSelected ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-400'}`}
                    >
                      {catName}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="h-px bg-neutral-100" />

          {/* ── FORMATS / VARIANTS ─────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className={labelCls + " !mb-0"}>Formats, Prix & Stock *</p>
              <button type="button" onClick={addVariant} className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg transition-colors">
                <Plus className="h-3 w-3" />
                Ajouter un format
              </button>
            </div>
            
            <div className="space-y-2">
              {variants.map((v, i) => (
                <div key={i} className="flex items-center gap-3 bg-white border border-neutral-200 p-2 rounded-lg">
                  <div className="flex-1">
                    <input type="text" value={v.size} onChange={e => handleVariantChange(i, "size", e.target.value)} placeholder="Taille (ex: 50ml)" className="w-full text-sm font-medium focus:outline-none" />
                  </div>
                  <div className="w-px h-6 bg-neutral-200" />
                  <div className="w-24">
                    <input type="number" value={v.price === 0 ? "" : v.price} onChange={e => handleVariantChange(i, "price", Number(e.target.value))} placeholder="Prix (DA)" className="w-full text-sm focus:outline-none" />
                  </div>
                  <div className="w-px h-6 bg-neutral-200" />
                  <div className="w-24">
                    <input type="number" value={v.stock} onChange={e => handleVariantChange(i, "stock", Number(e.target.value))} placeholder="Stock" className="w-full text-sm focus:outline-none" />
                  </div>
                  <button type="button" onClick={() => removeVariant(i)} className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-30" disabled={variants.length === 1}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>


          {/* ── IMAGE ────────────────────────── */}
          <div>
            <label className={labelCls}>Photo du flacon *</label>
            <div className="flex flex-col gap-4">
              <label className="cursor-pointer border-2 border-dashed border-neutral-300 hover:border-neutral-800 bg-neutral-50 hover:bg-neutral-100 transition-colors rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-neutral-600">
                <Upload className="h-6 w-6 mb-1 text-neutral-400" />
                <span className="text-sm font-bold text-neutral-800 text-center">Cliquez pour uploader une image depuis votre appareil</span>
                <span className="text-xs text-neutral-500">JPG, PNG, WEBP</span>
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const compressed = await compressImage(file, 800, 0.7);
                      setImage(compressed);
                    } catch (error) {
                      console.error("Image compression failed", error);
                    }
                  }
                }} />
              </label>

              <div className="flex gap-3 items-center">
                <div className="flex-1 h-px bg-neutral-200"></div>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">OU URL</span>
                <div className="flex-1 h-px bg-neutral-200"></div>
              </div>

              <div className="flex gap-3">
                <input type="url" value={image} onChange={e => setImage(e.target.value)} placeholder="Coller une URL image (https://...)" className={`${inputCls} flex-1`} />
                {image && (
                  <div className="h-10 w-10 flex-shrink-0 border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt="Preview" className="h-full w-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} onLoad={(e) => e.currentTarget.style.display = 'block'} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── HOVER IMAGE (optional) ────── */}
          <div>
            <label className={labelCls}>
              <span className="flex items-center gap-1.5"><ImageIcon className="h-3 w-3" /> Image au survol <span className="text-neutral-400 normal-case font-normal">(optionnel)</span></span>
            </label>
            <div className="flex flex-col gap-4">
              <label className="cursor-pointer border-2 border-dashed border-neutral-300 hover:border-neutral-800 bg-neutral-50 hover:bg-neutral-100 transition-colors rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-neutral-600">
                <Upload className="h-6 w-6 mb-1 text-neutral-400" />
                <span className="text-sm font-bold text-neutral-800 text-center">Cliquez pour uploader une image depuis votre appareil</span>
                <span className="text-xs text-neutral-500">JPG, PNG, WEBP</span>
                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const compressed = await compressImage(file, 800, 0.7);
                      setHoverImage(compressed);
                    } catch (error) {
                      console.error("Image compression failed", error);
                    }
                  }
                }} />
              </label>

              <div className="flex gap-3 items-center">
                <div className="flex-1 h-px bg-neutral-200"></div>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">OU URL</span>
                <div className="flex-1 h-px bg-neutral-200"></div>
              </div>

              <div className="flex gap-3">
                <input type="url" value={hoverImage} onChange={e => setHoverImage(e.target.value)} placeholder="URL de l'image (https://...)" className={`${inputCls} flex-1`} />
                {hoverImage && (
                  <div className="h-10 w-10 flex-shrink-0 border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={hoverImage} alt="Hover preview" className="h-full w-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} onLoad={(e) => e.currentTarget.style.display = 'block'} />
                  </div>
                )}
              </div>
            </div>
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
