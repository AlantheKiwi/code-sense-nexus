
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Lighthouse analysis function started');

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface LighthouseRequest {
  url: string;
  device?: 'mobile' | 'desktop';
  projectId?: string;
  priority?: 'low' | 'normal' | 'high';
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const request: LighthouseRequest = await req.json();
    
    if (!request.url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate URL format
    try {
      new URL(request.url);
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Queueing Lighthouse audit for: ${request.url}`);

    // Add to queue for processing
    const { data: queueResponse, error: queueError } = await supabase.functions.invoke('lighthouse-queue', {
      body: {
        urls: [request.url],
        device: request.device || 'mobile',
        projectId: request.projectId,
        priority: request.priority || 'normal'
      }
    });

    if (queueError) {
      console.error('Error queuing audit:', queueError);
      return new Response(JSON.stringify({ 
        error: 'Failed to queue audit',
        details: queueError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Lighthouse audit queued successfully',
      data: queueResponse
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in Lighthouse analysis function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
