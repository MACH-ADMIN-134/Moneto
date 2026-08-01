# 08 — Testing Strategy & Quality Assurance

## Multi-Layer Testing Architecture

```text
               +----------------------------------+
               |        END-TO-END TESTS          |
               |      Cypress / Playwright        |
               +----------------+-----------------+
                                |
               +----------------v-----------------+
               |        INTEGRATION TESTS         |
               |   Jest / Supertest (moneto_test) |
               +----------------+-----------------+
                                |
               +----------------v-----------------+
               |           UNIT TESTS             |
               |      Jest / Vitest / Zod         |
               +----------------------------------+
```

---

## 🧪 Testing Guidelines & Environments

1. **Unit Testing**:
   - Backend logic, Zod validation schemas, utility functions, and password hashing helpers.
   - Run command: `npm run test` inside `backend` or `frontend`.

2. **Integration Testing**:
   - Uses dedicated `moneto_test` database instance.
   - Cleans and re-seeds database tables between test suites.
   - Tests REST endpoints, authentication token flow, and database triggers.

3. **Static Analysis & Linting**:
   - TypeScript strict mode compliance (`noImplicitAny`, `strictNullChecks`, `exactOptionalPropertyTypes`).
   - ESLint and Prettier rules enforced in CI pipeline.
