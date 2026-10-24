import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './models/index.js';

import authRoutes from './routes/authRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import internshipRoutes from './routes/internshipRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger for development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Real-Time Server-Sent Events (SSE) Stream
const clients = [];

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  clients.push(res);
  res.write(`data: ${JSON.stringify({ type: 'connected', time: Date.now() })}\n\n`);

  req.on('close', () => {
    const idx = clients.indexOf(res);
    if (idx !== -1) clients.splice(idx, 1);
  });
});

// Expose SSE broadcast helper via app.locals.emit
app.locals.emit = (event, payload) => {
  const data = JSON.stringify({ event, payload, timestamp: Date.now() });
  for (const client of clients) {
    try {
      client.write(`data: ${data}\n\n`);
    } catch {
      // client disconnected
    }
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// General configuration endpoint
app.get('/api/config', (req, res) => {
  res.json({
    name: 'InternDesk API',
    version: '1.0.0',
    frontendBaseUrl: '',
    payuEnabled: false,
    resumeDownloadPriceInr: 0
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Welcome Root Handler
app.get('/', (req, res) => {
  res.json({
    name: 'InternDesk API Backend',
    status: 'online',
    database: 'MySQL Connected (Sequelize)',
    frontendUrl: 'http://localhost:5174',
    endpoints: {
      health: '/api/health',
      internships: '/api/internships',
      companies: '/api/companies',
      applications: '/api/applications',
      notifications: '/api/notifications',
      filters: '/api/internships/filters'
    }
  });
});

// Favicon & Devtools handlers
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.get('/favicon.svg', (req, res) => res.status(204).end());
app.use('/.well-known', (req, res) => res.status(204).end());

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'SERVER_ERROR'
  });
});

// Start Server & Sync Database
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL Database via Sequelize.');
    await sequelize.sync({ alter: true });
    console.log('✅ Sequelize Models Synced.');
  } catch (dbErr) {
    console.error('❌ Database Connection Error:', dbErr.message);
  }

  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 InternDesk Backend running on http://localhost:${PORT}`);
    console.log(`📡 REST API endpoints active under /api/`);
    console.log(`===============================================`);
  });
}

startServer();

export default app;
