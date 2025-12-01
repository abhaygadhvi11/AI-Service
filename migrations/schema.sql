-- PostgreSQL 17 Schema for API Service

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS api_calls CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- Settings table for configuration
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API Keys table
CREATE TABLE api_keys (
  id SERIAL PRIMARY KEY,
  apikey VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  total_calls BIGINT NOT NULL DEFAULT 0,
  used_calls BIGINT NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP,
  created_by VARCHAR(255)
);

-- API Calls/Logs table
CREATE TABLE api_calls (
  id BIGSERIAL PRIMARY KEY,
  apikey_id INTEGER NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  api_key VARCHAR(255) NOT NULL,
  endpoint VARCHAR(500) NOT NULL,
  method VARCHAR(10) NOT NULL DEFAULT 'GET',
  status_code INTEGER,
  request_body JSONB,
  response_body JSONB,
  error_message TEXT,
  ip_address VARCHAR(50),
  user_agent TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX idx_api_keys_apikey ON api_keys(apikey);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX idx_api_keys_created_at ON api_keys(created_at);
CREATE INDEX idx_api_calls_apikey_id ON api_calls(apikey_id);
CREATE INDEX idx_api_calls_api_key ON api_calls(api_key);
CREATE INDEX idx_api_calls_created_at ON api_calls(created_at);
CREATE INDEX idx_api_calls_endpoint ON api_calls(endpoint);
CREATE INDEX idx_api_calls_status_code ON api_calls(status_code);

-- Insert default settings
INSERT INTO settings (setting_key, setting_value) VALUES
  ('api_status', 'active'),
  ('rate_limit_enabled', 'true'),
  ('rate_limit_requests_per_minute', '60')
ON CONFLICT (setting_key) DO NOTHING;
