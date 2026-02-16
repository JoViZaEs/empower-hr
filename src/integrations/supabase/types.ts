export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          tenant_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      committee_meetings: {
        Row: {
          agenda: string | null
          attendees: string[] | null
          committee_id: string
          created_at: string | null
          created_by: string | null
          document_url: string | null
          id: string
          location: string | null
          meeting_date: string
          minutes: string | null
          updated_at: string | null
        }
        Insert: {
          agenda?: string | null
          attendees?: string[] | null
          committee_id: string
          created_at?: string | null
          created_by?: string | null
          document_url?: string | null
          id?: string
          location?: string | null
          meeting_date: string
          minutes?: string | null
          updated_at?: string | null
        }
        Update: {
          agenda?: string | null
          attendees?: string[] | null
          committee_id?: string
          created_at?: string | null
          created_by?: string | null
          document_url?: string | null
          id?: string
          location?: string | null
          meeting_date?: string
          minutes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "committee_meetings_committee_id_fkey"
            columns: ["committee_id"]
            isOneToOne: false
            referencedRelation: "committees"
            referencedColumns: ["id"]
          },
        ]
      }
      committee_members: {
        Row: {
          active: boolean | null
          committee_id: string
          created_at: string | null
          employee_id: string
          end_date: string | null
          id: string
          role: string
          start_date: string | null
        }
        Insert: {
          active?: boolean | null
          committee_id: string
          created_at?: string | null
          employee_id: string
          end_date?: string | null
          id?: string
          role: string
          start_date?: string | null
        }
        Update: {
          active?: boolean | null
          committee_id?: string
          created_at?: string | null
          employee_id?: string
          end_date?: string | null
          id?: string
          role?: string
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "committee_members_committee_id_fkey"
            columns: ["committee_id"]
            isOneToOne: false
            referencedRelation: "committees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "committee_members_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      committees: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "committees_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_reads: {
        Row: {
          communication_id: string
          id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          communication_id: string
          id?: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          communication_id?: string
          id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_reads_communication_id_fkey"
            columns: ["communication_id"]
            isOneToOne: false
            referencedRelation: "communications"
            referencedColumns: ["id"]
          },
        ]
      }
      communications: {
        Row: {
          attachment_urls: string[] | null
          communication_type: Database["public"]["Enums"]["communication_type"]
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          priority: string | null
          recipients: string[] | null
          sent_at: string | null
          status: Database["public"]["Enums"]["communication_status"] | null
          subject: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          attachment_urls?: string[] | null
          communication_type: Database["public"]["Enums"]["communication_type"]
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          priority?: string | null
          recipients?: string[] | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["communication_status"] | null
          subject: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          attachment_urls?: string[] | null
          communication_type?: Database["public"]["Enums"]["communication_type"]
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          priority?: string | null
          recipients?: string[] | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["communication_status"] | null
          subject?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      competency_evaluations: {
        Row: {
          action_plan: string | null
          actual_level: number
          competency_name: string
          created_at: string | null
          created_by: string | null
          employee_id: string
          evaluation_date: string
          evaluator_id: string | null
          expected_level: number
          gap: number | null
          id: string
          status: Database["public"]["Enums"]["evaluation_status"] | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          action_plan?: string | null
          actual_level: number
          competency_name: string
          created_at?: string | null
          created_by?: string | null
          employee_id: string
          evaluation_date: string
          evaluator_id?: string | null
          expected_level: number
          gap?: number | null
          id?: string
          status?: Database["public"]["Enums"]["evaluation_status"] | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          action_plan?: string | null
          actual_level?: number
          competency_name?: string
          created_at?: string | null
          created_by?: string | null
          employee_id?: string
          evaluation_date?: string
          evaluator_id?: string | null
          expected_level?: number
          gap?: number | null
          id?: string
          status?: Database["public"]["Enums"]["evaluation_status"] | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competency_evaluations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competency_evaluations_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competency_evaluations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      course_providers: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          is_standard: boolean | null
          name: string
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_standard?: boolean | null
          name: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_standard?: boolean | null
          name?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_providers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          certificate_url: string | null
          course_name: string
          created_at: string | null
          created_by: string | null
          duration_hours: number | null
          employee_id: string
          end_date: string | null
          expiry_date: string | null
          grade: number | null
          id: string
          observations: string | null
          provider: string | null
          start_date: string
          status: Database["public"]["Enums"]["course_status"] | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          certificate_url?: string | null
          course_name: string
          created_at?: string | null
          created_by?: string | null
          duration_hours?: number | null
          employee_id: string
          end_date?: string | null
          expiry_date?: string | null
          grade?: number | null
          id?: string
          observations?: string | null
          provider?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["course_status"] | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          certificate_url?: string | null
          course_name?: string
          created_at?: string | null
          created_by?: string | null
          duration_hours?: number | null
          employee_id?: string
          end_date?: string | null
          expiry_date?: string | null
          grade?: number | null
          id?: string
          observations?: string | null
          provider?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["course_status"] | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      document_types: {
        Row: {
          active: boolean | null
          code: string
          created_at: string | null
          id: string
          name: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string | null
          id?: string
          name: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string | null
          id?: string
          name?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dotacion: {
        Row: {
          created_at: string | null
          created_by: string | null
          delivery_date: string
          employee_id: string
          expiry_date: string | null
          id: string
          item_name: string
          item_type: string | null
          observations: string | null
          quantity: number | null
          signature_url: string | null
          size: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          delivery_date: string
          employee_id: string
          expiry_date?: string | null
          id?: string
          item_name: string
          item_type?: string | null
          observations?: string | null
          quantity?: number | null
          signature_url?: string | null
          size?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          delivery_date?: string
          employee_id?: string
          expiry_date?: string | null
          id?: string
          item_name?: string
          item_type?: string | null
          observations?: string | null
          quantity?: number | null
          signature_url?: string | null
          size?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dotacion_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dotacion_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          active: boolean | null
          address: string | null
          birth_date: string | null
          city: string | null
          created_at: string | null
          department: string | null
          document_number: string
          document_type: string
          email: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          first_name: string
          hire_date: string | null
          id: string
          last_name: string
          phone: string | null
          photo_url: string | null
          position: string | null
          supervisor_id: string | null
          tenant_id: string
          termination_date: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string | null
          department?: string | null
          document_number: string
          document_type?: string
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          first_name: string
          hire_date?: string | null
          id?: string
          last_name: string
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          supervisor_id?: string | null
          tenant_id: string
          termination_date?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string | null
          department?: string | null
          document_number?: string
          document_type?: string
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          first_name?: string
          hire_date?: string | null
          id?: string
          last_name?: string
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          supervisor_id?: string | null
          tenant_id?: string
          termination_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_types: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          is_standard: boolean | null
          name: string
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_standard?: boolean | null
          name: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_standard?: boolean | null
          name?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string | null
          created_by: string | null
          document_url: string | null
          employee_id: string
          entity: string | null
          exam_date: string
          exam_type: string
          expiry_date: string | null
          id: string
          observations: string | null
          result: string | null
          scheduled_date: string | null
          status: Database["public"]["Enums"]["exam_status"] | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          document_url?: string | null
          employee_id: string
          entity?: string | null
          exam_date: string
          exam_type: string
          expiry_date?: string | null
          id?: string
          observations?: string | null
          result?: string | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["exam_status"] | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          document_url?: string | null
          employee_id?: string
          entity?: string | null
          exam_date?: string
          exam_type?: string
          expiry_date?: string | null
          id?: string
          observations?: string | null
          result?: string | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["exam_status"] | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exams_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          active: boolean | null
          code: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          id: string
          in_app_enabled: boolean | null
          receive_summary: boolean | null
          summary_frequency: string | null
          tenant_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          receive_summary?: boolean | null
          summary_frequency?: string | null
          tenant_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          receive_summary?: boolean | null
          summary_frequency?: string | null
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          link: string | null
          message: string
          read: boolean | null
          tenant_id: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          link?: string | null
          message: string
          read?: boolean | null
          tenant_id: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          link?: string | null
          message?: string
          read?: boolean | null
          tenant_id?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_summary_notifications: {
        Row: {
          created_at: string | null
          id: string
          link: string | null
          message: string
          notification_type: string
          processed: boolean | null
          processed_at: string | null
          related_entity_id: string | null
          tenant_id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          link?: string | null
          message: string
          notification_type: string
          processed?: boolean | null
          processed_at?: string | null
          related_entity_id?: string | null
          tenant_id: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          link?: string | null
          message?: string
          notification_type?: string
          processed?: boolean | null
          processed_at?: string | null
          related_entity_id?: string | null
          tenant_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_summary_notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_evaluations: {
        Row: {
          areas_improvement: string | null
          comments: string | null
          created_at: string | null
          created_by: string | null
          employee_id: string
          employee_signature_url: string | null
          evaluation_date: string
          evaluator_id: string | null
          evaluator_signature_url: string | null
          goals: string | null
          id: string
          overall_score: number | null
          period: string
          status: Database["public"]["Enums"]["evaluation_status"] | null
          strengths: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          areas_improvement?: string | null
          comments?: string | null
          created_at?: string | null
          created_by?: string | null
          employee_id: string
          employee_signature_url?: string | null
          evaluation_date: string
          evaluator_id?: string | null
          evaluator_signature_url?: string | null
          goals?: string | null
          id?: string
          overall_score?: number | null
          period: string
          status?: Database["public"]["Enums"]["evaluation_status"] | null
          strengths?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          areas_improvement?: string | null
          comments?: string | null
          created_at?: string | null
          created_by?: string | null
          employee_id?: string
          employee_signature_url?: string | null
          evaluation_date?: string
          evaluator_id?: string | null
          evaluator_signature_url?: string | null
          goals?: string | null
          id?: string
          overall_score?: number | null
          period?: string
          status?: Database["public"]["Enums"]["evaluation_status"] | null
          strengths?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_evaluations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_evaluations_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_evaluations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: Database["public"]["Enums"]["permission_action"]
          created_at: string | null
          description: string | null
          id: string
          module_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["permission_action"]
          created_at?: string | null
          description?: string | null
          id?: string
          module_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["permission_action"]
          created_at?: string | null
          description?: string | null
          id?: string
          module_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "permissions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      positions: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "positions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean | null
          avatar_url: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          is_super_admin: boolean | null
          last_name: string | null
          phone: string | null
          tenant_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          is_super_admin?: boolean | null
          last_name?: string | null
          phone?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_super_admin?: boolean | null
          last_name?: string | null
          phone?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      role_notification_preferences: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          id: string
          in_app_enabled: boolean | null
          receive_summary: boolean | null
          role_id: string
          summary_frequency: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          receive_summary?: boolean | null
          role_id: string
          summary_frequency?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          receive_summary?: boolean | null
          role_id?: string
          summary_frequency?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_notification_preferences_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_notification_preferences_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_system: boolean | null
          name: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          settings: Json | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          created_at: string | null
          granted: boolean | null
          id: string
          permission_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          granted?: boolean | null
          id?: string
          permission_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          granted?: boolean | null
          id?: string
          permission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      vigilancia_types: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          is_standard: boolean | null
          name: string
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_standard?: boolean | null
          name: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_standard?: boolean | null
          name?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vigilancia_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      vigilancias: {
        Row: {
          created_at: string | null
          created_by: string | null
          diagnosis: string | null
          employee_id: string
          end_date: string | null
          follow_up_date: string | null
          id: string
          recommendations: string | null
          restrictions: string | null
          start_date: string
          status: Database["public"]["Enums"]["vigilancia_status"] | null
          tenant_id: string
          updated_at: string | null
          vigilancia_type: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          diagnosis?: string | null
          employee_id: string
          end_date?: string | null
          follow_up_date?: string | null
          id?: string
          recommendations?: string | null
          restrictions?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["vigilancia_status"] | null
          tenant_id: string
          updated_at?: string | null
          vigilancia_type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          diagnosis?: string | null
          employee_id?: string
          end_date?: string | null
          follow_up_date?: string | null
          id?: string
          recommendations?: string | null
          restrictions?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["vigilancia_status"] | null
          tenant_id?: string
          updated_at?: string | null
          vigilancia_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "vigilancias_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vigilancias_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_notification_preferences: {
        Args: { _user_id: string }
        Returns: {
          email_enabled: boolean
          in_app_enabled: boolean
          receive_summary: boolean
          summary_frequency: string
        }[]
      }
      get_user_tenant_id: { Args: { _user_id: string }; Returns: string }
      has_permission: {
        Args: {
          _action: Database["public"]["Enums"]["permission_action"]
          _module_code: string
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "tenant_admin" | "user"
      communication_status: "borrador" | "enviado" | "leido"
      communication_type: "circular" | "memorando" | "notificacion" | "alerta"
      course_status: "pendiente" | "en_progreso" | "completado" | "vencido"
      evaluation_status: "pendiente" | "en_proceso" | "completada" | "cancelada"
      exam_status: "pendiente" | "vigente" | "vencido" | "proximo_vencer"
      permission_action:
        | "ver"
        | "crear"
        | "editar"
        | "eliminar"
        | "firmar"
        | "aprobar"
      vigilancia_status: "activa" | "inactiva" | "vencida"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "tenant_admin", "user"],
      communication_status: ["borrador", "enviado", "leido"],
      communication_type: ["circular", "memorando", "notificacion", "alerta"],
      course_status: ["pendiente", "en_progreso", "completado", "vencido"],
      evaluation_status: ["pendiente", "en_proceso", "completada", "cancelada"],
      exam_status: ["pendiente", "vigente", "vencido", "proximo_vencer"],
      permission_action: [
        "ver",
        "crear",
        "editar",
        "eliminar",
        "firmar",
        "aprobar",
      ],
      vigilancia_status: ["activa", "inactiva", "vencida"],
    },
  },
} as const
