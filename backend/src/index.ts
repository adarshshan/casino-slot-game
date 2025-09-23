import 'dotenv';
import http from 'http';
import { createServer } from './config/app';
import socketServer from './config/socket';
import connectDB from './config/db';
import { connectRedis } from './config/redis';

const startServer = async () => {
    // Redis Connection
    const redisClient = await connectRedis()
    // MongoDB Connection
    connectDB();

    const app = createServer(redisClient);
    const server = http.createServer(app);
    socketServer(server, redisClient);

    server.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
}

startServer();

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
    process.exit(1); // Exit with a failure code
});
