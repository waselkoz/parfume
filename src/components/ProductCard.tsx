"use client";

import React from "react";
import { Product, useApp } from "../context/AppContext";
import { Star, Eye, Plus } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onViewDetails: () => void;
  index?: number; // Used for collector numbering e.g. [ N°01 ]
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails, index = 0 }) => {
  const { addToCart } = useApp();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, "50ml");
  };

  const formattedNumber = `N°0${index + 1}`;

  return (
    <div
      onClick={onViewDetails}
      className="group relative cursor-pointer border border-neutral-900/15 bg-luxury-darker p-5 transition-all duration-750 hover:border-neutral-900/40 hover:shadow-2xl hover:shadow-neutral-900/5 flex flex-col justify-between h-[450px]"
      style={{
        // Give cards subtle alternating offsets on desktops for an asymmetrical magazine rhythm
        transform: index % 2 !== 0 ? "translateY(16px)" : "none"
      }}
    >
      {/* Editorial Card Header */}
      <div className="flex items-center justify-between border-b border-neutral-900/10 pb-3 mb-4 text-[9px] uppercase tracking-[0.2em] text-neutral-400 font-serif">
        <span className="font-semibold">{formattedNumber}</span>
        <span className="text-neutral-900 tracking-[0.3em] font-bold">In Stock</span>
      </div>

      {/* Portrait container */}
      <div className="relative w-full flex-grow overflow-hidden bg-luxury-dark border border-neutral-900/10">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
        />
        
        {/* Subtle white-glint overlay on hover */}
        <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Hover actions block - chic minimal overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-luxury-darker/90 via-luxury-darker/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 bg-luxury-dark border border-neutral-900/30 text-neutral-700 hover:text-neutral-900 text-[9px] uppercase font-bold tracking-[0.25em] py-2.5 transition-all rounded-none"
            >
              <Eye className="h-3.5 w-3.5" />
              Detail
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-1.5 bg-neutral-900 text-white hover:opacity-90 text-[9px] uppercase font-bold tracking-[0.25em] py-2.5 transition-all rounded-none"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Info footer */}
      <div className="pt-4 space-y-2 flex flex-col justify-end">
        <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.25em] text-neutral-400">
          <span className="font-bold text-neutral-500">{product.category}</span>
          <div className="flex items-center gap-0.5">
            <Star className="h-2.5 w-2.5 fill-neutral-900 text-neutral-900" />
            <span className="font-semibold">{product.rating.toFixed(1)}</span>
          </div>
        </div>

        <div>
          <h3 className="font-serif text-lg font-light tracking-wider text-neutral-800 transition-colors group-hover:text-neutral-900-dark">
            {product.name}
          </h3>
          <p className="text-[10px] text-neutral-400 font-sans italic line-clamp-1 mt-0.5">
            T: {product.topNotes[0]} &bull; H: {product.heartNotes[0]} &bull; B: {product.baseNotes[0]}
          </p>
        </div>

        <div className="flex items-baseline justify-between pt-2 border-t border-neutral-900/10 text-xs">
          <span className="font-serif font-bold text-neutral-900-dark tracking-wide">
            ${product.price} <span className="text-[9px] text-neutral-400 uppercase tracking-widest font-sans font-medium pl-1">[ 50ML ]</span>
          </span>
          <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-neutral-400 group-hover:text-neutral-900 transition-colors font-serif block">
            Inspect Essence &rarr;
          </span>
        </div>
      </div>
    </div>
  );
};
