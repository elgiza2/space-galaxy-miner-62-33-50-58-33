-- Create user tickets table
CREATE TABLE IF NOT EXISTS user_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('daily', 'task_reward', 'premium')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  is_used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  CONSTRAINT fk_user_tickets_user_id FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_tickets_user_id ON user_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tickets_type ON user_tickets(type);
CREATE INDEX IF NOT EXISTS idx_user_tickets_created_at ON user_tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_user_tickets_is_used ON user_tickets(is_used);

-- Enable RLS
ALTER TABLE user_tickets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own tickets" ON user_tickets
  FOR SELECT USING (user_id = auth.uid()::TEXT);

CREATE POLICY "Users can insert their own tickets" ON user_tickets
  FOR INSERT WITH CHECK (user_id = auth.uid()::TEXT);

CREATE POLICY "Users can update their own tickets" ON user_tickets
  FOR UPDATE USING (user_id = auth.uid()::TEXT);

-- Grant permissions
GRANT ALL ON user_tickets TO authenticated;
GRANT ALL ON user_tickets TO anon;