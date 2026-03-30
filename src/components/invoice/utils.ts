export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
};

export const numberToWords = (num: number): string => {
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

export const calculateTax = (amount: number, rate: number) => {
  return (amount * rate) / 100;
};
