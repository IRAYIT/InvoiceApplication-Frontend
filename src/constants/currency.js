export const CURRENCY_RATES = {
    SEK: 1,
    INR: 8.0,
  };
  
  export const CURRENCY_SYMBOLS = {
    SEK: "kr",
    INR: "₹",
  };
  
  export const CURRENCY_LOCALES = {
    SEK: "sv-SE",
    INR: "en-IN",
  };
  
  export const CURRENCIES = Object.keys(CURRENCY_RATES);
  export function convertAmount(amount, fromCurrency, toCurrency) {
    if (!amount) return 0;
    const fromRate = CURRENCY_RATES[fromCurrency] ?? 1;
    const toRate = CURRENCY_RATES[toCurrency] ?? 1;
    return (amount / fromRate) * toRate;
  }
  
  export function formatCurrency(amount, currency = "SEK") {
    const locale = CURRENCY_LOCALES[currency] || "sv-SE";
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    const formatted = Number(amount || 0).toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return currency === "INR" ? `${symbol}${formatted}` : `${formatted} ${symbol}`;
  }