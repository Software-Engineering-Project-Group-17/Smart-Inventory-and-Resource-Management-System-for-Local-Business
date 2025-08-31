"use client"
import React, { useState } from 'react';
import { InventoryItem, Category, Unit } from '@/types/Inventory';
import InventoryHeader from '@/components/inventory/Header';
import SummaryCards from '@/components/inventory/SummaryCards';
import InventoryFilters from '@/components/inventory/InventoryFilters';
import AddItemForm from '@/components/inventory/AddItemForm';
import InventoryTable from '@/components/inventory/inventoryTable';
import AddCategoryModal from '@/components/inventory/AddCategoryModal';
import AddUnitModal from '@/components/inventory/AddUnitModal';

const InventoryPage = () => {
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Cement' },
    { id: '2', name: 'Nails' },
    { id: '3', name: 'Wires' },
    { id: '4', name: 'Tools' },
    { id: '5', name: 'Pipes' },
    { id: '6', name: 'Screws' },
    { id: '7', name: 'Paint' },
    { id: '8', name: 'Wood' }
  ]);

  const [units, setUnits] = useState<Unit[]>([
    { id: '1', name: 'kg' },
    { id: '2', name: 'g' },
    { id: '3', name: 'm' },
    { id: '4', name: 'cm' },
    { id: '5', name: 'mm' },
    { id: '6', name: 'L' },
    { id: '7', name: 'ml' },
    { id: '8', name: 'pcs' },
    { id: '9', name: 'box' },
    { id: '10', name: 'pack' }

  ]);

  const [inventory, setInventory] = useState<InventoryItem[]>([
    {

      id: '1',
      name: 'Portland Cement 50kg',
      category: 'Cement',
      sku: 'CEM001',

      quantity: 125,
      unit: "kg",
      expiryDate: "2025-12-31",
      costPrice: 8.5,
      sellingPrice: 12.99,
    },
    {

      id: '2',
      name: 'Steel Nails 3 inch',
      category: 'Nails',
      sku: 'NAL003',
      quantity: 500,
      unit: "pcs",
      expiryDate: "2026-06-15",
      costPrice: 0.05,
      sellingPrice: 0.08,
    },
    {

      id: '3',
      name: 'Copper Wire 14 AWG',
      category: 'Wires',
      sku: 'WIR014',
      quantity: 75,
      unit: "m",
      expiryDate: "2027-03-20",
      costPrice: 1.25,
      sellingPrice: 2.1,
    },
    {

      id: '4',
      name: 'PVC Pipe 2 inch',
      category: 'Pipes',
      sku: 'PIP002',
      quantity: 200,
      unit: "m",
      expiryDate: "2030-01-01",
      costPrice: 5.4,
      sellingPrice: 8.99,
    },
  ]);


  // State for filters and UI
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortByExpiry, setSortByExpiry] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Dropdown states
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);

  const [showCategoryFilterDropdown, setShowCategoryFilterDropdown] = useState(false);
  const [showExpiryFilterDropdown, setShowExpiryFilterDropdown] = useState(false);

  // Modal states

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

  // Event handlers
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
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...newItem

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


  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: Category = {
        id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newCategoryName.trim()
      };
      setCategories(prev => [...prev, newCategory]);
      setNewCategoryName('');
      setShowNewCategoryModal(false);
    }
  };


  const handleAddUnit = () => {
    if (newUnitName.trim()) {
      const newUnit: Unit = {
        id: `unit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newUnitName.trim()
      };
      setUnits(prev => [...prev, newUnit]);
      setNewUnitName('');
      setShowNewUnitModal(false);
    }
  };

  const updateNewItem = (updates: Partial<typeof newItem>) => {
    setNewItem(prev => ({ ...prev, ...updates }));
  };

  const updateEditingItem = (updates: Partial<InventoryItem>) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, ...updates });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <InventoryHeader />
        
        <SummaryCards inventory={inventory} categories={categories} />
        
        <InventoryFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortByExpiry={sortByExpiry}
          onSortChange={setSortByExpiry}
          categories={categories}
          onAddItem={() => setShowAddForm(!showAddForm)}
          showCategoryDropdown={showCategoryFilterDropdown}
          onToggleCategoryDropdown={() => setShowCategoryFilterDropdown(!showCategoryFilterDropdown)}
          showExpiryDropdown={showExpiryFilterDropdown}
          onToggleExpiryDropdown={() => setShowExpiryFilterDropdown(!showExpiryFilterDropdown)}
        />

        <AddItemForm
          isVisible={showAddForm}
          onClose={() => setShowAddForm(false)}
          newItem={newItem}
          onUpdateItem={updateNewItem}
          onAddItem={handleAddItem}
          categories={categories}
          units={units}
          showCategoryDropdown={showCategoryDropdown}
          onToggleCategoryDropdown={() => setShowCategoryDropdown(!showCategoryDropdown)}
          showUnitDropdown={showUnitDropdown}
          onToggleUnitDropdown={() => setShowUnitDropdown(!showUnitDropdown)}
          onShowNewCategoryModal={() => setShowNewCategoryModal(true)}
          onShowNewUnitModal={() => setShowNewUnitModal(true)}
        />

        <InventoryTable
          items={filteredInventory}
          editingId={editingId}
          editingItem={editingItem}
          categories={categories}
          units={units}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          onUpdateEditingItem={updateEditingItem}
        />

        <AddCategoryModal
          isOpen={showNewCategoryModal}
          onClose={() => setShowNewCategoryModal(false)}
          categoryName={newCategoryName}
          onCategoryNameChange={setNewCategoryName}
          onAddCategory={handleAddCategory}
        />

        <AddUnitModal
          isOpen={showNewUnitModal}
          onClose={() => setShowNewUnitModal(false)}
          unitName={newUnitName}
          onUnitNameChange={setNewUnitName}
          onAddUnit={handleAddUnit}
        />

      </div>
    </div>
  );
};

// Protect this page for STAFF, INVENTORY_MANAGER, and higher roles
export default withAuth(InventoryPage, {
  requiredRoles: ["STAFF", "INVENTORY_MANAGER", "MANAGER", "OWNER", "ADMIN"],
});
