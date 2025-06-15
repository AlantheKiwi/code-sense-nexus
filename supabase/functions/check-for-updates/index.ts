
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// This function will be triggered by a cron job.
serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the service role key to bypass RLS.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}` } } }
    )

    // 1. Get all tools from the `tools` table.
    const { data: tools, error: toolsError } = await supabaseAdmin.from('tools').select('*')
    if (toolsError) throw toolsError

    const updatesFound = []

    // 2. For each tool, check for a "new" version.
    for (const tool of tools) {
      if (!tool.version) {
        console.log(`Skipping tool ${tool.name} as it has no version.`);
        continue;
      }
      // In a real-world scenario, you would fetch this from an external source (e.g., npm, GitHub releases).
      // For this demo, we'll simulate a new version being available.
      // e.g. if version is 1.0.0, new version is 1.1.0
      const currentVersionParts = tool.version.split('.').map(Number)
      const newVersion = `${currentVersionParts[0]}.${currentVersionParts[1] + 1}.0`

      // 3. Check if an 'available' update for this version already exists.
      const { data: existingUpdate, error: existingUpdateError } = await supabaseAdmin
        .from('tool_updates')
        .select('id')
        .eq('tool_id', tool.id)
        .eq('to_version', newVersion)
        .eq('status', 'available')
        .maybeSingle()
      
      if (existingUpdateError) {
          console.error(`Error checking existing updates for tool ${tool.name}:`, existingUpdateError.message)
          continue // Skip to the next tool
      }

      // 4. If no available update exists for this version, create one.
      if (!existingUpdate) {
        const { data: newUpdate, error: insertError } = await supabaseAdmin
          .from('tool_updates')
          .insert({
            tool_id: tool.id,
            from_version: tool.version,
            to_version: newVersion,
            status: 'available',
            details: { changelog: `Automated check found new version ${newVersion}.` },
          })
          .select()
          .single()
        
        if (insertError) {
          console.error(`Error inserting new update for tool ${tool.name}:`, insertError.message)
          continue
        }
        
        updatesFound.push(newUpdate)
        console.log(`New update found for ${tool.name}: ${tool.version} -> ${newVersion}`)
      }
    }

    return new Response(JSON.stringify({ message: 'Update check complete.', updatesFound }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (e) {
    console.error('Error in check-for-updates function:', e)
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

