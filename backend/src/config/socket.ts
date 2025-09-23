import { Socket } from "socket.io";

const { Server } = require("socket.io");
import { handleSpin, handleBalance, handleTransactions } from '../controllers/game.controller';
import { socketAuthMiddleware } from '../middleware/socket.auth';

function socketServer(server: any, redisClient: any) {
  const io = new Server(server, {
    cors: {
      // origin: process.env.CORS_URL,
      origin: "*",

      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.use(socketAuthMiddleware);

  io.on('connection', (socket: Socket) => {
    console.log('a user connected');

    handleSpin(socket, redisClient);
    handleBalance(socket);
    handleTransactions(socket);

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });


}

export default socketServer;
