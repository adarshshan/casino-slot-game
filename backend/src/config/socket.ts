import { Socket } from "socket.io";
import jwt from 'jsonwebtoken'; // Added import

const { Server } = require("socket.io");
import { handleSpin, handleBalance, handleTransactions } from '../controllers/game.controller';
import { socketAuthMiddleware } from '../middleware/socket.auth';

function socketServer(server: any, redisClient: any) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.use(socketAuthMiddleware);

  io.on('connection', (socket: Socket) => {
    console.log('a user connected');

    // Handle re-authentication
    socket.on('auth', (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        (socket as any).userId = decoded.userId;
        console.log('Socket re-authenticated');
      } catch (error) {
        console.log('Socket re-authentication failed');
        // Optionally disconnect or send an error
        socket.emit('auth_error', { message: 'Invalid token' });
      }
    });

    handleSpin(socket, redisClient);
    handleBalance(socket);
    handleTransactions(socket);

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });


}

export default socketServer;
