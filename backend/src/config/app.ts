import express, { Application } from "express";
import cors from 'cors'
import authRoutes from '../routes/auth.routes';
import adminRoutes from '../routes/admin.routes';
import userRoutes from '../routes/user.routes';

const corsOptions = {
  origin: process.env.CORS_URL,
  // origin: '*',
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization',
  optionsSuccessStatus: 200
};

export const createServer = (redisClient: any) => {
  try {
    const app: Application | undefined = express()

    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.use(cors(corsOptions));

    app.use((req, res, next) => {
      (req as any).redis = redisClient;
      next();
    });

    app.use('/api/auth', authRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/users', userRoutes);

    return app;

  } catch (error) {
    console.log(error);
    console.log('error caught from app.ts');
  }
}