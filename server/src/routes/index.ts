import { Router } from 'express';

import authRouter from './auth';
import deviceRouter from './device';
import healthRouter from './health';
import resolverRouter from './resolver';
import ssrRouter from './ssr';
// import staticRouter from './static';
import usersRouter from './users';

const router = Router();

router.use(healthRouter);
router.use(deviceRouter);
router.use(usersRouter);
router.use(authRouter);
router.use(resolverRouter);
router.use(ssrRouter);
// you can use it for development
// router.use(staticRouter);

export default router;
