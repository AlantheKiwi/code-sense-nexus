
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

async function enqueueNotification(
    supabaseAdmin: SupabaseClient,
    {
        partner_id,
        user_id,
        notification_type,
        channel_type,
        content,
    }: {
        partner_id: string;
        user_id: string;
        notification_type: string;
        channel_type: any; // Using `any` to match notification_channel_type enum
        content: any;
    }
) {
    const { error } = await supabaseAdmin.from('notification_queue').insert({
        partner_id,
        user_id,
        notification_type,
        channel_type,
        content,
    });

    if (error) {
        console.error(`Failed to enqueue notification for user ${user_id}`, error.message);
    } else {
        console.log(`Successfully enqueued '${notification_type}' notification for user ${user_id} via ${channel_type}`);
    }
}

export async function enqueueNotificationsForUser(
    supabaseAdmin: SupabaseClient,
    {
        partner_id,
        user_id,
        notification_type,
        content,
    }: {
        partner_id: string;
        user_id: string;
        notification_type: string;
        content: any;
    }
) {
    // 1. Get user preferences for this notification type
    const { data: preferences, error: prefError } = await supabaseAdmin
        .from('notification_preferences')
        .select('channel_type')
        .eq('user_id', user_id)
        .eq('notification_type', notification_type)
        .eq('enabled', true)

    if (prefError) {
        console.error(`Could not get notification preferences for user ${user_id}`, prefError.message);
        return;
    }

    if (!preferences || preferences.length === 0) {
        console.log(`User ${user_id} has no enabled preferences for '${notification_type}'. Defaulting to in_app.`);
        // For demonstration, let's enqueue an in_app notification by default if no preference is set.
        await enqueueNotification(supabaseAdmin, {
            partner_id,
            user_id,
            notification_type,
            channel_type: 'in_app',
            content,
        })
        return;
    }

    // 2. Enqueue a notification for each enabled channel
    const notificationsToEnqueue = preferences.map(pref => {
        return enqueueNotification(supabaseAdmin, {
            partner_id,
            user_id,
            notification_type,
            channel_type: pref.channel_type,
            content,
        })
    });
    
    await Promise.all(notificationsToEnqueue);
}
