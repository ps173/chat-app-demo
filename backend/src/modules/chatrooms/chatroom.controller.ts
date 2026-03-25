import { Request, Response, NextFunction } from 'express';
import * as chatroomService from './chatroom.service';

export async function listChatroomsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const rooms = await chatroomService.listChatrooms();
    res.json(rooms);
  } catch (err) {
    next(err);
  }
}

export async function createChatroomHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const room = await chatroomService.createChatroom(req.user!.id, req.body.roomName);
    res.status(201).json(room);
  } catch (err) {
    next(err);
  }
}

export async function joinChatroomHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await chatroomService.joinChatroom(req.user!.id, req.params['roomId']!);
    res.json({ message: 'Joined room' });
  } catch (err) {
    next(err);
  }
}

export async function leaveChatroomHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await chatroomService.leaveChatroom(req.user!.id, req.params['roomId']!);
    res.json({ message: 'Left room' });
  } catch (err) {
    next(err);
  }
}
