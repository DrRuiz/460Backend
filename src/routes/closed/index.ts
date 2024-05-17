import express, { Router } from 'express';

import { checkToken } from '../../core/middleware';
import { adminBookRouter } from './adminBook';

const closedRoutes: Router = express.Router();

closedRoutes.use('/adminBook', checkToken, adminBookRouter);

export { closedRoutes };
