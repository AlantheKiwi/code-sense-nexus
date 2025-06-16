
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

    // Get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get partner information
    const { data: partner } = await supabase
      .from('partners')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!partner) {
      return new Response(JSON.stringify({ error: 'Partner not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    switch (action) {
      case 'list':
        return await listConfigurations(supabase, partner.id);
      case 'get':
        const configId = url.searchParams.get('id');
        return await getConfiguration(supabase, configId, partner.id);
      case 'create':
        const createData = await req.json();
        return await createConfiguration(supabase, createData, partner.id, user.id);
      case 'update':
        const updateData = await req.json();
        return await updateConfiguration(supabase, updateData, partner.id);
      case 'delete':
        const deleteId = url.searchParams.get('id');
        return await deleteConfiguration(supabase, deleteId, partner.id);
      case 'templates':
        return await getTemplates(supabase);
      case 'validate':
        const validateData = await req.json();
        return await validateConfiguration(validateData);
      case 'export':
        const exportId = url.searchParams.get('id');
        return await exportConfiguration(supabase, exportId, partner.id);
      case 'import':
        const importData = await req.json();
        return await importConfiguration(supabase, importData, partner.id, user.id);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error: any) {
    console.error('ESLint config management error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function listConfigurations(supabase: any, partnerId: string) {
  const { data, error } = await supabase
    .from('eslint_configurations')
    .select('*')
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch configurations: ${error.message}`);
  }

  return new Response(JSON.stringify({ configurations: data }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getConfiguration(supabase: any, configId: string | null, partnerId: string) {
  if (!configId) {
    return new Response(JSON.stringify({ error: 'Configuration ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data, error } = await supabase
    .from('eslint_configurations')
    .select('*')
    .eq('id', configId)
    .eq('partner_id', partnerId)
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: 'Configuration not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ configuration: data }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function createConfiguration(supabase: any, data: any, partnerId: string, userId: string) {
  const { name, description, rules, project_type, is_default } = data;

  if (!name || !rules) {
    return new Response(JSON.stringify({ error: 'Name and rules are required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Validate rules format
  const validation = validateRules(rules);
  if (!validation.valid) {
    return new Response(JSON.stringify({ error: validation.error }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: newConfig, error } = await supabase
    .from('eslint_configurations')
    .insert({
      name,
      description,
      rules,
      project_type,
      is_default: is_default || false,
      partner_id: partnerId,
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create configuration: ${error.message}`);
  }

  return new Response(JSON.stringify({ configuration: newConfig }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function updateConfiguration(supabase: any, data: any, partnerId: string) {
  const { id, name, description, rules, project_type, is_default } = data;

  if (!id) {
    return new Response(JSON.stringify({ error: 'Configuration ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Validate rules if provided
  if (rules) {
    const validation = validateRules(rules);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  const updateData: any = { updated_at: new Date().toISOString() };
  if (name) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (rules) updateData.rules = rules;
  if (project_type) updateData.project_type = project_type;
  if (is_default !== undefined) updateData.is_default = is_default;

  const { data: updatedConfig, error } = await supabase
    .from('eslint_configurations')
    .update(updateData)
    .eq('id', id)
    .eq('partner_id', partnerId)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: 'Configuration not found or update failed' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ configuration: updatedConfig }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function deleteConfiguration(supabase: any, configId: string | null, partnerId: string) {
  if (!configId) {
    return new Response(JSON.stringify({ error: 'Configuration ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { error } = await supabase
    .from('eslint_configurations')
    .delete()
    .eq('id', configId)
    .eq('partner_id', partnerId);

  if (error) {
    return new Response(JSON.stringify({ error: 'Configuration not found or delete failed' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ message: 'Configuration deleted successfully' }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getTemplates(supabase: any) {
  const { data, error } = await supabase
    .from('eslint_configuration_templates')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch templates: ${error.message}`);
  }

  return new Response(JSON.stringify({ templates: data }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function validateConfiguration(data: any) {
  const { rules } = data;
  
  const validation = validateRules(rules);
  
  return new Response(JSON.stringify(validation), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function exportConfiguration(supabase: any, configId: string | null, partnerId: string) {
  if (!configId) {
    return new Response(JSON.stringify({ error: 'Configuration ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data, error } = await supabase
    .from('eslint_configurations')
    .select('name, description, rules, project_type')
    .eq('id', configId)
    .eq('partner_id', partnerId)
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: 'Configuration not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const exportData = {
    ...data,
    exported_at: new Date().toISOString(),
    version: '1.0'
  };

  return new Response(JSON.stringify({ export: exportData }), {
    status: 200,
    headers: { 
      ...corsHeaders, 
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${data.name.replace(/\s+/g, '_')}_eslint_config.json"`
    },
  });
}

async function importConfiguration(supabase: any, data: any, partnerId: string, userId: string) {
  const { config } = data;
  
  if (!config || !config.name || !config.rules) {
    return new Response(JSON.stringify({ error: 'Invalid configuration format' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Validate imported rules
  const validation = validateRules(config.rules);
  if (!validation.valid) {
    return new Response(JSON.stringify({ error: validation.error }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: newConfig, error } = await supabase
    .from('eslint_configurations')
    .insert({
      name: `${config.name} (Imported)`,
      description: config.description || 'Imported configuration',
      rules: config.rules,
      project_type: config.project_type,
      is_default: false,
      partner_id: partnerId,
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to import configuration: ${error.message}`);
  }

  return new Response(JSON.stringify({ configuration: newConfig }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function validateRules(rules: any): { valid: boolean; error?: string } {
  try {
    if (typeof rules !== 'object' || rules === null) {
      return { valid: false, error: 'Rules must be a valid JSON object' };
    }

    // Check if it has rules property
    if (!rules.rules && !rules.extends) {
      return { valid: false, error: 'Configuration must have either "rules" or "extends" property' };
    }

    // Validate rule values
    if (rules.rules) {
      for (const [ruleName, ruleValue] of Object.entries(rules.rules)) {
        if (!isValidRuleValue(ruleValue)) {
          return { valid: false, error: `Invalid value for rule "${ruleName}"` };
        }
      }
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid JSON format' };
  }
}

function isValidRuleValue(value: any): boolean {
  // ESLint rule values can be:
  // - "off", "warn", "error" (strings)
  // - 0, 1, 2 (numbers)
  // - Arrays with first element being severity and rest being options
  
  if (typeof value === 'string') {
    return ['off', 'warn', 'error'].includes(value);
  }
  
  if (typeof value === 'number') {
    return [0, 1, 2].includes(value);
  }
  
  if (Array.isArray(value) && value.length > 0) {
    const severity = value[0];
    return (typeof severity === 'string' && ['off', 'warn', 'error'].includes(severity)) ||
           (typeof severity === 'number' && [0, 1, 2].includes(severity));
  }
  
  return false;
}
