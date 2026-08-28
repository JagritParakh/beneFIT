'use client'

import useSWR from 'swr'
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Heart,
  Menu,
  Package,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Store,
  UserRound,
  X,
} from 'lucide-react'

const products = [
  { id: 1, name: 'Sculpted leather blazer', brand: 'Mango', audience: ['Men', 'Women'], price: 1850, type: 'THRIFT', condition: 'Like new', size: 'M', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85', tone: 'ink' },
  { id: 2, name: 'Linen column dress', brand: 'COS', audience: ['Women'], price: 2400, rental: 320, type: 'RENTAL', condition: 'Excellent', size: 'S', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85', tone: 'sand' },
  { id: 3, name: 'Asymmetric shoulder bag', brand: 'Aesther', audience: ['Women', 'Accessories'], price: 1600, type: 'THRIFT', condition: 'Excellent', size: 'One size', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85', tone: 'stone' },
  { id: 4, name: 'Raw denim wide leg', brand: 'Levi’s', audience: ['Women', 'Kids'], price: 1250, rental: 220, type: 'RENTAL', condition: 'Good', size: '28', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=85', tone: 'blue' },
  { id: 5, name: 'Minimal wool coat', brand: 'Arket', audience: ['Men', 'Women'], price: 3200, type: 'THRIFT', condition: 'Like new', size: 'L', image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=900&q=85', tone: 'grey' },
  { id: 6, name: 'Silver sculptural hoops', brand: 'Oma the Label', audience: ['Women', 'Accessories'], price: 950, type: 'THRIFT', condition: 'New', size: 'One size', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85', tone: 'silver' },
]

const categories = [
  ['Jackets', 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=80'],
  ['Dresses', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80'],
  ['Shoes', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'],
  ['Bags', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80'],
]

const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

function ProductCard({ product, onAdd, onWishlist, onNotify, initiallyLiked = false }: { product: typeof products[number]; onAdd: (product: typeof products[number]) => void; onWishlist?: (product: typeof products[number], liked: boolean) => void; onNotify?: (message: string) => void; initiallyLiked?: boolean }) {
  const [liked, setLiked] = useState(initiallyLiked)
  useEffect(() => setLiked(initiallyLiked), [initiallyLiked])
  return (
    <motion.article layout whileHover={{ y: -6 }} className="product-card group">
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} className="product-image" />
        <button className={`icon-button product-heart ${liked ? 'liked' : ''}`} aria-label={`${liked ? 'Remove' : 'Add'} ${product.name} ${liked ? 'from' : 'to'} wishlist`} onClick={(event) => { event.stopPropagation(); setLiked(!liked); onWishlist?.(product, !liked) }}>
          <Heart size={17} fill={liked ? 'currentColor' : 'none'} />
        </button>
        <span className={`product-badge ${product.type === 'RENTAL' ? 'rental' : ''}`}>{product.type}</span>
        <div className="quick-actions">
          <button onClick={(event) => { event.stopPropagation(); onAdd(product); onNotify?.(`${product.name} added to your bag`) }}>Quick add <ArrowRight size={14} /></button>
        </div>
      </div>
      <div className="product-meta">
        <div className="eyebrow-row"><span>{product.brand}</span><span className="rating">★ 4.9</span></div>
        <h3>{product.name}</h3>
        <div className="price-row"><strong>{formatPrice(product.price)}</strong>{product.rental && <span>or {formatPrice(product.rental)}/day</span>}</div>
        <p className="condition">{product.condition} · {product.size}</p>
      </div>
    </motion.article>
  )
}

export default function LayerMarketplace() {
  const supabase = createClient()
  const { data: liveProducts } = useSWR('marketplace-products', async () => {
    const { data, error } = await supabase.from('products').select('id,name,brand,gender,price,rental_price,listing_type,condition,sizes,status').order('created_at', { ascending: false })
    if (error) throw error
    return data
  }, { revalidateOnFocus: false })
  const catalog: typeof products = liveProducts?.length ? liveProducts.map((item: any, index: number) => ({ id: index + 1, dbId: item.id, name: item.name, brand: item.brand || 'Independent seller', audience: item.gender ? [item.gender] : ['Women'], price: Number(item.price), rental: item.rental_price ? Number(item.rental_price) : undefined, type: item.listing_type === 'rental' ? 'RENTAL' : 'THRIFT', condition: item.condition || 'Good', size: item.sizes?.[0] || 'One size', image: products[index % products.length].image, tone: products[index % products.length].tone })) : products
  const { data: sessionUser } = useSWR('current-user', async () => (await supabase.auth.getUser()).data.user, { revalidateOnFocus: false })
  const [localWishlist, setLocalWishlist] = useState<string[]>([])
  const { data: wishlistRows, mutate: mutateWishlist } = useSWR(sessionUser ? ['wishlist', sessionUser.id] : null, async () => { const { data, error } = await supabase.from('wishlists').select('product_id').eq('user_id', sessionUser!.id); if (error) throw error; return data ?? [] })
  const wishlistIds = new Set([...(wishlistRows ?? []).map((row: any) => String(row.product_id)), ...localWishlist])
  const { data: merchantRows } = useSWR(sessionUser ? ['merchant-dashboard', sessionUser.id] : null, async () => { const [profile, productsResult, itemsResult] = await Promise.all([supabase.from('profiles').select('full_name').eq('id', sessionUser!.id).maybeSingle(), supabase.from('products').select('id,name,status,price,quantity,created_at').eq('merchant_id', sessionUser!.id), supabase.from('order_items').select('quantity,unit_price,created_at,order_id,listing_type,products(name),orders(status,created_at)').eq('merchant_id', sessionUser!.id)]); return { profile: profile.data, products: productsResult.data ?? [], items: itemsResult.data ?? [] } })
  const liveWishlistCount = wishlistRows?.length ?? 0
  const merchantRevenue = merchantRows?.items.reduce((sum: number, item: { unit_price: number; quantity: number }) => sum + Number(item.unit_price) * item.quantity, 0) ?? 0
  const merchantOrders = merchantRows?.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0) ?? 0
  const merchantActive = merchantRows?.products.filter((item: { status: string }) => item.status === 'active').length ?? 0
  const [merchantTab, setMerchantTab] = useState('Overview')
  const [chartRange, setChartRange] = useState<'Monthly' | 'Weekly'>('Monthly')
  const [view, setView] = useState<'landing' | 'shop' | 'product' | 'cart' | 'checkout' | 'account' | 'wishlist' | 'merchant'>('landing')
  const [menuOpen, setMenuOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [cart, setCart] = useState<typeof products>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All pieces')
  const [sort, setSort] = useState<'Recommended' | 'Price: low to high' | 'Price: high to low'>('Recommended')
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [priceMax, setPriceMax] = useState(50000)
  const [authMode, setAuthMode] = useState<'customer' | 'merchant'>('customer')
  const [searchFocused, setSearchFocused] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(products[0])
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [heroScrolled, setHeroScrolled] = useState(false)
  const [orbitRotation, setOrbitRotation] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [selectedSize, setSelectedSize] = useState(selectedProduct.size)
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)
  const [checkoutDetails, setCheckoutDetails] = useState({ email: '', address: '', city: '', postalCode: '' })
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(null), 2200) }

  useEffect(() => {
    const onScroll = () => {
      const progress = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1)
      setHeroScrolled(progress > 0.7)
      setOrbitRotation(progress * 32)
    }
    onScroll()
    if (new URLSearchParams(window.location.search).get('view') === 'merchant') setView('merchant')
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const visibleProducts = useMemo(() => {
    const filtered = catalog.filter((item) => {
      const query = search.trim().toLowerCase()
      const matchesSearch = !query || item.audience.some((audience) => audience.toLowerCase() === query) || `${item.name} ${item.brand} ${item.type}`.toLowerCase().includes(query)
      const matchesCategory = category === 'All pieces' || (category === 'Thrift' && item.type === 'THRIFT') || (category === 'Rental' && item.type === 'RENTAL') || (category === 'New in' && item.id <= 2) || (category === 'Under ₹2,000' && item.price < 2000)
      const matchesFilters = activeFilters.length === 0 || activeFilters.every((filter) => filter === 'Rental' ? item.type === 'RENTAL' : filter === 'Thrift' ? item.type === 'THRIFT' : filter === 'Under ₹2,000' ? item.price < 2000 : ['XS', 'S', 'M', 'L', 'XL', 'One size'].includes(filter) ? item.size === filter : ['New', 'Like new', 'Excellent', 'Good'].includes(filter) ? item.condition === filter : true)
      const matchesPrice = item.price <= priceMax
      return matchesSearch && matchesCategory && matchesFilters && matchesPrice
    })
    return [...filtered].sort((a, b) => sort === 'Price: low to high' ? a.price - b.price : sort === 'Price: high to low' ? b.price - a.price : a.id - b.id)
  }, [catalog, search, category, sort, activeFilters, priceMax])
  const openShop = (nextSearch = '') => { setSearch(nextSearch); setView('shop'); setSearchFocused(true) }
  const toggleFilter = (filter: string) => setActiveFilters((filters) => filters.includes(filter) ? filters.filter((item) => item !== filter) : [...filters, filter])
  const addToCart = async (product: typeof products[number]) => {
    setCart((items) => items.some((item) => item.id === product.id) ? items : [...items, product])
    notify(`${product.name} added to your bag`)
    const dbId = (product as typeof product & { dbId?: string }).dbId
    if (!dbId) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: existingCart } = await supabase.from('carts').select('id').eq('user_id', user.id).maybeSingle()
    const cartId = existingCart?.id || (await supabase.from('carts').insert({ user_id: user.id }).select('id').single()).data?.id
    if (cartId) await supabase.from('cart_items').upsert({ cart_id: cartId, product_id: dbId, quantity: 1, size: product.size, listing_type: product.type === 'RENTAL' ? 'rental' : 'thrift' }, { onConflict: 'cart_id,product_id,size,listing_type' })
  }
  const toggleWishlist = async (product: typeof products[number], liked: boolean) => {
    let dbId = (product as typeof product & { dbId?: string }).dbId
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { notify('Sign in to save wishlist items'); return }
    if (!dbId) { const { data: candidates, error: lookupError } = await supabase.from('products').select('id,name'); const normalizedName = product.name.trim().toLowerCase(); const matchedProduct = candidates?.find((candidate: { id: string; name: string }) => candidate.name.trim().toLowerCase() === normalizedName || candidate.name.trim().toLowerCase().includes(normalizedName) || normalizedName.includes(candidate.name.trim().toLowerCase())); dbId = matchedProduct?.id; if (lookupError) { console.error('[v0] Wishlist product lookup failed', lookupError) } }
    if (!dbId) { setLocalWishlist((items) => liked ? [...new Set([...items, product.name])] : items.filter((item) => item !== product.name)); notify(liked ? `${product.name} added to your wishlist` : `${product.name} removed from your wishlist`); return }
    if (liked) { const { error } = await supabase.from('wishlists').insert({ user_id: user.id, product_id: dbId }); if (error && error.code !== '23505') { console.error('[v0] Wishlist insert failed', error); notify(error.message || 'Could not save this item'); return }; await mutateWishlist(); notify(`${product.name} added to your wishlist`) }
    else { const { error } = await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', dbId); if (error) { console.error('[v0] Wishlist delete failed', error); notify(error.message || 'Could not update your wishlist'); return }; await mutateWishlist(); notify(`${product.name} removed from your wishlist`) }
  }

  const placeOrder = async () => {
    if (!checkoutDetails.email || !checkoutDetails.address || !checkoutDetails.city || !checkoutDetails.postalCode) { notify('Please complete your delivery details'); return }
    const items = cart.map((item) => ({ productId: (item as typeof item & { dbId?: string }).dbId, quantity: 1, size: item.size, listingType: item.type === 'RENTAL' ? 'rental' : 'thrift' })).filter((item) => item.productId)
    if (!items.length) { setOrderPlaced(true); return }
    const response = await fetch('/api/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ items }) })
    if (response.ok) setOrderPlaced(true)
  }
  const goShop = () => setView('shop')
  const openProduct = (product: typeof products[number]) => { setSelectedProduct(product); setSelectedSize(product.size); setOpenAccordion(null); setView('product') }
  const buyNow = (product: typeof products[number]) => { setCart([product]); setView('checkout') }

  return (
    <div className="layer-app">
      <header className={`site-header ${view !== 'landing' || heroScrolled ? 'header-light' : ''}`}>
        <button className="mobile-menu icon-button" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}><Menu size={20} /></button>
        <nav className={`header-links ${menuOpen ? 'open' : ''}`}>
          {['Men’s', 'Women’s', 'Kids', 'Accessories'].map((link) => { const audience = link.replace('’s', ''); return <button key={link} onClick={() => openShop(audience)}>{link}</button> })}
        </nav>
        <button className="wordmark" onClick={() => setView('landing')}><span className="brand-bene">BENE</span><span className="brand-fit">FIT</span></button>
        <div className="header-actions">
          <button className="header-action" onClick={() => setView('wishlist')}><Heart size={18} /><span className="action-label">Wishlist</span></button>
          <button className="header-action cart-action" onClick={() => setView('cart')}><ShoppingBag size={18} /><span className="cart-count">{cart.length}</span></button>
          {sessionUser ? <button className="avatar-button" onClick={() => setView('account')}><UserRound size={17} /></button> : <button className="header-action" onClick={() => window.location.href = '/login'}>Sign In</button>}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {view === 'landing' && <motion.main key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <section className="landing-hero">
            <div className="hero-chrome" aria-hidden="true" style={{ '--orbit-rotation': `${orbitRotation}deg` } as React.CSSProperties}><div className="chrome-orb orb-one" /><div className="chrome-orb orb-two" /><div className="chrome-line" /></div>
            <div className="hero-copy">
              <p className="kicker">A circular fashion marketplace</p>
              <h1>Wear more.<br /><em>Waste less.</em></h1>
              <p className="hero-description">The better way to find your next favorite piece. Buy pre-loved, rent for the moment, and keep good clothes in motion.</p>
              <div className="hero-actions"><button className="button button-dark" onClick={goShop}>Explore collection <ArrowRight size={16} /></button><button className="text-button" onClick={() => sessionUser ? setView('merchant') : window.location.assign('/login')}>Start selling <ArrowRight size={15} /></button></div>
            </div>
            <div className="hero-caption"><span>01 / 04</span><span>New perspective on dressing</span></div>
          </section>
          <section className="manifesto section-shell"><div className="section-kicker">The BENEFIT loop</div><motion.div className="manifesto-copy" initial={{ opacity: 0, scale: 1.7, y: 40 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: false, amount: 0.35 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}><h2>Good style is<br /><em>always in season.</em></h2><p>We believe the future of fashion is not about owning more. It is about choosing better, sharing often, and making what already exists feel new again.</p></motion.div><div className="loop-words">{['THRIFT', 'RENT', 'RESELL', 'REPEAT'].map((word, index) => <motion.div key={word} whileInView={{ opacity: [0, 1], x: [-16, 0] }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}><span>0{index + 1}</span><strong>{word}</strong><ArrowRight size={18} /></motion.div>)}</div></section>
          
          <section className="featured section-shell"><div className="section-heading"><div><div className="section-kicker">Curated for you</div><h2>Pieces with a<br /><em>second story.</em></h2></div><button className="text-button" onClick={goShop}>View all pieces <ArrowRight size={15} /></button></div><div className="product-grid featured-grid">{catalog.slice(0, 4).map((product) => <div className="product-link" key={product.id} onClick={() => openProduct(product)}><ProductCard product={product} onAdd={addToCart} onWishlist={toggleWishlist} onNotify={notify} initiallyLiked={wishlistIds.has(String((product as typeof product & { dbId?: string }).dbId)) || localWishlist.includes(product.name)} /></div>)}</div></section>
          <section className="final-cta"><div className="section-shell"><p className="kicker">Your wardrobe, reimagined</p><h2 className="final-cta-title"><span className="cta-find">Find your</span><br /><em>next fit.</em></h2><button className="button button-light" onClick={goShop}>Shop the edit <ArrowRight size={16} /></button></div></section>
        </motion.main>}

        {view === 'shop' && <motion.main key="shop" className="shop-page" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <section className="shop-hero section-shell"><div><p className="section-kicker">The edit / 02</p><h1>Find your<br /><em>next layer.</em></h1></div><p>Pre-loved pieces, rental favorites, and the people who give them a second life.</p></section>
          <section className="section-shell shop-content"><div className="shop-toolbar"><div className="search-field"><Search size={17} /><input autoFocus={searchFocused} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Try “black oversized jacket”" aria-label="Search products" />{search && <button onClick={() => setSearch('')} aria-label="Clear search"><X size={16} /></button>}</div><button className="filter-button" onClick={() => setFilterOpen(true)}><SlidersHorizontal size={16} /> Filters <span>6</span></button><label className="sort-button">Sort: <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} aria-label="Sort products"><option>Recommended</option><option>Price: low to high</option><option>Price: high to low</option></select><ChevronDown size={15} /></label></div><div className="category-pills">{['All pieces', 'Thrift', 'Rental', 'New in', 'Under ₹2,000'].map((pill) => <button className={category === pill ? 'active' : ''} key={pill} onClick={() => setCategory(pill)}>{pill}</button>)}</div><div className="shop-grid">{visibleProducts.map((product) => <div className="product-link" key={product.id} onClick={() => openProduct(product)}><ProductCard product={product} onAdd={addToCart} onWishlist={toggleWishlist} onNotify={notify} initiallyLiked={wishlistIds.has(String((product as typeof product & { dbId?: string }).dbId)) || localWishlist.includes(product.name)} /></div>)}</div></section>
        </motion.main>}

        {view === 'product' && <motion.main key="product" className="product-page section-shell" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><button className="back-button" onClick={goShop}><ChevronLeft size={16} /> Back to collection</button><div className="product-detail"><div className="gallery"><div className="gallery-main"><img src={selectedProduct.image} alt={selectedProduct.name} /></div><div className="gallery-thumbs"><img src={selectedProduct.image} alt="" /><img src={products[(selectedProduct.id) % products.length].image} alt="" /><img src={products[(selectedProduct.id + 1) % products.length].image} alt="" /></div></div><div className="product-info"><div className="eyebrow-row"><span>{selectedProduct.brand}</span><span className="rating">★ 4.9 (38)</span></div><h1>{selectedProduct.name}</h1><p className="product-subtitle">{selectedProduct.condition} condition · authenticated by BENEFIT</p><div className="detail-price"><strong>{formatPrice(selectedProduct.price)}</strong>{selectedProduct.rental && <span>or {formatPrice(selectedProduct.rental)} / day</span>}</div><div className="detail-rule" /><div className="option-label">Select size <button onClick={() => setSizeGuideOpen(true)}>Size guide <ArrowRight size={13} /></button></div><div className="size-options">{['XS', 'S', 'M', 'L'].map((size) => <button key={size} className={size === selectedSize ? 'selected' : ''} onClick={() => setSelectedSize(size)}>{size}</button>)}</div><button className="button button-dark full-button" onClick={() => { addToCart({ ...selectedProduct, size: selectedSize }); notify(`${selectedProduct.name} added to your bag`) }}>Add to bag <ShoppingBag size={16} /></button><button className="outline-button full-button" onClick={() => buyNow({ ...selectedProduct, size: selectedSize })}>Buy now <ArrowRight size={16} /></button><div className="detail-accordions">{[['Description', 'A versatile piece selected for everyday rotation and easy styling.'], ['Material & condition', `Made with considered materials. Condition: ${selectedProduct.condition}.`], ['Shipping & returns', 'Ships in 2–4 business days. Returns accepted within 7 days of delivery.'], ['Seller information', `Independent seller · verified by BENEFIT.`]].map(([item, copy]) => <div className="accordion-item" key={item}><button onClick={() => setOpenAccordion(openAccordion === item ? null : item)}>{item}<ChevronDown size={16} className={openAccordion === item ? 'rotate-180' : ''} /></button>{openAccordion === item && <p>{copy}</p>}</div>)}</div><div className="seller-card"><div className="seller-avatar">A</div><div><strong>Sold by Aanya Studio</strong><span>Verified seller · Bengaluru</span></div><ArrowRight size={16} /></div></div></div></motion.main>}

        {view === 'checkout' && <motion.main key="checkout" className="cart-page section-shell" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><button className="back-button" onClick={() => setView('product')}><ChevronLeft size={16} /> Back to product</button><div className="page-title-row"><div><p className="section-kicker">Secure checkout</p><h1>Complete your<br /><em>purchase.</em></h1></div></div><div className="checkout-layout"><div className="checkout-form"><label>Email<input required type="email" value={checkoutDetails.email} onChange={(event) => setCheckoutDetails({ ...checkoutDetails, email: event.target.value })} placeholder="you@example.com" /></label><label>Shipping address<input required value={checkoutDetails.address} onChange={(event) => setCheckoutDetails({ ...checkoutDetails, address: event.target.value })} placeholder="Street address" /></label><label>City<input required value={checkoutDetails.city} onChange={(event) => setCheckoutDetails({ ...checkoutDetails, city: event.target.value })} placeholder="City" /></label><label>Postal code<input required value={checkoutDetails.postalCode} onChange={(event) => setCheckoutDetails({ ...checkoutDetails, postalCode: event.target.value })} placeholder="PIN code" /></label></div><aside className="order-summary"><h2>{cart[0]?.name}</h2><div><span>Item</span><strong>{formatPrice(cart[0]?.price || 0)}</strong></div><div><span>Delivery</span><strong>₹99</strong></div><div className="summary-total"><span>Total</span><strong>{formatPrice((cart[0]?.price || 0) + 99)}</strong></div><button className="button button-dark full-button" onClick={placeOrder}>Place order <ArrowRight size={16} /></button></aside></div></motion.main>}

        {view === 'cart' && <motion.main key="cart" className="cart-page section-shell" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><div className="page-title-row"><div><p className="section-kicker">Your edit</p><h1>Shopping bag <span>({cart.length})</span></h1></div><button className="back-button" onClick={goShop}><ChevronLeft size={16} /> Continue shopping</button></div>{cart.length === 0 ? <div className="empty-state"><ShoppingBag size={30} /><h2>Your bag is waiting.</h2><p>When the right piece finds you, it’ll show up here.</p><button className="button button-dark" onClick={goShop}>Explore collection <ArrowRight size={16} /></button></div> : <div className="cart-layout"><div className="cart-items">{cart.map((item) => <div className="cart-item" key={item.id}><img src={item.image} alt={item.name} /><div className="cart-item-copy"><div className="eyebrow-row"><span>{item.brand}</span><button aria-label="Remove item" onClick={() => setCart(cart.filter((cartItem) => cartItem.id !== item.id))}><X size={16} /></button></div><h3>{item.name}</h3><p>{item.size} · {item.condition}</p><strong>{formatPrice(item.price)}</strong></div></div>)}</div><aside className="order-summary"><h2>Order summary</h2><div><span>Subtotal</span><strong>{formatPrice(cart.reduce((sum, item) => sum + item.price, 0))}</strong></div><div><span>Delivery</span><strong>₹99</strong></div><div><span>Estimated GST</span><strong>₹{Math.round(cart.reduce((sum, item) => sum + item.price, 0) * 0.05).toLocaleString('en-IN')}</strong></div><div className="summary-total"><span>Total</span><strong>{formatPrice(cart.reduce((sum, item) => sum + item.price, 99) * 1.05)}</strong></div><button className="button button-dark full-button" onClick={() => setView('checkout')}>Proceed to checkout <ArrowRight size={16} /></button></aside></div>}</motion.main>}

        {view === 'account' && <motion.main key="account" className="account-page section-shell" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><div className="account-hero"><div className="profile-mark">S</div><div><p className="section-kicker">Good morning, {sessionUser?.user_metadata?.full_name || sessionUser?.email?.split('@')[0] || 'there'}</p><h1>Your BENEFIT.</h1><p>{sessionUser?.email || 'Sign in to view your profile'}</p></div></div><div className="impact-panel"><div><p className="section-kicker">Your circular impact</p><h2>Style that<br /><em>keeps moving.</em></h2></div><div className="impact-stats"><div><strong>{wishlistRows?.length || 0}</strong><span>saved pieces</span></div><div><strong>{formatPrice(merchantRevenue)}</strong><span>merchant revenue</span></div><div><strong>{merchantOrders}</strong><span>orders placed</span></div></div></div><div className="account-grid"><button onClick={() => setView('cart')}><Package size={20} /><strong>Your orders</strong><span>Track your latest pieces <ArrowRight size={15} /></span></button><button onClick={() => setView('wishlist')}><Heart size={20} /><strong>Wishlist</strong><span>{liveWishlistCount} saved pieces <ArrowRight size={15} /></span></button><button onClick={() => setView('merchant')}><Store size={20} /><strong>Start selling</strong><span>Give your wardrobe a second life <ArrowRight size={15} /></span></button></div></motion.main>}

        {view === 'wishlist' && <motion.main key="wishlist" className="shop-page section-shell" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div className="page-title-row"><div><p className="section-kicker">Your saved edit</p><h1>Wishlist <span>({liveWishlistCount})</span></h1></div><button className="back-button" onClick={goShop}>Continue shopping <ArrowRight size={16} /></button></div>{!sessionUser ? <div className="empty-state"><Heart size={30} /><h2>Sign in to see your saved pieces.</h2><button className="button button-dark" onClick={() => window.location.href='/login'}>Sign in <ArrowRight size={16} /></button></div> : liveWishlistCount === 0 ? <div className="empty-state"><Heart size={30} /><h2>Your wishlist is quiet.</h2><p>Save pieces you want to revisit.</p></div> : <div className="shop-grid">{wishlistRows?.map((row: any) => { const item = catalog.find((product) => (product as any).dbId === row.product_id); return item ? <div className="product-link" key={row.product_id} onClick={() => openProduct(item)}><ProductCard product={item} onAdd={addToCart} onWishlist={toggleWishlist} onNotify={notify} initiallyLiked={wishlistIds.has(String((item as typeof item & { dbId?: string }).dbId))} /></div> : null })}</div>}</motion.main>}

        {view === 'merchant' && <motion.main key="merchant" className="merchant-page section-shell" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><div className="merchant-top"><div><p className="section-kicker">{merchantRows?.profile?.full_name || sessionUser?.email?.split('@')[0] || 'Merchant'} / Merchant</p><h1>Good afternoon,<br /><em>{merchantRows?.profile?.full_name || sessionUser?.email?.split('@')[0] || 'Merchant'}.</em></h1></div><div className="merchant-top-actions"><button className="icon-button"><Bell size={18} /></button><button className="button button-dark" onClick={() => setView('shop')}>View storefront <ArrowRight size={16} /></button></div></div><div className="merchant-tabs">{['Overview', 'Products', 'Orders', 'Analytics', 'Settings'].map((tab) => <button key={tab} className={merchantTab === tab ? 'active' : ''} onClick={() => setMerchantTab(tab)}>{tab}</button>)}</div>{merchantTab !== 'Overview' && <section className="merchant-tab-panel"><p className="section-kicker">Merchant workspace / {merchantTab}</p>{merchantTab === 'Products' && <div className="data-list">{merchantRows?.products.length ? merchantRows.products.map((item: any) => <div className="data-row" key={item.id}><span>{item.name || 'Listed product'}</span><strong>{item.status}</strong></div>) : <p>No listed products yet.</p>}</div>}{merchantTab === 'Orders' && <div className="data-list">{merchantRows?.items.length ? merchantRows.items.map((item: any) => <div className="data-row" key={item.order_id}><span>{item.products?.name || 'Order item'}</span><strong>{item.orders?.status || 'Placed'}</strong></div>) : <p>No orders yet.</p>}</div>}{merchantTab === 'Analytics' && <div className="analytics-summary"><div><strong>{formatPrice(merchantRevenue)}</strong><span>Lifetime revenue</span></div><div><strong>{merchantOrders}</strong><span>Items sold</span></div><div><strong>{merchantActive}</strong><span>Active listings</span></div></div>}{merchantTab === 'Settings' && <div className="settings-list"><p><strong>{merchantRows?.profile?.full_name || sessionUser?.email?.split('@')[0] || 'Your account'}</strong><br />{sessionUser?.email || 'No email available'}</p><button className="outline-button" onClick={async () => { await supabase.auth.signOut(); window.location.href = '/' }}>Sign out</button></div>}</section>}
<div className="kpi-grid" style={{ display: merchantTab === 'Overview' ? 'grid' : 'none' }}>{[[formatPrice(merchantRevenue), 'Total revenue', 'Live data'], [String(merchantOrders), 'Orders', 'Live data'], [String(merchantActive), 'Active listings', 'Live data'], [formatPrice(merchantOrders ? merchantRevenue / merchantOrders : 0), 'Avg. order value', 'Live data']].map(([value, label, delta]) => <div className="kpi-card" key={label}><span>{label}</span><strong>{value}</strong><small>{delta} this month</small></div>)}</div><div className="analytics-layout" style={{ display: merchantTab === 'Overview' ? 'grid' : 'none' }}><div className="chart-card"><div className="chart-heading"><div><p className="section-kicker">Sales overview</p><h2>{formatPrice(merchantRevenue)} <span>{chartRange} view</span></h2></div><div className="chart-switch">{(['Monthly', 'Weekly'] as const).map((range) => <button key={range} className={chartRange === range ? 'active' : ''} onClick={() => setChartRange(range)}>{range}</button>)}</div></div><div className="fake-chart"><div className="chart-y"><span>₹30k</span><span>₹20k</span><span>₹10k</span><span>₹0</span></div><svg viewBox="0 0 700 220" preserveAspectRatio="none" role="img" aria-label="Sales trend rising chart"><path d="M0,180 C40,170 55,125 105,145 S160,160 205,110 S260,125 310,90 S365,118 410,80 S465,105 510,60 S570,85 610,48 S665,60 700,20" fill="none" stroke="currentColor" strokeWidth="3" /><path d="M0,180 C40,170 55,125 105,145 S160,160 205,110 S260,125 310,90 S365,118 410,80 S465,105 510,60 S570,85 610,48 S665,60 700,20 V220 H0 Z" fill="currentColor" opacity=".08" /></svg><div className="chart-x"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span></div></div></div><div className="alert-card"><div className="card-title"><p className="section-kicker">Needs attention</p><CircleHelp size={18} /></div><div className="alert-row"><span className="alert-dot lime" /><div><strong>3 listings need photos</strong><p>Improve visibility with better imagery</p></div><ArrowRight size={15} /></div><div className="alert-row"><span className="alert-dot" /><div><strong>2 rentals due this week</strong><p>Prepare items for return inspection</p></div><ArrowRight size={15} /></div></div></div><div className="recent-orders"><div className="card-title"><div><p className="section-kicker">Latest activity</p><h2></h2></div><button className="text-button">View all <ArrowRight size={15} /></button></div><div className="orders-table">{[['Linen column dress', 'Riya Mehta', 'Rental', '₹320', 'In transit'], ['Sculpted leather blazer', 'Nikhil Shah', 'Thrift', '₹1,850', 'Delivered'], ['Raw denim wide leg', 'Maya Rao', 'Rental', '₹220', 'Active']].map(([item, customer, type, amount, status]) => <div className="order-row" key={item}><div className="order-product"><div className="mini-product" /><strong>{item}</strong></div><span>{customer}</span><span>{type}</span><span>{amount}</span><span className="status">{status}</span></div>)}</div></div></motion.main>}
      </AnimatePresence>

      <AnimatePresence>{filterOpen && <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFilterOpen(false)}><motion.aside className="filter-drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} onClick={(event) => event.stopPropagation()}><div className="drawer-head"><h2>Filters</h2><button onClick={() => setFilterOpen(false)} className="icon-button"><X size={18} /></button></div>{['Type', 'Price', 'Size', 'Condition'].map((filter) => <div className="filter-group" key={filter}><button className={`filter-line ${openFilter === filter ? 'open' : ''}`} onClick={() => setOpenFilter(openFilter === filter ? null : filter)}>{filter}<span>{filter === 'Type' && activeFilters.filter((item) => ['Thrift', 'Rental'].includes(item)).length ? 'Selected' : filter === 'Price' && priceMax < 50000 ? formatPrice(priceMax) : filter === 'Size' && activeFilters.some((item) => ['XS', 'S', 'M', 'L', 'XL', 'One size'].includes(item)) ? 'Selected' : filter === 'Condition' && activeFilters.some((item) => ['New', 'Like new', 'Excellent', 'Good'].includes(item)) ? 'Selected' : ''}</span><ChevronDown size={16} /></button>{openFilter === filter && <div className="filter-options">{filter === 'Type' && ['Thrift', 'Rental'].map((option) => <button className={activeFilters.includes(option) ? 'choice-active' : ''} key={option} onClick={() => toggleFilter(option)}>{option}</button>)}{filter === 'Price' && <div className="price-filter"><div><span>₹0</span><strong>{formatPrice(priceMax)}</strong><span>₹50,000</span></div><input type="range" min="0" max="50000" step="500" value={priceMax} onChange={(event) => setPriceMax(Number(event.target.value))} aria-label="Maximum price" /></div>}{filter === 'Size' && ['XS', 'S', 'M', 'L', 'XL', 'One size'].map((option) => <button className={activeFilters.includes(option) ? 'choice-active' : ''} key={option} onClick={() => toggleFilter(option)}>{option}</button>)}{filter === 'Condition' && ['New', 'Like new', 'Excellent', 'Good'].map((option) => <button className={activeFilters.includes(option) ? 'choice-active' : ''} key={option} onClick={() => toggleFilter(option)}>{option}</button>)}</div>}</div>)}<button className="button button-dark full-button" onClick={() => setFilterOpen(false)}>Show {visibleProducts.length} pieces</button></motion.aside></motion.div>}</AnimatePresence>
      <AnimatePresence>{sizeGuideOpen && <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSizeGuideOpen(false)}><motion.aside className="size-guide-drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} onClick={(event) => event.stopPropagation()}><div className="drawer-head"><h2>Size guide</h2><button onClick={() => setSizeGuideOpen(false)} className="icon-button"><X size={18} /></button></div><p>Use your usual fit as a starting point. Measurements are approximate for this piece.</p><div className="size-guide-table"><div><strong>XS</strong><span>32–34 in chest</span></div><div><strong>S</strong><span>34–36 in chest</span></div><div><strong>M</strong><span>36–38 in chest</span></div><div><strong>L</strong><span>38–41 in chest</span></div></div></motion.aside></motion.div>}{toast && <motion.div className="toast" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}><Check size={16} />{toast}</motion.div>}{orderPlaced && <motion.div className="overlay centered" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><motion.div className="confirmation" initial={{ scale: .92, y: 20 }} animate={{ scale: 1, y: 0 }}><div className="confirmation-icon"><Check size={25} /></div><p className="section-kicker">Order confirmed</p><h2>Your next layer<br /><em>is on its way.</em></h2><p>Order #LYR-2408 has been placed. We’ll keep you posted as it moves.</p><button className="button button-dark full-button" onClick={() => { setOrderPlaced(false); setCart([]); setView('landing') }}>Back to BENEFIT <ArrowRight size={16} /></button></motion.div></motion.div>}</AnimatePresence>
    </div>
  )
}
