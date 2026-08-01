-- Moneto Enterprise Initial Prisma Migration (v0.1.0-alpha)
-- Created: 2026-08-02
-- This migration represents the baseline schema for all 12 enterprise tables.

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "avatar_url" VARCHAR(512),
    "role" VARCHAR(32) NOT NULL DEFAULT 'user',
    "status" VARCHAR(32) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_status_idx" ON "users"("status");

-- 2. USER_SESSIONS TABLE
CREATE TABLE "user_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "refresh_token_hash" VARCHAR(255) NOT NULL,
    "ip_address" VARCHAR(45) NOT NULL,
    "user_agent" TEXT NOT NULL,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions"("user_id");
CREATE INDEX "user_sessions_refresh_token_hash_idx" ON "user_sessions"("refresh_token_hash");

ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 3. CATEGORIES TABLE
CREATE TABLE "categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "name" VARCHAR(64) NOT NULL,
    "type" VARCHAR(32) NOT NULL,
    "icon" VARCHAR(64) NOT NULL DEFAULT 'folder',
    "color" VARCHAR(16) NOT NULL DEFAULT '#10B981',
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "categories_user_id_type_idx" ON "categories"("user_id", "type");

ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. TRANSACTIONS TABLE
CREATE TABLE "transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "type" VARCHAR(32) NOT NULL,
    "description" TEXT,
    "transaction_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "transactions_user_id_transaction_date_idx" ON "transactions"("user_id", "transaction_date" DESC);
CREATE INDEX "transactions_category_id_idx" ON "transactions"("category_id");

ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_fkey"
    FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 5. PAYABLES TABLE
CREATE TABLE "payables" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" VARCHAR(128) NOT NULL,
    "biller_name" VARCHAR(128) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "due_date" TIMESTAMPTZ NOT NULL,
    "frequency" VARCHAR(32) NOT NULL DEFAULT 'monthly',
    "status" VARCHAR(32) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "payables_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "payables_user_id_status_idx" ON "payables"("user_id", "status");
CREATE INDEX "payables_due_date_idx" ON "payables"("due_date");

ALTER TABLE "payables" ADD CONSTRAINT "payables_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 6. PAYABLE_PAYMENTS TABLE
CREATE TABLE "payable_payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "payable_id" UUID NOT NULL,
    "transaction_id" UUID,
    "amount_paid" DECIMAL(15,2) NOT NULL,
    "payment_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payable_payments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "payable_payments_payable_id_idx" ON "payable_payments"("payable_id");

ALTER TABLE "payable_payments" ADD CONSTRAINT "payable_payments_payable_id_fkey"
    FOREIGN KEY ("payable_id") REFERENCES "payables"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payable_payments" ADD CONSTRAINT "payable_payments_transaction_id_fkey"
    FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 7. LEND_REQUESTS TABLE
CREATE TABLE "lend_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "counterparty_name" VARCHAR(128) NOT NULL,
    "counterparty_contact" VARCHAR(128),
    "type" VARCHAR(32) NOT NULL,
    "principal_amount" DECIMAL(15,2) NOT NULL,
    "interest_rate" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "due_date" TIMESTAMPTZ,
    "status" VARCHAR(32) NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "lend_requests_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "lend_requests_user_id_status_idx" ON "lend_requests"("user_id", "status");

ALTER TABLE "lend_requests" ADD CONSTRAINT "lend_requests_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 8. LEND_TRANSACTIONS TABLE
CREATE TABLE "lend_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "lend_request_id" UUID NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "type" VARCHAR(32) NOT NULL,
    "payment_date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lend_transactions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "lend_transactions_lend_request_id_idx" ON "lend_transactions"("lend_request_id");

ALTER TABLE "lend_transactions" ADD CONSTRAINT "lend_transactions_lend_request_id_fkey"
    FOREIGN KEY ("lend_request_id") REFERENCES "lend_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 9. USER_SETTINGS TABLE
CREATE TABLE "user_settings" (
    "user_id" UUID NOT NULL,
    "theme" VARCHAR(16) NOT NULL DEFAULT 'system',
    "default_currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "email_notifications" BOOLEAN NOT NULL DEFAULT true,
    "push_notifications" BOOLEAN NOT NULL DEFAULT true,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("user_id")
);

ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 10. NOTIFICATIONS TABLE
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" VARCHAR(128) NOT NULL,
    "message" TEXT NOT NULL,
    "type" VARCHAR(32) NOT NULL DEFAULT 'info',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "link" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 11. AUDIT_LOGS TABLE
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "ip_address" VARCHAR(45) NOT NULL,
    "user_agent" TEXT,
    "action" VARCHAR(64) NOT NULL,
    "resource" VARCHAR(128) NOT NULL,
    "payload" JSONB DEFAULT '{}',
    "status_code" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at" DESC);

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 12. CONNECTIONS TABLE
CREATE TABLE "connections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "provider_name" VARCHAR(64) NOT NULL,
    "account_name" VARCHAR(128) NOT NULL,
    "auth_token_encrypted" TEXT,
    "status" VARCHAR(32) NOT NULL DEFAULT 'connected',
    "last_synced_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "connections_user_id_idx" ON "connections"("user_id");

ALTER TABLE "connections" ADD CONSTRAINT "connections_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
