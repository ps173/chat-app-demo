import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { signupSchema, loginSchema } from './auth.schema';
import { signupHandler, loginHandler } from './auth.controller';

export const authRoutes = Router();

authRoutes.post('/signup', validate(signupSchema), signupHandler);
authRoutes.post('/login', validate(loginSchema), loginHandler);
