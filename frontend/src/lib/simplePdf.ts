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
  const { colors } = PDF_CONFIG;
  
  const pageWidth = doc.internal.pageSize.width;
  let yPos = 20;
  
  // Header
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(companyConfig.name, 20, 20);
  
  yPos = 45;
  
  // Invoice title and info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(24);
  doc.text('INVOICE', 20, yPos);
  
  doc.setFontSize(12);
  doc.text(`Invoice #: ${invoiceData.invoiceNumber}`, pageWidth - 80, yPos);
  doc.text(`Date: ${invoiceData.date}`, pageWidth - 80, yPos + 8);
  doc.text(`Time: ${invoiceData.time}`, pageWidth - 80, yPos + 16);
  
  yPos += 30;
  
  // Company info
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('FROM:', 20, yPos);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPos += 8;
  doc.text(companyConfig.name, 20, yPos);
  yPos += 6;
  doc.text(`Branch: ${companyConfig.branch}`, 20, yPos);
  yPos += 6;
  doc.text(companyConfig.address, 20, yPos);
  yPos += 6;
  doc.text(`Phone: ${companyConfig.phone}`, 20, yPos);
  yPos += 6;
  doc.text(`Email: info@buildmate.com`, 20, yPos);
  
  yPos += 15;
  
  // Cashier
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Cashier: ${invoiceData.cashier}`, 20, yPos);
  
  yPos += 15;
  
  // Customer info (if available)
  if (invoiceData.customer && invoiceData.customer.name) {
    doc.text('CUSTOMER:', 20, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(invoiceData.customer.name, 20, yPos);
    yPos += 6;
    doc.text(`Phone: ${invoiceData.customer.phone}`, 20, yPos);
    if (invoiceData.customer.email) {
      yPos += 6;
      doc.text(`Email: ${invoiceData.customer.email}`, 20, yPos);
    }
    yPos += 15;
  }
  
  // Items header
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ITEMS:', 20, yPos);
  yPos += 10;
  
  // Items table header
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(20, yPos - 5, pageWidth - 40, 12, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('Item', 25, yPos + 2);
  doc.text('Qty', 120, yPos + 2);
  doc.text('Price', 140, yPos + 2);
  doc.text('Total', 160, yPos + 2);
  
  yPos += 15;
  doc.setTextColor(0, 0, 0);
  
  // Items
  invoiceData.items.forEach((item, index) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 30;
    }
    
    // Alternate row colors
    if (index % 2 === 0) {
      doc.setFillColor(248, 249, 250);
      doc.rect(20, yPos - 5, pageWidth - 40, 10, 'F');
    }
    
    doc.text(item.name, 25, yPos);
    doc.text(item.quantity.toString(), 120, yPos);
    doc.text(`$${item.price.toFixed(2)}`, 140, yPos);
    doc.text(`$${item.totalPrice.toFixed(2)}`, 160, yPos);
    
    yPos += 10;
  });
  
  yPos += 10;
  
  // Summary
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  
  const summaryX = pageWidth - 100;
  
  doc.text('Subtotal:', summaryX, yPos);
  doc.text(`$${invoiceData.subtotal.toFixed(2)}`, summaryX + 40, yPos, { align: 'right' });
  
  yPos += 8;
  doc.text('Discount:', summaryX, yPos);
  doc.setTextColor(0, 150, 0);
  doc.text(`-$${invoiceData.totalDiscount.toFixed(2)}`, summaryX + 40, yPos, { align: 'right' });
  
  yPos += 8;
  doc.setTextColor(0, 0, 0);
  doc.text('Total:', summaryX, yPos);
  doc.text(`$${invoiceData.total.toFixed(2)}`, summaryX + 40, yPos, { align: 'right' });
  
  if (invoiceData.loyaltyPointsUsed > 0) {
    yPos += 8;
    doc.text('Loyalty Points:', summaryX, yPos);
    doc.setTextColor(150, 100, 0);
    doc.text(`-$${invoiceData.loyaltyPointsUsed.toFixed(2)}`, summaryX + 40, yPos, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  }
  
  yPos += 12;
  doc.setFontSize(16);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('FINAL TOTAL:', summaryX, yPos);
  doc.text(`$${invoiceData.finalTotal.toFixed(2)}`, summaryX + 40, yPos, { align: 'right' });
  
  yPos += 12;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Payment:', summaryX, yPos);
  doc.text(`$${invoiceData.paymentAmount.toFixed(2)}`, summaryX + 40, yPos, { align: 'right' });
  
  yPos += 8;
  doc.text('Change:', summaryX, yPos);
  doc.setTextColor(0, 150, 0);
  doc.text(`$${invoiceData.change.toFixed(2)}`, summaryX + 40, yPos, { align: 'right' });
  
  // Footer
  const footerY = doc.internal.pageSize.height - 30;
  doc.setTextColor(128, 128, 128);
  doc.setFontSize(10);
  doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
  doc.text(`Generated on ${invoiceData.date} at ${invoiceData.time}`, pageWidth / 2, footerY + 10, { align: 'center' });
  
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