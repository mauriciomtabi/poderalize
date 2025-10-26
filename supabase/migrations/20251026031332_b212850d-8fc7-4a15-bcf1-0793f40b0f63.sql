-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the payment notification function to run daily at 9:00 AM (Brazil time - UTC-3)
-- This will run at 12:00 PM UTC
SELECT cron.schedule(
  'notify-payment-due-daily',
  '0 12 * * *', -- Every day at 12:00 PM UTC (9:00 AM BRT)
  $$
  SELECT
    net.http_post(
        url:='https://xkxufwubibaxlrayoqrn.supabase.co/functions/v1/notify-payment-due',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhreHVmd3ViaWJheGxyYXlvcXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NTkzNDEsImV4cCI6MjA2NzAzNTM0MX0.E8kKqnKDpr6LlbvO4l7TaeZPt0y_tibh8qXPHbQLh_4"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Optional: View all scheduled cron jobs
-- SELECT * FROM cron.job;

-- Optional: To remove the schedule, run:
-- SELECT cron.unschedule('notify-payment-due-daily');