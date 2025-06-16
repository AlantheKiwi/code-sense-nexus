
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { 
  categorizeIssue, 
  getSeverityFromLevel, 
  isCriticalIssue, 
  calculateQualityScore, 
  calculateAverageQualityScore 
} from './result-processing.ts';
import { generateFixSuggestions } from './suggestion-generator.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const authHeader = req.headers.get('Authorization');

    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    switch (action) {
      case 'process':
        const processData = await req.json();
        return await processESLintResults(supabase, processData, user.id);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error: any) {
    console.error('ESLint results processor error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processESLintResults(supabase: any, data: any, userId: string) {
  const { project_id, results, configuration_id } = data;

  if (!project_id || !results || !Array.isArray(results)) {
    return new Response(JSON.stringify({ error: 'Invalid input data' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const processedResults = [];
  const criticalAlerts = [];
  let totalFiles = 0;
  let totalIssues = 0;
  const severityCounts = { error: 0, warn: 0, info: 0 };
  const categoryCounts = { code_quality: 0, potential_bugs: 0, style_violations: 0, security: 0 };

  for (const fileResult of results) {
    const { filePath, messages } = fileResult;
    totalFiles++;

    const processedIssues = messages.map((msg: any) => ({
      ...msg,
      category: categorizeIssue(msg.ruleId, msg.message),
    }));

    const fileSeverityCounts = { error: 0, warn: 0, info: 0 };
    processedIssues.forEach((issue: any) => {
      const severity = getSeverityFromLevel(issue.severity);
      fileSeverityCounts[severity]++;
      severityCounts[severity]++;
      totalIssues++;

      const category = issue.category;
      categoryCounts[category]++;

      // Check for critical issues
      if (severity === 'error' && isCriticalIssue(issue)) {
        criticalAlerts.push({
          project_id,
          alert_type: 'critical_error',
          message: `Critical ESLint error: ${issue.message}`,
          file_path: filePath,
          line_number: issue.line,
          rule_id: issue.ruleId,
        });
      }
    });

    const qualityScore = calculateQualityScore(processedIssues, fileSeverityCounts);

    const { data: result, error } = await supabase
      .from('eslint_results')
      .insert({
        project_id,
        file_path: filePath,
        issues: processedIssues,
        severity_counts: fileSeverityCounts,
        quality_score: qualityScore,
        total_issues: processedIssues.length,
        configuration_used: configuration_id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting ESLint result:', error);
      continue;
    }

    processedResults.push(result);

    // Generate fix suggestions for this file
    await generateFixSuggestions(supabase, result.id, processedIssues);
  }

  return new Response(JSON.stringify({
    success: true,
    processed_files: totalFiles,
    total_issues: totalIssues,
    critical_alerts: criticalAlerts.length,
    results: processedResults,
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
