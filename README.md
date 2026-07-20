# Smart Travel Planner & Itinerary Builder API

A comprehensive travel planning platform API built with Node.js, Express, and MongoDB.

## Features

- User authentication and registration with JWT
- Trip management (CRUD operations)
- Itinerary building and management
- Expense tracking
- Favorite destinations
- Trip sharing
- Smart recommendations (AI-powered)

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT
- **Testing:** Mocha, Chai, Supertest
- **Security:** Helmet, CORS, bcryptjs

## Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB Atlas account or local MongoDB instance

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Kikunmi/Smart-Travel-Planner-App.git
cd Smart-Travel-Planner-App
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from template:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Testing
```bash
npm test
```

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Authentication (Phase 3)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Trips (Phase 5)
- `GET /api/trips` - Get all user trips
- `GET /api/trips/:id` - Get trip details
- `POST /api/trips` - Create new trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip

### Itinerary (Phase 6)
- `GET /api/trips/:tripId/itinerary` - Get itinerary
- `POST /api/trips/:tripId/itinerary` - Add activity
- `PUT /api/itinerary/:id` - Update activity
- `DELETE /api/itinerary/:id` - Delete activity

### Expenses (Phase 7)
- `GET /api/trips/:tripId/expenses` - Get expenses
- `POST /api/trips/:tripId/expenses` - Add expense

### Recommendations (Phase 10)
- `POST /api/recommendations/generate` - Generate recommendations

## Development Roadmap

- Phase 1: ✅ Project Setup
- Phase 2: Database Connection
- Phase 3: Authentication
- Phase 4: User Management
- Phase 5: Trip CRUD
- Phase 6: Itinerary CRUD
- Phase 7: Expense Tracking
- Phase 8: Favorite Destinations
- Phase 9: Trip Sharing
- Phase 10: Recommendation Engine
- Phase 11: Validation
- Phase 12: Testing
- Phase 13: Deployment

## Architecture

```
Frontend
  |
  v
REST API (Express)
  |
  v
Controllers (Request Validation)
  |
  v
Services (Business Logic)
  |
  v
Models (Database Operations)
  |
  v
MongoDB Atlas
```

## Error Handling

All endpoints return standardized responses:

**Success:**
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": {}
}
```

**Error:**
```json
{
  "status": "error",
  "message": "Error description"
}
```

## License

MIT License - see LICENSE file
