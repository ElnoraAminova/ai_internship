-- ============================================================
--  AI Internship Matchmaker — Database Setup
--  Run this file in MySQL: mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS internship_db;
USE internship_db;

-- ─── USERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100)  NOT NULL,
    email      VARCHAR(150)  NOT NULL UNIQUE,
    password   VARCHAR(255)  NOT NULL,
    skills     JSON          DEFAULT ('[]'),
    created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── INTERNSHIPS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS internships (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(150) NOT NULL,
    company      VARCHAR(150) NOT NULL,
    requirements JSON         DEFAULT ('[]'),
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ─── MATCHES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS matches (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    user_id        INT          NOT NULL,
    internship_id  INT          NOT NULL,
    match_score    INT          DEFAULT 0,
    created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE,
    FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE,
    UNIQUE KEY unique_match (user_id, internship_id)
);

-- ─── SEED INTERNSHIPS ────────────────────────────────────────
INSERT IGNORE INTO internships (id, title, company, requirements) VALUES
(1, 'Data Analyst Intern',    'DataCorp Analytics',  '["Python", "SQL", "Excel", "Power BI"]'),
(2, 'BI Analyst Intern',      'InsightHub Co.',      '["Power BI", "SQL", "Tableau", "Excel"]'),
(3, 'SQL Developer Intern',   'DatabasePro Ltd.',    '["SQL", "Python", "Excel"]'),
(4, 'Python Developer Intern','CodeBase Technologies','["Python", "SQL"]'),
(5, 'Data Science Intern',    'AI Ventures Inc.',    '["Python", "SQL", "Tableau", "Power BI"]'),
(6, 'Tableau Analyst Intern', 'VizSolutions Group',  '["Tableau", "SQL", "Excel"]');
