export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Moneto REST API Specification',
    version: '0.2.0-alpha',
    description: 'Enterprise Security-First Personal Finance Platform API documentation — Sprint 1 Identity & Access Layer.',
    contact: {
      name: 'Moneto Engineering',
      email: 'kichu8005@gmail.com',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Primary API Gateway Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'System Uptime & Health Check',
        responses: { '200': { description: 'Service operational' } },
      },
    },
    '/ready': {
      get: {
        summary: 'Database Readiness Probe',
        responses: { '200': { description: 'Database connected' }, '503': { description: 'Database unavailable' } },
      },
    },
    '/live': {
      get: {
        summary: 'Process Liveness Probe',
        responses: { '200': { description: 'Process live' } },
      },
    },
    '/feature-flags': {
      get: {
        summary: 'List active environment feature flags',
        responses: { '200': { description: 'Feature flags state' } },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register new user account with Argon2id password hashing',
        responses: { '201': { description: 'User registered' }, '409': { description: 'Email duplicate' } },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Authenticate credentials and issue JWT token pair',
        responses: { '200': { description: 'Login successful' }, '401': { description: 'Invalid credentials' } },
      },
    },
    '/auth/refresh': {
      post: {
        summary: 'Rotate JWT access token and refresh token pair',
        responses: { '200': { description: 'Tokens rotated' }, '401': { description: 'Invalid token' } },
      },
    },
    '/auth/logout': {
      post: {
        summary: 'Revoke active refresh token session',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Session revoked' } },
      },
    },
    '/users/me': {
      get: {
        summary: 'Get authenticated user profile details',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Profile retrieved' } },
      },
      put: {
        summary: 'Update authenticated user profile',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Profile updated' } },
      },
    },
    '/users/me/change-password': {
      post: {
        summary: 'Change user password with Argon2id verification and session revocation',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Password changed' } },
      },
    },
    '/users/me/sessions': {
      get: {
        summary: 'List active user sessions',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Sessions listed' } },
      },
    },
    '/categories': {
      get: {
        summary: 'List user and system categories with type filter and pagination',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Categories listed' } },
      },
      post: {
        summary: 'Create custom user category',
        security: [{ bearerAuth: [] }],
        responses: { '201': { description: 'Category created' } },
      },
    },
    '/categories/{id}': {
      put: {
        summary: 'Update custom user category (system categories protected)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Category updated' }, '403': { description: 'System category protected' } },
      },
      delete: {
        summary: 'Soft-delete custom category (system categories protected)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Category deleted' } },
      },
    },
  },
};
