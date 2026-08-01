export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Moneto REST API Specification',
    version: '0.1.1-alpha',
    description: 'Enterprise Security-First Personal Finance Platform API documentation.',
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
        responses: {
          '200': { description: 'Service operational' },
        },
      },
    },
    '/ready': {
      get: {
        summary: 'Database Readiness Probe',
        responses: {
          '200': { description: 'Database connected and ready' },
          '503': { description: 'Database unreachable' },
        },
      },
    },
    '/live': {
      get: {
        summary: 'Process Liveness Probe',
        responses: {
          '200': { description: 'Process alive' },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register new user account',
        responses: {
          '201': { description: 'User registered' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Authenticate user credentials',
        responses: {
          '200': { description: 'Login successful' },
        },
      },
    },
  },
};
