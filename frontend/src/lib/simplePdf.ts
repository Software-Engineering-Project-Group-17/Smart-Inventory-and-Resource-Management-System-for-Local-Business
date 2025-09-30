import jsPDF from 'jspdf';
import { getCompanyConfig, PDF_CONFIG } from './companyConfig';

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  discount: number;
  discountType: 'value' | 'percentage';
  totalPrice: number;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  isRegistered: boolean;
  loyaltyPoints?: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  time: string;
  cashier: string;
  customer?: CustomerInfo;
  items: InvoiceItem[];
  subtotal: number;
  totalDiscount: number;
  total: number;
  paymentAmount: number;
  loyaltyPointsUsed: number;
  finalTotal: number;
  change: number;
}

export const generateSimplePDF = async (invoiceData: InvoiceData, userEmail?: string): Promise<jsPDF> => {
  const doc = new jsPDF();
  const companyConfig = await getCompanyConfig(userEmail);
  
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  const contentWidth = pageWidth - (2 * margin);
  let yPos = 20;
  
  // Header with company name
  doc.setFillColor(40, 40, 40);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(companyConfig.name, margin, 22);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(companyConfig.branch, margin, 32);
  
  // Invoice title
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - margin, 30, { align: 'right' });
  
  yPos = 60;
  
  // Two-column layout
  const columnWidth = contentWidth / 2 - 5;
  
  // Left column - Company information
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('FROM', margin, yPos);
  
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(companyConfig.name, margin, yPos + 8);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  
  let leftYPos = yPos + 15;
  doc.text(companyConfig.address, margin, leftYPos);
  leftYPos += 6;
  doc.text(`Phone: ${companyConfig.phone}`, margin, leftYPos);
  leftYPos += 6;
  doc.text(`Email: info@buildmate.com`, margin, leftYPos);
  leftYPos += 6;
  doc.text(`Cashier: ${invoiceData.cashier}`, margin, leftYPos);
  
  // Right column - Invoice details
  const rightColX = margin + columnWidth + 10;
  
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE NUMBER:', rightColX, yPos);
  
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(invoiceData.invoiceNumber, rightColX, yPos + 6);
  
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('DATE:', rightColX, yPos + 15);
  
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.date, rightColX, yPos + 21);
  
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('TIME:', rightColX, yPos + 29);
  
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.time, rightColX, yPos + 35);
  
  // Customer information (if available)
  if (invoiceData.customer && invoiceData.customer.name) {
    const customerY = yPos + 45;
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO', rightColX, customerY);
    
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(invoiceData.customer.name, rightColX, customerY + 8);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(70, 70, 70);
    doc.text(`Phone: ${invoiceData.customer.phone}`, rightColX, customerY + 15);
    
    if (invoiceData.customer.email) {
      doc.text(`Email: ${invoiceData.customer.email}`, rightColX, customerY + 21);
    }
    
    if (invoiceData.customer.isRegistered && invoiceData.customer.loyaltyPoints !== undefined) {
      const loyaltyY = invoiceData.customer.email ? customerY + 27 : customerY + 21;
      doc.setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(`★ ${invoiceData.customer.loyaltyPoints} Loyalty Points`, rightColX, loyaltyY);
    }
    
    yPos = customerY + 35;
  } else {
    yPos += 45;
  }
  
  // Separator line
  yPos += 5;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 12;
  
  // Items table header
  doc.setFillColor(40, 40, 40);
  doc.rect(margin, yPos, contentWidth, 9, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  
  const itemNameX = margin + 3;
  const qtyX = pageWidth - 85;
  const priceX = pageWidth - 60;
  const totalX = pageWidth - margin - 3;
  
  doc.text('DESCRIPTION', itemNameX, yPos + 6);
  doc.text('QTY', qtyX, yPos + 6);
  doc.text('PRICE', priceX, yPos + 6);
  doc.text('TOTAL', totalX, yPos + 6, { align: 'right' });
  
  yPos += 11;
  
  // Items list
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'normal');
  
  const maxItemNameWidth = qtyX - itemNameX - 5;
  
  invoiceData.items.forEach((item, index) => {
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 30;
      
      doc.setFillColor(40, 40, 40);
      doc.rect(margin, yPos, contentWidth, 9, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('DESCRIPTION', itemNameX, yPos + 6);
      doc.text('QTY', qtyX, yPos + 6);
      doc.text('PRICE', priceX, yPos + 6);
      doc.text('TOTAL', totalX, yPos + 6, { align: 'right' });
      yPos += 11;
      doc.setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'normal');
    }
    
    if (index % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(margin, yPos - 2, contentWidth, 10, 'F');
    }
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const itemName = doc.splitTextToSize(item.name, maxItemNameWidth)[0];
    doc.text(itemName, itemNameX, yPos + 4);
    doc.text(item.quantity.toString(), qtyX, yPos + 4);
    doc.text(`$${item.price.toFixed(2)}`, priceX, yPos + 4);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`$${item.totalPrice.toFixed(2)}`, totalX, yPos + 4, { align: 'right' });
    
    if (item.discount > 0) {
      doc.setFontSize(8);
      doc.setTextColor(90, 90, 90);
      doc.setFont('helvetica', 'italic');
      const discountText = item.discountType === 'percentage' 
        ? `(Discount: ${item.discount}%)` 
        : `(Discount: $${item.discount.toFixed(2)})`;
      doc.text(discountText, itemNameX, yPos + 8.5);
      doc.setTextColor(30, 30, 30);
      yPos += 5;
    }
    
    yPos += 10;
  });
  
  // Add separator line before total
  yPos += 5;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;
  
  // Add TOTAL as a table row
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, yPos - 2, contentWidth, 12, 'F');
  
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', itemNameX, yPos + 5);
  
  // Show final total in the same row alignment as item totals
  doc.setFontSize(14);
  doc.text(`$${invoiceData.finalTotal.toFixed(2)}`, totalX, yPos + 5, { align: 'right' });
  
  yPos += 20;
  
  // Show discount message if there's any discount
  if (invoiceData.totalDiscount > 0 || invoiceData.loyaltyPointsUsed > 0) {
    const totalSavings = invoiceData.totalDiscount + invoiceData.loyaltyPointsUsed;
    
    // Create a highlighted box for discount message
    doc.setFillColor(245, 245, 245); // Light gray background
    doc.setDrawColor(100, 100, 100); // Dark gray border
    doc.setLineWidth(0.5);
    
    const boxHeight = 25;
    const boxY = yPos;
    
    doc.rect(margin, boxY, contentWidth, boxHeight, 'FD');
    
    // Add discount message
    doc.setTextColor(0, 0, 0); // Dark gray text
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Congratulations!', pageWidth / 2, boxY + 8, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let discountMessage = `You got a discount of $${totalSavings.toFixed(2)}`;
    
    // Add breakdown if both types of discounts are applied
    if (invoiceData.totalDiscount > 0 && invoiceData.loyaltyPointsUsed > 0) {
      discountMessage = `You saved $${totalSavings.toFixed(2)} (Item discounts: $${invoiceData.totalDiscount.toFixed(2)} + Loyalty: $${invoiceData.loyaltyPointsUsed.toFixed(2)})`;
    }
    
    doc.text(discountMessage, pageWidth / 2, boxY + 17, { align: 'center' });
    
    yPos = boxY + boxHeight + 10;
  }
  
  // Footer
  const footerY = pageHeight - 20;
  
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated on ${invoiceData.date} at ${invoiceData.time}`, pageWidth / 2, footerY + 6, { align: 'center' });
  
  return doc;
};

export const downloadSimplePDF = async (invoiceData: InvoiceData, filename?: string, userEmail?: string) => {
  const doc = await generateSimplePDF(invoiceData, userEmail);
  const fileName = filename || `Invoice_${invoiceData.invoiceNumber}_${invoiceData.date.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
};

export const printSimplePDF = async (invoiceData: InvoiceData, userEmail?: string) => {
  const doc = await generateSimplePDF(invoiceData, userEmail);
  doc.autoPrint();
  const pdfUrl = doc.output('bloburl');
  window.open(pdfUrl, '_blank');
};

export const previewSimplePDF = async (invoiceData: InvoiceData, userEmail?: string) => {
  const doc = await generateSimplePDF(invoiceData, userEmail);
  const pdfUrl = doc.output('bloburl');
  window.open(pdfUrl, '_blank');
};