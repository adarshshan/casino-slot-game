
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err: any, user: any) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(401).json({ message: 'Unauthorized' });
      }

      (req as any).user = user;
      next();
    });
  } else {
    res.sendStatus(401); // Unauthorized
  }
};
