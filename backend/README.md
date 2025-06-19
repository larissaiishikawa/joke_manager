# Joke Manager API

Express.js RESTful API for a Joke Management System with authentication, search, and insertion capabilities.

## Features

- **Authentication System**: JWT-based authentication with login/logout
- **Search Functionality**: Advanced search with filters and pagination
- **Joke Management**: Create, retrieve, and manage jokes
- **Security**: Rate limiting, input sanitization, and brute force protection
- **Caching**: Redis caching for improved performance
- **Logging**: Comprehensive logging with Winston

## Tech Stack

- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt
- **Cache**: Redis
- **Security**: Helmet, CORS, Rate limiting
- **Logging**: Winston

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout  
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Token verification

### Jokes
- `GET /api/jokes/search` - Search jokes with filters
- `POST /api/jokes` - Create new joke (requires auth)
- `GET /api/jokes/:id` - Get specific joke
- `GET /api/jokes` - List all jokes with pagination

### Health Check
- `GET /api/health` - API health status

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/joke_manager
JWT_SECRET=your_super_secure_jwt_secret_key
JWT_EXPIRES_IN=1h
REDIS_HOST=localhost
REDIS_PORT=6379
BCRYPT_SALT_ROUNDS=12
```

## Installation

```bash
npm install
```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting
- Input sanitization and XSS protection
- Account lockout after failed login attempts
- CORS and security headers
- NoSQL injection prevention

## Test Users

The system includes pre-seeded test users:
- admin@test.com / admin123
- user@test.com / user123
- jokemaster@test.com / jokes123

## Joke Categories

- comedy
- puns
- dad-jokes
- programming
- dark-humor
- one-liner