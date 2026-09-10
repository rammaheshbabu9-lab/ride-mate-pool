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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      drivers: {
        Row: {
          city: string | null
          created_at: string
          id: string
          profile_id: string
          rating: number
          status: Database["public"]["Enums"]["driver_status"]
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          profile_id: string
          rating?: number
          status?: Database["public"]["Enums"]["driver_status"]
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          profile_id?: string
          rating?: number
          status?: Database["public"]["Enums"]["driver_status"]
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      fare_settings: {
        Row: {
          active: boolean
          base_fare: number
          id: string
          minimum_fare: number
          platform_fee: number
          pool_discount_percent: number
          price_per_km: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          base_fare?: number
          id?: string
          minimum_fare?: number
          platform_fee?: number
          pool_discount_percent?: number
          price_per_km?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          base_fare?: number
          id?: string
          minimum_fare?: number
          platform_fee?: number
          pool_discount_percent?: number
          price_per_km?: number
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ride_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          latitude: number | null
          longitude: number | null
          metadata: Json
          ride_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          metadata?: Json
          ride_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          metadata?: Json
          ride_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ride_events_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_matches: {
        Row: {
          created_at: string
          id: string
          match_score: number
          matched_ride_id: string | null
          ride_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_score?: number
          matched_ride_id?: string | null
          ride_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          match_score?: number
          matched_ride_id?: string | null
          ride_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ride_matches_matched_ride_id_fkey"
            columns: ["matched_ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_matches_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_passengers: {
        Row: {
          created_at: string
          customer_id: string
          destination_address: string | null
          destination_lat: number | null
          destination_lng: number | null
          distance_km: number | null
          drop_order: number
          id: string
          individual_fare: number
          pickup_address: string | null
          pickup_lat: number | null
          pickup_lng: number | null
          pickup_order: number
          ride_id: string
          status: Database["public"]["Enums"]["passenger_status"]
        }
        Insert: {
          created_at?: string
          customer_id: string
          destination_address?: string | null
          destination_lat?: number | null
          destination_lng?: number | null
          distance_km?: number | null
          drop_order?: number
          id?: string
          individual_fare?: number
          pickup_address?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          pickup_order?: number
          ride_id: string
          status?: Database["public"]["Enums"]["passenger_status"]
        }
        Update: {
          created_at?: string
          customer_id?: string
          destination_address?: string | null
          destination_lat?: number | null
          destination_lng?: number | null
          distance_km?: number | null
          drop_order?: number
          id?: string
          individual_fare?: number
          pickup_address?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          pickup_order?: number
          ride_id?: string
          status?: Database["public"]["Enums"]["passenger_status"]
        }
        Relationships: [
          {
            foreignKeyName: "ride_passengers_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          city: string | null
          completed_at: string | null
          created_at: string
          customer_id: string
          destination_address: string
          destination_lat: number
          destination_lng: number
          driver_id: string | null
          estimated_distance_km: number
          estimated_fare: number
          id: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          pickup_address: string
          pickup_lat: number
          pickup_lng: number
          platform_fee: number
          pooled_fare: number
          ride_type: Database["public"]["Enums"]["ride_kind"]
          seat_capacity: number
          started_at: string | null
          status: Database["public"]["Enums"]["ride_status"]
        }
        Insert: {
          city?: string | null
          completed_at?: string | null
          created_at?: string
          customer_id: string
          destination_address: string
          destination_lat: number
          destination_lng: number
          driver_id?: string | null
          estimated_distance_km: number
          estimated_fare: number
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          pickup_address: string
          pickup_lat: number
          pickup_lng: number
          platform_fee?: number
          pooled_fare: number
          ride_type?: Database["public"]["Enums"]["ride_kind"]
          seat_capacity?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["ride_status"]
        }
        Update: {
          city?: string | null
          completed_at?: string | null
          created_at?: string
          customer_id?: string
          destination_address?: string
          destination_lat?: number
          destination_lng?: number
          driver_id?: string | null
          estimated_distance_km?: number
          estimated_fare?: number
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          pickup_address?: string
          pickup_lat?: number
          pickup_lng?: number
          platform_fee?: number
          pooled_fare?: number
          ride_type?: Database["public"]["Enums"]["ride_kind"]
          seat_capacity?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["ride_status"]
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          created_at: string
          driver_id: string
          id: string
          seat_capacity: number
          vehicle_number: string
          vehicle_type: string
        }
        Insert: {
          created_at?: string
          driver_id: string
          id?: string
          seat_capacity?: number
          vehicle_number: string
          vehicle_type?: string
        }
        Update: {
          created_at?: string
          driver_id?: string
          id?: string
          seat_capacity?: number
          vehicle_number?: string
          vehicle_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_ride: { Args: { _ride_id: string }; Returns: undefined }
      admin_stats: { Args: never; Returns: Json }
      can_view_ride: { Args: { _ride_id: string }; Returns: boolean }
      cancel_my_ride: { Args: { _ride_id: string }; Returns: undefined }
      distance_km: {
        Args: { lat1: number; lat2: number; lng1: number; lng2: number }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      quote_fare: { Args: { _distance_km: number }; Returns: Json }
      request_ride: {
        Args: {
          _city?: string
          _dest_address: string
          _dest_lat: number
          _dest_lng: number
          _pickup_address: string
          _pickup_lat: number
          _pickup_lng: number
          _ride_type: Database["public"]["Enums"]["ride_kind"]
        }
        Returns: string
      }
      shares_ride_with: { Args: { _other: string }; Returns: boolean }
      update_ride_status: {
        Args: {
          _ride_id: string
          _status: Database["public"]["Enums"]["ride_status"]
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "customer" | "driver" | "admin"
      driver_status: "available" | "busy" | "offline"
      passenger_status: "active" | "cancelled" | "completed"
      payment_status: "pending" | "paid" | "failed"
      ride_kind: "normal" | "pool"
      ride_status:
        | "searching"
        | "matched"
        | "driver_arriving"
        | "started"
        | "completed"
        | "cancelled"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["customer", "driver", "admin"],
      driver_status: ["available", "busy", "offline"],
      passenger_status: ["active", "cancelled", "completed"],
      payment_status: ["pending", "paid", "failed"],
      ride_kind: ["normal", "pool"],
      ride_status: [
        "searching",
        "matched",
        "driver_arriving",
        "started",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
