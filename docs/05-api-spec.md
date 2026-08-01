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

## 🛠 Endpoint Directory Matrix

| Module | Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :---: | :--- |
| **Common** | `GET` | `/api/v1/health` | No | System health monitor |
| **Auth** | `POST` | `/api/v1/auth/register` | No | Register new user account |
| **Auth** | `POST` | `/api/v1/auth/login` | No | Authenticate & issue token pair |
| **Auth** | `POST` | `/api/v1/auth/refresh` | Yes (Refresh) | Rotate access & refresh tokens |
| **Auth** | `POST` | `/api/v1/auth/logout` | Yes | Revoke active session |
| **Users** | `GET` | `/api/v1/users/me` | Yes | Get authenticated user profile |
| **Users** | `PUT` | `/api/v1/users/me` | Yes | Update profile details |
| **Dashboard**| `GET` | `/api/v1/dashboard/summary` | Yes | Financial overview KPIs |
| **Categories**|`GET` | `/api/v1/categories` | Yes | List transaction categories |
| **Transactions**|`GET`| `/api/v1/transactions` | Yes | Search & paginate transactions |
| **Transactions**|`POST`| `/api/v1/transactions` | Yes | Log new financial transaction |
| **Payables** | `GET` | `/api/v1/payables` | Yes | List active bill payables |
| **Lending** | `GET` | `/api/v1/lending` | Yes | List peer lend records |
| **Settings** | `GET` | `/api/v1/settings` | Yes | Get user preference config |
| **Notifications**|`GET`| `/api/v1/notifications` | Yes | List unread user alerts |
