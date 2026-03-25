import express from 'express';
import cors from 'cors';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './modules/auth/auth.routes';
import { chatroomRoutes } from './modules/chatrooms/chatroom.routes';
import { messageRoutes } from './modules/messages/message.routes';
import { userRoutes } from './modules/users/user.routes';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(cors({ origin: config.frontendOrigin }));

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/chatrooms', chatroomRoutes);
  app.use('/api/v1/chatrooms', messageRoutes);

  app.use(errorHandler);

  return app;
}
