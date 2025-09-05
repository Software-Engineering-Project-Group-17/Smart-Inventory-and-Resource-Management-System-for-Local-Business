// app/restock-requests/page.tsx
"use client";

import { useState, useEffect } from "react";

interface InventoryItem {
  inventory_id: number;
  inventory_name: string;
  quantity: number;
  low_stock_threshold: number;
  unit_price: number;
  image_url?: string;
  category_id: number;
}

interface RestockCartItem {
  inventory_id: number;
  inventory_name: string;
  requested_quantity: number;
  estimated_unit_price: number;
  notes: string;
}

export default function RestockRequestPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [cartItems, setCartItems] = useState<RestockCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "normal" as "low" | "normal" | "high" | "urgent",
    required_by_date: "",
    notes: "",
  });

  // Fetch inventory items
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch("/api/inventory");
        if (response.ok) {
          const data = await response.json();
          setInventoryItems(data);
        }
      } catch (error) {
        console.error("Error fetching inventory:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // Add item to cart
  const addToCart = (item: InventoryItem) => {
    const existingItem = cartItems.find(
      (cartItem) => cartItem.inventory_id === item.inventory_id
    );

    if (existingItem) {
      // Update quantity if already in cart
      setCartItems(
        cartItems.map((cartItem) =>
          cartItem.inventory_id === item.inventory_id
            ? {
                ...cartItem,
                requested_quantity: cartItem.requested_quantity + 1,
              }
            : cartItem
        )
      );
    } else {
      // Add new item to cart
      setCartItems([
        ...cartItems,
        {
          inventory_id: item.inventory_id,
          inventory_name: item.inventory_name,
          requested_quantity: 1,
          estimated_unit_price: item.unit_price,
          notes: "",
        },
      ]);
    }
  };

  // Update cart item
  const updateCartItem = (
    inventoryId: number,
    field: string,
    value: string | number
  ) => {
    setCartItems(
      cartItems.map((item) =>
        item.inventory_id === inventoryId ? { ...item, [field]: value } : item
      )
    );
  };

  // Remove item from cart
  const removeFromCart = (inventoryId: number) => {
    setCartItems(cartItems.filter((item) => item.inventory_id !== inventoryId));
  };

  // Calculate total estimated cost
  const totalEstimatedCost = cartItems.reduce(
    (total, item) =>
      total + item.requested_quantity * item.estimated_unit_price,
    0
  );

  // Submit restock request
  const submitRestockRequest = async () => {
    try {
      // In a real app, you would get these from authentication/session
      const branchId = 3; // Example branch ID
      const createdBy = 2; // Example user ID

      const requestData = {
        branch_id: branchId,
        created_by: createdBy,
        ...formData,
        total_estimated_cost: totalEstimatedCost,
        items: cartItems,
      };

      const response = await fetch("/api/restock-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        alert("Restock request created successfully!");
        setCartItems([]);
        setShowRequestForm(false);
        setFormData({
          title: "",
          description: "",
          priority: "normal",
          required_by_date: "",
          notes: "",
        });
      } else {
        alert("Failed to create restock request");
      }
    } catch (error) {
      console.error("Error creating restock request:", error);
      alert("Error creating restock request");
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading inventory...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Restock Request Management</h1>

      {/* Inventory List */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Available Inventory Items
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventoryItems.map((item) => (
            <div key={item.inventory_id} className="border rounded-lg p-4">
              <h3 className="font-semibold">{item.inventory_name}</h3>
              <p>Current Stock: {item.quantity}</p>
              <p>Low Stock Threshold: {item.low_stock_threshold}</p>
              <p>Unit Price: ${Number(item.unit_price).toFixed(2)}</p>
              <button
                onClick={() => addToCart(item)}
                className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Add to Restock Cart
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Restock Cart */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Restock Cart</h2>
          {cartItems.length > 0 && (
            <button
              onClick={() => setShowRequestForm(true)}
              className="bg-green-500 text-black px-4 py-2 rounded hover:bg-green-600"
            >
              Create Restock Request
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <p className="text-gray-500">
            Your cart is empty. Add items from the inventory above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="py-2 px-4 border">Item Name</th>
                  <th className="py-2 px-4 border">Quantity</th>
                  <th className="py-2 px-4 border">Estimated Unit Price</th>
                  <th className="py-2 px-4 border">Total</th>
                  <th className="py-2 px-4 border">Notes</th>
                  <th className="py-2 px-4 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.inventory_id}>
                    <td className="py-2 px-4 border">{item.inventory_name}</td>
                    <td className="py-2 px-4 border">
                      <input
                        type="number"
                        min="1"
                        value={item.requested_quantity}
                        onChange={(e) =>
                          updateCartItem(
                            item.inventory_id,
                            "requested_quantity",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-20 border rounded px-2 py-1"
                      />
                    </td>
                    <td className="py-2 px-4 border">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.estimated_unit_price}
                        onChange={(e) =>
                          updateCartItem(
                            item.inventory_id,
                            "estimated_unit_price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-24 border rounded px-2 py-1"
                      />
                    </td>
                    <td className="py-2 px-4 border">
                      $
                      {(
                        item.requested_quantity * item.estimated_unit_price
                      ).toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border">
                      <input
                        type="text"
                        value={item.notes}
                        onChange={(e) =>
                          updateCartItem(
                            item.inventory_id,
                            "notes",
                            e.target.value
                          )
                        }
                        placeholder="Special requirements"
                        className="w-full border rounded px-2 py-1"
                      />
                    </td>
                    <td className="py-2 px-4 border">
                      <button
                        onClick={() => removeFromCart(item.inventory_id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan={3}
                    className="py-2 px-4 border text-right font-semibold"
                  >
                    Total Estimated Cost:
                  </td>
                  <td colSpan={3} className="py-2 px-4 border font-semibold">
                    ${totalEstimatedCost.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Restock Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Create Restock Request
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as any,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Required By Date
                </label>
                <input
                  type="date"
                  value={formData.required_by_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      required_by_date: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  rows={2}
                />
              </div>

              <div className="font-semibold">
                Total Estimated Cost: ${totalEstimatedCost.toFixed(2)}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowRequestForm(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRestockRequest}
                  disabled={!formData.title}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
