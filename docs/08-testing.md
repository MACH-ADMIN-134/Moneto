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
               |   Vitest + Supertest (API/HTTP)  |
               +----------------+-----------------+
                                |
               +----------------v-----------------+
               |           UNIT TESTS             |
               |      Vitest / Zod Schemas        |
               +----------------------------------+
```

---

## 🧪 Vitest Integration Test Framework

Moneto uses **Vitest** for fast unit and integration testing.

### Test Directory Structure
```text
backend/
├── vitest.config.ts
└── src/
    └── __tests__/
        ├── health.test.ts      # Integration tests for /health, /ready, /live
        └── security.test.ts    # Integration tests for Helmet security headers
```

### Running Tests
```bash
# Run tests inside backend/
npm run test

# Run tests with code coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Continuous Integration (GitHub Actions)
Vitest tests are automatically executed during every pull request and commit push via `.github/workflows/ci.yml`.
