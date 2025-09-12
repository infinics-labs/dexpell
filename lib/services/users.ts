import { supabase, supabaseAdmin } from '../supabase'
import { Database } from '../database.types'

type User = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']
type UserUpdate = Database['public']['Tables']['users']['Update']

export class UserService {
  // Get all users with pagination and filtering
  static async getUsers(
    page: number = 1,
    pageSize: number = 10,
    searchTerm?: string,
    statusFilter?: string,
    roleFilter?: string
  ) {
    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })

    // Apply filters
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    }
    
    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }
    
    if (roleFilter && roleFilter !== 'all') {
      query = query.eq('role', roleFilter)
    }

    // Apply pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    
    query = query
      .range(from, to)
      .order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Error fetching users: ${error.message}`)
    }

    return {
      users: data || [],
      total: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
      currentPage: page
    }
  }

  // Get user by ID
  static async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Error fetching user: ${error.message}`)
    }

    return data
  }

  // Create new user
  static async createUser(userData: UserInsert) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([{
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      throw new Error(`Error creating user: ${error.message}`)
    }

    return data
  }

  // Update user
  static async updateUser(id: string, updates: UserUpdate) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error updating user: ${error.message}`)
    }

    return data
  }

  // Delete user
  static async deleteUser(id: string) {
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Error deleting user: ${error.message}`)
    }

    return true
  }

  // Get user statistics
  static async getUserStats() {
    const { data: allUsers, error: allError } = await supabase
      .from('users')
      .select('status, role, created_at')

    if (allError) {
      throw new Error(`Error fetching user stats: ${allError.message}`)
    }

    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const stats = {
      total: allUsers?.length || 0,
      active: allUsers?.filter(u => u.status === 'active').length || 0,
      inactive: allUsers?.filter(u => u.status === 'inactive').length || 0,
      suspended: allUsers?.filter(u => u.status === 'suspended').length || 0,
      thisMonth: allUsers?.filter(u => new Date(u.created_at) >= thisMonth).length || 0,
      lastMonth: allUsers?.filter(u => 
        new Date(u.created_at) >= lastMonth && 
        new Date(u.created_at) < thisMonth
      ).length || 0,
      byRole: {
        admin: allUsers?.filter(u => u.role === 'admin').length || 0,
        moderator: allUsers?.filter(u => u.role === 'moderator').length || 0,
        user: allUsers?.filter(u => u.role === 'user').length || 0
      }
    }

    return stats
  }

  // Update user last login
  static async updateLastLogin(id: string) {
    const { error } = await supabase
      .from('users')
      .update({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      throw new Error(`Error updating last login: ${error.message}`)
    }

    return true
  }
}
