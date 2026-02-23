import { useState, useEffect, useCallback } from 'react';
import { Board } from '../types';
import { api } from '../api/client';

export function useBoard(orgId: string | null) {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBoard = useCallback(() => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    api
      .getBoard(orgId)
      .then(setBoard)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Unknown error'))
      .finally(() => setLoading(false));
  }, [orgId]);

  useEffect(() => {
    setBoard(null);
    loadBoard();
  }, [loadBoard]);

  const moveCandidate = useCallback(
    async (candidateId: string, targetStageId: string) => {
      await api.moveCandidate(candidateId, targetStageId);
      loadBoard();
    },
    [loadBoard],
  );

  return { board, loading, error, moveCandidate };
}
