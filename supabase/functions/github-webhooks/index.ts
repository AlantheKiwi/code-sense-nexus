
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Shared CORS headers. It's important to include the GitHub-specific headers.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-github-delivery, x-github-event, x-hub-signature-256',
};

// Simplified type definition for incoming GitHub webhook payloads.
interface GitHubWebhookPayload {
  action?: string;
  installation: {
    id: number;
    account: {
      id: number;
      login: string;
    };
    repository_selection: string;
    suspended_at?: string | null;
  };
}

// Securely verifies the signature sent by GitHub to ensure the webhook is genuine.
async function verifySignature(signature: string, body: string, secret: string): Promise<boolean> {
  try {
    if (!signature.startsWith('sha256=')) {
      console.error('Signature format is not sha256');
      return false;
    }
    const sigHex = signature.substring(7);
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const macBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body));

    const receivedSig = new Uint8Array(sigHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const expectedSig = new Uint8Array(macBuffer);

    if (receivedSig.length !== expectedSig.length) return false;

    // Timing-safe comparison to prevent timing attacks
    let result = 0;
    for (let i = 0; i < receivedSig.length; i++) {
      result |= receivedSig[i] ^ expectedSig[i];
    }
    return result === 0;
  } catch (e) {
    console.error('Error during signature verification:', e.message);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // --- Get required secrets and headers ---
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const webhookSecret = Deno.env.get('GITHUB_WEBHOOK_SECRET');

  if (!supabaseUrl || !serviceRoleKey || !webhookSecret) {
    console.error('Missing environment variables for webhook handler.');
    return new Response(JSON.stringify({ error: 'Internal server configuration error.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const githubDeliveryId = req.headers.get('x-github-delivery');
  const githubEventType = req.headers.get('x-github-event');
  const signature = req.headers.get('x-hub-signature-256');
  const body = await req.text();

  if (!githubDeliveryId || !githubEventType || !signature) {
    return new Response(JSON.stringify({ error: 'Missing required GitHub headers.' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  // --- Verify signature ---
  if (!await verifySignature(signature, body, webhookSecret)) {
    console.warn('Invalid webhook signature received.');
    return new Response(JSON.stringify({ error: 'Invalid signature.' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const payload: GitHubWebhookPayload = JSON.parse(body);
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  // --- Log the incoming event ---
  await supabaseAdmin.from('github_webhook_events').insert({
    github_delivery_id: githubDeliveryId,
    event_type: githubEventType,
    payload: payload,
  }).then(({ error }) => {
    if (error) console.error('Error logging webhook event:', error);
  });

  // --- Process based on event type ---
  let processingError: string | null = null;
  try {
    if (githubEventType === 'installation') {
      const { id, suspended_at } = payload.installation;
      switch (payload.action) {
        case 'deleted':
          console.log(`Processing 'installation.deleted' for ID: ${id}`);
          await supabaseAdmin.from('github_app_installations').delete().eq('id', id).throwOnError();
          break;
        case 'suspend':
          console.log(`Processing 'installation.suspend' for ID: ${id}`);
          await supabaseAdmin.from('github_app_installations').update({ suspended_at: suspended_at || new Date().toISOString() }).eq('id', id).throwOnError();
          break;
        case 'unsuspend':
          console.log(`Processing 'installation.unsuspend' for ID: ${id}`);
          await supabaseAdmin.from('github_app_installations').update({ suspended_at: null }).eq('id', id).throwOnError();
          break;
        case 'created':
          console.log(`Received 'installation.created' for ID: ${id}. Awaiting partner association via UI flow.`);
          break;
      }
    } else if (githubEventType === 'push') {
      console.log(`Received push event for installation ID: ${payload.installation.id}. Analysis logic to be implemented.`);
    }

    await supabaseAdmin.from('github_webhook_events').update({ status: 'success', processed_at: new Date().toISOString() }).eq('github_delivery_id', githubDeliveryId);

  } catch (e) {
    processingError = e.message;
    console.error('Error processing webhook:', processingError);
    await supabaseAdmin.from('github_webhook_events').update({ status: 'error', error_message: processingError, processed_at: new Date().toISOString() }).eq('github_delivery_id', githubDeliveryId);
  }

  // --- Send response to GitHub ---
  if (processingError) {
    return new Response(JSON.stringify({ error: 'Failed to process webhook.', details: processingError }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  return new Response(JSON.stringify({ message: 'Webhook received.' }), {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
