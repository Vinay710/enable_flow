import { Currency } from "./types";

export const formatCurrency = (amount: number, currency: Currency = "INR") => {
  const currencyMap: Record<Currency, string> = {
    INR: "en-IN",
    USD: "en-US",
    EUR: "de-DE",
    GBP: "en-GB",
    AED: "ar-AE",
    AUD: "en-AU",
    CAD: "en-CA",
  };

  return new Intl.NumberFormat(currencyMap[currency], {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const numberToWords = (num: number, currency: Currency = "INR"): string => {
  if (currency === "INR") {
    return numberToWordsINR(num);
  } else {
    return numberToWordsInternational(num, currency);
  }
};

const numberToWordsINR = (num: number): string => {
  const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  const teens = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];

  const convertBelowHundred = (n: number): string => {
    if (n === 0) return "";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    const quotient = Math.floor(n / 10);
    const remainder = n % 10;
    return remainder === 0 ? tens[quotient] : tens[quotient] + " " + ones[remainder];
  };

  const convertBelowThousand = (n: number): string => {
    if (n === 0) return "";
    if (n < 100) return convertBelowHundred(n);
    const quotient = Math.floor(n / 100);
    const remainder = n % 100;
    return ones[quotient] + " hundred" + (remainder > 0 ? " " + convertBelowHundred(remainder) : "");
  };

  const convertToWords = (n: number): string => {
    if (n === 0) return "zero";
    if (n < 1000) return convertBelowThousand(n);
    if (n < 100000) {
      const quotient = Math.floor(n / 1000);
      const remainder = n % 1000;
      return convertBelowThousand(quotient) + " thousand" + (remainder > 0 ? " " + convertToWords(remainder) : "");
    }
    if (n < 10000000) {
      const quotient = Math.floor(n / 100000);
      const remainder = n % 100000;
      return convertBelowThousand(quotient) + " lakh" + (remainder > 0 ? " " + convertToWords(remainder) : "");
    }
    const quotient = Math.floor(n / 10000000);
    const remainder = n % 10000000;
    return convertBelowThousand(quotient) + " crore" + (remainder > 0 ? " " + convertToWords(remainder) : "");
  };

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let result = convertToWords(rupees);
  
  if (rupees > 0) result += " rupees";
  
  if (paise > 0) {
    if (rupees > 0) result += " and ";
    result += convertBelowHundred(paise) + " paise";
  } else {
    result += " only";
  }
  
  return result.charAt(0).toUpperCase() + result.slice(1);
};

const numberToWordsInternational = (num: number, currency: Currency): string => {
  const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  const teens = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];

  const convertBelowHundred = (n: number): string => {
    if (n === 0) return "";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    const quotient = Math.floor(n / 10);
    const remainder = n % 10;
    return remainder === 0 ? tens[quotient] : tens[quotient] + " " + ones[remainder];
  };

  const convertBelowThousand = (n: number): string => {
    if (n === 0) return "";
    if (n < 100) return convertBelowHundred(n);
    const quotient = Math.floor(n / 100);
    const remainder = n % 100;
    return ones[quotient] + " hundred" + (remainder > 0 ? " " + convertBelowHundred(remainder) : "");
  };

  const convertToWords = (n: number): string => {
    if (n === 0) return "zero";
    if (n < 1000) return convertBelowThousand(n);
    if (n < 1000000) {
      const quotient = Math.floor(n / 1000);
      const remainder = n % 1000;
      return convertBelowThousand(quotient) + " thousand" + (remainder > 0 ? " " + convertToWords(remainder) : "");
    }
    if (n < 1000000000) {
      const quotient = Math.floor(n / 1000000);
      const remainder = n % 1000000;
      return convertBelowThousand(quotient) + " million" + (remainder > 0 ? " " + convertToWords(remainder) : "");
    }
    const quotient = Math.floor(n / 1000000000);
    const remainder = n % 1000000000;
    return convertBelowThousand(quotient) + " billion" + (remainder > 0 ? " " + convertToWords(remainder) : "");
  };

  const currencyNames: Record<Currency, { singular: string; plural: string }> = {
    INR: { singular: "rupee", plural: "rupees" },
    USD: { singular: "dollar", plural: "dollars" },
    EUR: { singular: "euro", plural: "euros" },
    GBP: { singular: "pound", plural: "pounds" },
    AED: { singular: "dirham", plural: "dirhams" },
    AUD: { singular: "dollar", plural: "dollars" },
    CAD: { singular: "dollar", plural: "dollars" },
  };

  const fractionalUnits: Record<Currency, { singular: string; plural: string }> = {
    INR: { singular: "paisa", plural: "paise" },
    USD: { singular: "cent", plural: "cents" },
    EUR: { singular: "cent", plural: "cents" },
    GBP: { singular: "penny", plural: "pence" },
    AED: { singular: "fils", plural: "fils" },
    AUD: { singular: "cent", plural: "cents" },
    CAD: { singular: "cent", plural: "cents" },
  };

  const whole = Math.floor(num);
  const decimal = Math.round((num - whole) * 100);
  const currencyName = whole === 1 ? currencyNames[currency].singular : currencyNames[currency].plural;
  
  let result = convertToWords(whole) + " " + currencyName;
  
  if (decimal > 0) {
    const decimalUnit = decimal === 1 ? fractionalUnits[currency].singular : fractionalUnits[currency].plural;
    result += " and " + convertBelowHundred(decimal) + " " + decimalUnit;
  }
  
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export const calculateTax = (amount: number, rate: number) => {
  return (amount * rate) / 100;
};

// Local Storage utilities
export const getLastInvoiceNumber = (region: "IN" | "INTL"): number => {
  const key = `lastInvoiceNumber_${region}`;
  const stored = localStorage.getItem(key);
  if (!stored) return 0;
  const parsed = parseInt(stored, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const saveLastInvoiceNumber = (region: "IN" | "INTL", number: number) => {
  const key = `lastInvoiceNumber_${region}`;
  localStorage.setItem(key, number.toString());
};

export const generateInvoiceNumber = (region: "IN" | "INTL", prefix: string = "INV"): string => {
  const lastNumber = getLastInvoiceNumber(region);
  const newNumber = lastNumber + 1;
  saveLastInvoiceNumber(region, newNumber);
  return `${prefix}-${String(newNumber).padStart(4, "0")}`;
};

export const saveInvoiceData = (data: any, region: "IN" | "INTL") => {
  const key = `invoiceData_${region}`;
  localStorage.setItem(key, JSON.stringify(data));
};

export const loadInvoiceData = (region: "IN" | "INTL"): any | null => {
  const key = `invoiceData_${region}`;
  const stored = localStorage.getItem(key);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error(`Failed to parse invoice data for region ${region}:`, error);
    localStorage.removeItem(key);
    return null;
  }
};
