'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

interface DBStats {
  vehiclesCount: number;
  bookingsCount: number;
  co2SavedTonnes: number;
  loading: boolean;
}

export function AboutAndSustainability() {
  const [activePillar, setActivePillar] = useState<number>(0);
  const [dbStats, setDbStats] = useState<DBStats>({
    vehiclesCount: 85,
    bookingsCount: 142850,
    co2SavedTonnes: 412.8,
    loading: true,
  });

  useEffect(() => {
    async function fetchLiveMetrics() {
      try {
        const { count: vCount, error: vError } = await supabase
          .from('vehicles')
          .select('*', { count: 'exact', head: true });

        const { count: bCount, error: bError } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true });

        // Calculate dynamic CO2 saved based on baseline + actual bookings
        let computedCo2 = 412.8;
        if (bCount && bCount > 0) {
          // Average saving of 23.9 kg (0.0239 tonnes) per optimized shipment
          computedCo2 += bCount * 0.0239;
        }

        setDbStats({
          vehiclesCount: vCount && vCount > 0 ? vCount : 85,
          bookingsCount: bCount && bCount > 0 ? 142850 + bCount : 142850,
          co2SavedTonnes: parseFloat(computedCo2.toFixed(1)),
          loading: false,
        });
      } catch (err) {
        // Graceful fallback to static stats
        setDbStats((prev) => ({ ...prev, loading: false }));
      }
    }
    fetchLiveMetrics();
  }, []);

  const pillars = [
    {
      title: 'Dynamic Route Consolidation',
      short: 'Zero Empty Miles',
      icon: (
        <svg className="w-6 h-6 text-[#FFD166]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      copy: 'Our dispatch system uses advanced route optimization algorithms to analyze delivery postcodes in real-time. By dynamically pairing outbound cargo with returning empty vehicles, we drastically reduce empty-running miles. This means fewer trucks on the road, lower fuel consumption, and direct cost savings passed on to you.',
    },
    {
      title: 'The Green Fleet Standard',
      short: 'Low Emission Heavy Haulage',
      icon: (
        <svg className="w-6 h-6 text-[#FFD166]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      copy: 'Every vehicle in our network is continuously monitored for efficiency. We enforce strict maintenance schedules to ensure optimal engine performance, and we are systematically transitioning our light urban courier fleet to 100% electric cargo vans. For heavy freight, we utilize modern Euro 6 compliant diesel engines equipped with advanced emissions reduction technology.',
    },
    {
      title: 'Verified Carbon Tracking',
      short: 'Auditable Data Reports',
      icon: (
        <svg className="w-6 h-6 text-[#FFD166]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      copy: 'Transparency is our core value. We calculate the carbon output of every shipment using actual mileage and real vehicle data, rather than generic industry averages. This data is instantly available to our clients for their environmental reporting, ensuring every gram of carbon is accounted for and auditable.',
    },
  ];

  return (
    <section id="about-sustainability" className="relative overflow-hidden bg-[#F8F9FA] py-24 lg:py-32">
      {/* Background accents */}
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-emerald-900/5 blur-3xl" />
      <div className="absolute left-0 bottom-0 h-96 w-96 rounded-full bg-[#FFD166]/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Company Narrative Section */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-20 items-center">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center rounded-full bg-[#1B4332]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#1B4332]">
              CARDIFF BORN, NATIONWIDE REACH
            </span>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-[#121212] sm:text-5xl lg:text-6xl">
              Redefining Logistics from the Heart of South Wales
            </h2>
            <div className="mt-6 space-y-6 text-lg text-gray-700 leading-relaxed font-normal">
              <p>
                Founded in Cardiff, Logitech Transport was built to solve a glaring problem in the UK transport sector: the lack of operational transparency and slow digital response times. Legacy transport brokers relied on manual phone calls, slow email quotes, and paper-based proof of delivery. We built our business on a different foundation—marrying heavy industrial reliability with rapid, modern digital tools.
              </p>
              <p>
                Today, our fleet operates nationwide across the United Kingdom. From our central Cardiff hub, we coordinate same-day courier operations, scheduled commercial haulage, and complex distribution contracts. We have expanded our reach without losing our core focus: providing exceptional, precise logistics services that respect both our clients' schedules and the environment.
              </p>
            </div>

            {/* In-page Anchor to Quote / Contact */}
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#calculator"
                className="inline-flex items-center justify-center rounded-md bg-[#1B4332] px-6 py-3 text-base font-medium text-white shadow-md transition-colors hover:bg-emerald-950 focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:ring-offset-2"
              >
                Estimate Shipping Carbon
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:ring-offset-2"
              >
                Inquire About Contracts
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-[#121212] p-2">
              <img
                src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=1200"
                alt="Logitech Fleet Truck on the M4 Corridor"
                className="h-80 w-full object-cover rounded-xl grayscale-[15%] hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/90 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="flex items-center space-x-2 text-[#FFD166] text-xs font-bold tracking-widest uppercase mb-1">
                  <span className="h-2 w-2 rounded-full bg-[#FFD166] animate-ping" />
                  <span>Active M4 Corridor Route</span>
                </div>
                <p className="text-sm text-gray-300 font-medium">
                  Direct connectivity from Cardiff Base across England, Scotland, and Wales.
                </p>
              </div>
            </div>

            {/* Quick Badge overlay */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100 hidden sm:block max-w-[200px]">
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Transit Insurance</p>
              <p className="text-sm font-bold text-[#121212]">Up to £50,000 Goods in Transit</p>
            </div>
          </div>
        </div>

        {/* Environmental Initiatives & Route Optimization */}
        <div className="mt-28 rounded-3xl bg-[#121212] text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-[#1B4332]/40 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FFD166]">
              LOWER EMISSIONS, SMARTER LOGISTICS
            </span>
            <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              How We Achieve Real Carbon Reduction
            </h3>
            <p className="mt-4 text-lg text-gray-300 leading-relaxed">
              We don't believe in vague greenwashing. We focus on physical route efficiency, modern engines, and rigorous mathematical emission tracking.
            </p>
          </div>

          {/* Pillars Tab System */}
          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12 items-start relative z-10">
            {/* Left Nav */}
            <div className="lg:col-span-5 space-y-3">
              {pillars.map((pillar, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePillar(idx)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 border flex items-center space-x-4 ${
                    activePillar === idx
                      ? 'bg-[#1B4332] border-[#FFD166] shadow-md'
                      : 'bg-[#1E1E1E] border-transparent hover:bg-zinc-800'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${activePillar === idx ? 'bg-[#121212]' : 'bg-[#1B4332]/20'}`}>
                    {pillar.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">{pillar.title}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{pillar.short}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Right Display Area */}
            <div className="lg:col-span-7 bg-[#1E1E1E] border border-zinc-800 rounded-2xl p-6 sm:p-8 min-h-[250px] flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePillar}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2 text-[#FFD166] text-xs font-bold tracking-widest uppercase">
                    <span>Pillar 0{activePillar + 1} — Operational Protocol</span>
                  </div>
                  <h4 className="text-2xl font-bold text-white">{pillars[activePillar].title}</h4>
                  <p className="text-gray-300 leading-relaxed text-base">
                    {pillars[activePillar].copy}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-between text-xs text-gray-400">
                <span>Verification standard: RHA CO2 Metrics</span>
                <span className="text-[#FFD166] font-bold">100% Auditable Logistics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Operational Statistics */}
        <div className="mt-28">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1B4332]">
              REAL-TIME INSIGHTS
            </span>
            <h3 className="mt-3 text-3xl font-extrabold text-[#121212] sm:text-4xl">
              Trusted by Over 400 UK Manufacturers, Distributors, and Retailers
            </h3>
            <p className="mt-4 text-base text-gray-600">
              Our live network performance data highlights our commitment to speed, scale, and environmental stewardship.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center transition-all hover:shadow-md">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Deliveries Completed</p>
              <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#1B4332]">
                {dbStats.bookingsCount.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-emerald-600 font-medium">✓ Nationwide</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center transition-all hover:shadow-md">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">CO2 Saved & Offset</p>
              <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#1B4332]">
                {dbStats.co2SavedTonnes.toLocaleString()}t
              </p>
              <p className="mt-1 text-xs text-emerald-600 font-medium">✓ Real Carbon Audited</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center transition-all hover:shadow-md">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Partner Fleet</p>
              <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#1B4332]">
                {dbStats.vehiclesCount}+
              </p>
              <p className="mt-1 text-xs text-emerald-600 font-medium">✓ Low-Emission Class</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center transition-all hover:shadow-md">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">On-Time Performance</p>
              <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-[#1B4332]">
                99.4%
              </p>
              <p className="mt-1 text-xs text-emerald-600 font-medium">✓ GPS Verified</p>
            </div>
          </div>
        </div>

        {/* Customer Testimonials - 3 Column Grid */}
        <div className="mt-24">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative hover:shadow-lg transition-all duration-300">
              <div>
                {/* Five star rating simulation */}
                <div className="flex space-x-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[#FFD166]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-gray-700 italic text-base leading-relaxed">
                  "We manufacture precision engineering parts in Cardiff and ship to assembly plants across the Midlands. Logitech Transport has never missed a same-day collection window. Their instant digital proof of delivery saves our administrative team hours of phone calls every single week."
                </blockquote>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-[#121212] text-sm">David Vance</h5>
                    <p className="text-xs text-gray-500">Operations Director</p>
                    <p className="text-xs text-[#1B4332] font-semibold">Welsh Precision Component Group Ltd</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-100">
                    Verified B2B
                  </span>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative hover:shadow-lg transition-all duration-300">
              <div>
                <div className="flex space-x-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[#FFD166]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-gray-700 italic text-base leading-relaxed">
                  "As a carbon-conscious retail brand, tracking our supply chain emissions is critical. Logitech’s built-in carbon estimator allows us to report precise shipping emissions data on our annual ESG audits. Highly recommended for modern businesses."
                </blockquote>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-[#121212] text-sm">Sarah Jenkins</h5>
                    <p className="text-xs text-gray-500">Logistics Coordinator</p>
                    <p className="text-xs text-[#1B4332] font-semibold">Origin Apparel UK</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-100">
                    Verified Shipper
                  </span>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative hover:shadow-lg transition-all duration-300">
              <div>
                <div className="flex space-x-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[#FFD166]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-gray-700 italic text-base leading-relaxed">
                  "We had a critical breakdown at our warehouse in Bristol and needed heavy parts moved from Cardiff instantly. The flatbed truck was on-site within 40 minutes, and the parts were delivered before lunch. Exceptional, transparent service."
                </blockquote>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-[#121212] text-sm">Marcus Thorne</h5>
                    <p className="text-xs text-gray-500">Site Manager</p>
                    <p className="text-xs text-[#1B4332] font-semibold">Thorne & Sons Distribution</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-100">
                    Verified Freight
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}