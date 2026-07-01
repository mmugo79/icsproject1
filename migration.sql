-- RaiaVoice PostgreSQL Database Setup and Initial Seed
-- Author: Civic Accountability Team
-- Target Database: raiavoice

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE, 
  password_hash VARCHAR(255) NOT NULL,
  phone_number VARCHAR(255),
  age INTEGER,
  county VARCHAR(100),
  constituency VARCHAR(100),
  ward_area VARCHAR(255),
  profile_picture_url TEXT,
  role VARCHAR(50) NOT NULL DEFAULT 'CITIZEN',
  category_assignment TEXT, -- Stored as JSON array/string
  institution VARCHAR(255), 
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create email_verification_tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  token_or_code VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create issue_categories table
CREATE TABLE IF NOT EXISTS issue_categories (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  assigned_admin_id VARCHAR(255)
);

-- 5. Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category_id VARCHAR(100) REFERENCES issue_categories(id) ON DELETE SET NULL,
  reporter_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  county VARCHAR(100),
  constituency VARCHAR(100),
  ward_area VARCHAR(255),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  image_url TEXT,
  status VARCHAR(50) DEFAULT 'SUBMITTED',
  priority_score INTEGER DEFAULT 0,
  admin_notes TEXT,
  action_notes TEXT,
  assigned_to VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  reopened_from_report_id VARCHAR(255)
);

-- 6. Create report_supports table
CREATE TABLE IF NOT EXISTS report_supports (
  id VARCHAR(255) PRIMARY KEY,
  report_id VARCHAR(255) REFERENCES reports(id) ON DELETE CASCADE,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(report_id, user_id)
);

-- 7. Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id VARCHAR(255) PRIMARY KEY,
  report_id VARCHAR(255) REFERENCES reports(id) ON DELETE CASCADE,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Create status_history table
CREATE TABLE IF NOT EXISTS status_history (
  id VARCHAR(255) PRIMARY KEY,
  report_id VARCHAR(255) REFERENCES reports(id) ON DELETE CASCADE,
  changed_by_user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  report_id VARCHAR(255),
  message TEXT NOT NULL,
  read_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(255) PRIMARY KEY,
  actor_id VARCHAR(255),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(255),
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert public categories seed records
INSERT INTO issue_categories (id, name, assigned_admin_id) VALUES
('ROADS', 'Roads & Infrastructure', 'u-admin-roads'),
('WATER', 'Water & Sanitation', 'u-admin-water'),
('ELECTRICITY', 'Power & Electricity', 'u-admin-electricity'),
('WASTE', 'Waste Management & Environment', 'u-admin-waste')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  assigned_admin_id = EXCLUDED.assigned_admin_id;

-- Seed default public agency administrations
-- MD5/SHA256 values:
--  water.admin@raiavoice.go.ke        => WaterSecureAdmin2026!      (sha256: d079201f94d9bfe4460d3dca2f4ab2dcae08616fa1b11ce13d7124976c6bbd8b)
--  electricity.admin@raiavoice.go.ke  => ElectricSecureAdmin2026!   (sha256: ac139883bfd12f45cc37bd9f38e65e6df1dc5bdde3149df67d8cd0654ac9ca61)
--  roads.admin@raiavoice.go.ke        => RoadsSecureAdmin2026!      (sha256: bedbaad00bf27b9c9f6580af6caecf2b963acc8b4088bc8f8cbe6f7c32bf82d0)
--  waste.admin@raiavoice.go.ke        => WasteSecureAdmin2026!      (sha256: b3bc8ef025fa82cb3359cc04fc197adbeab6eb3bbaecc00f9cedfd71705e4dfa)
--  gov.admin@raiavoice.go.ke          => GovSecureAdmin2026!        (sha256: ca3b1ec27b822d645e7fcdc03b136859f71c4c9b9ec9560fbad6ebd20b5e378c)

INSERT INTO users (id, full_name, email, password_hash, role, county, institution, category_assignment, email_verified) VALUES
('u-admin-water', 'Water Admin', 'water.admin@raiavoice.go.ke', 'd079201f94d9bfe4460d3dca2f4ab2dcae08616fa1b11ce13d7124976c6bbd8b', 'ADMIN', 'Nairobi', 'Nairobi City Water and Sewerage Company', '["WATER"]', true),
('u-admin-electricity', 'Electricity Admin', 'electricity.admin@raiavoice.go.ke', 'ac139883bfd12f45cc37bd9f38e65e6df1dc5bdde3149df67d8cd0654ac9ca61', 'ADMIN', 'Nairobi', 'Kenya Power', '["ELECTRICITY"]', true),
('u-admin-roads', 'Roads Admin', 'roads.admin@raiavoice.go.ke', 'bedbaad00bf27b9c9f6580af6caecf2b963acc8b4088bc8f8cbe6f7c32bf82d0', 'ADMIN', 'Nairobi', 'Kenya National Highways Authority / KeNHA', '["ROADS"]', true),
('u-admin-waste', 'Waste Admin', 'waste.admin@raiavoice.go.ke', 'b3bc8ef025fa82cb3359cc04fc197adbeab6eb3bbaecc00f9cedfd71705e4dfa', 'ADMIN', 'Nairobi', 'National Environment Management Authority / NEMA', '["WASTE"]', true),
('u-admin-gov', 'Government Admin', 'gov.admin@raiavoice.go.ke', 'ca3b1ec27b822d645e7fcdc03b136859f71c4c9b9ec9560fbad6ebd20b5e378c', 'ADMIN', 'Nairobi', 'Government of Kenya', '["ROADS", "WATER", "ELECTRICITY", "WASTE"]', true)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  county = EXCLUDED.county,
  institution = EXCLUDED.institution,
  category_assignment = EXCLUDED.category_assignment,
  email_verified = EXCLUDED.email_verified;
