-- New Zone System Migration
-- Add support for New Zone tasks with special referral links

-- Add new columns to tasks table for New Zone functionality
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_new_zone boolean DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS zone_ref_link text UNIQUE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS max_users_to_show integer DEFAULT 3;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS max_clicks integer DEFAULT 15;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS current_users_shown integer DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS current_clicks integer DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_zone_active boolean DEFAULT false;

-- Create table to track New Zone referrals
CREATE TABLE IF NOT EXISTS new_zone_referrals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
    user_address text NOT NULL,
    referral_source text NOT NULL, -- الرابط الذي استخدمه المستخدم
    joined_at timestamp with time zone DEFAULT now(),
    has_clicked boolean DEFAULT false,
    clicked_at timestamp with time zone
);

-- Create table to track which users can currently see New Zone tasks
CREATE TABLE IF NOT EXISTS new_zone_visibility (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
    user_address text NOT NULL,
    shown_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    UNIQUE(task_id, user_address)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_new_zone_referrals_task_id ON new_zone_referrals(task_id);
CREATE INDEX IF NOT EXISTS idx_new_zone_referrals_user_address ON new_zone_referrals(user_address);
CREATE INDEX IF NOT EXISTS idx_new_zone_referrals_source ON new_zone_referrals(referral_source);
CREATE INDEX IF NOT EXISTS idx_new_zone_visibility_task_id ON new_zone_visibility(task_id);
CREATE INDEX IF NOT EXISTS idx_new_zone_visibility_user_address ON new_zone_visibility(user_address);
CREATE INDEX IF NOT EXISTS idx_new_zone_visibility_expires ON new_zone_visibility(expires_at);

-- Function to handle New Zone task visibility logic
CREATE OR REPLACE FUNCTION handle_new_zone_referral(
    p_task_id uuid,
    p_user_address text,
    p_referral_source text
) RETURNS boolean AS $$
DECLARE
    task_record RECORD;
    current_shown_count integer;
BEGIN
    -- Get task information
    SELECT * INTO task_record FROM tasks 
    WHERE id = p_task_id AND is_new_zone = true AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Record the referral
    INSERT INTO new_zone_referrals (task_id, user_address, referral_source)
    VALUES (p_task_id, p_user_address, p_referral_source)
    ON CONFLICT DO NOTHING;
    
    -- Check current visibility count
    SELECT COUNT(*) INTO current_shown_count 
    FROM new_zone_visibility 
    WHERE task_id = p_task_id AND expires_at > now();
    
    -- If we haven't reached the max users to show, make task visible
    IF current_shown_count < task_record.max_users_to_show THEN
        INSERT INTO new_zone_visibility (task_id, user_address, expires_at)
        VALUES (p_task_id, p_user_address, now() + interval '24 hours')
        ON CONFLICT (task_id, user_address) 
        DO UPDATE SET expires_at = now() + interval '24 hours';
        
        -- Update current users shown count
        UPDATE tasks 
        SET current_users_shown = current_shown_count + 1,
            is_zone_active = true
        WHERE id = p_task_id;
        
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Function to handle New Zone task click
CREATE OR REPLACE FUNCTION handle_new_zone_click(
    p_task_id uuid,
    p_user_address text
) RETURNS boolean AS $$
DECLARE
    task_record RECORD;
    new_click_count integer;
    total_users_count integer;
    required_clicks integer;
BEGIN
    -- Get task information
    SELECT * INTO task_record FROM tasks 
    WHERE id = p_task_id AND is_new_zone = true AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Mark user as clicked if they haven't already
    UPDATE new_zone_referrals 
    SET has_clicked = true, clicked_at = now()
    WHERE task_id = p_task_id 
    AND user_address = p_user_address 
    AND has_clicked = false;
    
    -- Increment click count
    UPDATE tasks 
    SET current_clicks = current_clicks + 1
    WHERE id = p_task_id;
    
    -- Get new click count
    SELECT current_clicks INTO new_click_count 
    FROM tasks WHERE id = p_task_id;
    
    -- Get total unique users count for this task
    SELECT COUNT(DISTINCT user_address) INTO total_users_count
    FROM new_zone_referrals 
    WHERE task_id = p_task_id;
    
    -- Calculate required clicks = total users × 3
    required_clicks := total_users_count * 3;
    
    -- If required clicks reached, hide task and reset counters
    IF new_click_count >= required_clicks THEN
        -- Clear visibility for all users
        DELETE FROM new_zone_visibility WHERE task_id = p_task_id;
        
        -- Reset counters and deactivate zone
        UPDATE tasks 
        SET current_users_shown = 0,
            current_clicks = 0,
            is_zone_active = false
        WHERE id = p_task_id;
        
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Function to get visible New Zone tasks for a user
CREATE OR REPLACE FUNCTION get_user_new_zone_tasks(p_user_address text)
RETURNS TABLE (
    task_id uuid,
    title text,
    description text,
    reward_amount numeric,
    image_url text,
    external_link text,
    zone_ref_link text,
    current_clicks integer,
    max_clicks integer
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.title,
        t.description,
        t.reward_amount,
        t.image_url,
        t.external_link,
        t.zone_ref_link,
        t.current_clicks,
        t.max_clicks
    FROM tasks t
    INNER JOIN new_zone_visibility nzv ON t.id = nzv.task_id
    WHERE t.is_new_zone = true 
    AND t.is_active = true 
    AND t.is_zone_active = true
    AND nzv.user_address = p_user_address
    AND nzv.expires_at > now()
    ORDER BY nzv.shown_at DESC;
END;
$$ LANGUAGE plpgsql;