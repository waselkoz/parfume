

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
export interface Product {
  id: string;
  name: string;
  description: string;
  brand?: string;
  price: number;
  category: string;
  image: string;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  rating: number;
  reviewsCount: number;
  stock: Record<string, number>;
  sizePrices?: Record<string, number>;
  lowStockAlert: number;
  discountPercent?: number;
  isTendance?: boolean;
  isBestSeller?: boolean;
  hoverImage?: string;
  pointsEarned?: number;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: "discount" | "gift";
  discountPercent?: number;
  giftDescription?: string;
  isActive: boolean;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon?: string;
  imageUrl?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
}

export interface OrderItem {
  productName: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
}

export interface Order {
  id: string;
  customerEmail?: string;
  firstName: string;
  lastName: string;
  phone: string;
  wilaya: string;
  residence: string;
  items: OrderItem[];
  totalPrice: number;
  createdAt: string;
  status: "Pending" | "Shipped" | "Completed";
}

export interface User {
  email: string;
  role: "admin" | "client";
  fullName?: string;
  phone?: string;
  city?: string;
  wilaya?: string;
  gender?: string;
}

interface AppContextType {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  cart: CartItem[];
  orders: Order[];
  currentUser: User | null;
  addBrand: (b: Omit<Brand, "id">) => void;
  updateBrand: (id: string, b: Partial<Brand>) => void;
  deleteBrand: (id: string) => void;
  addProduct: (product: Omit<Product, "id" | "rating" | "reviewsCount">) => Promise<void>;
  updateProduct: (id: string, updatedProduct: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProductStock: (id: string, size: string, quantity: number) => Promise<void>;
  addCategory: (category: Omit<Category, "id">) => Promise<void>;
  updateCategory: (id: string, updatedCategory: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addToCart: (product: Product, size: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateCartQuantity: (productId: string, size: string, quantity: number) => void;
  deleteProductSize: (productId: string, size: string) => void;
  clearCart: () => void;
  login: (email: string, password?: string, profile?: Pick<User, "fullName" | "phone" | "city" | "wilaya" | "gender">) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkout: (info: {
    firstName: string;
    lastName: string;
    phone: string;
    wilaya: string;
    residence: string;
    email?: string;
  }) => Promise<{ success: boolean; orderId?: string }>;
  updateOrderStatus: (id: string, status: Order["status"]) => Promise<void>;
  language: "fr" | "en" | "ar";
  setLanguage: (lang: "fr" | "en" | "ar") => void;
  rewards: Reward[];
  userPoints: number;
  pendingRedemption: Reward | null;
  setPendingRedemption: (r: Reward | null) => void;
  addReward: (r: Omit<Reward, "id">) => void;
  updateReward: (id: string, r: Partial<Reward>) => void;
  deleteReward: (id: string) => void;
  creditPoints: (email: string, pts: number) => void;
  adjustUserPoints: (email: string, delta: number) => void;
  getAllUsersPoints: () => Record<string, number>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Maison Collection", description: "Vélours flagship signature fragrances", icon: "Crown" },
  { id: "cat-2", name: "Oud & Wood", description: "Deep, smokey, resinous masterpieces", icon: "Flame" },
  { id: "cat-3", name: "Floral Elixirs", description: "Delicate, sweet, and blooming bouquets", icon: "Flower2" },
  { id: "cat-4", name: "Fresh Citrus", description: "Vibrant, refreshing, and energizing notes", icon: "Sparkles" }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "L'Or Obsidien",
    description: "An enigmatic masterpiece balancing dark smoke with sweet honey. L'Or Obsidien weaves a dense blanket of rare black oud, creamy Madagascar vanilla, and burnt amber, leaving a mesmerizing, powerful trail.",
    brand: "Vélours",
    price: 280,
    category: "Oud & Wood",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop",
    topNotes: ["Burnt Amber", "Saffron", "Honey"],
    heartNotes: ["Black Oud", "Incense", "Atlas Cedar"],
    baseNotes: ["Madagascar Vanilla", "Leather", "Patchouli"],
    rating: 4.9,
    reviewsCount: 124,
    stock: { "50ml": 15, "100ml": 8 },
    lowStockAlert: 5
  },
  {
    id: "prod-2",
    name: "Nuit Vélours",
    description: "Seductive, mysterious, and velvety. A captivating evening fragrance under a dark sky, wrapping opulent Turkish rose and ripe black cherry in a warm leather jacket.",
    brand: "Vélours",
    price: 245,
    category: "Maison Collection",
    image: "https://images.unsplash.com/photo-1615655404746-8f041380969b?q=80&w=600&auto=format&fit=crop",
    topNotes: ["Black Cherry", "Almond", "Pink Pepper"],
    heartNotes: ["Turkish Rose", "Jasmine Sambac", "Plum"],
    baseNotes: ["Leather", "Sandalwood", "Tonka Bean"],
    rating: 4.8,
    reviewsCount: 98,
    stock: { "50ml": 20, "100ml": 12 },
    lowStockAlert: 5,
    discountPercent: 20
  },
  {
    id: "prod-3",
    name: "Ambre d'Orient",
    description: "A warm, spicy golden embrace that echoes ancient desert nights. Rich cardamom and exotic saffron flow effortlessly into a creamy, resinous heart of sandalwood and warm mineral musk.",
    brand: "Vélours",
    price: 260,
    category: "Maison Collection",
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=600&auto=format&fit=crop",
    topNotes: ["Cardamom", "Cinnamon", "Bergamot"],
    heartNotes: ["Saffron", "Labdanum", "Myrrh"],
    baseNotes: ["Sandalwood", "Warm Amber", "White Musk"],
    rating: 4.7,
    reviewsCount: 73,
    stock: { "50ml": 10, "100ml": 5 },
    lowStockAlert: 5
  },
  {
    id: "prod-4",
    name: "Jardin de Flore",
    description: "A breath of early morning dew in a private botanical sanctuary. jardin de Flore is a rich bouquet of pristine white jasmine and soft peony layered over a smooth, grounding base of cashmere woods.",
    brand: "Vélours",
    price: 210,
    category: "Floral Elixirs",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop",
    topNotes: ["White Peony", "Litchi", "Freesia"],
    heartNotes: ["Jasmine Infusion", "Damask Rose", "Tuberose"],
    baseNotes: ["Cashmere Wood", "Ambergris", "Virginia Cedar"],
    rating: 4.6,
    reviewsCount: 65,
    stock: { "50ml": 25, "100ml": 15 },
    lowStockAlert: 5,
    discountPercent: 30
  },
  {
    id: "prod-5",
    name: "Verde Espéride",
    description: "An invigorating coastal escape along the sun-drenched cliffs of Calabria. Crisp bergamot and radiant orange blossom are swept up by clean ocean sea-salt and a green vetiver breeze.",
    brand: "Vélours",
    price: 195,
    category: "Fresh Citrus",
    image: "https://images.unsplash.com/photo-1588405748373-122b2321bc31?q=80&w=600&auto=format&fit=crop",
    topNotes: ["Calabrian Bergamot", "Lemon Zest", "Ocean Salt"],
    heartNotes: ["Neroli", "Green Tea", "Petitgrain"],
    baseNotes: ["Haitian Vetiver", "Cedarwood", "White Amber"],
    rating: 4.8,
    reviewsCount: 42,
    stock: { "50ml": 18, "100ml": 10 },
    lowStockAlert: 5
  },
  {
    id: "prod-6",
    name: "Oud Majesteux",
    description: "A majestic ode to the finest Arabian oud. Oud Majesteux opens with a burst of golden saffron and velvety rose before settling into a throne of imperial agarwood, dark labdanum, and ancient amber.",
    brand: "Vélours",
    price: 310,
    category: "Oud & Wood",
    image: "https://images.unsplash.com/photo-1619994403073-2cec844b8e63?q=80&w=600&auto=format&fit=crop",
    topNotes: ["Saffron", "Damask Rose", "Cardamom"],
    heartNotes: ["Royal Oud", "Agarwood", "Labdanum"],
    baseNotes: ["Dark Amber", "Sandalwood", "White Musk"],
    rating: 4.9,
    reviewsCount: 87,
    stock: { "50ml": 12, "100ml": 6 },
    lowStockAlert: 5
  },
  {
    id: "prod-7",
    name: "Rose Impériale",
    description: "A sumptuous imperial rose, fresh and opulent. Rose Impériale blooms with candied lychee and sun-kissed bergamot before revealing a lush bouquet of Turkish rose and soft magnolia.",
    brand: "Vélours",
    price: 225,
    category: "Floral Elixirs",
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?q=80&w=600&auto=format&fit=crop",
    topNotes: ["Bergamot", "Lychee", "Raspberry"],
    heartNotes: ["Turkish Rose", "Peony", "Magnolia"],
    baseNotes: ["Musk", "Virginia Cedar", "Ambergris"],
    rating: 4.7,
    reviewsCount: 54,
    stock: { "50ml": 20, "100ml": 10 },
    lowStockAlert: 5,
    discountPercent: 15
  },
  {
    id: "prod-8",
    name: "Brise Atlantique",
    description: "A crisp Atlantic ocean breeze bottled in crystal. Brise Atlantique captures the exhilarating freshness of sea salt air, sun-warmed driftwood, and aromatic coastal herbs.",
    brand: "Vélours",
    price: 185,
    category: "Fresh Citrus",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=600&auto=format&fit=crop",
    topNotes: ["Sea Salt", "Lemon Zest", "Mint"],
    heartNotes: ["Aquatic Accord", "Neroli", "Petitgrain"],
    baseNotes: ["Driftwood", "White Musk", "Ambergris"],
    rating: 4.6,
    reviewsCount: 38,
    stock: { "50ml": 25, "100ml": 15 },
    lowStockAlert: 5
  },
  {
    id: "prod-9",
    name: "Santal Sacré",
    description: "Sacred Mysore sandalwood wrapped in warm vanilla and soft spices. A meditative, skin-close fragrance with exceptional longevity.",
    brand: "Vélours",
    price: 230,
    category: "Oud & Wood",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600&auto=format&fit=crop",
    topNotes: ["Cardamom", "Pink Pepper", "Bergamot"],
    heartNotes: ["Mysore Sandalwood", "Vetiver", "Iris"],
    baseNotes: ["Vanilla", "Amber", "White Musk"],
    rating: 4.7,
    reviewsCount: 61,
    stock: { "50ml": 14, "100ml": 7 },
    lowStockAlert: 5,
    discountPercent: 25
  },
  {
    id: "prod-10",
    name: "Musc Céleste",
    description: "An ultra-soft skin musc, intimate and addictive. Musc Céleste blends powdery iris, orris butter, and white woods into a seamless second skin.",
    brand: "Vélours",
    price: 175,
    category: "Maison Collection",
    image: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=600&auto=format&fit=crop",
    topNotes: ["Bergamot", "Aldehydes", "Lemon"],
    heartNotes: ["Iris", "Orris Butter", "Violet"],
    baseNotes: ["White Musk", "Sandalwood", "Ambrette"],
    rating: 4.5,
    reviewsCount: 44,
    stock: { "50ml": 22, "100ml": 11 },
    lowStockAlert: 5,
    discountPercent: 10
  },
  {
    id: "prod-11",
    name: "Patchouli Noir",
    description: "Dark, earthy, and hypnotic. Raw Indonesian patchouli meets burnt wood and smoked leather for an unforgettable, bold statement.",
    brand: "Vélours",
    price: 200,
    category: "Oud & Wood",
    image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=600&auto=format&fit=crop",
    topNotes: ["Black Pepper", "Cumin", "Incense"],
    heartNotes: ["Indonesian Patchouli", "Leather", "Tobacco"],
    baseNotes: ["Smoked Wood", "Labdanum", "Oakmoss"],
    rating: 4.8,
    reviewsCount: 79,
    stock: { "50ml": 9, "100ml": 4 },
    lowStockAlert: 5,
    discountPercent: 20
  },
  {
    id: "prod-12",
    name: "Fleur de Sel",
    description: "A minimalist coastal floral. Sea salt crystals dissolve into transparent white flowers and warm driftwood — effortlessly chic for any occasion.",
    brand: "Vélours",
    price: 190,
    category: "Fresh Citrus",
    image: "https://images.unsplash.com/photo-1557170330-1b13ae914f44?q=80&w=600&auto=format&fit=crop",
    topNotes: ["Sea Salt", "Grapefruit", "Green Leaves"],
    heartNotes: ["White Jasmine", "Ylang-Ylang", "Cyclamen"],
    baseNotes: ["Driftwood", "Ambergris", "Musk"],
    rating: 4.6,
    reviewsCount: 33,
    stock: { "50ml": 30, "100ml": 18 },
    lowStockAlert: 5,
    discountPercent: 15
  },
  {
    id: "prod-13",
    name: "Vanille Bourbon",
    description: "Pure Bourbon vanilla from Madagascar, rich and indulgent. A dessert-like warmth that lingers all day with hints of caramel and tonka bean.",
    brand: "Vélours",
    price: 165,
    category: "Floral Elixirs",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600&auto=format&fit=crop",
    topNotes: ["Caramel", "Praline", "Bergamot"],
    heartNotes: ["Bourbon Vanilla", "Heliotrope", "Iris"],
    baseNotes: ["Tonka Bean", "Sandalwood", "Benzoin"],
    rating: 4.9,
    reviewsCount: 102,
    stock: { "50ml": 16, "100ml": 8 },
    lowStockAlert: 5,
    discountPercent: 35
  }
];

const DEFAULT_BRANDS: Brand[] = [
  { id: "brand-1", name: "Chanel",    logo: "/logos/t%C3%A9l%C3%A9charg%C3%A9.png" },
  { id: "brand-2", name: "Dior",      logo: "/logos/t%C3%A9l%C3%A9charg%C3%A9%20(1).png" },
  { id: "brand-3", name: "YSL",       logo: "/logos/t%C3%A9l%C3%A9charg%C3%A9%20(2).png" },
  { id: "brand-4", name: "Creed",     logo: "/logos/t%C3%A9l%C3%A9charg%C3%A9%20(3).png" },
  { id: "brand-5", name: "Tom Ford",  logo: "/logos/t%C3%A9l%C3%A9charg%C3%A9%20(4).png" },
  { id: "brand-6", name: "Hugo Boss", logo: "/logos/t%C3%A9l%C3%A9charg%C3%A9.jpeg" },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [brands, setBrands] = useState<Brand[]>(DEFAULT_BRANDS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [language, setLanguageState] = useState<"fr" | "en" | "ar">("fr");
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [pendingRedemption, setPendingRedemption] = useState<Reward | null>(null);

  const setLanguage = (lang: "fr" | "en" | "ar") => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("parfumguy_lang", lang);
    }
  };
  useEffect(() => {
    async function initDatabase() {
      try {
        const catRes = await fetch("/api/categories");
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.length > 0 ? catData : DEFAULT_CATEGORIES);
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }
        const prodRes = await fetch("/api/products");
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData.length > 0 ? prodData : DEFAULT_PRODUCTS);
        } else {
          setProducts(DEFAULT_PRODUCTS);
        }
        const brandRes = await fetch("/api/brands");
        if (brandRes.ok) {
          const brandData = await brandRes.json();
          setBrands(brandData.length > 0 ? brandData : DEFAULT_BRANDS);
        } else {
          setBrands(DEFAULT_BRANDS);
        }
      } catch (e) {
        console.error("Database fetch error, using fallbacks:", e);
        setCategories(DEFAULT_CATEGORIES);
        setProducts(DEFAULT_PRODUCTS);
        setBrands(DEFAULT_BRANDS);
      }
      if (typeof window !== "undefined") {
        const storedLang = localStorage.getItem("parfumguy_lang") as "fr" | "en" | "ar" | null;
        if (storedLang && ["fr", "en", "ar"].includes(storedLang)) {
          setLanguageState(storedLang);
        }

        try {
          const storedRewards = localStorage.getItem("parfumguy_rewards");
          if (storedRewards) setRewards(JSON.parse(storedRewards));
        } catch { /* ignore */ }

        const storedUser = localStorage.getItem("parfumguy_user");
        if (storedUser) {
          try {
            const u = JSON.parse(storedUser);
            setCurrentUser(u);
            const registry = JSON.parse(localStorage.getItem("parfumguy_pts_registry") || "{}");
            setUserPoints(registry[u.email] || 0);
          } catch {
            setCurrentUser(null);
          }
        }

        const storedCart = localStorage.getItem("parfumguy_cart");
        if (storedCart) {
          try {
            setCart(JSON.parse(storedCart));
          } catch {
            setCart([]);
          }
        }
      }
      setIsLoaded(true);
    }

    initDatabase();
  }, []);
  useEffect(() => {
    async function fetchOrders() {
      if (currentUser?.role === "admin") {
        try {
          const res = await fetch("/api/orders");
          if (res.ok) {
            const data = await res.json();
            setOrders(data);
          }
        } catch (e) {
          console.error("Error fetching orders:", e);
        }
      } else {
        setOrders([]);
      }
    }
    if (isLoaded) {
      fetchOrders();
    }
  }, [currentUser, isLoaded]);
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("parfumguy_cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);
  const addProduct = async (newProd: Omit<Product, "id" | "rating" | "reviewsCount">) => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProd),
      });
      if (res.ok) {
        const savedProd = await res.json();
        setProducts((prev) => [savedProd, ...prev]);
      } else {
        throw new Error("Failed to add product backend");
      }
    } catch (e) {
      console.error(e);
      const fallbackProd: Product = {
        ...newProd,
        id: `prod-${Date.now()}`,
        rating: 5.0,
        reviewsCount: 1,
      };
      setProducts((prev) => [fallbackProd, ...prev]);
    }
  };

  const updateProduct = async (id: string, updatedFields: Partial<Product>) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });
      if (res.ok) {
        const savedProd = await res.json();
        setProducts((prev) => prev.map((p) => (p.id === id ? savedProd : p)));
        setCart((prevCart) =>
          prevCart.map((item) =>
            item.product.id === id
              ? { ...item, product: { ...item.product, ...updatedFields } }
              : item
          )
        );
      } else {
        throw new Error("Failed to update product backend");
      }
    } catch (e) {
      console.error(e);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
      );
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setCart((prev) => prev.filter((item) => item.product.id !== id));
      } else {
        throw new Error("Failed to delete product backend");
      }
    } catch (e) {
      console.error(e);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setCart((prev) => prev.filter((item) => item.product.id !== id));
    }
  };

  const updateProductStock = async (id: string, size: string, quantity: number) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    const updatedStock = {
      ...product.stock,
      [size]: Math.max(0, quantity),
    };

    await updateProduct(id, { stock: updatedStock });
  };
  const addCategory = async (newCat: Omit<Category, "id">) => {
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCat),
      });
      if (res.ok) {
        const savedCat = await res.json();
        setCategories((prev) => [...prev, savedCat]);
      } else {
        throw new Error("Failed to add category backend");
      }
    } catch (e) {
      console.error(e);
      const fallbackCat: Category = {
        ...newCat,
        id: `cat-${Date.now()}`,
      };
      setCategories((prev) => [...prev, fallbackCat]);
    }
  };

  const updateCategory = async (id: string, updatedFields: Partial<Category>) => {
    try {
      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updatedFields }),
      });
      if (res.ok) {
        const savedCat = await res.json();
        setCategories((prev) => prev.map((c) => (c.id === id ? savedCat : c)));
      } else {
        throw new Error("Failed to update category backend");
      }
    } catch (e) {
      console.error(e);
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
      );
    }
  };

  const deleteCategory = async (id: string) => {
    const categoryToDelete = categories.find((c) => c.id === id);
    if (!categoryToDelete) return;

    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        setProducts((prev) =>
          prev.filter((p) => p.category !== categoryToDelete.name)
        );
      } else {
        throw new Error("Failed to delete category backend");
      }
    } catch (e) {
      console.error(e);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setProducts((prev) =>
        prev.filter((p) => p.category !== categoryToDelete.name)
      );
    }
  };
  const addToCart = (product: Product, size: string) => {
    if (product.stock[size] <= 0) return;

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && item.size === size
      );

      if (existingItemIndex > -1) {
        if (prevCart[existingItemIndex].quantity >= product.stock[size]) return prevCart;

        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += 1;
        return newCart;
      } else {
        return [...prevCart, { product, quantity: 1, size }];
      }
    });
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.size === size))
    );
  };

  const updateCartQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (product && quantity > product.stock[size]) return;

    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };
  const login = async (
    email: string,
    password?: string,
    profile?: Pick<User, "fullName" | "phone" | "city" | "wilaya" | "gender">
  ): Promise<{ success: boolean; error?: string }> => {
    if (email === (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@parfumguy.com")) {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
          const user: User = { email, role: "admin" };
          setCurrentUser(user);
          if (typeof window !== "undefined") {
            localStorage.setItem("parfumguy_user", JSON.stringify(user));
          }
          return { success: true };
        } else {
          const data = await res.json();
          return { success: false, error: data.error || "Identifiants invalides." };
        }
      } catch (e) {
        console.error("Admin login error:", e);
        return { success: false, error: "Erreur de connexion au serveur." };
      }
    }
    const user: User = { email, role: "client", ...profile };
    setCurrentUser(user);

    if (typeof window !== "undefined") {
      localStorage.setItem("parfumguy_user", JSON.stringify(user));
      document.cookie = `parfumguy_user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=86400; SameSite=Lax`;
    }
    return { success: true };
  };

  const logout = async () => {
    setCurrentUser(null);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout API error:", e);
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("parfumguy_user");
    }
  };
  const checkout = async (info: {
    firstName: string;
    lastName: string;
    phone: string;
    wilaya: string;
    residence: string;
    email?: string;
  }) => {
    if (cart.length === 0) return { success: false };

    const getSizePrice = (product: Product, size: string): number => {
      if (product.sizePrices?.[size] !== undefined) return product.sizePrices[size];
      if (size === "50ml") return product.price;
      if (size === "100ml") return product.price * 1.5;
      const ml = parseInt(size);
      return ml ? product.price * (ml / 50) * 0.85 : product.price;
    };
    const basePrice = cart.reduce((acc, item) => {
      return acc + getSizePrice(item.product, item.size) * item.quantity;
    }, 0);
    const redemptionDiscount = pendingRedemption?.type === "discount"
      ? basePrice * ((pendingRedemption.discountPercent ?? 0) / 100)
      : 0;
    const totalPrice = Math.max(0, basePrice - redemptionDiscount);

    const newOrderId = `ord-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: Order = {
      id: newOrderId,
      customerEmail: info.email || currentUser?.email || "",
      firstName: info.firstName,
      lastName: info.lastName,
      phone: info.phone,
      wilaya: info.wilaya,
      residence: info.residence,
      items: cart.map((item) => ({
        productName: item.product.name,
        price: getSizePrice(item.product, item.size),
        quantity: item.quantity,
        size: item.size,
        image: item.product.image,
      })),
      totalPrice,
      createdAt: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "Pending",
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });

      if (!res.ok) throw new Error("Order creation failed in database");
      await Promise.all(
        cart.map((item) =>
          updateProductStock(
            item.product.id,
            item.size,
            item.product.stock[item.size] - item.quantity
          )
        )
      );

      setOrders((prev) => [newOrder, ...prev]);
      const earned = cart.reduce((s, i) => s + (i.product.pointsEarned || 0) * i.quantity, 0);
      const email = info.email || currentUser?.email || "";
      if (earned > 0 && email) creditPoints(email, earned);
      if (pendingRedemption && email) {
        adjustUserPoints(email, -pendingRedemption.pointsCost);
        setPendingRedemption(null);
      }
      clearCart();
      return { success: true, orderId: newOrderId };
    } catch (e) {
      console.error(e);
      cart.forEach((item) => {
        const product = products.find((p) => p.id === item.product.id);
        if (product) {
          product.stock[item.size] = Math.max(0, product.stock[item.size] - item.quantity);
        }
      });
      setOrders((prev) => [newOrder, ...prev]);
      const earned = cart.reduce((s, i) => s + (i.product.pointsEarned || 0) * i.quantity, 0);
      const email = info.email || currentUser?.email || "";
      if (earned > 0 && email) creditPoints(email, earned);
      if (pendingRedemption && email) {
        adjustUserPoints(email, -pendingRedemption.pointsCost);
        setPendingRedemption(null);
      }
      clearCart();
      return { success: true, orderId: newOrderId };
    }
  };

  const updateOrderStatus = async (id: string, status: Order["status"]) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status } : o))
        );
      } else {
        throw new Error("Failed to update order status backend");
      }
    } catch (e) {
      console.error(e);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
    }
  };

  const addBrand = async (b: Omit<Brand, "id">) => {
    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(b),
      });
      if (res.ok) {
        const saved: Brand = await res.json();
        setBrands(prev => [...prev, saved]);
      } else {
        setBrands(prev => [...prev, { ...b, id: `brand-${Date.now()}` }]);
      }
    } catch {
      setBrands(prev => [...prev, { ...b, id: `brand-${Date.now()}` }]);
    }
  };

  const updateBrand = async (id: string, b: Partial<Brand>) => {
    try {
      const res = await fetch("/api/brands", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...b }),
      });
      if (res.ok) {
        const saved: Brand = await res.json();
        setBrands(prev => prev.map(br => br.id === id ? saved : br));
      } else {
        setBrands(prev => prev.map(br => br.id === id ? { ...br, ...b } : br));
      }
    } catch {
      setBrands(prev => prev.map(br => br.id === id ? { ...br, ...b } : br));
    }
  };

  const deleteBrand = async (id: string) => {
    try {
      await fetch(`/api/brands?id=${id}`, { method: "DELETE" });
    } catch {  }
    setBrands(prev => prev.filter(br => br.id !== id));
  };

  const saveRewards = (updated: Reward[]) => {
    setRewards(updated);
    if (typeof window !== "undefined") localStorage.setItem("parfumguy_rewards", JSON.stringify(updated));
  };

  const addReward = (r: Omit<Reward, "id">) => {
    saveRewards([...rewards, { ...r, id: `rwd-${Date.now()}` }]);
  };

  const updateReward = (id: string, r: Partial<Reward>) => {
    saveRewards(rewards.map(rw => rw.id === id ? { ...rw, ...r } : rw));
  };

  const deleteReward = (id: string) => {
    saveRewards(rewards.filter(rw => rw.id !== id));
  };

  const getRegistry = (): Record<string, number> => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("parfumguy_pts_registry") || "{}"); } catch { return {}; }
  };

  const creditPoints = (email: string, pts: number) => {
    if (!email || pts <= 0) return;
    const registry = getRegistry();
    registry[email] = (registry[email] || 0) + pts;
    localStorage.setItem("parfumguy_pts_registry", JSON.stringify(registry));
    if (currentUser?.email === email) setUserPoints(registry[email]);
  };

  const adjustUserPoints = (email: string, delta: number) => {
    if (!email) return;
    const registry = getRegistry();
    registry[email] = Math.max(0, (registry[email] || 0) + delta);
    localStorage.setItem("parfumguy_pts_registry", JSON.stringify(registry));
    if (currentUser?.email === email) setUserPoints(registry[email]);
  };

  const getAllUsersPoints = (): Record<string, number> => getRegistry();

  const deleteProductSize = (productId: string, size: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const updatedStock = { ...product.stock };
    delete updatedStock[size];
    updateProduct(productId, { stock: updatedStock });
  };

  return (
    <AppContext.Provider
      value={{
        products,
        categories,
        brands,
        cart,
        orders,
        currentUser,
        addProduct,
        updateProduct,
        deleteProduct,
        updateProductStock,
        addCategory,
        updateCategory,
        deleteCategory,
        addBrand,
        updateBrand,
        deleteBrand,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        login,
        logout,
        checkout,
        updateOrderStatus,
        language,
        setLanguage,
        rewards,
        userPoints,
        pendingRedemption,
        setPendingRedemption,
        addReward,
        updateReward,
        deleteReward,
        creditPoints,
        adjustUserPoints,
        getAllUsersPoints,
        deleteProductSize,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};