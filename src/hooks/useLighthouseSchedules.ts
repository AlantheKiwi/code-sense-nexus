
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LighthouseSchedule } from './useLighthouseConfigurations';

export function useLighthouseSchedules(projectId?: string) {
  const [schedules, setSchedules] = useState<LighthouseSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('lighthouse_schedules')
        .select(`
          *,
          lighthouse_configurations (
            name,
            settings
          )
        `)
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      const transformedData: LighthouseSchedule[] = (data || []).map(item => ({
        id: item.id,
        configuration_id: item.configuration_id,
        project_id: item.project_id,
        urls: item.urls as string[],
        frequency: item.frequency as LighthouseSchedule['frequency'],
        schedule_time: item.schedule_time,
        is_active: item.is_active,
        last_run_at: item.last_run_at,
        next_run_at: item.next_run_at,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      setSchedules(transformedData);
    } catch (error: any) {
      console.error('Error fetching Lighthouse schedules:', error);
      toast.error('Failed to fetch Lighthouse schedules');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [projectId]);

  return {
    schedules,
    isLoading,
    refreshSchedules: fetchSchedules,
  };
}
