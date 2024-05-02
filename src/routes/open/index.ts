import express, { Router } from 'express';

import { messageRouter } from './message';

import { bookRouter } from './book';

const openRoutes: Router = express.Router();

openRoutes.use('/book', bookRouter);
openRoutes.use('/message', messageRouter);

export { openRoutes };
