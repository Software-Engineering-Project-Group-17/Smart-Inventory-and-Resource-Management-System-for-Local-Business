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
  
  // Right column - Customer information (if available)
  const rightColX = margin + columnWidth + 10;
  
  if (invoiceData.customer && invoiceData.customer.name) {
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO', rightColX, yPos);
    
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(invoiceData.customer.name, rightColX, yPos + 8);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(70, 70, 70);
    doc.text(`Phone: ${invoiceData.customer.phone}`, rightColX, yPos + 15);
    
    if (invoiceData.customer.email) {
      doc.text(`Email: ${invoiceData.customer.email}`, rightColX, yPos + 21);
    }
    
    if (invoiceData.customer.isRegistered && invoiceData.customer.loyaltyPoints !== undefined) {
      const loyaltyY = invoiceData.customer.email ? yPos + 27 : yPos + 21;
      doc.setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      
    }
  }
  
  // Invoice details - horizontally underneath both addresses
  const invoiceDetailsY = yPos + 45;
  
  // Invoice Number (left side)
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE NUMBER:', margin, invoiceDetailsY);
  
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(invoiceData.invoiceNumber, margin, invoiceDetailsY + 6);
  
  // Date (center)
  const centerX = pageWidth / 2;
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('DATE:', centerX, invoiceDetailsY, { align: 'center' });
  
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.date, centerX, invoiceDetailsY + 6, { align: 'center' });
  
  // Time (right side)
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('TIME:', pageWidth - margin, invoiceDetailsY, { align: 'right' });
  
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.time, pageWidth - margin, invoiceDetailsY + 6, { align: 'right' });
  
  yPos = invoiceDetailsY + 15;
  
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
  
  // Show discount and loyalty points message
  if (invoiceData.totalDiscount > 0 || invoiceData.loyaltyPointsUsed > 0) {
    // Create a highlighted box for discount/loyalty message
    doc.setFillColor(245, 245, 245); // Light gray background
    doc.setDrawColor(100, 100, 100); // Dark gray border
    doc.setLineWidth(0.5);
    
    const boxHeight = invoiceData.totalDiscount > 0 && invoiceData.loyaltyPointsUsed > 0 ? 35 : 25;
    const boxY = yPos;
    
    doc.rect(margin, boxY, contentWidth, boxHeight, 'FD');
    
    // Add congratulations header
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Congratulations!', pageWidth / 2, boxY + 8, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    let messageY = boxY + 17;
    
    // Show discount message if there's any actual discount
    if (invoiceData.totalDiscount > 0) {
      const discountMessage = `You got a discount of $${invoiceData.totalDiscount.toFixed(2)}`;
      doc.text(discountMessage, pageWidth / 2, messageY, { align: 'center' });
      messageY += 8;
    }
    
    // Show loyalty points used message if any loyalty points were used
    if (invoiceData.loyaltyPointsUsed > 0) {
      const loyaltyMessage = `You used ${invoiceData.loyaltyPointsUsed.toFixed(2)} loyalty points`;
      doc.text(loyaltyMessage, pageWidth / 2, messageY, { align: 'center' });
    }
    
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