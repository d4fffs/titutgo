export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      canteens: {
        Row: {
          created_at: string
          description: string
          id: number
          image_url: string | null
          is_active: boolean
          location: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: never
          image_url?: string | null
          is_active?: boolean
          location?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: never
          image_url?: string | null
          is_active?: boolean
          location?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: number
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: never
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: never
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
        }
        Relationships: []
      }
      courier_tasks: {
        Row: {
          accepted_at: string | null
          courier_id: string | null
          created_at: string
          delivered_at: string | null
          id: number
          order_id: number
          picked_up_at: string | null
          task_status: Database["public"]["Enums"]["task_status"]
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          courier_id?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: never
          order_id: number
          picked_up_at?: string | null
          task_status?: Database["public"]["Enums"]["task_status"]
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          courier_id?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: never
          order_id?: number
          picked_up_at?: string | null
          task_status?: Database["public"]["Enums"]["task_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courier_tasks_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courier_tasks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: number
          line_total: number
          order_id: number
          product_id: number
          product_name_snapshot: string
          quantity: number
          unit_price_snapshot: number
        }
        Insert: {
          created_at?: string
          id?: never
          line_total: number
          order_id: number
          product_id: number
          product_name_snapshot: string
          quantity: number
          unit_price_snapshot: number
        }
        Update: {
          created_at?: string
          id?: never
          line_total?: number
          order_id?: number
          product_id?: number
          product_name_snapshot?: string
          quantity?: number
          unit_price_snapshot?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: number
          new_status: Database["public"]["Enums"]["order_status"]
          note: string | null
          order_id: number
          previous_status: Database["public"]["Enums"]["order_status"] | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: never
          new_status: Database["public"]["Enums"]["order_status"]
          note?: string | null
          order_id: number
          previous_status?: Database["public"]["Enums"]["order_status"] | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: never
          new_status?: Database["public"]["Enums"]["order_status"]
          note?: string | null
          order_id?: number
          previous_status?: Database["public"]["Enums"]["order_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          canteen_id: number
          courier_id: string | null
          created_at: string
          customer_note: string
          delivery_fee: number
          delivery_location: string
          id: number
          jastip_fee: number
          order_number: string
          order_status: Database["public"]["Enums"]["order_status"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          subtotal: number
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          canteen_id: number
          courier_id?: string | null
          created_at?: string
          customer_note?: string
          delivery_fee?: number
          delivery_location: string
          id?: never
          jastip_fee?: number
          order_number: string
          order_status?: Database["public"]["Enums"]["order_status"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          subtotal: number
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          canteen_id?: number
          courier_id?: string | null
          created_at?: string
          customer_note?: string
          delivery_fee?: number
          delivery_location?: string
          id?: never
          jastip_fee?: number
          order_number?: string
          order_status?: Database["public"]["Enums"]["order_status"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          subtotal?: number
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_canteen_id_fkey"
            columns: ["canteen_id"]
            isOneToOne: false
            referencedRelation: "canteens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: number
          order_id: number
          provider: string
          provider_reference: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: never
          order_id: number
          provider?: string
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: never
          order_id?: number
          provider?: string
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          canteen_id: number
          category_id: number | null
          created_at: string
          description: string
          id: number
          image_url: string | null
          is_available: boolean
          name: string
          price: number
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          canteen_id: number
          category_id?: number | null
          created_at?: string
          description?: string
          id?: never
          image_url?: string | null
          is_available?: boolean
          name: string
          price: number
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          canteen_id?: number
          category_id?: number | null
          created_at?: string
          description?: string
          id?: never
          image_url?: string | null
          is_available?: boolean
          name?: string
          price?: number
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_canteen_id_fkey"
            columns: ["canteen_id"]
            isOneToOne: false
            referencedRelation: "canteens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          student_id: string | null
          study_program: string | null
          updated_at: string
        }
        Insert: {
          account_status?: string
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          student_id?: string | null
          study_program?: string | null
          updated_at?: string
        }
        Update: {
          account_status?: string
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          student_id?: string | null
          study_program?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      courier_claim_order: { Args: { p_order_id: number }; Returns: Json }
      courier_update_task_status: {
        Args: { p_new_status: string; p_note?: string; p_order_id: number }
        Returns: Json
      }
      get_my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      is_admin: { Args: never; Returns: boolean }
      is_courier: { Args: never; Returns: boolean }
      place_order: {
        Args: {
          p_canteen_id: number
          p_customer_note?: string
          p_delivery_fee?: number
          p_delivery_location: string
          p_items?: Json
          p_jastip_fee?: number
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "user" | "courier" | "admin"
      order_status:
        | "pending"
        | "confirmed"
        | "preparing"
        | "ready_for_pickup"
        | "picked_up"
        | "on_delivery"
        | "delivered"
        | "cancelled"
      payment_status: "unpaid" | "pending" | "paid" | "failed" | "refunded"
      task_status:
        | "available"
        | "accepted"
        | "picked_up"
        | "delivered"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
