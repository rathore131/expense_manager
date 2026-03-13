import { createContext, useContext, useState, ReactNode } from "react";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
};

interface CurrencyContextType {
  currency: string;
  symbol: string;
  setCurrency: (c: string) => void;
  fmt: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be inside CurrencyProvider");
  return ctx;
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState(
    () => localStorage.getItem("currency") || "INR"
  );

  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  const fmt = (amount: number) => `${symbol}${amount.toFixed(2)}`;

  const handleSetCurrency = (c: string) => {
    setCurrency(c);
    localStorage.setItem("currency", c);
  };

  return (
    <CurrencyContext.Provider value={{ currency, symbol, setCurrency: handleSetCurrency, fmt }}>
      {children}
    </CurrencyContext.Provider>
  );
};
