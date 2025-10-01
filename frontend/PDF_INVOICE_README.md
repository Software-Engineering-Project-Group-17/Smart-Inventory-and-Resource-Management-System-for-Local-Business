# PDF Invoice Generation System

## Overview

This system provides professional PDF invoice generation for the BUILDMATE Smart Inventory system. It creates branded invoices with company information, detailed transaction records, and professional formatting suitable for business use.

## Features

### 🎨 Professional Design
- **BUILDMATE Branding**: Company colors (#3674B5 blue, #FADA7A yellow)
- **Responsive Layout**: Optimized for standard business invoice format
- **Professional Typography**: Clear, readable fonts with proper hierarchy
- **Company Logo**: Placeholder for logo integration

### 📄 Invoice Components
- **Header**: Company name, logo, and branding
- **Company Information**: Name, branch, address, contact details
- **Invoice Details**: Invoice number, date, time, cashier name
- **Customer Information**: Name, phone, email, loyalty status
- **Itemized Table**: Products, quantities, prices, discounts, totals
- **Payment Summary**: Subtotal, discounts, taxes, final total, payment, change
- **Footer**: Thank you message, generation timestamp

### 🔧 Customization Options
- **Multi-Branch Support**: Different branch configurations
- **Configurable Company Info**: Easy updates through config file
- **Color Themes**: Customizable color schemes
- **Logo Integration**: Support for company logos
- **Font Styling**: Configurable typography

## File Structure

```
src/lib/
├── pdfInvoice.ts          # Main PDF generation logic
├── companyConfig.ts       # Company and branch configurations
└── ...

public/
├── buildmate-logo.svg     # Company logo
└── ...
```

## Usage

### Basic PDF Generation

```typescript
import { generateInvoicePDF, printInvoicePDF, downloadInvoicePDF } from '@/lib/pdfInvoice';

const invoiceData = {
  invoiceNumber: "INV-123456",
  date: "2024-01-15",
  time: "14:30:00",
  cashier: "John Doe",
  customer: {
    name: "Customer Name",
    phone: "+1234567890",
    email: "customer@email.com",
    isRegistered: true
  },
  items: [
    {
      name: "Hammer",
      quantity: 2,
      price: 25.99,
      discount: 0,
      discountType: "value",
      totalPrice: 51.98
    }
  ],
  subtotal: 51.98,
  totalDiscount: 0,
  total: 51.98,
  paymentAmount: 60.00,
  loyaltyPointsUsed: 0,
  finalTotal: 51.98,
  change: 8.02,
  company: { /* company details */ }
};

// Generate and download PDF
downloadInvoicePDF(invoiceData);

// Generate and print PDF
printInvoicePDF(invoiceData);

// Generate and preview PDF
previewInvoicePDF(invoiceData);
```

### Branch-Specific Invoices

```typescript
// Use specific branch configuration
printInvoicePDF(invoiceData, 'downtown');
```

## Configuration

### Company Configuration (`companyConfig.ts`)

```typescript
export const COMPANY_CONFIG = {
  name: "BUILDMATE",
  branch: "Main Branch",
  address: "123 Construction Avenue, Builder City, BC 12345",
  phone: "+1 (555) BUILD-IT",
  email: "info@buildmate.com",
  website: "www.buildmate.com",
  taxId: "TAX-123456789",
  businessNumber: "BN-987654321"
};
```

### Branch Configurations

```typescript
export const BRANCH_CONFIGS = {
  "main": {
    branch: "Main Branch",
    address: "123 Construction Avenue, Builder City, BC 12345",
    phone: "+1 (555) BUILD-IT"
  },
  "downtown": {
    branch: "Downtown Branch",
    address: "456 Commerce Street, Builder City, BC 54321",
    phone: "+1 (555) BUILD-DT"
  }
};
```

### PDF Styling

```typescript
export const PDF_CONFIG = {
  colors: {
    primary: [54, 116, 181],    // BUILDMATE blue
    secondary: [250, 218, 122], // BUILDMATE yellow
    success: [16, 185, 129],    // Green
    error: [239, 68, 68]        // Red
  },
  fonts: {
    title: { size: 24, style: 'bold' },
    heading: { size: 14, style: 'bold' },
    body: { size: 10, style: 'normal' }
  }
};
```

## Integration with Sales System

The PDF system integrates seamlessly with the sales page:

1. **Complete Sale**: After successful transaction, invoice data is prepared
2. **Print Options Modal**: User can choose between multiple print options
3. **PDF Generation**: Professional PDF is generated with all transaction details
4. **Quick Actions**: Easy access to reprint last invoice

## Print Options Available

### 1. Preview PDF
- Opens PDF in new browser tab for review
- No printing, just preview
- Allows checking before printing

### 2. Print PDF
- Generates PDF and opens print dialog
- Professional format with company branding
- **Recommended for business use**

### 3. Download PDF
- Saves PDF file to computer
- Filename includes invoice number and date
- Good for record keeping

### 4. Browser Print
- Traditional browser print of the webpage
- Basic formatting
- Fallback option

## Customization Guide

### Adding Your Logo

1. Replace `/public/buildmate-logo.svg` with your logo
2. Update `companyConfig.ts`:
   ```typescript
   logo: {
     url: "/your-logo.png",
     width: 100,
     height: 40
   }
   ```

### Changing Company Information

Edit `src/lib/companyConfig.ts`:
- Update `COMPANY_CONFIG` with your business details
- Add/modify branch configurations
- Adjust colors and fonts in `PDF_CONFIG`

### Adding New Fields

To add custom fields to invoices:

1. Update `InvoiceData` interface in `pdfInvoice.ts`
2. Modify PDF generation logic to include new fields
3. Update sales page to pass additional data

## Technical Details

### Dependencies
- **jsPDF**: Core PDF generation library
- **jsPDF-AutoTable**: Table generation plugin
- **TypeScript**: Type safety and interfaces

### Browser Compatibility
- Chrome/Chromium: Full support
- Firefox: Full support
- Safari: Full support
- Edge: Full support

### File Size Optimization
- Compressed fonts
- Optimized images
- Minimal styling
- Typical invoice: 50-100KB

## Troubleshooting

### Common Issues

1. **PDF Not Generating**
   - Check browser console for errors
   - Verify all required invoice data is present
   - Ensure jsPDF libraries are loaded

2. **Logo Not Appearing**
   - Verify logo file path
   - Check image format (PNG, JPG, SVG supported)
   - Ensure public folder contains logo

3. **Formatting Issues**
   - Review PDF_CONFIG settings
   - Check page dimensions
   - Verify font availability

### Performance Tips

- Generate PDFs client-side for better performance
- Cache company configuration
- Use optimized images for logos
- Minimize data passed to PDF generator

## Future Enhancements

- [ ] Email invoice functionality
- [ ] Multiple currency support
- [ ] Tax calculation integration
- [ ] Barcode generation on invoices
- [ ] PDF template customization UI
- [ ] Batch invoice generation
- [ ] Digital signature support

## Support

For technical support or customization requests:
- Review configuration files
- Check browser console for errors
- Test with minimal invoice data
- Verify all dependencies are installed