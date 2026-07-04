"use client";

import React, { useState, useEffect, useRef } from "react";

interface LanguageSelectorProps {
  language: "fr" | "en" | "ar";
  setLanguage: (lang: "fr" | "en" | "ar") => void;
}

export function LanguageSelector({ language, setLanguage }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "fr", flag: "🇫🇷", label: "FR" },
    { code: "en", flag: "🇬🇧", label: "EN" },
    { code: "ar", flag: "🇩🇿", label: "AR" },
  ] as const;

  const currentLanguage = languages.find((l) => l.code === language) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-neutral-200/80 bg-white hover:bg-neutral-50 text-[10px] sm:text-xs font-black text-neutral-800 transition-all shadow-sm cursor-pointer select-none active:scale-95"
      >
        <span className="text-sm sm:text-base leading-none">{currentLanguage.flag}</span>
        <span>{currentLanguage.label}</span>
        <svg
          className={`h-3 w-3 text-neutral-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-24 bg-white border border-neutral-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-fade-in">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLanguage(l.code);
                setIsOpen(false);
              }}
              className={`flex items-center gap-2 w-full px-3.5 py-2 text-left text-[11px] sm:text-xs font-bold hover:bg-neutral-50 transition-colors cursor-pointer ${
                language === l.code ? "text-neutral-900 bg-neutral-50/50" : "text-neutral-500"
              }`}
            >
              <span className="text-base leading-none">{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
