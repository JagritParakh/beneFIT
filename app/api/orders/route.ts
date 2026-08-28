import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const items = Array.isArray(body?.items) ? body.items : []
  const productIds = [...new Set(items.map((item: { productId?: string }) => item.productId).filter(Boolean))]
  if (!productIds.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })

  const { data: products, error: productError } = await supabase.from('products').select('id, merchant_id, price, quantity').in('id', productIds).eq('status', 'active')
  if (productError) return NextResponse.json({ error: 'Unable to validate cart' }, { status: 400 })
  const productMap = new Map((products ?? []).map((product) => [product.id, product]))
  const normalized = items.map((item: { productId?: string; quantity?: number; size?: string; listingType?: string }) => {
    const product = item.productId ? productMap.get(item.productId) : undefined
    const quantity = Number(item.quantity)
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 20 || quantity > product.quantity) return null
    return { product, quantity, size: item.size || null, listingType: item.listingType === 'rental' ? 'rental' : 'thrift' }
  })
  if (normalized.some((item: { product: unknown } | null) => !item)) return NextResponse.json({ error: 'Cart contains unavailable items' }, { status: 400 })
  const validItems = normalized as Array<{ product: { id: string; merchant_id: string; price: number; quantity: number }; quantity: number; size: string | null; listingType: 'rental' | 'thrift' }>
  const subtotal = validItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)
  const deliveryCharge = 99
  const tax = Math.round(subtotal * 0.05 * 100) / 100
  const total = subtotal + deliveryCharge + tax

  const { data: order, error: orderError } = await supabase.from('orders').insert({ user_id: user.id, subtotal, delivery_charge: deliveryCharge, tax, total }).select('id').single()
  if (orderError || !order) return NextResponse.json({ error: 'Unable to create order' }, { status: 500 })
  const { error: itemsError } = await supabase.from('order_items').insert(validItems.map((item) => ({ order_id: order.id, product_id: item.product.id, merchant_id: item.product.merchant_id, quantity: item.quantity, size: item.size, unit_price: item.product.price, listing_type: item.listingType })))
  if (itemsError) {
    await supabase.from('orders').delete().eq('id', order.id)
    return NextResponse.json({ error: 'Unable to save order items' }, { status: 500 })
  }
  await supabase.from('payments').insert({ order_id: order.id, payment_id: `demo_${order.id}`, payment_status: 'success', payment_method: 'dummy' })
  await supabase.from('deliveries').insert({ order_id: order.id, tracking_number: `LYR-${order.id.slice(0, 8).toUpperCase()}`, status: 'Order Placed', estimated_delivery: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10) })
  return NextResponse.json({ orderId: order.id, total })
}
