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

// CORS configuration
const allowedOrigins = [
  'http://localhost:8080',
  'https://home-mantle.lovable.app',
  process.env.FRONTEND_URL,
  /https:\/\/.*\.onrender\.com$/,
  /https:\/\/.*\.ngrok-free\.app$/
].filter(Boolean);

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      }
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browser support
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'ngrok-skip-browser-warning',
    'Access-Control-Allow-Origin'
  ],
  exposedHeaders: ['Access-Control-Allow-Origin']
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Handle preflight requests explicitly
app.options('*', (req: express.Request, res: express.Response) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, ngrok-skip-browser-warning');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

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
