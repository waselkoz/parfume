import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { getInitialProducts, getInitialCategories, getInitialBrands } from "@/lib/serverData";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navbar } from "@/components/Navbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "M&D Parfum | Luxury Perfume Boutique",
  description: "M&D Parfum - Discover authentic luxury fragrances. Shop our curated collection.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [initialProducts, initialCategories, initialBrands] = await Promise.all([
    getInitialProducts(),
    getInitialCategories(),
    getInitialBrands()
  ]);

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-neutral-800 font-sans selection:bg-neutral-900 selection:text-white">
        <AppProvider 
          initialProducts={initialProducts} 
          initialCategories={initialCategories} 
          initialBrands={initialBrands}
        >
          <Navbar />
          {children}
          <MobileBottomNav />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
            draggable
            theme="light"
            toastClassName="!font-sans !text-sm !rounded-none !shadow-lg"
          />
        </AppProvider>
      </body>
    </html>
  );
}
