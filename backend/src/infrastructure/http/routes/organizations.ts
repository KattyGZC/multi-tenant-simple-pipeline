import { Router } from 'express';
import { getOrganizations } from '../../../application/usecases/getOrganizations';
import { getBoard } from '../../../application/usecases/getBoard';

export const organizationsRouter = Router();

// GET /organizations
organizationsRouter.get('/', async (_req, res, next) => {
  try {
    const orgs = await getOrganizations();
    res.json(orgs);
  } catch (err) {
    next(err);
  }
});

// GET /organizations/:id/board
organizationsRouter.get('/:id/board', async (req, res, next) => {
  try {
    const board = await getBoard(req.params.id);
    res.json(board);
  } catch (err) {
    next(err);
  }
});
