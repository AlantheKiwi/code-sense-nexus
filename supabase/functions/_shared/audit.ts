
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export async function logAuditEvent(supabaseAdmin: SupabaseClient, req: Request, action: string, resource?: any, details?: any) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
        console.warn('Audit log skipped: Missing Authorization header')
        return
    }
    
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        console.warn('Audit log skipped: Could not get user from token')
        return
    }

    const { data: partner_id, error: rpcError } = await supabase.rpc('get_my_partner_id')
    if(rpcError) {
      // Not all users are partners, so this is not a critical error.
      console.warn(`Audit log: could not retrieve partner_id for user ${user.id}. Error: ${rpcError.message}`)
    }

    const ipAddress = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim()
    const userAgent = req.headers.get('user-agent')
    
    const { error } = await supabaseAdmin.from('audit_logs').insert({
        partner_id, // This can be null, which is fine.
        user_id: user.id,
        action,
        resource,
        details,
        ip_address: ipAddress,
        user_agent: userAgent,
    })
    if (error) {
        console.error("Failed to insert audit log:", error.message)
    }

  } catch(e) {
      console.error("Failed to log audit event:", e.message)
  }
}
