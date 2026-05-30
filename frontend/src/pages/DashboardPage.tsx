import { useEffect, useState } from 'react';
import { ErrorBanner } from '../components/ErrorBanner';
import { Spinner } from '../components/Spinner';
import { getDashboardStats } from '../api';
import type { DashboardStats } from '../types';

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setError(null);
      setLoading(true);

      try {
        setStats(await getDashboardStats());
      } catch (err) {
        setError((err as any)?.detail ?? (err as Error).message ?? 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-500">Your inventory analytics at a glance.</p>
      </div>

      {error ? <ErrorBanner message={error} /> : null}
      {loading ? <Spinner /> : null}

      {stats ? (
        <div className="grid gap-4 lg:grid-cols-4">
          {[
            { label: 'Total items', value: stats.total_items },
            { label: 'In stock', value: stats.in_stock },
            { label: 'Low stock', value: stats.low_stock },
            { label: 'Out of stock', value: stats.out_of_stock },
            { label: 'Inventory count', value: stats.inventory_count },
            { label: 'Category count', value: stats.category_count },
            { label: 'Total value', value: `$${stats.total_value.toFixed(2)}` },
            { label: 'Total cost', value: `$${stats.total_cost.toFixed(2)}` },
          ].map((metric) => (
            <div key={metric.label} className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-6">
              <p className="text-sm font-medium text-slate-500">{metric.label}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{metric.value}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
