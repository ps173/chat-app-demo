import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { searchUsersHandler } from './user.controller';

export const userRoutes = Router();

userRoutes.use(authenticate);
userRoutes.get('/search', searchUsersHandler);
