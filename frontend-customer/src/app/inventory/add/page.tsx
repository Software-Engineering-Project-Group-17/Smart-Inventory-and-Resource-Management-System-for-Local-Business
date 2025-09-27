"use client";

import { useState } from "react";

export default function AddInventoryPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/inventory", {
      method: "POST",
      body: formData,
    });

    setLoading(false);

    if (res.ok) {
      alert("Inventory added successfully!");
      e.currentTarget.reset();
    } else {
      const { error } = await res.json();
      alert(error || "Something went wrong");
    }
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-xl font-bold mb-4">Add Inventory</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="inventory_name"
          placeholder="Item Name"
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="number"
          name="category_id"
          placeholder="Category ID"
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="number"
          name="low_stock_threshold"
          placeholder="Low Stock Threshold"
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="number"
          step="0.01"
          name="unit_price"
          placeholder="Unit Price"
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="number"
          name="branch_id"
          placeholder="Branch ID"
          className="w-full p-2 border rounded"
          required
        />

        <input type="file" name="image" accept="image/*" className="w-full" />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Uploading..." : "Add Inventory"}
        </button>
      </form>
    </div>
  );
}
