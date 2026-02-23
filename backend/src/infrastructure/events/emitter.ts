import { EventEmitter } from 'events';

class AppEventEmitter extends EventEmitter {}

export const appEmitter = new AppEventEmitter();

export const EVENTS = {
  CANDIDATE_MOVED: 'candidate.moved',
} as const;
