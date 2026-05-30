import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorBanner } from '../components/ErrorBanner';
import { Spinner } from '../components/Spinner';
import {
  createInventory,
  deleteInventory,
  getInventories,
  updateInventory,
} from '../api';
import type { Inventory } from '../types';

type ModalState =
  | { type: 'create' }
  | { type: 'edit'; inventory: Inventory };

export function InventoriesPage() {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadInventories = async () => {
    setError(null);
    setLoading(true);

    try {
      setInventories(await getInventories());
    } catch (err) {
      setError((err as any)?.detail ?? (err as Error).message ?? 'Failed to load inventories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventories();
  }, []);

  const openCreate = () => {
    setName('');
    setDescription('');
    setModal({ type: 'create' });
  };

  const openEdit = (inventory: Inventory) => {
    setName(inventory.name);
    setDescription(inventory.description ?? '');
    setModal({ type: 'edit', inventory });
  };

  const closeModal = () => setModal(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActionLoading(true);
    setError(null);

    try {
      if (modal?.type === 'create') {
        await createInventory(name, description || undefined);
      } else if (modal?.type === 'edit') {
        await updateInventory(modal.inventory.id, name, description || undefined);
      }

      await loadInventories();
      closeModal();
    } catch (err) {
      setError((err as any)?.detail ?? (err as Error).message ?? 'Failed to save inventory');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (inventory: Inventory) => {
    const confirmed = window.confirm(`Delete inventory “${inventory.name}”?`);
    if (!confirmed) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      await deleteInventory(inventory.id);
      await loadInventories();
    } catch (err) {
      setError((err as any)?.detail ?? (err as Error).message ?? 'Failed to delete inventory');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Inventories</h1>
            <p className="mt-2 text-sm text-slate-500">Manage your inventory collections and track item counts.</p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Add inventory
          </button>
        </div>
      </div>

      {error ? <ErrorBanner message={error} /> : null}
      {loading ? <Spinner /> : null}

      {!loading && inventories.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-slate-600">
          No inventories available yet. Create one to get started.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {inventories.map((inventory) => (
          <div key={inventory.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{inventory.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{inventory.description ?? 'No description provided.'}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(inventory)}
                  className="rounded-2xl border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(inventory)}
                  disabled={actionLoading}
                  className="rounded-2xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
              <div>
                <span className="font-semibold text-slate-900">Categories:</span> {inventory.category_count}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Items:</span> {inventory.item_count}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Created:</span>{' '}
                {new Date(inventory.created_at).toLocaleDateString()}
              </div>
              <div>
                <Link
                  to={`/inventories/${inventory.id}/categories`}
                  className="font-semibold text-slate-900 hover:underline"
                >
                  View categories
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
                  {modal.type === 'create' ? 'Create inventory' : 'Edit inventory'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {modal.type === 'create'
                    ? 'Add a new inventory collection.'
                    : 'Update the selected inventory details.'}
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
                    ? 'Create inventory'
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
