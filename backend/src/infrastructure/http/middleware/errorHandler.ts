import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation Error', details: err.errors });
    return;
  }

  if (err.message === 'Candidate not found') {
    res.status(404).json({ error: err.message });
    return;
  }

  if (err.message === 'Transition not allowed for this organization') {
    res.status(422).json({ error: err.message });
    return;
  }

  console.error('[Error]', err);
  res.status(500).json({ error: 'Internal server error' });
}
