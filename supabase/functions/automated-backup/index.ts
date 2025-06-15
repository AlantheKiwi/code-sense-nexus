
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (_req) => {
    // This function should be triggered by a cron job.
    // It is not meant to be called by users directly.

    try {
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        console.log("Starting automated backup job...");

        // 1. Find schedules that are due
        const { data: schedules, error: schedulesError } = await supabaseAdmin
            .from('backup_schedules')
            .select('*')
            .eq('is_active', true)
            .lte('next_run_at', new Date().toISOString());

        if (schedulesError) throw schedulesError;

        if (!schedules || schedules.length === 0) {
            console.log("No backup schedules are due to run.");
            return new Response(JSON.stringify({ message: "No schedules to run." }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }
        
        console.log(`Found ${schedules.length} backup schedules to process.`);

        for (const schedule of schedules) {
            // 2. Create a history record
            const { data: history, error: historyInsertError } = await supabaseAdmin
                .from('backup_history')
                .insert({
                    schedule_id: schedule.id,
                    partner_id: schedule.partner_id,
                    backup_type: schedule.backup_type,
                    status: 'in_progress',
                    started_at: new Date().toISOString(),
                })
                .select()
                .single();
            
            if (historyInsertError) {
                console.error(`Failed to create backup history for schedule ${schedule.id}:`, historyInsertError.message);
                continue; // Move to the next schedule
            }

            console.log(`Backup started for schedule ${schedule.id}. History ID: ${history.id}`);
            
            // 3. Simulate backup process (placeholder)
            const backupFilePath = `backups/${schedule.partner_id}/${schedule.backup_type}_${new Date().toISOString()}.bak`;
            const backupSizeBytes = Math.floor(Math.random() * 1000000000);
            
            // 4. Update history record with completion status
            const { error: historyUpdateError } = await supabaseAdmin
                .from('backup_history')
                .update({
                    status: 'succeeded',
                    completed_at: new Date().toISOString(),
                    file_path: backupFilePath,
                    size_bytes: backupSizeBytes,
                    checksum: 'dummy-checksum-' + Math.random().toString(36).substring(2),
                    logs: { message: "Backup simulation completed successfully." }
                })
                .eq('id', history.id);

            if (historyUpdateError) {
                console.error(`Failed to update backup history ${history.id}:`, historyUpdateError.message);
                 await supabaseAdmin.from('backup_history').update({ status: 'failed', logs: { error: historyUpdateError.message } }).eq('id', history.id)
                continue;
            }

            // 5. Update the schedule's next run time
            const nextRunDate = new Date(schedule.next_run_at || new Date());
            if (schedule.frequency === 'daily') {
                nextRunDate.setDate(nextRunDate.getDate() + 1);
            } else if (schedule.frequency === 'weekly') {
                nextRunDate.setDate(nextRunDate.getDate() + 7);
            } else if (schedule.frequency === 'monthly') {
                nextRunDate.setMonth(nextRunDate.getMonth() + 1);
            }

            const { error: scheduleUpdateError } = await supabaseAdmin
                .from('backup_schedules')
                .update({
                    last_run_at: new Date().toISOString(),
                    next_run_at: nextRunDate.toISOString()
                })
                .eq('id', schedule.id);
            
            if(scheduleUpdateError){
                console.error(`Failed to update schedule ${schedule.id}:`, scheduleUpdateError.message);
            } else {
                console.log(`Successfully completed backup for schedule ${schedule.id}. Next run at ${nextRunDate.toISOString()}`);
            }
        }

        return new Response(JSON.stringify({ success: true, message: `Processed ${schedules.length} schedules.` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (e) {
        console.error('Error in automated-backup function:', e.message);
        return new Response(JSON.stringify({ error: e.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
