import { useEffect, useState } from 'react';
import { Users, AlertCircle } from 'lucide-react';
import { OrganizationSwitcher } from './components/OrganizationSwitcher';
import { KanbanBoard } from './components/KanbanBoard';
import { useOrganizations } from './hooks/useOrganizations';
import { useBoard } from './hooks/useBoard';

export default function App() {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);

  const { organizations, loading: orgsLoading, error: orgsError } = useOrganizations();
  const { board, loading: boardLoading, error: boardError, moveCandidate } = useBoard(selectedOrgId);

  const selectedOrg = organizations.find((o) => o.id === selectedOrgId);

  // Auto-select first org once loaded
  useEffect(() => {
    if (organizations.length > 0 && !selectedOrgId) {
      setSelectedOrgId(organizations[0].id);
    }
  }, [organizations, selectedOrgId]);

  async function handleMove(candidateId: string, targetStageId: string) {
    setMoveError(null);
    try {
      await moveCandidate(candidateId, targetStageId);
    } catch (err) {
      setMoveError(err instanceof Error ? err.message : 'Failed to move candidate');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50 p-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-sm">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 leading-tight">
              Applicant Pipeline
            </h1>
            {selectedOrg && (
              <p className="text-sm text-slate-500">{selectedOrg.name}</p>
            )}
          </div>
        </div>

        {!orgsLoading && !orgsError && (
          <OrganizationSwitcher
            organizations={organizations}
            selectedId={selectedOrgId}
            onSelect={(id) => {
              setSelectedOrgId(id);
              setMoveError(null);
            }}
          />
        )}
      </div>

      {/* ── Error banners ───────────────────────────────────────────────────── */}
      {(orgsError || boardError || moveError) && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span>{orgsError ?? boardError ?? moveError}</span>
        </div>
      )}

      {/* ── Loading orgs ────────────────────────────────────────────────────── */}
      {orgsLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      {/* ── No org selected ─────────────────────────────────────────────────── */}
      {!orgsLoading && !selectedOrgId && (
        <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
          Select an organization to view the pipeline
        </div>
      )}

      {/* ── Board: initial load spinner (no cached data yet) ────────────────── */}
      {selectedOrgId && boardLoading && !board && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      {/* ── Kanban board (stays visible during post-move refresh) ────────────── */}
      {board && <KanbanBoard board={board} onMove={handleMove} />}

      {/* Subtle corner toast while re-fetching after a move */}
      {board && boardLoading && (
        <div className="fixed bottom-4 right-4 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-md text-sm text-slate-600 flex items-center gap-2">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600" />
          Refreshing…
        </div>
      )}
    </div>
  );
}
