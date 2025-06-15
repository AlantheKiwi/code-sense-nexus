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
          user_id: string | null
        }
        Insert: {
          collaborators?: Json | null
          created_at?: string
          data?: Json | null
          id?: string
          project_id: string
          status?: string
          user_id?: string | null
        }
        Update: {
          collaborators?: Json | null
          created_at?: string
          data?: Json | null
          id?: string
          project_id?: string
          status?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
    }
    Enums: {
      app_role: "admin" | "user"
      project_platform_type:
        | "lovable"
        | "bubble"
        | "webflow"
        | "flutterflow"
        | "other"
      project_role: "admin" | "editor" | "viewer"
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
      project_platform_type: [
        "lovable",
        "bubble",
        "webflow",
        "flutterflow",
        "other",
      ],
      project_role: ["admin", "editor", "viewer"],
    },
  },
} as const
