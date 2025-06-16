
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

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
      case 'summary':
        const projectId = url.searchParams.get('project_id');
        return await getProjectSummary(supabase, projectId);
      case 'trends':
        const trendsProjectId = url.searchParams.get('project_id');
        const days = parseInt(url.searchParams.get('days') || '30');
        return await getProjectTrends(supabase, trendsProjectId, days);
      case 'alerts':
        const alertsProjectId = url.searchParams.get('project_id');
        return await getCriticalAlerts(supabase, alertsProjectId);
      case 'resolve-alert':
        const alertId = url.searchParams.get('alert_id');
        return await resolveAlert(supabase, alertId, user.id);
      case 'fix-suggestions':
        const resultId = url.searchParams.get('result_id');
        return await getFixSuggestions(supabase, resultId);
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

  // Update project summary
  await updateProjectSummary(supabase, project_id, {
    total_files: totalFiles,
    total_issues: totalIssues,
    severity_counts: severityCounts,
    category_counts: categoryCounts,
    average_quality_score: calculateAverageQualityScore(processedResults),
  });

  // Record trends
  await recordTrends(supabase, project_id, {
    total_issues: totalIssues,
    severity_counts: severityCounts,
    category_counts: categoryCounts,
    files_analyzed: totalFiles,
  });

  // Create critical alerts
  if (criticalAlerts.length > 0) {
    for (const alert of criticalAlerts) {
      const { data: result } = await supabase
        .from('eslint_results')
        .select('id')
        .eq('project_id', project_id)
        .eq('file_path', alert.file_path)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (result) {
        await supabase.from('eslint_critical_alerts').insert({
          ...alert,
          result_id: result.id,
        });
      }
    }

    // Send notifications for critical issues
    await sendCriticalIssueNotifications(supabase, project_id, criticalAlerts);
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

async function getProjectSummary(supabase: any, projectId: string) {
  if (!projectId) {
    return new Response(JSON.stringify({ error: 'Project ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data, error } = await supabase
    .from('eslint_project_summaries')
    .select('*')
    .eq('project_id', projectId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch project summary: ${error.message}`);
  }

  return new Response(JSON.stringify({ summary: data || null }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getProjectTrends(supabase: any, projectId: string, days: number) {
  if (!projectId) {
    return new Response(JSON.stringify({ error: 'Project ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data, error } = await supabase
    .from('eslint_trends')
    .select('*')
    .eq('project_id', projectId)
    .gte('analysis_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('analysis_date', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch trends: ${error.message}`);
  }

  return new Response(JSON.stringify({ trends: data }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getCriticalAlerts(supabase: any, projectId: string) {
  if (!projectId) {
    return new Response(JSON.stringify({ error: 'Project ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data, error } = await supabase
    .from('eslint_critical_alerts')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_resolved', false)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch critical alerts: ${error.message}`);
  }

  return new Response(JSON.stringify({ alerts: data }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function resolveAlert(supabase: any, alertId: string, userId: string) {
  if (!alertId) {
    return new Response(JSON.stringify({ error: 'Alert ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data, error } = await supabase
    .from('eslint_critical_alerts')
    .update({
      is_resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: userId,
    })
    .eq('id', alertId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to resolve alert: ${error.message}`);
  }

  return new Response(JSON.stringify({ success: true, alert: data }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getFixSuggestions(supabase: any, resultId: string) {
  if (!resultId) {
    return new Response(JSON.stringify({ error: 'Result ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data, error } = await supabase
    .from('eslint_fix_suggestions')
    .select('*')
    .eq('result_id', resultId)
    .order('priority', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch fix suggestions: ${error.message}`);
  }

  return new Response(JSON.stringify({ suggestions: data }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Helper functions
function categorizeIssue(ruleId: string, message: string): string {
  if (!ruleId) return 'code_quality';
  
  const securityRules = ['no-eval', 'no-implied-eval', 'no-new-func', 'no-script-url'];
  const bugRules = ['no-undef', 'no-unused-vars', 'no-unreachable', 'no-dupe-keys'];
  const styleRules = ['semi', 'quotes', 'indent', 'space-before-function-paren'];

  if (securityRules.some(rule => ruleId.includes(rule))) return 'security';
  if (bugRules.some(rule => ruleId.includes(rule))) return 'potential_bugs';
  if (styleRules.some(rule => ruleId.includes(rule))) return 'style_violations';
  
  return 'code_quality';
}

function getSeverityFromLevel(level: number): string {
  switch (level) {
    case 2: return 'error';
    case 1: return 'warn';
    default: return 'info';
  }
}

function isCriticalIssue(issue: any): boolean {
  const criticalRules = ['no-eval', 'no-implied-eval', 'no-undef', 'no-unreachable'];
  return criticalRules.includes(issue.ruleId) || 
         (issue.severity === 2 && issue.message.toLowerCase().includes('security'));
}

function calculateQualityScore(issues: any[], severityCounts: any): number {
  const totalIssues = issues.length;
  if (totalIssues === 0) return 100;

  const errorWeight = 10;
  const warnWeight = 5;
  const infoWeight = 1;

  const weightedScore = (severityCounts.error * errorWeight) + 
                       (severityCounts.warn * warnWeight) + 
                       (severityCounts.info * infoWeight);

  return Math.max(0, 100 - (weightedScore / totalIssues * 10));
}

function calculateAverageQualityScore(results: any[]): number {
  if (results.length === 0) return 0;
  const sum = results.reduce((acc, result) => acc + (result.quality_score || 0), 0);
  return sum / results.length;
}

async function updateProjectSummary(supabase: any, projectId: string, summary: any) {
  await supabase
    .from('eslint_project_summaries')
    .upsert({
      project_id: projectId,
      ...summary,
      last_analysis_at: new Date().toISOString(),
    });
}

async function recordTrends(supabase: any, projectId: string, trendData: any) {
  const today = new Date().toISOString().split('T')[0];
  
  await supabase
    .from('eslint_trends')
    .upsert({
      project_id: projectId,
      analysis_date: today,
      quality_score: calculateAverageQualityScore([]),
      ...trendData,
    });
}

async function generateFixSuggestions(supabase: any, resultId: string, issues: any[]) {
  const suggestions = [];

  for (const issue of issues) {
    const suggestion = generateFixSuggestionForRule(issue);
    if (suggestion) {
      suggestions.push({
        result_id: resultId,
        rule_id: issue.ruleId,
        issue_description: issue.message,
        ...suggestion,
      });
    }
  }

  if (suggestions.length > 0) {
    await supabase.from('eslint_fix_suggestions').insert(suggestions);
  }
}

function generateFixSuggestionForRule(issue: any) {
  const ruleId = issue.ruleId;
  const suggestions: Record<string, any> = {
    'no-unused-vars': {
      fix_description: 'Remove the unused variable or prefix it with underscore if intentionally unused',
      code_example: 'const unusedVar = "value";',
      fixed_code_example: '// Remove: const unusedVar = "value";\n// Or: const _unusedVar = "value";',
      difficulty_level: 'easy',
      estimated_time_minutes: 2,
      category: 'code_quality',
      priority: 3,
    },
    'no-console': {
      fix_description: 'Remove console statements or use a proper logging library',
      code_example: 'console.log("debug message");',
      fixed_code_example: '// Remove or replace with proper logging\n// logger.debug("debug message");',
      difficulty_level: 'easy',
      estimated_time_minutes: 1,
      category: 'code_quality',
      priority: 2,
    },
    'semi': {
      fix_description: 'Add missing semicolon at the end of the statement',
      code_example: 'const x = 5',
      fixed_code_example: 'const x = 5;',
      difficulty_level: 'easy',
      estimated_time_minutes: 1,
      category: 'style_violations',
      priority: 1,
    },
  };

  return suggestions[ruleId] || null;
}

async function sendCriticalIssueNotifications(supabase: any, projectId: string, alerts: any[]) {
  // Get project members who should be notified
  const { data: members, error } = await supabase
    .from('project_members')
    .select('user_id')
    .eq('project_id', projectId)
    .in('role', ['admin', 'editor']);

  if (error || !members) return;

  // Queue notifications for critical issues
  for (const member of members) {
    await supabase
      .from('notification_queue')
      .insert({
        user_id: member.user_id,
        notification_type: 'eslint_critical_issues',
        channel_type: 'email',
        content: {
          project_id: projectId,
          critical_count: alerts.length,
          alerts: alerts.slice(0, 5), // Only include first 5 alerts in notification
        },
      });
  }
}
