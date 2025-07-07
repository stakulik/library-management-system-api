# Library Management System API

A comprehensive RESTful API for managing a library system built with NestJS, Prisma, and PostgreSQL. This system provides full functionality for managing users, authors, books, and reservations with robust authentication and authorization.

## Key Features

### Authentication & Authorization
- **JWT-based authentication** with access and refresh tokens
- **Role-based access control** (USER/ADMIN)
- **Secure password hashing** with bcrypt
- **Token refresh mechanism** for seamless user experience

### User Management
- User registration and profile management
- Email-based user identification
- Admin user management with full CRUD operations
- User roles and permissions

### Library Resources
- **Authors**: Complete author management with CRUD operations
- **Books**: Book catalog with author relationships and detailed information
- **Reservations**: Book reservation system with status tracking

### Advanced Features
- **Cursor-based pagination** for efficient data retrieval
- **Database indexing** for optimized performance
- **Comprehensive validation** using class-validator
- **Type-safe database operations** with Prisma ORM

## Technology Stack

### Backend Framework
- **NestJS**: Modern Node.js framework with TypeScript
- **TypeScript**: Static typing for enhanced developer experience
- **Prisma ORM**: Next-generation database toolkit

### Database
- **PostgreSQL**: Robust relational database
- **Database migrations**: Version-controlled schema changes
- **Database indexing**: Optimized query performance

### Security
- **JWT**: JSON Web Tokens for stateless authentication
- **bcrypt**: Password hashing and verification
- **Passport.js**: Authentication middleware

### Testing
- **Jest**: Comprehensive testing framework
- **Fishery**: Factory pattern for test data generation
- **Database isolation**: Proper test environment setup

### Development Tools
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Docker Compose**: Containerized development environment

## Database Schema

### Core Entities

```sql
Users
id (Primary Key)
email (Unique)
firstName
lastName
password (Hashed)
refreshToken
role (USER/ADMIN)
timestamps

Authors
id (Primary Key)
firstName
lastName
timestamps

Books
id (Primary Key)
title
description
authorId (Foreign Key)
timestamps

Reservations
id (Primary Key)
status (PENDING/APPROVED/REJECTED/RETURNED)
reservedAt
dueDate
returnedAt
bookId (Foreign Key)
userId (Foreign Key)
timestamps
```

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh tokens
- `GET /auth/profile` - Get user profile
- `POST /auth/logout` - User logout

### Users (Admin only)
- `GET /users` - List all users (paginated)
- `GET /users/:id` - Get user by ID
- `DELETE /users/:id` - Delete user

### Authors
- `GET /authors` - List all authors (paginated)
- `GET /authors/:id` - Get author by ID
- `POST /authors` - Create author (Admin only)
- `DELETE /authors/:id` - Delete author (Admin only)

### Books
- `GET /books` - List all books (paginated)
- `GET /books/:id` - Get book by ID
- `POST /books` - Create book (Admin only)
- `DELETE /books/:id` - Delete book (Admin only)

### Reservations
- `GET /reservations` - List all reservations (Admin only)
- `GET /reservations/my` - List user's reservations
- `POST /reservations` - Create reservation
- `PUT /reservations/:id/status` - Update reservation status
- `DELETE /reservations/:id` - Delete reservation

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Docker & Docker Compose (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd library-management-system-api
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   cp .env.test.example .env.test
   ```

4. **Database setup**
   ```bash
   # Start PostgreSQL with Docker
   docker-compose up -d
   
   # Run migrations
   yarn db:migrate
   
   # Seed database (optional)
   yarn db:seed
   ```

5. **Start the application**
   ```bash
   # Development
   yarn start:dev
   
   # Production
   yarn build
   yarn start:prod
   ```

## Testing

The project includes comprehensive testing with 92 test cases covering all major functionality.

### Test Categories
- **Unit Tests**: Service and controller layer testing
- **Integration Tests**: Database integration with real Prisma client
- **Authentication Tests**: JWT token handling and security
- **Pagination Tests**: Cursor-based pagination functionality

### Running Tests
```bash
# Run all tests
yarn test

# Watch mode
yarn test:watch

# Coverage report
yarn test:cov

# Test database setup
yarn test:db:recreate
```

### Test Infrastructure
- **Factory Pattern**: Consistent test data generation
- **Database Cleanup**: Isolated test environment
- **Sequence Reset**: Proper ID management between tests
- **Serial Execution**: Prevents database conflicts

## Development Commands

```bash
# Database operations
yarn db:migrate           # Run database migrations
yarn db:migrate:reset     # Reset database
yarn db:seed              # Seed database with sample data

# Development
yarn start:dev            # Start in development mode
yarn start:debug          # Start with debugger
yarn lint                 # Lint and fix code
yarn format               # Format code with Prettier

# Testing
yarn test                 # Run all tests
yarn test:e2e             # Run end-to-end tests
yarn test:db:recreate     # Recreate test database

# Build
yarn build                # Build for production
```

## Architecture

### Modular Structure
```
src/
  auth/           # Authentication module
  users/          # User management
  authors/        # Author management  
  books/          # Book catalog
  reservations/   # Reservation system
  shared/         # Shared utilities
  common/         # Common guards/decorators
  prisma/         # Database service
```

### Design Patterns
- **Module Pattern**: Feature-based organization
- **Repository Pattern**: Database abstraction with Prisma
- **Factory Pattern**: Test data generation
- **Decorator Pattern**: Custom decorators for roles
- **Guard Pattern**: Route protection and authorization

## Security Features

- **Password Encryption**: bcrypt with salt rounds
- **JWT Security**: Access and refresh token strategy
- **Input Validation**: Comprehensive DTO validation
- **SQL Injection Prevention**: Prisma ORM protection
- **Role-based Access**: Admin/User permission system

## Performance Optimizations

- **Database Indexing**: Strategic indexes on foreign keys
- **Cursor Pagination**: Efficient large dataset handling
- **Connection Pooling**: Optimized database connections
- **Lazy Loading**: Efficient relationship loading
