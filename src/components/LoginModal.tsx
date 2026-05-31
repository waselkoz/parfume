"use client";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { translations } from "../lib/translations";
import { X, User, Phone, MapPin, Mail, Lock, ChevronDown } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const WILAYAS = [
  "Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Béjaïa","Biskra","Béchar",
  "Blida","Bouira","Tamanrasset","Tébessa","Tlemcen","Tiaret","Tizi Ouzou","Alger",
  "Djelfa","Jijel","Sétif","Saïda","Skikda","Sidi Bel Abbès","Annaba","Guelma",
  "Constantine","Médéa","Mostaganem","M'Sila","Mascara","Ouargla","Oran","El Bayadh",
  "Illizi","Bordj Bou Arréridj","Boumerdès","El Tarf","Tindouf","Tissemsilt",
  "El Oued","Khenchela","Souk Ahras","Tipaza","Mila","Aïn Defla","Naâma",
  "Aïn Témouchent","Ghardaïa","Relizane","Timimoun","Bordj Badji Mokhtar",
  "Ouled Djellal","Béni Abbès","In Salah","In Guezzam","Touggourt","Djanet",
  "El M'Ghair","El Meniaa",
];

const inputClass = (isRtl: boolean) =>
  `w-full bg-white border border-black/10 focus:border-[#000000] text-black text-xs px-3 py-2.5 outline-none transition-all rounded-sm placeholder:text-black/25 ${isRtl ? "text-right" : ""}`;

const labelClass = (isRtl: boolean) =>
  `flex items-center gap-1.5 text-[9px] tracking-[0.18em] text-black/50 mb-1.5 font-bold uppercase ${isRtl ? "flex-row-reverse justify-end" : ""}`;

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, language } = useApp();
  const t = translations[language] || translations.fr;
  const isRtl = language === "ar";

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [gender, setGender] = useState<"homme" | "femme" | "">("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setEmail(""); setPassword(""); setFullName(""); setPhone("");
    setCity(""); setWilaya(""); setGender(""); setError("");
  };

  const switchMode = (toRegister: boolean) => {
    setIsRegister(toRegister);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isRegister) {
      if (!fullName || !phone || !city || !wilaya || !email || !password) {
        setError(t.champsObligatoires);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, fullName, phone, city, wilaya, gender: gender || "autre" }),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || t.serveurErreur);
          setLoading(false);
          return;
        }
        const result = await login(email, undefined, { fullName, phone, city, wilaya, gender: gender || undefined });
        if (result.success) { reset(); onClose(); if (onSuccess) onSuccess(); }
        else setError(result.error || t.identifiantsInvalides);
      } catch {
        setError(t.serveurErreur);
      }
    } else {
      if (!email || !password) { setError(t.champsObligatoires); setLoading(false); return; }
      try {
        const result = await login(email, password);
        if (result.success) { reset(); onClose(); if (onSuccess) onSuccess(); }
        else setError(result.error || t.identifiantsInvalides);
      } catch {
        setError(t.serveurErreur);
      }
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-2xl px-4 py-6"
          onClick={(e) => { if (e.target === e.currentTarget) { reset(); onClose(); } }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
            className="relative w-full max-w-md bg-white shadow-2xl overflow-hidden"
            dir={isRtl ? "rtl" : "ltr"}
          >
            {/* Accent top bar */}
            <div className="h-1 w-full bg-accent-gradient" />

            {/* Header */}
            <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-black/5">
              <div>
                <p className="text-black text-sm font-bold tracking-[0.3em] uppercase">PARFUM<span className="text-[#000000]">·</span>GUY</p>
                <p className="text-[9px] tracking-[0.25em] text-black/35 font-medium mt-0.5 uppercase">
                  {isRegister ? t.sinscrire : t.connexion}
                </p>
              </div>
              <button
                onClick={() => { reset(); onClose(); }}
                className="w-8 h-8 flex items-center justify-center text-black/30 hover:text-[#000000] transition-colors rounded-full hover:bg-[#f0f0f0]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-black/5">
              <button
                type="button"
                onClick={() => switchMode(false)}
                className={`flex-1 py-3.5 text-[9px] tracking-[0.2em] uppercase font-bold transition-all cursor-pointer border-none bg-transparent ${!isRegister ? "text-[#000000] border-b-2 border-[#000000]" : "text-black/35 hover:text-black/60"}`}
              >
                {t.signInBtn}
              </button>
              <button
                type="button"
                onClick={() => switchMode(true)}
                className={`flex-1 py-3.5 text-[9px] tracking-[0.2em] uppercase font-bold transition-all cursor-pointer border-none bg-transparent ${isRegister ? "text-[#000000] border-b-2 border-[#000000]" : "text-black/35 hover:text-black/60"}`}
              >
                {t.sinscrire}
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-7 pt-5 pb-7 space-y-4 max-h-[70vh] overflow-y-auto">

              {/* ── REGISTER FIELDS ── */}
              {isRegister && (
                <>
                  {/* Full Name */}
                  <div>
                    <label className={labelClass(isRtl)}>
                      <User className="h-2.5 w-2.5 text-[#000000]" />
                      {t.fullNameLabel}
                    </label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                      placeholder={t.fullNamePlaceholder} className={inputClass(isRtl)} />
                  </div>

          
                  <div>
                    <label className={labelClass(isRtl)}>
                      <Phone className="h-2.5 w-2.5 text-[#000000]" />
                      {t.phoneLabel}
                    </label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                      placeholder={t.phonePlaceholder} className={inputClass(isRtl)} />
                  </div>

                  {/* City + Wilaya side by side */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass(isRtl)}>
                        <MapPin className="h-2.5 w-2.5 text-[#000000]" />
                        {t.cityLabel}
                      </label>
                      <input type="text" value={city} onChange={e => setCity(e.target.value)}
                        placeholder={t.cityPlaceholder} className={inputClass(isRtl)} />
                    </div>
                    <div>
                      <label className={labelClass(isRtl)}>
                        <MapPin className="h-2.5 w-2.5 text-[#000000]" />
                        {t.wilayaLabel}
                      </label>
                      <div className="relative">
                        <select value={wilaya} onChange={e => setWilaya(e.target.value)}
                          className={`${inputClass(isRtl)} appearance-none pr-7 cursor-pointer`}>
                          <option value="">—</option>
                          {WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Genre */}
                  <div>
                    <label className={labelClass(isRtl)}>{t.genreLabel}</label>
                    <div className={`flex gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                      {(["homme", "femme"] as const).map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGender(prev => prev === g ? "" : g)}
                          className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-[0.15em] border transition-all rounded-sm ${gender === g ? "bg-[#000000] border-[#000000] text-white" : "border-black/10 text-black/40 hover:border-[#000000] hover:text-[#000000]"}`}
                        >
                          {g === "homme" ? t.genreHomme : t.genmeFemme}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-black/5" />
                </>
              )}

              {/* Email */}
              <div>
                <label className={labelClass(isRtl)}>
                  <Mail className="h-2.5 w-2.5 text-[#000000]" />
                  {t.emailLabel}
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder} className={inputClass(isRtl)} />
              </div>

              {/* Password */}
              <div>
                <label className={labelClass(isRtl)}>
                  <Lock className="h-2.5 w-2.5 text-[#000000]" />
                  {t.passwordLabel}
                </label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder} className={inputClass(isRtl)} />
              </div>

              {/* Forgot password (sign-in only) */}
              {!isRegister && (
                <div className={`${isRtl ? "text-left" : "text-right"}`}>
                  <button type="button" className="text-[9px] text-[#000000]/70 hover:text-[#000000] tracking-wider font-medium transition-colors">
                    {t.motDePasseOublie}
                  </button>
                </div>
              )}

              {/* Error */}
              {error && (
                <p className={`text-[10px] text-red-500 font-semibold tracking-wide bg-red-50 border border-red-100 px-3 py-2 rounded-sm ${isRtl ? "text-right" : ""}`}>
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent-gradient text-white text-[9px] tracking-[0.3em] uppercase py-3.5 font-bold mt-1 cursor-pointer border-none rounded-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="inline-block h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : null}
                {isRegister ? t.registerBtn : t.signInBtn}
              </button>

              {/* Switch mode link */}
              <p className={`text-center text-[9px] text-black/35 tracking-wide ${isRtl ? "text-right" : ""}`}>
                {isRegister ? (
                  <>
                    {t.alreadyHaveAccount.split("?")[0]}?{" "}
                    <button type="button" onClick={() => switchMode(false)}
                      className="text-[#000000] font-bold hover:underline cursor-pointer bg-transparent border-none p-0">
                      {t.signInBtn}
                    </button>
                  </>
                ) : (
                  <>
                    {t.dontHaveAccount.split("?")[0]}?{" "}
                    <button type="button" onClick={() => switchMode(true)}
                      className="text-[#000000] font-bold hover:underline cursor-pointer bg-transparent border-none p-0">
                      {t.registerBtn}
                    </button>
                  </>
                )}
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
