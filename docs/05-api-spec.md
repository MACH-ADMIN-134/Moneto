# 05 — REST API Specification (/api/v1)

## Global Response Format

All Moneto API responses follow a unified JSON envelope:

### Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": {},
  "meta": {
    "timestamp": "2026-08-02T00:00:00.000Z",
    "requestId": "req_8f9a2b1c"
  }
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "error": "Validation Error",
  "message": "Invalid email address format",
  "details": [
    {
      "field": "email",
      "message": "Email must be a valid RFC 5322 address"
    }
  ],
  "meta": {
    "timestamp": "2026-08-02T00:00:00.000Z"
  }
}
```

---

## 🛠 Endpoint Directory Matrix (Sprint 1 Complete)

| Module | Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :---: | :--- |
| **Common** | `GET` | `/api/v1/health` | No | System health monitor |
| **Common** | `GET` | `/api/v1/ready` | No | Database readiness probe |
| **Common** | `GET` | `/api/v1/live` | No | Process liveness probe |
| **Common** | `GET` | `/api/v1/docs` | No | Interactive Swagger UI |
| **Flags** | `GET` | `/api/v1/feature-flags` | No | Centralized feature flags state |
| **Auth** | `POST` | `/api/v1/auth/register` | No | Register account (Argon2id) |
| **Auth** | `POST` | `/api/v1/auth/login` | No | Authenticate & issue token pair |
| **Auth** | `POST` | `/api/v1/auth/refresh` | Yes (Refresh) | Rotate access & refresh tokens |
| **Auth** | `POST` | `/api/v1/auth/logout` | Yes | Revoke active refresh session |
| **Users** | `GET` | `/api/v1/users/me` | Yes | Get authenticated user profile |
| **Users** | `PUT` | `/api/v1/users/me` | Yes | Update profile details |
| **Users** | `POST` | `/api/v1/users/me/change-password` | Yes | Change password (Argon2id) |
| **Users** | `PUT` | `/api/v1/users/me/preferences` | Yes | Update theme/currency settings |
| **Users** | `GET` | `/api/v1/users/me/sessions` | Yes | List active non-revoked sessions |
| **Users** | `POST` | `/api/v1/users/me/sessions/revoke-all` | Yes | Revoke all active user sessions |
| **Categories**|`GET` | `/api/v1/categories` | Yes | List categories (system + custom) |
| **Categories**|`POST`| `/api/v1/categories` | Yes | Create custom category |
| **Categories**|`PUT` | `/api/v1/categories/:id` | Yes | Update custom category |
| **Categories**|`DELETE`|`/api/v1/categories/:id` | Yes | Soft-delete custom category |
