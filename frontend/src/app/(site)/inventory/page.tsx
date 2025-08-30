"use client";
import React, { useState } from "react";
import { withAuth } from "@/hooks/useAuth";
import Navbar from "@/components/ui/navbar";
import {
  Search,
  Plus,
  Edit,
  Eye,
  Save,
  X,
  Check,
  ChevronDown,
  Package,
  Calendar,
  DollarSign,
  Hash,
  Tag,
  Building2,
  AlertCircle,
} from "lucide-react";

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  sku: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  costPrice: number;
  sellingPrice: number;
}

interface Category {
  id: number;
  name: string;
}

interface Unit {
  id: number;
  name: string;
}

const InventoryPage = () => {
  const [categories] = useState<Category[]>([
    { id: 1, name: "Cement" },
    { id: 2, name: "Nails" },
    { id: 3, name: "Wires" },
    { id: 4, name: "Tools" },
    { id: 5, name: "Pipes" },
    { id: 6, name: "Screws" },
    { id: 7, name: "Paint" },
    { id: 8, name: "Wood" },
  ]);

  const [units] = useState<Unit[]>([
    { id: 1, name: "kg" },
    { id: 2, name: "g" },
    { id: 3, name: "m" },
    { id: 4, name: "cm" },
    { id: 5, name: "mm" },
    { id: 6, name: "L" },
    { id: 7, name: "ml" },
    { id: 8, name: "pcs" },
    { id: 9, name: "box" },
    { id: 10, name: "pack" },
  ]);

  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: 1,
      name: "Portland Cement 50kg",
      category: "Cement",
      sku: "CEM001",
      quantity: 125,
      unit: "kg",
      expiryDate: "2025-12-31",
      costPrice: 8.5,
      sellingPrice: 12.99,
    },
    {
      id: 2,
      name: "Steel Nails 3 inch",
      category: "Nails",
      sku: "NAL003",
      quantity: 500,
      unit: "pcs",
      expiryDate: "2026-06-15",
      costPrice: 0.05,
      sellingPrice: 0.08,
    },
    {
      id: 3,
      name: "Copper Wire 14 AWG",
      category: "Wires",
      sku: "WIR014",
      quantity: 75,
      unit: "m",
      expiryDate: "2027-03-20",
      costPrice: 1.25,
      sellingPrice: 2.1,
    },
    {
      id: 4,
      name: "PVC Pipe 2 inch",
      category: "Pipes",
      sku: "PIP002",
      quantity: 200,
      unit: "m",
      expiryDate: "2030-01-01",
      costPrice: 5.4,
      sellingPrice: 8.99,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortByExpiry, setSortByExpiry] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [showCategoryFilterDropdown, setShowCategoryFilterDropdown] =
    useState(false);
  const [showExpiryFilterDropdown, setShowExpiryFilterDropdown] =
    useState(false);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [showNewUnitModal, setShowNewUnitModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newUnitName, setNewUnitName] = useState("");

  // Add form state
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    sku: "",
    quantity: 0,
    unit: "",
    expiryDate: "",
    costPrice: 0,
    sellingPrice: 0,
  });

  // Filter and sort inventory
  const filteredInventory = inventory
    .filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategory === "" || item.category === selectedCategory)
    )
    .sort((a, b) => {
      if (sortByExpiry === "earliest") {
        return (
          new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
        );
      } else if (sortByExpiry === "latest") {
        return (
          new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime()
        );
      }
      return 0;
    });

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditingItem({ ...item });
  };

  const handleSave = () => {
    if (editingItem) {
      setInventory((prev) =>
        prev.map((item) => (item.id === editingItem.id ? editingItem : item))
      );
      setEditingId(null);
      setEditingItem(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingItem(null);
  };

  const handleAddItem = () => {
    if (newItem.name && newItem.category && newItem.sku && newItem.unit) {
      const item: InventoryItem = {
        id: Math.max(...inventory.map((i) => i.id)) + 1,
        ...newItem,
      };
      setInventory((prev) => [...prev, item]);
      setNewItem({
        name: "",
        category: "",
        sku: "",
        quantity: 0,
        unit: "",
        expiryDate: "",
        costPrice: 0,
        sellingPrice: 0,
      });
      setShowAddForm(false);
    }
  };

  const Modal = ({
    isOpen,
    onClose,
    title,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
  }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="p-3 rounded-xl text-white"
                style={{ backgroundColor: "#3674B5" }}
              >
                <Package size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Inventory Management
                </h1>
                <p className="text-gray-600">
                  Manage your hardware store inventory
                </p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div
                  className="p-3 rounded-lg text-white"
                  style={{ backgroundColor: "#3674B5" }}
                >
                  <Package size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {inventory.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div
                  className="p-3 rounded-lg text-white"
                  style={{ backgroundColor: "#FADA7A" }}
                >
                  <AlertCircle size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {inventory.filter((item) => item.quantity < 50).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div
                  className="p-3 rounded-lg text-white"
                  style={{ backgroundColor: "#3674B5" }}
                >
                  <Tag size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Categories</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {categories.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div
                  className="p-3 rounded-lg text-white"
                  style={{ backgroundColor: "#FADA7A" }}
                >
                  <DollarSign size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    LKR{" "}
                    {inventory
                      .reduce(
                        (sum, item) => sum + item.sellingPrice * item.quantity,
                        0
                      )
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Add Button */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent transition-all duration-200 focus:outline-none"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <button
                  onClick={() =>
                    setShowCategoryFilterDropdown(!showCategoryFilterDropdown)
                  }
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent flex items-center justify-between min-w-[150px]"
                >
                  <span
                    className={
                      selectedCategory ? "text-gray-900" : "text-gray-500"
                    }
                  >
                    {selectedCategory || "All Categories"}
                  </span>
                  <ChevronDown size={20} className="text-gray-400 ml-2" />
                </button>

                {showCategoryFilterDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="max-h-60 overflow-y-auto">
                      <button
                        onClick={() => {
                          setSelectedCategory("");
                          setShowCategoryFilterDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        All Categories
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategory(cat.name);
                            setShowCategoryFilterDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Expiry Sort */}
              <div className="relative">
                <button
                  onClick={() =>
                    setShowExpiryFilterDropdown(!showExpiryFilterDropdown)
                  }
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent flex items-center justify-between min-w-[150px]"
                >
                  <span
                    className={sortByExpiry ? "text-gray-900" : "text-gray-500"}
                  >
                    {sortByExpiry === "earliest"
                      ? "Earliest First"
                      : sortByExpiry === "latest"
                      ? "Latest First"
                      : "Sort by Expiry"}
                  </span>
                  <ChevronDown size={20} className="text-gray-400 ml-2" />
                </button>

                {showExpiryFilterDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="max-h-60 overflow-y-auto">
                      <button
                        onClick={() => {
                          setSortByExpiry("");
                          setShowExpiryFilterDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        Sort by Expiry
                      </button>
                      <button
                        onClick={() => {
                          setSortByExpiry("earliest");
                          setShowExpiryFilterDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        Earliest First
                      </button>
                      <button
                        onClick={() => {
                          setSortByExpiry("latest");
                          setShowExpiryFilterDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        Latest First
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Add Item Button */}
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors duration-200 font-medium"
                style={{ backgroundColor: "#3674B5" }}
              >
                <Plus size={20} />
                Add Item
              </button>
            </div>
          </div>

          {/* Add Item Form */}
          {showAddForm && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="p-2 rounded-lg text-white"
                  style={{ backgroundColor: "#FADA7A" }}
                >
                  <Plus size={20} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Add New Item
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                    placeholder="Enter item name"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowCategoryDropdown(!showCategoryDropdown)
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent text-left flex items-center justify-between"
                    >
                      <span
                        className={
                          newItem.category ? "text-gray-900" : "text-gray-400"
                        }
                      >
                        {newItem.category || "Select category"}
                      </span>
                      <ChevronDown size={20} className="text-gray-400" />
                    </button>

                    {showCategoryDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                        <div className="max-h-60 overflow-y-auto">
                          {categories.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => {
                                setNewItem((prev) => ({
                                  ...prev,
                                  category: cat.name,
                                }));
                                setShowCategoryDropdown(false);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                            >
                              {cat.name}
                            </button>
                          ))}
                          <div className="border-t border-gray-200">
                            <button
                              onClick={() => {
                                setShowCategoryDropdown(false);
                                setShowNewCategoryModal(true);
                              }}
                              className="w-full px-4 py-3 text-left text-[#3674B5] hover:bg-gray-50 transition-colors font-medium"
                            >
                              + Add New Category
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={newItem.sku}
                    onChange={(e) =>
                      setNewItem((prev) => ({ ...prev, sku: e.target.value }))
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                    placeholder="Enter SKU"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        quantity: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowUnitDropdown(!showUnitDropdown)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent text-left flex items-center justify-between"
                    >
                      <span
                        className={
                          newItem.unit ? "text-gray-900" : "text-gray-400"
                        }
                      >
                        {newItem.unit || "Select unit"}
                      </span>
                      <ChevronDown size={20} className="text-gray-400" />
                    </button>

                    {showUnitDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                        <div className="max-h-60 overflow-y-auto">
                          {units.map((unit) => (
                            <button
                              key={unit.id}
                              onClick={() => {
                                setNewItem((prev) => ({
                                  ...prev,
                                  unit: unit.name,
                                }));
                                setShowUnitDropdown(false);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                            >
                              {unit.name}
                            </button>
                          ))}
                          <div className="border-t border-gray-200">
                            <button
                              onClick={() => {
                                setShowUnitDropdown(false);
                                setShowNewUnitModal(true);
                              }}
                              className="w-full px-4 py-3 text-left text-[#3674B5] hover:bg-gray-50 transition-colors font-medium"
                            >
                              + Add New Unit
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={newItem.expiryDate}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        expiryDate: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.costPrice}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        costPrice: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selling Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newItem.sellingPrice}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        sellingPrice: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddItem}
                  className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
                  style={{ backgroundColor: "#3674B5" }}
                  disabled={
                    !newItem.name ||
                    !newItem.category ||
                    !newItem.sku ||
                    !newItem.unit
                  }
                >
                  <Check size={16} />
                  Add Item
                </button>
              </div>
            </div>
          )}

          {/* Inventory Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: "#3674B5" }}>
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      SKU
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Unit
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Expiry Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Cost Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Selling Price
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInventory.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        {editingId === item.id ? (
                          <input
                            type="text"
                            value={editingItem?.name || ""}
                            onChange={(e) =>
                              setEditingItem((prev) =>
                                prev ? { ...prev, name: e.target.value } : null
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                          />
                        ) : (
                          <div className="font-medium text-gray-900">
                            {item.name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === item.id ? (
                          <select
                            value={editingItem?.category || ""}
                            onChange={(e) =>
                              setEditingItem((prev) =>
                                prev
                                  ? { ...prev, category: e.target.value }
                                  : null
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                          >
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.name}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: "#FADA7A",
                              color: "#92400e",
                            }}
                          >
                            {item.category}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === item.id ? (
                          <input
                            type="text"
                            value={editingItem?.sku || ""}
                            onChange={(e) =>
                              setEditingItem((prev) =>
                                prev ? { ...prev, sku: e.target.value } : null
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                          />
                        ) : (
                          <span className="text-gray-600 font-mono">
                            {item.sku}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === item.id ? (
                          <input
                            type="number"
                            value={editingItem?.quantity || ""}
                            onChange={(e) =>
                              setEditingItem((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      quantity: parseInt(e.target.value) || 0,
                                    }
                                  : null
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                          />
                        ) : (
                          <span
                            className={`font-medium ${
                              item.quantity < 50
                                ? "text-red-600"
                                : "text-gray-900"
                            }`}
                          >
                            {item.quantity}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === item.id ? (
                          <select
                            value={editingItem?.unit || ""}
                            onChange={(e) =>
                              setEditingItem((prev) =>
                                prev ? { ...prev, unit: e.target.value } : null
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                          >
                            {units.map((unit) => (
                              <option key={unit.id} value={unit.name}>
                                {unit.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-gray-600 font-medium">
                            {item.unit}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === item.id ? (
                          <input
                            type="date"
                            value={editingItem?.expiryDate || ""}
                            onChange={(e) =>
                              setEditingItem((prev) =>
                                prev
                                  ? { ...prev, expiryDate: e.target.value }
                                  : null
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                          />
                        ) : (
                          <span className="text-gray-600">
                            {item.expiryDate}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === item.id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editingItem?.costPrice || ""}
                            onChange={(e) =>
                              setEditingItem((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      costPrice:
                                        parseFloat(e.target.value) || 0,
                                    }
                                  : null
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                          />
                        ) : (
                          <span className="text-gray-900 font-medium">
                            LKR {item.costPrice.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === item.id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editingItem?.sellingPrice || ""}
                            onChange={(e) =>
                              setEditingItem((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      sellingPrice:
                                        parseFloat(e.target.value) || 0,
                                    }
                                  : null
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                          />
                        ) : (
                          <span className="text-green-600 font-medium">
                            LKR {item.sellingPrice.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {editingId === item.id ? (
                            <>
                              <button
                                onClick={handleSave}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              >
                                <Save size={16} />
                              </button>
                              <button
                                onClick={handleCancel}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  alert(`Supplier details for ${item.name}`)
                                }
                                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              >
                                <Eye size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredInventory.length === 0 && (
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">No items found</p>
                  <p className="text-gray-400">
                    Try adjusting your search criteria
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Category Modal */}
        <Modal
          isOpen={showNewCategoryModal}
          onClose={() => {
            setShowNewCategoryModal(false);
            setNewCategoryName("");
          }}
          title="Add New Category"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                placeholder="Enter category name"
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowNewCategoryModal(false);
                  setNewCategoryName("");
                }}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newCategoryName.trim()) {
                    // In real app, you'd add to categories state
                    alert(`Category "${newCategoryName}" would be added`);
                    setShowNewCategoryModal(false);
                    setNewCategoryName("");
                  }
                }}
                disabled={!newCategoryName.trim()}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: "#3674B5" }}
              >
                <Check size={16} />
                Add Category
              </button>
            </div>
          </div>
        </Modal>

        {/* Add Unit Modal */}
        <Modal
          isOpen={showNewUnitModal}
          onClose={() => {
            setShowNewUnitModal(false);
            setNewUnitName("");
          }}
          title="Add New Unit"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Name
              </label>
              <input
                type="text"
                value={newUnitName}
                onChange={(e) => setNewUnitName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3674B5] focus:border-transparent"
                placeholder="Enter unit name (e.g., kg, m, pcs)"
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowNewUnitModal(false);
                  setNewUnitName("");
                }}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newUnitName.trim()) {
                    // In real app, you'd add to units state
                    alert(`Unit "${newUnitName}" would be added`);
                    setShowNewUnitModal(false);
                    setNewUnitName("");
                  }
                }}
                disabled={!newUnitName.trim()}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: "#3674B5" }}
              >
                <Check size={16} />
                Add Unit
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

// Protect this page for STAFF, INVENTORY_MANAGER, and higher roles
export default withAuth(InventoryPage, {
  requiredRoles: ["STAFF", "INVENTORY_MANAGER", "MANAGER", "OWNER", "ADMIN"],
});
