CREATE DATABASE IF NOT EXISTS margin_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE margin_ai;

-- ── 1. USERS (with full profile + avatar) ──────────
-- avatar_url stores path like /avatars/1_abc123.jpg
-- onboarded = 0 means user hasn't set income/savings yet → show onboarding
-- onboarded = 1 means setup complete → show dashboard
CREATE TABLE IF NOT EXISTS users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    avatar_url      VARCHAR(500) NULL        COMMENT 'Stored as /avatars/filename.jpg',
    phone           VARCHAR(15) NULL,
    city            VARCHAR(100) NULL,
    occupation      VARCHAR(100) NULL,
    bio             TEXT NULL,
    monthly_income  DECIMAL(10,2) DEFAULT 0.00,
    savings_target  DECIMAL(10,2) DEFAULT 0.00,
    currency        VARCHAR(3) DEFAULT 'INR',
    onboarded       TINYINT(1) DEFAULT 0     COMMENT '0=needs setup, 1=fully onboarded',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── 2. CATEGORIES ──────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50) NOT NULL,
    icon        VARCHAR(10),
    color_hex   VARCHAR(7),
    is_default  BOOLEAN DEFAULT TRUE
);

-- ── 3. TRANSACTIONS ────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    amount          DECIMAL(10,2) NOT NULL,
    merchant        VARCHAR(150),
    category_id     INT,
    payment_method  ENUM('UPI','NEFT','Card','Cash','Auto-debit','Other') DEFAULT 'UPI',
    txn_date        DATE NOT NULL,
    is_recurring    BOOLEAN DEFAULT FALSE,
    note            TEXT,
    source          ENUM('manual','sms','import') DEFAULT 'manual',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    INDEX idx_user_date (user_id, txn_date),
    INDEX idx_cat       (category_id)
);

-- ── 4. GOALS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS goals (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    title           VARCHAR(100) NOT NULL,
    target_amount   DECIMAL(10,2) NOT NULL,
    saved_amount    DECIMAL(10,2) DEFAULT 0.00,
    deadline        DATE NOT NULL,
    status          ENUM('active','completed','paused') DEFAULT 'active',
    emoji           VARCHAR(5) DEFAULT '🎯',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── 5. BUDGET CONFIGS ──────────────────────────────
CREATE TABLE IF NOT EXISTS budget_configs (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    user_id                 INT NOT NULL,
    month_year              VARCHAR(7) NOT NULL,
    income                  DECIMAL(10,2),
    savings_target          DECIMAL(10,2),
    derived_expense_budget  DECIMAL(10,2) GENERATED ALWAYS AS (income - savings_target) STORED,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_month (user_id, month_year)
);

-- ── 6. MONTHLY REPORTS ─────────────────────────────
CREATE TABLE IF NOT EXISTS monthly_reports (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    user_id             INT NOT NULL,
    month_year          VARCHAR(7) NOT NULL,
    total_spent         DECIMAL(10,2),
    savings_rate        DECIMAL(5,2),
    top_category_id     INT,
    ai_insight_text     TEXT,
    generated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)         REFERENCES users(id),
    FOREIGN KEY (top_category_id) REFERENCES categories(id)
);

-- ── SEED CATEGORIES ────────────────────────────────
INSERT IGNORE INTO categories (name, icon, color_hex) VALUES
('Food & Dining','🍔','#6c5ce7'),('Transport','🚖','#0984e3'),
('Shopping','🛒','#a29bfe'),('Entertainment','🎮','#fd79a8'),
('Utilities','🏠','#fdcb6e'),('Health','💊','#00b894'),('Misc','📦','#636e72');

-- ── WORKBENCH QUERIES ──────────────────────────────
-- Check a user's full profile:
-- SELECT id, name, email, avatar_url, phone, city, occupation, onboarded FROM users;

-- Monthly spend by category:
-- SELECT c.name, SUM(t.amount) AS total FROM transactions t
-- JOIN categories c ON t.category_id = c.id
-- WHERE t.user_id = 1 AND YEAR(t.txn_date) = 2026 AND MONTH(t.txn_date) = 4
-- GROUP BY c.id ORDER BY total DESC;

-- Savings rate:
-- SELECT name, (savings_target/monthly_income*100) AS savings_pct FROM users WHERE id = 1;


