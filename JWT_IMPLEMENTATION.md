# JWT Authentication Implementation

This document describes the JWT-based authentication system implemented in the Fuel Consumption Tracker.

## Overview

The application has been migrated from session-based authentication to JWT (JSON Web Token) authentication for better scalability and statelessness.

## Backend Changes

### 1. JWT Service (`backend/src/services/jwtService.js`)
- Handles token generation and verification
- Uses environment variable `JWT_SECRET` for token signing
- Tokens expire after 24 hours by default

### 2. Authentication Middleware (`backend/src/middleware/authMiddleware.js`)
- Validates JWT tokens from Authorization headers
- Attaches user information to `req.user`
- Returns 401 for invalid or missing tokens

### 3. User Routes (`backend/src/routes/userRoute.js`)
- `/auth/user` - Get current user info (requires JWT token)
- `/auth/logout` - Logout endpoint (client-side token removal)

### 4. Main App (`backend/src/app.js`)
- Removed session middleware
- Generates JWT token after successful Google OAuth
- Redirects to frontend with token as URL parameter

## Frontend Changes

### 1. Token Storage (`frontend/src/utils/storage.js`)
- Manages JWT tokens in localStorage
- Provides methods for token CRUD operations

### 2. API Utilities (`frontend/src/utils/api.js`)
- Centralized API request handling
- Automatically includes JWT tokens in requests
- Handles 401 responses by removing invalid tokens

### 3. Login Button (`frontend/src/components/LoginButton.jsx`)
- Handles token extraction from URL after OAuth redirect
- Uses JWT tokens for authentication
- Manages user state based on token validity

## Authentication Flow

1. **Login:**
   - User clicks "Login with Google"
   - Redirected to Google OAuth
   - After successful authentication, backend generates JWT token
   - User redirected to frontend with token in URL
   - Frontend stores token in localStorage

2. **API Requests:**
   - Frontend includes JWT token in Authorization header
   - Backend validates token and extracts user information
   - If token is invalid, returns 401 and frontend removes token

3. **Logout:**
   - Frontend removes token from localStorage
   - Optionally calls logout endpoint
   - User state is reset

## Environment Variables

Add to your `.env` file:
```
JWT_SECRET=your-secret-key-here
```

## Security Considerations

1. **Token Storage:** Tokens are stored in localStorage (consider httpOnly cookies for enhanced security)
2. **Token Expiration:** Tokens expire after 24 hours
3. **Secret Key:** Use a strong, unique secret key for JWT signing
4. **HTTPS:** Always use HTTPS in production

## Benefits of JWT Authentication

1. **Stateless:** No server-side session storage required
2. **Scalable:** Works across multiple server instances
3. **Mobile-friendly:** Easy to implement in mobile apps
4. **Self-contained:** User information is embedded in the token

## Migration Notes

- Session-based authentication has been completely removed
- All API endpoints now require JWT tokens
- Frontend automatically handles token management
- Backward compatibility is not maintained 