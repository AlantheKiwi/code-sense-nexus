
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

async function getWidgetData(supabaseAdmin: SupabaseClient, widgetId: string) {
    // 1. Fetch the data source configuration for the widget
    const { data: dataSource, error: dataSourceError } = await supabaseAdmin
        .from('widget_data_sources')
        .select(`
            data_source_table,
            query_config
        `)
        .eq('widget_id', widgetId)
        .single();

    if (dataSourceError) {
        throw new Error(`Failed to fetch data source for widget ${widgetId}: ${dataSourceError.message}`);
    }

    if (!dataSource) {
        throw new Error(`No data source found for widget ${widgetId}`);
    }

    const { data_source_table, query_config } = dataSource;
    
    console.log(`Fetching data for widget ${widgetId} from table ${data_source_table} with config:`, query_config);

    // 2. Build and execute the query based on the config. This is a simplified example.
    let query = supabaseAdmin.from(data_source_table).select(query_config.select || '*');
    
    if (query_config.filters) {
        for (const filter of query_config.filters) {
            query = query.filter(filter.column, filter.operator, filter.value);
        }
    }

    if (query_config.limit) {
        query = query.limit(query_config.limit);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(`Failed to fetch data from ${data_source_table}: ${error.message}`);
    }

    return data;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { widgetId } = await req.json();
        if (!widgetId) {
            throw new Error("widgetId is required.");
        }

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const data = await getWidgetData(supabaseAdmin, widgetId);

        return new Response(JSON.stringify({ data }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (e) {
        console.error('Error in generate-widget-data function:', e.message);
        return new Response(JSON.stringify({ error: e.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
