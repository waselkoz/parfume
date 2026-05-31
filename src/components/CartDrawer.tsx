"use client";

import React, { useState } from "react";
import { useApp, CartItem } from "../context/AppContext";
import { X, Trash2, Plus, Minus, ShoppingBag, CreditCard, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { translations } from "../lib/translations";
import { motion, AnimatePresence } from "framer-motion";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALGERIAN_WILAYAS = [
  "01 - Adrar", "02 - Chlef", "03 - Laghouat", "04 - Oum El Bouaghi", "05 - Batna",
  "06 - Béjaïa", "07 - Biskra", "08 - Béchar", "09 - Blida", "10 - Bouira",
  "11 - Tamanrasset", "12 - Tébessa", "13 - Tlemcen", "14 - Tiaret", "15 - Tizi Ouzou",
  "16 - Alger", "17 - Djelfa", "18 - Jijel", "19 - Sétif", "20 - Saïda",
  "21 - Skikda", "22 - Sidi Bel Abbès", "23 - Annaba", "24 - Guelma", "25 - Constantine",
  "26 - Médéa", "27 - Mostaganem", "28 - M'Sila", "29 - Mascara", "30 - Ouargla",
  "31 - Oran", "32 - El Bayadh", "33 - Illizi", "34 - Bordj Bou Arréridj", "35 - Boumerdès",
  "36 - El Tarf", "37 - Tindouf", "38 - Tissemsilt", "39 - El Oued", "40 - Khenchela",
  "41 - Souk Ahras", "42 - Tipaza", "43 - Mila", "44 - Aïn Defla", "45 - Naâma",
  "46 - Aïn Témouchent", "47 - Ghardaïa", "48 - Relizane", "49 - El M'Ghair", "50 - El Meniaa",
  "51 - Ouled Djellal", "52 - Bordj Baji Mokhtar", "53 - Béni Abbès", "54 - In Salah", 
  "55 - In Guezzam", "56 - Touggourt", "57 - Djanet", "58 - El M'Ghair"
];

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, updateCartQuantity, removeFromCart, checkout, language } = useApp();
  const t = translations[language] || translations.fr;
  const isRtl = language === "ar";
  
  const [placedOrder, setPlacedOrder] = useState<{ id: string; price: number } | null>(null);
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilaya, setWilaya] = useState("16 - Alger");
  const [residence, setResidence] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateItemPrice = (item: CartItem) => {
    const sizeMultiplier = item.size === "100ml" ? 1.5 : 1.0;
    return item.product.price * sizeMultiplier;
  };

  const subtotal = cart.reduce((acc, item) => {
    return acc + calculateItemPrice(item) * item.quantity;
  }, 0);

  const FREE_SHIPPING_THRESHOLD = 150;
  const progressPercent = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

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
      });

      if (result.success && result.orderId) {
        setPlacedOrder({ id: result.orderId, price: subtotal });
        setFirstName("");
        setLastName("");
        setPhone("");
        setResidence("");
        setEmail("");
        setIsCheckoutMode(false);
      } else {
        setFormError(t.serveurErreur || "Une erreur est survenue.");
      }
    } catch (err) {
      setFormError(t.serveurErreur || "Une erreur est survenue.");
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
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={onClose}
            />

                        <motion.div
              initial={{ x: isRtl ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? "-100%" : "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed inset-y-0 ${isRtl ? 'left-0 border-r' : 'right-0 border-l'} z-50 flex w-full max-w-md flex-col bg-white border-black/5 shadow-2xl`}
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
                          {t.wilayaLabel || "Wilaya"} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={wilaya}
                          onChange={(e) => setWilaya(e.target.value)}
                          className="w-full bg-transparent border-b border-black/[0.12] focus:border-black/50 text-black text-xs pb-2 outline-none transition-colors font-medium py-1 cursor-pointer"
                        >
                          {ALGERIAN_WILAYAS.map((w) => (
                            <option key={w} value={w} className="text-neutral-900 bg-white">
                              {w}
                            </option>
                          ))}
                        </select>
                      </div>

                                            <div>
                        <label className="block text-[8px] sm:text-[9px] uppercase tracking-wider text-black/40 font-bold mb-1.5">
                          {t.residenceLabel || "Lieu de Résidence / Adresse"} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={residence}
                          onChange={(e) => setResidence(e.target.value)}
                          placeholder={t.residencePlaceholder || "Adresse de résidence"}
                          className={`w-full bg-transparent border-b border-black/[0.12] focus:border-black/50 text-black text-xs pb-2 outline-none transition-colors placeholder:text-black/15 font-medium ${isRtl ? 'text-right' : 'text-left'}`}
                        />
                      </div>

                                            <div>
                        <label className="block text-[8px] sm:text-[9px] uppercase tracking-wider text-black/40 font-bold mb-1.5">
                          {t.emailLabel || "E-mail (Facultatif)"}
                        </label>
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
                        <span>${subtotal.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider text-black/50">
                        <span>{t.deliveryLabel || "Livraison"}</span>
                        <span>{subtotal >= FREE_SHIPPING_THRESHOLD ? (t.gratuiteLabel || "Gratuite") : "$10"}</span>
                      </div>
                      <div className="h-px bg-black/[0.05] my-1" />
                      <div className="flex justify-between text-xs uppercase font-extrabold tracking-wider text-black">
                        <span>{t.totalLabel || "Total"}</span>
                        <span>${(subtotal + (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 10)).toFixed(0)}</span>
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
                                        <div className="border border-black/5 p-4 space-y-2.5">
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider">
                        <span className="text-black/40 font-bold">
                          {t.livraisonGratuite || "Livraison Gratuite"}
                        </span>
                        {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                          <span className="text-black font-bold flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            {t.debloquee || "Débloquée"}
                          </span>
                        ) : (
                          <span className="text-black/30 font-medium">
                            +${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(0)} {t.ajouterPourLivraison || "avant livraison gratuite"}
                          </span>
                        )}
                      </div>
                      <div className="h-[2px] w-full bg-black/[0.04] overflow-hidden">
                        <motion.div
                          className="h-full bg-black"
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                                        <div className="space-y-3">
                      {cart.map((item) => (
                        <motion.div
                          key={`${item.product.id}-${item.size}`}
                          layout
                          className="flex gap-4 border border-black/5 p-3.5 hover:border-black/10 transition-all bg-white"
                        >
                                                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden border border-black/5 bg-black/[0.01]">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
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
                                  ${(calculateItemPrice(item) * item.quantity).toFixed(0)}
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
                <div className="border-t border-black/5 px-6 py-5 space-y-4">
                                    <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-black/40 font-bold">
                      {t.sousTotal || "Sous-total"}
                    </span>
                    <span className="font-sans text-lg font-black text-black">
                      ${subtotal.toFixed(0)}
                    </span>
                  </div>

                                    <div className="flex items-center gap-2 text-[10px] text-black/30 font-medium">
                    <div className={`h-1.5 w-1.5 rounded-full ${subtotal >= FREE_SHIPPING_THRESHOLD ? 'bg-black' : 'bg-black/15'}`} />
                    {subtotal >= FREE_SHIPPING_THRESHOLD 
                      ? (t.livraisonGratuiteIncluse || "Livraison gratuite incluse")
                      : `${t.ajouterPourLivraison || "Ajoutez"} $${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(0)}`}
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
                Maison Vélours, Paris
              </p>

                            <div className="border border-black/5 p-5 text-left space-y-3 mb-6">
                <div className="flex justify-between border-b border-black/[0.04] pb-2 text-xs">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-black/40 font-bold">{t.commandeLabel || "Commande"}</span>
                  <span className="text-[11px] font-bold text-black">{placedOrder.id}</span>
                </div>
                <div className="flex justify-between border-b border-black/[0.04] pb-2 text-xs">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-black/40 font-bold">{t.livraisonLabel || "Livraison"}</span>
                  <span className="text-[11px] font-medium text-black/60">
                    {placedOrder.price >= FREE_SHIPPING_THRESHOLD ? (t.gratuiteLabel || "Gratuite") : (t.standardLabel || "Standard")}
                  </span>
                </div>
                <div className="flex justify-between pt-1 text-xs">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-black/60 font-bold">{t.totalLabel || "Total"}</span>
                  <span className="font-sans text-base font-black text-black">
                    ${(placedOrder.price + (placedOrder.price >= FREE_SHIPPING_THRESHOLD ? 0 : 10)).toFixed(0)}
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