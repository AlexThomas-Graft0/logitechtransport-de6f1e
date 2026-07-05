'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { 
  Truck, 
  Leaf, 
  Search, 
  ShieldCheck, 
  MapPin, 
  CheckCircle2, 
  ChevronRight, 
  Loader2, 
  Navigation, 
  AlertCircle,
  FileText,
  Calendar
} from 'lucide-react';

interface Vehicle {
  id: string;
  name: string;
  max_payload_kg: number;
  base_rate: number;
  rate_per_mile: number;
  co2_per_mile_g: number;
  is_active: boolean;
}

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  pickup_postcode: string;
  delivery_postcode: string;
  distance_miles: number;
  total_cost: number;
  co2_produced_kg: number;
  status: string;
}

interface ProofOfDelivery {
  id: string;
  booking_id: string;
  signed_by: string;
  signature_image_url: string | null;
  delivered_at: string;
  notes: string | null;
}

const STATIC_VEHICLES: Vehicle[] = [
  { id: '1', name: 'Small Express Van', max_payload_kg: 500, base_rate: 25.00, rate_per_mile: 1.20, co2_per_mile_g: 140, is_active: true },
  { id: '2', name: 'Midsized Transit Van', max_payload_kg: 1200, base_rate: 45.00, rate_per_mile: 1.50, co2_per_mile_g: 195, is_active: true },
  { id: '3', name: 'Luton Box Van (Tail Lift)', max_payload_kg: 1600, base_rate: 65.00, rate_per_mile: 1.80, co2_per_mile_g: 240, is_active: true },
  { id: '4', name: '7.5 Tonne Rigid Truck', max_payload_kg: 3000, base_rate: 110.00, rate_per_mile: 2.20, co2_per_mile_g: 420, is_active: true },
  { id: '5', name: '18 Tonne Heavy Freight', max_payload_kg: 9000, base_rate: 180.00, rate_per_mile: 2.80, co2_per_mile_g: 680, is_active: true },
  { id: '6', name: '40ft Articulated Lorry', max_payload_kg: 26000, base_rate: 250.00, rate_per_mile: 3.50, co2_per_mile_g: 910, is_active: true },
];

export function HeroSection() {
  const [activeTab, setActiveTab] = useState<'estimator' | 'tracking'>('estimator');
  const [vehicles, setVehicles] = useState<Vehicle[]>(STATIC_VEHICLES);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);

  // Estimator Form State
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('2');
  const [pickup, setPickup] = useState('CF24 5SD');
  const [delivery, setDelivery] = useState('EC1A 1BB');
  const [distance, setDistance] = useState<number>(151);

  // Tracking State
  const [trackingId, setTrackingId] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [trackingError, setTrackingError] = useState('');
  const [trackingResult, setTrackingResult] = useState<{
    booking: Booking;
    pod: ProofOfDelivery | null;
  } | null>(null);

  // Load vehicles from Supabase
  useEffect(() => {
    async function loadVehicles() {
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('is_active', true)
          .order('max_payload_kg', { ascending: true });
        
        if (error) throw error;
        if (data && data.length > 0) {
          setVehicles(data as Vehicle[]);
          setSelectedVehicleId(data[1]?.id || data[0]?.id);
        }
      } catch (err) {
        // Fallback silently to static data
      } finally {
        setIsLoadingVehicles(false);
      }
    }
    loadVehicles();
  }, []);

  // Calculate quick values
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0] || STATIC_VEHICLES[0];
  const baseRate = Number(selectedVehicle.base_rate);
  const ratePerMile = Number(selectedVehicle.rate_per_mile);
  const co2PerMileG = Number(selectedVehicle.co2_per_mile_g);

  const calculatedCost = baseRate + (distance * ratePerMile);
  const calculatedCo2 = (distance * co2PerMileG) / 1000;
  // Net Carbon Saved (22% lower than unoptimized networks)
  const netCarbonSaved = calculatedCo2 * 0.22;
  const treesEquivalent = (netCarbonSaved / 21.8).toFixed(1); // 21.8kg/year is average tree absorption

  // Handle Tracking Search
  const handleTrackingSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    setIsTracking(true);
    setTrackingError('');
    setTrackingResult(null);

    try {
      const cleanId = trackingId.trim();
      const { data: booking, error: bookingErr } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', cleanId)
        .maybeSingle();

      if (bookingErr) throw bookingErr;

      if (!booking) {
        setTrackingError('No booking found with this ID. Please check the ID or try another.');
        setIsTracking(false);
        return;
      }

      const { data: pod, error: podErr } = await supabase
        .from('proof_of_deliveries')
        .select('*')
        .eq('booking_id', booking.id)
        .maybeSingle();

      if (podErr) throw podErr;

      setTrackingResult({
        booking: booking as Booking,
        pod: pod as ProofOfDelivery | null
      });
    } catch (err: any) {
      setTrackingError('An error occurred while fetching delivery status. Please verify your reference.');
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <section className="relative min-h-screen bg-[#121212] text-white flex flex-col justify-center overflow-hidden font-sans pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Background decoration & overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#1B4332]/40 via-neutral-950 to-neutral-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        {/* Left Side: Brand & Hero Messaging */}
        <div className="lg:col-span-7 flex flex-col space-y-8 text-left">
          
          {/* Preheading with Safety Yellow Badge */}
          <div className="inline-flex items-center space-x-2 self-start bg-[#1B4332] border border-[#FFD166]/20 px-3.5 py-1.5 rounded-full shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#FFD166] animate-pulse" />
            <span className="text-xs font-extrabold tracking-widest text-[#FFD166] uppercase font-mono">
              Cardiff Born, UK Wide
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white font-display">
              Same-Day Courier & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#FFD166] to-[#009866]">
                Heavy Freight Logistics.
              </span>
            </h1>
            <p className="text-2xl sm:text-3xl font-extrabold text-neutral-300 tracking-tight font-display">
              Engineered for Precision.
            </p>
          </div>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-neutral-400 max-w-xl leading-relaxed">
            Rapid, carbon-audited transport solutions across the United Kingdom. Get instant, transparent pricing and real-time environmental tracking without the wait.
          </p>

          {/* Primary & Secondary Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <a
              href="#calculator"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-[#FFD166] text-[#121212] font-black tracking-wide shadow-xl shadow-[#FFD166]/10 hover:bg-[#F4D35E] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#FFD166]/50 text-center"
            >
              <span>Calculate Instant Quote</span>
              <ChevronRight className="w-5 h-5 ml-2" />
            </a>
            <a
              href="#booking"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold tracking-wide hover:border-white/40 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-white/20 text-center"
            >
              Book Same-Day Courier
            </a>
          </div>

          {/* Trust Badges Bar */}
          <div className="border-t border-neutral-800/80 pt-6 mt-4">
            <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-xs sm:text-sm text-neutral-400 font-medium">
              <span className="flex items-center text-emerald-400 font-semibold">
                <ShieldCheck className="w-5 h-5 mr-1.5 shrink-0 text-[#FFD166]" />
                Fully Insured up to £50,000 Goods in Transit
              </span>
              <span className="flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 mr-2" />
                RHA Member
              </span>
              <span className="flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 mr-2" />
                Real-time GPS Tracking
              </span>
            </div>
          </div>

        </div>

        {/* Right Side: Quick Action Widget (Estimator & Tracking) */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl shadow-black/80 backdrop-blur-md">
            
            {/* Tab Bar Selector */}
            <div className="flex border-b border-neutral-800">
              <button
                onClick={() => { setActiveTab('estimator'); setTrackingResult(null); }}
                className={`flex-1 py-4 px-4 text-center font-bold text-sm transition-all flex items-center justify-center space-x-2 border-b-2 focus:outline-none ${
                  activeTab === 'estimator'
                    ? 'border-[#FFD166] text-[#FFD166] bg-neutral-950/40'
                    : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-950/20'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Instant Estimator</span>
              </button>
              <button
                onClick={() => setActiveTab('tracking')}
                className={`flex-1 py-4 px-4 text-center font-bold text-sm transition-all flex items-center justify-center space-x-2 border-b-2 focus:outline-none ${
                  activeTab === 'tracking'
                    ? 'border-[#FFD166] text-[#FFD166] bg-neutral-950/40'
                    : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-950/20'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Track Shipment (PoD)</span>
              </button>
            </div>

            <div className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                
                {/* Tab 1: Instant Estimator */}
                {activeTab === 'estimator' && (
                  <motion.div
                    key="estimator-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">Quick Fleet Estimator</h3>
                      <p className="text-xs text-neutral-400">Get carbon-audited delivery estimates instantly</p>
                    </div>

                    {/* Fleet Vehicle Selector */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        Select Fleet Vehicle
                      </label>
                      <div className="relative">
                        <select
                          value={selectedVehicleId}
                          onChange={(e) => setSelectedVehicleId(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#FFD166] appearance-none cursor-pointer"
                        >
                          {isLoadingVehicles ? (
                            <option>Loading active fleet...</option>
                          ) : (
                            vehicles.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.name} (Max {v.max_payload_kg.toLocaleString()} kg)
                              </option>
                            ))
                          )}
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-neutral-500">
                          <ChevronRight className="w-4 h-4 transform rotate-90" />
                        </div>
                      </div>
                    </div>

                    {/* Route Preview Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Pickup</label>
                        <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-neutral-200">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-neutral-500" />
                          <input 
                            type="text" 
                            value={pickup} 
                            onChange={(e) => setPickup(e.target.value.toUpperCase())}
                            className="bg-transparent border-none p-0 focus:ring-0 w-full focus:outline-none text-white font-mono" 
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Delivery</label>
                        <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-neutral-200">
                          <Navigation className="w-3.5 h-3.5 mr-1.5 text-neutral-500" />
                          <input 
                            type="text" 
                            value={delivery} 
                            onChange={(e) => setDelivery(e.target.value.toUpperCase())}
                            className="bg-transparent border-none p-0 focus:ring-0 w-full focus:outline-none text-white font-mono" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Distance Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-neutral-400">
                        <span className="uppercase tracking-wider">Transit Distance</span>
                        <span className="text-[#FFD166] font-mono font-bold text-sm">{distance} Miles</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="600"
                        value={distance}
                        onChange={(e) => setDistance(Number(e.target.value))}
                        className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#FFD166]"
                      />
                      <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                        <span>10 mi</span>
                        <span>Cardiff to London (~151 mi)</span>
                        <span>600 mi</span>
                      </div>
                    </div>

                    {/* Dynamic Calculation Output Panel */}
                    <div className="bg-[#1B4332]/30 border border-[#1B4332]/80 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-neutral-300">Estimated Delivery Cost:</span>
                        <span className="text-2xl font-black text-[#FFD166] font-mono">
                          £{calculatedCost.toFixed(2)}
                        </span>
                      </div>
                      <div className="border-t border-[#1B4332]/40 pt-2.5 flex justify-between items-center">
                        <div className="flex items-center space-x-1.5 text-xs text-neutral-200">
                          <Leaf className="w-4 h-4 text-emerald-400" />
                          <span>CO2 Produced:</span>
                        </div>
                        <span className="text-xs font-bold font-mono text-neutral-200">
                          {calculatedCo2.toFixed(1)} kg CO2
                        </span>
                      </div>
                      <div className="bg-emerald-950/80 border border-emerald-800/60 rounded-lg p-2.5 text-center">
                        <p className="text-[11px] text-emerald-300 leading-snug">
                          <strong>Logitech Green Saving:</strong> {netCarbonSaved.toFixed(1)} kg CO2 (22% lower emissions). Equivalent to planting {treesEquivalent} mature trees.
                        </p>
                      </div>
                    </div>

                    {/* Quick Trigger Booking Button */}
                    <a
                      href="#booking"
                      className="w-full inline-flex items-center justify-center py-3.5 px-4 rounded-xl bg-[#FFD166] text-neutral-950 font-black tracking-wide hover:bg-[#F4D35E] transition-all duration-150 text-sm"
                    >
                      Proceed with Same-Day Booking
                    </a>
                  </motion.div>
                )}

                {/* Tab 2: Track Shipment (PoD) */}
                {activeTab === 'tracking' && (
                  <motion.div
                    key="tracking-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">Self-Service Document Portal</h3>
                      <p className="text-xs text-neutral-400">
                        Enter your unique 8-digit Booking ID or the full Consignment UUID to view delivery status, signatures, and timestamps.
                      </p>
                    </div>

                    {/* Tracking Input Form */}
                    <form onSubmit={handleTrackingSearch} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                          Consignment UUID or Booking ID
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="e.g. a4f8c2b1-9e8d-4c3b-2a1f..."
                            value={trackingId}
                            onChange={(e) => setTrackingId(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-4 pr-12 py-3.5 text-sm text-white placeholder-neutral-600 font-mono focus:outline-none focus:ring-2 focus:ring-[#FFD166]"
                          />
                          <button
                            type="submit"
                            disabled={isTracking}
                            className="absolute right-2.5 top-2.5 bottom-2.5 px-3 bg-[#FFD166] hover:bg-[#F4D35E] text-neutral-900 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                          >
                            {isTracking ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Search className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </form>

                    {/* Errors Notification */}
                    {trackingError && (
                      <div className="bg-red-950/60 border border-red-800/80 rounded-xl p-4 flex items-start space-x-3 text-red-200">
                        <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                        <span className="text-xs leading-normal">{trackingError}</span>
                      </div>
                    )}

                    {/* Search Result Display */}
                    {trackingResult && (
                      <div className="border border-neutral-800 bg-neutral-950/50 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-neutral-500">
                            ID: {trackingResult.booking.id.slice(0, 8)}...
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            trackingResult.booking.status === 'delivered' 
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                              : 'bg-blue-950 text-blue-300 border border-blue-800'
                          }`}>
                            {trackingResult.booking.status}
                          </span>
                        </div>

                        {/* Route Timeline */}
                        <div className="grid grid-cols-2 gap-4 border-y border-neutral-800 py-3 text-xs">
                          <div>
                            <span className="block text-[10px] text-neutral-500 uppercase font-semibold">Origin</span>
                            <span className="font-bold text-neutral-200">{trackingResult.booking.pickup_postcode}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-neutral-500 uppercase font-semibold">Destination</span>
                            <span className="font-bold text-neutral-200">{trackingResult.booking.delivery_postcode}</span>
                          </div>
                        </div>

                        {/* Proof of Delivery Details if available */}
                        {trackingResult.pod ? (
                          <div className="space-y-2.5 pt-1">
                            <span className="block text-xs font-bold text-white flex items-center">
                              <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-400" />
                              Proof of Delivery Captured
                            </span>
                            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs space-y-1.5">
                              <p className="text-neutral-400">
                                <strong>Signed by:</strong> {trackingResult.pod.signed_by}
                              </p>
                              <p className="text-neutral-400">
                                <strong>Delivered At:</strong> {new Date(trackingResult.pod.delivered_at).toLocaleDateString('en-GB')}
                              </p>
                              {trackingResult.pod.notes && (
                                <p className="text-neutral-500 italic">
                                  &ldquo;{trackingResult.pod.notes}&rdquo;
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-neutral-900/50 border border-dashed border-neutral-800 rounded-xl p-3 text-center text-xs text-neutral-400">
                            No digital PoD file uploaded yet. Shipment is currently in transit.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Helpful Tip */}
                    {!trackingResult && !trackingError && (
                      <div className="bg-neutral-950/50 border border-neutral-800 rounded-xl p-3 flex items-start space-x-2.5 text-neutral-400">
                        <FileText className="w-4 h-4 text-[#FFD166] shrink-0 mt-0.5" />
                        <p className="text-[11px] leading-relaxed">
                          Tip: To test the PoD portal, enter any active consignment UUID. Digital signatures are automatically archived upon delivery.
                        </p>
                      </div>
                    )}

                  </motion.div>
                )}

              </AnimatePresence>
            </div>

          </div>
        </div>

      </div>

      {/* Trust Pilot / Client logos ribbon */}
      <div className="mt-16 max-w-7xl mx-auto w-full border-t border-neutral-800/80 pt-8">
        <p className="text-center text-xs font-bold text-neutral-500 uppercase tracking-widest mb-6">
          Trusted by over 400 UK Manufacturers, Distributors, and Retailers
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center opacity-40 grayscale hover:grayscale-0 transition-all duration-300">
          <div className="text-sm font-bold tracking-widest text-white">WALES PRECISION</div>
          <div className="text-sm font-bold tracking-widest text-white">ORIGIN APPAREL</div>
          <div className="text-sm font-bold tracking-widest text-white">THORNE &amp; SONS</div>
          <div className="text-sm font-bold tracking-widest text-white">CELTIC LOGISTICS</div>
        </div>
      </div>

    </section>
  );
}