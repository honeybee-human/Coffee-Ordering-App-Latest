import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (req, res) => {
  console.log('[health] GET /api/health start');
  res.json({ status: 'ok' });
  console.log('[health] GET /api/health success');
});