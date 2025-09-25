import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

export const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error: Token not provided'));

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        (socket as any).userId = decoded.userId;
        next();
    } catch (error) {
        next(new Error('Authentication error: Invalid token'));
    }
};
