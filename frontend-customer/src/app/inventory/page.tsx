"use client";

import { useEffect, useState } from "react";

interface InventoryItem {
  inventory_id: number;
  inventory_name: string;
  quantity: number;
  category_id: number;
  low_stock_threshold: number;
  unit_price: number;
  branch_id: number;
  image_url?: string | null;
}

export default function InventoryListPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInventory() {
      const res = await fetch("/api/home/inventory");
      const data = await res.json();
      setItems(data);
      setLoading(false);
    }
    fetchInventory();
  }, []);

  if (loading) {
    return <p className="text-center p-6">Loading inventory...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Inventory List</h1>
      <div className="grid gap-4">
        {items.map((item) => (
          <div
            key={item.inventory_id}
            className="p-4 border rounded-lg shadow-sm flex items-center gap-4"
          >
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.inventory_name}
                className="w-20 h-20 object-cover rounded"
              />
            )}
            <div>
              <h2 className="font-semibold">{item.inventory_name}</h2>
              <p>Quantity: {item.quantity}</p>
              <p>Unit Price: ${item.unit_price}</p>
              <p>
                Branch: {item.branch_id} | Category: {item.category_id}
              </p>
              <p className="text-sm text-gray-500">
                Low Stock Threshold: {item.low_stock_threshold}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
