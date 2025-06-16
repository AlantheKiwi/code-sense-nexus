
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { scheduleAnalysis } from './scheduler-core.ts';
import { getQueueStatus, processQueue } from './queue-management.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req: Request) => {
  console.log(`ESLint Scheduler: ${req.method} request received`);

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

    // Handle different request methods and body formats
    let action: string | null = null;
    let requestData: any = {};

    if (req.method === 'POST') {
      try {
        const body = await req.text();
        console.log('ESLint Scheduler: Request body:', body);
        
        if (body) {
          requestData = JSON.parse(body);
          action = requestData.action;
        }
      } catch (parseError) {
        console.error('ESLint Scheduler: JSON parse error:', parseError);
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else if (req.method === 'GET') {
      const url = new URL(req.url);
      action = url.searchParams.get('action') || 'queue-status';
    }

    if (!action) {
      console.error('ESLint Scheduler: No action specified');
      return new Response(JSON.stringify({ error: 'Action parameter required' }), {
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
