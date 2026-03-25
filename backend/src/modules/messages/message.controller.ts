import { Request, Response, NextFunction } from 'express';
import * as messageService from './message.service';

export async function getMessagesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const roomId = req.params['roomId']!;
    const limit = Math.min(parseInt(req.query['limit'] as string ?? '50', 10), 100);
    const cursor = req.query['before'] as string | undefined;
    const result = await messageService.getMessages(roomId, limit, cursor);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
