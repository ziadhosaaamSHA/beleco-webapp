"use client";

import React, { createContext, useContext } from "react";
import { useLanguage } from "./LanguageContext";

export interface CountryInfo {
  code: "eg";
  nameKey: string;
  currencyKey: string;
  currencySymbol: string;
}

export interface CurrencyRates {
  eg: number;
  sa: number;
  ae: number;
  usd: number;
}

export const DEFAULT_RATES: CurrencyRates = {
  eg: 1,
  sa: 13.2,
  ae: 13.5,
  usd: 49.5,
};

interface LocationContextValue {
  selectedCountry: "eg";
  countryInfo: CountryInfo;
  rates: CurrencyRates;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  selectCountry: (code: string) => void;
  updateRates: (newRates: Partial<CurrencyRates>) => void;
  formatPrice: (amountInEGP: number) => { amount: number; symbol: string; formatted: string };
  convertPrice: (amountInEGP: number) => number;
}

const defaultCountryInfo: CountryInfo = {
  code: "eg",
  nameKey: "location.egypt",
  currencyKey: "currency.egp",
  currencySymbol: "EGP",
};

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useLanguage();

  const formatPrice = (amountInEGP: number) => {
    const amount = Math.round(amountInEGP || 0);
    const symbol = t("currency.egp") || "ج.م";
    return {
      amount,
      symbol,
      formatted: `${amount} ${symbol}`,
    };
  };

  const convertPrice = (amountInEGP: number): number => {
    return Math.round(amountInEGP || 0);
  };

  return (
    <LocationContext.Provider
      value={{
        selectedCountry: "eg",
        countryInfo: defaultCountryInfo,
        rates: DEFAULT_RATES,
        isModalOpen: false,
        openModal: () => {},
        closeModal: () => {},
        selectCountry: () => {},
        updateRates: () => {},
        formatPrice,
        convertPrice,
      }}
    >
      {children}
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
