// TypeScript types for Supabase database
// This will be generated from your actual database schema

export interface Database {
  public: {
    Tables: {
      // Users table
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          role: 'admin' | 'moderator' | 'user'
          status: 'active' | 'inactive' | 'suspended'
          created_at: string
          updated_at: string
          last_login: string | null
          phone: string | null
          avatar_url: string | null
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          role?: 'admin' | 'moderator' | 'user'
          status?: 'active' | 'inactive' | 'suspended'
          created_at?: string
          updated_at?: string
          last_login?: string | null
          phone?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: 'admin' | 'moderator' | 'user'
          status?: 'active' | 'inactive' | 'suspended'
          created_at?: string
          updated_at?: string
          last_login?: string | null
          phone?: string | null
          avatar_url?: string | null
        }
      }
      
      // Form Submissions table (your actual structure)
      form_submissions: {
        Row: {
          id: string
          sender_name: string
          sender_tc: string
          sender_address: string
          sender_contact: string
          sender_phone_code: string | null
          receiver_name: string
          receiver_address: string
          city_postal: string
          destination: string
          receiver_contact: string
          receiver_phone_code: string | null
          receiver_email: string
          content_description: string
          content_value: string | null
          user_type: 'guest' | 'registered'
          user_email: string | null
          user_id: string | null
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          created_at: string
          updated_at: string
          // Price card information
          selected_carrier: string | null
          selected_quote: any | null
          destination_country: string | null
          package_quantity: number | null
          total_weight: number | null
          price_card_timestamp: number | null
          // Enhanced shipping details
          chargeable_weight: number | null
          cargo_price: number | null
          service_type: string | null
        }
        Insert: {
          id?: string
          sender_name: string
          sender_tc: string
          sender_address: string
          sender_contact: string
          sender_phone_code?: string | null
          receiver_name: string
          receiver_address: string
          city_postal: string
          destination: string
          receiver_contact: string
          receiver_phone_code?: string | null
          receiver_email: string
          content_description: string
          content_value?: string | null
          user_type?: 'guest' | 'registered'
          user_email?: string | null
          user_id?: string | null
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          created_at?: string
          updated_at?: string
          // Price card information
          selected_carrier?: string | null
          selected_quote?: any | null
          destination_country?: string | null
          package_quantity?: number | null
          total_weight?: number | null
          price_card_timestamp?: number | null
          // Enhanced shipping details
          chargeable_weight?: number | null
          cargo_price?: number | null
          service_type?: string | null
        }
        Update: {
          id?: string
          sender_name?: string
          sender_tc?: string
          sender_address?: string
          sender_contact?: string
          sender_phone_code?: string | null
          receiver_name?: string
          receiver_address?: string
          city_postal?: string
          destination?: string
          receiver_contact?: string
          receiver_phone_code?: string | null
          receiver_email?: string
          content_description?: string
          content_value?: string | null
          user_type?: 'guest' | 'registered'
          user_email?: string | null
          user_id?: string | null
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          created_at?: string
          updated_at?: string
          // Price card information
          selected_carrier?: string | null
          selected_quote?: any | null
          destination_country?: string | null
          package_quantity?: number | null
          total_weight?: number | null
          price_card_timestamp?: number | null
          // Enhanced shipping details
          chargeable_weight?: number | null
          cargo_price?: number | null
          service_type?: string | null
        }
      }

      // Messages/Support tickets
      messages: {
        Row: {
          id: string
          customer_id: string | null
          customer_name: string
          customer_email: string
          subject: string
          message: string
          status: 'new' | 'replied' | 'closed'
          priority: 'low' | 'medium' | 'high'
          category: 'support' | 'complaint' | 'inquiry' | 'feedback'
          created_at: string
          updated_at: string
          last_reply: string | null
          admin_reply: string | null
        }
        Insert: {
          id?: string
          customer_id?: string | null
          customer_name: string
          customer_email: string
          subject: string
          message: string
          status?: 'new' | 'replied' | 'closed'
          priority?: 'low' | 'medium' | 'high'
          category?: 'support' | 'complaint' | 'inquiry' | 'feedback'
          created_at?: string
          updated_at?: string
          last_reply?: string | null
          admin_reply?: string | null
        }
        Update: {
          id?: string
          customer_id?: string | null
          customer_name?: string
          customer_email?: string
          subject?: string
          message?: string
          status?: 'new' | 'replied' | 'closed'
          priority?: 'low' | 'medium' | 'high'
          category?: 'support' | 'complaint' | 'inquiry' | 'feedback'
          created_at?: string
          updated_at?: string
          last_reply?: string | null
          admin_reply?: string | null
        }
      }

      // Admin settings
      admin_settings: {
        Row: {
          id: string
          key: string
          value: string
          category: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          category: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          category?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // Pricing rules
      pricing_rules: {
        Row: {
          id: string
          carrier: 'UPS' | 'DHL' | 'ARAMEX'
          region: string
          weight_min: number
          weight_max: number | null
          price_per_kg: number
          minimum_charge: number
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          carrier: 'UPS' | 'DHL' | 'ARAMEX'
          region: string
          weight_min: number
          weight_max?: number | null
          price_per_kg: number
          minimum_charge: number
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          carrier?: 'UPS' | 'DHL' | 'ARAMEX'
          region?: string
          weight_min?: number
          weight_max?: number | null
          price_per_kg?: number
          minimum_charge?: number
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
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
      user_role: 'admin' | 'moderator' | 'user'
      user_status: 'active' | 'inactive' | 'suspended'
      order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
      message_status: 'new' | 'replied' | 'closed'
      message_priority: 'low' | 'medium' | 'high'
      message_category: 'support' | 'complaint' | 'inquiry' | 'feedback'
      carrier_type: 'UPS' | 'DHL' | 'ARAMEX'
    }
  }
}
