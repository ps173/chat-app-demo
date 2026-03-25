import { Request, Response, NextFunction } from 'express';
import * as chatroomService from './chatroom.service';

export async function listChatroomsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const rooms = await chatroomService.listChatrooms(req.user!.id);
    res.json(rooms);
  } catch (err) {
    next(err);
  }
}

export async function discoverChatroomsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const search = typeof req.query['search'] === 'string' ? req.query['search'] : undefined;
    const rooms = await chatroomService.discoverChatrooms(req.user!.id, search);
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

export async function listDirectRoomsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const rooms = await chatroomService.listDirectRooms(req.user!.id);
    res.json(rooms);
  } catch (err) {
    next(err);
  }
}

export async function createDirectRoomHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const room = await chatroomService.findOrCreateDirectRoom(req.user!.id, req.body.targetUserId);
    res.status(200).json(room);
  } catch (err) {
    next(err);
  }
}
