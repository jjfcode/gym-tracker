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
      profile: {
        Row: {
          user_id: string
          display_name: string | null
          locale: string
          units: string
          theme: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          display_name?: string | null
          locale?: string
          units?: string
          theme?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          display_name?: string | null
          locale?: string
          units?: string
          theme?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      weight_logs: {
        Row: {
          id: number
          user_id: string
          measured_at: string
          weight: number
          note: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          measured_at: string
          weight: number
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          measured_at?: string
          weight?: number
          note?: string | null
          created_at?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          id: number
          user_id: string
          goal_days_per_week: number
          plan_scope: string
          start_date: string
          meta: Json
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          goal_days_per_week: number
          plan_scope?: string
          start_date: string
          meta?: Json
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          goal_days_per_week?: number
          plan_scope?: string
          start_date?: string
          meta?: Json
          created_at?: string
        }
        Relationships: []
      }
      workouts: {
        Row: {
          id: number
          user_id: string
          plan_id: number | null
          date: string
          title: string
          is_completed: boolean
          duration_minutes: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          plan_id?: number | null
          date: string
          title: string
          is_completed?: boolean
          duration_minutes?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          plan_id?: number | null
          date?: string
          title?: string
          is_completed?: boolean
          duration_minutes?: number | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          }
        ]
      }
      exercises: {
        Row: {
          id: number
          user_id: string
          workout_id: number
          slug: string
          name_en: string
          name_es: string
          machine_brand: string | null
          order_index: number
          target_sets: number
          target_reps: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          workout_id: number
          slug: string
          name_en: string
          name_es: string
          machine_brand?: string | null
          order_index?: number
          target_sets?: number
          target_reps?: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          workout_id?: number
          slug?: string
          name_en?: string
          name_es?: string
          machine_brand?: string | null
          order_index?: number
          target_sets?: number
          target_reps?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          }
        ]
      }
      exercise_sets: {
        Row: {
          id: number
          user_id: string
          exercise_id: number
          set_index: number
          weight: number | null
          reps: number | null
          rpe: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          exercise_id: number
          set_index: number
          weight?: number | null
          reps?: number | null
          rpe?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          exercise_id?: number
          set_index?: number
          weight?: number | null
          reps?: number | null
          rpe?: number | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_sets_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          }
        ]
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