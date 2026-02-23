export type StageKey = 'NEW' | 'REVIEWING' | 'ACCEPTED' | 'REJECTED';

export interface Organization {
  id: string;
  name: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  stageId: string;
}

export interface Stage {
  id: string;
  key: StageKey;
  title: string;
  order: number;
  candidates: Candidate[];
}

export interface AllowedTransition {
  fromStageId: string;
  toStageId: string;
  fromStageKey: StageKey;
  toStageKey: StageKey;
  toStageTitle: string;
}

export interface Board {
  stages: Stage[];
  allowedTransitions: AllowedTransition[];
}
