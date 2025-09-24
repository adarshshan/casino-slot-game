
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err: any, user: any) => {
      if (err) {
        console.log(err as Error)
        return res.sendStatus(403); // Forbidden
      }

      (req as any).user = user;
      next();
    });
  } else {
    res.sendStatus(401); // Unauthorized
  }
};
