"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Search, ShoppingCart, Percent, DollarSign, User, Printer, Trash2, Plus, Minus, Scan, Receipt, Star, Clock, Edit3 } from 'lucide-react';
import { getUserProfile } from '@/lib/auth';

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
  
  // Get user email from session/auth - you may need to implement this based on your auth system
  const userProfile = getUserProfile();
  const userEmail = userProfile?.email || "admin@example.com";

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Set client-side only values after component mounts
  useEffect(() => {
    setIsClient(true);
    setInvoiceNumber(`INV-${Date.now().toString().slice(-6)}`);
    setCurrentDate(new Date().toLocaleDateString());
    console.log('User email:', userEmail);
    console.log('User profile:', userProfile);
  }, []);

  // Search for inventory items
  const searchInventory = async (term: string, type: 'name' | 'barcode') => {
    if (!term.trim()) {
      setSuggestions([]);
      return;
    }

    console.log('Searching for:', term, 'Type:', type, 'UserEmail:', userEmail);

    try {
      const response = await fetch(`/api/sales?search=${encodeURIComponent(term)}&type=${type}&userEmail=${encodeURIComponent(userEmail)}`);
      const data = await response.json();
      
      console.log('Search response:', data);
      
      if (data.success) {
        setSuggestions(data.inventory);
        console.log('Suggestions set:', data.inventory);
      } else {
        setError(data.error || 'Failed to search inventory');
        setSuggestions([]);
        console.error('Search failed:', data.error);
      }
    } catch (error) {
      console.error('Error searching inventory:', error);
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
          totalPrice: item.totalPrice
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
        
        // Clear the cart and form
        setItems([]);
        setCartIdCounter(1);
        setCustomerPayment('');
        setLoyaltyPoints(0);
        setCustomerInfo({ name: '', phone: '', isRegistered: false });
        setShowCustomerForm(false);
        
        // Print invoice
        setTimeout(() => {
          handlePrintInvoice();
        }, 1000);
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

  return (
    <div className="min-h-screen bg-whitep-2 sm:p-4">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 lg:mb-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl shadow-md flex items-center justify-center" style={{backgroundColor: '#3674B5'}}>
                <Receipt className="text-white w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Invoicing</h1>
                <p className="text-sm sm:text-base text-gray-600">
                  {isClient ? `Invoice #${invoiceNumber}` : 'Invoice #INV-000000'}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{isClient ? currentDate : 'Loading...'}</span>
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
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative">
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
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl relative">
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
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-100">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
                <Search className="w-5 h-5 sm:w-6 sm:h-6 mr-2" style={{color: '#3674B5'}} />
                Add Items to Cart
              </h2>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mb-4 sm:mb-6">
                <button
                  onClick={() => setSearchType('name')}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    searchType === 'name' 
                      ? 'text-white shadow-lg transform scale-105' 
                      : 'text-gray-600 bg-gray-100 hover:bg-gray-200 hover:scale-102'
                  }`}
                  style={searchType === 'name' ? {backgroundColor: '#3674B5'} : {}}
                >
                  Search by Name
                </button>
                <button
                  onClick={() => setSearchType('barcode')}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center ${
                    searchType === 'barcode' 
                      ? 'text-white shadow-lg transform scale-105' 
                      : 'text-gray-600 bg-gray-100 hover:bg-gray-200 hover:scale-102'
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
                  className="px-4 py-3 rounded-xl text-sm font-semibold bg-blue-100 hover:bg-blue-200 text-blue-700"
                >
                  Show All
                </button>
              </div>

              <div className="relative mb-6">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchType === 'name' ? 'Type product name...' : 'Scan or enter barcode...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-200"
                />
                {suggestions.length > 0 && !selectedItem && (
                  <div className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto">
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
                <div className="p-6 border-2 rounded-xl shadow-sm" style={{borderColor: '#FADA7A', backgroundColor: '#FADA7A10'}}>
                  <h3 className="font-bold text-gray-800 mb-4 text-lg">{selectedItem.name}</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Quantity</label>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors duration-150"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-20 text-center p-2 border-2 border-gray-300 rounded-lg text-lg font-semibold"
                          min="1"
                          max={selectedItem.stock}
                        />
                        <button
                          onClick={() => setQuantity(Math.min(selectedItem.stock, quantity + 1))}
                          className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors duration-150"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Discount</label>
                      <div className="flex space-x-2">
                        <select
                          value={discount.type}
                          onChange={(e) => setDiscount({...discount, type: e.target.value as 'value' | 'percentage'})}
                          className="flex-1 p-2 border-2 border-gray-300 rounded-lg text-sm font-medium"
                        >
                          <option value="value">$ Amount</option>
                          <option value="percentage">% Percent</option>
                        </select>
                        <input
                          type="number"
                          value={discount.amount}
                          onChange={(e) => setDiscount({...discount, amount: parseFloat(e.target.value) || 0})}
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
                    className="w-full py-4 px-6 text-white rounded-xl font-bold text-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed hover:shadow-lg disabled:hover:shadow-none"
                    style={{backgroundColor: quantity > selectedItem.stock ? '#ccc' : '#3674B5'}}
                  >
                    {quantity > selectedItem.stock ? 'Insufficient Stock' : 'Add to Cart'}
                  </button>
                </div>
              )}
            </div>

            {/* Shopping Cart Table */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
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
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
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
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                  <User className="w-5 h-5 mr-2" style={{color: '#3674B5'}} />
                  Customer
                </h2>
                <button
                  onClick={() => setShowCustomerForm(!showCustomerForm)}
                  className="text-sm px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:shadow-md"
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
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
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
                <div className="flex justify-between font-bold text-gray-800 text-xl py-3 border-t-2 border-gray-300">
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
                    className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg font-bold"
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
                      className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg font-bold"
                      step="0.01"
                      max={total}
                    />
                  </div>
                )}
              </div>

              {customerInfo.isRegistered && loyaltyPoints > 0 && (
                <div className="p-4 rounded-xl mb-6 border-2" style={{backgroundColor: '#FADA7A20', borderColor: '#FADA7A'}}>
                  <div className="flex justify-between text-lg font-bold">
                    <span>After Loyalty Points:</span>
                    <span style={{color: '#3674B5'}}>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {payment > 0 && (
                <div className="p-4 rounded-xl mb-6 border-2" style={{backgroundColor: finalBalance >= 0 ? '#E7F5E7' : '#FFE7E7', borderColor: finalBalance >= 0 ? '#10B981' : '#EF4444'}}>
                  <div className="flex justify-between text-xl font-bold">
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
                className="w-full py-4 px-6 text-white rounded-xl font-bold text-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed hover:shadow-lg disabled:hover:shadow-none flex items-center justify-center space-x-3"
                style={{backgroundColor: items.length === 0 || finalBalance < 0 || loading ? '#ccc' : '#3674B5'}}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-5 h-5" />
                    <span>Complete & Print Invoice</span>
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