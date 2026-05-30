import { useEffect, useState } from 'react';
import { getMe } from '../api';
import type { User } from '../types';

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        setUser(await getMe());
      } catch (err) {
        setError((err as any)?.detail ?? (err as Error).message ?? 'Unable to load user');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { user, loading, error };
}
