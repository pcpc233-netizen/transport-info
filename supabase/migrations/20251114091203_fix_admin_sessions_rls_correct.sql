/*
  # Fix Admin Sessions RLS Policies - Correct Version

  1. Problem
    - Previous migration referenced non-existent `user_id` column and `auth.uid()` function
    - admin_sessions table uses `admin_id`, not `user_id`
    - Admin system uses custom session tokens, not Supabase Auth
    - Service role queries were failing due to incorrect policies

  2. Solution
    - Drop all existing admin_sessions policies
    - Create simple service role policy that allows full access
    - Remove any references to Supabase Auth (auth.uid())
    - Allow Edge Functions with service role key to manage sessions

  3. Security
    - Only service role (Edge Functions) can access admin_sessions
    - No public or authenticated role access
    - Sessions are managed entirely through secure Edge Functions
    - All session operations are logged in admin_activity_logs

  4. Important Notes
    - This table is intentionally restrictive
    - Only accessible via Edge Functions using SUPABASE_SERVICE_ROLE_KEY
    - Frontend cannot directly query this table
    - All authentication flows go through admin-login and admin-verify-session functions
*/

-- Drop ALL existing policies on admin_sessions
DROP POLICY IF EXISTS "No direct access to admin_sessions" ON admin_sessions;
DROP POLICY IF EXISTS "Service role can manage admin sessions" ON admin_sessions;
DROP POLICY IF EXISTS "Users can read own sessions" ON admin_sessions;

-- Create single comprehensive service role policy
CREATE POLICY "Service role full access to admin_sessions"
  ON admin_sessions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Also fix admin_users policies for consistency
DROP POLICY IF EXISTS "No direct access to admin_users" ON admin_users;
DROP POLICY IF EXISTS "Service role can manage admin_users" ON admin_users;

CREATE POLICY "Service role full access to admin_users"
  ON admin_users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Fix admin_activity_logs policies
DROP POLICY IF EXISTS "No direct access to admin_activity_logs" ON admin_activity_logs;
DROP POLICY IF EXISTS "Service role can manage admin_activity_logs" ON admin_activity_logs;

CREATE POLICY "Service role full access to admin_activity_logs"
  ON admin_activity_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;