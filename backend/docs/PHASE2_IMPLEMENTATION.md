# Phase 2: Database Connection & User Model Implementation

## Overview

Phase 2 establishes the database foundation and implements the User model, which is essential for all subsequent phases (Authentication, User Management, etc.).

## Architecture Decisions

### 1. Layered Architecture Pattern

```
Request → Controller → Service → Repository → Model → MongoDB
```

**Benefits:**
- **Separation of Concerns**: Each layer has a single responsibility
- **Testability**: Each layer can be tested independently
- **Reusability**: Repository pattern enables code reuse across services
- **Scalability**: Easy to add new features without modifying existing code

### 2. Repository Pattern

Implemented `BaseRepository` abstract class providing generic CRUD operations:
- `findById()`
- `findOne()`
- `find()`
- `create()`
- `findByIdAndUpdate()`
- `updateMany()`
- `findByIdAndDelete()`
- `deleteMany()`
- `count()`
- `exists()`

**UserRepository** extends BaseRepository with user-specific operations:
- `findByEmail()`
- `findByUsername()`
- `findByEmailWithPassword()` - Used during authentication
- `createUser()` - With duplicate detection
- `updateLastLogin()`
- `getUserProfile()`
- `emailExists()`
- `usernameExists()`

### 3. User Model Design

**Schema:**
```javascript
{
  username: String (unique, 3-30 chars, alphanumeric+_-)
  email: String (unique, valid email format)
  passwordHash: String (minimum 6 chars, hashed before save)
  firstName: String (optional)
  lastName: String (optional)
  isActive: Boolean (default: true)
  lastLogin: Date (default: null)
  createdAt: Date (automatic)
  updatedAt: Date (automatic)
}
```

**Mongoose Best Practices Applied:**
- ✅ Proper validation with meaningful error messages
- ✅ Indexes on frequently queried fields (email, username)
- ✅ Password hashing middleware (bcryptjs)
- ✅ Methods for common operations (comparePassword, toJSON)
- ✅ Timestamps for audit trail
- ✅ Field-level security (passwordHash excluded by default)

## Implementation Details

### Password Security

- Passwords hashed with bcryptjs (salt rounds: 10)
- Hash happens in pre-save middleware
- Password never stored in plain text
- `comparePassword()` method for authentication
- Password excluded from default queries

### Validation

**Email:**
- Must be valid email format
- Stored in lowercase for consistency
- Unique constraint enforced at database level

**Username:**
- 3-30 characters
- Alphanumeric, underscores, and hyphens only
- Unique constraint enforced

**Password:**
- Minimum 6 characters
- Hashed before storage

### Database Indexes

```javascript
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
```

**Purpose:**
- Fast lookups during login (by email or username)
- Efficient uniqueness enforcement
- Reduced query time for user searches

## Files Created

1. **src/models/User.js** (75 lines)
   - User schema definition
   - Validation rules
   - Pre-save password hashing
   - Instance methods (comparePassword, toJSON)

2. **src/repositories/BaseRepository.js** (168 lines)
   - Generic CRUD operations
   - Error handling
   - Query option support (select, limit, skip, sort, lean)

3. **src/repositories/UserRepository.js** (110 lines)
   - User-specific database operations
   - Duplicate detection
   - Profile retrieval
   - Last login updates

4. **src/utils/database.js** (78 lines)
   - Database utilities for testing
   - Collection clearing
   - User seeding functions

5. **tests/models/User.test.js** (250+ lines)
   - 16 test cases covering:
     - User creation and validation
     - Email validation and uniqueness
     - Username validation and uniqueness
     - Password hashing and comparison
     - Timestamps
     - Indexes

6. **tests/repositories/UserRepository.test.js** (220+ lines)
   - 20 test cases covering:
     - User lookup methods
     - User creation with duplicate detection
     - Last login updates
     - Profile retrieval
     - Query methods (find, count, exists)

## Files Modified

1. **src/config/database.js**
   - Added MongoDB URI validation
   - Enhanced logging with connection details

## Test Coverage

**User Model Tests (16 tests):**
- ✅ User creation with valid data
- ✅ Required field validation
- ✅ Email format validation
- ✅ Email uniqueness
- ✅ Case-insensitive email storage
- ✅ Username length validation
- ✅ Username format validation
- ✅ Username uniqueness
- ✅ Password hashing
- ✅ Password comparison (correct and incorrect)
- ✅ Password not updated on non-password changes
- ✅ JSON serialization excludes password
- ✅ Timestamp creation and updates
- ✅ Email index
- ✅ Username index

**UserRepository Tests (20 tests):**
- ✅ Find user by email (case-insensitive)
- ✅ Find user by username
- ✅ Find user with password hash
- ✅ Create user with validation
- ✅ Duplicate email detection
- ✅ Duplicate username detection
- ✅ Update last login
- ✅ Get user profile
- ✅ Email existence check with exclusion
- ✅ Username existence check
- ✅ Multiple user queries with pagination
- ✅ Sorting queries
- ✅ Count documents with filters

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test tests/models/User.test.js

# Watch mode
npm run test:watch
```

## Validation Checklist

- ✅ All validation requirements met
- ✅ Layered architecture maintained
- ✅ Production-ready code with proper error handling
- ✅ Express/Mongoose best practices applied
- ✅ Comprehensive test coverage
- ✅ Consistency with existing architecture

## Next Phase: Phase 3 - Authentication

**What will be implemented:**
- JWT-based authentication service
- Registration endpoint with validation
- Login endpoint with password verification
- Token generation and validation
- Auth middleware for protected routes
- Authentication tests

**Dependencies:**
- User Model ✅ (Phase 2)
- User Repository ✅ (Phase 2)
- JWT configuration ✅ (Already in environment.js)
- bcryptjs ✅ (Already in package.json)
