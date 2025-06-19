# Joke Manager API

Express.js RESTful API for Joke Management System with authentication, search, and insertion capabilities.

## Features

- JWT Authentication with brute force protection
- Advanced search functionality with caching
- Joke insertion with validation and duplicate prevention
- Security measures against injection attacks
- Redis caching for performance optimization
- Comprehensive logging and error handling

## Tech Stack

- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt
- **Caching**: Redis
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate limiting

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Token verification

### Jokes
- `GET /api/jokes/search` - Search jokes with filters
- `POST /api/jokes` - Create new joke (authenticated)
- `GET /api/jokes/:id` - Get specific joke
- `GET /api/jokes` - Get jokes list with pagination

### Health Check
- `GET /api/health` - API health status

## Environment Variables

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/joke_manager
JWT_SECRET=your_secure_secret_key
JWT_EXPIRES_IN=1h
REDIS_HOST=localhost
REDIS_PORT=6379
BCRYPT_SALT_ROUNDS=12
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env` file

3. Start MongoDB and Redis services

4. Run the application:
```bash
npm run dev
```

## Test Users

- `admin@test.com` / `admin123`
- `user@test.com` / `user123`
- `jokemaster@test.com` / `jokes123`

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting on sensitive endpoints
- Input sanitization and XSS prevention
- NoSQL injection protection
- Account lockout after failed login attempts
- Security headers with Helmet.js

## Performance Optimizations

- Redis caching for search results and user sessions
- Database indexing on search fields
- Connection pooling for MongoDB
- Response compression with Gzip
- Optimized database queries with pagination
