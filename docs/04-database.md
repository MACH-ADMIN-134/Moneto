# 04 — Database Schema & Data Governance

## Database Environments
Moneto uses three isolated database instances:
- `moneto_dev`: Used for local feature development and hot-reloading.
- `moneto_test`: Isolated database for running unit and integration testing suites without side effects.
- `moneto_prod`: Production database with strict backup and access policies.

---

## 🗄 ORM Layer: Prisma

Moneto uses **Prisma ORM v5** for all database access, type-safe query execution, schema migration management, and development tooling.

### Schema Location
```
backend/
└── prisma/
    ├── schema.prisma              # Master schema with all 12 models
    ├── seed.ts                    # Idempotent category seed script
    └── migrations/
        ├── migration_lock.toml    # Prisma migration lock (do not edit)
        └── 20260802000000_init_prisma_schema/
            └── migration.sql      # Baseline migration for all tables
```

### Environment Variables
```env
DATABASE_URL="postgresql://moneto_admin:<password>@localhost:5432/moneto_dev?schema=public"
DIRECT_URL="postgresql://moneto_admin:<password>@localhost:5432/moneto_dev?schema=public"
```

### Migration Workflow Commands

| Action | Command | Context |
| :--- | :--- | :--- |
| Generate Prisma Client | `npm run prisma:generate` | After schema changes |
| Create new migration | `npm run prisma:migrate` | During development |
| Apply all pending migrations | `npm run prisma:deploy` | CI/CD & production |
| Reset database (dev only) | `npm run prisma:reset` | Local dev reset |
| Run seed script | `npm run prisma:seed` | After migration or reset |
| Open Prisma Studio | `npm run prisma:studio` | DB GUI at localhost:5555 |

> [!IMPORTANT]
> **All future schema changes must go through `npx prisma migrate dev`**. Direct SQL edits to the database should be avoided in favor of migration files.

---

## 🏗 Entity Relationship Model & Table Specifications

The database schema consists of **12 core enterprise tables**, all mapped 1:1 to Prisma models via `@map` annotations:

```text
User ──< UserSession
User ──< UserSetting         (1:1)
User ──< Category ──< Transaction
User ──< Payable ──< PayablePayment
User ──< LendRequest ──< LendTransaction
User ──< Notification
User ──< AuditLog
User ──< Connection
Transaction ─< PayablePayment
```

### Table & Model Directory

| Prisma Model | SQL Table | UUID PK | Soft Delete | Timestamps |
| :--- | :--- | :---: | :---: | :---: |
| `User` | `users` | ✅ | ✅ | ✅ |
| `UserSession` | `user_sessions` | ✅ | ❌ | ✅ |
| `Category` | `categories` | ✅ | ✅ | ✅ |
| `Transaction` | `transactions` | ✅ | ✅ | ✅ |
| `Payable` | `payables` | ✅ | ✅ | ✅ |
| `PayablePayment` | `payable_payments` | ✅ | ❌ | `createdAt` only |
| `LendRequest` | `lend_requests` | ✅ | ✅ | ✅ |
| `LendTransaction` | `lend_transactions` | ✅ | ❌ | `createdAt` only |
| `UserSetting` | `user_settings` | User PK | ❌ | `updatedAt` only |
| `Notification` | `notifications` | ✅ | ❌ | `createdAt` only |
| `AuditLog` | `audit_logs` | ✅ | ❌ | `createdAt` only |
| `Connection` | `connections` | ✅ | ✅ | ✅ |

---

## 🔒 Data Integrity & Soft Deletes
- **Primary Keys**: All tables use UUIDv4 via PostgreSQL `gen_random_uuid()`.
- **Timestamps**: All temporal fields stored as `TIMESTAMPTZ` (UTC) using `@db.Timestamptz()`.
- **Soft Deletions**: Financial tables carry `deleted_at TIMESTAMPTZ?` (Prisma: `deletedAt DateTime?`). Hard deletes are prohibited on financial ledgers.
- **Foreign Keys**: All relationships enforced with `onDelete: Cascade`, `Restrict`, or `SetNull` as appropriate to business rules.
