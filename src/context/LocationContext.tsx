"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { useLanguage } from "./LanguageContext";

export type CountryCode = "eg" | "sa" | "ae";

export interface CountryInfo {
  code: CountryCode;
  nameKey: string;
  currencyKey: string;
  currencySymbol: string;
  flag: React.FC<{ className?: string }>;
}

// Crisp Flag SVG Components
export const EgyptFlag: React.FC<{ className?: string }> = ({ className = "w-5 h-3.5" }) => (
  <svg className={`${className} rounded-xs shadow-2xs overflow-hidden shrink-0`} viewBox="0 0 60 40" fill="none">
    <rect width="60" height="40" rx="2" fill="#FFFFFF" />
    <rect width="60" height="13.33" fill="#C02626" />
    <rect y="26.67" width="60" height="13.33" fill="#140E0A" />
    {/* Eagle Emblem in Center */}
    <circle cx="30" cy="20" r="3.5" fill="#D49B44" />
    <path d="M28 20L30 18L32 20L31 22H29L28 20Z" fill="#B87B2E" />
  </svg>
);

export const SaudiFlag: React.FC<{ className?: string }> = ({ className = "w-5 h-3.5" }) => (
  <svg className={`${className} rounded-xs shadow-2xs overflow-hidden shrink-0`} viewBox="0 0 60 40" fill="none">
    <rect width="60" height="40" rx="2" fill="#0E7A3E" />
    {/* Stylized White Script & Sword in Center */}
    <rect x="16" y="16" width="28" height="3" rx="1.5" fill="#FFFFFF" />
    <rect x="20" y="22" width="20" height="2" rx="1" fill="#FFFFFF" />
    <path d="M18 23L22 23M40 23L42 21" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const UAEFlag: React.FC<{ className?: string }> = ({ className = "w-5 h-3.5" }) => (
  <svg className={`${className} rounded-xs shadow-2xs overflow-hidden shrink-0`} viewBox="0 0 60 40" fill="none">
    <rect width="60" height="40" rx="2" fill="#FFFFFF" />
    <rect width="60" height="13.33" fill="#0E7A3E" />
    <rect y="26.67" width="60" height="13.33" fill="#140E0A" />
    {/* Red Hoist on Left */}
    <rect width="16" height="40" fill="#DC2626" />
  </svg>
);

export const countries: Record<CountryCode, CountryInfo> = {
  eg: { code: "eg", nameKey: "location.egypt", currencyKey: "currency.egp", currencySymbol: "EGP", flag: EgyptFlag },
  sa: { code: "sa", nameKey: "location.saudi", currencyKey: "currency.sar", currencySymbol: "SAR", flag: SaudiFlag },
  ae: { code: "ae", nameKey: "location.uae", currencyKey: "currency.aed", currencySymbol: "AED", flag: UAEFlag },
};

export interface CurrencyRates {
  eg: number; // 1 EGP = 1 EGP
  sa: number; // 1 SAR = 13.2 EGP (e.g. 13.2)
  ae: number; // 1 AED = 13.5 EGP (e.g. 13.5)
  usd: number; // 1 USD = 49.5 EGP (e.g. 49.5)
}

export const DEFAULT_RATES: CurrencyRates = {
  eg: 1,
  sa: 13.2,
  ae: 13.5,
  usd: 49.5,
};

const RATES_STORAGE_KEY = "beleco_currency_rates";

interface LocationContextValue {
  selectedCountry: CountryCode;
  countryInfo: CountryInfo;
  rates: CurrencyRates;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  selectCountry: (code: CountryCode) => void;
  updateRates: (newRates: Partial<CurrencyRates>) => void;
  formatPrice: (amountInEGP: number) => { amount: number; symbol: string; formatted: string };
  convertPrice: (amountInEGP: number) => number;
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>("eg");
  const [rates, setRates] = useState<CurrencyRates>(DEFAULT_RATES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    try {
      const savedCountry = localStorage.getItem("beleco_country") as CountryCode;
      if (savedCountry && countries[savedCountry]) {
        setSelectedCountry(savedCountry);
      }

      const savedRates = localStorage.getItem(RATES_STORAGE_KEY);
      if (savedRates) {
        setRates({ ...DEFAULT_RATES, ...JSON.parse(savedRates) });
      }
    } catch {}
  }, []);

  const selectCountry = (code: CountryCode) => {
    setSelectedCountry(code);
    try {
      localStorage.setItem("beleco_country", code);
    } catch {}
    setIsModalOpen(false);
  };

  const updateRates = (newRates: Partial<CurrencyRates>) => {
    const updated = { ...rates, ...newRates };
    setRates(updated);
    try {
      localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const countryInfo = countries[selectedCountry] || countries.eg;

  // Price conversion helper
  const convertPrice = (amountInEGP: number): number => {
    if (selectedCountry === "eg") return Math.round(amountInEGP);
    const rate = rates[selectedCountry] || 1;
    const converted = amountInEGP / rate;
    return Math.round(converted * 10) / 10;
  };

  const formatPrice = (amountInEGP: number) => {
    const amount = convertPrice(amountInEGP);
    const symbol = t(countryInfo.currencyKey);
    return {
      amount,
      symbol,
      formatted: `${amount} ${symbol}`,
    };
  };

  return (
    <LocationContext.Provider
      value={{
        selectedCountry,
        countryInfo,
        rates,
        isModalOpen,
        openModal: () => setIsModalOpen(true),
        closeModal: () => setIsModalOpen(false),
        selectCountry,
        updateRates,
        formatPrice,
        convertPrice,
      }}
    >
      {children}

      {/* Location / Country Picker Sheet with Real Country Flags */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-brand-neutral-950/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-3xl p-6 border border-brand-neutral-200 shadow-2xl flex flex-col gap-4 animate-sheet-up"
            style={{ paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))" }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-brand-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-editorial text-base font-bold text-brand-neutral-900">
                  {t("location.select")}
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-brand-neutral-400 hover:text-brand-neutral-700 hover:bg-brand-neutral-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Country Options with Real Flag SVG */}
            <div className="flex flex-col gap-2.5 pt-1">
              {(Object.keys(countries) as CountryCode[]).map((code) => {
                const c = countries[code];
                const Flag = c.flag;
                const isSelected = selectedCountry === code;
                return (
                  <button
                    key={code}
                    onClick={() => selectCountry(code)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-sm font-sans font-bold ${
                      isSelected
                        ? "bg-primary-50 border-primary-500 text-primary-700 shadow-xs"
                        : "bg-brand-neutral-50 border-brand-neutral-200 text-brand-neutral-800 hover:bg-brand-neutral-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-6.5 rounded-lg overflow-hidden border border-brand-neutral-200/90 shadow-2xs flex items-center justify-center bg-white shrink-0">
                        <Flag className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-sans font-bold text-brand-neutral-900">
                          {t(c.nameKey)}
                        </span>
                        <span className="text-[11px] font-mono text-brand-neutral-500">
                          {t(c.currencyKey)} ({c.currencySymbol})
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
