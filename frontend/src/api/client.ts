import { Board, Organization } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((body as { error?: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getOrganizations(): Promise<Organization[]> {
    return request('/organizations');
  },

  getBoard(orgId: string): Promise<Board> {
    return request(`/organizations/${orgId}/board`);
  },

  moveCandidate(candidateId: string, targetStageId: string, note?: string): Promise<unknown> {
    return request(`/candidates/${candidateId}/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetStageId, note }),
    });
  },
};
