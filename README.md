# Appliance Tracker Backend

Express.js backend API for the Appliance Management System built with PostgreSQL and Drizzle ORM.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL database

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Copy and configure the environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your database credentials:
   ```env  
   NODE_ENV=development
   PORT=3001
   DATABASE_URL=postgresql://username:password@localhost:5432/appliance_tracker
   FRONTEND_URL=http://localhost:5173
   JWT_SECRET=your-jwt-secret-key-here
   ```

3. **Database Setup**
   ```bash
   # Create database
   createdb appliance_tracker
   
   # Generate migrations
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001`

## 📡 API Endpoints

### Appliances
- `GET /api/appliances` - Get all appliances
- `POST /api/appliances` - Create appliance
- `GET /api/appliances/:id` - Get appliance by ID
- `PUT /api/appliances/:id` - Update appliance
- `DELETE /api/appliances/:id` - Delete appliance
- `GET /api/appliances/:id/maintenance` - Get maintenance tasks
- `GET /api/appliances/:id/contacts` - Get service contacts

### Maintenance Tasks
- `GET /api/maintenance` - Get all maintenance tasks
- `POST /api/maintenance` - Create maintenance task
- `GET /api/maintenance/:id` - Get maintenance task by ID
- `PUT /api/maintenance/:id` - Update maintenance task
- `DELETE /api/maintenance/:id` - Delete maintenance task

### Service Contacts
- `GET /api/contacts` - Get all service contacts
- `POST /api/contacts` - Create service contact
- `GET /api/contacts/:id` - Get service contact by ID
- `PUT /api/contacts/:id` - Update service contact
- `DELETE /api/contacts/:id` - Delete service contact

### Utility
- `GET /health` - Health check endpoint
- `GET /` - API information

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── controllers/     # API controllers
│   ├── models/          # Database schema & relations
│   ├── routes/          # Express routes
│   ├── middleware/      # Validation & error handling
│   ├── config/          # Database configuration
│   ├── utils/           # Utility functions
│   └── app.ts           # Main application
├── drizzle/            # Database migrations
├── package.json
├── tsconfig.json
├── drizzle.config.ts
└── .env
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio

## 🔧 Technologies Used

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database ORM
- **PostgreSQL** - Database
- **Zod** - Schema validation
- **date-fns** - Date manipulation
- **Helmet** - Security headers
- **CORS** - Cross-origin requests
- **Morgan** - HTTP logging

## 🔒 Features

- ✅ Full CRUD operations for all entities
- ✅ Request validation with Zod
- ✅ Automatic warranty date calculations
- ✅ Foreign key relationships with cascade deletes
- ✅ Comprehensive error handling
- ✅ CORS configuration for frontend
- ✅ Security headers with Helmet
- ✅ TypeScript throughout
- ✅ Database connection testing
- ✅ Development & production configurations

## 📝 Notes

- The backend runs independently and can work without a database connection in development mode
- All endpoints return JSON responses
- Validation errors return detailed field-level error messages
- UUIDs are used for all entity IDs
- Timestamps are automatically managed for created/updated fields

