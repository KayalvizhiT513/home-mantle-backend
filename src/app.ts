import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// IMPORTANT: Configure dotenv BEFORE importing database module
dotenv.config();

import applianceRoutes from './routes/appliances.ts';
import maintenanceRoutes from './routes/maintenance.ts';
import serviceContactRoutes from './routes/serviceContacts.ts';
import userRoutes from './routes/users.ts';
import { errorHandler } from './middleware/errorHandler.ts';
import { testConnection } from './config/database.ts';

const app = express();
const PORT = process.env.PORT || 3001;

// Test database connection on startup
testConnection();

// Security middleware
app.use(helmet());

app.use(cors({
  origin: ['https://home-mantle.lovable.app', 'http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'ngrok-skip-browser-warning'
  ]
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/appliances', applianceRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/contacts', serviceContactRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (_req: express.Request, res: express.Response) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (_req: express.Request, res: express.Response) => {
  res.json({
    message: 'Appliance Tracker Backend API',
    version: '1.0.0',
    endpoints: {
      appliances: '/api/appliances',
      maintenance: '/api/maintenance',
      contacts: '/api/contacts',
      users: '/api/users',
      health: '/health'
    }
  });
});

// 404 handler for unknown routes
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`💾 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});

export default app;
