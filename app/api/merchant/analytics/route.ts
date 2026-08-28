import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  const { data: items, error } = await supabase.from('order_items').select('quantity, unit_price, order_id').eq('merchant_id', user.id)
  if (error) return NextResponse.json({ error: 'Unable to load analytics' }, { status: 500 })
  const rows = items ?? []
  const revenue = rows.reduce((sum, item) => sum + Number(item.unit_price) * item.quantity, 0)
  return NextResponse.json({ revenue, orders: new Set(rows.map((item) => item.order_id)).size, itemsSold: rows.reduce((sum, item) => sum + item.quantity, 0) })
}
