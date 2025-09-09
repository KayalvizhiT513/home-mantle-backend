import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
// IMPORTANT: Configure dotenv BEFORE importing database module
dotenv.config();
import applianceRoutes from './routes/appliances.js';
import maintenanceRoutes from './routes/maintenance.js';
import serviceContactRoutes from './routes/serviceContacts.js';
import { errorHandler } from './middleware/errorHandler.js';
import { testConnection } from './config/database.js';
const app = express();
const PORT = process.env.PORT || 3001;
// Test database connection on startup
testConnection();
// Security middleware
app.use(helmet());
// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
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
// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});
// Root endpoint
app.get('/', (_req, res) => {
    res.json({
        message: 'Appliance Tracker Backend API',
        version: '1.0.0',
        endpoints: {
            appliances: '/api/appliances',
            maintenance: '/api/maintenance',
            contacts: '/api/contacts',
            health: '/health'
        }
    });
});
// 404 handler for unknown routes
app.use('*', (req, res) => {
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
