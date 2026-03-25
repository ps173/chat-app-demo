import { Request, Response, NextFunction } from 'express';
import { searchUsersSchema } from './user.schema';
import * as userService from './user.service';
import { AppError } from '../../utils/AppError';

export async function searchUsersHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = searchUsersSchema.safeParse({ q: req.query['q'] });
    if (!result.success) {
      throw new AppError('Query must be at least 2 characters', 400);
    }
    const users = await userService.searchUsers(result.data.q, req.user!.id);
    res.json(users);
  } catch (err) {
    next(err);
  }
}
