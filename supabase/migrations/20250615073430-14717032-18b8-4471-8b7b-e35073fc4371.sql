
-- Enable pg_cron if it's not already enabled.
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net if it's not already enabled.
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Grant usage of net schema to the postgres role, required by pg_cron.
-- This allows cron jobs to make HTTP requests.
GRANT USAGE ON SCHEMA net TO postgres;

-- Schedule the 'check-for-updates' function to run every hour.
-- We use a unique name for the job to avoid conflicts.
SELECT cron.schedule(
  'check-for-tool-updates', -- Job name
  '0 * * * *',              -- Cron schedule: runs at the beginning of every hour
  $$
  SELECT
    net.http_post(
      url:='https://dtwgnqzuskdfuypigaor.supabase.co/functions/v1/check-for-updates',
      headers:='{
        "Content-Type": "application/json",
        "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0d2ducXp1c2tkZnV5cGlnYW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNzY3NDcsImV4cCI6MjA2NDc1Mjc0N30.D_Ms-plmjx82XAw4MdCYQMh03X6nzFnAajVMKIJLCVQ",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0d2ducXp1c2tkZnV5cGlnYW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNzY3NDcsImV4cCI6MjA2NDc1Mjc0N30.D_Ms-plmjx82XAw4MdCYQMh03X6nzFnAajVMKIJLCVQ"
      }'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);
