export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_user_id: string | null
          created_at: string | null
          details: Json | null
          id: string
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
        }
        Relationships: []
      }
      ai_analysis_results: {
        Row: {
          analysis_result: Json | null
          analysis_type: string
          code_hash: string
          created_at: string
          id: string
          project_id: string
          quality_score: number | null
          user_id: string
        }
        Insert: {
          analysis_result?: Json | null
          analysis_type: string
          code_hash: string
          created_at?: string
          id?: string
          project_id: string
          quality_score?: number | null
          user_id: string
        }
        Update: {
          analysis_result?: Json | null
          analysis_type?: string
          code_hash?: string
          created_at?: string
          id?: string
          project_id?: string
          quality_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_analysis_results_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_fix_suggestions: {
        Row: {
          analysis_id: string
          created_at: string
          id: string
          implementation_code: string | null
          priority: string
          suggestion_text: string
        }
        Insert: {
          analysis_id: string
          created_at?: string
          id?: string
          implementation_code?: string | null
          priority?: string
          suggestion_text: string
        }
        Update: {
          analysis_id?: string
          created_at?: string
          id?: string
          implementation_code?: string | null
          priority?: string
          suggestion_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_fix_suggestions_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "ai_analysis_results"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_interactions: {
        Row: {
          completion_tokens: number | null
          cost: number | null
          created_at: string
          function_name: string
          id: string
          partner_id: string
          project_id: string | null
          prompt_tokens: number | null
          total_tokens: number | null
          user_id: string
        }
        Insert: {
          completion_tokens?: number | null
          cost?: number | null
          created_at?: string
          function_name: string
          id?: string
          partner_id: string
          project_id?: string | null
          prompt_tokens?: number | null
          total_tokens?: number | null
          user_id: string
        }
        Update: {
          completion_tokens?: number | null
          cost?: number | null
          created_at?: string
          function_name?: string
          id?: string
          partner_id?: string
          project_id?: string | null
          prompt_tokens?: number | null
          total_tokens?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_interactions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_interactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_results: {
        Row: {
          created_at: string
          details: Json | null
          id: string
          issues_found: number | null
          pipeline_run_id: string
          quality_score: number | null
          report_url: string | null
          tool_used: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          id?: string
          issues_found?: number | null
          pipeline_run_id: string
          quality_score?: number | null
          report_url?: string | null
          tool_used: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          id?: string
          issues_found?: number | null
          pipeline_run_id?: string
          quality_score?: number | null
          report_url?: string | null
          tool_used?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_results_pipeline_run_id_fkey"
            columns: ["pipeline_run_id"]
            isOneToOne: false
            referencedRelation: "pipeline_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      api_changelog: {
        Row: {
          breaking_changes: string | null
          changes: string | null
          created_at: string
          id: string
          partner_id: string
          release_date: string
          version: string
        }
        Insert: {
          breaking_changes?: string | null
          changes?: string | null
          created_at?: string
          id?: string
          partner_id: string
          release_date: string
          version: string
        }
        Update: {
          breaking_changes?: string | null
          changes?: string | null
          created_at?: string
          id?: string
          partner_id?: string
          release_date?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_changelog_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      api_documentation: {
        Row: {
          author_id: string | null
          content: string | null
          created_at: string
          endpoint_id: string
          id: string
          updated_at: string
          version: string
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          created_at?: string
          endpoint_id: string
          id?: string
          updated_at?: string
          version?: string
        }
        Update: {
          author_id?: string | null
          content?: string | null
          created_at?: string
          endpoint_id?: string
          id?: string
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_documentation_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "api_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      api_endpoints: {
        Row: {
          created_at: string
          id: string
          method: string
          parameters: Json | null
          partner_id: string
          path: string
          responses: Json | null
          summary: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          method: string
          parameters?: Json | null
          partner_id: string
          path: string
          responses?: Json | null
          summary?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          method?: string
          parameters?: Json | null
          partner_id?: string
          path?: string
          responses?: Json | null
          summary?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_endpoints_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      api_examples: {
        Row: {
          code_example: string
          created_at: string
          description: string | null
          endpoint_id: string
          id: string
          language: string
          updated_at: string
        }
        Insert: {
          code_example: string
          created_at?: string
          description?: string | null
          endpoint_id: string
          id?: string
          language: string
          updated_at?: string
        }
        Update: {
          code_example?: string
          created_at?: string
          description?: string | null
          endpoint_id?: string
          id?: string
          language?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_examples_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "api_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      api_key_configs: {
        Row: {
          api_key: string
          created_at: string
          id: string
          is_enabled: boolean
          scope: string
          tenant_id: string | null
          tool_category: string
          tool_name: string
          updated_at: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          scope?: string
          tenant_id?: string | null
          tool_category: string
          tool_name: string
          updated_at?: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          scope?: string
          tenant_id?: string | null
          tool_category?: string
          tool_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      api_usage_examples: {
        Row: {
          created_at: string
          difficulty_level: string | null
          full_example: string | null
          id: string
          partner_id: string
          updated_at: string
          use_case: string
        }
        Insert: {
          created_at?: string
          difficulty_level?: string | null
          full_example?: string | null
          id?: string
          partner_id: string
          updated_at?: string
          use_case: string
        }
        Update: {
          created_at?: string
          difficulty_level?: string | null
          full_example?: string | null
          id?: string
          partner_id?: string
          updated_at?: string
          use_case?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_examples_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      api_usage_logs: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          ip_address: unknown | null
          partner_id: string
          response_time_ms: number
          status_code: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          ip_address?: unknown | null
          partner_id: string
          response_time_ms: number
          status_code: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: unknown | null
          partner_id?: string
          response_time_ms?: number
          status_code?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_logs_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          partner_id: string | null
          resource: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          partner_id?: string | null
          resource?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          partner_id?: string | null
          resource?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_history: {
        Row: {
          backup_type: Database["public"]["Enums"]["backup_type"]
          checksum: string | null
          completed_at: string | null
          created_at: string
          file_path: string | null
          id: string
          logs: Json | null
          partner_id: string
          schedule_id: string | null
          size_bytes: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["backup_status"]
        }
        Insert: {
          backup_type: Database["public"]["Enums"]["backup_type"]
          checksum?: string | null
          completed_at?: string | null
          created_at?: string
          file_path?: string | null
          id?: string
          logs?: Json | null
          partner_id: string
          schedule_id?: string | null
          size_bytes?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["backup_status"]
        }
        Update: {
          backup_type?: Database["public"]["Enums"]["backup_type"]
          checksum?: string | null
          completed_at?: string | null
          created_at?: string
          file_path?: string | null
          id?: string
          logs?: Json | null
          partner_id?: string
          schedule_id?: string | null
          size_bytes?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["backup_status"]
        }
        Relationships: [
          {
            foreignKeyName: "backup_history_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "backup_history_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "backup_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_schedules: {
        Row: {
          backup_type: Database["public"]["Enums"]["backup_type"]
          created_at: string
          frequency: Database["public"]["Enums"]["backup_frequency"]
          id: string
          is_active: boolean
          last_run_at: string | null
          next_run_at: string | null
          partner_id: string
          retention_days: number
          time_of_day_utc: string
          updated_at: string
        }
        Insert: {
          backup_type: Database["public"]["Enums"]["backup_type"]
          created_at?: string
          frequency: Database["public"]["Enums"]["backup_frequency"]
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          next_run_at?: string | null
          partner_id: string
          retention_days: number
          time_of_day_utc?: string
          updated_at?: string
        }
        Update: {
          backup_type?: Database["public"]["Enums"]["backup_type"]
          created_at?: string
          frequency?: Database["public"]["Enums"]["backup_frequency"]
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          next_run_at?: string | null
          partner_id?: string
          retention_days?: number
          time_of_day_utc?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "backup_schedules_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string | null
          id: string
          invited_by: string | null
          partner_id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          partner_id: string
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          partner_id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      community_patterns: {
        Row: {
          fix_applied: boolean
          frequency: number | null
          id: string
          issue_type: string
          project_type: string
          submitted_at: string
          success_rate: number | null
          time_to_resolve: number | null
        }
        Insert: {
          fix_applied?: boolean
          frequency?: number | null
          id?: string
          issue_type: string
          project_type: string
          submitted_at?: string
          success_rate?: number | null
          time_to_resolve?: number | null
        }
        Update: {
          fix_applied?: boolean
          frequency?: number | null
          id?: string
          issue_type?: string
          project_type?: string
          submitted_at?: string
          success_rate?: number | null
          time_to_resolve?: number | null
        }
        Relationships: []
      }
      conversion_tracking: {
        Row: {
          conversion_data: Json | null
          created_at: string
          event_type: string
          feature_blocked: string | null
          id: string
          partner_id: string | null
          upgrade_tier: string | null
          user_id: string
        }
        Insert: {
          conversion_data?: Json | null
          created_at?: string
          event_type: string
          feature_blocked?: string | null
          id?: string
          partner_id?: string | null
          upgrade_tier?: string | null
          user_id: string
        }
        Update: {
          conversion_data?: Json | null
          created_at?: string
          event_type?: string
          feature_blocked?: string | null
          id?: string
          partner_id?: string | null
          upgrade_tier?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversion_tracking_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          balance: number
          created_at: string
          description: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          amount: number
          balance: number
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          amount?: number
          balance?: number
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      custom_dashboards: {
        Row: {
          created_at: string
          id: string
          is_public: boolean
          layout: Json | null
          name: string
          partner_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          layout?: Json | null
          name: string
          partner_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean
          layout?: Json | null
          name?: string
          partner_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_dashboards_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_shares: {
        Row: {
          dashboard_id: string
          id: string
          permission: Database["public"]["Enums"]["dashboard_permission_level"]
          shared_at: string
          shared_with_user_id: string
        }
        Insert: {
          dashboard_id: string
          id?: string
          permission?: Database["public"]["Enums"]["dashboard_permission_level"]
          shared_at?: string
          shared_with_user_id: string
        }
        Update: {
          dashboard_id?: string
          id?: string
          permission?: Database["public"]["Enums"]["dashboard_permission_level"]
          shared_at?: string
          shared_with_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_shares_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "custom_dashboards"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_widgets: {
        Row: {
          config: Json | null
          created_at: string
          dashboard_id: string
          id: string
          position: Json | null
          size: Json | null
          widget_type: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          dashboard_id: string
          id?: string
          position?: Json | null
          size?: Json | null
          widget_type: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          dashboard_id?: string
          id?: string
          position?: Json | null
          size?: Json | null
          widget_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_widgets_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "custom_dashboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboard_widgets_widget_type_fkey"
            columns: ["widget_type"]
            isOneToOne: false
            referencedRelation: "widget_templates"
            referencedColumns: ["widget_type"]
          },
        ]
      }
      debug_logs: {
        Row: {
          id: number
          log_data: Json
          session_id: string
          timestamp: string
          tool_id: string | null
        }
        Insert: {
          id?: number
          log_data: Json
          session_id: string
          timestamp?: string
          tool_id?: string | null
        }
        Update: {
          id?: number
          log_data?: Json
          session_id?: string
          timestamp?: string
          tool_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "debug_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "debugging_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debug_logs_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      debug_metrics: {
        Row: {
          created_at: string
          id: string
          issues_found: number | null
          resolution_time_ms: number | null
          session_id: string
          time_saved_ms: number | null
          tools_used: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          issues_found?: number | null
          resolution_time_ms?: number | null
          session_id: string
          time_saved_ms?: number | null
          tools_used?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          issues_found?: number | null
          resolution_time_ms?: number | null
          session_id?: string
          time_saved_ms?: number | null
          tools_used?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "debug_metrics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "debugging_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      debugging_sessions: {
        Row: {
          collaborators: Json | null
          created_at: string
          data: Json | null
          id: string
          project_id: string
          status: string
          team_id: string | null
          user_id: string | null
        }
        Insert: {
          collaborators?: Json | null
          created_at?: string
          data?: Json | null
          id?: string
          project_id: string
          status?: string
          team_id?: string | null
          user_id?: string | null
        }
        Update: {
          collaborators?: Json | null
          created_at?: string
          data?: Json | null
          id?: string
          project_id?: string
          status?: string
          team_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "debugging_sessions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debugging_sessions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      deployment_tracking: {
        Row: {
          created_at: string
          deployed_at: string | null
          environment: string
          health_status: string | null
          id: string
          pipeline_run_id: string
        }
        Insert: {
          created_at?: string
          deployed_at?: string | null
          environment: string
          health_status?: string | null
          id?: string
          pipeline_run_id: string
        }
        Update: {
          created_at?: string
          deployed_at?: string | null
          environment?: string
          health_status?: string | null
          id?: string
          pipeline_run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deployment_tracking_pipeline_run_id_fkey"
            columns: ["pipeline_run_id"]
            isOneToOne: false
            referencedRelation: "pipeline_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      disaster_recovery_configs: {
        Row: {
          backup_regions: Json | null
          created_at: string
          id: string
          is_active: boolean
          partner_id: string
          rpo_hours: number
          rto_hours: number
          updated_at: string
        }
        Insert: {
          backup_regions?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          partner_id: string
          rpo_hours: number
          rto_hours: number
          updated_at?: string
        }
        Update: {
          backup_regions?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          partner_id?: string
          rpo_hours?: number
          rto_hours?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disaster_recovery_configs_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: true
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      error_instances: {
        Row: {
          error_report_id: string
          id: string
          session_data: Json | null
          timestamp: string
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          error_report_id: string
          id?: string
          session_data?: Json | null
          timestamp?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          error_report_id?: string
          id?: string
          session_data?: Json | null
          timestamp?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "error_instances_error_report_id_fkey"
            columns: ["error_report_id"]
            isOneToOne: false
            referencedRelation: "error_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      error_reports: {
        Row: {
          context: Json | null
          count: number
          created_at: string
          error_hash: string
          id: string
          last_seen_at: string
          message: string
          project_id: string
          stack_trace: string | null
        }
        Insert: {
          context?: Json | null
          count?: number
          created_at?: string
          error_hash: string
          id?: string
          last_seen_at?: string
          message: string
          project_id: string
          stack_trace?: string | null
        }
        Update: {
          context?: Json | null
          count?: number
          created_at?: string
          error_hash?: string
          id?: string
          last_seen_at?: string
          message?: string
          project_id?: string
          stack_trace?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "error_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      error_resolutions: {
        Row: {
          assigned_to: string | null
          error_report_id: string
          fixed_at: string | null
          id: string
          resolution_notes: string | null
          status: Database["public"]["Enums"]["error_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          error_report_id: string
          fixed_at?: string | null
          id?: string
          resolution_notes?: string | null
          status?: Database["public"]["Enums"]["error_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          error_report_id?: string
          fixed_at?: string | null
          id?: string
          resolution_notes?: string | null
          status?: Database["public"]["Enums"]["error_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "error_resolutions_error_report_id_fkey"
            columns: ["error_report_id"]
            isOneToOne: true
            referencedRelation: "error_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      eslint_analysis_queue: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          max_retries: number
          priority: number
          progress: number
          project_id: string
          result_summary: Json | null
          retry_count: number
          scheduled_at: string
          started_at: string | null
          status: string
          status_message: string | null
          trigger_data: Json | null
          trigger_type: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          max_retries?: number
          priority?: number
          progress?: number
          project_id: string
          result_summary?: Json | null
          retry_count?: number
          scheduled_at?: string
          started_at?: string | null
          status?: string
          status_message?: string | null
          trigger_data?: Json | null
          trigger_type: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          max_retries?: number
          priority?: number
          progress?: number
          project_id?: string
          result_summary?: Json | null
          retry_count?: number
          scheduled_at?: string
          started_at?: string | null
          status?: string
          status_message?: string | null
          trigger_data?: Json | null
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      eslint_configuration_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          project_type: string
          rules: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          project_type: string
          rules?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          project_type?: string
          rules?: Json
        }
        Relationships: []
      }
      eslint_configurations: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_default: boolean
          name: string
          partner_id: string
          project_type: string | null
          rules: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean
          name: string
          partner_id: string
          project_type?: string | null
          rules?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean
          name?: string
          partner_id?: string
          project_type?: string | null
          rules?: Json
          updated_at?: string
        }
        Relationships: []
      }
      eslint_critical_alerts: {
        Row: {
          alert_type: string
          created_at: string
          file_path: string
          id: string
          is_resolved: boolean
          line_number: number | null
          message: string
          project_id: string
          resolved_at: string | null
          resolved_by: string | null
          result_id: string
          rule_id: string | null
        }
        Insert: {
          alert_type?: string
          created_at?: string
          file_path: string
          id?: string
          is_resolved?: boolean
          line_number?: number | null
          message: string
          project_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          result_id: string
          rule_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          file_path?: string
          id?: string
          is_resolved?: boolean
          line_number?: number | null
          message?: string
          project_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          result_id?: string
          rule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eslint_critical_alerts_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "eslint_results"
            referencedColumns: ["id"]
          },
        ]
      }
      eslint_fix_suggestions: {
        Row: {
          category: string
          code_example: string | null
          created_at: string
          difficulty_level: string
          estimated_time_minutes: number | null
          fix_description: string
          fixed_code_example: string | null
          id: string
          issue_description: string
          priority: number
          result_id: string
          rule_id: string
        }
        Insert: {
          category?: string
          code_example?: string | null
          created_at?: string
          difficulty_level?: string
          estimated_time_minutes?: number | null
          fix_description: string
          fixed_code_example?: string | null
          id?: string
          issue_description: string
          priority?: number
          result_id: string
          rule_id: string
        }
        Update: {
          category?: string
          code_example?: string | null
          created_at?: string
          difficulty_level?: string
          estimated_time_minutes?: number | null
          fix_description?: string
          fixed_code_example?: string | null
          id?: string
          issue_description?: string
          priority?: number
          result_id?: string
          rule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "eslint_fix_suggestions_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "eslint_results"
            referencedColumns: ["id"]
          },
        ]
      }
      eslint_project_summaries: {
        Row: {
          average_quality_score: number | null
          category_counts: Json
          created_at: string
          id: string
          last_analysis_at: string
          project_id: string
          severity_counts: Json
          total_files: number
          total_issues: number
          updated_at: string
        }
        Insert: {
          average_quality_score?: number | null
          category_counts?: Json
          created_at?: string
          id?: string
          last_analysis_at?: string
          project_id: string
          severity_counts?: Json
          total_files?: number
          total_issues?: number
          updated_at?: string
        }
        Update: {
          average_quality_score?: number | null
          category_counts?: Json
          created_at?: string
          id?: string
          last_analysis_at?: string
          project_id?: string
          severity_counts?: Json
          total_files?: number
          total_issues?: number
          updated_at?: string
        }
        Relationships: []
      }
      eslint_results: {
        Row: {
          configuration_used: string | null
          created_at: string
          file_path: string
          id: string
          issues: Json
          project_id: string
          quality_score: number | null
          severity_counts: Json
          total_issues: number
          updated_at: string
        }
        Insert: {
          configuration_used?: string | null
          created_at?: string
          file_path: string
          id?: string
          issues?: Json
          project_id: string
          quality_score?: number | null
          severity_counts?: Json
          total_issues?: number
          updated_at?: string
        }
        Update: {
          configuration_used?: string | null
          created_at?: string
          file_path?: string
          id?: string
          issues?: Json
          project_id?: string
          quality_score?: number | null
          severity_counts?: Json
          total_issues?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eslint_results_configuration_used_fkey"
            columns: ["configuration_used"]
            isOneToOne: false
            referencedRelation: "eslint_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      eslint_trends: {
        Row: {
          analysis_date: string
          category_counts: Json
          created_at: string
          files_analyzed: number
          id: string
          project_id: string
          quality_score: number | null
          severity_counts: Json
          total_issues: number
        }
        Insert: {
          analysis_date?: string
          category_counts?: Json
          created_at?: string
          files_analyzed?: number
          id?: string
          project_id: string
          quality_score?: number | null
          severity_counts?: Json
          total_issues?: number
        }
        Update: {
          analysis_date?: string
          category_counts?: Json
          created_at?: string
          files_analyzed?: number
          id?: string
          project_id?: string
          quality_score?: number | null
          severity_counts?: Json
          total_issues?: number
        }
        Relationships: []
      }
      github_app_installations: {
        Row: {
          created_at: string
          github_account_id: number
          github_account_login: string
          id: number
          partner_id: string
          repository_selection: string
          suspended_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          github_account_id: number
          github_account_login: string
          id: number
          partner_id: string
          repository_selection: string
          suspended_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          github_account_id?: number
          github_account_login?: string
          id?: number
          partner_id?: string
          repository_selection?: string
          suspended_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "github_app_installations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      github_tokens: {
        Row: {
          created_at: string
          encrypted_token: string
          expires_at: string | null
          id: string
          permissions: string[] | null
          token_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          encrypted_token: string
          expires_at?: string | null
          id?: string
          permissions?: string[] | null
          token_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          encrypted_token?: string
          expires_at?: string | null
          id?: string
          permissions?: string[] | null
          token_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      github_webhook_events: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          github_delivery_id: string
          id: string
          installation_id: number
          payload: Json
          processed_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          github_delivery_id: string
          id?: string
          installation_id: number
          payload: Json
          processed_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          github_delivery_id?: string
          id?: string
          installation_id?: number
          payload?: Json
          processed_at?: string | null
          status?: string
        }
        Relationships: []
      }
      issues: {
        Row: {
          analysis_id: string
          created_at: string
          description: string
          difficulty_level: string | null
          estimated_fix_time: string | null
          file_path: string
          id: string
          issue_category: string
          issue_type: string
          line_number: number | null
          project_id: string | null
          suggested_fix: string | null
          tenant_id: string | null
          title: string
        }
        Insert: {
          analysis_id: string
          created_at?: string
          description: string
          difficulty_level?: string | null
          estimated_fix_time?: string | null
          file_path: string
          id?: string
          issue_category: string
          issue_type: string
          line_number?: number | null
          project_id?: string | null
          suggested_fix?: string | null
          tenant_id?: string | null
          title: string
        }
        Update: {
          analysis_id?: string
          created_at?: string
          description?: string
          difficulty_level?: string | null
          estimated_fix_time?: string | null
          file_path?: string
          id?: string
          issue_category?: string
          issue_type?: string
          line_number?: number | null
          project_id?: string | null
          suggested_fix?: string | null
          tenant_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "code_issues_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "repository_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          content: string
          created_at: string | null
          document_type: string
          id: string
          is_active: boolean | null
          version: number
        }
        Insert: {
          content: string
          created_at?: string | null
          document_type: string
          id?: string
          is_active?: boolean | null
          version?: number
        }
        Update: {
          content?: string
          created_at?: string | null
          document_type?: string
          id?: string
          is_active?: boolean | null
          version?: number
        }
        Relationships: []
      }
      lighthouse_audits: {
        Row: {
          audit_id: string | null
          created_at: string
          device: string
          diagnostics: Json | null
          full_report: Json | null
          id: string
          metrics: Json
          opportunities: Json | null
          project_id: string | null
          scores: Json
          url: string
        }
        Insert: {
          audit_id?: string | null
          created_at?: string
          device: string
          diagnostics?: Json | null
          full_report?: Json | null
          id?: string
          metrics: Json
          opportunities?: Json | null
          project_id?: string | null
          scores: Json
          url: string
        }
        Update: {
          audit_id?: string | null
          created_at?: string
          device?: string
          diagnostics?: Json | null
          full_report?: Json | null
          id?: string
          metrics?: Json
          opportunities?: Json | null
          project_id?: string | null
          scores?: Json
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "lighthouse_audits_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      lighthouse_configurations: {
        Row: {
          audit_categories: Json
          created_at: string
          created_by: string | null
          id: string
          is_default: boolean
          name: string
          organization_id: string | null
          project_id: string | null
          settings: Json
          updated_at: string
        }
        Insert: {
          audit_categories?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_default?: boolean
          name: string
          organization_id?: string | null
          project_id?: string | null
          settings?: Json
          updated_at?: string
        }
        Update: {
          audit_categories?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_default?: boolean
          name?: string
          organization_id?: string | null
          project_id?: string | null
          settings?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lighthouse_configurations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lighthouse_configurations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      lighthouse_deployment_hooks: {
        Row: {
          auth_token_hash: string | null
          created_at: string
          deployment_stage: string
          id: string
          is_active: boolean | null
          monitoring_config_id: string
          project_id: string
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          auth_token_hash?: string | null
          created_at?: string
          deployment_stage: string
          id?: string
          is_active?: boolean | null
          monitoring_config_id: string
          project_id: string
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          auth_token_hash?: string | null
          created_at?: string
          deployment_stage?: string
          id?: string
          is_active?: boolean | null
          monitoring_config_id?: string
          project_id?: string
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lighthouse_deployment_hooks_monitoring_config_id_fkey"
            columns: ["monitoring_config_id"]
            isOneToOne: false
            referencedRelation: "lighthouse_monitoring_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lighthouse_deployment_hooks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      lighthouse_monitoring_configs: {
        Row: {
          alert_channels: Json | null
          avoid_peak_hours: boolean | null
          configuration_id: string
          created_at: string
          id: string
          is_active: boolean
          last_run_at: string | null
          max_audits_per_day: number | null
          next_run_at: string | null
          peak_hours_end: string | null
          peak_hours_start: string | null
          performance_thresholds: Json
          project_id: string
          retry_failed_audits: boolean | null
          schedule_interval: string
          schedule_time: string | null
          updated_at: string
          urls: string[]
        }
        Insert: {
          alert_channels?: Json | null
          avoid_peak_hours?: boolean | null
          configuration_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          max_audits_per_day?: number | null
          next_run_at?: string | null
          peak_hours_end?: string | null
          peak_hours_start?: string | null
          performance_thresholds?: Json
          project_id: string
          retry_failed_audits?: boolean | null
          schedule_interval: string
          schedule_time?: string | null
          updated_at?: string
          urls: string[]
        }
        Update: {
          alert_channels?: Json | null
          avoid_peak_hours?: boolean | null
          configuration_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          max_audits_per_day?: number | null
          next_run_at?: string | null
          peak_hours_end?: string | null
          peak_hours_start?: string | null
          performance_thresholds?: Json
          project_id?: string
          retry_failed_audits?: boolean | null
          schedule_interval?: string
          schedule_time?: string | null
          updated_at?: string
          urls?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "lighthouse_monitoring_configs_configuration_id_fkey"
            columns: ["configuration_id"]
            isOneToOne: false
            referencedRelation: "lighthouse_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lighthouse_monitoring_configs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      lighthouse_monitoring_runs: {
        Row: {
          average_scores: Json | null
          completed_at: string | null
          completed_urls: number | null
          config_id: string
          created_at: string
          deployment_context: Json | null
          error_message: string | null
          failed_urls: number | null
          id: string
          started_at: string | null
          status: string
          threshold_breaches: Json | null
          total_urls: number | null
          trigger_type: string
        }
        Insert: {
          average_scores?: Json | null
          completed_at?: string | null
          completed_urls?: number | null
          config_id: string
          created_at?: string
          deployment_context?: Json | null
          error_message?: string | null
          failed_urls?: number | null
          id?: string
          started_at?: string | null
          status?: string
          threshold_breaches?: Json | null
          total_urls?: number | null
          trigger_type: string
        }
        Update: {
          average_scores?: Json | null
          completed_at?: string | null
          completed_urls?: number | null
          config_id?: string
          created_at?: string
          deployment_context?: Json | null
          error_message?: string | null
          failed_urls?: number | null
          id?: string
          started_at?: string | null
          status?: string
          threshold_breaches?: Json | null
          total_urls?: number | null
          trigger_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "lighthouse_monitoring_runs_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "lighthouse_monitoring_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      lighthouse_queue: {
        Row: {
          completed_at: string | null
          created_at: string
          device: string
          error_message: string | null
          id: string
          priority: string
          project_id: string | null
          result: Json | null
          started_at: string | null
          status: string
          url: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          device?: string
          error_message?: string | null
          id?: string
          priority?: string
          project_id?: string | null
          result?: Json | null
          started_at?: string | null
          status?: string
          url: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          device?: string
          error_message?: string | null
          id?: string
          priority?: string
          project_id?: string | null
          result?: Json | null
          started_at?: string | null
          status?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "lighthouse_queue_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      lighthouse_recommendation_batches: {
        Row: {
          actual_savings_ms: number | null
          actual_total_hours: number | null
          audit_ids: string[]
          completed_at: string | null
          completed_recommendations: number | null
          created_at: string
          created_by: string | null
          description: string | null
          estimated_total_hours: number | null
          expected_savings_ms: number | null
          id: string
          name: string
          project_id: string
          started_at: string | null
          status: string
          total_recommendations: number | null
          updated_at: string
        }
        Insert: {
          actual_savings_ms?: number | null
          actual_total_hours?: number | null
          audit_ids: string[]
          completed_at?: string | null
          completed_recommendations?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_total_hours?: number | null
          expected_savings_ms?: number | null
          id?: string
          name: string
          project_id: string
          started_at?: string | null
          status?: string
          total_recommendations?: number | null
          updated_at?: string
        }
        Update: {
          actual_savings_ms?: number | null
          actual_total_hours?: number | null
          audit_ids?: string[]
          completed_at?: string | null
          completed_recommendations?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_total_hours?: number | null
          expected_savings_ms?: number | null
          id?: string
          name?: string
          project_id?: string
          started_at?: string | null
          status?: string
          total_recommendations?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lighthouse_recommendation_batches_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      lighthouse_recommendation_progress: {
        Row: {
          after_metrics: Json | null
          before_metrics: Json | null
          created_at: string
          id: string
          new_status: string
          notes: string | null
          old_status: string | null
          project_id: string
          recommendation_id: string
          status_changed_by: string | null
          time_spent_hours: number | null
          tools_used: Json | null
        }
        Insert: {
          after_metrics?: Json | null
          before_metrics?: Json | null
          created_at?: string
          id?: string
          new_status: string
          notes?: string | null
          old_status?: string | null
          project_id: string
          recommendation_id: string
          status_changed_by?: string | null
          time_spent_hours?: number | null
          tools_used?: Json | null
        }
        Update: {
          after_metrics?: Json | null
          before_metrics?: Json | null
          created_at?: string
          id?: string
          new_status?: string
          notes?: string | null
          old_status?: string | null
          project_id?: string
          recommendation_id?: string
          status_changed_by?: string | null
          time_spent_hours?: number | null
          tools_used?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "lighthouse_recommendation_progress_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lighthouse_recommendation_progress_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "lighthouse_recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      lighthouse_recommendation_templates: {
        Row: {
          audit_rule: string
          category: string
          created_at: string
          description: string
          estimated_time_hours: number | null
          expected_impact: Json
          fix_template: string
          id: string
          implementation_difficulty: string
          is_active: boolean
          name: string
          prerequisites: Json | null
          project_type: string
          title: string
          tools_integration: Json | null
          updated_at: string
        }
        Insert: {
          audit_rule: string
          category: string
          created_at?: string
          description: string
          estimated_time_hours?: number | null
          expected_impact?: Json
          fix_template: string
          id?: string
          implementation_difficulty: string
          is_active?: boolean
          name: string
          prerequisites?: Json | null
          project_type: string
          title: string
          tools_integration?: Json | null
          updated_at?: string
        }
        Update: {
          audit_rule?: string
          category?: string
          created_at?: string
          description?: string
          estimated_time_hours?: number | null
          expected_impact?: Json
          fix_template?: string
          id?: string
          implementation_difficulty?: string
          is_active?: boolean
          name?: string
          prerequisites?: Json | null
          project_type?: string
          title?: string
          tools_integration?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      lighthouse_recommendations: {
        Row: {
          audit_id: string
          audit_rule: string
          category: string
          cost_benefit_score: number | null
          created_at: string
          current_value: number | null
          description: string
          difficulty_level: string
          dismissed_at: string | null
          dismissed_reason: string | null
          estimated_savings_ms: number | null
          estimated_time_hours: number | null
          fix_suggestion: string
          id: string
          implementation_code: string | null
          implemented_at: string | null
          is_automated: boolean | null
          priority_score: number
          project_id: string
          status: string
          target_value: number | null
          template_id: string | null
          title: string
          tool_integrations: Json | null
          updated_at: string
          url: string
          verification_audit_id: string | null
        }
        Insert: {
          audit_id: string
          audit_rule: string
          category: string
          cost_benefit_score?: number | null
          created_at?: string
          current_value?: number | null
          description: string
          difficulty_level: string
          dismissed_at?: string | null
          dismissed_reason?: string | null
          estimated_savings_ms?: number | null
          estimated_time_hours?: number | null
          fix_suggestion: string
          id?: string
          implementation_code?: string | null
          implemented_at?: string | null
          is_automated?: boolean | null
          priority_score?: number
          project_id: string
          status?: string
          target_value?: number | null
          template_id?: string | null
          title: string
          tool_integrations?: Json | null
          updated_at?: string
          url: string
          verification_audit_id?: string | null
        }
        Update: {
          audit_id?: string
          audit_rule?: string
          category?: string
          cost_benefit_score?: number | null
          created_at?: string
          current_value?: number | null
          description?: string
          difficulty_level?: string
          dismissed_at?: string | null
          dismissed_reason?: string | null
          estimated_savings_ms?: number | null
          estimated_time_hours?: number | null
          fix_suggestion?: string
          id?: string
          implementation_code?: string | null
          implemented_at?: string | null
          is_automated?: boolean | null
          priority_score?: number
          project_id?: string
          status?: string
          target_value?: number | null
          template_id?: string | null
          title?: string
          tool_integrations?: Json | null
          updated_at?: string
          url?: string
          verification_audit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lighthouse_recommendations_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "lighthouse_audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lighthouse_recommendations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lighthouse_recommendations_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "lighthouse_recommendation_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lighthouse_recommendations_verification_audit_id_fkey"
            columns: ["verification_audit_id"]
            isOneToOne: false
            referencedRelation: "lighthouse_audits"
            referencedColumns: ["id"]
          },
        ]
      }
      lighthouse_schedules: {
        Row: {
          configuration_id: string | null
          created_at: string
          frequency: string
          id: string
          is_active: boolean
          last_run_at: string | null
          next_run_at: string | null
          project_id: string | null
          schedule_time: string | null
          updated_at: string
          urls: string[]
        }
        Insert: {
          configuration_id?: string | null
          created_at?: string
          frequency: string
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          next_run_at?: string | null
          project_id?: string | null
          schedule_time?: string | null
          updated_at?: string
          urls: string[]
        }
        Update: {
          configuration_id?: string | null
          created_at?: string
          frequency?: string
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          next_run_at?: string | null
          project_id?: string | null
          schedule_time?: string | null
          updated_at?: string
          urls?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "lighthouse_schedules_configuration_id_fkey"
            columns: ["configuration_id"]
            isOneToOne: false
            referencedRelation: "lighthouse_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lighthouse_schedules_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      lighthouse_threshold_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string
          current_score: number
          id: string
          is_acknowledged: boolean | null
          metric_type: string
          monitoring_run_id: string
          previous_score: number | null
          resolved_at: string | null
          severity: string
          threshold_score: number
          url: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          current_score: number
          id?: string
          is_acknowledged?: boolean | null
          metric_type: string
          monitoring_run_id: string
          previous_score?: number | null
          resolved_at?: string | null
          severity: string
          threshold_score: number
          url: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          current_score?: number
          id?: string
          is_acknowledged?: boolean | null
          metric_type?: string
          monitoring_run_id?: string
          previous_score?: number | null
          resolved_at?: string | null
          severity?: string
          threshold_score?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "lighthouse_threshold_alerts_monitoring_run_id_fkey"
            columns: ["monitoring_run_id"]
            isOneToOne: false
            referencedRelation: "lighthouse_monitoring_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      lighthouse_tool_integrations: {
        Row: {
          api_credentials: Json | null
          configuration: Json
          created_at: string
          id: string
          is_active: boolean
          last_used_at: string | null
          project_id: string
          success_rate: number | null
          tool_category: string
          tool_name: string
          updated_at: string
        }
        Insert: {
          api_credentials?: Json | null
          configuration?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          project_id: string
          success_rate?: number | null
          tool_category: string
          tool_name: string
          updated_at?: string
        }
        Update: {
          api_credentials?: Json | null
          configuration?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          project_id?: string
          success_rate?: number | null
          tool_category?: string
          tool_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lighthouse_tool_integrations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ml_insights: {
        Row: {
          confidence: number | null
          content: Json
          created_at: string
          expires_at: string | null
          id: string
          insight_type: string
          is_acknowledged: boolean
          partner_id: string
          project_id: string | null
          user_id: string
        }
        Insert: {
          confidence?: number | null
          content: Json
          created_at?: string
          expires_at?: string | null
          id?: string
          insight_type: string
          is_acknowledged?: boolean
          partner_id: string
          project_id?: string | null
          user_id: string
        }
        Update: {
          confidence?: number | null
          content?: Json
          created_at?: string
          expires_at?: string | null
          id?: string
          insight_type?: string
          is_acknowledged?: boolean
          partner_id?: string
          project_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ml_insights_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ml_insights_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ml_models: {
        Row: {
          accuracy: number | null
          created_at: string
          deployed_at: string | null
          description: string | null
          id: string
          is_active: boolean
          model_type: Database["public"]["Enums"]["ml_model_type"]
          partner_id: string | null
          training_data_hash: string | null
          updated_at: string
          version: string
        }
        Insert: {
          accuracy?: number | null
          created_at?: string
          deployed_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          model_type: Database["public"]["Enums"]["ml_model_type"]
          partner_id?: string | null
          training_data_hash?: string | null
          updated_at?: string
          version: string
        }
        Update: {
          accuracy?: number | null
          created_at?: string
          deployed_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          model_type?: Database["public"]["Enums"]["ml_model_type"]
          partner_id?: string | null
          training_data_hash?: string | null
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "ml_models_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      ml_predictions: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          input_data: Json
          model_id: string
          prediction: Json
          project_id: string | null
          user_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          input_data: Json
          model_id: string
          prediction: Json
          project_id?: string | null
          user_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          input_data?: Json
          model_id?: string
          prediction?: Json
          project_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ml_predictions_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ml_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ml_predictions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_channels: {
        Row: {
          active: boolean
          config: Json
          created_at: string
          id: string
          partner_id: string
          type: Database["public"]["Enums"]["notification_channel_type"]
          updated_at: string
          verified: boolean
        }
        Insert: {
          active?: boolean
          config: Json
          created_at?: string
          id?: string
          partner_id: string
          type: Database["public"]["Enums"]["notification_channel_type"]
          updated_at?: string
          verified?: boolean
        }
        Update: {
          active?: boolean
          config?: Json
          created_at?: string
          id?: string
          partner_id?: string
          type?: Database["public"]["Enums"]["notification_channel_type"]
          updated_at?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "notification_channels_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_history: {
        Row: {
          created_at: string
          delivered_at: string | null
          id: string
          interaction_type: string | null
          notification_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          id?: string
          interaction_type?: string | null
          notification_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          id?: string
          interaction_type?: string | null
          notification_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_history_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notification_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          channel_type: Database["public"]["Enums"]["notification_channel_type"]
          created_at: string
          enabled: boolean
          id: string
          notification_type: string
          settings: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          channel_type: Database["public"]["Enums"]["notification_channel_type"]
          created_at?: string
          enabled?: boolean
          id?: string
          notification_type: string
          settings?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          channel_type?: Database["public"]["Enums"]["notification_channel_type"]
          created_at?: string
          enabled?: boolean
          id?: string
          notification_type?: string
          settings?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          attempts: number
          channel_type: Database["public"]["Enums"]["notification_channel_type"]
          content: Json
          created_at: string
          error_message: string | null
          id: string
          notification_type: string
          partner_id: string | null
          scheduled_at: string
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          user_id: string
        }
        Insert: {
          attempts?: number
          channel_type: Database["public"]["Enums"]["notification_channel_type"]
          content: Json
          created_at?: string
          error_message?: string | null
          id?: string
          notification_type: string
          partner_id?: string | null
          scheduled_at?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          user_id: string
        }
        Update: {
          attempts?: number
          channel_type?: Database["public"]["Enums"]["notification_channel_type"]
          content?: Json
          created_at?: string
          error_message?: string | null
          id?: string
          notification_type?: string
          partner_id?: string | null
          scheduled_at?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_queue_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          active: boolean
          body: string
          channel: Database["public"]["Enums"]["notification_channel_type"]
          created_at: string
          id: string
          subject: string | null
          type: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          active?: boolean
          body: string
          channel: Database["public"]["Enums"]["notification_channel_type"]
          created_at?: string
          id?: string
          subject?: string | null
          type: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          active?: boolean
          body?: string
          channel?: Database["public"]["Enums"]["notification_channel_type"]
          created_at?: string
          id?: string
          subject?: string | null
          type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      optimization_rules: {
        Row: {
          cache_duration_seconds: number
          compression_enabled: boolean
          created_at: string
          endpoint_pattern: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          cache_duration_seconds?: number
          compression_enabled?: boolean
          created_at?: string
          endpoint_pattern: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          cache_duration_seconds?: number
          compression_enabled?: boolean
          created_at?: string
          endpoint_pattern?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          branding_config: Json | null
          company_name: string
          created_at: string | null
          id: string
          slug: string
          subscription_tier: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          branding_config?: Json | null
          company_name: string
          created_at?: string | null
          id?: string
          slug: string
          subscription_tier?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          branding_config?: Json | null
          company_name?: string
          created_at?: string | null
          id?: string
          slug?: string
          subscription_tier?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount_cents: number | null
          completed_at: string | null
          created_at: string
          id: string
          metadata: Json | null
          status: string
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          stripe_session_completed_at: string | null
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          amount_cents?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_completed_at?: string | null
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_completed_at?: string | null
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      performance_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_active: boolean
          metric_type: string
          project_id: string
          threshold: number
          updated_at: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          metric_type: string
          project_id: string
          threshold: number
          updated_at?: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          metric_type?: string
          project_id?: string
          threshold?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_alerts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_issues: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          impact_score: number | null
          metric_type: string
          project_id: string
          threshold_exceeded: number | null
          value: number
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          impact_score?: number | null
          metric_type: string
          project_id: string
          threshold_exceeded?: number | null
          value: number
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          impact_score?: number | null
          metric_type?: string
          project_id?: string
          threshold_exceeded?: number | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "performance_issues_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_type: string
          project_id: string
          timestamp: string
          value: number
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_type: string
          project_id: string
          timestamp?: string
          value: number
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_type?: string
          project_id?: string
          timestamp?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "performance_metrics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_reports: {
        Row: {
          generated_at: string
          id: string
          project_id: string
          report_period_end: string
          report_period_start: string
          summary_data: Json | null
        }
        Insert: {
          generated_at?: string
          id?: string
          project_id: string
          report_period_end: string
          report_period_start: string
          summary_data?: Json | null
        }
        Update: {
          generated_at?: string
          id?: string
          project_id?: string
          report_period_end?: string
          report_period_start?: string
          summary_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_integrations: {
        Row: {
          config: Json | null
          created_at: string
          id: string
          is_active: boolean
          platform: string
          project_id: string
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          platform: string
          project_id: string
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          platform?: string
          project_id?: string
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_integrations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          external_run_id: string
          id: string
          integration_id: string
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          external_run_id: string
          id?: string
          integration_id: string
          started_at?: string | null
          status: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          external_run_id?: string
          id?: string
          integration_id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_runs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "pipeline_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_analytics: {
        Row: {
          created_at: string
          daily_active_users: number | null
          id: number
          metric_date: string
          performance_metrics: Json | null
          popular_tools: Json | null
        }
        Insert: {
          created_at?: string
          daily_active_users?: number | null
          id?: number
          metric_date?: string
          performance_metrics?: Json | null
          popular_tools?: Json | null
        }
        Update: {
          created_at?: string
          daily_active_users?: number | null
          id?: number
          metric_date?: string
          performance_metrics?: Json | null
          popular_tools?: Json | null
        }
        Relationships: []
      }
      pricing_config: {
        Row: {
          created_at: string | null
          credits_included: number | null
          id: string
          is_active: boolean | null
          item_name: string
          item_type: string
          price_cents: number
        }
        Insert: {
          created_at?: string | null
          credits_included?: number | null
          id?: string
          is_active?: boolean | null
          item_name: string
          item_type: string
          price_cents: number
        }
        Update: {
          created_at?: string | null
          credits_included?: number | null
          id?: string
          is_active?: boolean | null
          item_name?: string
          item_type?: string
          price_cents?: number
        }
        Relationships: []
      }
      productivity_metrics: {
        Row: {
          bugs_fixed: number | null
          code_quality_improvement: number | null
          created_at: string
          debug_sessions_completed: number | null
          id: number
          metric_date: string
          partner_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bugs_fixed?: number | null
          code_quality_improvement?: number | null
          created_at?: string
          debug_sessions_completed?: number | null
          id?: number
          metric_date?: string
          partner_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bugs_fixed?: number | null
          code_quality_improvement?: number | null
          created_at?: string
          debug_sessions_completed?: number | null
          id?: number
          metric_date?: string
          partner_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "productivity_metrics_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      project_health_snapshots: {
        Row: {
          accessibility: number
          code_quality: number
          created_at: string
          id: string
          issues_fixed: number
          maintainability: number
          new_issues_found: number
          overall_score: number
          performance: number
          project_id: string
          security: number
          session_id: string | null
        }
        Insert: {
          accessibility?: number
          code_quality?: number
          created_at?: string
          id?: string
          issues_fixed?: number
          maintainability?: number
          new_issues_found?: number
          overall_score?: number
          performance?: number
          project_id: string
          security?: number
          session_id?: string | null
        }
        Update: {
          accessibility?: number
          code_quality?: number
          created_at?: string
          id?: string
          issues_fixed?: number
          maintainability?: number
          new_issues_found?: number
          overall_score?: number
          performance?: number
          project_id?: string
          security?: number
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_health_snapshots_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          created_at: string
          id: string
          project_id: string
          role: Database["public"]["Enums"]["project_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          role?: Database["public"]["Enums"]["project_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          role?: Database["public"]["Enums"]["project_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_id: string | null
          created_at: string | null
          framework: string | null
          github_url: string | null
          id: string
          language: string | null
          name: string
          partner_id: string
          settings: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          framework?: string | null
          github_url?: string | null
          id?: string
          language?: string | null
          name: string
          partner_id: string
          settings?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          framework?: string | null
          github_url?: string | null
          id?: string
          language?: string | null
          name?: string
          partner_id?: string
          settings?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_configs: {
        Row: {
          burst_allowance: number
          created_at: string
          id: string
          is_active: boolean
          max_requests_per_hour: number
          subscription_tier: string
          updated_at: string
        }
        Insert: {
          burst_allowance: number
          created_at?: string
          id?: string
          is_active?: boolean
          max_requests_per_hour: number
          subscription_tier: string
          updated_at?: string
        }
        Update: {
          burst_allowance?: number
          created_at?: string
          id?: string
          is_active?: boolean
          max_requests_per_hour?: number
          subscription_tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      repository_analyses: {
        Row: {
          analysis_data: Json
          analyzed_at: string
          created_at: string
          critical_issues: number | null
          id: string
          project_id: string | null
          quality_score: number | null
          suggestions: number | null
          tenant_id: string | null
          total_files: number | null
          warnings: number | null
        }
        Insert: {
          analysis_data: Json
          analyzed_at?: string
          created_at?: string
          critical_issues?: number | null
          id?: string
          project_id?: string | null
          quality_score?: number | null
          suggestions?: number | null
          tenant_id?: string | null
          total_files?: number | null
          warnings?: number | null
        }
        Update: {
          analysis_data?: Json
          analyzed_at?: string
          created_at?: string
          critical_issues?: number | null
          id?: string
          project_id?: string | null
          quality_score?: number | null
          suggestions?: number | null
          tenant_id?: string | null
          total_files?: number | null
          warnings?: number | null
        }
        Relationships: []
      }
      repository_audit_results: {
        Row: {
          audit_id: string
          audit_metadata: Json
          audit_type: string
          created_at: string
          executive_summary: Json
          file_results: Json
          id: string
          overall_score: number
          performance_summary: Json
          quality_summary: Json
          repository_name: string
          repository_url: string
          security_summary: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          audit_id: string
          audit_metadata?: Json
          audit_type?: string
          created_at?: string
          executive_summary?: Json
          file_results?: Json
          id?: string
          overall_score?: number
          performance_summary?: Json
          quality_summary?: Json
          repository_name: string
          repository_url: string
          security_summary?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          audit_id?: string
          audit_metadata?: Json
          audit_type?: string
          created_at?: string
          executive_summary?: Json
          file_results?: Json
          id?: string
          overall_score?: number
          performance_summary?: Json
          quality_summary?: Json
          repository_name?: string
          repository_url?: string
          security_summary?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resource_usage: {
        Row: {
          cpu_usage: number | null
          disk_io: number | null
          id: string
          memory_usage: number | null
          network_io: number | null
          project_id: string
          timestamp: string
        }
        Insert: {
          cpu_usage?: number | null
          disk_io?: number | null
          id?: string
          memory_usage?: number | null
          network_io?: number | null
          project_id: string
          timestamp?: string
        }
        Update: {
          cpu_usage?: number | null
          disk_io?: number | null
          id?: string
          memory_usage?: number | null
          network_io?: number | null
          project_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_usage_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          created_at: string
          filters: Json | null
          id: string
          name: string
          notifications_enabled: boolean
          partner_id: string
          query_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json | null
          id?: string
          name: string
          notifications_enabled?: boolean
          partner_id: string
          query_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json | null
          id?: string
          name?: string
          notifications_enabled?: boolean
          partner_id?: string
          query_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_searches_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      search_analytics: {
        Row: {
          clicked_content_id: string | null
          clicked_content_type: string | null
          created_at: string
          id: number
          partner_id: string
          query_id: string | null
          rank: number | null
          user_id: string | null
        }
        Insert: {
          clicked_content_id?: string | null
          clicked_content_type?: string | null
          created_at?: string
          id?: number
          partner_id: string
          query_id?: string | null
          rank?: number | null
          user_id?: string | null
        }
        Update: {
          clicked_content_id?: string | null
          clicked_content_type?: string | null
          created_at?: string
          id?: number
          partner_id?: string
          query_id?: string | null
          rank?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_analytics_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_analytics_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "search_queries"
            referencedColumns: ["id"]
          },
        ]
      }
      search_index: {
        Row: {
          content_id: string
          content_type: string
          id: string
          indexed_at: string
          keywords: string[] | null
          project_id: string
          searchable_text: unknown | null
        }
        Insert: {
          content_id: string
          content_type: string
          id?: string
          indexed_at?: string
          keywords?: string[] | null
          project_id: string
          searchable_text?: unknown | null
        }
        Update: {
          content_id?: string
          content_type?: string
          id?: string
          indexed_at?: string
          keywords?: string[] | null
          project_id?: string
          searchable_text?: unknown | null
        }
        Relationships: [
          {
            foreignKeyName: "search_index_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      search_queries: {
        Row: {
          executed_at: string
          filters: Json | null
          id: string
          partner_id: string
          query_text: string | null
          results_count: number
          user_id: string | null
        }
        Insert: {
          executed_at?: string
          filters?: Json | null
          id?: string
          partner_id: string
          query_text?: string | null
          results_count: number
          user_id?: string | null
        }
        Update: {
          executed_at?: string
          filters?: Json | null
          id?: string
          partner_id?: string
          query_text?: string | null
          results_count?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_queries_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_results: {
        Row: {
          audit_metadata: Json
          audit_type: string
          compliance: Json
          created_at: string
          executive_summary: Json
          id: string
          project_id: string
          recommendations: Json
          security_score: number
          updated_at: string
          user_id: string
          vulnerabilities: Json
        }
        Insert: {
          audit_metadata?: Json
          audit_type?: string
          compliance?: Json
          created_at?: string
          executive_summary?: Json
          id?: string
          project_id: string
          recommendations?: Json
          security_score?: number
          updated_at?: string
          user_id: string
          vulnerabilities?: Json
        }
        Update: {
          audit_metadata?: Json
          audit_type?: string
          compliance?: Json
          created_at?: string
          executive_summary?: Json
          id?: string
          project_id?: string
          recommendations?: Json
          security_score?: number
          updated_at?: string
          user_id?: string
          vulnerabilities?: Json
        }
        Relationships: [
          {
            foreignKeyName: "security_audit_results_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      session_events: {
        Row: {
          created_at: string
          event_type: string
          id: number
          payload: Json | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: number
          payload?: Json | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: number
          payload?: Json | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "debugging_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subsidiary_revenue: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          parent_company: string
          stripe_payment_intent_id: string | null
          stripe_subscription_id: string | null
          subsidiary: string
          transaction_date: string
          transaction_type: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          parent_company: string
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          subsidiary: string
          transaction_date?: string
          transaction_type: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          parent_company?: string
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          subsidiary?: string
          transaction_date?: string
          transaction_type?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["team_role"]
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          partner_id: string
          settings: Json | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          partner_id: string
          settings?: Json | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          partner_id?: string
          settings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_autoupdate_configs: {
        Row: {
          auto_update_enabled: boolean
          created_at: string
          id: string
          partner_id: string
          rollback_policy: string
          tool_id: string
          update_window: string | null
          updated_at: string
        }
        Insert: {
          auto_update_enabled?: boolean
          created_at?: string
          id?: string
          partner_id: string
          rollback_policy?: string
          tool_id: string
          update_window?: string | null
          updated_at?: string
        }
        Update: {
          auto_update_enabled?: boolean
          created_at?: string
          id?: string
          partner_id?: string
          rollback_policy?: string
          tool_id?: string
          update_window?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_autoupdate_configs_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_autoupdate_configs_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_configurations: {
        Row: {
          config_data: Json | null
          created_at: string
          enabled: boolean
          id: string
          partner_id: string
          tool_id: string
          updated_at: string
        }
        Insert: {
          config_data?: Json | null
          created_at?: string
          enabled?: boolean
          id?: string
          partner_id: string
          tool_id: string
          updated_at?: string
        }
        Update: {
          config_data?: Json | null
          created_at?: string
          enabled?: boolean
          id?: string
          partner_id?: string
          tool_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_configurations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_configurations_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_updates: {
        Row: {
          created_at: string
          details: Json | null
          from_version: string | null
          id: string
          status: string
          to_version: string
          tool_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          from_version?: string | null
          id?: string
          status: string
          to_version: string
          tool_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          from_version?: string | null
          id?: string
          status?: string
          to_version?: string
          tool_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_updates_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_usage_stats: {
        Row: {
          created_at: string
          id: number
          last_used: string
          partner_id: string
          success_rate: number | null
          tool_id: string
          updated_at: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          last_used?: string
          partner_id: string
          success_rate?: number | null
          tool_id: string
          updated_at?: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          last_used?: string
          partner_id?: string
          success_rate?: number | null
          tool_id?: string
          updated_at?: string
          usage_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_usage_stats_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_usage_stats_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          api_endpoint: string | null
          category: string
          config_schema: Json | null
          id: string
          name: string
          version: string | null
        }
        Insert: {
          api_endpoint?: string | null
          category: string
          config_schema?: Json | null
          id?: string
          name: string
          version?: string | null
        }
        Update: {
          api_endpoint?: string | null
          category?: string
          config_schema?: Json | null
          id?: string
          name?: string
          version?: string | null
        }
        Relationships: []
      }
      training_datasets: {
        Row: {
          created_at: string
          data_hash: string
          data_source: string
          feature_columns: string[] | null
          id: string
          label_column: string | null
          model_type: Database["public"]["Enums"]["ml_model_type"]
          partner_id: string | null
          record_count: number | null
        }
        Insert: {
          created_at?: string
          data_hash: string
          data_source: string
          feature_columns?: string[] | null
          id?: string
          label_column?: string | null
          model_type: Database["public"]["Enums"]["ml_model_type"]
          partner_id?: string | null
          record_count?: number | null
        }
        Update: {
          created_at?: string
          data_hash?: string
          data_source?: string
          feature_columns?: string[] | null
          id?: string
          label_column?: string | null
          model_type?: Database["public"]["Enums"]["ml_model_type"]
          partner_id?: string | null
          record_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "training_datasets_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credits: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          partner_id: string | null
          status: string
          stripe_subscription_id: string | null
          tier: string
          trial_end: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          partner_id?: string | null
          status?: string
          stripe_subscription_id?: string | null
          tier?: string
          trial_end?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          partner_id?: string | null
          status?: string
          stripe_subscription_id?: string | null
          tier?: string
          trial_end?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      user_usage_tracking: {
        Row: {
          ai_analysis_count: number
          analysis_count: number
          created_at: string
          id: string
          partner_id: string | null
          premium_feature_attempts: number
          updated_at: string
          usage_date: string
          user_id: string
        }
        Insert: {
          ai_analysis_count?: number
          analysis_count?: number
          created_at?: string
          id?: string
          partner_id?: string | null
          premium_feature_attempts?: number
          updated_at?: string
          usage_date?: string
          user_id: string
        }
        Update: {
          ai_analysis_count?: number
          analysis_count?: number
          created_at?: string
          id?: string
          partner_id?: string | null
          premium_feature_attempts?: number
          updated_at?: string
          usage_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_usage_tracking_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      widget_data_sources: {
        Row: {
          created_at: string
          data_source_table: string
          id: string
          query_config: Json
          refresh_interval_seconds: number
          widget_id: string
        }
        Insert: {
          created_at?: string
          data_source_table: string
          id?: string
          query_config: Json
          refresh_interval_seconds?: number
          widget_id: string
        }
        Update: {
          created_at?: string
          data_source_table?: string
          id?: string
          query_config?: Json
          refresh_interval_seconds?: number
          widget_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "widget_data_sources_widget_id_fkey"
            columns: ["widget_id"]
            isOneToOne: false
            referencedRelation: "dashboard_widgets"
            referencedColumns: ["id"]
          },
        ]
      }
      widget_templates: {
        Row: {
          config_schema: Json | null
          description: string | null
          id: string
          name: string
          preview_image_url: string | null
          widget_type: string
        }
        Insert: {
          config_schema?: Json | null
          description?: string | null
          id?: string
          name: string
          preview_image_url?: string | null
          widget_type: string
        }
        Update: {
          config_schema?: Json | null
          description?: string | null
          id?: string
          name?: string
          preview_image_url?: string | null
          widget_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_user_credits: {
        Args: {
          p_user_id: string
          p_amount: number
          p_description: string
          p_metadata?: Json
        }
        Returns: boolean
      }
      calculate_cost_benefit_score: {
        Args: {
          estimated_hours: number
          potential_savings_ms: number
          difficulty: string
        }
        Returns: number
      }
      calculate_next_lighthouse_run: {
        Args: {
          interval_type: string
          schedule_time: string
          avoid_peak_hours?: boolean
          peak_start?: string
          peak_end?: string
        }
        Returns: string
      }
      calculate_recommendation_priority: {
        Args: {
          savings_ms: number
          difficulty: string
          current_score: number
          impact_area: string
        }
        Returns: number
      }
      can_edit_dashboard: {
        Args: { _dashboard_id: string; _user_id: string }
        Returns: boolean
      }
      can_view_dashboard: {
        Args: { _dashboard_id: string; _user_id: string }
        Returns: boolean
      }
      deduct_user_credits: {
        Args: {
          p_user_id: string
          p_amount: number
          p_description: string
          p_metadata?: Json
        }
        Returns: boolean
      }
      get_my_partner_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_or_create_daily_usage: {
        Args: { p_user_id: string; p_partner_id?: string }
        Returns: string
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      increment_usage_counter: {
        Args: {
          p_user_id: string
          p_analysis_type?: string
          p_partner_id?: string
        }
        Returns: boolean
      }
      is_project_admin: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      is_project_member: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      is_team_admin: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      is_team_member: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
      backup_frequency: "daily" | "weekly" | "monthly"
      backup_status:
        | "pending"
        | "in_progress"
        | "succeeded"
        | "failed"
        | "deleted"
      backup_type: "full_database" | "storage" | "configuration"
      dashboard_permission_level: "view" | "edit"
      error_status: "unresolved" | "resolved" | "ignored" | "in_progress"
      ml_model_type:
        | "bug_severity_classifier"
        | "debugging_time_predictor"
        | "code_quality_scorer"
        | "error_pattern_detector"
        | "performance_regression_predictor"
        | "tool_effectiveness_analyzer"
      notification_channel_type:
        | "email"
        | "slack"
        | "discord"
        | "sms"
        | "webhook"
        | "in_app"
      notification_status:
        | "pending"
        | "processing"
        | "sent"
        | "failed"
        | "retrying"
      project_platform_type:
        | "lovable"
        | "bubble"
        | "webflow"
        | "flutterflow"
        | "other"
      project_role: "admin" | "editor" | "viewer"
      team_role: "admin" | "developer" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      backup_frequency: ["daily", "weekly", "monthly"],
      backup_status: [
        "pending",
        "in_progress",
        "succeeded",
        "failed",
        "deleted",
      ],
      backup_type: ["full_database", "storage", "configuration"],
      dashboard_permission_level: ["view", "edit"],
      error_status: ["unresolved", "resolved", "ignored", "in_progress"],
      ml_model_type: [
        "bug_severity_classifier",
        "debugging_time_predictor",
        "code_quality_scorer",
        "error_pattern_detector",
        "performance_regression_predictor",
        "tool_effectiveness_analyzer",
      ],
      notification_channel_type: [
        "email",
        "slack",
        "discord",
        "sms",
        "webhook",
        "in_app",
      ],
      notification_status: [
        "pending",
        "processing",
        "sent",
        "failed",
        "retrying",
      ],
      project_platform_type: [
        "lovable",
        "bubble",
        "webflow",
        "flutterflow",
        "other",
      ],
      project_role: ["admin", "editor", "viewer"],
      team_role: ["admin", "developer", "viewer"],
    },
  },
} as const
