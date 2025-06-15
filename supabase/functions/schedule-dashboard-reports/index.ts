
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { enqueueNotificationsForUser } from '../_shared/notifications.ts'

// This function is intended to be run by a cron job to send scheduled reports.

serve(async (_req) => {
    if (_req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        console.log("Checking for scheduled dashboard reports to send...");

        // Placeholder: find a user and a dashboard to "send" a report for.
        const { data: partner, error: partnerError } = await supabaseAdmin
            .from('partners')
            .select('id, user_id')
            .limit(1)
            .single();

        if (partnerError || !partner) {
            console.log("No partners found to send scheduled reports to.");
            return new Response(JSON.stringify({ message: 'No partners found.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }
        
        console.log(`Found a "scheduled" report for user ${partner.user_id}. Enqueueing notification.`);
        
        await enqueueNotificationsForUser(supabaseAdmin, {
            partner_id: partner.id,
            user_id: partner.user_id,
            notification_type: 'scheduled_report',
            content: {
                report_name: "Weekly Performance Summary",
                download_link: "#"
            }
        });
        
        return new Response(JSON.stringify({ message: "Checked for scheduled reports and enqueued notifications." }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (e) {
        console.error('Error in schedule-dashboard-reports function:', e.message);
        return new Response(JSON.stringify({ error: e.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
