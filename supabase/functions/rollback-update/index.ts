
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { logAuditEvent } from '../_shared/audit.ts'
import { enqueueNotificationsForUser } from '../_shared/notifications.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { updateId } = await req.json()
    if (!updateId) {
      return new Response(JSON.stringify({ error: 'updateId is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` } } }
    )
    
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401,
        })
    }

    // 1. Get update details
    const { data: update, error: updateError } = await supabaseAdmin
      .from('tool_updates')
      .select('*, tools(*)')
      .eq('id', updateId)
      .single()

    if (updateError || !update || !update.tools) {
      throw new Error(`Update or associated tool not found: ${updateError?.message || 'not found'}`)
    }

    if (update.status !== 'completed') {
      return new Response(JSON.stringify({ error: `Update cannot be rolled back. Current status: ${update.status}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
    
    if (!update.from_version) {
        return new Response(JSON.stringify({ error: 'Cannot rollback, previous version not found.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }

    // 2. Update tool version back to the old version
    const { error: toolUpdateError } = await supabaseAdmin
      .from('tools')
      .update({ version: update.from_version })
      .eq('id', update.tool_id)

    if (toolUpdateError) throw toolUpdateError;

    const rollbackDetails = { ...update.details, rollback_reason: `Manual rollback initiated by ${user.email}.` };
    // 3. Set update status to 'rolled_back'
    await supabaseAdmin
      .from('tool_updates')
      .update({ 
          status: 'rolled_back', 
          updated_at: new Date().toISOString(),
          details: rollbackDetails
        })
      .eq('id', updateId)
    
    // 4. Log the audit event for the rollback
    await logAuditEvent(
      supabaseAdmin,
      req,
      'tool_update_rollback',
      { tool_id: update.tool_id, update_id: update.id },
      { 
          tool_name: update.tools.name, 
          from_version: update.to_version, 
          to_version: update.from_version,
          details: rollbackDetails
      }
    )

    // 5. Enqueue notifications for the user who initiated the action
    const { data: partnerData } = await supabase.rpc('get_my_partner_id')
    const partner_id = partnerData as string | null;

    if (partner_id) {
        const notification_type = 'tool_update_rollback';
        const content = {
            tool_name: update.tools.name,
            from_version: update.to_version,
            to_version: update.from_version,
            rolled_back_by: user.email,
        };
        await enqueueNotificationsForUser(supabaseAdmin, {
            partner_id,
            user_id: user.id,
            notification_type,
            content,
        });
    } else {
        console.warn(`Could not determine partner_id for user ${user.id}, skipping notification.`);
    }

    console.log(`Successfully rolled back update for tool: ${update.tools.name} to version ${update.from_version}`)

    return new Response(JSON.stringify({ message: 'Update rolled back successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (e) {
    console.error('Error in rollback-update function:', e)
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
