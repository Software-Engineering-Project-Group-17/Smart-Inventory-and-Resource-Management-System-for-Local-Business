"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Search, ShoppingCart, Percent, DollarSign, User, Printer, Trash2, Plus, Minus, Scan, Receipt, Star, Clock, Edit3, Smartphone, Wifi, WifiOff, QrCode } from 'lucide-react';
import { getUserProfile } from '@/lib/auth';
import { useBarcodeWebSocket } from '@/hooks/useBarcodeWebSocket';
import QRCode from 'qrcode';
//import { generateInvoicePDF, downloadInvoicePDF, printInvoicePDF, previewInvoicePDF } from '@/lib/pdfInvoice';
import { downloadSimplePDF, printSimplePDF, previewSimplePDF } from '@/lib/simplePdf';
import ClientOnly from '@/components/ui/ClientOnly';

// Type definitions
interface InventoryItem {
  id: number;
  name: string;
  barcode: string;
  price: number;
  stock: number;
  category: string;
}

interface CartItem extends InventoryItem {
  cartId: number;
  quantity: number;
  discount: number;
  discountType: 'value' | 'percentage';
  discountAmount: number;
  totalPrice: number;
}

interface CustomerInfo {
  id?: number;
  name: string;
  phone: string;
  email?: string;
  isRegistered: boolean;
  loyaltyPoints?: number;
}

interface DiscountInfo {
  type: 'value' | 'percentage';
  amount: number;
}

function SalesPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchType, setSearchType] = useState<'name' | 'barcode'>('name');
  const [suggestions, setSuggestions] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [discount, setDiscount] = useState<DiscountInfo>({ type: 'value', amount: 0 });
  const [customerPayment, setCustomerPayment] = useState<string>('');
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(0);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ name: '', phone: '', isRegistered: false });
  const [showCustomerForm, setShowCustomerForm] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isClient, setIsClient] = useState<boolean>(false);
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [cartIdCounter, setCartIdCounter] = useState<number>(1);
  const [showMobileScannerUrl, setShowMobileScannerUrl] = useState<boolean>(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [showPrintOptions, setShowPrintOptions] = useState<boolean>(false);
  const [lastCompletedSale, setLastCompletedSale] = useState<any>(null);
  
  // Get user email from session/auth - you may need to implement this based on your auth system
  const userProfile = getUserProfile();
  const userEmail = userProfile?.email || "admin@example.com";

  const searchInputRef = useRef<HTMLInputElement>(null);

  // WebSocket integration for barcode scanning
  const { 
    isConnected: wsConnected, 
    lastScannedBarcode,
    lastScanEvent, 
    connectionStatus, 
    sendBarcode, 
    reconnect: wsReconnect 
  } = useBarcodeWebSocket();

  // Set client-side only values after component mounts
  useEffect(() => {
    setIsClient(true);
    // Generate invoice number only on client side to avoid hydration mismatch
    const timestamp = Date.now();
    setInvoiceNumber(`INV-${timestamp.toString().slice(-6)}`);
    setCurrentDate(new Date().toLocaleDateString());
    console.log('User email:', userEmail);
    console.log('User profile:', userProfile);
  }, []);

  // Generate QR code for mobile scanner URL
  const generateQRCode = async () => {
    try {
      const scannerUrl = `https://192.168.50.154:3443/scanner?user=${encodeURIComponent(userEmail)}`;
      const qrCodeDataUrl = await QRCode.toDataURL(scannerUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#3674B5', // QR code color
          light: '#FFFFFF' // Background color
        },
        errorCorrectionLevel: 'M'
      });
      setQrCodeDataUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  // Handle barcode scans from WebSocket
  useEffect(() => {
    if (lastScanEvent) {
      const barcode = lastScanEvent.barcode;
      console.log('🔍 Barcode received via WebSocket:', barcode, 'Scan ID:', lastScanEvent.scanId);
      console.log('🔍 Current search term before update:', searchTerm);
      console.log('🔍 Current selected item before update:', selectedItem);
      
      setSearchTerm(barcode);
      setSearchType('barcode');
      // Clear any previously selected item
      setSelectedItem(null);
      
      // Show success message to indicate barcode was received
      setSuccess(`Barcode scanned: ${barcode}`);
      setTimeout(() => setSuccess(''), 3000);
      
      // Automatically search for the scanned barcode
      console.log('🔍 Triggering search for barcode:', barcode);
      searchInventory(barcode, 'barcode');
    }
  }, [lastScanEvent]);

  // Search for inventory items
  const searchInventory = async (term: string, type: 'name' | 'barcode') => {
    if (!term.trim()) {
      setSuggestions([]);
      return;
    }

    console.log('🔍 Searching for:', term, 'Type:', type, 'UserEmail:', userEmail);
    
    // Clear previous error
    setError('');

    try {
      const response = await fetch(`/api/sales?search=${encodeURIComponent(term)}&type=${type}&userEmail=${encodeURIComponent(userEmail)}`);
      const data = await response.json();
      
      console.log('🔍 Search response:', data);
      console.log('🔍 Number of results:', data.inventory?.length || 0);
      
      if (data.success) {
        setSuggestions(data.inventory);
        console.log('🔍 Suggestions set:', data.inventory);
        
        // Auto-select first result for barcode scans from WebSocket
        if (type === 'barcode' && data.inventory.length > 0 && lastScanEvent && term === lastScanEvent.barcode) {
          console.log('🔍 Auto-selecting first barcode result:', data.inventory[0]);
          setSelectedItem(data.inventory[0]);
          setSuggestions([]); // Clear suggestions since we auto-selected
          setSuccess(`Found item: ${data.inventory[0].name}`);
          setTimeout(() => setSuccess(''), 5000);
        } else if (type === 'barcode' && data.inventory.length === 0) {
          setError(`No item found for barcode: ${term}`);
          console.log('🔍 No items found for barcode:', term);
          setTimeout(() => setError(''), 5000);
        }
      } else {
        setError(data.error || 'Failed to search inventory');
        setSuggestions([]);
        console.error('🔍 Search failed:', data.error);
      }
    } catch (error) {
      console.error('🔍 Error searching inventory:', error);
      setError('Failed to search inventory');
      setSuggestions([]);
    }
  };

  // Search customer by phone
  const searchCustomer = async (phone: string) => {
    if (!phone.trim()) return;

    try {
      const response = await fetch(`/api/customers?phone=${encodeURIComponent(phone)}`);
      const data = await response.json();
      
      if (data.success) {
        setCustomerInfo({
          ...data.customer,
          isRegistered: true
        });
        setLoyaltyPoints(data.customer.loyaltyPoints || 0);
      }
    } catch (error) {
      console.error('Error searching customer:', error);
    }
  };

  useEffect(() => {
    if (searchTerm.length > 1 && !selectedItem) { // Reduced from 2 to 1
      const timeoutId = setTimeout(() => {
        searchInventory(searchTerm, searchType);
      }, 300); // Debounce search

      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, searchType, selectedItem]);

  // Search customer when phone number is entered
  useEffect(() => {
    if (customerInfo.phone.length >= 10) {
      searchCustomer(customerInfo.phone);
    }
  }, [customerInfo.phone]);

  // Reset loyalty points when customer is not registered
  useEffect(() => {
    if (!customerInfo.isRegistered) {
      setLoyaltyPoints(0);
    }
  }, [customerInfo.isRegistered]);

  // Generate QR code when mobile scanner is shown and QR code doesn't exist
  useEffect(() => {
    if (showMobileScannerUrl && !qrCodeDataUrl && isClient) {
      generateQRCode();
    }
  }, [showMobileScannerUrl, qrCodeDataUrl, isClient]);

  const handleAddItem = (item: InventoryItem) => {
    const discountAmount = discount.type === 'percentage' 
      ? (item.price * quantity * discount.amount / 100)
      : discount.amount;
    
    const totalPrice = (item.price * quantity) - discountAmount;
    
    const cartItem: CartItem = {
      ...item,
      cartId: cartIdCounter,
      quantity,
      discount: discount.amount,
      discountType: discount.type,
      discountAmount,
      totalPrice: Math.max(0, totalPrice)
    };

    setItems([...items, cartItem]);
    setCartIdCounter(cartIdCounter + 1);
    setSearchTerm('');
    setQuantity(1);
    setDiscount({ type: 'value', amount: 0 });
    setSuggestions([]);
    setSelectedItem(null);
  };

  const handleRemoveItem = (cartId: number) => {
    setItems(items.filter(item => item.cartId !== cartId));
  };

  const handleUpdateQuantity = (cartId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setItems(items.map(item => {
      if (item.cartId === cartId) {
        const finalQuantity = Math.min(newQuantity, item.stock);
        
        const discountAmount = item.discountType === 'percentage' 
          ? (item.price * finalQuantity * item.discount / 100)
          : item.discount;
        const totalPrice = (item.price * finalQuantity) - discountAmount;
        return {
          ...item,
          quantity: finalQuantity,
          discountAmount,
          totalPrice: Math.max(0, totalPrice)
        };
      }
      return item;
    }));
  };

  const handleCompleteSale = async () => {
    if (items.length === 0) {
      setError('Cart is empty');
      return;
    }

    if (finalBalance < 0) {
      setError('Insufficient payment amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const saleData = {
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          discountAmount: item.discountAmount,
          totalPrice: item.totalPrice,
          discount: item.discount,
          discountType: item.discountType
        })),
        customerInfo: (customerInfo.name && customerInfo.phone) ? customerInfo : null,
        paymentAmount: payment,
        loyaltyPointsUsed: (customerInfo.isRegistered && loyaltyPoints > 0) ? loyaltyPoints : 0,
        userEmail,
        total: finalTotal,
        subtotal,
        totalDiscount
      };

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Sale completed successfully! Invoice: ${data.invoiceNumber}`);
        
        // Store sale data for PDF generation
        const completedSale = {
          invoiceNumber: data.invoiceNumber || invoiceNumber,
          date: currentDate,
          time: new Date().toLocaleTimeString(),
          cashier: userProfile?.firstName && userProfile?.lastName 
            ? `${userProfile.firstName} ${userProfile.lastName}` 
            : userProfile?.username || userProfile?.email || 'Admin User',
          customer: (customerInfo.name && customerInfo.phone) ? customerInfo : null,
          items: items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            discount: item.discount,
            discountType: item.discountType,
            totalPrice: item.totalPrice
          })),
          subtotal,
          totalDiscount,
          total,
          paymentAmount: payment,
          loyaltyPointsUsed: (customerInfo.isRegistered && loyaltyPoints > 0) ? loyaltyPoints : 0,
          finalTotal,
          change: finalBalance,
          company: {
            name: "BUILDMATE",
            branch: "Main Branch",
            address: "123 Construction Avenue, Builder City, BC 12345",
            phone: "+1 (555) BUILD-IT",
            email: "info@buildmate.com",
            website: "www.buildmate.com"
          }
        };
        
        setLastCompletedSale(completedSale);
        setShowPrintOptions(true);
        
        // Clear the cart and form
        setItems([]);
        setCartIdCounter(1);
        setCustomerPayment('');
        setLoyaltyPoints(0);
        setCustomerInfo({ name: '', phone: '', isRegistered: false });
        setShowCustomerForm(false);
      } else {
        setError(data.error || 'Failed to complete sale');
      }
    } catch (error) {
      console.error('Error completing sale:', error);
      setError('Failed to complete sale');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalDiscount = items.reduce((sum, item) => sum + item.discountAmount, 0);
  const total = subtotal - totalDiscount;
  const payment = parseFloat(customerPayment) || 0;
  const loyaltyPointsUsed = customerInfo.isRegistered ? Math.min(loyaltyPoints, total) : 0;
  const finalTotal = Math.max(0, total - loyaltyPointsUsed);
  const finalBalance = payment - finalTotal;

  const handlePrintInvoice = () => {
    window.print();
  };

  const handlePrintPDF = async () => {
    if (lastCompletedSale) {
      try {
        console.log('Printing PDF for user:', userEmail);
        await printSimplePDF(lastCompletedSale, userEmail);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please check the console for details.');
      }
    } else {
      console.warn('No completed sale data available for PDF generation');
    }
  };

  const handleDownloadPDF = async () => {
    if (lastCompletedSale) {
      try {
        console.log('Downloading PDF for user:', userEmail);
        await downloadSimplePDF(lastCompletedSale, undefined, userEmail);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please check the console for details.');
      }
    } else {
      console.warn('No completed sale data available for PDF generation');
    }
  };

  const handlePreviewPDF = async () => {
    if (lastCompletedSale) {
      try {
        console.log('Previewing PDF for user:', userEmail);
        await previewSimplePDF(lastCompletedSale, userEmail);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please check the console for details.');
      }
    } else {
      console.warn('No completed sale data available for PDF generation');
    }
  };

  return (
    <div className="min-h-screen bg-whitep-2 sm:p-4 bg-gray-50">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 lg:mb-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg shadow flex items-center justify-center" style={{backgroundColor: '#3674B5'}}>
                <Receipt className="text-white w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Invoicing</h1>
                <ClientOnly fallback={<p className="text-sm sm:text-base text-gray-600">Loading invoice...</p>}>
                  <p className="text-sm sm:text-base text-gray-600">
                    {isClient ? `Invoice #${invoiceNumber}` : 'Loading invoice...'}
                  </p>
                </ClientOnly>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <ClientOnly fallback={<span className="font-medium">Loading date...</span>}>
                  <span className="font-medium">{isClient ? currentDate : new Date().toLocaleDateString()}</span>
                </ClientOnly>
              </div>
              <div className="text-center sm:text-right">
                <p className="font-semibold text-gray-700">Items: {items.length}</p>
                <p className="font-bold text-lg sm:text-xl" style={{color: '#3674B5'}}>${finalTotal.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-6">
          {/* Error and Success Messages */}
          {error && (
            <div className="xl:col-span-5 mb-4">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative">
                <span className="block sm:inline">{error}</span>
                <span 
                  className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
                  onClick={() => setError('')}
                >
                  <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <title>Close</title>
                    <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                  </svg>
                </span>
              </div>
            </div>
          )}

          {success && (
            <div className="xl:col-span-5 mb-4">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative">
                <span className="block sm:inline">{success}</span>
                <span 
                  className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
                  onClick={() => setSuccess('')}
                >
                  <svg className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <title>Close</title>
                    <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                  </svg>
                </span>
              </div>
            </div>
          )}

        
          {/* Left Column - Expanded */}
          <div className="xl:col-span-3">
            {/* Search Section */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-100">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
                <Search className="w-5 h-5 sm:w-6 sm:h-6 mr-2" style={{color: '#3674B5'}} />
                Add Items to Cart
              </h2>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mb-4 sm:mb-6">
                <button
                  onClick={() => setSearchType('name')}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    searchType === 'name' 
                      ? 'text-white shadow-lg' 
                      : 'text-gray-600 bg-gray-100 hover:bg-gray-200 hover:shadow-md'
                  }`}
                  style={searchType === 'name' ? {backgroundColor: '#3674B5'} : {}}
                >
                  Search by Name
                </button>
                <button
                  onClick={() => setSearchType('barcode')}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center ${
                    searchType === 'barcode' 
                      ? 'text-white shadow-lg' 
                      : 'text-gray-600 bg-gray-100 hover:bg-gray-200 hover:shadow-md'
                  }`}
                  style={searchType === 'barcode' ? {backgroundColor: '#3674B5'} : {}}
                >
                  <Scan className="w-4 h-4 mr-2" />
                  Scan Barcode
                </button>
               
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/sales?userEmail=${encodeURIComponent(userEmail)}`);
                      const data = await response.json();
                      console.log('All inventory:', data);
                      if (data.success) {
                        setSuggestions(data.inventory);
                      }
                    } catch (error) {
                      console.error('Error:', error);
                    }
                  }}
                  className="px-4 py-3 rounded-lg text-sm font-semibold bg-blue-100 hover:bg-blue-200 text-blue-700"
                >
                  Show All
                </button>
                
                <button
                  onClick={() => {
                    setShowMobileScannerUrl(!showMobileScannerUrl);
                    // Generate QR code immediately when showing the scanner section
                    if (!showMobileScannerUrl && !qrCodeDataUrl) {
                      setTimeout(() => generateQRCode(), 100);
                    }
                  }}
                  className="px-4 py-3 rounded-lg text-sm font-semibold bg-green-100 hover:bg-green-200 text-green-700 flex items-center justify-center"
                >
                  {showMobileScannerUrl ? (
                    <>
                      <QrCode className="w-4 h-4 mr-2" />
                      Hide QR Code
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4 mr-2" />
                      Mobile Scanner
                    </>
                  )}
                </button>
              </div>

              {/* WebSocket Connection Status */}
              <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  {wsConnected ? (
                    <Wifi className="w-4 h-4 text-green-600" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    Scanner: {connectionStatus}
                  </span>
                  {lastScannedBarcode && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Last: {lastScannedBarcode}
                    </span>
                  )}
                </div>
                {!wsConnected && (
                  <button
                    onClick={wsReconnect}
                    className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    Reconnect
                  </button>
                )}
              </div>

              {/* Mobile Scanner URL */}
              {showMobileScannerUrl && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <Smartphone className="w-4 h-4 mr-2 text-green-600" />
                    Mobile Barcode Scanner
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Scan the QR code or visit the URL on your phone to start scanning barcodes:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* QR Code */}
                    <div className="flex flex-col items-center justify-center bg-white p-4 rounded-lg border">
                      {qrCodeDataUrl ? (
                        <div className="flex flex-col items-center">
                          <img 
                            src={qrCodeDataUrl} 
                            alt="Scanner QR Code"
                            className="w-40 h-40 border border-gray-200 rounded-lg"
                          />
                          <div className="mt-2 flex items-center text-xs text-gray-600">
                            <QrCode className="w-3 h-3 mr-1" />
                            Scan with your phone camera
                          </div>
                        </div>
                      ) : (
                        <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                          <div className="text-gray-500 text-center">
                            <QrCode className="w-8 h-8 mx-auto mb-2" />
                            <span className="text-xs">Generating QR...</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* URL and Buttons */}
                    <div className="flex flex-col justify-center space-y-3">
                      <div className="bg-white p-3 rounded-lg border">
                        <div className="text-xs text-gray-500 mb-1">Scanner URL:</div>
                        <code className="text-xs font-mono text-blue-600 break-all">
                          https://192.168.50.154:3443/scanner?user={encodeURIComponent(userEmail)}
                        </code>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => {
                            const url = `https://192.168.50.154:3443/scanner?user=${encodeURIComponent(userEmail)}`;
                            navigator.clipboard.writeText(url);
                            setSuccess('Scanner URL copied to clipboard!');
                            setTimeout(() => setSuccess(''), 3000);
                          }}
                          className="flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
                        >
                          <span>📋</span>
                          <span className="ml-2">Copy URL</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            const url = `https://192.168.50.154:3443/scanner?user=${encodeURIComponent(userEmail)}`;
                            window.open(url, '_blank');
                          }}
                          className="flex items-center justify-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium"
                        >
                          <Smartphone className="w-4 h-4" />
                          <span className="ml-2">Open Scanner</span>
                        </button>
                        
                        <button
                          onClick={generateQRCode}
                          className="flex items-center justify-center px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-medium"
                        >
                          <QrCode className="w-4 h-4" />
                          <span className="ml-2">Refresh QR</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2 text-xs text-blue-700">
                      <div className="text-blue-500 mt-0.5">💡</div>
                      <div>
                        <strong>Tip:</strong> Most phones can scan QR codes directly with their camera app. 
                        Just point your camera at the QR code and tap the notification that appears.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="relative mb-6">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchType === 'name' ? 'Type product name...' : 'Scan or enter barcode...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-200"
                />
                {suggestions.length > 0 && !selectedItem && (
                  <div className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow max-h-80 overflow-y-auto">
                    {suggestions.map(item => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 text-base">{item.name}</p>
                            <p className="text-sm text-gray-600 mt-1">Barcode: {item.barcode}</p>
                            <p className="text-sm font-medium mt-1" style={{color: '#3674B5'}}>Category: {item.category}</p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-bold text-lg text-gray-800">${item.price.toFixed(2)}</p>
                            <p className={`text-sm font-medium ${item.stock < 20 ? 'text-red-600' : 'text-green-600'}`}>
                              Stock: {item.stock}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedItem && (
                <div className="p-6 border-2 rounded-lg shadow-sm" style={{borderColor: '#FADA7A', backgroundColor: '#FADA7A10'}}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter' && quantity <= selectedItem.stock) {
                         handleAddItem(selectedItem);
                       }
                     }}>
                  <h3 className="font-bold text-gray-800 mb-4 text-lg">{selectedItem.name}</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Quantity</label>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors duration-150"
                          tabIndex={-1}
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        <input
                          ref={(input) => {
                            // Auto-focus quantity input when item is selected
                            if (input && selectedItem) {
                              setTimeout(() => {
                                input.focus();
                                input.select(); // Select all text for easy overwriting
                              }, 100);
                            }
                          }}
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (quantity <= selectedItem.stock) {
                                handleAddItem(selectedItem);
                              }
                            }
                            // Allow arrow keys to adjust quantity
                            if (e.key === 'ArrowUp') {
                              e.preventDefault();
                              setQuantity(Math.min(selectedItem.stock, quantity + 1));
                            }
                            if (e.key === 'ArrowDown') {
                              e.preventDefault();
                              setQuantity(Math.max(1, quantity - 1));
                            }
                          }}
                          className="w-20 text-center p-2 border-2 border-gray-300 rounded-lg text-lg font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          min="1"
                          max={selectedItem.stock}
                          placeholder="Qty"
                        />
                        <button
                          onClick={() => setQuantity(Math.min(selectedItem.stock, quantity + 1))}
                          className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors duration-150"
                          tabIndex={-1}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Press Enter to add • Use ↑↓ arrows to adjust
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Discount</label>
                      <div className="flex space-x-2">
                        <select
                          value={discount.type}
                          onChange={(e) => setDiscount({...discount, type: e.target.value as 'value' | 'percentage'})}
                          className="flex-1 p-2 border-2 border-gray-300 rounded-lg text-sm font-medium"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (quantity <= selectedItem.stock) {
                                handleAddItem(selectedItem);
                              }
                            }
                          }}
                        >
                          <option value="value">$ Amount</option>
                          <option value="percentage">% Percent</option>
                        </select>
                        <input
                          type="number"
                          value={discount.amount}
                          onChange={(e) => setDiscount({...discount, amount: parseFloat(e.target.value) || 0})}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (quantity <= selectedItem.stock) {
                                handleAddItem(selectedItem);
                              }
                            }
                          }}
                          className="flex-1 p-2 border-2 border-gray-300 rounded-lg font-semibold"
                          min="0"
                          step="0.01"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 mb-4 text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unit Price:</span>
                      <span className="font-semibold">${selectedItem.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Available Stock:</span>
                      <span className={`font-semibold ${selectedItem.stock < 20 ? 'text-red-600' : 'text-green-600'}`}>{selectedItem.stock}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span style={{color: '#3674B5'}}>
                        ${((selectedItem.price * quantity) - (discount.type === 'percentage' ? (selectedItem.price * quantity * discount.amount / 100) : discount.amount)).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddItem(selectedItem)}
                    disabled={quantity > selectedItem.stock}
                    className="w-full py-2 px-4 text-white rounded-lg font-bold text-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed hover:shadow disabled:hover:shadow-none"
                    style={{backgroundColor: quantity > selectedItem.stock ? '#ccc' : '#3674B5'}}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (quantity <= selectedItem.stock) {
                          handleAddItem(selectedItem);
                        }
                      }
                    }}
                  >
                    {quantity > selectedItem.stock ? 'Insufficient Stock' : 'Add to Cart (Press Enter)'}
                  </button>
                  
                 
                </div>
              )}
            </div>

            {/* Shopping Cart Table */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-100">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 mr-2" style={{color: '#3674B5'}} />
                Shopping Cart ({items.length} items)
              </h2>

              {items.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ShoppingCart className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Your cart is empty</p>
                  <p className="text-sm">Add items using the search above</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-4 px-2 font-bold text-gray-700">Item</th>
                        <th className="text-center py-4 px-2 font-bold text-gray-700 hidden sm:table-cell">Price</th>
                        <th className="text-center py-4 px-2 font-bold text-gray-700">Qty</th>
                        <th className="text-center py-4 px-2 font-bold text-gray-700 hidden sm:table-cell">Discount</th>
                        <th className="text-right py-4 px-2 font-bold text-gray-700">Total</th>
                        <th className="text-center py-4 px-2 font-bold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.cartId} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${editingItem === item.cartId ? 'editing-row bg-blue-50' : ''}`}>
                          <td className="py-4 px-2">
                            <div>
                              <p className="font-semibold text-gray-800 text-sm sm:text-base">{item.name}</p>
                              <p className="text-xs sm:text-sm text-gray-600">Stock: {item.stock}</p>
                              <div className="sm:hidden text-xs text-gray-600 mt-1">
                                ${item.price} × {item.quantity}
                                {item.discount > 0 && (
                                  <span className="text-green-600 ml-1">
                                    (-{item.discountType === 'percentage' ? `${item.discount}%` : `$${item.discount}`})
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-2 text-center font-semibold hidden sm:table-cell">
                            ${item.price}
                          </td>
                          <td className="py-4 px-2 text-center">
                            {editingItem === item.cartId ? (
                              <div 
                                className="flex items-center justify-center space-x-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateQuantity(item.cartId, item.quantity - 1);
                                  }}
                                  className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleUpdateQuantity(item.cartId, parseInt(e.target.value) || 1);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  onFocus={(e) => e.stopPropagation()}
                                  className="w-12 text-center p-1 border rounded text-sm"
                                  min="1"
                                  max={item.stock}
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateQuantity(item.cartId, item.quantity + 1);
                                  }}
                                  className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingItem(null);
                                  }}
                                  className="w-6 h-6 rounded bg-green-200 hover:bg-green-300 flex items-center justify-center ml-2"
                                  title="Save"
                                >
                                  ✓
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingItem(item.cartId)}
                                className="font-semibold text-lg hover:text-blue-600 flex items-center justify-center space-x-1 mx-auto"
                              >
                                <span>{item.quantity}</span>
                                <Edit3 className="w-3 h-3" />
                              </button>
                            )}
                          </td>
                          <td className="py-4 px-2 text-center hidden sm:table-cell">
                            {item.discount > 0 ? (
                              <span className="text-green-600 font-medium text-sm">
                                -{item.discountType === 'percentage' ? `${item.discount}%` : `$${item.discount}`}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">None</span>
                            )}
                          </td>
                          <td className="py-4 px-2 text-right font-bold text-lg" style={{color: '#3674B5'}}>
                            ${item.totalPrice.toFixed(2)}
                          </td>
                          <td className="py-4 px-2 text-center">
                            <button
                              onClick={() => handleRemoveItem(item.cartId)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors duration-150"
                            >
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Cart Summary */}
              {items.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                    <div className="text-sm text-gray-600">
                      <p>Items: {items.length} | Qty: {items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold" style={{color: '#3674B5'}}>Cart Total: ${total.toFixed(2)}</p>
                      {totalDiscount > 0 && (
                        <p className="text-sm text-green-600">Savings: ${totalDiscount.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Compact */}
          <div className="xl:col-span-2">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                  <User className="w-5 h-5 mr-2" style={{color: '#3674B5'}} />
                  Customer
                </h2>
                <button
                  onClick={() => setShowCustomerForm(!showCustomerForm)}
                  className="text-sm px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:shadow"
                  style={{backgroundColor: '#FADA7A', color: '#3674B5'}}
                >
                  {showCustomerForm ? 'Hide' : 'Add'}
                </button>
              </div>

              {showCustomerForm && (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg"
                  />
                  <label className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={customerInfo.isRegistered}
                      onChange={(e) => setCustomerInfo({...customerInfo, isRegistered: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Registered Member</span>
                  </label>
                </div>
              )}
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" style={{color: '#3674B5'}} />
                Payment
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700 py-2 border-b border-gray-100">
                  <span className="font-medium">Subtotal:</span>
                  <span className="font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700 py-2 border-b border-gray-100">
                  <span className="font-medium">Discount:</span>
                  <span className="text-green-600 font-bold">-${totalDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-800 text-xl py-3 ">
                  <span>Total:</span>
                  <span style={{color: '#3674B5'}}>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Customer Payment</label>
                  <input
                    type="number"
                    value={customerPayment}
                    onChange={(e) => setCustomerPayment(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2 border-2 border-gray-200 rounded-lg text-base font-bold"
                    step="0.01"
                  />
                </div>
                
                {customerInfo.isRegistered && (
                  <div>
                    <label className="flex text-sm font-bold text-gray-700 mb-2 items-center">
                      <Star className="w-4 h-4 mr-2" style={{color: '#FADA7A'}} />
                      Use Loyalty Points
                    </label>
                    <input
                      type="number"
                      value={loyaltyPoints}
                      onChange={(e) => setLoyaltyPoints(Math.min(total, Math.max(0, parseFloat(e.target.value) || 0)))}
                      placeholder="0.00"
                      className="w-full p-4 border-2 border-gray-200 rounded-lg text-lg font-bold"
                      step="0.01"
                      max={total}
                    />
                  </div>
                )}
              </div>

              {customerInfo.isRegistered && loyaltyPoints > 0 && (
                <div className="p-4 rounded-lg mb-6 border-2" style={{backgroundColor: '#FADA7A20', borderColor: '#FADA7A'}}>
                  <div className="flex justify-between text-lg font-bold">
                    <span>After Loyalty Points:</span>
                    <span style={{color: '#3674B5'}}>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {payment > 0 && (
                <div className="p-2 rounded-lg mb-6 border-2" style={{backgroundColor: finalBalance >= 0 ? '#E7F5E7' : '#FFE7E7', borderColor: finalBalance >= 0 ? '#10B981' : '#EF4444'}}>
                  <div className="flex justify-between text-base font-bold">
                    <span>{finalBalance >= 0 ? 'Change:' : 'Balance Due:'}</span>
                    <span className={finalBalance >= 0 ? 'text-green-700' : 'text-red-700'}>
                      ${Math.abs(finalBalance).toFixed(2)}
                    </span>
                  </div>
                  {finalBalance < 0 && (
                    <p className="text-sm text-red-600 mt-2 font-medium">
                      Need ${Math.abs(finalBalance).toFixed(2)} more to complete transaction
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={handleCompleteSale}
                disabled={items.length === 0 || finalBalance < 0 || loading}
                className="w-full py-4 px-6 text-white rounded-lg font-bold text-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed hover:shadow disabled:hover:shadow-none flex items-center justify-center space-x-3"
                style={{backgroundColor: items.length === 0 || finalBalance < 0 || loading ? '#ccc' : '#3674B5'}}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Receipt className="w-5 h-5" />
                    <span>Complete Sale & Generate Invoice</span>
                  </>
                )}
              </button>

              {/* Quick Actions */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setItems([]);
                    setCartIdCounter(1);
                    setCustomerPayment('');
                    setLoyaltyPoints(0);
                    setCustomerInfo({ name: '', phone: '', isRegistered: false });
                    setShowCustomerForm(false);
                  }}
                  className="py-2 px-4 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Clear All
                </button>
                <button
                  onClick={() => {
                    setCustomerPayment(finalTotal.toString());
                  }}
                  disabled={items.length === 0}
                  className="py-2 px-4 text-sm font-medium text-white rounded-lg transition-colors duration-200 disabled:bg-gray-300"
                  style={{backgroundColor: items.length === 0 ? '#ccc' : '#FADA7A', color: items.length === 0 ? '#666' : '#3674B5'}}
                >
                  Exact Amount
                </button>
              </div>

              {/* Last Invoice Quick Actions */}
              {lastCompletedSale && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Receipt className="w-4 h-4 mr-2 text-blue-600" />
                    Last Invoice: #{lastCompletedSale.invoiceNumber}
                  </h4>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={handlePreviewPDF}
                      className="py-1.5 px-2 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition-colors duration-200"
                    >
                      Preview
                    </button>
                    <button
                      onClick={handlePrintPDF}
                      className="py-1.5 px-2 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 transition-colors duration-200"
                    >
                      Print PDF
                    </button>
                    <button
                      onClick={handleDownloadPDF}
                      className="py-1.5 px-2 text-xs font-medium text-purple-700 bg-purple-100 rounded hover:bg-purple-200 transition-colors duration-200"
                    >
                      Download
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
        
        @media (max-width: 640px) {
          .table-scroll {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>

  {/* Editing mode now only exits via the Save button */}
    </div>
  );
}

export default SalesPage;