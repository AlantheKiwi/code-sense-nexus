
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Standard CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to create a consistent hash for grouping errors
async function createErrorHash(message: string, stack?: string): Promise<string> {
    const identifier = `${message}${stack || ''}`.trim();
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(identifier),
    )
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      projectId,
      message,
      stack,
      context,
      url,
      userAgent,
      sessionData
    } = await req.json()

    if (!projectId || !message) {
      return new Response(JSON.stringify({ error: 'projectId and message are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
    
    // Use the service_role_key to perform admin-level database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // If an auth token is provided, get the user ID
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    if (authHeader) {
        const userClient = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_ANON_KEY')!,
            { global: { headers: { Authorization: authHeader } } }
        );
        const { data: { user } } = await userClient.auth.getUser();
        userId = user?.id;
    }

    const errorHash = await createErrorHash(message, stack);

    // Check if an error report with this hash already exists for the project
    let { data: existingReport } = await supabaseAdmin
        .from('error_reports')
        .select('id, count')
        .eq('project_id', projectId)
        .eq('error_hash', errorHash)
        .single();
    
    let errorReportId: string;

    if (existingReport) {
        // If it exists, increment its count and update the last_seen_at timestamp
        errorReportId = existingReport.id;
        const { error: updateError } = await supabaseAdmin
            .from('error_reports')
            .update({
                count: existingReport.count + 1,
                last_seen_at: new Date().toISOString()
            })
            .eq('id', errorReportId);
        
        if (updateError) throw updateError;
    } else {
        // If it's a new error, create a new report
        const { data: newReport, error: insertError } = await supabaseAdmin
            .from('error_reports')
            .insert({
                project_id: projectId,
                error_hash: errorHash,
                message,
                stack_trace: stack,
                context,
            })
            .select('id')
            .single();

        if (insertError) throw insertError;
        errorReportId = newReport.id;
    }
    
    // Record this specific instance of the error
    const { error: instanceError } = await supabaseAdmin.from('error_instances').insert({
        error_report_id: errorReportId,
        user_id: userId,
        user_agent: userAgent,
        url: url,
        session_data: sessionData
    });

    if (instanceError) throw instanceError;

    return new Response(JSON.stringify({ success: true, reportId: errorReportId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in report-error function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
