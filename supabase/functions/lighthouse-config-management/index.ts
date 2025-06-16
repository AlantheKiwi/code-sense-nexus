
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Lighthouse configuration management function started');

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface ConfigurationRequest {
  action: 'validate' | 'clone' | 'export' | 'import';
  configurationId?: string;
  settings?: any;
  importData?: any;
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
    const request: ConfigurationRequest = await req.json();

    switch (request.action) {
      case 'validate':
        return await validateConfiguration(request.settings);
      
      case 'clone':
        return await cloneConfiguration(request.configurationId!);
      
      case 'export':
        return await exportConfiguration(request.configurationId!);
      
      case 'import':
        return await importConfiguration(request.importData);
      
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error: any) {
    console.error('Error in configuration management:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function validateConfiguration(settings: any) {
  const validationErrors: string[] = [];

  // Validate device setting
  if (!settings.device || !['mobile', 'desktop', 'tablet'].includes(settings.device)) {
    validationErrors.push('Device must be mobile, desktop, or tablet');
  }

  // Validate network throttling
  const validNetworks = ['4G', '3G', '2G', 'broadband', 'offline'];
  if (!settings.networkThrottling || !validNetworks.includes(settings.networkThrottling)) {
    validationErrors.push('Network throttling must be one of: ' + validNetworks.join(', '));
  }

  // Validate CPU throttling
  if (typeof settings.cpuThrottling !== 'number' || settings.cpuThrottling < 1 || settings.cpuThrottling > 10) {
    validationErrors.push('CPU throttling must be a number between 1 and 10');
  }

  // Validate viewport
  if (!settings.viewport || !settings.viewport.width || !settings.viewport.height) {
    validationErrors.push('Viewport width and height are required');
  }

  // Validate performance budget if provided
  if (settings.performanceBudget) {
    const budgetKeys = ['performance', 'accessibility', 'bestPractices', 'seo', 'pwa'];
    for (const key of budgetKeys) {
      const value = settings.performanceBudget[key];
      if (value !== undefined && (typeof value !== 'number' || value < 0 || value > 100)) {
        validationErrors.push(`Performance budget ${key} must be a number between 0 and 100`);
      }
    }
  }

  return new Response(JSON.stringify({
    valid: validationErrors.length === 0,
    errors: validationErrors
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function cloneConfiguration(configurationId: string) {
  const { data: originalConfig, error } = await supabase
    .from('lighthouse_configurations')
    .select('*')
    .eq('id', configurationId)
    .single();

  if (error || !originalConfig) {
    throw new Error('Configuration not found');
  }

  const clonedConfig = {
    name: `${originalConfig.name} (Copy)`,
    settings: originalConfig.settings,
    audit_categories: originalConfig.audit_categories,
    organization_id: originalConfig.organization_id,
    project_id: originalConfig.project_id,
    is_default: false,
  };

  const { data: newConfig, error: insertError } = await supabase
    .from('lighthouse_configurations')
    .insert(clonedConfig)
    .select()
    .single();

  if (insertError) {
    throw insertError;
  }

  return new Response(JSON.stringify({
    success: true,
    configuration: newConfig
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function exportConfiguration(configurationId: string) {
  const { data: config, error } = await supabase
    .from('lighthouse_configurations')
    .select('name, settings, audit_categories')
    .eq('id', configurationId)
    .single();

  if (error || !config) {
    throw new Error('Configuration not found');
  }

  return new Response(JSON.stringify({
    success: true,
    export: {
      name: config.name,
      settings: config.settings,
      audit_categories: config.audit_categories,
      exported_at: new Date().toISOString(),
      version: '1.0'
    }
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function importConfiguration(importData: any) {
  if (!importData.name || !importData.settings || !importData.audit_categories) {
    throw new Error('Invalid import data format');
  }

  const configData = {
    name: `${importData.name} (Imported)`,
    settings: importData.settings,
    audit_categories: importData.audit_categories,
    is_default: false,
  };

  const { data: newConfig, error } = await supabase
    .from('lighthouse_configurations')
    .insert(configData)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return new Response(JSON.stringify({
    success: true,
    configuration: newConfig
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
