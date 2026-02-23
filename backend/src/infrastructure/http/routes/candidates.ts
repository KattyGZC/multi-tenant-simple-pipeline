import { Router } from 'express';
import { moveCandidate } from '../../../application/usecases/moveCandidate';

export const candidatesRouter = Router();

// PATCH /candidates/:id/move
candidatesRouter.patch('/:id/move', async (req, res, next) => {
  try {
    const updated = await moveCandidate(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});
