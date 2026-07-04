

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
export interface Product {
  id: string;
  name: string;
  description: string;
  brand?: string;
  category: string;
  image: string;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  rating: number;
  reviewsCount: number;
  variants: { size: string; price: number; stock: number }[];
  translations: Record<string, { name: string; description: string }>;
  lowStockAlert: number;
  discountPercent?: number;
  isTendance?: boolean;
  isBestSeller?: boolean;
  hoverImage?: string;
  pointsEarned?: number;
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
  translations?: Record<string, { name: string; description: string }>;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
}

export interface OrderItem {
  productId?: string;
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
  // Delivery / Elogistia fields (populated server-side)
  trackingId?: string;
  deliveryStatus?: string;
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
  favorites: string[];
  toggleFavorite: (id: string, e?: React.MouseEvent) => void;
  isFav: (id: string) => boolean;

}

const AppContext = createContext<AppContextType | undefined>(undefined);
const DEFAULT_CATEGORIES: Category[] = [];

const DEFAULT_PRODUCTS: Product[] = [];
const DEFAULT_BRANDS: Brand[] = [];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [brands, setBrands] = useState<Brand[]>(DEFAULT_BRANDS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [language, setLanguageState] = useState<"fr" | "en" | "ar">("fr");
  
  useEffect(() => {
    const stored = localStorage.getItem("parfumguy_lang");
    if (stored === "fr" || stored === "en" || stored === "ar") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguageState(stored);
    }
  }, []);

  const [favorites, setFavorites] = useState<string[]>([]);

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
        // Language already initialized synchronously above; no need to set again

        const storedUser = localStorage.getItem("parfumguy_user");
        if (storedUser) {
          try {
            const u = JSON.parse(storedUser);
            setCurrentUser(u);
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

        try {
          const storedFavs = localStorage.getItem("parfumguy_favorites");
          if (storedFavs) {
            setFavorites(JSON.parse(storedFavs));
          }
        } catch { /* ignore */ }
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
    if (!product || !product.variants) return;

    const updatedVariants = product.variants.map(v => 
      v.size === size ? { ...v, stock: Math.max(0, quantity) } : v
    );

    await updateProduct(id, { variants: updatedVariants });
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
    const variant = product.variants?.find((v) => v.size === size);
    if (!variant || variant.stock <= 0) return;

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && item.size === size
      );

      if (existingItemIndex > -1) {
        if (prevCart[existingItemIndex].quantity >= variant.stock) return prevCart;

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
    const variant = product?.variants?.find((v) => v.size === size);
    if (variant && quantity > variant.stock) return;

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
      _profile?: Pick<User, "fullName" | "phone" | "city" | "wilaya" | "gender">
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (res.ok) {
          const data = await res.json();
          const user: User = { email, role: data.role };
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
        console.error("Login error:", e);
        return { success: false, error: "Erreur de connexion au serveur." };
      }
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
      const variant = product.variants?.find(v => v.size === size);
      return variant ? variant.price : 0;
    };
    const basePrice = cart.reduce((acc, item) => {
      return acc + getSizePrice(item.product, item.size) * item.quantity;
    }, 0);
    const totalPrice = Math.max(0, basePrice);

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
        productId: item.product.id,
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
      // Stock is now deducted when order status is marked as 'Completed'

      setOrders((prev) => [newOrder, ...prev]);
      clearCart();
      return { success: true, orderId: newOrderId };
    } catch (e) {
      console.error(e);
      setOrders((prev) => [newOrder, ...prev]);
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



  const deleteProductSize = (productId: string, size: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product || !product.variants) return;
    const updatedVariants = product.variants.filter(v => v.size !== size);
    updateProduct(productId, { variants: updatedVariants });
  };

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      if (typeof window !== "undefined") {
        localStorage.setItem("parfumguy_favorites", JSON.stringify(next));
      }
      return next;
    });
  };

  const isFav = (id: string) => favorites.includes(id);

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
        favorites,
        toggleFavorite,
        isFav,
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