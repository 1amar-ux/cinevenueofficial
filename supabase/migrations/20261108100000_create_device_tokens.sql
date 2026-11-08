-- Create Device Tokens Table for FCM (Android) and APNs (iOS) Push Notifications
CREATE TABLE IF NOT EXISTS device_tokens (
    id VARCHAR(64) PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    platform VARCHAR(16) NOT NULL, -- ANDROID, IOS, WEB
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    device_id VARCHAR(128),
    device_model VARCHAR(128),
    app_version VARCHAR(32),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning fast lookups
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_device_tokens_platform ON device_tokens(platform);
CREATE INDEX IF NOT EXISTS idx_device_tokens_is_active ON device_tokens(is_active);
