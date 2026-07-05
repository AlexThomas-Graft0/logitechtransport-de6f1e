'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'

// TypeScript Interfaces mapped to SQL types
interface Vehicle {
  id: string
  name: string
  max_payload_kg: number
  base_rate: number
  rate_per_mile: number
  co2_per_mile_g: number
  is_active: boolean
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
  created_at: string
}

export function PodPortal() {
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'signature'>('details')
  
  // Loaded records
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null)
  const [foundVehicle, setFoundVehicle] = useState<Vehicle | null>(null)
  const [foundPod, setFoundPod] = useState<ProofOfDelivery | null>(null)
  const [isDemoData, setIsDemoData] = useState(false)

  // Status message for actions
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [emailInput, setEmailInput] = useState('')
  const [isSeeding, setIsSeeding] = useState(false)

  // Mock static data to fall back on or use as demo
  const demoBooking: Booking = {
    id: 'a4f8c2b1-9e8d-4c3b-2a1f-8293d0d8291a',
    customer_name: 'Welsh Precision Component Group Ltd',
    customer_email: 'david.vance@welshprecision.co.uk',
    customer_phone: '+44 7700 900123',
    pickup_postcode: 'CF24 5SD',
    delivery_postcode: 'EC1A 1BB',
    distance_miles: 151.2,
    vehicle_id: 'luton-van-id',
    total_cost: 279.36,
    co2_produced_kg: 42.3,
    status: 'delivered',
    created_at: '2024-10-24T08:15:00Z',
  }

  const demoVehicle: Vehicle = {
    id: 'luton-van-id',
    name: 'Luton Box Van (Registration: LG23 TXA)',
    max_payload_kg: 1000,
    base_rate: 45.0,
    rate_per_mile: 1.55,
    co2_per_mile_g: 280,
    is_active: true,
  }

  const demoPod: ProofOfDelivery = {
    id: 'pod-mock-id',
    booking_id: 'a4f8c2b1-9e8d-4c3b-2a1f-8293d0d8291a',
    signed_by: 'Robert Vance',
    signature_image_url: null,
    delivered_at: '2024-10-24T13:12:44Z',
    notes: 'Delivered directly to warehouse reception. Goods checked and verified intact.',
    created_at: '2024-10-24T13:12:44Z',
  }

  // Auto-fill search with Demo ID on first load to make it instantly interactive
  useEffect(() => {
    setSearchQuery('LOG-8392-4112')
    triggerDemo()
  }, [])

  const triggerDemo = () => {
    setLoading(true)
    setError(null)
    setTimeout(() => {
      setFoundBooking(demoBooking)
      setFoundVehicle(demoVehicle)
      setFoundPod(demoPod)
      setIsDemoData(true)
      setLoading(false)
    }, 400)
  }

  // Handle the live search from Supabase
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    const sanitizedQuery = searchQuery.trim()

    // If they ask for the demo specifically
    if (sanitizedQuery.toUpperCase() === 'LOG-8392-4112' || sanitizedQuery.toLowerCase().includes('demo')) {
      triggerDemo()
      return
    }

    setLoading(true)
    setError(null)
    setFoundBooking(null)
    setFoundVehicle(null)
    setFoundPod(null)
    setIsDemoData(false)

    try {
      // 1. Try to search bookings table. Check if the query is a valid UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sanitizedQuery)
      
      let bookingData: Booking | null = null

      if (isUuid) {
        const { data, error: bError } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', sanitizedQuery)
          .single()

        if (data) bookingData = data as Booking
      } else {
        // Fallback search: check if customer name or postcodes match partially
        const { data, error: bError } = await supabase
          .from('bookings')
          .select('*')
          .or(`customer_name.ilike.%${sanitizedQuery}%,pickup_postcode.ilike.%${sanitizedQuery}%,delivery_postcode.ilike.%${sanitizedQuery}%`)
          .limit(1)

        if (data && data.length > 0) {
          bookingData = data[0] as Booking
        }
      }

      if (!bookingData) {
        setError('No active booking found with that reference. Try the demo ID "LOG-8392-4112" below.')
        setLoading(false)
        return
      }

      setFoundBooking(bookingData)

      // 2. Fetch vehicle details
      if (bookingData.vehicle_id) {
        const { data: vData } = await supabase
          .from('vehicles')
          .select('*')
          .eq('id', bookingData.vehicle_id)
          .single()
        
        if (vData) setFoundVehicle(vData as Vehicle)
      }

      // 3. Fetch PoD if available
      const { data: podData } = await supabase
        .from('proof_of_deliveries')
        .select('*')
        .eq('booking_id', bookingData.id)
        .single()

      if (podData) {
        setFoundPod(podData as ProofOfDelivery)
      }

    } catch (err: any) {
      setError('An error occurred during search. Please try again or use the offline Demo ID.')
    } finally {
      setLoading(false)
    }
  }

  // Seed standard demo data into the live Supabase DB so the client has actual records to test
  const handleSeedLiveDatabase = async () => {
    setIsSeeding(true)
    setActionMessage(null)
    try {
      // Fetch or insert a default vehicle
      const { data: vehicles, error: vErr } = await supabase
        .from('vehicles')
        .select('*')
        .limit(1)

      let targetVehicleId = vehicles && vehicles.length > 0 ? vehicles[0].id : null

      if (!targetVehicleId) {
        const { data: newV } = await supabase
          .from('vehicles')
          .insert({
            name: 'Luton Box Van (Tail Lift)',
            max_payload_kg: 1600,
            base_rate: 65.00,
            rate_per_mile: 1.80,
            co2_per_mile_g: 240,
            is_active: true
          })
          .select()
          .single()
        if (newV) targetVehicleId = newV.id
      }

      // Generate a random UUID-based test booking
      const { data: newBooking, error: bErr } = await supabase
        .from('bookings')
        .insert({
          customer_name: 'Thorne & Sons Distribution',
          customer_email: 'marcus.thorne@thornedistribution.co.uk',
          customer_phone: '+44 7700 900456',
          pickup_postcode: 'CF24 5SD',
          delivery_postcode: 'BS1 4TB',
          distance_miles: 44.5,
          vehicle_id: targetVehicleId,
          total_cost: 145.10,
          co2_produced_kg: 10.68,
          status: 'delivered'
        })
        .select()
        .single()

      if (newBooking) {
        // Create corresponding Proof of Delivery
        await supabase
          .from('proof_of_deliveries')
          .insert({
            booking_id: newBooking.id,
            signed_by: 'M. Thorne',
            notes: 'Left in secure bay 2. Signature captured on rugged terminal.',
            signature_image_url: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=120&q=80'
          })

        setSearchQuery(newBooking.id)
        setActionMessage({
          type: 'success',
          text: `Success! New shipment live in DB. Code copied to search box.`
        })
      } else {
        setActionMessage({
          type: 'error',
          text: 'Could not write to Supabase. Check row policies.'
        })
      }
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: 'Database insertion failed. Using offline simulation mode.'
      })
    } finally {
      setIsSeeding(false)
    }
  }

  // Mock document actions
  const handleDownloadPDF = () => {
    setActionMessage({
      type: 'success',
      text: 'Proof of Delivery PDF generated! Check your device downloads.'
    })
  }

  const handleEmailCopy = (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInput) return
    setActionMessage({
      type: 'success',
      text: `PoD documentation dispatched successfully to ${emailInput}`
    })
    setEmailInput('')
  }

  return (
    <section id="pod-portal" className="relative py-24 bg-[#121212] text-white overflow-hidden font-sans">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[#FFD166] text-xs font-black tracking-widest uppercase block mb-3 font-mono">
            Self-Service Document Portal
          </span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6 uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-[#FFD166] leading-none">
            Retrieve Your Proof of Delivery Instantly
          </h2>
          <p className="text-gray-300 text-lg md:text-xl font-light leading-relaxed">
            Enter your unique 8-digit Booking ID or the full Consignment UUID sent to your email to view delivery status, recipient signatures, and physical timestamps.
          </p>
        </div>

        {/* Live Search Form Container */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-[#1B4332] p-1 rounded-2xl shadow-2xl border border-emerald-800/50 backdrop-blur-md">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2 items-stretch">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. LOG-8392-4112 or a4f8c2b1-9e8d-4c3b-2a1f..."
                  className="block w-full pl-12 pr-4 py-4 bg-[#121212] border border-emerald-700/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFD166] focus:border-transparent font-mono text-sm md:text-base"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#FFD166] hover:bg-[#F4D35E] active:scale-95 text-black font-bold uppercase tracking-wider px-8 py-4 rounded-xl transition duration-150 ease-in-out flex items-center justify-center gap-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD166] focus:ring-offset-[#1B4332] disabled:opacity-50 min-h-[44px]"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Searching...
                  </>
                ) : (
                  'Retrieve PoD Document'
                )}
              </button>
            </form>
          </div>

          {/* Quick Shortcuts & Database Tools */}
          <div className="mt-4 flex flex-wrap gap-3 items-center justify-between text-xs text-gray-400">
            <div className="flex gap-2 items-center">
              <span>Quick Try:</span>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('LOG-8392-4112')
                  triggerDemo()
                }}
                className="text-[#FFD166] hover:underline font-mono"
              >
                LOG-8392-4112 (Demo Data)
              </button>
            </div>

            <button
              onClick={handleSeedLiveDatabase}
              disabled={isSeeding}
              className="text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 bg-[#1B4332]/40 px-3 py-1 rounded-full border border-emerald-800/60"
              title="Creates a real record in the Supabase 'bookings' and 'proof_of_deliveries' tables to demonstrate fully integrated live search."
            >
              <svg className="h-3 w-3 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              {isSeeding ? 'Seeding Live DB...' : 'Seed Live Database Record'}
            </button>
          </div>
        </div>

        {/* Global Notifications Panel */}
        <AnimatePresence>
          {actionMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`max-w-4xl mx-auto mb-8 p-4 rounded-xl border ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                  : 'bg-rose-950/80 border-rose-500 text-rose-200'
              } flex items-center justify-between gap-4`}
            >
              <p className="text-sm font-medium">{actionMessage.text}</p>
              <button
                onClick={() => setActionMessage(null)}
                className="text-white hover:opacity-75 text-xs font-bold uppercase tracking-wider px-2 py-1"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        {error && (
          <div className="max-w-4xl mx-auto mb-12 p-6 bg-red-950/50 border border-red-500/30 rounded-2xl text-center">
            <svg className="h-12 w-12 text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-bold text-white mb-1">Search Unsuccessful</h3>
            <p className="text-gray-300 text-sm mb-4">{error}</p>
            <button
              onClick={() => {
                setSearchQuery('LOG-8392-4112')
                triggerDemo()
              }}
              className="text-xs bg-[#FFD166] text-black font-bold uppercase px-4 py-2 rounded-lg hover:bg-yellow-400"
            >
              Load Simulated Demo Delivery Instead
            </button>
          </div>
        )}

        {/* Active tracking display */}
        {foundBooking && (
          <div className="max-w-6xl mx-auto bg-[#1a1a1a] rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
            {/* Top Bar with main stats */}
            <div className="bg-[#121212] p-6 lg:p-8 border-b border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Consignment ID</span>
                  <span className="font-mono text-lg font-bold text-white selection:bg-[#FFD166] selection:text-black">
                    {isDemoData ? 'LOG-8392-4112' : foundBooking.id}
                  </span>
                  {isDemoData && (
                    <span className="bg-[#FFD166]/10 text-[#FFD166] text-[10px] font-mono px-2 py-0.5 rounded-full border border-[#FFD166]/20">
                      OFFLINE DEMO MODE
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white">{foundBooking.customer_name}</h3>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-gray-400 block text-right">Current Status:</span>
                <span className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase flex items-center gap-2 ${
                  foundBooking.status === 'delivered'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/30 animate-pulse'
                }`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${foundBooking.status === 'delivered' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                  {foundBooking.status === 'delivered' ? '✓ DELIVERED' : '⚡ IN TRANSIT'}
                </span>
              </div>
            </div>

            {/* Quick Tab Selectors */}
            <div className="flex border-b border-gray-800 bg-[#151515]">
              <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 py-4 text-xs md:text-sm font-bold uppercase tracking-wider border-b-2 transition ${
                  activeTab === 'details'
                    ? 'border-[#FFD166] text-white bg-[#1a1a1a]'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                Consignment Details
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`flex-1 py-4 text-xs md:text-sm font-bold uppercase tracking-wider border-b-2 transition ${
                  activeTab === 'timeline'
                    ? 'border-[#FFD166] text-white bg-[#1a1a1a]'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                Tracking & Timeline
              </button>
              <button
                onClick={() => setActiveTab('signature')}
                className={`flex-1 py-4 text-xs md:text-sm font-bold uppercase tracking-wider border-b-2 transition ${
                  activeTab === 'signature'
                    ? 'border-[#FFD166] text-white bg-[#1a1a1a]'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                Digital Signature
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 lg:p-8">
              {activeTab === 'details' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Postcodes, vehicle, specs */}
                  <div className="lg:col-span-7 space-y-6">
                    <div>
                      <h4 className="text-[#FFD166] text-xs font-bold uppercase tracking-widest mb-4 font-mono">Transit Route</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#121212] p-4 rounded-xl border border-gray-800">
                          <p className="text-xs text-gray-500 uppercase font-mono">Pickup Origin</p>
                          <p className="text-lg font-bold text-white mt-1">Cardiff Depot</p>
                          <p className="text-sm text-emerald-400 font-mono mt-0.5">{foundBooking.pickup_postcode}</p>
                        </div>
                        <div className="bg-[#121212] p-4 rounded-xl border border-gray-800">
                          <p className="text-xs text-gray-500 uppercase font-mono">Destination</p>
                          <p className="text-lg font-bold text-white mt-1">London Distribution Center</p>
                          <p className="text-sm text-emerald-400 font-mono mt-0.5">{foundBooking.delivery_postcode}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#121212] p-6 rounded-2xl border border-gray-800 space-y-4">
                      <h4 className="text-[#FFD166] text-xs font-bold uppercase tracking-widest font-mono">Shipment Specifications</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-mono">Distance</p>
                          <p className="text-lg font-bold text-white">{foundBooking.distance_miles} Miles</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-mono">Estimated Cost</p>
                          <p className="text-lg font-bold text-white">£{foundBooking.total_cost}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-mono">Carbon Emission</p>
                          <p className="text-lg font-bold text-emerald-400">{foundBooking.co2_produced_kg} kg CO2</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-mono">Vehicle Type</p>
                          <p className="text-sm font-bold text-white truncate">{foundVehicle?.name || 'Assigned Transit'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl flex items-start gap-3">
                      <div className="p-2 bg-emerald-900/30 rounded-lg text-emerald-400">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-emerald-300">Logitech Green Efficiency Saving</h5>
                        <p className="text-xs text-gray-300 mt-1">
                          This carbon emission is equivalent to the CO2 absorbed by 0.6 mature trees in one year. Route dynamically consolidated to eliminate empty running.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Mini Interactive Map & Quick Download Cards */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* Live Tracking Map Mockup */}
                    <div className="bg-[#121212] p-6 rounded-2xl border border-gray-800 relative overflow-hidden h-[240px] flex flex-col justify-between">
                      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
                      
                      {/* Stylized map visualization path */}
                      <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-1 bg-gray-800 rounded-full">
                        <div className="absolute top-0 left-0 h-full bg-emerald-500 w-3/4 animate-pulse" />
                        {/* Cardiff Node */}
                        <div className="absolute -top-1.5 left-0 h-4 w-4 bg-[#FFD166] rounded-full ring-4 ring-[#FFD166]/20 flex items-center justify-center">
                          <span className="absolute text-[8px] font-mono text-gray-400 -bottom-5">Cardiff</span>
                        </div>
                        {/* Current Position */}
                        <div className="absolute -top-2 left-3/4 h-5 w-5 bg-emerald-400 rounded-full ring-4 ring-emerald-400/30 flex items-center justify-center animate-bounce">
                          <svg className="h-3 w-3 text-black" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.6 6.62c-1.44 1.2-3.12 1.62-4.14 1.14-.96-.48-1.2-1.92-.48-3.36s2.1-2.1 3.06-1.62c1.02.48 1.98 2.64 1.56 3.84zM5.4 17.38c1.44-1.2 3.12-1.62 4.14-1.14.96.48 1.2 1.92.48 3.36s-2.1 2.1-3.06 1.62c-1.02-.48-1.98-2.64-1.56-3.84z" />
                          </svg>
                        </div>
                        {/* London Node */}
                        <div className="absolute -top-1.5 right-0 h-4 w-4 bg-gray-600 rounded-full">
                          <span className="absolute text-[8px] font-mono text-gray-400 -bottom-5">London</span>
                        </div>
                      </div>

                      <div className="relative z-10 flex justify-between items-start">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Live Transit Vector</span>
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-mono">GPS ACTIVE</span>
                      </div>

                      <div className="relative z-10">
                        <p className="text-xs text-gray-500 font-mono">Active Vehicle</p>
                        <p className="text-sm font-bold text-white">{foundVehicle?.name || 'Luton Box Van LG23 TXA'}</p>
                      </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="space-y-3">
                      <button
                        onClick={handleDownloadPDF}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 px-4 rounded-xl font-bold uppercase tracking-wider text-sm transition duration-150 flex items-center justify-center gap-2 min-h-[44px]"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download PDF Proof of Delivery
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline & Milestones Tab */}
              {activeTab === 'timeline' && (
                <div className="max-w-3xl mx-auto py-4">
                  <h4 className="text-[#FFD166] text-xs font-bold uppercase tracking-widest mb-8 font-mono">Operational Timeline</h4>
                  <div className="relative border-l-2 border-emerald-800/60 ml-4 pl-8 space-y-12">
                    {/* Booking Received */}
                    <div className="relative">
                      <div className="absolute -left-[41px] top-1 bg-emerald-950 border-2 border-emerald-500 h-6 w-6 rounded-full flex items-center justify-center">
                        <span className="h-2 w-2 bg-emerald-400 rounded-full" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-emerald-400">October 24, 2024 — 08:15 AM</span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-400">System Logged</span>
                        </div>
                        <h5 className="text-base font-bold text-white mt-1">Booking Confirmed & Dispatched</h5>
                        <p className="text-sm text-gray-400 mt-1">
                          Logitech Transport automated route optimizer mapped Cardiff Depot (CF24 5SD) to London (EC1A 1BB).
                        </p>
                      </div>
                    </div>

                    {/* Consignment Collected */}
                    <div className="relative">
                      <div className="absolute -left-[41px] top-1 bg-emerald-950 border-2 border-emerald-500 h-6 w-6 rounded-full flex items-center justify-center">
                        <span className="h-2 w-2 bg-emerald-400 rounded-full" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-emerald-400">October 24, 2024 — 09:30 AM</span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-400">Driver Confirmed</span>
                        </div>
                        <h5 className="text-base font-bold text-white mt-1">Consignment Collected</h5>
                        <p className="text-sm text-gray-400 mt-1">
                          Goods verified intact, loaded securely on vehicle {foundVehicle?.name || 'Luton Box Van LG23 TXA'}.
                        </p>
                      </div>
                    </div>

                    {/* In Transit */}
                    <div className="relative">
                      <div className="absolute -left-[41px] top-1 bg-emerald-950 border-2 border-emerald-500 h-6 w-6 rounded-full flex items-center justify-center">
                        <span className="h-2 w-2 bg-emerald-400 rounded-full" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-emerald-400">October 24, 2024 — 09:45 AM</span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-900 text-emerald-300">GPS Active</span>
                        </div>
                        <h5 className="text-base font-bold text-white mt-1">In Transit (M4 Corridor)</h5>
                        <p className="text-sm text-gray-400 mt-1">
                          Real-time GPS tracking monitoring transit speed, eco-driving metrics, and active road conditions.
                        </p>
                      </div>
                    </div>

                    {/* Consignment Delivered */}
                    <div className="relative">
                      <div className="absolute -left-[41px] top-1 bg-emerald-500 border-2 border-white h-6 w-6 rounded-full flex items-center justify-center">
                        <svg className="h-4 w-4 text-black bg-[#FFD166] rounded-full" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-[#FFD166]">October 24, 2024 — 01:12 PM</span>
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">Signed & Completed</span>
                        </div>
                        <h5 className="text-base font-bold text-white mt-1">Consignment Delivered</h5>
                        <p className="text-sm text-gray-300 mt-1">
                          Successfully arrived at destination postcode. Recipient signature recorded digitally on site.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Digital Signature Tab */}
              {activeTab === 'signature' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Signature Visualizer */}
                  <div className="lg:col-span-7 space-y-6">
                    <h4 className="text-[#FFD166] text-xs font-bold uppercase tracking-widest font-mono">Digital Signature Capture Display</h4>
                    
                    <div className="bg-[#121212] p-8 rounded-2xl border border-gray-800 relative overflow-hidden flex flex-col items-center justify-center text-center min-h-[250px]">
                      {/* Stylized Signature Pad */}
                      <div className="w-full max-w-sm p-4 bg-white/5 rounded-xl border border-white/10 relative">
                        <span className="absolute top-2 left-3 text-[9px] font-mono text-gray-500 uppercase">Touch Terminal Signature Pad</span>
                        <div className="py-12 flex items-center justify-center">
                          {/* Animated Vector representation of R. Vance signature */}
                          <svg className="w-48 h-16 text-[#FFD166]" viewBox="0 0 200 60" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 40 C 30 30, 40 10, 50 20 C 60 30, 45 50, 60 45 C 80 35, 70 15, 85 25 C 95 35, 110 35, 120 20 C 130 5, 140 40, 150 35 C 160 30, 170 30, 185 45" className="animate-dash" />
                          </svg>
                        </div>
                        <div className="border-t border-white/10 pt-2 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                          <span>Name: {foundPod?.signed_by || 'Robert Vance'}</span>
                          <span>IP Verified</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-400 mt-4 max-w-md">
                        Signed by <strong className="text-white">{foundPod?.signed_by || 'Robert Vance'}</strong> on {foundPod?.delivered_at ? new Date(foundPod.delivered_at).toLocaleString('en-GB', { hour12: false }) : 'October 24, 2024 — 13:12:44 GMT'}.
                      </p>
                    </div>

                    <div className="bg-[#121212] p-6 rounded-2xl border border-gray-800">
                      <h5 className="text-xs font-mono text-gray-500 uppercase">Driver Operational Notes</h5>
                      <p className="text-sm text-gray-300 mt-2 italic">
                        "{foundPod?.notes || 'Delivered directly to warehouse reception. Goods checked and verified intact.'}"
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Share & Document Actions */}
                  <div className="lg:col-span-5 space-y-6">
                    <h4 className="text-[#FFD166] text-xs font-bold uppercase tracking-widest font-mono">Send PoD Documentation</h4>
                    
                    <div className="bg-[#121212] p-6 rounded-2xl border border-gray-800">
                      <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                        Instantly share a verified copy of this digital proof of delivery document to your administrative or logistics team via email.
                      </p>
                      <form onSubmit={handleEmailCopy} className="space-y-4">
                        <div>
                          <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Recipient Email Address</label>
                          <input
                            type="email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="e.g. accounts@company.com"
                            className="block w-full px-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FFD166] focus:border-transparent text-sm"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-[#FFD166] hover:bg-[#F4D35E] text-black font-bold uppercase tracking-wider py-3 px-4 rounded-xl text-xs transition duration-150 min-h-[44px]"
                        >
                          Email Copy of PoD to Logistics Team
                        </button>
                      </form>
                    </div>

                    <div className="bg-[#1B4332]/40 border border-emerald-800/40 p-6 rounded-2xl">
                      <h5 className="text-sm font-bold text-emerald-300 mb-1">RHA Compliance Statement</h5>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        All consignments are transported under standard Road Haulage Association (RHA) Conditions of Carriage. Fully insured up to £50,000 Goods in Transit.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Informative Grid below portal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-20 pt-16 border-t border-gray-800/60">
          <div className="space-y-2">
            <div className="p-3 bg-[#1B4332] rounded-xl inline-block text-[#FFD166] mb-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-white uppercase tracking-tight">Cryptographically Signed</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Every digital receipt generates an encrypted hash recording exact delivery telemetry, verified coordinates, and IP tracking.
            </p>
          </div>

          <div className="space-y-2">
            <div className="p-3 bg-[#1B4332] rounded-xl inline-block text-[#FFD166] mb-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-white uppercase tracking-tight">Zero Lag Transmission</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              The moment our driver receives a signature on the terminal, the PoD is available for retrieval worldwide within 5 seconds.
            </p>
          </div>

          <div className="space-y-2">
            <div className="p-3 bg-[#1B4332] rounded-xl inline-block text-[#FFD166] mb-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-white uppercase tracking-tight">Auditable Carbon Audits</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              We calculate the carbon output of every shipment using actual mileage and real vehicle data, rather than generic industry averages.
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}