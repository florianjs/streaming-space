# JWT Authentication System

This application now uses a secure server-side authentication system with JWT tokens.

## How It Works

### 1. Server-Side Login

- User credentials are sent to `/api/auth/login`
- Server validates credentials against PocketBase
- Server generates a JWT token containing user information
- JWT token is returned to the client

### 2. Frontend Token Storage

- JWT token is stored in localStorage
- Token is automatically included in authenticated requests
- Token contains user data and expiration time

### 3. Protected Routes

- Server endpoints can use `getAuthenticatedUser(event)` to verify JWT tokens
- Frontend can use `useAuthenticatedFetch()` composable for authenticated requests
- Video streaming endpoint now requires authentication

## Security Features

- **Server-side validation**: Credentials never leave the server during validation
- **JWT tokens**: Stateless authentication with expiration
- **Automatic token verification**: Server utilities handle token validation
- **Protected endpoints**: Easy to secure API routes
- **Automatic logout**: Invalid/expired tokens trigger logout

## Environment Configuration

Set the following environment variable for production:

```bash
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Important**: Use a strong, random secret in production!

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/verify` - Verify JWT token

### Protected Endpoints

- `GET /api/protected/user-info` - Example protected endpoint
- `GET /api/video/stream` - Video streaming (requires authentication)

## Frontend Usage

### Login

```typescript
const { login } = useAuth();
const success = await login({ identity: 'email', password: 'password' });
```

### Authenticated Requests

```typescript
const { get, post } = useAuthenticatedFetch();
const userInfo = await get('/api/protected/user-info');
```

### Check Authentication Status

```typescript
const { isAuthenticated, user } = useAuth();
```

## Components

- `AdminLogin.vue` - Login form component
- `AuthTest.vue` - Authentication testing component
- `/login` page - Standalone login page
- Authentication middleware for protected routes

## Migration from Previous System

The previous system called PocketBase directly from the frontend. The new system:

1. ✅ Keeps credentials secure on the server
2. ✅ Uses standard JWT tokens
3. ✅ Provides better error handling
4. ✅ Enables proper logout functionality
5. ✅ Supports token expiration
6. ✅ Allows for easy API protection

## Testing

Visit `/admin` and go to the Analytics tab to test the authentication system with the AuthTest component.
