
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  console.log('req.headers.authorization...')
  console.log(req.headers.authorization)
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_ADMIN_SECRET || 'admin_jwt_secret', (err: any, user: any) => {
      if (err) {
        return res.sendStatus(403); // Forbidden
      }

      if (user.role === 'admin') {
        (req as any).user = user;
        next();
      } else {
        res.sendStatus(403); // Forbidden
      }
    });
  } else {
    console.log('its hitting here...')
    res.sendStatus(401); // Unauthorized
  }
};
