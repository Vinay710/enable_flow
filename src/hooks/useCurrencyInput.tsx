import { useState, useEffect, useRef } from 'react';

// Helper to format numbers as Indian currency
export const formatIndianCurrency = (value: string): string => {
  if (!value) return '';
  const num = value.replace(/\D/g, '');
  if (!num) return '';

  let result = '';
  let count = 0;
  for (let i = num.length - 1; i >= 0; i--) {
    if (count === 3 || (count > 3 && (count - 3) % 2 === 0)) {
      result = ',' + result;
    }
    result = num[i] + result;
    count++;
  }
  return result;
};

export const handleCurrencyInput = (value: string): string => {
  return value.replace(/\D/g, "");
};

export const useCurrencyInput = (initialValue: string) => {
  const [rawValue, setRawValue] = useState(initialValue);
  const [formattedValue, setFormattedValue] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const newFormattedValue = formatIndianCurrency(rawValue);
    setFormattedValue(newFormattedValue);
  }, [rawValue]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.setSelectionRange(cursor, cursor);
    }
  }, [formattedValue, cursor]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, selectionStart } = e.target;
    const newRawValue = value.replace(/\D/g, '');

    const digitsBeforeCursor = (value.substring(0, selectionStart ?? 0).match(/\d/g) || []).length;

    let newCursorPos = 0;
    let digitsCounted = 0;
    const newFormatted = formatIndianCurrency(newRawValue);
    for (const char of newFormatted) {
      if (digitsCounted === digitsBeforeCursor) break;
      newCursorPos++;
      if (/\d/.test(char)) {
        digitsCounted++;
      }
    }

    setRawValue(newRawValue);
    setCursor(newCursorPos);
  };

  return {
    rawValue,
    formattedValue,
    inputRef,
    onChange,
    setRawValue,
  };
};