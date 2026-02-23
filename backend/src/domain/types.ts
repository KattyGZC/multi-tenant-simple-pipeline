// ─── Domain Types ─────────────────────────────────────────────────────────────

export type StageKey = 'NEW' | 'REVIEWING' | 'ACCEPTED' | 'REJECTED';
export type ActionStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface CandidateMovedEvent {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  organizationId: string;
  fromStageKey: StageKey;
  toStageKey: StageKey;
  transitionId: string;
}
