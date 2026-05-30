import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorBanner } from '../components/ErrorBanner';
import { Spinner } from '../components/Spinner';
import {
  createItem,
  deleteItem,
  getCategories,
  getItems,
  updateItem,
} from '../api';
import type { Item } from '../types';

type ModalState =
  | { type: 'create' }
  | { type: 'edit'; item: Item };

export function CategoryItemsPage() {
  const { invId, catId } = useParams();
  const [categoryName, setCategoryName] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [formState, setFormState] = useState({
    name: '',
    sku: '',
    quantity: '0',
    min_stock: '0',
    price: '0',
    cost: '0',
    supplier: '',
    unit: '',
    image: '',
  });
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    if (!catId || !invId) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const [categoryList, itemList] = await Promise.all([
        getCategories(invId),
        getItems({ cat_id: catId }),
      ]);
      setItems(itemList);
      const category = categoryList.find((entry) => entry.id === catId);
      setCategoryName(category?.name ?? 'Category');
    } catch (err) {
      setError((err as any)?.detail ?? (err as Error).message ?? 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [catId, invId]);

  const openCreate = () => {
    setFormState({
      name: '',
      sku: '',
      quantity: '0',
      min_stock: '0',
      price: '0',
      cost: '0',
      supplier: '',
      unit: '',
      image: '',
    });
    setModal({ type: 'create' });
  };

  const openEdit = (item: Item) => {
    setFormState({
      name: item.name,
      sku: item.sku,
      quantity: item.quantity.toString(),
      min_stock: item.min_stock.toString(),
      price: item.price.toString(),
      cost: item.cost.toString(),
      supplier: item.supplier ?? '',
      unit: item.unit,
      image: item.image ?? '',
    });
    setModal({ type: 'edit', item });
  };

  const closeModal = () => setModal(null);

  const handleChange = (field: keyof typeof formState, value: string) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const parsePayload = () => ({
    name: formState.name,
    sku: formState.sku,
    category_id: catId as string,
    quantity: Number(formState.quantity),
    min_stock: Number(formState.min_stock),
    price: Number(formState.price),
    cost: Number(formState.cost),
    supplier: formState.supplier || undefined,
    unit: formState.unit,
    image: formState.image || undefined,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!modal) return;

    setActionLoading(true);
    setError(null);

    try {
      if (modal.type === 'create') {
        await createItem(parsePayload());
      } else {
        await updateItem(modal.item.id, parsePayload());
      }
      await loadData();
      closeModal();
    } catch (err) {
      setError((err as any)?.detail ?? (err as Error).message ?? 'Failed to save item');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (item: Item) => {
    const confirmed = window.confirm(`Delete item “${item.name}”?`);
    if (!confirmed) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      await deleteItem(item.id);
      await loadData();
    } catch (err) {
      setError((err as any)?.detail ?? (err as Error).message ?? 'Failed to delete item');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Items</h1>
            <p className="mt-2 text-sm text-slate-500">Manage items for the selected category.</p>
            <p className="mt-2 text-sm text-slate-500">Category: {categoryName}</p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Add item
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link to="/inventories" className="font-semibold text-slate-900 hover:underline">
            Inventories
          </Link>
          <span>&rsaquo;</span>
          <Link
            to={`/inventories/${invId}/categories`}
            className="font-semibold text-slate-900 hover:underline"
          >
            Categories
          </Link>
          <span>&rsaquo;</span>
          <span>{categoryName}</span>
        </div>
      </div>

      {error ? <ErrorBanner message={error} /> : null}
      {loading ? <Spinner /> : null}

      {!loading && items.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-slate-600">
          No items in this category yet. Add one to begin tracking stock.
        </div>
      ) : null}

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{item.name}</h2>
                <p className="mt-1 text-sm text-slate-500">SKU: {item.sku}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="rounded-2xl border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  disabled={actionLoading}
                  className="rounded-2xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
              <div>
                <span className="font-semibold text-slate-900">Quantity:</span> {item.quantity}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Min stock:</span> {item.min_stock}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Price:</span> ${item.price.toFixed(2)}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Cost:</span> ${item.cost.toFixed(2)}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Status:</span> {item.status}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Last updated:</span>{' '}
                {new Date(item.last_updated).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/50 px-4 py-6">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {modal.type === 'create' ? 'Create item' : 'Edit item'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {modal.type === 'create'
                    ? 'Add a new item to the category.'
                    : 'Update the selected item details.'}
                </p>
              </div>
              <button onClick={closeModal} className="text-slate-500 hover:text-slate-900">
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Name</span>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">SKU</span>
                <input
                  type="text"
                  value={formState.sku}
                  onChange={(event) => handleChange('sku', event.target.value)}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Quantity</span>
                <input
                  type="number"
                  min="0"
                  value={formState.quantity}
                  onChange={(event) => handleChange('quantity', event.target.value)}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Min stock</span>
                <input
                  type="number"
                  min="0"
                  value={formState.min_stock}
                  onChange={(event) => handleChange('min_stock', event.target.value)}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Price</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.price}
                  onChange={(event) => handleChange('price', event.target.value)}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Cost</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.cost}
                  onChange={(event) => handleChange('cost', event.target.value)}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Supplier</span>
                <input
                  type="text"
                  value={formState.supplier}
                  onChange={(event) => handleChange('supplier', event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Unit</span>
                <input
                  type="text"
                  value={formState.unit}
                  onChange={(event) => handleChange('unit', event.target.value)}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                />
              </label>
              <label className="block lg:col-span-2">
                <span className="text-sm font-medium text-slate-700">Image URL</span>
                <input
                  type="text"
                  value={formState.image}
                  onChange={(event) => handleChange('image', event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:col-span-2">
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
                    ? 'Create item'
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
