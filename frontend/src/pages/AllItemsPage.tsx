import { useEffect, useMemo, useState } from 'react';
import { ErrorBanner } from '../components/ErrorBanner';
import { Spinner } from '../components/Spinner';
import { getItems } from '../api';
import type { Item } from '../types';

export function AllItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setError(null);
      setLoading(true);

      try {
        setItems(await getItems());
      } catch (err) {
        setError((err as any)?.detail ?? (err as Error).message ?? 'Failed to load items');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.sku.toLowerCase().includes(search.toLowerCase()),
      ),
    [items, search],
  );

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">All items</h1>
        <p className="mt-2 text-sm text-slate-500">Search and review all inventory items across categories.</p>
      </div>

      {error ? <ErrorBanner message={error} /> : null}
      {loading ? <Spinner /> : null}

      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
        <label className="block text-sm font-medium text-slate-700">
          Search items by name or SKU
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="mt-3 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Search by name or SKU"
          />
        </label>
      </div>

      {!loading && filteredItems.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-slate-600">
          No items match your search.
        </div>
      ) : null}

      <div className="grid gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{item.name}</h2>
                <p className="mt-1 text-sm text-slate-500">SKU: {item.sku}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                {item.status}
              </span>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
              <div>
                <span className="font-semibold text-slate-900">Quantity:</span> {item.quantity}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Category ID:</span> {item.category_id}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Price:</span> ${item.price.toFixed(2)}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Cost:</span> ${item.cost.toFixed(2)}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Last updated:</span>{' '}
                {new Date(item.last_updated).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
