"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MenuItem, MenuCategory } from "@/lib/db";
import {
  addMenuItem,
  editMenuItem,
  deleteMenuItem,
  toggleAvailability,
} from "./actions";

interface Props {
  menuItems: MenuItem[];
  menuCategories: MenuCategory[];
}

export default function MenuAdminClient({ menuItems, menuCategories }: Props) {
  const router = useRouter();

  // Add form state
  const [addName, setAddName] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addPrice, setAddPrice] = useState<number | "">("");
  const [addCategoryId, setAddCategoryId] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState<number | "">("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // --- Add Item ---
  async function handleAdd() {
    setAddError(null);
    setAddLoading(true);
    try {
      const result = await addMenuItem({
        name: addName,
        description: addDescription,
        price: addPrice === "" ? 0 : addPrice,
        categoryId: addCategoryId,
      });
      if (result.success) {
        setAddName("");
        setAddDescription("");
        setAddPrice("");
        setAddCategoryId("");
        router.refresh();
      } else {
        setAddError(result.error);
      }
    } finally {
      setAddLoading(false);
    }
  }

  // --- Open edit inline ---
  function openEdit(item: MenuItem) {
    setEditingId(item.id);
    setEditName(item.name);
    setEditDescription(item.description);
    setEditPrice(item.price);
    setEditCategoryId(item.categoryId);
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError(null);
  }

  // --- Save edit ---
  async function handleSaveEdit(id: string) {
    setEditError(null);
    setEditLoading(true);
    try {
      const result = await editMenuItem({
        id,
        name: editName,
        description: editDescription,
        price: editPrice === "" ? undefined : editPrice,
        categoryId: editCategoryId,
      });
      if (result.success) {
        setEditingId(null);
        router.refresh();
      } else {
        setEditError(result.error);
      }
    } finally {
      setEditLoading(false);
    }
  }

  // --- Delete ---
  async function handleDelete(id: string) {
    await deleteMenuItem(id);
    router.refresh();
  }

  // --- Toggle ---
  async function handleToggle(id: string) {
    await toggleAvailability(id);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {/* ── Add Item Section ── */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Add New Item</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder="Item name"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              value={addCategoryId}
              onChange={(e) => setAddCategoryId(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select category</option>
              {menuCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Price ($)
            </label>
            <input
              type="number"
              value={addPrice}
              onChange={(e) =>
                setAddPrice(e.target.value === "" ? "" : parseFloat(e.target.value))
              }
              placeholder="0.00"
              min={0.01}
              step={0.01}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={addDescription}
              onChange={(e) => setAddDescription(e.target.value)}
              placeholder="Short description"
              rows={2}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {addError && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {addError}
          </p>
        )}

        <button
          onClick={handleAdd}
          disabled={addLoading}
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {addLoading ? "Adding…" : "Add Item"}
        </button>
      </section>

      {/* ── Item List with Actions ── */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">Menu Items</h2>

        {menuItems.length === 0 ? (
          <p className="text-gray-500">No menu items found.</p>
        ) : (
          <ul className="space-y-3">
            {menuItems.map((item) => {
              const isEditing = editingId === item.id;
              const categoryName =
                menuCategories.find((c) => c.id === item.categoryId)?.name ?? "Unknown";

              return (
                <li
                  key={item.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  {isEditing ? (
                    /* ── Inline Edit UI ── */
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Name
                          </label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Category
                          </label>
                          <select
                            value={editCategoryId}
                            onChange={(e) => setEditCategoryId(e.target.value)}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {menuCategories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Price ($)
                          </label>
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) =>
                              setEditPrice(
                                e.target.value === "" ? "" : parseFloat(e.target.value)
                              )
                            }
                            min={0.01}
                            step={0.01}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            rows={2}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {editError && (
                        <p className="text-sm text-red-600" role="alert">
                          {editError}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(item.id)}
                          disabled={editLoading}
                          className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {editLoading ? "Saving…" : "Save"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ── Read-only row ── */
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          {categoryName} · ${item.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleToggle(item.id)}
                          className="rounded bg-yellow-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-yellow-600"
                        >
                          {item.isAvailable ? "Mark Unavailable" : "Mark Available"}
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
