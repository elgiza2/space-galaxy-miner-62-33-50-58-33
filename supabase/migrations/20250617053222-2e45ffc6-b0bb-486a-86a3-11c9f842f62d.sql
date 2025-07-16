
-- First drop the existing constraint
ALTER TABLE user_activity DROP CONSTRAINT user_activity_activity_type_check;

-- Delete any rows with invalid activity_type values that are not in our allowed list
DELETE FROM user_activity 
WHERE activity_type NOT IN (
  'login', 
  'logout', 
  'view_tasks', 
  'create_task', 
  'update_task', 
  'delete_task', 
  'toggle_task_status',
  'complete_task',
  'admin_session',
  'page_view',
  'mining_start',
  'mining_stop',
  'purchase',
  'referral',
  'admin_dashboard_view',
  'edit_task_view',
  'refresh_analytics'
);

-- Now add the new constraint with all required activity types
ALTER TABLE user_activity 
ADD CONSTRAINT user_activity_activity_type_check 
CHECK (activity_type IN (
  'login', 
  'logout', 
  'view_tasks', 
  'create_task', 
  'update_task', 
  'delete_task', 
  'toggle_task_status',
  'complete_task',
  'admin_session',
  'page_view',
  'mining_start',
  'mining_stop',
  'purchase',
  'referral',
  'admin_dashboard_view',
  'edit_task_view',
  'refresh_analytics'
));
