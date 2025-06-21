
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useLegalDocument = (documentType: string) => {
  return useQuery({
    queryKey: ['legal-document', documentType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('content')
        .eq('document_type', documentType)
        .eq('is_active', true)
        .single();
      
      if (error) {
        console.error('Error fetching legal document:', error);
        return null;
      }
      
      return data?.content;
    }
  });
};
