# Phase 10: Recommendation Engine Implementation

## Overview

Phase 10 adds a **Recommendation Engine** to the Smart Travel Planner App. Users can request personalised travel recommendations either by supplying a destination directly or by referencing an existing trip. Recommendations are generated using a rule-based heuristic engine and persisted to the database.

---

## Files Created

### 1. `src/models/Recommendation.js`
Mongoose model for persisted recommendations.

| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId (ref: User) | Required, indexed |
| `tripId` | ObjectId (ref: Trip) | Optional, indexed |
| `destination` | String | Required, 2–100 chars |
| `travelDates.start` | Date | Optional |
| `travelDates.end` | Date | Optional |
| `budget` | Number | Optional, ≥ 0 |
| `preferences` | [String] | Optional tags/interests |
| `recommendations` | [RecommendationItem] | Required, ≥ 1 item |
| `metadata.source` | String | `rule-based` or `trip-context` |
| `metadata.generatedAt` | Date | Generation timestamp |

**Recommendation Item sub-schema fields:** `type`, `title`, `description`, `estimatedCost`, `reason`, `score`

**Indexes:** `(userId, createdAt)`, `(tripId, userId)`, `(userId, destination)`

---

### 2. `src/repositories/RecommendationRepository.js`
Extends `BaseRepository` with recommendation-specific helpers:

- `createRecommendation(data)` – persists a new recommendation document
- `findByUser(userId, options)` – paginated retrieval by user
- `findByTrip(tripId, userId)` – retrieval by trip with optional user filter
- `findRecent(userId, limit)` – most recent recommendations for a user

---

### 3. `src/services/RecommendationService.js`
Rule-based recommendation engine. No external API dependency.

**Destination profiling** – infers environment type (beach, mountain, city, safari, historical, adventure) from destination name using keyword matching.

**Budget tiers:**
- Budget (≤ $500)
- Mid-range ($501–$2000)
- Luxury (> $2000)

**Recommendation categories generated:**
- Accommodation (budget-scaled)
- Activities (profile-specific + preference-driven)
- Restaurants
- Transport
- Attractions

**Preference-driven extras:** `food/culinary`, `photography`, `spa/wellness`, `nightlife` preferences trigger additional activity recommendations.

Results are deduplicated by title, sorted descending by score, and capped at 10 items.

**Static methods:**
- `generateFromInput(input)` – uses request body directly
- `generateFromTrip(trip, preferences)` – derives context from a persisted trip document; merges trip tags with provided preferences; sets source to `trip-context`

---

### 4. `src/controllers/RecommendationController.js`
`POST /api/recommendations/generate` handler.

**Behaviour:**
1. Extracts `userId` from JWT payload.
2. If `tripId` is supplied:
   - Fetches trip; returns 404 if not found.
   - Checks access (owner / participant / public / shared); returns 403 if denied.
   - Calls `RecommendationService.generateFromTrip`.
3. Otherwise calls `RecommendationService.generateFromInput` with the request body.
4. Persists via `RecommendationRepository.createRecommendation`.
5. Returns `201` with the saved recommendation document.

---

### 5. `src/validators/recommendationValidators.js`
`express-validator` rules exported as `generateRecommendationValidation`:

| Field | Rule |
|---|---|
| `tripId` | Optional, valid Mongo ObjectId |
| `destination` | Required when `tripId` absent; 2–100 chars |
| `startDate` | Optional, ISO 8601 |
| `endDate` | Optional, ISO 8601; must be after `startDate` |
| `budget` | Optional, float ≥ 0 |
| `preferences` | Optional, array of non-empty strings |

---

### 6. `src/routes/recommendationRoutes.js`
Middleware stack for `POST /api/recommendations/generate`:
1. `authenticateToken`
2. `generateRecommendationValidation`
3. `handleValidationErrors`
4. `RecommendationController.generateRecommendations`

---

### 7. `app.js` – Route Wiring
```js
const recommendationRoutes = require('./src/routes/recommendationRoutes');
app.use('/api', recommendationRoutes);
```

---

## API Endpoint

### `POST /api/recommendations/generate`

**Authentication:** ****** required

**Request body variants:**

_Direct destination:_
```json
{
  "destination": "Bali",
  "startDate": "2025-03-01",
  "endDate": "2025-03-08",
  "budget": 1800,
  "preferences": ["beach", "spa"]
}
```

_Trip-scoped:_
```json
{
  "tripId": "64abc123def456ghi789jkl0",
  "preferences": ["photography"]
}
```

**Success response (201):**
```json
{
  "status": "success",
  "message": "Recommendations generated successfully",
  "data": {
    "recommendation": {
      "_id": "...",
      "userId": "...",
      "tripId": null,
      "destination": "Bali",
      "travelDates": { "start": "2025-03-01T00:00:00.000Z", "end": "2025-03-08T00:00:00.000Z" },
      "budget": 1800,
      "preferences": ["beach", "spa"],
      "recommendations": [
        {
          "type": "activity",
          "title": "Snorkelling or Scuba Diving",
          "description": "...",
          "estimatedCost": 80,
          "reason": "...",
          "score": 88
        }
      ],
      "metadata": {
        "source": "rule-based",
        "generatedAt": "2025-02-15T10:00:00.000Z"
      },
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

**Error responses:**
| Status | Code | Condition |
|---|---|---|
| 400 | – | Validation failure |
| 401 | `NO_TOKEN` | Missing/invalid JWT |
| 403 | `FORBIDDEN` | Trip access denied |
| 404 | `TRIP_NOT_FOUND` | tripId does not exist |

---

## Tests (`tests/routes/recommendations.test.js`)

| Test Group | Cases |
|---|---|
| Authentication | Rejects request without JWT |
| Validation | No destination or tripId; invalid tripId format; destination too short; negative budget; endDate before startDate; non-array preferences |
| Direct destination | Generates with destination only; generates with full input; correct item shape; persists to DB; rule-based metadata source; beach destination items |
| Trip-scoped | Generates using tripId; trip-context metadata source; merges trip tags with preferences; 404 for non-existent trip; 403 for private trip; allows participant; allows public trip |

Total: **18 test cases**

---

## Architecture Alignment

- Follows controller → service → repository/model layering.
- All async operations use `asyncHandler` for consistent error propagation.
- Validation enforced via `express-validator` matching existing validator patterns.
- Response shape (`{ status, message, data }`) is consistent with all prior phases.
- No external API calls; fully self-contained rule-based fallback ensures deterministic results.
