-- Moneto Database Environment Initialization Script
-- Creates moneto_dev, moneto_test, and moneto_prod databases

CREATE DATABASE moneto_dev;
CREATE DATABASE moneto_test;
CREATE DATABASE moneto_prod;

-- Connect to moneto_dev and enable UUID / Crypto extensions
\c moneto_dev;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Connect to moneto_test and enable extensions
\c moneto_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Connect to moneto_prod and enable extensions
\c moneto_prod;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
