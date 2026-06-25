import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nManager } from "react-native";

const resources = {
  en: {
    translation: {
      marketplace: "Marketplace",
      portfolio: "Portfolio",
      invest: "Invest",
      totalValue: "Total Value",
      annualYield: "Annual Yield",
      tokenPrice: "Token Price",
      buyTokens: "Buy Tokens",
      connectWallet: "Connect Wallet",
      kycRequired: "KYC Verification Required",
    },
  },
  ar: {
    translation: {
      marketplace: "السوق",
      portfolio: "المحفظة",
      invest: "استثمر",
      totalValue: "القيمة الإجمالية",
      annualYield: "العائد السنوي",
      tokenPrice: "سعر الرمز",
      buyTokens: "شراء الرموز",
      connectWallet: "ربط المحفظة",
      kycRequired: "مطلوب التحقق من الهوية",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export const switchLanguage = (lang: "en" | "ar") => {
  i18n.changeLanguage(lang);
  const isRTL = lang === "ar";
  I18nManager.forceRTL(isRTL);
};

export default i18n;
