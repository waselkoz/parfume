"use client";

import React, { useState, useRef, useMemo } from "react";
import { useApp, Product, Category, Brand } from "@/context/AppContext";
import { toast } from "react-toastify";
import { ProductFormModal } from "@/components/ProductFormModal";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  LogOut,
  ShoppingBag,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  Tag,
  CheckCircle,
  Truck,
  Clock,
  Crown,
  Flower2,
  Gem,
  Flame,
  Waves,
  Search,
  Package,
  BarChart3,
  Grid3X3,
  X,
  Percent,
  Building2,
  Save,
  Eye,
  Upload,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

type TabType = "overview" | "catalog" | "sections" | "orders" | "promo" | "nouveautes" | "marques" | "stock" | "hero" | "points";
type StockFilter = "all" | "in-stock" | "low-stock" | "out-of-stock";
type SortBy = "name" | "stock-asc" | "stock-desc" | "category";

interface PromoBanner {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  originalPrice: number;
  image: string;
  active: boolean;
  startDate: string;
  endDate: string;
}

interface Nouveaute {
  id: string;
  productId: string;
  featured: boolean;
  displayOrder: number;
  badge?: string;
}

interface Marque {
  id: string;
  name: string;
  logo: string;
  logoType: "text" | "image";
  description: string;
  website?: string;
  active: boolean;
}

interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  aboutText: string;
  contactEmail: string;
  footerText: string;
}

const getCategoryIcon = (iconName?: string) => {
  switch (iconName) {
    case "Crown": return Crown;
    case "Flower2": return Flower2;
    case "Gem": return Gem;
    case "Flame": return Flame;
    case "Waves": return Waves;
    case "Sparkles": return Sparkles;
    case "Tag":
    default: return Tag;
  }
};

export default function AdminDashboard() {
  const {
    isLoaded,
    products,
    categories,
    brands,
    orders,
    currentUser,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    addBrand,
    updateBrand,
    deleteBrand,
    logout,
    login,
    updateOrderStatus,
    updateProductStock,
    updateProduct,
  } = useApp();

  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandLogo, setNewBrandLogo] = useState("");
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminSubmitting, setAdminSubmitting] = useState(false);

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    
    if (!adminEmail || !adminPassword) {
      setAdminError("Champs obligatoires.");
      return;
    }

    setAdminSubmitting(true);
    try {
      const res = await login(adminEmail, adminPassword);
      if (!res.success) {
        setAdminError(res.error || "Identifiants invalides.");
      }
    } catch (_err) {
      setAdminError("Une erreur de connexion au serveur est survenue.");
    } finally {
      setAdminSubmitting(false);
    }
  };

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("Tag");
  const [newCatImageUrl, setNewCatImageUrl] = useState("");
  const [catError, setCatError] = useState("");

  const [syncingElogistia, setSyncingElogistia] = useState(false);
  const handleSyncElogistia = async () => {
    setSyncingElogistia(true);
    try {
      const res = await fetch("/api/delivery/sync", { method: "POST" });
      if (res.ok) {
        showSuccess("Synchronisation Elogistia terminée. Actualisez pour voir les changements.");
      } else {
        toast.error("Erreur de synchronisation Elogistia.");
      }
    } catch (e) {
      toast.error("Erreur de réseau lors de la synchronisation.");
    } finally {
      setSyncingElogistia(false);
    }
  };

  const [_promos, _setPromos] = useState<PromoBanner[]>([
    {
      id: "promo-1",
      title: "Collection Printemps",
      description: "Découvrez notre collection printanière à prix réduit.",
      discountPercent: 30,
      originalPrice: 180,
      image: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?q=80&w=800&auto=format&fit=crop",
      active: true,
      startDate: "2026-03-01",
      endDate: "2026-06-30"
    }
  ]);
  const [_editingPromo, _setEditingPromo] = useState<PromoBanner | null>(null);
  const [_showPromoForm, _setShowPromoForm] = useState(false);

  const [nouveautes, setNouveautes] = useState<Nouveaute[]>(() => {
    const firstThree = products.slice(0, 3);
    return firstThree.map((p, i) => ({
      id: `new-${i + 1}`,
      productId: p.id,
      featured: i === 0,
      displayOrder: i + 1,
      badge: i === 0 ? "Nouveau" : i === 2 ? "Best-seller" : ""
    }));
  });

  const [marques, setMarques] = useState<Marque[]>([
    { id: "marque-1", name: "Chanel", logo: "CHANEL", logoType: "text", description: "Haute Parfumerie", website: "https://chanel.com", active: true },
    { id: "marque-2", name: "Dior", logo: "DIOR", logoType: "text", description: "Maison de Luxe", website: "https://dior.com", active: true },
    { id: "marque-3", name: "Guerlain", logo: "GUERLAIN", logoType: "text", description: "Parfumeur depuis 1828", website: "https://guerlain.com", active: true },
    { id: "marque-4", name: "Hermès", logo: "HERMÈS", logoType: "text", description: "Artisan Parfumeur", website: "https://hermes.com", active: true },
  ]);
  const [editingMarque, setEditingMarque] = useState<Marque | null>(null);
  const [showMarqueForm, setShowMarqueForm] = useState(false);

  const [_settings, _setSettings] = useState<SiteSettings>({
    heroTitle: "L'Art de la Parfumerie",
    heroSubtitle: "Des formulations d'exception qui capturent l'essence même du luxe.",
    heroCta: "Découvrir",
    aboutText: "MD Parfum propose une sélection soigneuse de fragrances authentiques.",
    contactEmail: "contact@m38dparfum.com",
    footerText: "© 2026 MD Parfum. Tous droits réservés."
  });

  // Hero carousel state
  const [heroProductIds, setHeroProductIds] = React.useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try { return JSON.parse(localStorage.getItem("parfumguy-hero-ids") || "[]"); } catch { return []; }
    }
    return [];
  });
  const [heroBgUrl, setHeroBgUrl] = React.useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("parfumguy-hero-bg") || "";
    }
    return "";
  });

  const saveHeroConfig = (ids: string[], bg: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("parfumguy-hero-ids", JSON.stringify(ids));
      localStorage.setItem("parfumguy-hero-bg", bg);
    }
  };

  const addHeroProduct = (productId: string) => {
    if (heroProductIds.includes(productId)) { showSuccess("Déjà dans le carousel"); return; }
    const next = [...heroProductIds, productId];
    setHeroProductIds(next);
    saveHeroConfig(next, heroBgUrl);
    showSuccess("Parfum ajouté au carousel héro");
  };

  const removeHeroProduct = (productId: string) => {
    const next = heroProductIds.filter(id => id !== productId);
    setHeroProductIds(next);
    saveHeroConfig(next, heroBgUrl);
    showSuccess("Parfum retiré du carousel héro");
  };

  const moveHeroProduct = (productId: string, dir: -1 | 1) => {
    const idx = heroProductIds.indexOf(productId);
    if (idx === -1) return;
    const next = [...heroProductIds];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setHeroProductIds(next);
    saveHeroConfig(next, heroBgUrl);
  };

  // Stock management state
  const [stockSearchTerm, setStockSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [stockSortBy, setStockSortBy] = useState<SortBy>("name");
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editStockValues, setEditStockValues] = useState<Record<string, number>>({});
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const showSuccess = (message: string) => toast.success(message);



  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, marqueId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      if (marqueId) {
        setMarques(prev => prev.map(m => m.id === marqueId ? { ...m, logo: imageUrl, logoType: "image" } : m));
      }
    };
    reader.readAsDataURL(file);
  };

  const getStockStatus = (product: Product) => {
    const totalStock = product.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;
    const threshold = product.lowStockAlert || 5;
    
    if (totalStock === 0) return "out-of-stock";
    if (totalStock <= threshold || product.variants?.some(v => (v.stock || 0) <= threshold)) {
      return "low-stock";
    }
    return "in-stock";
  };

  const filteredStockProducts = useMemo(() => {
    let filtered = [...products];

    if (stockSearchTerm) {
      const q = stockSearchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }

    if (stockFilter !== "all") {
      filtered = filtered.filter(p => getStockStatus(p) === stockFilter);
    }

    if (showLowStockOnly) {
      filtered = filtered.filter(p => getStockStatus(p) === "low-stock" || getStockStatus(p) === "out-of-stock");
    }

    filtered.sort((a, b) => {
      const totalA = a.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;
      const totalB = b.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;
      
      switch (stockSortBy) {
        case "stock-asc": return totalA - totalB;
        case "stock-desc": return totalB - totalA;
        case "category": return (a.category || "").localeCompare(b.category || "");
        default: return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [products, stockSearchTerm, stockFilter, stockSortBy, showLowStockOnly]);

  const stockStats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter(p => getStockStatus(p) === "in-stock").length;
    const lowStock = products.filter(p => getStockStatus(p) === "low-stock").length;
    const outOfStock = products.filter(p => getStockStatus(p) === "out-of-stock").length;
    const totalUnits = products.reduce((sum, p) => sum + (p.variants?.reduce((s, v) => s + (v.stock || 0), 0) || 0), 0);
    return { total, inStock, lowStock, outOfStock, totalUnits };
  }, [products]);

  const startStockEditing = (product: Product) => {
    setEditingStockId(product.id);
    setEditStockValues(product.variants?.reduce((acc, v) => ({ ...acc, [v.size]: v.stock }), {} as Record<string, number>) || {});
  };

  const saveStockEditing = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product || !product.variants) return;
    
    const updatedVariants = product.variants.map(v => ({
      ...v,
      stock: editStockValues[v.size] !== undefined ? editStockValues[v.size] : v.stock
    }));

    updateProduct(productId, { variants: updatedVariants });
    setEditingStockId(null);
    showSuccess("Stock mis à jour");
  };

  const updateStock = (id: string, size: string, delta: number) => {
    // Dans un vrai projet, appeler l'API
    showSuccess("Stock mis à jour");
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-lg bg-white border border-neutral-200 shadow-xl overflow-hidden"
        >
          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900" />

          <div className="p-10">
            {/* Logo */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-neutral-900 flex items-center justify-center">
                  <ShieldAlert className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-xl font-bold tracking-[0.15em] text-neutral-900 uppercase">Administration</h1>
                </div>
              </div>
              <div className="h-px bg-neutral-100 w-full" />
            </div>

            <form onSubmit={handleAdminLoginSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-neutral-50 border border-neutral-200 focus:border-neutral-900 text-neutral-800 text-sm px-4 py-3 outline-none transition-all placeholder:text-neutral-400 rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-neutral-50 border border-neutral-200 focus:border-neutral-900 text-neutral-800 text-sm px-4 py-3 outline-none transition-all placeholder:text-neutral-400 rounded-lg font-medium"
                />
              </div>

              {adminError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-lg">
                  {adminError}
                </div>
              )}

              <button
                type="submit"
                disabled={adminSubmitting}
                className="w-full bg-neutral-900 hover:bg-black text-white font-bold text-sm py-4 transition-all rounded-lg disabled:opacity-50"
              >
                {adminSubmitting ? "Connexion en cours..." : "Se connecter"}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  const totalSales = orders.filter(o => o.status !== "Pending").reduce((acc, order) => acc + order.totalPrice, 0);
  const ordersVolume = orders.length;
  const activeProducts = products.length;
  const activeSections = categories.length;
  const pendingOrders = orders.filter(o => o.status === "Pending").length;
  const activePromos = products.filter(p => (p.discountPercent || 0) > 0).length;

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !newCatDesc) {
      setCatError("Veuillez remplir tous les champs.");
      return;
    }

    if (editingCategory) {
      // Edit Mode
      updateCategory(editingCategory.id, {
        name: newCatName,
        description: newCatDesc,
        icon: newCatIcon,
        imageUrl: newCatImageUrl
      });
      setEditingCategory(null);
      showSuccess("Section modifiée avec succès");
    } else {
      // Add Mode
      if (categories.some((c) => c.name.toLowerCase() === newCatName.toLowerCase())) {
        setCatError("Cette section existe déjà.");
        return;
      }
      addCategory({ 
        name: newCatName, 
        description: newCatDesc, 
        icon: newCatIcon, 
        imageUrl: newCatImageUrl 
      });
      showSuccess("Section créée avec succès");
    }

    setNewCatName("");
    setNewCatDesc("");
    setNewCatIcon("Tag");
    setNewCatImageUrl("");
    setCatError("");
  };

  const handleOrderStatusToggle = (orderId: string, currentStatus: string) => {
    let nextStatus: "Pending" | "Shipped" | "Completed" = "Pending";
    if (currentStatus === "Pending") nextStatus = "Shipped";
    else if (currentStatus === "Shipped") nextStatus = "Completed";
    updateOrderStatus(orderId, nextStatus);
    showSuccess(`Commande mise à jour: ${nextStatus}`);
  };

  const _handleSavePromo = (promo: PromoBanner) => {
    if (_editingPromo) {
      _setPromos(prev => prev.map(p => p.id === promo.id ? promo : p));
    } else {
      _setPromos(prev => [...prev, { ...promo, id: `promo-${Date.now()}` }]);
    }
    _setShowPromoForm(false);
    _setEditingPromo(null);
    showSuccess(_editingPromo ? "Promotion mise à jour" : "Nouvelle promotion créée");
  };

  const _handleDeletePromo = (id: string) => {
    _setPromos(prev => prev.filter(p => p.id !== id));
    showSuccess("Promotion supprimée");
  };

  const handleSaveMarque = (marque: Marque) => {
    if (editingMarque) {
      setMarques(prev => prev.map(m => m.id === marque.id ? marque : m));
    } else {
      setMarques(prev => [...prev, { ...marque, id: `marque-${Date.now()}` }]);
    }
    setShowMarqueForm(false);
    setEditingMarque(null);
    showSuccess(editingMarque ? "Marque mise à jour" : "Nouvelle marque ajoutée");
  };

  const handleDeleteMarque = (id: string) => {
    setMarques(prev => prev.filter(m => m.id !== id));
    showSuccess("Marque supprimée");
  };

  const handleAddNouveaute = (productId: string) => {
    if (nouveautes.some(n => n.productId === productId)) {
      showSuccess("Ce produit est déjà dans les nouveautés");
      return;
    }
    setNouveautes(prev => [...prev, {
      id: `new-${Date.now()}`,
      productId,
      featured: false,
      displayOrder: prev.length + 1,
      badge: ""
    }]);
    showSuccess("Produit ajouté aux nouveautés");
  };

  const handleRemoveNouveaute = (id: string) => {
    setNouveautes(prev => prev.filter(n => n.id !== id));
    showSuccess("Produit retiré des nouveautés");
  };

  const handleNouveauteBadge = (id: string, badge: string) => {
    setNouveautes(prev => prev.map(n => n.id === id ? { ...n, badge } : n));
  };

  const handleNouveauteToggle = (id: string) => {
    setNouveautes(prev => prev.map(n => n.id === id ? { ...n, featured: !n.featured } : n));
  };

  const _handleSaveSettings = () => {
    showSuccess("Paramètres enregistrés avec succès");
    localStorage.setItem("parfumguy-settings", JSON.stringify(_settings));
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Completed": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Shipped": return "bg-sky-50 text-sky-700 border-sky-200";
      default: return "bg-neutral-100 text-neutral-700 border-neutral-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed": return <CheckCircle className="h-3 w-3" />;
      case "Shipped": return <Truck className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const lowStockCount = products.filter(p => getStockStatus(p) === "low-stock" || getStockStatus(p) === "out-of-stock").length;

  const tabs: { id: TabType; label: string; icon: React.ElementType; count?: number }[] = [
    { id: "overview", label: "Vue d'ensemble", icon: BarChart3 },
    { id: "catalog", label: "Catalogue", icon: Grid3X3, count: activeProducts },
    { id: "stock", label: "Stock", icon: Package, count: lowStockCount },
    { id: "hero", label: "Carousel Héro", icon: Layers, count: heroProductIds.length },
    { id: "sections", label: "Sections", icon: Tag, count: activeSections },
    { id: "orders", label: "Commandes", icon: ShoppingBag, count: ordersVolume },
    { id: "promo", label: "Promotions", icon: Percent, count: activePromos },
    { id: "nouveautes", label: "Nouveautés", icon: Sparkles },
    { id: "marques", label: "Nos Marques", icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800" style={{ fontSize: "16px" }}>
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
          <div className="flex items-center gap-5">
            <div className="w-9 h-9 bg-neutral-900 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-[0.1em] text-neutral-900 uppercase block leading-none">MD Parfum</span>
              <span className="text-xs tracking-[0.2em] text-neutral-400 uppercase font-medium">Dashboard Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-neutral-600 hidden sm:inline">{currentUser.email}</span>
            </div>
            <Link href="/" className="flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors border border-neutral-200 hover:border-neutral-400 px-4 py-2 rounded-lg">
              <Eye className="h-4 w-4" /> Voir la boutique
            </Link>
            <button onClick={logout} className="flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-red-500 transition-colors border border-neutral-200 hover:border-red-200 px-3 py-2 rounded-lg">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

<main className="mx-auto max-w-7xl px-8 py-8 space-y-8">

        {/* STATS */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Revenus totaux", value: `${Math.round(totalSales).toLocaleString("fr-DZ")} DA`, icon: DollarSign },
            { label: "Commandes", value: ordersVolume, sub: `${pendingOrders} en attente`, icon: ShoppingBag },
            { label: "Produits", value: activeProducts, icon: Package },
            { label: "Catégories", value: activeSections, icon: Layers },
            { label: "Promos actives", value: activePromos, icon: Percent },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-neutral-200 rounded-xl p-5 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold block">{stat.label}</span>
                  <span className="text-2xl font-black text-neutral-900 block">{stat.value}</span>
                  {stat.sub && <span className="text-xs text-neutral-400 font-medium block">{stat.sub}</span>}
                </div>
                <div className="w-10 h-10 bg-neutral-50 border border-neutral-100 rounded-xl flex items-center justify-center">
                  <Icon className="h-5 w-5 text-neutral-400" />
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* TABS */}
        <div className="flex border-b border-neutral-200 gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-4 px-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400 hover:text-neutral-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    tab.id === "stock" && tab.count > 0
                      ? "bg-red-100 text-red-600"
                      : activeTab === tab.id ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
            
            {/* ========== OVERVIEW ========== */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-xl p-7 space-y-5">
                  <h3 className="text-base font-bold text-neutral-800">Commandes récentes</h3>
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center justify-between border-b border-neutral-100 pb-4 last:border-0">
                      <div>
                        <p className="text-sm font-bold text-neutral-800">{order.id} · {order.firstName || ""} {order.lastName || ""}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{order.phone || ""} · {order.wilaya || ""}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-neutral-900">{Math.round(order.totalPrice).toLocaleString("fr-DZ")} DA</span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusStyle(order.status)}`}>{order.status}</span>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && <p className="text-sm text-neutral-400 text-center py-10">Aucune commande pour l&apos;instant</p>}
                </div>
                <div className="bg-white border border-neutral-200 rounded-xl p-7 space-y-5">
                  <h3 className="text-base font-bold text-neutral-800">Résumé</h3>
                  {[
                    { label: "En attente", value: pendingOrders, color: "bg-neutral-600" },
                    { label: "Expédiées", value: orders.filter(o => o.status === "Shipped").length, color: "bg-sky-400" },
                    { label: "Complétées", value: orders.filter(o => o.status === "Completed").length, color: "bg-emerald-400" },
                    { label: "Alertes stock", value: lowStockCount, color: "bg-red-400" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                        <span className="text-sm text-neutral-600 font-medium">{item.label}</span>
                      </div>
                      <span className="text-sm font-bold text-neutral-800">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========== CATALOG ========== */}
            {activeTab === "catalog" && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input type="text" placeholder="Rechercher un produit..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white border border-neutral-200 pl-11 pr-4 py-3 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-500 rounded-lg" />
                  </div>
                  <button onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}
                    className="flex items-center gap-2 bg-neutral-900 hover:bg-black text-white font-semibold text-sm px-5 py-3 transition-all rounded-lg">
                    <Plus className="h-4 w-4" /> Nouveau produit
                  </button>
                </div>
                <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-neutral-200 bg-neutral-50">
                          <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Produit</th>
                          <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500">Catégorie</th>
                          <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 text-right">Prix</th>
                          <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 text-center">Stock</th>
                          <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-neutral-500 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {filteredProducts.map(product => (
                          <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-4">
                                <div className="h-12 w-9 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50 flex-shrink-0">
                                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-neutral-800 truncate">{product.name}</p>
                                  <p className="text-xs text-neutral-400 truncate max-w-[220px] mt-0.5">{product.description}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4"><span className="text-sm text-neutral-500">{product.category}</span></td>
                            <td className="px-5 py-4 text-right"><span className="text-sm font-bold text-neutral-900">{Math.round((product.variants?.[0]?.price || 0)).toLocaleString("fr-DZ")} DA</span></td>
                            <td className="px-5 py-4 text-center">
                              {(() => {
                                const total = product.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;
                                const isOos = total === 0;
                                return (
                                  <span
                                    title={isOos ? "Rupture de stock" : "En stock"}
                                    className={`inline-flex items-center gap-1.5 text-sm font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition-all ${
                                      isOos
                                        ? "bg-red-50 text-red-500 border-red-200"
                                        : "bg-emerald-50 text-emerald-600 border-emerald-200"
                                    }`}
                                  >
                                    {isOos ? <XCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                                    {isOos ? `Rupture (0)` : `En stock (${total})`}
                                  </span>
                                );
                              })()}
                            </td>
                            <td className="px-5 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => { setEditingProduct(product); setIsFormOpen(true); }} className="text-neutral-400 hover:text-neutral-900 transition-colors p-2 hover:bg-neutral-100 rounded-lg"><Edit2 className="h-4 w-4" /></button>
                                <button onClick={() => { deleteProduct(product.id); showSuccess("Produit supprimé"); }} className="text-neutral-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredProducts.length === 0 && (
                    <div className="text-center py-20">
                      <Package className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                      <p className="text-sm text-neutral-400 font-medium">Aucun produit trouvé</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========== STOCK MANAGEMENT ========== */}
            {activeTab === "stock" && (
              <div className="space-y-6">
                {/* Stock Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                  {[
                    { label: "Unités totales", value: stockStats.totalUnits, icon: Package, color: "text-neutral-600" },
                    { label: "En stock", value: stockStats.inStock, icon: CheckCircle2, color: "text-emerald-500" },
                    { label: "Stock bas", value: stockStats.lowStock, icon: AlertTriangle, color: "text-neutral-500" },
                    { label: "Rupture", value: stockStats.outOfStock, icon: XCircle, color: "text-red-500" },
                    { label: "Produits", value: stockStats.total, icon: TrendingUp, color: "text-neutral-600" },
                  ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white border border-neutral-200 p-4 flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <span className="text-sm uppercase tracking-[0.15em] text-neutral-400 font-bold">{stat.label}</span>
                          <span className="font-sans text-xl font-bold text-neutral-900">{stat.value}</span>
                        </div>
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                      </motion.div>
                    );
                  })}
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative w-48">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                      <input type="text" placeholder="Rechercher..." value={stockSearchTerm} onChange={(e) => setStockSearchTerm(e.target.value)}
                        className="w-full bg-white border border-neutral-200 pl-9 pr-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-400" />
                    </div>
                    <select value={stockSortBy} onChange={(e) => setStockSortBy(e.target.value as SortBy)}
                      className="bg-white border border-neutral-200 px-3 py-2.5 text-sm text-neutral-700 focus:outline-none focus:border-neutral-400">
                      <option value="name">Trier par nom</option>
                      <option value="stock-asc">Stock ↑</option>
                      <option value="stock-desc">Stock ↓</option>
                      <option value="category">Catégorie</option>
                    </select>
                    <div className="flex items-center border border-neutral-200">
                      {([
                        { value: "all", label: "Tous" },
                        { value: "in-stock", label: "En stock" },
                        { value: "low-stock", label: "Bas" },
                        { value: "out-of-stock", label: "Rupture" },
                      ] as { value: StockFilter; label: string }[]).map((f) => (
                        <button key={f.value} onClick={() => setStockFilter(f.value)}
                          className={`text-sm font-bold uppercase tracking-[0.1em] px-3 py-2 transition-all ${
                            stockFilter === f.value ? "bg-neutral-900 text-white" : "text-neutral-400 hover:text-neutral-700"
                          }`}>{f.label}</button>
                      ))}
                    </div>
                    <button onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                      className={`flex items-center gap-1.5 text-sm font-bold uppercase tracking-[0.1em] px-3 py-2 border transition-all ${
                        showLowStockOnly ? "border-red-300 bg-red-50 text-red-600" : "border-neutral-200 text-neutral-400 hover:text-neutral-700"
                      }`}>
                      <AlertTriangle className="h-3 w-3" />
                      Alertes seulement
                    </button>
                  </div>
                </div>

                {/* Stock Table */}
                <div className="bg-white border border-neutral-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-neutral-200 bg-neutral-50">
                          <th className="p-3 text-xs font-bold uppercase tracking-[0.1em] text-neutral-400">Produit</th>
                          <th className="p-3 text-xs font-bold uppercase tracking-[0.1em] text-neutral-400 text-center">Formats & Stock</th>
                          <th className="p-3 text-xs font-bold uppercase tracking-[0.1em] text-neutral-400 text-center">Total</th>
                          <th className="p-3 text-xs font-bold uppercase tracking-[0.1em] text-neutral-400 text-center">Statut</th>
                          <th className="p-3 text-xs font-bold uppercase tracking-[0.1em] text-neutral-400 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {filteredStockProducts.map((product) => {
                          const status = getStockStatus(product);
                          const totalStock = product.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0;
                          const isEditing = editingStockId === product.id;

                          return (
                            <tr key={product.id} className="hover:bg-neutral-50/50 transition-colors">
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-8 overflow-hidden border border-neutral-200 bg-neutral-50 flex-shrink-0">
                                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold text-neutral-800 truncate">{product.name}</p>
                                    <p className="text-sm text-neutral-400">{product.category}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="space-y-1">
                                  {product.variants?.map((v, i) => (
                                    <div key={i} className="flex items-center justify-between gap-4 text-sm max-w-xs mx-auto">
                                      <span className="text-neutral-500 font-medium">{v.size}</span>
                                      {isEditing ? (
                                        <input type="number" min="0" value={editStockValues[v.size] ?? v.stock}
                                          onChange={(e) => setEditStockValues(prev => ({ ...prev, [v.size]: parseInt(e.target.value) || 0 }))}
                                          className="w-16 border border-neutral-300 px-2 py-0.5 text-right focus:outline-none focus:border-neutral-500" />
                                      ) : (
                                        <span className={`font-bold ${v.stock <= (product.lowStockAlert || 5) ? 'text-red-500' : 'text-neutral-700'}`}>
                                          {v.stock}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <span className={`text-sm font-bold ${status === 'out-of-stock' ? 'text-red-500' : status === 'low-stock' ? 'text-neutral-700' : 'text-neutral-700'}`}>
                                  {totalStock}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <span className={`inline-flex items-center gap-1 text-sm font-bold uppercase tracking-[0.08em] px-2 py-1 border ${
                                  status === "in-stock" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                  status === "low-stock" ? "bg-neutral-100 text-neutral-700 border-neutral-300" :
                                  "bg-red-50 text-red-500 border-red-200"
                                }`}>
                                  {status === "in-stock" && <CheckCircle2 className="h-3 w-3" />}
                                  {status === "low-stock" && <AlertTriangle className="h-3 w-3" />}
                                  {status === "out-of-stock" && <XCircle className="h-3 w-3" />}
                                  {status === "in-stock" ? "En stock" : status === "low-stock" ? "Stock bas" : "Rupture"}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                {isEditing ? (
                                  <div className="flex items-center justify-center gap-1">
                                    <button onClick={() => saveStockEditing(product.id)} className="text-emerald-500 hover:text-emerald-700 p-1"><Save className="h-3.5 w-3.5" /></button>
                                    <button onClick={() => setEditingStockId(null)} className="text-neutral-400 hover:text-neutral-700 p-1"><X className="h-3.5 w-3.5" /></button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => startStockEditing(product)}
                                      title="Modifier les quantités"
                                      className="text-neutral-400 hover:text-neutral-700 p-1"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      title={totalStock === 0 ? "Rétablir le stock" : "Mettre en rupture"}
                                      onClick={() => {
                                        if (totalStock === 0) {
                                          const updatedVariants = product.variants?.map(v => ({ ...v, stock: 10 }));
                                          if (updatedVariants) updateProduct(product.id, { variants: updatedVariants });
                                          showSuccess("Stock rétabli");
                                        } else {
                                          const updatedVariants = product.variants?.map(v => ({ ...v, stock: 0 }));
                                          if (updatedVariants) updateProduct(product.id, { variants: updatedVariants });
                                          showSuccess("Produit mis en rupture");
                                        }
                                      }}
                                      className={`p-1 rounded transition-colors ${
                                        totalStock === 0
                                          ? "text-red-400 hover:text-emerald-600 hover:bg-emerald-50"
                                          : "text-emerald-500 hover:text-red-500 hover:bg-red-50"
                                      }`}
                                    >
                                      {totalStock === 0 ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="text-xs text-neutral-400 text-right">
                  {filteredStockProducts.length} produit{filteredStockProducts.length !== 1 ? "s" : ""} affiché{filteredStockProducts.length !== 1 ? "s" : ""}
                  {showLowStockOnly && " • Alertes uniquement"}
                </div>
              </div>
            )}

            {/* ========== HERO CAROUSEL ========== */}
            {activeTab === "hero" && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900">Carousel Héro — Storefront</h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Sélectionnez les parfums à afficher dans le carousel principal. Ils s&apos;afficheront dans l&apos;ordre défini.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 px-4 py-2 rounded-lg">
                    <Layers className="h-4 w-4" />
                    <span><strong className="text-neutral-900">{heroProductIds.length}</strong> parfum{heroProductIds.length !== 1 ? "s" : ""} sélectionné{heroProductIds.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>

                {/* Background configurator */}
                <div className="bg-white border border-neutral-200 rounded-xl p-5">
                  <h3 className="text-sm font-black uppercase tracking-[0.15em] text-neutral-400 mb-3 flex items-center gap-2">
                    <Upload className="h-3.5 w-3.5" /> Image de fond du héro
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-3 items-start">
                    <input
                      type="text"
                      placeholder="URL de l'image (Unsplash, CDN...)"
                      value={heroBgUrl}
                      onChange={e => setHeroBgUrl(e.target.value)}
                      className="flex-1 border border-neutral-200 px-3 py-2.5 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 rounded-lg"
                    />
                    <button
                      onClick={() => { saveHeroConfig(heroProductIds, heroBgUrl); showSuccess("Fond du héro enregistré"); }}
                      className="flex-shrink-0 bg-neutral-900 hover:bg-black text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors"
                    >
                      Appliquer
                    </button>
                    {heroBgUrl && (
                      <button
                        onClick={() => { setHeroBgUrl(""); saveHeroConfig(heroProductIds, ""); showSuccess("Fond réinitialisé"); }}
                        className="flex-shrink-0 border border-neutral-200 text-neutral-500 hover:text-red-500 text-xs font-bold px-4 py-2.5 rounded-lg transition-colors"
                      >
                        Réinitialiser
                      </button>
                    )}
                  </div>
                  {heroBgUrl && (
                    <div className="mt-3 h-20 w-full rounded-lg overflow-hidden border border-neutral-100">
                      <img src={heroBgUrl} alt="Fond prévisualisation" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {!heroBgUrl && (
                    <p className="text-sm text-neutral-400 mt-2">
                      Fond par défaut : photo parfum Unsplash. Laissez vide pour utiliser le fond automatique.
                    </p>
                  )}
                </div>

                {/* Two columns: Selected order + Full catalog */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* LEFT: Selected products (ordered) */}
                  <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-neutral-800">Ordre du Carousel</h3>
                      {heroProductIds.length > 0 && (
                        <button
                          onClick={() => { setHeroProductIds([]); saveHeroConfig([], heroBgUrl); showSuccess("Carousel vidé"); }}
                          className="text-xs text-red-400 hover:text-red-600 font-bold uppercase tracking-wider transition-colors"
                        >
                          Tout vider
                        </button>
                      )}
                    </div>
                    {heroProductIds.length === 0 ? (
                      <div className="py-16 text-center">
                        <Layers className="h-8 w-8 text-neutral-200 mx-auto mb-3" />
                        <p className="text-xs text-neutral-400 font-medium">Aucun parfum sélectionné</p>
                        <p className="text-sm text-neutral-300 mt-1">Ajoutez des parfums depuis le catalogue ci-contre</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-neutral-100">
                        {heroProductIds.map((id, idx) => {
                          const p = products.find(x => x.id === id);
                          if (!p) return null;
                          const total = p.variants?.reduce((s, v) => s + (v.stock || 0), 0) || 0;
                          const isOos = total === 0;
                          const hasPromo = (p.discountPercent ?? 0) > 0;
                          return (
                            <div key={id} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors">
                              {/* Position badge */}
                              <span className="flex-shrink-0 w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center text-xs font-black text-neutral-500">
                                {idx + 1}
                              </span>
                              {/* Thumbnail */}
                              <div className="h-12 w-9 flex-shrink-0 rounded-lg overflow-hidden border border-neutral-100 bg-neutral-50">
                                <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                              </div>
                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-neutral-800 truncate">{p.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-neutral-400">{Math.round((p.variants?.[0]?.price || 0)).toLocaleString("fr-DZ")} DA</span>
                                  {hasPromo && <span className="text-sm font-black text-red-500 bg-red-50 px-1.5 py-0.5 rounded">-{p.discountPercent}%</span>}
                                  {isOos && <span className="text-sm font-black text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">Épuisé</span>}
                                </div>
                              </div>
                              {/* Controls */}
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  onClick={() => moveHeroProduct(id, -1)}
                                  disabled={idx === 0}
                                  className="p-1 text-neutral-300 hover:text-neutral-700 disabled:opacity-30 transition-colors"
                                  title="Monter"
                                >
                                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6"/></svg>
                                </button>
                                <button
                                  onClick={() => moveHeroProduct(id, 1)}
                                  disabled={idx === heroProductIds.length - 1}
                                  className="p-1 text-neutral-300 hover:text-neutral-700 disabled:opacity-30 transition-colors"
                                  title="Descendre"
                                >
                                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                                </button>
                                <button
                                  onClick={() => removeHeroProduct(id)}
                                  className="p-1 text-neutral-300 hover:text-red-500 transition-colors ml-1"
                                  title="Retirer du carousel"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* RIGHT: Full product catalog to pick from */}
                  <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-neutral-100">
                      <h3 className="text-sm font-bold text-neutral-800">Catalogue — Ajouter des parfums</h3>
                      <p className="text-sm text-neutral-400 mt-0.5">Cliquez sur un parfum pour l&apos;ajouter au carousel</p>
                    </div>
                    <div className="p-4 max-h-[600px] overflow-y-auto space-y-2">
                      {products.map(p => {
                        const alreadyIn = heroProductIds.includes(p.id);
                        const total = p.variants?.reduce((s, v) => s + (v.stock || 0), 0) || 0;
                        const isOos = total === 0;
                        const hasPromo = (p.discountPercent ?? 0) > 0;
                        return (
                          <div
                            key={p.id}
                            className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                              alreadyIn
                                ? "border-neutral-800 bg-neutral-100"
                                : "border-neutral-100 hover:border-neutral-300 hover:bg-neutral-50"
                            }`}
                            onClick={() => alreadyIn ? removeHeroProduct(p.id) : addHeroProduct(p.id)}
                          >
                            {/* Thumbnail */}
                            <div className="h-10 w-8 flex-shrink-0 rounded-lg overflow-hidden border border-neutral-100">
                              <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-base font-bold text-neutral-800 truncate">{p.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs text-neutral-400">{p.category}</span>
                                {hasPromo && <span className="text-sm font-black text-red-500">-{p.discountPercent}%</span>}
                                {isOos && <span className="text-sm text-neutral-400">Épuisé</span>}
                              </div>
                            </div>
                            {/* Status */}
                            <div className="flex-shrink-0">
                              {alreadyIn ? (
                                <span className="inline-flex items-center gap-1 text-sm font-black uppercase bg-neutral-900 text-white px-2 py-1 rounded-full">
                                  <CheckCircle2 className="h-2.5 w-2.5" /> Ajouté
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-sm font-black uppercase text-neutral-400 bg-neutral-100 px-2 py-1 rounded-full hover:bg-neutral-900 hover:text-white transition-colors">
                                  <Plus className="h-2.5 w-2.5" /> Ajouter
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Live preview banner */}
                <div className="bg-neutral-900 text-white rounded-xl px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold">Les changements sont instantanés</p>
                    <p className="text-xs text-white/50 mt-0.5">Rechargez la boutique pour voir le nouveau carousel.</p>
                  </div>
                  <a href="/" target="_blank" rel="noopener noreferrer"
                    className="flex-shrink-0 flex items-center gap-2 bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-xs px-5 py-2.5 rounded-lg transition-colors">
                    <Eye className="h-3.5 w-3.5" /> Voir la boutique
                  </a>
                </div>
              </div>
            )}

            {/* ========== SECTIONS ========== */}
            {activeTab === "sections" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 bg-white border border-neutral-200 p-6 space-y-4">
                  <h3 className="font-serif text-sm tracking-[0.1em] text-neutral-700 uppercase">
                    {editingCategory ? "Modifier la Section" : "Nouvelle Section"}
                  </h3>
                  {catError && <p className="text-xs text-red-500">{catError}</p>}
                  <form onSubmit={handleAddCategory} className="space-y-3">
                    <div>
                      <label className="block text-sm font-bold uppercase tracking-[0.1em] text-neutral-400 mb-1.5">Titre</label>
                      <input type="text" placeholder="ex: Parfums Floraux" value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
                        className="w-full border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-800 placeholder-neutral-300 focus:outline-none focus:border-neutral-400" required />
                    </div>
                    <div>
                      <label className="block text-sm font-bold uppercase tracking-[0.1em] text-neutral-400 mb-1.5">Description</label>
                      <textarea placeholder="Description courte..." value={newCatDesc} onChange={(e) => setNewCatDesc(e.target.value)} rows={3}
                        className="w-full border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-800 placeholder-neutral-300 focus:outline-none focus:border-neutral-400 resize-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-bold uppercase tracking-[0.1em] text-neutral-400 mb-1.5">Icône de Section</label>
                      <select value={newCatIcon} onChange={(e) => setNewCatIcon(e.target.value)}
                        className="w-full border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-400">
                        <option value="Tag">Tag (Standard)</option>
                        <option value="Flower2">Fleur (Floral)</option>
                        <option value="Gem">Gemme (Niche / Précieux)</option>
                        <option value="Crown">Couronne (Maison / Prestige)</option>
                        <option value="Sparkles">Étoiles (Nouveau)</option>
                        <option value="Flame">Flamme (Sensuel / Intense)</option>
                        <option value="Waves">Vagues (Frais / Agrumes)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold uppercase tracking-[0.1em] text-neutral-400 mb-1.5">Image de Couverture (Optionnel)</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input type="text" placeholder="https://images.unsplash.com/..." value={newCatImageUrl} onChange={(e) => setNewCatImageUrl(e.target.value)}
                          className="flex-1 border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-800 placeholder-neutral-300 focus:outline-none focus:border-neutral-400" />
                        <label className="flex items-center justify-center bg-neutral-50 hover:bg-neutral-100 text-neutral-600 px-4 py-2.5 cursor-pointer border border-neutral-200 transition-colors whitespace-nowrap">
                          <Upload className="h-4 w-4 mr-2" />
                          <span className="text-xs font-bold uppercase tracking-wider">Télécharger</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => setNewCatImageUrl(ev.target?.result as string);
                              reader.readAsDataURL(file);
                            }
                          }} />
                        </label>
                      </div>
                      {newCatImageUrl && (
                        <div className="mt-2 h-24 w-full border border-neutral-200 overflow-hidden bg-neutral-50 relative">
                           <img src={newCatImageUrl} alt="Preview" className="h-full w-full object-cover" />
                           <button type="button" onClick={() => setNewCatImageUrl("")}
                             className="absolute top-1 right-1 bg-white border border-neutral-200 p-1 text-neutral-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button type="submit" className="flex-1 bg-neutral-900 hover:bg-black text-white font-medium uppercase tracking-[0.1em] text-xs py-3 transition-all">
                        {editingCategory ? "Sauvegarder" : "Créer la Section"}
                      </button>
                      {editingCategory && (
                        <button type="button" onClick={() => {
                          setEditingCategory(null);
                          setNewCatName("");
                          setNewCatDesc("");
                          setNewCatIcon("Tag");
                          setNewCatImageUrl("");
                          setCatError("");
                        }} className="border border-neutral-200 text-neutral-500 font-medium uppercase tracking-[0.1em] text-xs px-4 py-3 transition-all hover:bg-neutral-50">
                          Annuler
                        </button>
                      )}
                    </div>
                  </form>
                </div>
                <div className="lg:col-span-8 space-y-3">
                  <h3 className="font-serif text-sm tracking-[0.1em] text-neutral-700 uppercase">Sections ({categories.length})</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {categories.map(cat => {
                      const CatIcon = getCategoryIcon(cat.icon);
                      return (
                        <div key={cat.id} className="bg-white border border-neutral-200 p-4 space-y-3 flex flex-col justify-between">
                          <div className="space-y-3">
                            {cat.imageUrl && (
                              <div className="h-20 w-full overflow-hidden border border-neutral-100 bg-neutral-50 mb-2">
                                <img src={cat.imageUrl} alt={cat.name} className="h-full w-full object-cover" />
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <CatIcon className="h-3.5 w-3.5 text-neutral-400" />
                              <h4 className="text-base font-bold text-neutral-800 uppercase tracking-[0.08em]">{cat.name}</h4>
                            </div>
                            <p className="text-xs text-neutral-500 font-light leading-relaxed">{cat.description}</p>
                          </div>
                          <div className="flex justify-end gap-3 pt-2 border-t border-neutral-100 mt-2">
                            <button onClick={() => {
                              setEditingCategory(cat);
                              setNewCatName(cat.name);
                              setNewCatDesc(cat.description);
                              setNewCatIcon(cat.icon || "Tag");
                              setNewCatImageUrl(cat.imageUrl || "");
                            }} className="flex items-center gap-1.5 text-sm uppercase tracking-[0.1em] text-neutral-400 hover:text-neutral-900 font-bold transition-colors">
                              <Edit2 className="h-3 w-3" /> Modifier
                            </button>
                            <button onClick={() => { deleteCategory(cat.id); showSuccess("Section supprimée"); }}
                              className="flex items-center gap-1.5 text-sm uppercase tracking-[0.1em] text-neutral-400 hover:text-red-500 font-bold transition-colors">
                              <Trash2 className="h-3 w-3" /> Supprimer
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ========== ORDERS ========== */}
            {activeTab === "orders" && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <h3 className="font-serif text-sm tracking-[0.1em] text-neutral-700 uppercase">Commandes ({ordersVolume})</h3>
                  <button 
                    onClick={handleSyncElogistia} 
                    disabled={syncingElogistia}
                    className="flex items-center gap-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${syncingElogistia ? "animate-spin" : ""}`} /> 
                    {syncingElogistia ? "Synchronisation..." : "Synchroniser Elogistia"}
                  </button>
                </div>
                {orders.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-neutral-200">
                    <Clock className="h-8 w-8 text-neutral-300 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400">Aucune commande</p>
                  </div>
                ) : (
                  orders.map(order => (
                    <div key={order.id} className="bg-white border border-neutral-200 p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="text-base font-bold text-neutral-800">{order.id}</span>
                          <span className="text-sm font-extrabold text-neutral-800">{order.firstName || ""} {order.lastName || ""}</span>
                          <span className="text-sm font-bold text-accent">{order.phone || ""}</span>
                          <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5">📍 {order.residence || ""}, {order.wilaya || ""}</span>
                          {order.customerEmail && <span className="text-xs text-neutral-400 font-medium">({order.customerEmail})</span>}
                          <span className="text-sm text-neutral-400">{order.createdAt}</span>
                        </div>
                        <button onClick={() => handleOrderStatusToggle(order.id, order.status)}
                          className={`inline-flex items-center gap-1.5 text-sm uppercase tracking-[0.08em] px-2.5 py-1.5 border font-bold transition-all ${getStatusStyle(order.status)}`}>
                          {getStatusIcon(order.status)} {order.status}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                        <div className="md:col-span-2 space-y-1.5">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <div className="h-7 w-6 overflow-hidden border border-neutral-200 bg-neutral-50 flex-shrink-0">
                                <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
                              </div>
                              <span className="text-neutral-700 font-medium">{item.productName}</span>
                              <span className="text-neutral-400">• {item.size} • x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        <div className="text-right">
                          <span className="text-sm uppercase tracking-[0.1em] text-neutral-400 block">Total</span>
                          <span className="font-sans text-lg font-bold text-neutral-900">{order.totalPrice.toLocaleString("fr-DZ")} DA</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ========== PROMO ========== */}
            {activeTab === "promo" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 bg-white border border-neutral-200 p-6 space-y-4">
                  <h3 className="font-serif text-sm tracking-[0.1em] text-neutral-700 uppercase">Mettre en Promotion</h3>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {products.filter(p => !(p.discountPercent! > 0)).map(product => (
                      <button key={product.id} onClick={() => {
                        const pct = window.prompt("Entrez le pourcentage de remise (ex: 20):", "20");
                        if (pct && !isNaN(Number(pct))) {
                          updateProduct(product.id, { discountPercent: Number(pct) });
                          showSuccess("Produit mis en promotion");
                        }
                      }}
                        className="w-full flex items-center gap-3 p-2 border border-neutral-200 hover:border-neutral-400 text-left transition-all">
                        <div className="h-10 w-8 overflow-hidden border border-neutral-200 bg-neutral-50 flex-shrink-0">
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-neutral-700 truncate">{product.name}</p>
                          <p className="text-base text-neutral-500">{Math.round((product.variants?.[0]?.price || 0)).toLocaleString("fr-DZ")} DA</p>
                        </div>
                        <Plus className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-8 space-y-3">
                  <h3 className="font-serif text-sm tracking-[0.1em] text-neutral-700 uppercase">Promotions en cours ({products.filter(p => p.discountPercent! > 0).length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {products.filter(p => p.discountPercent! > 0).map(product => {
                      const priceDA = Math.round((product.variants?.[0]?.price || 0));
                      const discount = product.discountPercent || 0;
                      return (
                        <div key={product.id} className="bg-white border border-neutral-200 p-4 flex items-center gap-4">
                          <div className="h-14 w-11 overflow-hidden border border-neutral-200 bg-neutral-50 flex-shrink-0">
                            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-rose-50 text-rose-600 text-base font-bold px-2 py-0.5">-{discount}%</span>
                            </div>
                            <p className="text-sm font-bold text-neutral-800 truncate">{product.name}</p>
                            <p className="text-xs text-neutral-500 truncate mt-0.5">
                              {product.category} • <span className="font-bold text-neutral-900">{Math.round(priceDA * (1 - discount / 100)).toLocaleString("fr-DZ")} DA</span> <span className="line-through opacity-50 text-neutral-400">{priceDA.toLocaleString("fr-DZ")} DA</span>
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => {
                              const pct = window.prompt("Modifier le pourcentage de remise:", String(discount));
                              if (pct && !isNaN(Number(pct))) {
                                updateProduct(product.id, { discountPercent: Number(pct) });
                                showSuccess("Remise modifiée");
                              }
                            }} className="text-neutral-400 hover:text-neutral-700 p-1.5 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors" title="Modifier la remise">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => {
                              updateProduct(product.id, { discountPercent: 0 });
                              showSuccess("Retiré des promotions");
                            }} className="text-neutral-400 hover:text-red-500 p-1.5 bg-neutral-100 hover:bg-red-50 rounded transition-colors" title="Retirer la promotion">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {products.filter(p => p.discountPercent! > 0).length === 0 && (
                    <p className="text-sm text-neutral-400 text-center py-10 bg-white border border-neutral-200 border-dashed">Aucun produit en promotion</p>
                  )}
                </div>
              </div>
            )}

            {/* ========== NOUVEAUTÉS ========== */}
            {activeTab === "nouveautes" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 bg-white border border-neutral-200 p-6 space-y-4">
                  <h3 className="font-serif text-sm tracking-[0.1em] text-neutral-700 uppercase">Ajouter aux Nouveautés</h3>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {products.filter(p => !nouveautes.some(n => n.productId === p.id)).map(product => (
                      <button key={product.id} onClick={() => handleAddNouveaute(product.id)}
                        className="w-full flex items-center gap-3 p-2 border border-neutral-200 hover:border-neutral-400 text-left transition-all">
                        <div className="h-10 w-8 overflow-hidden border border-neutral-200 bg-neutral-50 flex-shrink-0">
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-neutral-700 truncate">{product.name}</p>
                          <p className="text-sm text-neutral-400">{Math.round((product.variants?.[0]?.price || 0)).toLocaleString("fr-DZ")} DA</p>
                        </div>
                        <Plus className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-8 space-y-3">
                  <h3 className="font-serif text-sm tracking-[0.1em] text-neutral-700 uppercase">Nouveautés ({nouveautes.length})</h3>
                  {nouveautes.map(nouveaute => {
                    const product = products.find(p => p.id === nouveaute.productId);
                    if (!product) return null;
                    return (
                      <div key={nouveaute.id} className="bg-white border border-neutral-200 p-4 flex items-center gap-4">
                        <div className="h-14 w-11 overflow-hidden border border-neutral-200 bg-neutral-50 flex-shrink-0">
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-neutral-800">{product.name}</p>
                          <p className="text-sm text-neutral-400">{product.category} • {Math.round((product.variants?.[0]?.price || 0)).toLocaleString("fr-DZ")} DA</p>
                          <div className="flex items-center gap-2 mt-1">
                            <input type="text" placeholder="Badge" value={nouveaute.badge || ""} onChange={(e) => handleNouveauteBadge(nouveaute.id, e.target.value)}
                              className="border border-neutral-200 px-2 py-1 text-sm text-neutral-700 w-28 focus:outline-none focus:border-neutral-400" />
                            <button onClick={() => handleNouveauteToggle(nouveaute.id)}
                              className={`text-sm font-bold uppercase px-2 py-1 border ${nouveaute.featured ? 'border-neutral-300 text-neutral-700 bg-neutral-50' : 'border-neutral-200 text-neutral-400'}`}>
                              {nouveaute.featured ? '★' : '☆'}
                            </button>
                          </div>
                        </div>
                        <button onClick={() => handleRemoveNouveaute(nouveaute.id)} className="text-neutral-300 hover:text-red-500">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ========== MARQUES ========== */}
            {activeTab === "marques" && (
              <div className="space-y-8">

                {/* ── BRAND LOGOS (carousel + filter) ── */}
                <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900">Logos des Marques</h3>
                      <p className="text-xs text-neutral-400 mt-0.5">Ces logos apparaissent dans le carousel de la boutique et dans les filtres du catalogue.</p>
                    </div>
                  </div>

                  {/* Add / Edit brand */}
                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-bold uppercase tracking-wider text-neutral-500">{editingBrand ? `Modifier : ${editingBrand.name}` : "Ajouter une marque"}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={editingBrand ? editingBrand.name : newBrandName}
                        onChange={e => editingBrand ? setEditingBrand({ ...editingBrand, name: e.target.value }) : setNewBrandName(e.target.value)}
                        placeholder="Nom de la marque (ex. Chanel)"
                        className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neutral-800 bg-white"
                      />
                      <input
                        type="url"
                        value={editingBrand ? editingBrand.logo : newBrandLogo}
                        onChange={e => editingBrand ? setEditingBrand({ ...editingBrand, logo: e.target.value }) : setNewBrandLogo(e.target.value)}
                        placeholder="URL ou chemin du logo (ex. /logos/chanel.png)"
                        className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-neutral-800 bg-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      {editingBrand ? (
                        <>
                          <button onClick={() => { updateBrand(editingBrand.id, { name: editingBrand.name, logo: editingBrand.logo }); setEditingBrand(null); showSuccess("Marque mise à jour"); }}
                            className="flex items-center gap-1.5 bg-neutral-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-black transition-colors">
                            <Save className="h-3.5 w-3.5" /> Enregistrer
                          </button>
                          <button onClick={() => setEditingBrand(null)} className="text-xs text-neutral-500 hover:text-neutral-700 px-3 py-2 border border-neutral-200 rounded-lg">Annuler</button>
                        </>
                      ) : (
                        <button
                          onClick={() => { if (!newBrandName || !newBrandLogo) return; addBrand({ name: newBrandName, logo: newBrandLogo }); setNewBrandName(""); setNewBrandLogo(""); showSuccess("Marque ajoutée"); }}
                          className="flex items-center gap-1.5 bg-neutral-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-black transition-colors">
                          <Plus className="h-3.5 w-3.5" /> Ajouter
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Brand logos grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {brands.map((brand: Brand) => (
                      <div key={brand.id} className="group relative bg-neutral-50 border border-neutral-200 rounded-xl p-3 flex flex-col items-center gap-2">
                        <div className="h-10 flex items-center justify-center">
                          <img src={brand.logo} alt={brand.name} className="max-h-8 max-w-full object-contain" />
                        </div>
                        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider text-center truncate w-full">{brand.name}</p>
                        <div className="absolute top-1.5 right-1.5 hidden group-hover:flex gap-1">
                          <button onClick={() => setEditingBrand(brand)} className="w-5 h-5 bg-white border border-neutral-200 rounded flex items-center justify-center hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-colors">
                            <Edit2 className="h-2.5 w-2.5" />
                          </button>
                          <button onClick={() => { deleteBrand(brand.id); showSuccess("Marque supprimée"); }} className="w-5 h-5 bg-white border border-neutral-200 rounded flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors">
                            <Trash2 className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-sm tracking-[0.1em] text-neutral-700 uppercase">Nos Marques ({marques.length})</h3>
                  <button onClick={() => { setEditingMarque(null); setShowMarqueForm(true); }}
                    className="flex items-center gap-2 bg-neutral-900 hover:bg-black text-white font-medium uppercase tracking-[0.1em] text-xs px-4 py-2.5 transition-all">
                    <Plus className="h-3.5 w-3.5" /> Nouvelle Marque
                  </button>
                </div>
                <AnimatePresence>
                  {showMarqueForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4"
                      onClick={() => setShowMarqueForm(false)}>
                      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                        className="bg-white border border-neutral-200 p-6 w-full max-w-md space-y-4 shadow-lg"
                        onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif text-sm text-neutral-800 uppercase tracking-[0.1em]">{editingMarque ? "Modifier" : "Nouvelle"}</h4>
                          <button onClick={() => setShowMarqueForm(false)} className="text-neutral-400 hover:text-neutral-700"><X className="h-4 w-4" /></button>
                        </div>
                        <MarqueForm initial={editingMarque || undefined} onSave={handleSaveMarque} onCancel={() => setShowMarqueForm(false)}
                          onLogoUpload={handleLogoUpload} />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {marques.map(marque => (
                    <div key={marque.id} className="bg-white border border-neutral-200 p-5 text-center space-y-3 group">
                      <div className={`h-20 w-20 mx-auto flex items-center justify-center border-2 transition-all overflow-hidden ${marque.active ? 'border-neutral-200 bg-neutral-50' : 'border-neutral-100 bg-neutral-50/50 opacity-50'}`}>
                        {marque.logoType === "image" ? (
                          <img src={marque.logo} alt={marque.name} className="h-full w-full object-contain p-2" />
                        ) : (
                          <span className="font-sans text-lg font-bold text-neutral-400 tracking-tight">{marque.logo?.charAt(0) || "M"}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">{marque.logoType === "text" ? marque.logo : marque.name}</h4>
                        <p className="text-sm text-neutral-400 mt-0.5">{marque.description}</p>
                      </div>
                      <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingMarque(marque); setShowMarqueForm(true); }} className="text-neutral-400 hover:text-neutral-700 p-1"><Edit2 className="h-3 w-3" /></button>
                        <button onClick={() => { setMarques(prev => prev.map(m => m.id === marque.id ? { ...m, active: !m.active } : m)); }}
                          className={`p-1 ${marque.active ? 'text-emerald-500' : 'text-neutral-300'}`}><Eye className="h-3 w-3" /></button>
                        <button onClick={() => handleDeleteMarque(marque.id)} className="text-neutral-300 hover:text-red-500 p-1"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}




          </motion.div>
        </AnimatePresence>

      </main>

      <ProductFormModal product={editingProduct} isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
}

// PromoForm removed as it is replaced by direct product discount percentage editing.

// Marque Form with logo upload
function MarqueForm({ initial, onSave, onCancel, onLogoUpload }: {
  initial?: Marque;
  onSave: (marque: Marque) => void;
  onCancel: () => void;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>, marqueId?: string) => void;
}) {
  const [form, setForm] = useState({
    id: initial?.id || "", name: initial?.name || "", logo: initial?.logo || "",
    logoType: initial?.logoType || "text" as "text" | "image",
    description: initial?.description || "", website: initial?.website || "",
    active: initial?.active ?? true,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-3">
      <div>
        <label className="block text-sm font-bold uppercase tracking-[0.1em] text-neutral-400 mb-1">Nom</label>
        <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          className="w-full border border-neutral-200 px-3 py-2.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-400" required />
      </div>
      <div>
        <label className="block text-sm font-bold uppercase tracking-[0.1em] text-neutral-400 mb-1">Logo</label>
        <div className="flex gap-2 mb-2">
          <button type="button" onClick={() => setForm(p => ({ ...p, logoType: "text" }))}
            className={`text-sm font-bold uppercase px-2 py-1 border ${form.logoType === "text" ? "border-neutral-400 bg-neutral-100 text-neutral-800" : "border-neutral-200 text-neutral-400"}`}>Texte</button>
          <button type="button" onClick={() => setForm(p => ({ ...p, logoType: "image" }))}
            className={`text-sm font-bold uppercase px-2 py-1 border ${form.logoType === "image" ? "border-neutral-400 bg-neutral-100 text-neutral-800" : "border-neutral-200 text-neutral-400"}`}>Image</button>
        </div>
        {form.logoType === "text" ? (
          <input type="text" value={form.logo} onChange={e => setForm(p => ({ ...p, logo: e.target.value }))}
            placeholder="Ex: CHANEL"
            className="w-full border border-neutral-200 px-3 py-2.5 text-sm text-neutral-800 placeholder-neutral-300 focus:outline-none focus:border-neutral-400" required />
        ) : (
          <div className="space-y-2">
            {form.logo && form.logoType === "image" ? (
              <div className="relative h-16 w-16 border border-neutral-200 overflow-hidden bg-neutral-50">
                <img src={form.logo} alt="Logo preview" className="h-full w-full object-contain p-1" />
                <button type="button" onClick={() => setForm(p => ({ ...p, logo: "" }))}
                  className="absolute top-0 right-0 bg-white border border-neutral-200 p-0.5 text-neutral-400 hover:text-red-500"><X className="h-3 w-3" /></button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 border border-dashed border-neutral-300 p-4 text-sm text-neutral-400 hover:text-neutral-600 hover:border-neutral-400 transition-all">
                <Upload className="h-4 w-4" /> Télécharger un logo (noir & blanc recommandé)
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => {
                onLogoUpload(e, initial?.id);
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => setForm(p => ({ ...p, logo: ev.target?.result as string, logoType: "image" }));
                  reader.readAsDataURL(file);
                }
              }} />
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-bold uppercase tracking-[0.1em] text-neutral-400 mb-1">Description</label>
        <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          className="w-full border border-neutral-200 px-3 py-2.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-400" required />
      </div>
      <div>
        <label className="block text-sm font-bold uppercase tracking-[0.1em] text-neutral-400 mb-1">Site Web (optionnel)</label>
        <input type="url" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
          className="w-full border border-neutral-200 px-3 py-2.5 text-sm text-neutral-800 focus:outline-none focus:border-neutral-400" />
      </div>
      <div className="flex gap-2 pt-2">
        <button type="submit" className="flex-1 bg-neutral-900 hover:bg-black text-white font-medium uppercase tracking-[0.1em] text-xs py-2.5 transition-all">
          {initial ? "Mettre à jour" : "Ajouter"}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 border border-neutral-200 text-neutral-500 hover:text-neutral-800 font-medium uppercase tracking-[0.1em] text-xs py-2.5 transition-all">Annuler</button>
      </div>
    </form>
  );
}