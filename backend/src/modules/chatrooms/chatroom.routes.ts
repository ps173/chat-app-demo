import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { createChatroomSchema, createDirectRoomSchema } from './chatroom.schema';
import {
  listChatroomsHandler,
  discoverChatroomsHandler,
  listDirectRoomsHandler,
  createChatroomHandler,
  joinChatroomHandler,
  leaveChatroomHandler,
  createDirectRoomHandler,
} from './chatroom.controller';

export const chatroomRoutes = Router();

chatroomRoutes.use(authenticate);

chatroomRoutes.get('/', listChatroomsHandler);
chatroomRoutes.get('/discover', discoverChatroomsHandler);
chatroomRoutes.get('/direct', listDirectRoomsHandler);
chatroomRoutes.post('/', validate(createChatroomSchema), createChatroomHandler);
chatroomRoutes.post('/direct', validate(createDirectRoomSchema), createDirectRoomHandler);
chatroomRoutes.post('/:roomId/join', joinChatroomHandler);
chatroomRoutes.post('/:roomId/leave', leaveChatroomHandler);
