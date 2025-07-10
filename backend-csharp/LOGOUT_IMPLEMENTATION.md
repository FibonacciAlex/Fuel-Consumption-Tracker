# Google OAuth2 Logout Implementation

This document explains the comprehensive logout implementation for the Fuel Consumption Tracker application using Google OAuth2.

## Overview

The logout implementation handles multiple aspects of user logout:

1. **JWT Token Blacklisting** - Invalidates the application's JWT tokens
2. **Google OAuth2 Token Revocation** - Revokes Google access tokens
3. **Google Account Logout** - Provides URLs for Google account logout (optional)
4. **Automatic Cleanup** - Periodically cleans up expired tokens

## When is Google Logout Redirection Needed?

### You DON'T Need Google Logout Redirection When:
- **Your app's logout is sufficient** - You've already blacklisted JWT tokens and revoked Google access tokens
- **User wants to stay logged into Google** - They might be using Google for other services (Gmail, Drive, etc.)
- **Better UX** - Redirecting to Google logout can be jarring and unnecessary
- **Personal devices** - Users typically want to stay logged into Google on their own devices

### You MIGHT Want Google Logout Redirection When:
- **Security requirements** - Strict security policies requiring complete session termination
- **Shared computers** - Public or shared devices where complete logout is necessary
- **Compliance requirements** - Certain industries require complete session termination
- **User preference** - Some users prefer to be completely logged out of everything
- **Corporate environments** - Company policies might require complete logout

## Components

### 1. JwtService Enhancements

The `JwtService` has been enhanced with token blacklisting functionality:

- `BlacklistToken(string token)` - Adds a token to the blacklist
- `IsTokenBlacklisted(string token)` - Checks if a token is blacklisted
- `CleanupExpiredTokens()` - Removes expired tokens from blacklist
- Enhanced `ValidateToken()` - Now checks blacklist before validation

### 2. GoogleAuthService

New service for handling Google OAuth2 operations:

- `RevokeGoogleTokenAsync(string accessToken)` - Revokes Google access tokens
- `GetGoogleLogoutUrl(string redirectUri)` - Generates Google logout URLs

### 3. TokenCleanupService

Background service that runs every hour to clean up expired tokens from the blacklist.

### 4. JwtBlacklistMiddleware

Middleware that checks for blacklisted tokens before processing requests.

## API Endpoints

### POST /auth/logout

Main logout endpoint that handles both JWT and Google token revocation.

**Request Body:**
```json
{
  "googleAccessToken": "optional_google_access_token",
  "logoutFromGoogle": false,
  "redirectUri": "optional_redirect_uri_after_google_logout"
}
```

**Response:**
```json
{
  "message": "Logged out successfully",
  "googleLogoutUrl": "https://accounts.google.com/logout?continue=...",
  "requiresGoogleLogout": true
}
```

**Note:** `googleLogoutUrl` will be `null` if `logoutFromGoogle` is `false` or not provided.

### GET /auth/logout/google

Returns a Google logout URL with optional redirect.

**Query Parameters:**
- `redirectUri` (optional) - URL to redirect to after Google logout

**Response:**
```json
{
  "logoutUrl": "https://accounts.google.com/logout?continue=..."
}
```

### POST /auth/logout/revoke

Revokes a specific Google access token.

**Request Body:**
```json
{
  "accessToken": "google_access_token_to_revoke"
}
```

**Response:**
```json
{
  "message": "Google token revoked successfully"
}
```

## Frontend Integration

### Basic Logout Flow (Recommended)

```javascript
// Simple logout without Google redirect
async function logout() {
  try {
    // 1. Call the logout endpoint
    const response = await fetch('/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        googleAccessToken: googleAccessToken, // if available
        logoutFromGoogle: false // Don't redirect to Google logout
      })
    });

    // 2. Remove local tokens
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('googleAccessToken');
    sessionStorage.clear();

    // 3. Redirect to login page or home
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout error:', error);
  }
}
```

### Advanced Logout Flow (When Google Logout is Needed)

```javascript
// Logout with Google redirect (for shared computers, security requirements, etc.)
async function logoutWithGoogle() {
  try {
    // 1. Call the logout endpoint
    const response = await fetch('/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        googleAccessToken: googleAccessToken,
        logoutFromGoogle: true,
        redirectUri: window.location.origin + '/login'
      })
    });

    const result = await response.json();

    // 2. Clear local storage
    localStorage.clear();
    sessionStorage.clear();

    // 3. Redirect to Google logout if required
    if (result.requiresGoogleLogout && result.googleLogoutUrl) {
      window.location.href = result.googleLogoutUrl;
    } else {
      // Fallback to local redirect
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
}
```

### Conditional Logout Based on Context

```javascript
// Smart logout that considers the context
async function smartLogout() {
  const isSharedComputer = checkIfSharedComputer(); // Your logic here
  const securityLevel = getSecurityLevel(); // Your logic here
  
  const logoutFromGoogle = isSharedComputer || securityLevel === 'high';
  
  const response = await fetch('/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      googleAccessToken: googleAccessToken,
      logoutFromGoogle: logoutFromGoogle,
      redirectUri: logoutFromGoogle ? window.location.origin + '/login' : null
    })
  });

  const result = await response.json();
  
  // Clear local storage
  localStorage.clear();
  sessionStorage.clear();
  
  // Handle redirect
  if (result.requiresGoogleLogout && result.googleLogoutUrl) {
    window.location.href = result.googleLogoutUrl;
  } else {
    window.location.href = '/login';
  }
}
```

## Security Considerations

### 1. Token Blacklisting

- JWT tokens are blacklisted immediately upon logout
- Blacklisted tokens are rejected by the middleware
- Expired tokens are automatically cleaned up

### 2. Google Token Revocation

- Google access tokens are revoked when available
- This prevents unauthorized access to Google APIs
- Handles cases where Google token revocation fails gracefully

### 3. Session Management

- All local tokens should be removed on logout
- Consider clearing cookies and session storage
- Implement proper redirect handling

### 4. When to Use Google Logout

**Use Google logout when:**
- User is on a shared/public computer
- Application has strict security requirements
- User explicitly requests complete logout
- Corporate/compliance requirements mandate it

**Don't use Google logout when:**
- User is on their personal device
- User wants to stay logged into other Google services
- Application has relaxed security requirements
- Better UX is prioritized over complete logout

## Configuration

### Required Environment Variables

```json
{
  "Authentication": {
    "Google": {
      "ClientId": "your_google_client_id",
      "ClientSecret": "your_google_client_secret"
    },
    "Jwt": {
      "Key": "your_jwt_secret_key",
      "Issuer": "your_app_issuer",
      "Audience": "your_app_audience",
      "ExpiryInMinutes": "60"
    }
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:5173"]
  }
}
```

## Error Handling

The implementation includes comprehensive error handling:

- Graceful handling of Google API failures
- Proper HTTP status codes for different scenarios
- Detailed error messages for debugging
- Fallback mechanisms when services are unavailable

## Monitoring and Logging

- Token cleanup operations are logged
- Google token revocation attempts are logged
- Failed logout attempts are tracked
- Consider implementing metrics for logout success rates

## Best Practices

1. **Always blacklist JWT tokens** - Even if Google revocation fails
2. **Clear all client-side storage** - Including localStorage and sessionStorage
3. **Handle errors gracefully** - Don't let logout failures prevent user logout
4. **Make Google logout optional** - Don't force it unless necessary
5. **Consider user context** - Personal vs shared devices
6. **Monitor logout patterns** - Track unusual logout activity
7. **Regular cleanup** - Ensure expired tokens are removed promptly

## Testing

Test the following scenarios:

1. Normal logout with both JWT and Google tokens (without Google redirect)
2. Logout with Google redirect enabled
3. Logout with only JWT token (no Google token)
4. Logout when Google API is unavailable
5. Logout with expired tokens
6. Multiple logout attempts with the same token
7. Token cleanup functionality
8. Middleware blacklist checking

## Troubleshooting

### Common Issues

1. **Google token revocation fails**
   - Check Google API credentials
   - Verify token format and validity
   - Check network connectivity

2. **JWT token still valid after logout**
   - Ensure middleware is properly configured
   - Check token blacklist implementation
   - Verify cleanup service is running

3. **Frontend not clearing tokens**
   - Check localStorage/sessionStorage clearing
   - Verify redirect handling
   - Check for JavaScript errors

4. **Unnecessary Google logout redirects**
   - Check `logoutFromGoogle` parameter
   - Verify user context and requirements
   - Consider UX implications

### Debug Steps

1. Check application logs for error messages
2. Verify Google API credentials in configuration
3. Test token blacklisting manually
4. Monitor cleanup service execution
5. Check middleware execution order
6. Review logout flow based on user context 