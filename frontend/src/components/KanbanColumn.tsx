import type { ReactNode } from 'react';
import { ClipboardList, Search, CheckCircle2, XCircle } from 'lucide-react';
import { Stage, AllowedTransition, StageKey } from '../types';
import { CandidateCard } from './CandidateCard';

interface Props {
  stage: Stage;
  allowedTransitions: AllowedTransition[];
  onMove: (candidateId: string, targetStageId: string) => Promise<void>;
}

const stageConfig: Record<StageKey, { bar: string; icon: ReactNode; label: string }> = {
  NEW: { bar: 'bg-blue-500', icon: <ClipboardList size={15} />, label: 'text-blue-600' },
  REVIEWING: { bar: 'bg-amber-500', icon: <Search size={15} />, label: 'text-amber-600' },
  ACCEPTED: { bar: 'bg-green-500', icon: <CheckCircle2 size={15} />, label: 'text-green-600' },
  REJECTED: { bar: 'bg-red-500', icon: <XCircle size={15} />, label: 'text-red-600' },
};

export function KanbanColumn({ stage, allowedTransitions, onMove }: Props) {
  const cfg = stageConfig[stage.key];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col w-72 shrink-0">
      {/* Header */}
      <div className="px-4 pt-4 pb-0">
        <div className="flex items-center gap-2 mb-2">
          <span className={cfg.label}>{cfg.icon}</span>
          <h3 className={`font-bold text-xs tracking-widest uppercase ${cfg.label}`}>
            {stage.title}
          </h3>
          <span className="ml-auto bg-slate-100 text-slate-500 text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
            {stage.candidates.length}
          </span>
        </div>
        {/* Colored divider */}
        <div className={`h-0.5 w-full ${cfg.bar} rounded-full mb-4`} />
      </div>

      {/* Cards */}
      <div className="px-4 pb-4 flex flex-col gap-3 flex-1 overflow-y-auto">
        {stage.candidates.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12 text-slate-300 text-sm">
            No candidates
          </div>
        ) : (
          stage.candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              allowedTransitions={allowedTransitions}
              onMove={onMove}
            />
          ))
        )}
      </div>
    </div>
  );
}
