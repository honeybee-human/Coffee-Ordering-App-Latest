import { Router } from 'express';
import { healthRouter } from './health';
import { itemsRouter } from './items';
import { groupsRouter } from './groups';
import { ordersRouter } from './orders';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/items', itemsRouter);
apiRouter.use('/groups', groupsRouter);
apiRouter.use('/orders', ordersRouter);