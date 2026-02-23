import { useState, useEffect } from 'react';
import { Organization } from '../types';
import { api } from '../api/client';

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getOrganizations()
      .then(setOrganizations)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Unknown error'))
      .finally(() => setLoading(false));
  }, []);

  return { organizations, loading, error };
}
