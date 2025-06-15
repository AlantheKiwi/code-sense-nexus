
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// This function is intended to be run on a schedule (e.g., via a cron job).
// It processes notifications from the queue.

async function processNotification(supabaseAdmin: SupabaseClient, notification: any) {
  let sent = false;
  let errorMsg = null;

  try {
    switch (notification.channel_type) {
      case 'email':
        // In a real implementation, this would invoke another Edge Function to handle email sending.
        console.log(`Dispatching email notification ${notification.id} for user ${notification.user_id}`);
        sent = true; // Simulating success
        break;
      case 'slack':
         // In a real implementation, this would invoke a function to post to a Slack webhook.
        console.log(`Dispatching slack notification ${notification.id} for user ${notification.user_id}`);
        sent = true; // Simulating success
        break;
      case 'in_app':
        // In-app notifications are typically handled by the frontend. We just mark it as sent.
        console.log(`Processing in_app notification ${notification.id} for user ${notification.user_id}`);
        sent = true;
        break;
      default:
        console.warn(`Unsupported channel type: ${notification.channel_type} for notification ${notification.id}`);
        errorMsg = `Unsupported channel type: ${notification.channel_type}`;
    }

    if (sent) {
      await supabaseAdmin
        .from('notification_queue')
        .update({ status: 'sent', sent_at: new Date().toISOString(), error_message: null })
        .eq('id', notification.id);
      
      await supabaseAdmin.from('notification_history').insert({
          notification_id: notification.id,
          user_id: notification.user_id,
          delivered_at: new Date().toISOString(),
      });
    } else {
        throw new Error(errorMsg || "Processing failed");
    }

  } catch (e) {
    console.error(`Failed to process notification ${notification.id}:`, e.message);
    const nextStatus = notification.attempts + 1 >= 5 ? 'failed' : 'retrying';
    await supabaseAdmin
      .from('notification_queue')
      .update({ 
        status: nextStatus,
        error_message: e.message,
        attempts: notification.attempts + 1,
      })
      .eq('id', notification.id);
  }
}

serve(async (_req) => {
  if (_req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: notifications, error: fetchError } = await supabaseAdmin
      .from('notification_queue')
      .select('*')
      .in('status', ['pending', 'retrying'])
      .lte('scheduled_at', new Date().toISOString())
      .limit(20);

    if (fetchError) throw fetchError;
    if (!notifications || notifications.length === 0) {
      return new Response(JSON.stringify({ message: 'No pending notifications to process.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    await supabaseAdmin
      .from('notification_queue')
      .update({ status: 'processing' })
      .in('id', notifications.map(n => n.id));
      
    console.log(`Processing ${notifications.length} notifications.`);

    await Promise.all(notifications.map(n => processNotification(supabaseAdmin, n)));

    return new Response(JSON.stringify({ message: `Attempted to process ${notifications.length} notifications.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (e) {
    console.error('Error in process-notifications function:', e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
