import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { createChatroomSchema } from './chatroom.schema';
import {
  listChatroomsHandler,
  createChatroomHandler,
  joinChatroomHandler,
  leaveChatroomHandler,
} from './chatroom.controller';

export const chatroomRoutes = Router();

chatroomRoutes.use(authenticate);

chatroomRoutes.get('/', listChatroomsHandler);
chatroomRoutes.post('/', validate(createChatroomSchema), createChatroomHandler);
chatroomRoutes.post('/:roomId/join', joinChatroomHandler);
chatroomRoutes.post('/:roomId/leave', leaveChatroomHandler);
