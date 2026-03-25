import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { getMessagesHandler } from './message.controller';

export const messageRoutes = Router();

messageRoutes.use(authenticate);
messageRoutes.get('/:roomId/messages', getMessagesHandler);
