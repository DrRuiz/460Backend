import express, { Router } from 'express';

import { adminBookRouter } from './adminBook';

const closedRoutes: Router = express.Router();

closedRoutes.use('/adminBook', adminBookRouter);

export { closedRoutes };
