
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (_req) => {
    // This function should be triggered by a cron job, e.g., daily.

    try {
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        console.log("Starting old backups cleanup job...");
        
        // Find all active schedules to get their retention policies
        const { data: schedules, error: schedulesError } = await supabaseAdmin
            .from('backup_schedules')
            .select('id, retention_days');
        
        if (schedulesError) throw schedulesError;

        let totalCleaned = 0;

        for(const schedule of schedules) {
            const retentionPeriod = schedule.retention_days;
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retentionPeriod);

            // Find old backups for this schedule
            const { data: oldBackups, error: oldBackupsError } = await supabaseAdmin
                .from('backup_history')
                .select('id, file_path')
                .eq('schedule_id', schedule.id)
                .eq('status', 'succeeded')
                .lt('completed_at', cutoffDate.toISOString());

            if (oldBackupsError) {
                console.error(`Error fetching old backups for schedule ${schedule.id}:`, oldBackupsError.message);
                continue;
            }

            if(oldBackups && oldBackups.length > 0) {
                console.log(`Found ${oldBackups.length} old backups to clean for schedule ${schedule.id}.`);
                
                const backupIds = oldBackups.map(b => b.id);
                const filePaths = oldBackups.map(b => b.file_path).filter(p => p);

                if (filePaths.length > 0) {
                    console.log(`Placeholder: Deleting files from storage:`, filePaths);
                    // In a real system, you'd uncomment this:
                    // const { error: storageError } = await supabaseAdmin.storage.from('backups').remove(filePaths);
                    // if (storageError) console.error("Storage deletion error:", storageError.message);
                }

                // Update their status in the database
                const { error: updateError } = await supabaseAdmin
                    .from('backup_history')
                    .update({ status: 'deleted', logs: { message: "Cleaned up due to retention policy." } })
                    .in('id', backupIds);

                if (updateError) {
                    console.error(`Error updating status for old backups:`, updateError.message);
                } else {
                    totalCleaned += oldBackups.length;
                }
            }
        }
        
        console.log(`Cleanup job finished. Cleaned ${totalCleaned} old backup records.`);

        return new Response(JSON.stringify({ success: true, cleaned_count: totalCleaned }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (e) {
        console.error('Error in cleanup-old-backups function:', e.message);
        return new Response(JSON.stringify({ error: e.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
