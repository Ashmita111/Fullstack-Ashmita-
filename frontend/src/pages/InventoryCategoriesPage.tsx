import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorBanner } from '../components/ErrorBanner';
import { Spinner } from '../components/Spinner';
import {
  createCategory,
  deleteCategory,
  getCategories,
  getInventory,
  updateCategory,
} from '../api';
import type { Category, Inventory } from '../types';

type ModalState =
  | { type: 'create' }
  | { type: 'edit'; category: Category };

export function InventoryCategoriesPage() {
  const { invId } = useParams();
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    if (!invId) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const [inventoryResponse, categoriesResponse] = await Promise.all([
        getInventory(invId),
        getCategories(invId),
      ]);
      setInventory(inventoryResponse);
      setCategories(categoriesResponse);
    } catch (err) {
      setError((err as any)?.detail ?? (err as Error).message ?? 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [invId]);

  const openCreate = () => {
    setName('');
    setDescription('');
    setModal({ type: 'create' });
  };

  const openEdit = (category: Category) => {
    setName(category.name);
    setDescription(category.description ?? '');
    setModal({ type: 'edit', category });
  };

  const closeModal = () => setModal(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!invId) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      if (modal?.type === 'create') {
        await createCategory(invId, name, description || undefined);
      } else if (modal?.type === 'edit') {
        await updateCategory(invId, modal.category.id, name, description || undefined);
      }
      await loadData();
      closeModal();
    } catch (err) {
      setError((err as any)?.detail ?? (err as Error).message ?? 'Failed to save category');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!invId) {
      return;
    }

    const confirmed = window.confirm(`Delete category “${category.name}”?`);
    if (!confirmed) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      await deleteCategory(invId, category.id);
      await loadData();
    } catch (err) {
      setError((err as any)?.detail ?? (err as Error).message ?? 'Failed to delete category');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Categories</h1>
            <p className="mt-2 text-sm text-slate-500">View and manage categories for this inventory.</p>
            {inventory ? (
              <p className="mt-2 text-sm text-slate-500">Inventory: {inventory.name}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Add category
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link to="/inventories" className="font-semibold text-slate-900 hover:underline">
            Inventories
          </Link>
          <span>&rsaquo;</span>
          <span>{inventory?.name ?? 'Inventory details'}</span>
        </div>
      </div>

      {error ? <ErrorBanner message={error} /> : null}
      {loading ? <Spinner /> : null}

      {!loading && categories.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-slate-600">
          No categories found. Create one to start adding items.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((category) => (
          <div key={category.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{category.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{category.description ?? 'No description provided.'}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(category)}
                  className="rounded-2xl border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(category)}
                  disabled={actionLoading}
                  className="rounded-2xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
              <div>
                <span className="font-semibold text-slate-900">Items:</span> {category.item_count}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Total quantity:</span> {category.total_quantity}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Created:</span>{' '}
                {new Date(category.created_at).toLocaleDateString()}
              </div>
              <div>
                <Link
                  to={`/inventories/${invId}/categories/${category.id}/items`}
                  className="font-semibold text-slate-900 hover:underline"
                >
                  View items
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/50 px-4 py-6">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {modal.type === 'create' ? 'Create category' : 'Edit category'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {modal.type === 'create'
                    ? 'Add a new category to this inventory.'
                    : 'Update the selected category details.'}
                </p>
              </div>
              <button onClick={closeModal} className="text-slate-500 hover:text-slate-900">
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Description</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                  rows={4}
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
                >
                  {actionLoading
                    ? modal.type === 'create'
                      ? 'Creating…'
                      : 'Saving…'
                    : modal.type === 'create'
                    ? 'Create category'
                    : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
