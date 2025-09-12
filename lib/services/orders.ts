import { supabase, supabaseAdmin } from '../supabase'
import { Database } from '../database.types'

type Order = Database['public']['Tables']['orders']['Row']
type OrderInsert = Database['public']['Tables']['orders']['Insert']
type OrderUpdate = Database['public']['Tables']['orders']['Update']

export class OrderService {
  // Get all orders with pagination and filtering
  static async getOrders(
    page: number = 1,
    pageSize: number = 10,
    searchTerm?: string,
    statusFilter?: string,
    carrierFilter?: string
  ) {
    let query = supabase
      .from('form_submissions')
      .select('*', { count: 'exact' })

    // Apply filters
    if (searchTerm) {
      query = query.or(`id.ilike.%${searchTerm}%,sender_name.ilike.%${searchTerm}%,receiver_name.ilike.%${searchTerm}%,receiver_email.ilike.%${searchTerm}%,destination.ilike.%${searchTerm}%,sender_tc.ilike.%${searchTerm}%`)
    }
    
    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }
    
    if (carrierFilter && carrierFilter !== 'all') {
      query = query.eq('user_type', carrierFilter)
    }

    // Apply pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    
    query = query
      .range(from, to)
      .order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(`Error fetching orders: ${error.message}`)
    }

    return {
      orders: data || [],
      total: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
      currentPage: page
    }
  }

  // Get order by ID
  static async getOrderById(id: string) {
    const { data, error } = await supabase
      .from('form_submissions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Error fetching order: ${error.message}`)
    }

    return data
  }

  // Create new order
  static async createOrder(orderData: OrderInsert) {
    const { data, error } = await supabaseAdmin
      .from('form_submissions')
      .insert([{
        ...orderData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      throw new Error(`Error creating order: ${error.message}`)
    }

    return data
  }

  // Update order
  static async updateOrder(id: string, updates: OrderUpdate) {
    const { data, error } = await supabaseAdmin
      .from('form_submissions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error updating order: ${error.message}`)
    }

    return data
  }

  // Update order status
  static async updateOrderStatus(id: string, status: Order['status'], trackingNumber?: string) {
    const updates: OrderUpdate = {
      status,
      updated_at: new Date().toISOString()
    }

    if (trackingNumber) {
      updates.tracking_number = trackingNumber
    }

    const { data, error } = await supabaseAdmin
      .from('form_submissions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error updating order status: ${error.message}`)
    }

    return data
  }

  // Delete order
  static async deleteOrder(id: string) {
    const { error } = await supabaseAdmin
      .from('form_submissions')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Error deleting order: ${error.message}`)
    }

    return true
  }

  // Get order statistics
  static async getOrderStats() {
    const { data: allOrders, error: allError } = await supabase
      .from('form_submissions')
      .select('status, content_value, created_at, destination')

    if (allError) {
      throw new Error(`Error fetching order stats: ${allError.message}`)
    }

    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const thisMonthOrders = allOrders?.filter(o => new Date(o.created_at) >= thisMonth) || []
    const lastMonthOrders = allOrders?.filter(o => 
      new Date(o.created_at) >= lastMonth && 
      new Date(o.created_at) < thisMonth
    ) || []

    const stats = {
      total: allOrders?.length || 0,
      pending: allOrders?.filter(o => o.status === 'pending').length || 0,
      processing: allOrders?.filter(o => o.status === 'processing').length || 0,
      shipped: allOrders?.filter(o => o.status === 'shipped').length || 0,
      delivered: allOrders?.filter(o => o.status === 'delivered').length || 0,
      cancelled: allOrders?.filter(o => o.status === 'cancelled').length || 0,
      thisMonthCount: thisMonthOrders.length,
      lastMonthCount: lastMonthOrders.length,
      thisMonthRevenue: thisMonthOrders.reduce((sum, o) => sum + parseFloat(o.content_value), 0),
      lastMonthRevenue: lastMonthOrders.reduce((sum, o) => sum + parseFloat(o.content_value), 0),
      totalRevenue: allOrders?.reduce((sum, o) => sum + parseFloat(o.content_value), 0) || 0,
      averageOrderValue: allOrders?.length ? 
        (allOrders.reduce((sum, o) => sum + parseFloat(o.content_value), 0) / allOrders.length) : 0,
      topDestinations: this.getTopDestinations(allOrders || [])
    }

    return stats
  }

  // Get recent orders for dashboard
  static async getRecentOrders(limit: number = 10) {
    const { data, error } = await supabase
      .from('form_submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Error fetching recent orders: ${error.message}`)
    }

    return data || []
  }

  // Get monthly revenue data for charts
  static async getMonthlyRevenue(months: number = 12) {
    const { data, error } = await supabase
      .from('form_submissions')
      .select('content_value, created_at')
      .gte('created_at', new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString())

    if (error) {
      throw new Error(`Error fetching monthly revenue: ${error.message}`)
    }

    // Group by month
    const monthlyData: { [key: string]: number } = {}
    data?.forEach(order => {
      const month = new Date(order.created_at).toISOString().slice(0, 7) // YYYY-MM
      monthlyData[month] = (monthlyData[month] || 0) + parseFloat(order.content_value)
    })

    return Object.entries(monthlyData)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }

  // Helper function to get top destinations
  private static getTopDestinations(orders: Order[]) {
    const destinationCount: { [key: string]: { count: number; revenue: number } } = {}
    
    orders.forEach(order => {
      if (!destinationCount[order.destination]) {
        destinationCount[order.destination] = { count: 0, revenue: 0 }
      }
      destinationCount[order.destination].count++
      destinationCount[order.destination].revenue += parseFloat(order.content_value)
    })

    return Object.entries(destinationCount)
      .map(([destination, stats]) => ({
        destination,
        orders: stats.count,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 10)
  }
}
