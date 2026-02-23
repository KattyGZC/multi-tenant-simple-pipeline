import { useState } from 'react';
import { User, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { Candidate, AllowedTransition, StageKey } from '../types';

interface Props {
  candidate: Candidate;
  allowedTransitions: AllowedTransition[];
  onMove: (candidateId: string, targetStageId: string) => Promise<void>;
}

const transitionButtonStyle: Record<StageKey, string> = {
  NEW: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  REVIEWING: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
  ACCEPTED: 'bg-green-100 text-green-700 hover:bg-green-200',
  REJECTED: 'bg-red-100 text-red-700 hover:bg-red-200',
};

export function CandidateCard({ candidate, allowedTransitions, onMove }: Props) {
  const [movingTo, setMovingTo] = useState<string | null>(null);

  const transitions = allowedTransitions.filter((t) => t.fromStageId === candidate.stageId);

  async function handleMove(targetStageId: string) {
    setMovingTo(targetStageId);
    try {
      await onMove(candidate.id, targetStageId);
    } finally {
      setMovingTo(null);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
      {/* Name */}
      <div className="flex items-center gap-2 mb-1">
        <User size={13} className="text-slate-400 shrink-0" />
        <span className="font-semibold text-slate-800 text-sm truncate">{candidate.name}</span>
      </div>

      {/* Email */}
      <div className="flex items-center gap-2 mb-3">
        <Mail size={13} className="text-slate-400 shrink-0" />
        <span className="text-xs text-slate-500 truncate">{candidate.email}</span>
      </div>

      {/* Transition buttons */}
      {transitions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {transitions.map((t) => {
            const isLoading = movingTo === t.toStageId;
            return (
              <button
                key={t.toStageId}
                onClick={() => handleMove(t.toStageId)}
                disabled={movingTo !== null}
                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${transitionButtonStyle[t.toStageKey]}`}
              >
                {isLoading ? (
                  <Loader2 size={10} className="animate-spin" />
                ) : (
                  <ArrowRight size={10} />
                )}
                {t.toStageTitle}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
