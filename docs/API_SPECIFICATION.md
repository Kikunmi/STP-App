# Auth

POST /api/auth/register
POST /api/auth/login

# Trips

GET /api/trips
GET /api/trips/:id
POST /api/trips
PUT /api/trips/:id
DELETE /api/trips/:id

# Itinerary

GET /api/trips/:tripId/itinerary
POST /api/trips/:tripId/itinerary
PUT /api/itinerary/:id
DELETE /api/itinerary/:id

# Expenses

GET /api/trips/:tripId/expenses
POST /api/trips/:tripId/expenses

# Trip Sharing

POST /api/trips/:tripId/share
GET /api/trips/:tripId/shares
DELETE /api/trips/:tripId/share/:sharedUserId
GET /api/shared-trips

# Recommendations

POST /api/recommendations/generate
