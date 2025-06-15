
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

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

    // 1. Get update details and the related tool
    const { data: update, error: updateError } = await supabaseAdmin
      .from('tool_updates')
      .select('*, tools(*)')
      .eq('id', updateId)
      .single()

    if (updateError || !update || !update.tools) {
      throw new Error(`Update or associated tool not found: ${updateError?.message || 'not found'}`)
    }
    
    if (update.status !== 'available') {
      return new Response(JSON.stringify({ error: `Update is not available for installation. Current status: ${update.status}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 2. Set status to 'installing'
    await supabaseAdmin
      .from('tool_updates')
      .update({ status: 'installing', updated_at: new Date().toISOString() })
      .eq('id', updateId)

    console.log(`Installing update for tool: ${update.tools.name} to version ${update.to_version}`)

    // 3. Simulate installation (e.g., could be a long-running process)
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const installationSucceeded = Math.random() > 0.1; // 90% success rate

    if (installationSucceeded) {
        // 4a. Update tool version in `tools` table
        const { error: toolUpdateError } = await supabaseAdmin
            .from('tools')
            .update({ version: update.to_version })
            .eq('id', update.tool_id)

        if (toolUpdateError) throw toolUpdateError;

        // 4b. Set status to 'completed'
        await supabaseAdmin
            .from('tool_updates')
            .update({ status: 'completed', updated_at: new Date().toISOString() })
            .eq('id', updateId)
        
        console.log(`Successfully installed update for tool: ${update.tools.name}`)
        
        return new Response(JSON.stringify({ message: 'Update installed successfully.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } else {
        // 5. Set status to 'failed' if installation fails
        await supabaseAdmin
            .from('tool_updates')
            .update({ 
                status: 'failed', 
                updated_at: new Date().toISOString(),
                details: { ...update.details, error: 'Simulated installation failure.' }
            })
            .eq('id', updateId)

        console.error(`Failed to install update for tool: ${update.tools.name}`)
        
        return new Response(JSON.stringify({ error: 'Installation failed.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }

  } catch (e) {
    console.error('Error in install-update function:', e)
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
