import { Currency, Region } from "./types";

/**
 * Formats a numeric amount into a localized currency string.
 * 
 * @param {number} amount - The numeric value to format.
 * @param {Currency} [currency="INR"] - The currency code (e.g., "INR", "USD").
 * @returns {string} The formatted currency string.
 */
export const formatCurrency = (amount: number, currency: Currency = "INR"): string => {
  const currencyMap: Record<Currency, string> = {
    INR: "en-IN",
    USD: "en-US",
    EUR: "de-DE",
    GBP: "en-GB",
    AED: "ar-AE",
    AUD: "en-AU",
    CAD: "en-CA",
  };

  return new Intl.NumberFormat(currencyMap[currency] || "en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Converts a number into its word representation based on the currency.
 * Dispatches to either Indian or International numbering systems.
 * 
 * @param {number} num - The number to convert.
 * @param {Currency} [currency="INR"] - The currency context.
 * @returns {string} The number in words.
 */
export const numberToWords = (num: number, currency: Currency = "INR"): string => {
  if (currency === "INR") {
    return numberToWordsINR(num);
  } else {
    return numberToWordsInternational(num, currency);
  }
};

/**
 * Converts a number to words using the Indian numbering system (Lakhs, Crores).
 * 
 * @private
 */
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

/**
 * Converts a number to words using the International numbering system (Millions, Billions).
 * 
 * @private
 */
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

/**
 * Calculates the tax amount for a given taxable value and rate.
 * 
 * @param {number} amount - The taxable amount.
 * @param {number} rate - The tax rate in percentage.
 * @returns {number} The calculated tax amount.
 */
export const calculateTax = (amount: number, rate: number): number => {
  return (amount * rate) / 100;
};

/**
 * Retrieves the last used invoice number from localStorage for a specific region.
 * 
 * @param {Region} region - The region ("IN" or "INTL").
 * @returns {number} The last invoice number used.
 */
export const getLastInvoiceNumber = (region: Region): number => {
  const key = `lastInvoiceNumber_${region}`;
  const stored = localStorage.getItem(key);
  if (!stored) return 0;
  const parsed = parseInt(stored, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Saves the last used invoice number to localStorage.
 * 
 * @param {Region} region - The region ("IN" or "INTL").
 * @param {number} number - The invoice number to save.
 */
export const saveLastInvoiceNumber = (region: Region, number: number): void => {
  const key = `lastInvoiceNumber_${region}`;
  localStorage.setItem(key, number.toString());
};

/**
 * Generates a new auto-incremented invoice number for a region.
 * 
 * @param {Region} region - The region ("IN" or "INTL").
 * @param {string} [prefix="INV"] - The prefix for the invoice number.
 * @returns {string} The generated invoice number (e.g., "INV-0005").
 */
export const generateInvoiceNumber = (region: Region, prefix: string = "INV"): string => {
  const lastNumber = getLastInvoiceNumber(region);
  const newNumber = lastNumber + 1;
  saveLastInvoiceNumber(region, newNumber);
  return `${prefix}-${String(newNumber).padStart(4, "0")}`;
};

/**
 * Saves the current invoice data to localStorage for persistence.
 * 
 * @param {any} data - The invoice data object.
 * @param {Region} region - The region the data belongs to.
 */
export const saveInvoiceData = (data: any, region: Region): void => {
  const key = `invoiceData_${region}`;
  localStorage.setItem(key, JSON.stringify(data));
};

/**
 * Loads saved invoice data from localStorage for a specific region.
 * 
 * @param {Region} region - The region to load data for.
 * @returns {any | null} The parsed invoice data or null if not found/invalid.
 */
export const loadInvoiceData = (region: Region): any | null => {
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
