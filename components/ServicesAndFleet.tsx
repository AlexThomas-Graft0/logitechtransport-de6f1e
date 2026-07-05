'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, 
  Clock, 
  Calendar, 
  Leaf, 
  ShieldCheck, 
  Scale, 
  Compass, 
  ArrowRight, 
  Calculator,
  Flame,
  CheckCircle2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Vehicle {
  id: string;
  name: string;
  max_payload_kg: number;
  base_rate: number;
  rate_per_mile: number;
  co2_per_mile_g: number;
  is_active: boolean;
}

const FALLBACK_VEHICLES: Vehicle[] = [
  { id: '1', name: 'Small Express Van', max_payload_kg: 500, base_rate: 25.00, rate_per_mile: 1.20, co2_per_mile_g: 140, is_active: true },
  { id: '2', name: 'Midsized Transit Van', max_payload_kg: 1200, base_rate: 45.00, rate_per_mile: 1.50, co2_per_mile_g: 195, is_active: true },
  { id: '3', name: 'Luton Box Van (Tail Lift)', max_payload_kg: 1600, base_rate: 65.00, rate_per_mile: 1.80, co2_per_mile_g: 240, is_active: true },
  { id: '4', name: '7.5 Tonne Rigid Truck', max_payload_kg: 3000, base_rate: 110.00, rate_per_mile: 2.20, co2_per_mile_g: 420, is_active: true },
  { id: '5', name: '18 Tonne Heavy Freight', max_payload_kg: 9000, base_rate: 180.00, rate_per_mile: 2.80, co2_per_mile_g: 680, is_active: true },
  { id: '6', name: '40ft Articulated Lorry', max_payload_kg: 26000, base_rate: 250.00, rate_per_mile: 3.50, co2_per_mile_g: 910, is_active: true }
];

export function ServicesAndFleet() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(FALLBACK_VEHICLES);
  const [mileage, setMileage] = useState<number>(150);
  const [activeServiceTab, setActiveServiceTab] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('is_active', true)
          .order('max_payload_kg', { ascending: true });
        
        if (!error && data && data.length > 0) {
          setVehicles(data as Vehicle[]);
        }
      } catch (err) {
        console.error('Error fetching vehicles, using fallback data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchVehicles();
  }, []);

  const services = [
    {
      title: "Same-Day Urgent Courier",
      icon: Clock,
      shortDesc: "Direct dedicated transport for time-critical documents, medical supplies, and manufacturing components.",
      longDesc: "Direct, point-to-point delivery across the UK. Once our driver collects your consignment, the vehicle doors are locked, and the truck travels directly to your destination postcode. No co-loading, no sorting depots, and no unnecessary delays.",
      metric: "Average collection time: 45 minutes from Cardiff base.",
      bestFor: "Urgent documents, high-value electronics, medical equipment, aerospace components, and manufacturing line-stoppage parts.",
      guarantee: "Collection within 60 minutes in Cardiff; direct delivery nationwide.",
      ctaText: "Book Same-Day Courier",
      ctaHref: "#booking",
      image: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Heavy & Pallet Freight",
      icon: Truck,
      shortDesc: "Complete heavy haulage and pallet distribution across England, Wales, and Scotland.",
      longDesc: "Comprehensive palletized freight transport for heavy, bulky, or high-volume shipments. We handle single-pallet consignments up to full multi-articulated lorry loads, with tail-lift vehicles available to ensure easy loading and unloading at sites without forklifts.",
      metric: "Up to 26,000 kg payload capacity per vehicle.",
      bestFor: "Industrial machinery, building materials, raw materials, and high-volume consumer goods.",
      guarantee: "Full UK-wide coverage with real-time tracking and digital delivery receipting.",
      ctaText: "Estimate Freight Costs",
      ctaHref: "#quote",
      image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Scheduled & Contract Logistics",
      icon: Calendar,
      shortDesc: "Secure your regular distribution routes, multi-drop delivery patterns, or daily warehouse transfers.",
      longDesc: "Consistent, recurring transport services tailored to your business operations. Whether you require daily warehouse transfers, weekly retail replenishment runs, or scheduled multi-drop routes, we supply the vehicles and drivers to act as an extension of your company.",
      metric: "Dedicated accounts with monthly billing terms.",
      bestFor: "E-commerce fulfillment networks, weekly manufacturing runs, and regular regional distribution.",
      guarantee: "Dedicated account managers, guaranteed vehicle availability, and fixed contractual rates.",
      ctaText: "Inquire About Contracts",
      ctaHref: "#contact",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
    },
    {
      title: "Eco-Optimized Distribution",
      icon: Leaf,
      shortDesc: "Minimize your corporate carbon footprint. Every route is optimized via machine learning to reduce empty running miles.",
      longDesc: "For cargo that demands dynamic green routing. We calculate the carbon output of every shipment using actual mileage and real vehicle data, rather than generic industry averages. This data is instantly available to our clients for their environmental reporting.",
      metric: "Transparent CO2 audit reports provided with every invoice.",
      bestFor: "Carbon-conscious enterprises, ESG audit compliance, and zero-waste logistics integration.",
      guarantee: "Fully certified low-emission green fleet and machine-learning optimized routing.",
      ctaText: "Learn About Our Green Fleet",
      ctaHref: "#green-fleet",
      image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80"
    }
  ];

  return (
    <section id="services-fleet" className="bg-[#F8F9FA] text-[#121212] py-20 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
          <span className="text-xs font-bold tracking-widest text-[#1B4332] uppercase bg-[#1B4332]/10 px-3 py-1.5 rounded-full inline-block mb-4 border border-[#1B4332]/20">
            CARDIFF BORN, UK WIDE
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-[#121212] font-sans mb-6">
            High-Velocity Transport &amp; Freight Solutions
          </h2>
          <p className="text-lg text-gray-600 font-normal leading-relaxed">
            No complex contracts required. From single-envelope urgent deliveries to full multi-pallet articulated freight, we keep your business moving.
          </p>
        </div>

        {/* 2x2 Core Services Quick Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div 
                key={index} 
                className="bg-white border border-gray-200/80 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-[#1B4332]/30 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#1B4332] text-[#FFD166] flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#121212] mb-3 group-hover:text-[#1B4332] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.shortDesc}
                  </p>
                </div>
                
                <div className="border-t border-gray-100 pt-6 mt-auto">
                  <div className="bg-[#F8F9FA] rounded-lg px-4 py-2.5 mb-4 border-l-4 border-[#FFD166]">
                    <span className="text-xs font-bold text-gray-500 block uppercase tracking-wider">Key Capability</span>
                    <span className="text-sm font-semibold text-[#1B4332]">{service.metric}</span>
                  </div>
                  <a 
                    href={service.ctaHref} 
                    className="inline-flex items-center text-sm font-bold text-[#1B4332] hover:text-[#FFD166] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B4332] rounded"
                  >
                    {service.ctaText} <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Service Specification Tabbed Interface */}
        <div className="bg-[#121212] text-white rounded-3xl p-8 lg:p-12 mb-24 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#1B4332]/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12 border-b border-white/10 pb-8">
              <div>
                <span className="text-[#FFD166] text-xs font-bold uppercase tracking-wider block mb-2">OPERATIONAL SPECIFICATIONS</span>
                <h3 className="text-3xl lg:text-4xl font-extrabold font-sans">Detailed Service Breakdown</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {services.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveServiceTab(idx)}
                    className={`px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-200 ${
                      activeServiceTab === idx 
                        ? 'bg-[#FFD166] text-[#121212] shadow-md' 
                        : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    {s.title.split(' ')[0]} {s.title.split(' ')[1] || ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Panel Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <span className="text-[#FFD166] text-sm font-bold tracking-wider uppercase inline-flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Direct-to-Destination Guarantee
                </span>
                <h4 className="text-3xl font-extrabold text-white">
                  {services[activeServiceTab].title}
                </h4>
                <p className="text-gray-300 leading-relaxed text-base">
                  {services[activeServiceTab].longDesc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                  <div className="bg-white/5 p-5 rounded-xl border border-white/10">
                    <span className="text-[#FFD166] text-xs font-extrabold uppercase tracking-wider block mb-1">BEST SUITED FOR</span>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {services[activeServiceTab].bestFor}
                    </p>
                  </div>
                  <div className="bg-white/5 p-5 rounded-xl border border-white/10">
                    <span className="text-[#FFD166] text-xs font-extrabold uppercase tracking-wider block mb-1">SERVICE ASSURANCES</span>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {services[activeServiceTab].guarantee}
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <a
                    href={services[activeServiceTab].ctaHref}
                    className="inline-flex items-center justify-center px-6 py-3.5 bg-[#1B4332] text-white hover:bg-[#1B4332]/80 font-bold rounded-xl transition-all duration-200 shadow-lg border border-[#1B4332] text-sm hover:border-[#FFD166]"
                  >
                    {services[activeServiceTab].ctaText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="relative rounded-2xl overflow-hidden aspect-video lg:aspect-square shadow-2xl border border-white/10">
                  <img 
                    src={services[activeServiceTab].image} 
                    alt={services[activeServiceTab].title}
                    className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-4">
                      <p className="text-xs font-bold text-[#FFD166] uppercase tracking-wider mb-1">Cardiff Hub Deployment</p>
                      <p className="text-sm text-white font-medium">Real-time GPS tracking and instant Proof of Delivery enabled.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Fleet Specs & Cost Calculator Interactive Section */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 lg:p-12 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 pb-6 border-b border-gray-100">
            <div>
              <span className="text-[#1B4332] text-xs font-bold uppercase tracking-widest block mb-2">FLEET CAPABILITIES &amp; TRANSPARENT COSTS</span>
              <h3 className="text-3xl lg:text-4xl font-extrabold text-[#121212] font-sans">
                Vehicle Fleet Specifications
              </h3>
              <p className="text-gray-500 mt-2">
                Use the interactive slider below to dynamically estimate base cost and carbon metrics for your dispatch distance.
              </p>
            </div>

            {/* Interactive Distance Slider */}
            <div className="bg-[#F8F9FA] border border-gray-200 p-5 rounded-2xl w-full lg:w-96">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="mileage-range" className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-[#1B4332]" /> Transit Distance
                </label>
                <span className="text-lg font-black text-[#1B4332] bg-white px-3 py-1 rounded-lg border border-gray-200">
                  {mileage} <span className="text-xs font-bold text-gray-400">Miles</span>
                </span>
              </div>
              <input 
                id="mileage-range"
                type="range" 
                min="10" 
                max="500" 
                value={mileage}
                onChange={(e) => setMileage(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1B4332] focus:outline-none"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1 uppercase">
                <span>10 mi (Local)</span>
                <span>250 mi (Midlands/North)</span>
                <span>500 mi (Scotland)</span>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-inner">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead>
                <tr className="bg-[#1B4332] text-white">
                  <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Vehicle Class</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Max Payload</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Base Fee</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Per Mile Rate</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Est. Cost (Ex VAT)</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Est. CO2 Output</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Primary Application</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200/80">
                {vehicles.map((vehicle) => {
                  const estCost = Number(vehicle.base_rate) + (Number(vehicle.rate_per_mile) * mileage);
                  const estCo2 = (Number(vehicle.co2_per_mile_g) * mileage) / 1000;
                  const treeEquivalent = (estCo2 / 22).toFixed(1); // average tree absorbs ~22kg CO2 per year

                  return (
                    <tr 
                      key={vehicle.id} 
                      className="hover:bg-[#1B4332]/5 transition-colors duration-150 group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#1B4332] group-hover:bg-[#FFD166] transition-colors" />
                          <div className="font-bold text-[#121212] group-hover:text-[#1B4332] transition-colors">
                            {vehicle.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-mono text-sm text-gray-700">
                        {vehicle.max_payload_kg.toLocaleString()} kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-mono text-sm text-gray-600">
                        £{Number(vehicle.base_rate).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-mono text-sm text-gray-600">
                        £{Number(vehicle.rate_per_mile).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-3 py-1.5 rounded-lg font-mono font-bold text-sm bg-[#1B4332]/10 text-[#1B4332]">
                          £{estCost.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-mono font-bold text-sm text-emerald-700 flex items-center gap-1">
                            <Leaf className="w-3.5 h-3.5 inline text-emerald-600" /> {estCo2.toFixed(1)} kg
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                            ≈ {treeEquivalent} tree years
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                        {vehicle.name.includes('Small') && "Documents, single boxes, small parts"}
                        {vehicle.name.includes('Midsized') && "Multiple boxes, small pallets, furniture"}
                        {vehicle.name.includes('Luton') && "Heavy machinery parts, non-stackable pallets"}
                        {vehicle.name.includes('7.5') && "Industrial loads, commercial shop fittings"}
                        {vehicle.name.includes('18') && "High-volume pallet distribution, bulk cargo"}
                        {vehicle.name.includes('40ft') && "Full warehouse transfers, heavy raw materials"}
                        {!['Small', 'Midsized', 'Luton', '7.5', '18', '40ft'].some(term => vehicle.name.includes(term)) && "General cargo and dedicated regional haulage"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Trust Footnote */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#F8F9FA] p-5 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-[#1B4332] text-white p-2.5 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-[#FFD166]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#121212]">Fully Insured &amp; Regulated Carriage</p>
                <p className="text-xs text-gray-500">Fully insured up to £50,000 Goods in Transit | RHA Member | Real-time GPS Tracking</p>
              </div>
            </div>
            <a 
              href="#quote" 
              className="w-full sm:w-auto text-center px-6 py-3 bg-[#FFD166] text-[#121212] hover:bg-[#FFD166]/90 font-bold rounded-xl transition-all duration-200 text-sm shadow-sm"
            >
              Calculate Instant Quote
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}