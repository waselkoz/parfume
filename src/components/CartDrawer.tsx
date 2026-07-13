"use client";

import React, { useState } from "react";
import { useApp, CartItem } from "../context/AppContext";
import { X, Trash2, Plus, Minus, ShoppingBag, CreditCard, Check, ArrowRight, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { translations } from "../lib/translations";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const WILAYAS = [
  { code: "16", name: "Alger", price: 400, deskPrice: 250 },
  { code: "09", name: "Blida", price: 600, deskPrice: 300 },
  { code: "35", name: "Boumerdes", price: 600, deskPrice: 300 },
  { code: "42", name: "Tipaza", price: 600, deskPrice: 300 },
  { code: "10", name: "Bouira", price: 630, deskPrice: 300 },
  { code: "26", name: "Medea", price: 630, deskPrice: 300 },
  { code: "15", name: "Tizi Ouzou", price: 630, deskPrice: 300 },
  { code: "02", name: "Chlef", price: 720, deskPrice: 300 },
  { code: "23", name: "Annaba", price: 720, deskPrice: 300 },
  { code: "34", name: "Bordj Bou Arraridj", price: 720, deskPrice: 300 },
  { code: "06", name: "Bejaia", price: 720, deskPrice: 300 },
  { code: "21", name: "Skikda", price: 720, deskPrice: 300 },
  { code: "31", name: "Oran", price: 720, deskPrice: 300 },
  { code: "43", name: "Mila", price: 720, deskPrice: 0 },
  { code: "25", name: "Constantine", price: 720, deskPrice: 300 },
  { code: "46", name: "Ain Temouchent", price: 720, deskPrice: 300 },
  { code: "13", name: "Tlemcen", price: 720, deskPrice: 300 },
  { code: "22", name: "Sidi bel Abbas", price: 720, deskPrice: 300 },
  { code: "48", name: "Relizane", price: 720, deskPrice: 300 },
  { code: "28", name: "MSila", price: 720, deskPrice: 300 },
  { code: "29", name: "Mascara", price: 720, deskPrice: 300 },
  { code: "05", name: "Batna", price: 720, deskPrice: 300 },
  { code: "44", name: "Ain Defla", price: 720, deskPrice: 300 },
  { code: "38", name: "Tissemsilt", price: 720, deskPrice: 0 },
  { code: "19", name: "Setif", price: 720, deskPrice: 300 },
  { code: "04", name: "Oum el Bouaghi", price: 720, deskPrice: 300 },
  { code: "27", name: "Mostaganem", price: 720, deskPrice: 300 },
  { code: "18", name: "Jijel", price: 770, deskPrice: 300 },
  { code: "40", name: "Khenchela", price: 810, deskPrice: 300 },
  { code: "14", name: "Tiaret", price: 810, deskPrice: 300 },
  { code: "20", name: "Saida", price: 810, deskPrice: 300 },
  { code: "24", name: "Guelma", price: 810, deskPrice: 300 },
  { code: "41", name: "Souk Ahras", price: 810, deskPrice: 300 },
  { code: "36", name: "El Taref", price: 810, deskPrice: 0 },
  { code: "12", name: "Tebessa", price: 810, deskPrice: 300 },
  { code: "03", name: "Laghouat", price: 900, deskPrice: 430 },
  { code: "07", name: "Biskra", price: 900, deskPrice: 430 },
  { code: "17", name: "Djelfa", price: 900, deskPrice: 430 },
  { code: "51", name: "Ouled Djellal", price: 900, deskPrice: 0 },
  { code: "58", name: "El Meniaa", price: 990, deskPrice: 430 },
  { code: "39", name: "El Oued", price: 990, deskPrice: 0 },
  { code: "30", name: "Ouargla", price: 990, deskPrice: 430 },
  { code: "55", name: "Touggourt", price: 990, deskPrice: 430 },
  { code: "57", name: "El Mghair", price: 990, deskPrice: 0 },
  { code: "47", name: "Ghardaia", price: 990, deskPrice: 430 },
  { code: "08", name: "Bechar", price: 1080, deskPrice: 510 },
  { code: "45", name: "Naama", price: 1080, deskPrice: 510 },
  { code: "52", name: "Beni Abbas", price: 1080, deskPrice: 0 },
  { code: "32", name: "El Bayadh", price: 1080, deskPrice: 0 },
  { code: "37", name: "Tindouf", price: 1350, deskPrice: 0 },
  { code: "01", name: "Adrar", price: 1350, deskPrice: 600 },
  { code: "49", name: "Timimoune", price: 1350, deskPrice: 0 },
  { code: "53", name: "In Salah", price: 1530, deskPrice: 770 },
  { code: "11", name: "Tamanrasset", price: 1620, deskPrice: 850 },
  { code: "33", name: "Illizi", price: 1800, deskPrice: 850 }
];

const formatDZD = (price: number) => Math.round(price).toLocaleString("fr-DZ") + " DA";

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, updateCartQuantity, removeFromCart, checkout, language } = useApp();
  const isRtl = language === "ar";
  const t = translations[language as keyof typeof translations] || translations.fr;
  
  const [placedOrder, setPlacedOrder] = useState<{ id: string; price: number; wilaya: string } | null>(null);
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilaya, setWilaya] = useState("Alger");
  const [residence, setResidence] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"home" | "desk">("home");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateItemPrice = (item: CartItem) => {
    const variant = item.product.variants?.find(v => v.size === item.size) || item.product.variants?.[0];
    return variant?.price || 0;
  };

  const subtotal = cart.reduce((acc, item) => acc + calculateItemPrice(item) * item.quantity, 0);
  const selectedWilayaData = WILAYAS.find(w => w.name === wilaya) || WILAYAS[0];
  const deliveryCost = deliveryMethod === "home" ? selectedWilayaData.price : selectedWilayaData.deskPrice;
  const finalTotal = subtotal + deliveryCost;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    if (!firstName || !lastName || !phone || !wilaya || !residence) {
      setFormError(t.champsObligatoires || "Champs obligatoires.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await checkout({
        firstName,
        lastName,
        phone,
        wilaya,
        residence,
        email,
        stopDesk: deliveryMethod === "desk",
      });

      if (result.success && result.orderId) {
        setPlacedOrder({ id: result.orderId, price: subtotal, wilaya });
        setFirstName("");
        setLastName("");
        setPhone("");
        setResidence("");
        setEmail("");
        setIsCheckoutMode(false);
        toast.success("Commande passée avec succès ! Nous vous contacterons bientôt.");
      } else {
        setFormError(t.serveurErreur || "Une erreur est survenue.");
        toast.error(t.serveurErreur || "Une erreur est survenue.");
      }
    } catch (_err) {
      setFormError(t.serveurErreur || "Une erreur est survenue.");
      toast.error(t.serveurErreur || "Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeReceipt = () => {
    setPlacedOrder(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm"
              onClick={onClose}
            />

            <motion.div
              initial={{ x: isRtl ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? "-100%" : "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed inset-y-0 ${isRtl ? 'left-0 border-r' : 'right-0 border-l'} z-70 flex w-full max-w-md flex-col bg-white border-black/5 shadow-2xl`}
              dir={isRtl ? "rtl" : "ltr"}
            >
              <div className="flex items-center justify-between border-b border-black/5 px-6 py-5">
                <div className="flex items-center gap-3">
                  {isCheckoutMode ? (
                    <button 
                      onClick={() => setIsCheckoutMode(false)}
                      className="text-black/40 hover:text-black transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center p-0"
                    >
                      {isRtl ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                    </button>
                  ) : (
                    <ShoppingBag className="h-4 w-4 text-black/60" />
                  )}
                  <h2 className="font-sans text-sm font-bold tracking-[0.2em] uppercase text-black">
                    {isCheckoutMode ? (t.finaliserCommande || "Finaliser la Commande") : (t.votrePanier || "Votre Panier")}
                  </h2>
                  {!isCheckoutMode && (
                    <span className="text-[10px] font-bold text-black/30 bg-black/[0.03] px-2 py-0.5">
                      {cart.reduce((sum, i) => sum + i.quantity, 0)}
                    </span>
                  )}
                </div>
                <button onClick={onClose} className="text-black/30 hover:text-black transition-colors border-none bg-transparent cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                {isCheckoutMode ? (
                  <form onSubmit={handleCheckoutSubmit} className="space-y-6">
                    <div className="space-y-1">
                      <h3 className="font-sans text-sm font-bold text-black uppercase tracking-wider">
                        {t.finaliserCommande || "Informations de Livraison"}
                      </h3>
                      <p className="text-[10px] text-black/30 font-medium leading-relaxed">
                        Veuillez renseigner vos coordonnées pour que notre service client puisse valider votre expédition par téléphone.
                      </p>
                    </div>

                    <div className="h-px bg-black/[0.06] w-full" />

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[8px] sm:text-[9px] uppercase tracking-wider text-black/40 font-bold mb-1.5">
                            {t.firstNameLabel || "Prénom"} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder={t.firstNamePlaceholder || "Votre prénom"}
                            className={`w-full bg-transparent border-b border-black/[0.12] focus:border-black/50 text-black text-xs pb-2 outline-none transition-colors placeholder:text-black/15 font-medium ${isRtl ? 'text-right' : 'text-left'}`}
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] sm:text-[9px] uppercase tracking-wider text-black/40 font-bold mb-1.5">
                            {t.lastNameLabel || "Nom"} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder={t.lastNamePlaceholder || "Votre nom"}
                            className={`w-full bg-transparent border-b border-black/[0.12] focus:border-black/50 text-black text-xs pb-2 outline-none transition-colors placeholder:text-black/15 font-medium ${isRtl ? 'text-right' : 'text-left'}`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[8px] sm:text-[9px] uppercase tracking-wider text-black/40 font-bold mb-1.5">
                          {t.phoneLabel || "Numéro de Téléphone"} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder={t.phonePlaceholder || "0XX XXX XX XX"}
                          className={`w-full bg-transparent border-b border-black/[0.12] focus:border-black/50 text-black text-xs pb-2 outline-none transition-colors placeholder:text-black/15 font-medium ${isRtl ? 'text-right' : 'text-left'}`}
                        />
                      </div>

                      <div>
                        <label className="block text-[8px] sm:text-[9px] uppercase tracking-wider text-black/40 font-bold mb-1.5">
                          {(t as any).modeLivraisonLabel || "Mode de Livraison"} <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setDeliveryMethod("home")}
                            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors border ${deliveryMethod === "home" ? "bg-black text-white border-black" : "bg-transparent text-black/60 border-black/10 hover:border-black/30"}`}
                          >
                            À Domicile
                          </button>
                          <button
                            type="button"
                            disabled={selectedWilayaData.deskPrice === 0}
                            onClick={() => setDeliveryMethod("desk")}
                            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                              selectedWilayaData.deskPrice === 0
                                ? "bg-black/5 text-black/30 border-black/5 cursor-not-allowed"
                                : deliveryMethod === "desk"
                                  ? "bg-black text-white border-black"
                                  : "bg-transparent text-black/60 border-black/10 hover:border-black/30"
                            }`}
                          >
                            Stop Desk (Relais) {selectedWilayaData.deskPrice === 0 && <span className="block text-[8px] opacity-70">(Indisponible)</span>}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[8px] sm:text-[9px] uppercase tracking-wider text-black/40 font-bold mb-1.5">
                          {t.wilayaLabel || "Wilaya"} <span className="text-red-500">*</span>
                        </label>
                          <select
                          value={wilaya}
                          onChange={(e) => {
                            const newWilaya = e.target.value;
                            setWilaya(newWilaya);
                            const wData = WILAYAS.find(w => w.name === newWilaya);
                            if (wData && wData.deskPrice === 0 && deliveryMethod === "desk") {
                              setDeliveryMethod("home");
                            }
                          }}
                          className={`w-full bg-transparent border-b border-black/[0.12] focus:border-black/50 text-black text-xs pb-2 outline-none transition-colors appearance-none font-medium ${isRtl ? 'text-right' : 'text-left'}`}
                          required
                        >
                          {WILAYAS.map(w => (
                            <option key={w.code} value={w.name}>
                              {w.code} - {w.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-black/50 font-bold">{t.residenceLabel || "Adresse Complète"} *</label>
                        <input
                          type="text"
                          required
                          value={residence}
                          onChange={(e) => setResidence(e.target.value)}
                          placeholder="Rue, Quartier, Numéro..."
                          className={`w-full bg-transparent border-b border-black/[0.12] focus:border-black/50 text-black text-xs pb-2 outline-none transition-colors placeholder:text-black/15 font-medium ${isRtl ? 'text-right' : 'text-left'}`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-black/50 font-bold">{t.emailLabel || "Email"} (Optionnel)</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t.emailPlaceholder || "you@example.com"}
                          className={`w-full bg-transparent border-b border-black/[0.12] focus:border-black/50 text-black text-xs pb-2 outline-none transition-colors placeholder:text-black/15 font-medium ${isRtl ? 'text-right' : 'text-left'}`}
                        />
                      </div>
                    </div>

                    {formError && (
                      <p className="text-[10px] text-red-500/80 font-bold tracking-wider">{formError}</p>
                    )}

                                        <div className="border border-black/5 p-4 space-y-2 bg-[#faf9f6]">
                      <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider text-black/50">
                        <span>{t.sousTotal || "Sous-total"}</span>
                        <span>{formatDZD(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider text-black/50">
                        <span>{t.deliveryLabel || "Livraison"} ({wilaya})</span>
                        <span>{formatDZD(deliveryCost)}</span>
                      </div>
                      <div className="h-px bg-black/[0.05] my-1" />
                      <div className="flex justify-between text-xs uppercase font-extrabold tracking-wider text-black">
                        <span>{t.totalLabel || "Total"}</span>
                        <span>{formatDZD(finalTotal)}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 bg-black hover:bg-black/85 text-white font-bold uppercase tracking-[0.2em] text-[10px] py-4 transition-all border-none cursor-pointer disabled:opacity-50"
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      {isSubmitting ? "Envoi..." : (t.finaliserCommande || "Confirmer la commande")}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </form>
                ) : cart.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 flex items-center justify-center border border-black/5">
                      <ShoppingBag className="h-6 w-6 text-black/15" />
                    </div>
                    <div>
                      <p className="font-sans text-sm font-bold text-black/40 tracking-wider uppercase">
                        {t.panierVide || "Votre panier est vide"}
                      </p>
                      <p className="text-[10px] text-black/30 mt-1 max-w-[220px] mx-auto font-medium">
                        {t.parcourirCollections || "Parcourez nos collections pour découvrir votre signature olfactive."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    

                                        <div className="space-y-3">
                      {cart.map((item) => (
                        <motion.div
                          key={`${item.product.id}-${item.size}`}
                          layout
                          className="flex gap-4 border border-black/5 p-3.5 hover:border-black/10 transition-all bg-white"
                        >
                                                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden border border-black/5 bg-black/[0.01]">
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              width={80}
                              height={80}
                              className="h-full w-full object-cover"
                            />
                          </div>

                                                    <div className="flex flex-1 flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between">
                                <h4 className="font-sans text-xs font-bold text-black leading-tight line-clamp-1">
                                  {item.product.name}
                                </h4>
                                <span className="text-xs font-bold text-black pl-2 pr-2">
                                  {formatDZD(calculateItemPrice(item) * item.quantity)}
                                </span>
                              </div>
                              <p className="text-[9px] text-black/30 uppercase tracking-[0.15em] font-medium mt-0.5">
                                {item.product.category} • {item.size}
                              </p>
                            </div>

                                                        <div className="flex items-center justify-between">
                              <div className="flex items-center gap-0 border border-black/10">
                                <button
                                  onClick={() => updateCartQuantity(item.product.id, item.size, item.quantity - 1)}
                                  className="text-black/30 hover:text-black transition-colors p-1.5 border-none bg-transparent cursor-pointer"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="text-[10px] font-bold text-black w-7 text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateCartQuantity(item.product.id, item.size, item.quantity + 1)}
                                  className="text-black/30 hover:text-black transition-colors p-1.5 border-none bg-transparent cursor-pointer"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>

                              <button
                                onClick={() => removeFromCart(item.product.id, item.size)}
                                className="text-black/15 hover:text-red-500 transition-colors p-1 border-none bg-transparent cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

                            {!isCheckoutMode && cart.length > 0 && (
                <div className="border-t border-black/5 px-6 py-5 space-y-3">

                  {/* Totals */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-black/40 font-bold">{t.sousTotal || "Sous-total"}</span>
                      <span className="font-sans text-sm font-black text-black">{formatDZD(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-black/5">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-black/60 font-black">Total</span>
                      <span className="font-sans text-lg font-black text-black">{formatDZD(subtotal)} <span className="text-[9px] font-normal text-black/40 uppercase tracking-widest block text-right mt-0.5">Hors livraison</span></span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsCheckoutMode(true)}
                    className="w-full flex items-center justify-center gap-2 bg-black hover:bg-black/85 text-white font-bold uppercase tracking-[0.2em] text-[10px] py-4 transition-all border-none cursor-pointer"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    {t.finaliserCommande || "Finaliser la Commande"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

            <AnimatePresence>
        {placedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white border border-black/5 p-8 text-center shadow-2xl"
              dir={isRtl ? "rtl" : "ltr"}
            >
                            <div className="mx-auto flex h-14 w-14 items-center justify-center border border-black/10 mb-6">
                <Check className="h-6 w-6 text-black" />
              </div>

              <h3 className="font-sans text-xl font-black text-black tracking-tight mb-2">
                {t.commandeConfirmee || "Commande Confirmée"}
              </h3>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/30 font-bold mb-6">
                M&D Parfum
              </p>

              <div className="border border-black/5 p-5 text-left space-y-3 mb-6 bg-[#faf9f6]">
                <div className="flex justify-between border-b border-black/[0.04] pb-2 text-xs">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-black/40 font-bold">{t.commandeLabel || "Commande"}</span>
                  <span className="text-[11px] font-bold text-black">{placedOrder.id}</span>
                </div>
                <div className="flex justify-between border-b border-black/[0.04] pb-2 text-xs">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-black/40 font-bold">{t.sousTotal || "Sous-total"}</span>
                  <span className="font-medium text-black/60">{formatDZD(placedOrder.price)}</span>
                </div>
                <div className="flex justify-between border-b border-black/[0.04] pb-2 text-xs">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-black/40 font-bold">{t.livraisonLabel || "Livraison"}</span>
                  <span className="text-[11px] font-medium text-black/60">
                    {placedOrder.wilaya || "Standard"} ({formatDZD((WILAYAS.find(w => w.name === placedOrder.wilaya)?.price || 600))})
                  </span>
                </div>
                <div className="flex justify-between pt-1 text-xs">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-black/60 font-bold">{t.totalLabel || "Total"}</span>
                  <span className="font-sans text-base font-black text-black">
                    {formatDZD(placedOrder.price + ((WILAYAS.find(w => w.name === placedOrder.wilaya)?.price || 600)))}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-black/50 font-medium leading-relaxed mb-6 px-4">
                {t.checkoutSuccessMsg || "Votre commande a été transmise avec succès ! Notre service client va vous contacter par téléphone pour confirmer la livraison."}
              </p>

              <button
                onClick={closeReceipt}
                className="w-full bg-black hover:bg-black/85 text-white font-bold uppercase tracking-[0.2em] text-[10px] py-4 transition-all border-none cursor-pointer"
              >
                {t.retourBoutique || "Retour à la Boutique"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};