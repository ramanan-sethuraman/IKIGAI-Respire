import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase, isDbConnected } from './db';
import { authRouter } from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  console.log(`[API] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRouter);

// Global Root endpoint
app.get('/api', (_req, res) => {
  res.json({
    app: 'RESPIRE Climate Resilience Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/api/auth/health',
      login: 'POST /api/auth/login',
      users: 'GET /api/auth/users',
      logs: 'GET /api/auth/logs',
    },
    database: {
      connected: isDbConnected(),
      cluster: 'cluster28.uiwd4et.mongodb.net',
    },
  });
});

// Start Server & Connect MongoDB
async function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`🚀 [RESPIRE Backend Server] Running on http://localhost:${PORT}`);
  });

  // Attempt database connection asynchronously
  console.log('🔄 [MongoDB] Initiating connection to MongoDB Atlas Cluster (cluster28.uiwd4et.mongodb.net)...');
  await connectToDatabase();

  // Graceful termination
  const shutdown = () => {
    console.log('\n🛑 Shutting down server...');
    server.close(() => {
      console.log('Server terminated.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer();
