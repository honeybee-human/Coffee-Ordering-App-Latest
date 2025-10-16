import { Router } from 'express';
import { healthRouter } from './health';
import { itemsRouter } from './items';
import { groupsRouter } from './groups';
import { ordersRouter } from './orders';
import { menuRouter } from './menu';
import { allergenGroupsRouter } from './allergenGroups';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/items', itemsRouter);
apiRouter.use('/groups', groupsRouter);
apiRouter.use('/orders', ordersRouter);
apiRouter.use('/menu', menuRouter);
apiRouter.use('/allergen-groups', allergenGroupsRouter);