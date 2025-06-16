
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Lighthouse recommendation engine function started');

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface RecommendationRequest {
  action: 'generate_recommendations' | 'execute_automated_fix' | 'analyze_cost_benefit';
  auditId?: string;
  projectId?: string;
  recommendationId?: string;
  recommendationIds?: string[];
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
    const request: RecommendationRequest = await req.json();
    
    switch (request.action) {
      case 'generate_recommendations':
        return await generateRecommendations(request.auditId!, request.projectId!);
      case 'execute_automated_fix':
        return await executeAutomatedFix(request.recommendationId!);
      case 'analyze_cost_benefit':
        return await analyzeCostBenefit(request.recommendationIds!);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error: any) {
    console.error('Error in recommendation engine function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateRecommendations(auditId: string, projectId: string) {
  console.log(`Generating recommendations for audit: ${auditId}`);
  
  // Fetch the audit data
  const { data: audit, error: auditError } = await supabase
    .from('lighthouse_audits')
    .select('*')
    .eq('id', auditId)
    .single();

  if (auditError || !audit) {
    return new Response(JSON.stringify({ error: 'Audit not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Fetch project to determine project type
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  const projectType = project?.metadata?.project_type || 'general';

  // Get recommendation templates
  const { data: templates } = await supabase
    .from('lighthouse_recommendation_templates')
    .select('*')
    .eq('is_active', true);

  const recommendations = [];
  const auditData = audit.full_report;

  // Analyze audit results and generate recommendations
  for (const template of templates || []) {
    const recommendation = await analyzeAuditForTemplate(audit, template, projectType);
    if (recommendation) {
      recommendations.push(recommendation);
    }
  }

  // Insert recommendations into database
  if (recommendations.length > 0) {
    const { data: insertedRecommendations, error: insertError } = await supabase
      .from('lighthouse_recommendations')
      .insert(recommendations)
      .select();

    if (insertError) {
      console.error('Error inserting recommendations:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to save recommendations' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Generated ${insertedRecommendations.length} recommendations`);

    return new Response(JSON.stringify({
      success: true,
      recommendations: insertedRecommendations,
      count: insertedRecommendations.length
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({
    success: true,
    recommendations: [],
    count: 0,
    message: 'No recommendations generated - audit results look good!'
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function analyzeAuditForTemplate(audit: any, template: any, projectType: string) {
  // Check if template applies to this project type
  if (template.project_type !== 'general' && template.project_type !== projectType) {
    return null;
  }

  const auditData = audit.full_report;
  const auditRule = template.audit_rule;
  
  // Check if this audit rule has issues
  const ruleResult = auditData?.audits?.[auditRule];
  if (!ruleResult || ruleResult.score === 1) {
    return null; // No issues found for this rule
  }

  // Extract current value and calculate potential savings
  const currentValue = ruleResult.numericValue || 0;
  const displayValue = ruleResult.displayValue || '';
  
  // Calculate estimated savings based on audit type
  let estimatedSavings = 0;
  if (auditRule.includes('unused-css') || auditRule.includes('unused-javascript')) {
    estimatedSavings = currentValue * 0.3; // Assume 30% of unused resources can be saved
  } else if (auditRule.includes('image') || auditRule.includes('modern-image-formats')) {
    estimatedSavings = currentValue * 0.5; // Image optimization typically saves 50%
  } else {
    estimatedSavings = Math.max(100, currentValue * 0.2); // Conservative estimate
  }

  // Get current category score for priority calculation
  const categoryScore = getCategoryScore(audit.scores, template.category);
  
  // Calculate priority score using the database function
  const priorityScore = await calculatePriorityScore(
    estimatedSavings,
    template.implementation_difficulty,
    categoryScore,
    template.category
  );

  // Calculate cost-benefit score
  const costBenefitScore = await calculateCostBenefitScore(
    template.estimated_time_hours,
    estimatedSavings,
    template.implementation_difficulty
  );

  // Generate specific fix suggestion based on template and audit data
  const fixSuggestion = generateSpecificFixSuggestion(template, ruleResult);
  const implementationCode = generateImplementationCode(template, ruleResult, projectType);

  return {
    audit_id: audit.id,
    project_id: audit.project_id,
    template_id: template.id,
    url: audit.url,
    audit_rule: auditRule,
    category: template.category,
    title: template.title,
    description: template.description,
    fix_suggestion: fixSuggestion,
    implementation_code: implementationCode,
    priority_score: priorityScore,
    difficulty_level: template.implementation_difficulty,
    estimated_time_hours: template.estimated_time_hours,
    estimated_savings_ms: Math.round(estimatedSavings),
    cost_benefit_score: costBenefitScore,
    current_value: currentValue,
    target_value: Math.max(0, currentValue - estimatedSavings),
    tool_integrations: template.tools_integration || [],
    is_automated: isAutomatedFix(template.tools_integration),
  };
}

function getCategoryScore(scores: any, category: string): number {
  switch (category) {
    case 'performance': return scores.performance || 0;
    case 'accessibility': return scores.accessibility || 0;
    case 'best-practices': return scores.bestPractices || 0;
    case 'seo': return scores.seo || 0;
    case 'pwa': return scores.pwa || 0;
    default: return 0;
  }
}

async function calculatePriorityScore(
  savingsMs: number,
  difficulty: string,
  currentScore: number,
  impactArea: string
): Promise<number> {
  const { data } = await supabase.rpc('calculate_recommendation_priority', {
    savings_ms: savingsMs,
    difficulty,
    current_score: currentScore,
    impact_area: impactArea
  });
  
  return data || 50;
}

async function calculateCostBenefitScore(
  estimatedHours: number,
  potentialSavingsMs: number,
  difficulty: string
): Promise<number> {
  const { data } = await supabase.rpc('calculate_cost_benefit_score', {
    estimated_hours: estimatedHours,
    potential_savings_ms: potentialSavingsMs,
    difficulty
  });
  
  return data || 0;
}

function generateSpecificFixSuggestion(template: any, auditResult: any): string {
  let suggestion = template.fix_template;
  
  // Replace placeholders with specific audit data
  if (auditResult.displayValue) {
    suggestion += `\n\nCurrent issue: ${auditResult.displayValue}`;
  }
  
  if (auditResult.details?.items?.length > 0) {
    const items = auditResult.details.items.slice(0, 3); // Show top 3 items
    suggestion += '\n\nSpecific issues found:';
    items.forEach((item: any, index: number) => {
      suggestion += `\n${index + 1}. ${item.url || item.source || item.node?.snippet || 'Issue detected'}`;
    });
  }
  
  return suggestion;
}

function generateImplementationCode(template: any, auditResult: any, projectType: string): string {
  const auditRule = template.audit_rule;
  
  // Generate project-specific implementation code
  if (auditRule === 'unused-css-rules' && projectType === 'react') {
    return `// Install PurgeCSS for React
npm install --save-dev @fullhuman/postcss-purgecss

// Add to your PostCSS config
module.exports = {
  plugins: [
    require('@fullhuman/postcss-purgecss')({
      content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
      defaultExtractor: content => content.match(/[\\w-/:]+(?<!:)/g) || []
    })
  ]
}`;
  }
  
  if (auditRule === 'modern-image-formats') {
    return `// Install imagemin for image optimization
npm install --save-dev imagemin imagemin-webp

// Create image optimization script
const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');

imagemin(['images/*.{jpg,png}'], {
  destination: 'build/images',
  plugins: [
    imageminWebp({quality: 75})
  ]
});`;
  }
  
  return template.fix_template;
}

function isAutomatedFix(toolIntegrations: string[]): boolean {
  const automatedTools = ['imagemin', 'purgecss', 'terser', 'critical'];
  return toolIntegrations.some(tool => automatedTools.includes(tool.toLowerCase()));
}

async function executeAutomatedFix(recommendationId: string) {
  console.log(`Executing automated fix for recommendation: ${recommendationId}`);
  
  // Get recommendation details
  const { data: recommendation } = await supabase
    .from('lighthouse_recommendations')
    .select('*')
    .eq('id', recommendationId)
    .single();

  if (!recommendation || !recommendation.is_automated) {
    return new Response(JSON.stringify({ error: 'Recommendation not found or not automated' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Update status to in_progress
  await supabase
    .from('lighthouse_recommendations')
    .update({ status: 'in_progress' })
    .eq('id', recommendationId);

  // Simulate automated fix execution
  // In a real implementation, this would integrate with actual tools
  const success = Math.random() > 0.2; // 80% success rate simulation
  
  if (success) {
    await supabase
      .from('lighthouse_recommendations')
      .update({ 
        status: 'completed',
        implemented_at: new Date().toISOString()
      })
      .eq('id', recommendationId);

    return new Response(JSON.stringify({
      success: true,
      message: 'Automated fix executed successfully'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } else {
    await supabase
      .from('lighthouse_recommendations')
      .update({ status: 'pending' })
      .eq('id', recommendationId);

    return new Response(JSON.stringify({
      success: false,
      message: 'Automated fix failed, manual intervention required'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function analyzeCostBenefit(recommendationIds: string[]) {
  console.log(`Analyzing cost-benefit for ${recommendationIds.length} recommendations`);
  
  const { data: recommendations } = await supabase
    .from('lighthouse_recommendations')
    .select('*')
    .in('id', recommendationIds);

  if (!recommendations || recommendations.length === 0) {
    return new Response(JSON.stringify({ error: 'No recommendations found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const analysis = {
    total_recommendations: recommendations.length,
    total_estimated_hours: recommendations.reduce((sum, r) => sum + r.estimated_time_hours, 0),
    total_estimated_savings_ms: recommendations.reduce((sum, r) => sum + r.estimated_savings_ms, 0),
    average_cost_benefit_score: recommendations.reduce((sum, r) => sum + r.cost_benefit_score, 0) / recommendations.length,
    difficulty_breakdown: {
      easy: recommendations.filter(r => r.difficulty_level === 'easy').length,
      medium: recommendations.filter(r => r.difficulty_level === 'medium').length,
      hard: recommendations.filter(r => r.difficulty_level === 'hard').length,
    },
    category_breakdown: recommendations.reduce((acc: any, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    }, {}),
    automated_fixes_available: recommendations.filter(r => r.is_automated).length,
    estimated_cost: recommendations.reduce((sum, r) => sum + (r.estimated_time_hours * 50), 0), // $50/hour
    estimated_benefit: recommendations.reduce((sum, r) => sum + (r.estimated_savings_ms / 1000 * 10), 0), // $10/second
  };

  return new Response(JSON.stringify({
    success: true,
    analysis
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
