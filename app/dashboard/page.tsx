'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

interface Vehicle {
  id: string
  name: string
  max_payload_kg: number
  base_rate: number
  rate_per_mile: number
  co2_per_mile_g: number
  is_active: boolean
  created_at?: string
}

interface Booking {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  pickup_postcode: string
  delivery_postcode: string
  distance_miles: number
  vehicle_id: string | null
  total_cost: number
  co2_produced_kg: number
  status: string
  created_at: string
}

interface ProofOfDelivery {
  id: string
  booking_id: string
  signed_by: string
  signature_image_url: string | null
  delivered_at: string
  notes: string | null
  created_at?: string
}

interface Enquiry {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  created_at: string
}

export default function OwnerDashboard() {
  // Navigation & View States
  const [activeTab, setActiveTab] = useState<'bookings' | 'vehicles' | 'pods' | 'enquiries'>('bookings')

  // Core Data Lists
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [pods, setPods] = useState<ProofOfDelivery[]>([])
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])

  // Global Loading & Alert States
  const [loading, setLoading] = useState<boolean>(true)
  const [actionLoading, setActionLoading] = useState<boolean>(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // VEHICLE FORM STATE
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null)
  const [vName, setVName] = useState<string>('')
  const [vMaxPayload, setVMaxPayload] = useState<number>(1000)
  const [vBaseRate, setVBaseRate] = useState<number>(45)
  const [vRatePerMile, setVRatePerMile] = useState<number>(1.55)
  const [vCo2PerMile, setVCo2PerMile] = useState<number>(240)
  const [vIsActive, setVIsActive] = useState<boolean>(true)
  const [showVehicleForm, setShowVehicleForm] = useState<boolean>(false)

  // BOOKING FORM STATE
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null)
  const [bStatus, setBStatus] = useState<string>('pending')
  const [bCustomerName, setBCustomerName] = useState<string>('')
  const [bCustomerEmail, setBCustomerEmail] = useState<string>('')
  const [bCustomerPhone, setBCustomerPhone] = useState<string>('')
  const [bPickup, setBPickup] = useState<string>('')
  const [bDelivery, setBDelivery] = useState<string>('')
  const [bDistance, setBDistance] = useState<number>(100)
  const [bVehicleId, setBVehicleId] = useState<string>('')
  const [bTotalCost, setBTotalCost] = useState<number>(200)
  const [bCo2, setBCo2] = useState<number>(50)
  const [showBookingForm, setShowBookingForm] = useState<boolean>(false)

  // POD FORM STATE
  const [editingPodId, setEditingPodId] = useState<string | null>(null)
  const [podBookingId, setPodBookingId] = useState<string>('')
  const [podSignedBy, setPodSignedBy] = useState<string>('')
  const [podSignatureUrl, setPodSignatureUrl] = useState<string>('')
  const [podNotes, setPodNotes] = useState<string>('')
  const [podDeliveredAt, setPodDeliveredAt] = useState<string>('2024-10-24T14:15:32')
  const [showPodForm, setShowPodForm] = useState<boolean>(false)

  // ENQUIRY VIEW MODAL
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)

  // Initial Fetch
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const triggerAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message })
    setTimeout(() => {
      setAlert(null)
    }, 5000)
  }

  async function fetchDashboardData() {
    setLoading(true)
    try {
      // 1. Fetch Vehicles
      const { data: vData, error: vError } = await supabase
        .from('vehicles')
        .select('*')
        .order('name', { ascending: true })
      if (vError) throw vError
      setVehicles(vData || [])

      // 2. Fetch Bookings
      const { data: bData, error: bError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
      if (bError) throw bError
      setBookings(bData || [])

      // 3. Fetch PoDs
      const { data: podData, error: podError } = await supabase
        .from('proof_of_deliveries')
        .select('*')
        .order('delivered_at', { ascending: false })
      if (podError) throw podError
      setPods(podData || [])

      // 4. Fetch Enquiries
      const { data: eData, error: eError } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false })
      if (eError) throw eError
      setEnquiries(eData || [])

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err)
      triggerAlert('error', `Failed to load dashboard: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // --- VEHICLE ACTIONS ---
  const handleOpenNewVehicle = () => {
    setEditingVehicleId(null)
    setVName('')
    setVMaxPayload(1200)
    setVBaseRate(45)
    setVRatePerMile(1.35)
    setVCo2PerMile(240)
    setVIsActive(true)
    setShowVehicleForm(true)
  }

  const handleOpenEditVehicle = (v: Vehicle) => {
    setEditingVehicleId(v.id)
    setVName(v.name)
    setVMaxPayload(v.max_payload_kg)
    setVBaseRate(Number(v.base_rate))
    setVRatePerMile(Number(v.rate_per_mile))
    setVCo2PerMile(Number(v.co2_per_mile_g))
    setVIsActive(v.is_active)
    setShowVehicleForm(true)
  }

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vName.trim()) {
      triggerAlert('error', 'Vehicle name is required')
      return
    }
    setActionLoading(true)
    try {
      const payload = {
        name: vName,
        max_payload_kg: Number(vMaxPayload),
        base_rate: Number(vBaseRate),
        rate_per_mile: Number(vRatePerMile),
        co2_per_mile_g: Number(vCo2PerMile),
        is_active: vIsActive,
      }

      if (editingVehicleId) {
        // Update
        const { error } = await supabase
          .from('vehicles')
          .update(payload)
          .eq('id', editingVehicleId)
        if (error) throw error
        triggerAlert('success', `Vehicle "${vName}" updated successfully.`)
      } else {
        // Insert
        const { error } = await supabase
          .from('vehicles')
          .insert([payload])
        if (error) throw error
        triggerAlert('success', `Vehicle "${vName}" created successfully.`)
      }

      setShowVehicleForm(false)
      fetchDashboardData()
    } catch (err: any) {
      triggerAlert('error', err.message || 'Error saving vehicle')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteVehicle = async (id: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to delete the vehicle "${name}"?`)) return
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id)
      if (error) throw error
      triggerAlert('success', `Vehicle "${name}" deleted successfully.`)
      fetchDashboardData()
    } catch (err: any) {
      triggerAlert('error', err.message || 'Error deleting vehicle')
    } finally {
      setActionLoading(false)
    }
  }


  // --- BOOKING ACTIONS ---
  const handleOpenNewBooking = () => {
    setEditingBookingId(null)
    setBCustomerName('')
    setBCustomerEmail('')
    setBCustomerPhone('')
    setBPickup('')
    setBDelivery('')
    setBDistance(151)
    setBVehicleId(vehicles[0]?.id || '')
    setBTotalCost(279.36)
    setBCo2(42.3)
    setBStatus('pending')
    setShowBookingForm(true)
  }

  const handleOpenEditBooking = (b: Booking) => {
    setEditingBookingId(b.id)
    setBCustomerName(b.customer_name)
    setBCustomerEmail(b.customer_email)
    setBCustomerPhone(b.customer_phone || '')
    setBPickup(b.pickup_postcode)
    setBDelivery(b.delivery_postcode)
    setBDistance(Number(b.distance_miles))
    setBVehicleId(b.vehicle_id || '')
    setBTotalCost(Number(b.total_cost))
    setBCo2(Number(b.co2_produced_kg))
    setBStatus(b.status)
    setShowBookingForm(true)
  }

  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bCustomerName || !bCustomerEmail || !bPickup || !bDelivery) {
      triggerAlert('error', 'Please fill in all required booking fields.')
      return
    }
    setActionLoading(true)
    try {
      const payload = {
        customer_name: bCustomerName,
        customer_email: bCustomerEmail,
        customer_phone: bCustomerPhone || null,
        pickup_postcode: bPickup,
        delivery_postcode: bDelivery,
        distance_miles: Number(bDistance),
        vehicle_id: bVehicleId || null,
        total_cost: Number(bTotalCost),
        co2_produced_kg: Number(bCo2),
        status: bStatus,
      }

      if (editingBookingId) {
        const { error } = await supabase
          .from('bookings')
          .update(payload)
          .eq('id', editingBookingId)
        if (error) throw error
        triggerAlert('success', `Booking for ${bCustomerName} updated successfully.`)
      } else {
        const { error } = await supabase
          .from('bookings')
          .insert([payload])
        if (error) throw error
        triggerAlert('success', `Booking for ${bCustomerName} created successfully.`)
      }

      setShowBookingForm(false)
      fetchDashboardData()
    } catch (err: any) {
      triggerAlert('error', err.message || 'Error saving booking')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateBookingStatus = async (id: string, newStatus: string) => {
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', id)
      if (error) throw error
      triggerAlert('success', `Booking status updated to "${newStatus}".`)

      // If status is changed to delivered, offer to initialize a PoD
      if (newStatus === 'delivered') {
        const alreadyHasPod = pods.some(p => p.booking_id === id)
        if (!alreadyHasPod) {
          handleOpenNewPodForBooking(id)
        }
      }

      fetchDashboardData()
    } catch (err: any) {
      triggerAlert('error', err.message || 'Error updating status')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteBooking = async (id: string, clientName: string) => {
    if (!confirm(`Are you sure you want to delete the booking for "${clientName}"? This will also delete any related Proof of Delivery.`)) return
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id)
      if (error) throw error
      triggerAlert('success', `Booking for "${clientName}" has been deleted.`)
      fetchDashboardData()
    } catch (err: any) {
      triggerAlert('error', err.message || 'Error deleting booking')
    } finally {
      setActionLoading(false)
    }
  }


  // --- PROOF OF DELIVERY ACTIONS ---
  const handleOpenNewPodForBooking = (bookingId: string) => {
    setEditingPodId(null)
    setPodBookingId(bookingId)
    setPodSignedBy('')
    setPodSignatureUrl('https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&q=80&w=300')
    setPodNotes('Delivered directly to warehouse reception. Goods checked and verified intact.')
    setPodDeliveredAt('2024-10-24T13:12:44')
    setShowPodForm(true)
    setActiveTab('pods')
  }

  const handleOpenNewPodGeneric = () => {
    setEditingPodId(null)
    setPodBookingId(bookings[0]?.id || '')
    setPodSignedBy('')
    setPodSignatureUrl('https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&q=80&w=300')
    setPodNotes('')
    setPodDeliveredAt('2024-10-24T13:12:44')
    setShowPodForm(true)
  }

  const handleOpenEditPod = (p: ProofOfDelivery) => {
    setEditingPodId(p.id)
    setPodBookingId(p.booking_id)
    setPodSignedBy(p.signed_by)
    setPodSignatureUrl(p.signature_image_url || '')
    setPodNotes(p.notes || '')
    setPodDeliveredAt(p.delivered_at ? p.delivered_at.slice(0, 19) : '2024-10-24T13:12:44')
    setShowPodForm(true)
  }

  const handleSavePod = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!podBookingId || !podSignedBy) {
      triggerAlert('error', 'Booking ID and Signed By name are required.')
      return
    }
    setActionLoading(true)
    try {
      const payload = {
        booking_id: podBookingId,
        signed_by: podSignedBy,
        signature_image_url: podSignatureUrl || null,
        delivered_at: new Date(podDeliveredAt).toISOString(),
        notes: podNotes || null
      }

      if (editingPodId) {
        const { error } = await supabase
          .from('proof_of_deliveries')
          .update(payload)
          .eq('id', editingPodId)
        if (error) throw error
        triggerAlert('success', 'Proof of Delivery updated successfully.')
      } else {
        const { error } = await supabase
          .from('proof_of_deliveries')
          .insert([payload])
        if (error) throw error
        triggerAlert('success', 'Proof of Delivery finalized and logged.')

        // Also update the linked booking status to 'delivered' automatically
        await supabase
          .from('bookings')
          .update({ status: 'delivered' })
          .eq('id', podBookingId)
      }

      setShowPodForm(false)
      fetchDashboardData()
    } catch (err: any) {
      triggerAlert('error', err.message || 'Error saving Proof of Delivery')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeletePod = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Proof of Delivery record?')) return
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('proof_of_deliveries')
        .delete()
        .eq('id', id)
      if (error) throw error
      triggerAlert('success', 'Proof of Delivery deleted.')
      fetchDashboardData()
    } catch (err: any) {
      triggerAlert('error', err.message || 'Error deleting PoD')
    } finally {
      setActionLoading(false)
    }
  }


  // --- ENQUIRY ACTIONS ---
  const handleDeleteEnquiry = async (id: string, sender: string) => {
    if (!confirm(`Delete enquiry from "${sender}"?`)) return
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('enquiries')
        .delete()
        .eq('id', id)
      if (error) throw error
      triggerAlert('success', 'Enquiry deleted successfully.')
      if (selectedEnquiry?.id === id) setSelectedEnquiry(null)
      fetchDashboardData()
    } catch (err: any) {
      triggerAlert('error', err.message || 'Error deleting enquiry')
    } finally {
      setActionLoading(false)
    }
  }

  // Statistics Calculations
  const stats = React.useMemo(() => {
    const totalBookings = bookings.length
    const activeVehiclesCount = vehicles.filter(v => v.is_active).length
    const totalRevenue = bookings.reduce((acc, b) => acc + Number(b.total_cost || 0), 0)
    const totalCo2Saved = bookings.reduce((acc, b) => acc + (Number(b.co2_produced_kg || 0) * 0.22), 0) // Estimating 22% average saving
    const unresolvedEnquiriesCount = enquiries.length

    return {
      totalBookings,
      activeVehiclesCount,
      totalRevenue,
      totalCo2Saved,
      unresolvedEnquiriesCount
    }
  }, [bookings, vehicles, enquiries])

  // Filtered lists based on query
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.pickup_postcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.delivery_postcode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.customer_email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredVehicles = vehicles.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPods = pods.filter(p => {
    const matchingBooking = bookings.find(b => b.id === p.booking_id)
    const clientName = matchingBooking?.customer_name || ''
    return p.signed_by.toLowerCase().includes(searchQuery.toLowerCase()) ||
           clientName.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const filteredEnquiries = enquiries.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.message.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#121212] text-[#F8F9FA] font-sans antialiased selection:bg-[#FFD166] selection:text-[#121212]">
      
      {/* HEADER BAR */}
      <header className="border-b border-zinc-800 bg-[#1E1E1E] sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#1B4332] text-[#FFD166] px-3 py-1.5 rounded font-black tracking-wider text-sm border border-[#FFD166]/20">
              LOGITECH TRANSPORT
            </div>
            <span className="text-zinc-500 font-mono">//</span>
            <h1 className="text-lg font-bold text-white tracking-tight">Admin & Owner Control Center</h1>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="text-xs text-zinc-400 hover:text-[#FFD166] transition-colors border border-zinc-800 hover:border-[#FFD166]/30 px-3 py-1.5 rounded bg-zinc-900"
            >
              ← Back to Main Website
            </Link>
            <button
              onClick={() => fetchDashboardData()}
              className="bg-[#1B4332] text-white hover:bg-[#245c45] text-xs font-semibold px-4 py-1.5 rounded transition-colors flex items-center gap-2 border border-emerald-800"
            >
              {loading ? (
                <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
              ) : '🔄'} Refresh Data
            </button>
          </div>
        </div>
      </header>

      {/* STATS OVERVIEW */}
      <section className="bg-gradient-to-b from-[#1E1E1E] to-[#121212] border-b border-zinc-800 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {alert && (
            <div className={`mb-6 p-4 rounded-lg flex items-center justify-between border ${
              alert.type === 'success' 
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200' 
                : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{alert.type === 'success' ? '✓' : '⚠️'}</span>
                <p className="text-sm font-medium">{alert.message}</p>
              </div>
              <button onClick={() => setAlert(null)} className="text-xs opacity-60 hover:opacity-100">Dismiss</button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Stat 1 */}
            <div className="bg-[#1E1E1E] p-5 rounded-lg border border-zinc-800 relative overflow-hidden group hover:border-[#1B4332] transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#1B4332]/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
              <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">Total Shipments</p>
              <p className="text-3xl font-black text-white mt-2 font-mono">
                {stats.totalBookings}
              </p>
              <div className="mt-2 text-[11px] text-zinc-500">All registered system runs</div>
            </div>

            {/* Stat 2 */}
            <div className="bg-[#1E1E1E] p-5 rounded-lg border border-zinc-800 relative overflow-hidden group hover:border-[#1B4332] transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFD166]/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
              <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">Total Logistics Revenue</p>
              <p className="text-3xl font-black text-[#FFD166] mt-2 font-mono">
                £{stats.totalRevenue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="mt-2 text-[11px] text-zinc-500">Excluding VAT</div>
            </div>

            {/* Stat 3 */}
            <div className="bg-[#1E1E1E] p-5 rounded-lg border border-zinc-800 relative overflow-hidden group hover:border-[#1B4332] transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
              <p className="text-xs text-emerald-400 font-mono uppercase tracking-wider">Estimated CO2 Saved</p>
              <p className="text-3xl font-black text-emerald-400 mt-2 font-mono">
                {stats.totalCo2Saved.toFixed(1)} kg
              </p>
              <div className="mt-2 text-[11px] text-emerald-500/70 font-semibold">✓ 22% green efficiency gain</div>
            </div>

            {/* Stat 4 */}
            <div className="bg-[#1E1E1E] p-5 rounded-lg border border-zinc-800 relative overflow-hidden group hover:border-[#1B4332] transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
              <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">Active Fleet Vehicles</p>
              <p className="text-3xl font-black text-white mt-2 font-mono">
                {stats.activeVehiclesCount} <span className="text-xs text-zinc-500 font-normal">/ {vehicles.length}</span>
              </p>
              <div className="mt-2 text-[11px] text-zinc-500">Deployable for same-day</div>
            </div>

            {/* Stat 5 */}
            <div className="bg-[#1E1E1E] p-5 rounded-lg border border-zinc-800 relative overflow-hidden group hover:border-[#1B4332] transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
              <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">Inbound Enquiries</p>
              <p className="text-3xl font-black text-white mt-2 font-mono">
                {stats.unresolvedEnquiriesCount}
              </p>
              <div className="mt-2 text-[11px] text-zinc-500">Awaiting dispatch reply</div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* TABS & SEARCH CONTROLS */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8 bg-[#1E1E1E] p-3 rounded-lg border border-zinc-800">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setActiveTab('bookings'); setSearchQuery(''); }}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                activeTab === 'bookings'
                  ? 'bg-[#FFD166] text-[#121212]'
                  : 'bg-[#121212] text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              📦 Active Shipments ({bookings.length})
            </button>

            <button
              onClick={() => { setActiveTab('vehicles'); setSearchQuery(''); }}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                activeTab === 'vehicles'
                  ? 'bg-[#FFD166] text-[#121212]'
                  : 'bg-[#121212] text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              🚛 Manage Fleet ({vehicles.length})
            </button>

            <button
              onClick={() => { setActiveTab('pods'); setSearchQuery(''); }}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                activeTab === 'pods'
                  ? 'bg-[#FFD166] text-[#121212]'
                  : 'bg-[#121212] text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              ✍️ Proof of Deliveries ({pods.length})
            </button>

            <button
              onClick={() => { setActiveTab('enquiries'); setSearchQuery(''); }}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                activeTab === 'enquiries'
                  ? 'bg-[#FFD166] text-[#121212]'
                  : 'bg-[#121212] text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              ✉️ Enquiries ({enquiries.length})
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {activeTab === 'bookings' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto bg-[#121212] border border-zinc-800 text-zinc-300 text-xs px-3 py-2 rounded focus:outline-none focus:border-[#FFD166]"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in transit">In Transit</option>
                <option value="delivered">Delivered</option>
              </select>
            )}

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121212] border border-zinc-800 text-white placeholder-zinc-500 text-xs px-3 py-2 rounded focus:outline-none focus:border-[#FFD166]"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* LOADING INDICATOR */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin inline-block w-10 h-10 border-4 border-[#FFD166] border-t-transparent rounded-full mb-4" />
            <p className="text-zinc-400 text-sm font-mono">Querying Logitech Transport secure database...</p>
          </div>
        ) : (
          <>
            {/* ----------------- TAB: BOOKINGS ----------------- */}
            {activeTab === 'bookings' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Active Shipments Queue</h2>
                    <p className="text-xs text-zinc-400 mt-1">Real-time operational database. Live dispatch monitoring, state overrides, and PoD linking.</p>
                  </div>
                  <button
                    onClick={handleOpenNewBooking}
                    className="bg-[#FFD166] hover:bg-[#F4D35E] text-[#121212] px-4 py-2 rounded text-xs font-bold tracking-wider uppercase transition-colors"
                  >
                    + Add New Booking
                  </button>
                </div>

                {/* Booking Form (Conditional inline editor or modal) */}
                {showBookingForm && (
                  <div className="mb-8 bg-[#1E1E1E] p-6 rounded-lg border border-[#FFD166]/30">
                    <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-3">
                      <h3 className="text-sm font-bold text-[#FFD166] uppercase tracking-wider">
                        {editingBookingId ? '📝 Edit Booking Record' : '✨ Create Manual Same-Day Booking'}
                      </h3>
                      <button 
                        onClick={() => setShowBookingForm(false)}
                        className="text-zinc-400 hover:text-white text-xs"
                      >
                        Cancel ✕
                      </button>
                    </div>

                    <form onSubmit={handleSaveBooking} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-zinc-400 uppercase font-bold mb-1">Customer Name *</label>
                          <input
                            type="text"
                            required
                            value={bCustomerName}
                            onChange={(e) => setBCustomerName(e.target.value)}
                            placeholder="Welsh Precision Components"
                            className="w-full bg-[#121212] border border-zinc-800 text-white text-xs px-3 py-2 rounded focus:border-[#FFD166] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 uppercase font-bold mb-1">Customer Email *</label>
                          <input
                            type="email"
                            required
                            value={bCustomerEmail}
                            onChange={(e) => setBCustomerEmail(e.target.value)}
                            placeholder="dispatch@welshprecision.co.uk"
                            className="w-full bg-[#121212] border border-zinc-800 text-white text-xs px-3 py-2 rounded focus:border-[#FFD166] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 uppercase font-bold mb-1">Customer Phone</label>
                          <input
                            type="text"
                            value={bCustomerPhone}
                            onChange={(e) => setBCustomerPhone(e.target.value)}
                            placeholder="+44 7700 900123"
                            className="w-full bg-[#121212] border border-zinc-800 text-white text-xs px-3 py-2 rounded focus:border-[#FFD166] outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs text-zinc-400 uppercase font-bold mb-1">Pickup Postcode *</label>
                          <input
                            type="text"
                            required
                            value={bPickup}
                            onChange={(e) => setBPickup(e.target.value)}
                            placeholder="CF24 5SD"
                            className="w-full bg-[#121212] border border-zinc-800 text-white text-xs px-3 py-2 rounded focus:border-[#FFD166] outline-none text-transform: uppercase"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 uppercase font-bold mb-1">Delivery Postcode *</label>
                          <input
                            type="text"
                            required
                            value={bDelivery}
                            onChange={(e) => setBDelivery(e.target.value)}
                            placeholder="EC1A 1BB"
                            className="w-full bg-[#121212] border border-zinc-800 text-white text-xs px-3 py-2 rounded focus:border-[#FFD166] outline-none text-transform: uppercase"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 uppercase font-bold mb-1">Distance (Miles) *</label>
                          <input
                            type="number"
                            step="0.1"
                            required
                            value={bDistance}
                            onChange={(e) => setBDistance(Number(e.target.value))}
                            className="w-full bg-[#121212] border border-zinc-800 text-white text-xs px-3 py-2 rounded focus:border-[#FFD166] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 uppercase font-bold mb-1">Status</label>
                          <select
                            value={bStatus}
                            onChange={(e) => setBStatus(e.target.value)}
                            className="w-full bg-[#121212] border border-zinc-800 text-white text-xs px-3 py-2 rounded focus:border-[#FFD166] outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in transit">In Transit</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs text-zinc-400 uppercase font-bold mb-1">Assigned Vehicle</label>
                          <select
                            value={bVehicleId}
                            onChange={(e) => setBVehicleId(e.target.value)}
                            className="w-full bg-[#121212] border border-zinc-800 text-white text-xs px-3 py-2 rounded focus:border-[#FFD166] outline-none"
                          >
                            <option value="">Select a Vehicle...</option>
                            {vehicles.map(v => (
                              <option key={v.id} value={v.id}>{v.name} (Max: {v.max_payload_kg}kg)</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 uppercase font-bold mb-1">Total Cost (£) *</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={bTotalCost}
                            onChange={(e) => setBTotalCost(Number(e.target.value))}
                            className="w-full bg-[#121212] border border-zinc-800 text-white text-xs px-3 py-2 rounded focus:border-[#FFD166] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 uppercase font-bold mb-1">CO2 Produced (kg) *</label>
                          <input
                            type="number"
                            step="0.1"
                            required
                            value={bCo2}
                            onChange={(e) => setBCo2(Number(e.target.value))}
                            className="w-full bg-[#121212] border border-zinc-800 text-white text-xs px-3 py-2 rounded focus:border-[#FFD166] outline-none"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="submit"
                            disabled={actionLoading}
                            className="w-full bg-[#FFD166] hover:bg-[#F4D35E] disabled:bg-zinc-700 text-[#121212] font-bold text-xs py-2 rounded uppercase transition-colors"
                          >
                            {actionLoading ? 'Saving...' : 'Save Booking'}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* Table */}
                <div className="bg-[#1E1E1E] rounded-lg border border-zinc-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#1B4332] text-white border-b border-zinc-800 text-xs uppercase tracking-wider font-mono">
                          <th className="p-4">Customer / ID</th>
                          <th className="p-4">Route</th>
                          <th className="p-4">Assigned Vehicle</th>
                          <th className="p-4">Carbon Impact</th>
                          <th className="p-4">Cost (Ex VAT)</th>
                          <th className="p-4">Status Log</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800 text-xs">
                        {filteredBookings.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-zinc-500">
                              No shipments match your criteria. Try adjusting filters or search term.
                            </td>
                          </tr>
                        ) : (
                          filteredBookings.map((b) => {
                            const assignedVehicleObj = vehicles.find(v => v.id === b.vehicle_id)
                            const hasPod = pods.some(p => p.booking_id === b.id)

                            return (
                              <tr key={b.id} className="hover:bg-zinc-800/50 transition-colors">
                                <td className="p-4">
                                  <div className="font-bold text-white text-sm">{b.customer_name}</div>
                                  <div className="text-zinc-400 font-mono text-[10px] mt-1">{b.customer_email}</div>
                                  <div className="text-zinc-500 font-mono text-[9px]">{b.id}</div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <span className="bg-zinc-900 text-zinc-300 font-bold px-2 py-0.5 rounded border border-zinc-700">{b.pickup_postcode}</span>
                                    <span className="text-zinc-500">→</span>
                                    <span className="bg-zinc-900 text-[#FFD166] font-bold px-2 py-0.5 rounded border border-[#FFD166]/20">{b.delivery_postcode}</span>
                                  </div>
                                  <div className="text-zinc-400 mt-1.5 font-mono text-[11px]">{Number(b.distance_miles).toFixed(1)} miles</div>
                                </td>
                                <td className="p-4">
                                  {assignedVehicleObj ? (
                                    <div>
                                      <div className="font-semibold text-white">{assignedVehicleObj.name}</div>
                                      <div className="text-zinc-500 text-[10px] mt-0.5">Payload: {assignedVehicleObj.max_payload_kg} kg</div>
                                    </div>
                                  ) : (
                                    <span className="text-zinc-500 italic">No vehicle assigned</span>
                                  )}
                                </td>
                                <td className="p-4">
                                  <div className="font-mono text-emerald-400 font-bold">{Number(b.co2_produced_kg).toFixed(1)} kg CO2</div>
                                  <div className="text-[10px] text-zinc-500 mt-0.5">
                                    ~{(Number(b.co2_produced_kg) * 0.22).toFixed(1)} kg carbon saved
                                  </div>
                                </td>
                                <td className="p-4 font-mono font-bold text-white text-sm">
                                  £{Number(b.total_cost).toFixed(2)}
                                </td>
                                <td className="p-4">
                                  <div className="flex flex-col gap-1.5">
                                    <select
                                      value={b.status}
                                      onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                                      className={`text-[10px] font-bold uppercase tracking-wider rounded px-2 py-1 bg-zinc-900 border focus:outline-none ${
                                        b.status === 'delivered'
                                          ? 'text-emerald-400 border-emerald-500/50'
                                          : b.status === 'in transit'
                                          ? 'text-blue-400 border-blue-500/50'
                                          : b.status === 'confirmed'
                                          ? 'text-[#FFD166] border-[#FFD166]/50'
                                          : 'text-zinc-400 border-zinc-700'
                                      }`}
                                    >
                                      <option value="pending">○ Pending</option>
                                      <option value="confirmed">● Confirmed</option>
                                      <option value="in transit">⚡ In Transit</option>
                                      <option value="delivered">✓ Delivered</option>
                                    </select>
                                    
                                    {b.status === 'delivered' && (
                                      hasPod ? (
                                        <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                                          ✓ Signed PoD Logged
                                        </span>
                                      ) : (
                                        <button
                                          onClick={() => handleOpenNewPodForBooking(b.id)}
                                          className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                                        >
                                          ⚠️ Missing PoD - Add Now
                                        </button>
                                      )
                                    )}
                                  </div>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleOpenEditBooking(b)}
                                      className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-zinc-500 px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-colors"
                                      title="Edit Booking details"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteBooking(b.id, b.customer_name)}
                                      className="bg-zinc-900 hover:bg-rose-950 text-rose-400 border border-rose-900 hover:border-rose-700 px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-colors"
                                      title="Delete"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- TAB: VEHICLES ----------------- */}
            {activeTab === 'vehicles' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Logitech Green Fleet Registry</h2>
                    <p className="text-xs text-zinc-400 mt-1">Configure active vehicle classes, update dynamic carbon metrics, and set base dispatch rates.</p>
                  </div>
                  <button
                    onClick={handleOpenNewVehicle}
                    className="bg-[#FFD166] hover:bg-[#F4D35E] text-[#121212] px-4 py-2 rounded text-xs font-bold tracking-wider uppercase transition-colors"
                  >
                    + Add Fleet Vehicle
                  </button>
                </div>

                {/* Vehicle Form */}
                {showVehicleForm && (
                  <div className="mb-8 bg-[#1E1E1E] p-6 rounded-lg border border-[#FFD166]/30">
                    <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-3">
                      <h3 className="text-sm font-bold text-[#FFD166] uppercase tracking-wider">
                        {editingVehicleId ? `📝 Edit Vehicle: ${vName}` : '✨ Provision New Fleet Vehicle Class'}
                      </h3>
                      <button 
                        onClick={() => setShowVehicleForm(false)}
                        className="text-zinc-400 hover:text-white text-xs"
                      >
                        Cancel ✕
                      </button>
                    </div>

                    <form onSubmit={handleSaveVehicle} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-zinc-400 uppercase font-bold mb-1">Vehicle Name / Class *</label>
                          <input
                            type="text"
                            required
                            value={vName}
                            onChange={(e) => setVName(e.target.value)}
                            placeholder="e.g. 7.5 Tonne Lorry"
                            className="w-full bg-[#121212] border border-zinc-800 text-white text-xs px-3 py-2 rounded focus:border-[#FFD166] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 uppercase font-bold mb-1">Max Payload Capacity (kg) *</label>
                          <input
                            type="number"
                            required
                            value={vMaxPayload}
                            onChange={(e) => setVMaxPayload(Number(e.target.value))}
                            placeholder="e.g. 3000"
                            className="w-full bg-[#121212] border border-zinc-800 text-white text-xs px-3 py-2 rounded focus:border-[#FFD166] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 uppercase font-bold mb-1">Base Booking Fee (£) *</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={vBaseRate}
                            onChange={(e) => setVBaseRate(Number(e.target.value))}
                            placeholder="e.g. 75.00"
                            className="w-full bg-[#121212] border border-zinc-800 text-white text-xs px-3 py-2 rounded focus:border-[#FFD166] outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs text-zinc-400 uppercase font-bold mb-1">Rate Per Mile (£) *</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={vRatePerMile}
                            onChange={(e) => setVRatePerMile(Number(e.target.value))}
                            placeholder="e.g. 1.95"
                            className="w-full bg-[#121212] border border-zinc-800 text-white text-xs px-3 py-2 rounded focus:border-[#FFD166] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 uppercase font-bold mb-1">CO2 Output (grams / mile) *</label>
                          <input
                            type="number"
                            step="0.1"
                            required
                            value={vCo2PerMile}
                            onChange={(e) => setVCo2PerMile(Number(e.target.value))}
                            placeholder="e.g. 450"
                            className="w-full bg-[#121212] border border-zinc-800 text-white text-xs px-3 py-2 rounded focus:border-[#FFD166] outline-none"
                          />
                        </div>
                        <div className="flex items-center pt-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={vIsActive}
                              onChange={(e) => setVIsActive(e.target.checked)}
                              className="accent-[#FFD166] h-4 w-4 rounded bg-[#121212] border-zinc-800"
                            />
                            <span className="text-xs text-zinc-300 select-none uppercase font-bold">Active in dispatch grid</span>
                          </label>
                        </div>
                        <div className="flex items-end">
                          <button
                            type="submit"
                            disabled={actionLoading}
                            className="w-full bg-[#FFD166] hover:bg-[#F4D35E] disabled:bg-zinc-700 text-[#121212] font-bold text-xs py-2 rounded uppercase transition-colors"
                          >
                            {actionLoading ? 'Saving...' : 'Save Vehicle'}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* Table */}
                <div className="bg-[#1E1E1E] rounded-lg border border-zinc-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#1B4332] text-white border-b border-zinc-800 text-xs uppercase tracking-wider font-mono">
                          <th className="p-4">Vehicle Class</th>
                          <th className="p-4">Max Payload (kg)</th>
                          <th className="p-4">Base Booking Fee</th>
                          <th className="p-4">Per-Mile Rate</th>
                          <th className="p-4">CO2 Output (g/mile)</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800 text-xs">
                        {filteredVehicles.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-zinc-500">
                              No vehicles registered.
                            </td>
                          </tr>
                        ) : (
                          filteredVehicles.map((v) => (
                            <tr key={v.id} className="hover:bg-zinc-800/50 transition-colors">
                              <td className="p-4 font-bold text-white text-sm">
                                {v.name}
                              </td>
                              <td className="p-4 font-mono text-zinc-300">
                                {v.max_payload_kg.toLocaleString()} kg
                              </td>
                              <td className="p-4 font-mono text-zinc-300">
                                £{Number(v.base_rate).toFixed(2)}
                              </td>
                              <td className="p-4 font-mono text-zinc-300">
                                £{Number(v.rate_per_mile).toFixed(2)} / mi
                              </td>
                              <td className="p-4 font-mono text-emerald-400 font-bold">
                                {v.co2_per_mile_g}g CO2
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  v.is_active 
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' 
                                    : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                                }`}>
                                  {v.is_active ? 'Active' : 'Deactivated'}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleOpenEditVehicle(v)}
                                    className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-zinc-500 px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteVehicle(v.id, v.name)}
                                    className="bg-zinc-900 hover:bg-rose-950 text-rose-400 border border-rose-900 hover:border-rose-700 px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- TAB: PROOF OF DELIVERIES ----------------- */}
            {activeTab === 'pods' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Proof of Delivery (PoD) Ledger</h2>
                    <p className="text-xs text-zinc-400 mt-1">Upload drivers' digital signatures, log receiver timestamps, and verify delivery receipt documents.</p>
                  </div>
                  <button
                    onClick={handleOpenNewPodGeneric}
                    className="bg-[#FFD166] hover:bg-[#F4D35E] text-[#121212] px-4 py-2 rounded text-xs font-bold tracking-wider uppercase transition-colors"
                  >
                    + Create PoD File
                  </button>
                </div>

                {/* PoD Form */}
                {showPodForm && (
                  <div className="mb-8 bg-[#1E1E1E] p-6 rounded-lg border border-[#FFD166]/30">
                    <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-3">
                      <h3 className="text-sm font-bold text-[#FFD166] uppercase tracking-wider">
                        {editingPodId ? '📝 Edit Proof of Delivery Record' : '✨ Generate New Proof of Delivery File'}
                      </h3>
                      <button 
                        onClick={() => setShowPodForm(false)}
                        className="text-zinc-400 hover:text-white text-xs"
                      >
                        Cancel ✕
                      </button>
                    </div>

                    <form onSubmit={handleSavePod} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-zinc-400 uppercase font-bold mb-1">Linked Booking ID *</label>
                          <select
                            value={podBookingId}
                            onChange={(e) => setPodBookingId(e.target.value)}
                            required
                            className="w-full bg-[#121212] border border-zinc-800 text-white text-xs px-3 py-2 rounded focus:border-[#FFD166] outline-none"
                          >
                            <option value="">Select a Booking to sign off...</option>
                            {bookings.map(b => (
                              <option key={b.id} value={b.id}>
                                {b.customer_name} ({b.pickup_postcode} → {b.delivery_postcode}) - £{Number(b.total_cost).toFixed(2)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 uppercase font-bold mb-1">Received By (Print Name) *</label>
                          <input
                            type="text"
                            required
                            value={podSignedBy}
                            onChange={(e) => setPodSignedBy(e.target.value)}
                            placeholder="e.g. Robert Vance"
                            className="w-full bg-[#121212] border border-zinc-800 text-white text-xs px-3 py-2 rounded focus:border-[#FFD166] outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-zinc-400 uppercase font-bold mb-1">Signature Image URL</label>
                          <input
                            type="text"
                            value={podSignatureUrl}
                            onChange={(e) => setPodSignatureUrl(e.target.value)}
                            placeholder="https://images.unsplash.com/photo-..."
                            className="w-full bg-[#121212] border border-zinc-800 text-white text-xs px-3 py-2 rounded focus:border-[#FFD166] outline-none"
                          />
                          <p className="text-[10px] text-zinc-500 mt-1">Provide a public secure image link or use the default mockup.</p>
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 uppercase font-bold mb-1">Exact Time of Delivery *</label>
                          <input
                            type="datetime-local"
                            required
                            value={podDeliveredAt}
                            onChange={(e) => setPodDeliveredAt(e.target.value)}
                            className="w-full bg-[#121212] border border-zinc-800 text-white text-xs px-3 py-2 rounded focus:border-[#FFD166] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 uppercase font-bold mb-1">Operational / Driver Notes</label>
                          <textarea
                            value={podNotes}
                            onChange={(e) => setPodNotes(e.target.value)}
                            placeholder="Left with reception supervisor. Pallets verified undamaged."
                            rows={2}
                            className="w-full bg-[#121212] border border-zinc-800 text-white text-xs px-3 py-2 rounded focus:border-[#FFD166] outline-none resize-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="bg-[#FFD166] hover:bg-[#F4D35E] disabled:bg-zinc-700 text-[#121212] font-bold text-xs px-6 py-2 rounded uppercase transition-colors"
                        >
                          {actionLoading ? 'Saving...' : 'Finalize PoD & Log Delivery'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Table */}
                <div className="bg-[#1E1E1E] rounded-lg border border-zinc-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#1B4332] text-white border-b border-zinc-800 text-xs uppercase tracking-wider font-mono">
                          <th className="p-4">Booking Ref / Client</th>
                          <th className="p-4">Receiver Name</th>
                          <th className="p-4">Delivered At</th>
                          <th className="p-4">Signature Visual</th>
                          <th className="p-4">Driver Notes</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800 text-xs">
                        {filteredPods.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-zinc-500">
                              No Proof of Delivery records found. Ensure bookings are set to "delivered".
                            </td>
                          </tr>
                        ) : (
                          filteredPods.map((p) => {
                            const linkedBooking = bookings.find(b => b.id === p.booking_id)
                            return (
                              <tr key={p.id} className="hover:bg-zinc-800/50 transition-colors">
                                <td className="p-4">
                                  {linkedBooking ? (
                                    <div>
                                      <div className="font-bold text-white">{linkedBooking.customer_name}</div>
                                      <div className="text-[10px] text-[#FFD166] font-mono mt-0.5">
                                        {linkedBooking.pickup_postcode} → {linkedBooking.delivery_postcode}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-zinc-500 italic">Deleted Booking reference</span>
                                  )}
                                  <div className="text-zinc-500 font-mono text-[9px] mt-1">PoD ID: {p.id}</div>
                                </td>
                                <td className="p-4 font-bold text-white">
                                  {p.signed_by}
                                </td>
                                <td className="p-4 font-mono text-zinc-300">
                                  {new Date(p.delivered_at).toLocaleString('en-GB')}
                                </td>
                                <td className="p-4">
                                  {p.signature_image_url ? (
                                    <div className="border border-zinc-700 rounded bg-white p-1 inline-block">
                                      <img 
                                        src={p.signature_image_url} 
                                        alt="Signature log" 
                                        className="h-10 w-24 object-contain filter contrast-125"
                                      />
                                    </div>
                                  ) : (
                                    <span className="text-zinc-500 italic">No image logged</span>
                                  )}
                                </td>
                                <td className="p-4 text-zinc-300 max-w-xs truncate" title={p.notes || ''}>
                                  {p.notes || <span className="text-zinc-500 italic">None</span>}
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleOpenEditPod(p)}
                                      className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-zinc-500 px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-colors"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeletePod(p.id)}
                                      className="bg-zinc-900 hover:bg-rose-950 text-rose-400 border border-rose-900 hover:border-rose-700 px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ----------------- TAB: ENQUIRIES ----------------- */}
            {activeTab === 'enquiries' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Inbound Customer Enquiries</h2>
                  <p className="text-xs text-zinc-400 mt-1">Manage corporate contract tenders, custom specialized freight requests, and general logistical support questions.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Enquiry List */}
                  <div className="lg:col-span-2 space-y-3">
                    {filteredEnquiries.length === 0 ? (
                      <div className="bg-[#1E1E1E] p-8 text-center rounded-lg border border-zinc-800 text-zinc-500 text-sm">
                        No customer enquiries on file.
                      </div>
                    ) : (
                      filteredEnquiries.map((e) => (
                        <div 
                          key={e.id}
                          onClick={() => setSelectedEnquiry(e)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            selectedEnquiry?.id === e.id
                              ? 'bg-[#1B4332] border-[#FFD166] text-white'
                              : 'bg-[#1E1E1E] border-zinc-800 hover:border-zinc-700 text-zinc-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-[#FFD166] uppercase tracking-wider">
                              {e.subject || 'General Logistics Question'}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500">
                              {new Date(e.created_at).toLocaleDateString('en-GB')}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white">{e.name}</h4>
                          <p className="text-xs text-zinc-400 mt-1">{e.email}</p>
                          <p className="text-xs text-zinc-300 mt-3 line-clamp-2 italic bg-zinc-900/45 p-2 rounded">
                            "{e.message}"
                          </p>
                          <div className="flex justify-end gap-2 mt-3">
                            <button
                              onClick={(event) => {
                                event.stopPropagation()
                                handleDeleteEnquiry(e.id, e.name)
                              }}
                              className="text-[11px] font-bold text-rose-400 hover:text-rose-300 uppercase tracking-wide"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Enquiry Detail Viewer */}
                  <div className="bg-[#1E1E1E] p-6 rounded-lg border border-zinc-800 self-start sticky top-24">
                    {selectedEnquiry ? (
                      <div className="space-y-4">
                        <div className="border-b border-zinc-800 pb-3">
                          <div className="text-[10px] font-mono text-zinc-500 mb-1">Enquiry UUID: {selectedEnquiry.id}</div>
                          <h3 className="text-base font-bold text-white uppercase tracking-tight">{selectedEnquiry.subject || 'No Subject'}</h3>
                        </div>

                        <div>
                          <p className="text-xs text-zinc-400 uppercase font-mono tracking-wider">Sender Details</p>
                          <p className="text-sm font-bold text-white mt-1">{selectedEnquiry.name}</p>
                          <a 
                            href={`mailto:${selectedEnquiry.email}`}
                            className="text-xs text-[#FFD166] hover:underline font-mono mt-0.5 block"
                          >
                            {selectedEnquiry.email}
                          </a>
                        </div>

                        <div>
                          <p className="text-xs text-zinc-400 uppercase font-mono tracking-wider mb-1">Message Content</p>
                          <div className="bg-[#121212] p-4 rounded border border-zinc-800 text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap italic">
                            "{selectedEnquiry.message}"
                          </div>
                        </div>

                        <div className="pt-2">
                          <a
                            href={`mailto:${selectedEnquiry.email}?subject=RE: ${selectedEnquiry.subject || 'Logitech Transport Enquiry'}`}
                            className="block w-full text-center bg-[#FFD166] hover:bg-[#F4D35E] text-[#121212] font-bold text-xs py-2 rounded uppercase tracking-wider transition-colors"
                          >
                            ✉️ Reply via Email Client
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <span className="text-4xl block mb-3">📥</span>
                        <p className="text-xs text-zinc-400 font-medium">Select an enquiry from the list to view full client message and reply direct.</p>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

          </>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-800 bg-[#121212] mt-20 py-8 px-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© Logitech Transport. Cardiff-Born, UK-Wide Same-Day Logistics & Heavy Freight.</p>
          <p className="font-mono text-[10px]">RHA Member: RHA-883921-WA</p>
        </div>
      </footer>

    </div>
  )
}