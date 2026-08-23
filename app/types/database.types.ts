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
      preferences: {
        Row: {
          id: string
          user_id: string
          modes: string[]
          max_walk_distance: number | null
          co2_objectif: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          modes?: string[]
          max_walk_distance?: number | null
          co2_objectif?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          modes?: string[]
          max_walk_distance?: number | null
          co2_objectif?: number | null
          created_at?: string
        }
      }
      favoris: {
        Row: {
          id: string
          user_id: string
          title: string
          address: string
          lat: number
          lon: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          address: string
          lat: number
          lon: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          address?: string
          lat?: number
          lon?: number
          created_at?: string
        }
      }
      stops: {
        Row: {
          id: string
          name: string
          geom: unknown
          type: string | null
        }
        Insert: {
          id: string
          name: string
          geom: unknown
          type?: string | null
        }
        Update: {
          id?: string
          name?: string
          geom?: unknown
          type?: string | null
        }
      }
      routes: {
        Row: {
          id: string
          geometry: unknown
          mode: string
          source_gtfs: string | null
        }
        Insert: {
          id: string
          geometry: unknown
          mode: string
          source_gtfs?: string | null
        }
        Update: {
          id?: string
          geometry?: unknown
          mode?: string
          source_gtfs?: string | null
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
