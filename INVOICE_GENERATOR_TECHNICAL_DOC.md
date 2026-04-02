# Invoice Generator - Technical Architecture

## System Overview

The Invoice Generator is a modular, region-aware invoicing system built with React, TypeScript, and Tailwind CSS. It supports dual-region invoicing (India GST and International) with client-side persistence.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│         InvoiceGenerator (Main Component)               │
│  - Manages dual-region state (India/International)      │
│  - Handles localStorage persistence                     │
│  - Auto-generates invoice numbers per region            │
└────────────┬─────────────────────────────┬──────────────┘
             │                             │
    ┌────────▼────────┐         ┌──────────▼────────┐
    │  InvoiceForm    │         │ InvoicePreview    │
    │  (Left Panel)   │         │  (Right Panel)    │
    └────────┬────────┘         └──────────┬────────┘
             │                             │
    ┌────────┴──────────────┬──────────────┴────────┐
    │                       │                       │
  Form                   Preview                Preview
  Sub-components         Sub-components       Renders
  - RegionSelector       Multiple               Invoice
  - CurrencySelector     regions               with
  - InvoiceTypeSelector  dynamically           region-
  - TaxSection                                 specific
  - Seller/Buyer/Items/Details/Bank            layout
  
    └─────────┬─────────────────────────────────┘
              │
    ┌─────────▼──────────────────────────┐
    │  Shared Services (utils.ts)        │
    │  - formatCurrency()                │
    │  - numberToWords()                 │
    │  - generateInvoiceNumber()         │
    │  - localStorage operations         │
    └────────────────────────────────────┘
```

---

## Core Components

### 1. **InvoiceGenerator.tsx** (Main Component)
**Responsibilities:**
- State management for invoice data
- Region switching logic
- localStorage persistence
- Default data management
- SEO/Meta tags

**Key Methods:**
```typescript
handleRegionChange(newRegion: Region): void
// Switches region, loads saved data or defaults, generates new invoice number

handleDownloadPdf(): void
// Exports invoice preview to PDF

handlePrint(): void
// Triggers browser print dialog
```

### 2. **InvoiceForm.tsx** (Form Container)
**Responsibilities:**
- Collects all invoice data
- Region-aware field rendering
- Validation and updates
- Tab-based organization

**Dynamic Rendering Logic:**
```typescript
if (region === "IN") {
  // Show GSTIN, PAN, State, HSN/SAC, GST rates
}
if (region === "INTL") {
  // Show VAT Number, Country, SKU, Service Tax, Currency selector
}
```

### 3. **InvoicePreview.tsx** (Read-only Preview)
**Responsibilities:**
- Render invoice layout
- Region-specific formatting
- Tax calculations
- PDF export ready

**Key Calculations:**
```typescript
// India: CGST/SGST or IGST based on place of supply
if (isInterState) {
  igst = taxAmount;
} else {
  cgst = taxAmount / 2;
  sgst = taxAmount / 2;
}

// International: Single tax
tax = taxAmount;
```

### 4. **Sub-components** (Reusable)
- **RegionSelector.tsx** - Toggle region
- **CurrencySelector.tsx** - Choose currency (Intl only)
- **InvoiceTypeSelector.tsx** - Invoice type dropdown
- **TaxSection.tsx** - Tax type configuration

---

## Data Model

### InvoiceData Structure
```typescript
interface InvoiceData {
  seller: SellerDetails
  buyer: BuyerDetails
  details: InvoiceDetails
  items: InvoiceItem[]
}
```

### Region-Specific Fields

**India Only:**
- `seller.gstin` / `seller.pan`
- `seller.state` / `seller.pincode`
- `buyer.placeOfSupply`
- `item.hsn`
- `item.gstRate`

**International Only:**
- `seller.vatNumber` / `seller.country` / `seller.postalCode`
- `details.currency` / `details.taxType`
- `item.sku`
- `item.taxRate`

---

## Data Flow

### 1. User Selects Region
```
User clicks "India" → RegionSelector
  ↓
handleRegionChange(IN)
  ↓
Check localStorage for saved India data
  ↓
Load saved data OR use INDIA_DEFAULT
  ↓
Generate new invoice number (auto-increment)
  ↓
setInvoiceData(newData)
  ↓
Render InvoiceForm & InvoicePreview for India region
```

### 2. User Fills Form
```
InvoiceForm onChange event
  ↓
updateSeller/updateBuyer/updateItem/updateDetails()
  ↓
setInvoiceData(updated)
  ↓
useEffect triggers save
  ↓
saveInvoiceData(data, region) → localStorage
  ↓
InvoicePreview re-calculates & renders
```

### 3. PDF Export
```
User clicks "Download PDF"
  ↓
Reference to InvoicePreview DOM
  ↓
html2pdf.js processes component
  ↓
Generates PDF with current data
  ↓
Browser downloads file
```

---

## localStorage Persistence

### Storage Keys

| Key | Format | Purpose |
|-----|--------|---------|
| `invoiceData_IN` | JSON | Full India invoice data |
| `invoiceData_INTL` | JSON | Full International invoice data |
| `lastInvoiceNumber_IN` | String | Last generated India invoice number |
| `lastInvoiceNumber_INTL` | String | Last generated Intl invoice number |

### Lifecycle

**On Mount (App Load):**
```
useEffect(() => {
  const saved = loadInvoiceData("IN")
  if (saved) setInvoiceData(saved)
}, [])
```

**On Change (Every Edit):**
```
useEffect(() => {
  saveInvoiceData(invoiceData, region)
}, [invoiceData])
```

**On Region Switch:**
```
const newRegion = "INTL"
const saved = loadInvoiceData("INTL")
if (saved) { // Restore previous international invoice }
else { // Use international defaults }
```

---

## Tax Calculation Logic

### India (GST)
```typescript
function calculateGST(items: InvoiceItem[], sellerState: string, buyerState: string, discount: number = 0) {
  const isInterState = sellerState !== buyerState;
  
  return items.map(item => {
    const taxableValue = item.quantity * item.rate - discount;
    const taxAmount = (taxableValue * item.gstRate) / 100;
    
    if (isInterState) {
      return { ...item, igst: taxAmount, cgst: 0, sgst: 0, taxableValue };
    } else {
      return { ...item, cgst: taxAmount/2, sgst: taxAmount/2, igst: 0, taxableValue };
    }
  });
}
```

### International
```typescript
function calculateTax(items: InvoiceItem[], taxType: TaxType, taxRate: number = 0, discount: number = 0) {
  return items.map(item => {
    const taxableValue = item.quantity * item.rate - discount;
    const tax = (taxableValue * (item.taxRate ?? taxRate)) / 100;
    
    return { ...item, tax, taxType, taxableValue };
  });
}
```

---

## Number Formatting

### Currency Formatting
```typescript
const formatCurrency = (amount: number, currency: Currency) => {
  const localeMap = {
    "INR": "en-IN",
    "USD": "en-US",
    "EUR": "de-DE",
    // ...
  };
  
  return new Intl.NumberFormat(localeMap[currency], {
    style: "currency",
    currency: currency,
  }).format(amount);
};
```

### Amount in Words
```typescript
// India
10000 INR → "Ten Thousand Rupees"
           → Uses: "lakh", "crore" for large numbers

// International
10000 USD → "Ten Thousand Dollars"
          → Uses: "thousand", "million", "billion"
```

---

## Extending the System

### Adding a New Region

1. **Update types.ts:**
```typescript
export type Region = "IN" | "INTL" | "NEW";
```

2. **Add constants:**
```typescript
export const NEW_STATES = [...];
export const NEW_TAX_RATES = [0, 5, 10, ...];
```

3. **Create default data in InvoiceGenerator.tsx:**
```typescript
const NEW_DEFAULT: InvoiceData = { ... };
```

4. **Update InvoiceForm conditional rendering:**
```typescript
if (region === "NEW") {
  // Show specific fields for NEW region
}
```

5. **Update InvoicePreview:**
```typescript
if (isNew) {
  // Region-specific preview layout
}
```

### Adding a New Currency

1. **Update CURRENCIES in constants.ts:**
```typescript
export const CURRENCIES = [
  // ...
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
];
```

2. **Update formatCurrency() in utils.ts:**
```typescript
const localeMap: Record<Currency, string> = {
  // ...
  "JPY": "ja-JP",
};
```

3. **Update numberToWordsInternational():**
```typescript
const currencyNames: Record<Currency, { singular: string; plural: string }> = {
  // ...
  "JPY": { singular: "yen", plural: "yen" },
};
```

### Adding a New Tax Type

1. **Update TAX_TYPES in constants.ts**
2. **Update TaxSection.tsx component**
3. **Add tax calculation logic to InvoicePreview.tsx**
4. **Test with preview rendering**

---

## Performance Considerations

### Optimization Strategies

1. **useMemo for Calculations**
```typescript
const calculations = useMemo(() => {
  // Tax calculations only re-run when items/region changes
  return computeAllTotals(items, region);
}, [items, region]);
```

2. **Local Storage Debouncing**
- Currently: Saves on every onChange
- Future: Implement 500ms debounce to reduce writes

3. **Code Splitting**
- Consider lazy loading region-specific components
- PDF export library is large, can be async imported

### Memory Management
- Invoice data structure is relatively small (<100KB typically)
- localStorage typically has 5-10MB available
- No memory leaks from component unmounting

---

## Testing Checklist

### Unit Tests
- [ ] Tax calculations (India vs International)
- [ ] Number formatting across currencies
- [ ] Invoice number generation and increment
- [ ] localStorage save/load operations

### Integration Tests
- [ ] Region switching preserves data
- [ ] Form updates trigger preview refresh
- [ ] PDF export includes all fields
- [ ] Print functionality works

### E2E Tests
- [ ] Complete flow: Enter data → Switch regions → Download PDF
- [ ] Verify calculations are correct per region
- [ ] Test with multiple items and different tax rates

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Invoice number doesn't increment | localStorage disabled | Enable localStorage in browser |
| Data lost after refresh | Session cleared | Check localStorage limits |
| PDF doesn't include images | CORS issue | Upload logo as data URL |
| Tax calculations wrong | Region mismatch | Verify region selector |
| Currency not updating | Using India mode | Switch to International region |

---

## Future Enhancements

1. **Recurring Invoices**
   - Save template and auto-generate on schedule

2. **Invoice History**
   - IndexedDB for storing multiple invoices

3. **Multiple Languages**
   - i18n integration for UI translations

4. **Payment Tracking**
   - Payment status column in preview

5. **Cloud Sync**
   - Optional cloud backup of invoices

6. **Invoice Sequence**
   - Verify numbering continuity across sessions

---

## Technology Stack

- **React 18+** - UI Framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Component library
- **html2pdf.js** - PDF generation
- **qrcode** - QR code generation
- **React Router** - Routing (for navigation)

---

## Build & Deployment

```bash
# Development
npm run dev

# Build
npm run build

# Preview
npm run preview

# Type check
npm run type-check
```

---

**Last Updated:** 2024
**Architecture Version:** 2.0 (Multi-region)
