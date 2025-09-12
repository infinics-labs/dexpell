import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get all orders to analyze user data
    const { data: orders, error } = await supabase
      .from('form_submissions')
      .select('sender_name, sender_tc, sender_contact, user_email, content_value, created_at');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

    // Group orders by user (using sender_tc as unique identifier)
    const userMap = new Map();
    
    orders?.forEach(order => {
      const userKey = order.sender_tc;
      
      if (!userMap.has(userKey)) {
        userMap.set(userKey, {
          tc: order.sender_tc,
          name: order.sender_name,
          contact: order.sender_contact,
          email: order.user_email,
          orders: [],
          totalValue: 0,
          firstOrder: order.created_at,
          lastOrder: order.created_at
        });
      }
      
      const user = userMap.get(userKey);
      user.orders.push(order);
      user.totalValue += parseFloat(order.content_value || '0');
      
      // Update date range
      if (new Date(order.created_at) < new Date(user.firstOrder)) {
        user.firstOrder = order.created_at;
      }
      if (new Date(order.created_at) > new Date(user.lastOrder)) {
        user.lastOrder = order.created_at;
      }
    });

    // Convert map to array and add calculated fields
    const users = Array.from(userMap.values()).map(user => ({
      ...user,
      orderCount: user.orders.length,
      averageOrderValue: user.totalValue / user.orders.length
    }));

    // Sort by total value (highest first)
    users.sort((a, b) => b.totalValue - a.totalValue);

    return NextResponse.json({
      users,
      totalUsers: users.length,
      totalOrders: orders?.length || 0,
      totalValue: users.reduce((sum, user) => sum + user.totalValue, 0)
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
