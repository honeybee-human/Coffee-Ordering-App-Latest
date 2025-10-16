import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { env } from './config/env';
import { apiRouter } from './routes';

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

// Global request/response logging middleware
app.use((req, res, next) => {
  const startedAt = Date.now();
  const reqId = Math.random().toString(36).slice(2);
  const meta = {
    id: reqId,
    method: req.method,
    path: req.originalUrl,
    query: req.query,
    bodyKeys: typeof req.body === 'object' ? Object.keys(req.body) : [],
  };
  console.log('[req:start]', meta);
  res.on('finish', () => {
    console.log('[req:done]', {
      ...meta,
      status: res.statusCode,
      ms: Date.now() - startedAt,
    });
  });
  next();
});

app.use('/api', apiRouter);

async function start() {
  try {
    await mongoose.connect(env.mongoUrl);
    console.log('MongoDB connected:', env.mongoUrl);

    app.listen(env.port, () => {
      console.log(`API listening on http://localhost:${env.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();