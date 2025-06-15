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
      can_edit_dashboard: {
        Args: { _dashboard_id: string; _user_id: string }
        Returns: boolean
      }
      can_view_dashboard: {
        Args: { _dashboard_id: string; _user_id: string }
        Returns: boolean
      }
      get_my_partner_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
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
    }
    Enums: {
      app_role: "admin" | "user"
      dashboard_permission_level: "view" | "edit"
      error_status: "unresolved" | "resolved" | "ignored" | "in_progress"
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
      dashboard_permission_level: ["view", "edit"],
      error_status: ["unresolved", "resolved", "ignored", "in_progress"],
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
