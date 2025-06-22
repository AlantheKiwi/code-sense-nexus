
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RepositoryAuditRecord {
  id: string;
  audit_id: string;
  user_id: string;
  repository_url: string;
  repository_name: string;
  audit_type: string;
  overall_score: number;
  executive_summary: any;
  file_results: any;
  security_summary: any;
  quality_summary: any;
  performance_summary: any;
  audit_metadata: any;
  created_at: string;
  updated_at: string;
}

export const useRepositoryAudits = () => {
  return useQuery({
    queryKey: ['repository-audits'],
    queryFn: async (): Promise<RepositoryAuditRecord[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Use direct table access with type assertion
      const { data, error } = await (supabase as any)
        .from('repository_audit_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: true
  });
};

export const useRepositoryAudit = (auditId: string) => {
  return useQuery({
    queryKey: ['repository-audit', auditId],
    queryFn: async (): Promise<RepositoryAuditRecord | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await (supabase as any)
        .from('repository_audit_results')
        .select('*')
        .eq('audit_id', auditId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!auditId
  });
};
