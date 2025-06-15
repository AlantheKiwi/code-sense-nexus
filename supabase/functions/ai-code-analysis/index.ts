
import 'https://deno.land/x/xhr@0.1.0/mod.ts'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const COMPLETION_MODEL = 'gpt-4o-mini'

// Define structured prompts for different analysis types
const PROMPTS = {
  review: `
    You are an expert code reviewer acting as a service for a multi-tenant SaaS platform.
    Analyze the following code snippet.
    Provide your analysis in a structured JSON format. The JSON object should have the following keys:
    - "quality_score": A numeric score from 0 to 100 representing the code's overall quality, maintainability, and adherence to best practices.
    - "bugs": An array of objects, where each object represents a detected bug or critical issue. Each object should have "line", "issue", and "suggestion" fields.
    - "improvements": An array of objects, for non-critical improvements. Each object should have "line", "issue", and "suggestion" fields.
    - "summary": A brief, one-paragraph summary of the code's quality.

    Do not include any text outside of the JSON object.
    Code to analyze:
  `,
  optimize: `
    You are a performance optimization specialist for a multi-tenant SaaS platform.
    Analyze the following code snippet for performance bottlenecks and optimization opportunities.
    Provide your analysis in a structured JSON format. The JSON object should have the following keys:
    - "optimizations": An array of objects, where each object details a potential optimization. Each object should have "line", "issue", and "suggestion" with code examples.
    - "summary": A brief, one-paragraph summary of the performance characteristics.

    Do not include any text outside of the JSON object.
    Code to analyze:
  `,
  security: `
    You are a security analysis expert for a multi-tenant SaaS platform.
    Analyze the following code snippet for security vulnerabilities (e.g., XSS, SQL Injection, insecure defaults).
    Provide your analysis in a structured JSON format. The JSON object should have the following keys:
    - "vulnerabilities": An array of objects, where each object represents a security vulnerability. Each object should have "line", "type", "severity" (high, medium, low), and "recommendation".
    - "summary": A brief, one-paragraph summary of the code's security posture.

    Do not include any text outside of the JSON object.
    Code to analyze:
  `,
}

// Helper to get partner ID from project
async function getPartnerId(supabase: SupabaseClient, projectId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('partner_id')
    .eq('id', projectId)
    .single()

  if (error) throw new Error(`Failed to get partner ID: ${error.message}`)
  if (!data) throw new Error('Project not found to determine partner ID.')
  
  return data.partner_id
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service key for admin operations
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { projectId, code, analysisType } = await req.json()
    if (!projectId || !code || !analysisType || !PROMPTS[analysisType]) {
      return new Response(JSON.stringify({ error: 'Missing or invalid parameters: projectId, code, and analysisType are required.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Check if user is a member of the project
    const { data: isMember, error: memberCheckError } = await supabase.rpc('is_project_member', {
      _project_id: projectId,
      _user_id: user.id
    })
    if (memberCheckError || !isMember) {
        return new Response(JSON.stringify({ error: 'Forbidden: User is not a member of this project.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }})
    }
    
    const partnerId = await getPartnerId(supabase, projectId);

    const fullPrompt = `${PROMPTS[analysisType]}\n\n\`\`\`\n${code}\n\`\`\``

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: COMPLETION_MODEL,
        messages: [{ role: 'user', content: fullPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    })

    if (!openAIResponse.ok) {
      const errorBody = await openAIResponse.text()
      throw new Error(`OpenAI API request failed: ${openAIResponse.status} ${errorBody}`)
    }

    const openAIResult = await openAIResponse.json()
    const analysisResult = JSON.parse(openAIResult.choices[0].message.content)

    // Rough cost calculation (example rates)
    const promptTokens = openAIResult.usage.prompt_tokens
    const completionTokens = openAIResult.usage.completion_tokens
    const cost = (promptTokens / 1000 * 0.00005) + (completionTokens / 1000 * 0.00015) // Example pricing for gpt-4o-mini

    // Using a transaction to ensure data integrity
    const { data: analysisRecord, error: insertError } = await supabase
      .from('ai_analysis_results')
      .insert({
        project_id: projectId,
        user_id: user.id,
        code_hash: 'dummy_hash', // In a real app, hash the code content
        analysis_type: analysisType,
        analysis_result: analysisResult,
        quality_score: analysisResult.quality_score || null,
      })
      .select('id')
      .single()
      
    if (insertError) throw new Error(`Failed to save analysis result: ${insertError.message}`);

    // Log the interaction
    await supabase.from('ai_interactions').insert({
      user_id: user.id,
      partner_id: partnerId,
      project_id: projectId,
      function_name: 'ai-code-analysis',
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: openAIResult.usage.total_tokens,
      cost: cost
    })

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in ai-code-analysis function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
