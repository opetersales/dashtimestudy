
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          created_at?: string
        }
      }
      time_studies: {
        Row: {
          id: string
          user_id: string | null
          client: string
          model_name: string
          study_date: string | null
          responsible_person: string | null
          monthly_demand: number | null
          working_days: number | null
          daily_demand: number | null
          status: string | null
          created_at: string | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          client: string
          model_name: string
          study_date?: string | null
          responsible_person?: string | null
          monthly_demand?: number | null
          working_days?: number | null
          daily_demand?: number | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          client?: string
          model_name?: string
          study_date?: string | null
          responsible_person?: string | null
          monthly_demand?: number | null
          working_days?: number | null
          daily_demand?: number | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
          version?: string | null
        }
      }
      shifts: {
        Row: {
          id: string
          study_id: string | null
          name: string
          hours: number
          is_active: boolean | null
          takt_time: number | null
        }
        Insert: {
          id?: string
          study_id?: string | null
          name: string
          hours: number
          is_active?: boolean | null
          takt_time?: number | null
        }
        Update: {
          id?: string
          study_id?: string | null
          name?: string
          hours?: number
          is_active?: boolean | null
          takt_time?: number | null
        }
      }
      production_lines: {
        Row: {
          id: string
          study_id: string | null
          name: string
          notes: string | null
        }
        Insert: {
          id?: string
          study_id?: string | null
          name: string
          notes?: string | null
        }
        Update: {
          id?: string
          study_id?: string | null
          name?: string
          notes?: string | null
        }
      }
      workstations: {
        Row: {
          id: string
          line_id: string | null
          number: string
          name: string | null
          notes: string | null
          position: number | null
        }
        Insert: {
          id?: string
          line_id?: string | null
          number: string
          name?: string | null
          notes?: string | null
          position?: number | null
        }
        Update: {
          id?: string
          line_id?: string | null
          number?: string
          name?: string | null
          notes?: string | null
          position?: number | null
        }
      }
      activities: {
        Row: {
          id: string
          workstation_id: string | null
          description: string
          type: string
          pfd_factor: number | null
          name: string | null
          average_normal_time: number | null
          cycle_time: number | null
        }
        Insert: {
          id?: string
          workstation_id?: string | null
          description: string
          type: string
          pfd_factor?: number | null
          name?: string | null
          average_normal_time?: number | null
          cycle_time?: number | null
        }
        Update: {
          id?: string
          workstation_id?: string | null
          description?: string
          type?: string
          pfd_factor?: number | null
          name?: string | null
          average_normal_time?: number | null
          cycle_time?: number | null
        }
      }
      time_collections: {
        Row: {
          id: string
          activity_id: string | null
          value: number
        }
        Insert: {
          id?: string
          activity_id?: string | null
          value: number
        }
        Update: {
          id?: string
          activity_id?: string | null
          value?: number
        }
      }
      history: {
        Row: {
          id: string
          user_id: string | null
          date: string | null
          action: string
          details: string | null
          entity_type: string
          entity_id: string
          entity_name: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          date?: string | null
          action: string
          details?: string | null
          entity_type: string
          entity_id: string
          entity_name?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          date?: string | null
          action?: string
          details?: string | null
          entity_type?: string
          entity_id?: string
          entity_name?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
