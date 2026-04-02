# Invoice Generator - Upgrade Guide

## 🚀 What's New

Your Invoice Generator now supports **both India (GST)** and **International** invoices with full multi-currency support, dynamic tax handling, and persistent local storage.

---

## 📋 Quick Start

### 1. **Select Your Region**
At the top of the form, you'll see two buttons:
- **India (GST)** - For GST-compliant invoices
- **International** - For multi-currency invoices

Click to switch between regions.

### 2. **Fill in Seller Details** (Seller Tab)
The fields will automatically adjust based on your region:

**India:**
- Business Name, GSTIN, PAN, State, Pincode

**International:**
- Business Name, VAT Number, Country, Postal Code

### 3. **Add Buyer Information** (Buyer Tab)
Similarly, buyer fields adapt to region:

**India:**
- GSTIN, Place of Supply (for correct tax split)

**International:**
- VAT Number, Country

### 4. **Add Line Items** (Items Tab)
- For **India**: HSN/SAC code + GST Rate [0%, 5%, 12%, 18%, 28%]
- For **International**: SKU + Tax Rate [0%, 5%, 10%, 15%, 20%, 25%]

### 5. **Set Invoice Type** (Settings)
Choose from:
- Tax Invoice
- Proforma Invoice
- Quotation
- Credit Note
- Debit Note

### 6. **Select Currency** (International only)
Available currencies:
- INR (Indian Rupee)
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- AED (UAE Dirham)
- AUD (Australian Dollar)
- CAD (Canadian Dollar)

### 7. **Download/Print**
- Click **Download PDF** for a high-quality invoice
- Click **Print** for browser printing

---

## 🇮🇳 India (GST) Mode

### Tax Calculation
The system automatically calculates tax based on **Place of Supply**:

**Same State (Intra-state):**
- CGST = Tax Rate / 2
- SGST = Tax Rate / 2
- IGST = 0

**Different State (Inter-state):**
- CGST = 0
- SGST = 0
- IGST = Full Tax Rate

### GST Rates
**Note:** The following rates are illustrative examples only. Actual GST rates depend on specific HSN/SAC (Harmonized System of Nomenclature / Service Accounting Code) codes and product/service definitions as per official Indian tax law. Always verify rates using official HSN/SAC code references (available at [GST Council website](https://www.gstcouncil.gov.in/) or consult a tax advisor for compliance.

- 0% (Example: Essentials, books, newspapers)
- 5% (Example: Food, fuel, utilities)
- 12% (Example: Packaged food, appliances)
- 18% (Example: General services, electronics)
- 28% (Example: Luxury items, vehicles)

### UPI QR Code
If you add a UPI ID in Bank Details, an automatic QR code is generated for mobile payments.

### Invoice Number System
- Auto-generated: INV-0001, INV-0002, etc.
- Unique per region
- Persisted in browser storage

---

## 🌍 International Mode

### Multi-Currency Support
Each invoice can have a different currency. Numbers are formatted according to locale:
- USD: $50,000.00
- EUR: €50.000,00
- GBP: £50,000.00

### Tax Types
Choose the appropriate tax system:
- **VAT** (Value Added Tax) - Europe, UK
- **Sales Tax** - USA, Canada
- **GST** - Australia, NZ
- **No Tax** - Tax-exempt invoices
- **Custom** - Define your own

### International Invoice Types
- **Tax Invoice** - Standard commercial invoice
- **Proforma Invoice** - Pre-shipment estimate
- **Quotation** - Non-binding price quote
- **Credit Note** - Return/refund document
- **Debit Note** - Additional charge document

### Amount in Words
Automatically converts amounts to words in English:
- 50000 USD → "Fifty Thousand Dollars"
- 1250 EUR → "One Thousand Two Hundred Fifty Euros"

---

## 💾 Data Persistence

### How It Works
- All invoice data is **saved automatically** in your browser's local storage
- When you switch regions, the previous invoice is saved and automatically restored when you return
- Data persists across browser sessions (until you clear browser cache)

### Invoice Numbers
Each region maintains its own numbering sequence:
- India invoices: INV-0001, INV-0002, INV-0003...
- International invoices: INV-0001, INV-0002, INV-0003...

**Note:** You can edit the invoice number manually if needed.

---

## 🎨 Customization Tips

### Add Your Logo
- Click on the logo placeholder in Seller Tab
- Upload your company logo (PNG/JPG, max 2MB)
- It appears on the printed invoice

### Add Your Signature
- Scroll to Bank Tab
- Upload your authorized signature (transparent PNG recommended)
- Appears in the signatory section

### Customize Terms & Conditions
- Go to Details Tab
- Edit Terms & Conditions and Notes
- Multi-line text is supported

### Bank Details
- Fill in your bank information
- For India, add UPI ID for automatic QR code generation
- Bank details appear on the printed invoice

---

## 📊 Example Calculations

### India (Intra-state) Calculation
```
Item: Web Services
Quantity: 1
Rate: ₹50,000
HSN: 998314
GST Rate: 18%

Taxable Amount: ₹50,000
Tax (18%): ₹9,000
  - CGST (9%): ₹4,500
  - SGST (9%): ₹4,500
Total: ₹59,000
```

### International (Multi-currency) Calculation
```
Item: Consulting Hours
Quantity: 10
Rate: $150/hour
Tax Type: VAT (20%)

Taxable Amount: $1,500
Tax (20%): $300
Total: $1,800

Amount in Words: "One Thousand Eight Hundred Dollars"
```

---

## 🔐 Privacy & Security

✅ **All data stays in your browser** - No server storage
✅ **No tracking** - Your invoice data is private
✅ **No cookies** - Only local storage, can be cleared anytime
✅ **Client-side processing** - All calculations done locally

---

## ⚙️ Technical Details

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Browser Storage
- Uses **localStorage** (synchronous key-value store, typically 5–10MB available per domain)
- Data persists across browser sessions unless cleared via browser settings or manually
- Can be cleared in browser settings under "Clear browsing data" / "Cookies and site data"

### PDF Generation
- High-quality JPEG rendering
- A4 page size
- Professional formatting
- Works offline

---

## ❓ Troubleshooting

### Invoice Number Resets After Switch
- This is normal! Each region has its own sequence
- For continuous numbering, edit the invoice number manually

### Data Not Saved?
- Check if localStorage is enabled in your browser
- Clear browser cache and try again
- Try in a different browser to isolate the issue

### PDF Download Issues?
- Disable pop-up blockers for this site
- Try the Print option instead (Ctrl+P)
- Use Chrome for best compatibility

### Currency Not Updating?
- Currency is only available in International mode
- Switch to International region to see currency options

---

## 🎯 Best Practices

1. **Save Invoice Numbers Properly** - Keep track of sequence for compliance
2. **Verify Tax Details** - Double-check GST rates and place of supply
3. **Backup Important Data** - Screenshot or PDF export for records
4. **Update Seller Details Once** - They're auto-filled in future invoices
5. **Test Print Before Final** - Use Print Preview to check formatting

---

## 📞 Support

For issues or feature requests, check the About section of the Invoice Generator tool.

**Happy Invoicing! 🎉**
