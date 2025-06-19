
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { scheduleAnalysis } from './scheduler-core.ts';
import { getQueueStatus, processQueue } from './queue-management.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req: Request) => {
  console.log(`ESLint Scheduler: ${req.method} request received`);
  console.log(`ESLint Scheduler: URL: ${req.url}`);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const authHeader = req.headers.get('Authorization');

    if (!authHeader) {
      console.error('ESLint Scheduler: No authorization header provided');
      return new Response(JSON.stringify({ error: 'Authorization header required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract token from Bearer header
    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('ESLint Scheduler: Authentication failed:', authError?.message);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`ESLint Scheduler: Authenticated user ${user.id}`);

    // Only handle POST requests with JSON body
    if (req.method !== 'POST') {
      console.error(`ESLint Scheduler: Invalid method: ${req.method}`);
      return new Response(JSON.stringify({ error: 'Only POST requests are supported' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let requestData: any = {};
    let action: string = 'queue-status'; // Default action

    try {
      const body = await req.text();
      console.log('ESLint Scheduler: Request body:', body);
      
      if (body && body.trim()) {
        requestData = JSON.parse(body);
        action = requestData.action || 'queue-status';
      }
    } catch (parseError) {
      console.error('ESLint Scheduler: JSON parse error:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`ESLint Scheduler: Processing action: ${action}`);

    switch (action) {
      case 'schedule':
        console.log('ESLint Scheduler: Scheduling analysis with data:', requestData);
        const job = await scheduleAnalysis(supabase, requestData, user.id);
        return new Response(JSON.stringify({ success: true, job }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'queue-status':
        console.log('ESLint Scheduler: Getting queue status');
        const queueData = await getQueueStatus(supabase);
        return new Response(JSON.stringify(queueData), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'process-queue':
        console.log('ESLint Scheduler: Processing queue');
        const processResult = await processQueue(supabase);
        return new Response(JSON.stringify(processResult), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        console.error(`ESLint Scheduler: Invalid action: ${action}`);
        return new Response(JSON.stringify({ error: `Invalid action: ${action}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error: any) {
    console.error('ESLint scheduler error:', error);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
