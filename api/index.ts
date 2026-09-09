import express from 'express';
import cors from 'cors';
import { authRouter } from '../server/routes/auth';
import { connectToDatabase, isDbConnected } from '../server/db';

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas on serverless start
connectToDatabase().catch((err) => {
  console.warn('[Vercel Serverless MongoDB] Connection notice:', err);
});

// Mount routes
app.use('/api/auth', authRouter);

app.get('/api', (_req, res) => {
  res.json({
    app: 'RESPIRE Climate Resilience Platform API (Vercel Serverless)',
    version: '1.0.0',
    database: {
      connected: isDbConnected(),
      cluster: 'cluster28.uiwd4et.mongodb.net',
    },
  });
});

export default app;
