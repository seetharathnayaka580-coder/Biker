export interface ManualSection {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  category: 'specs' | 'running_in' | 'maintenance' | 'controls' | 'troubleshooting' | 'safety';
  badge?: string;
  items: Array<{
    title: string;
    details: string;
    specs?: Array<{ label: string; value: string }>;
    warning?: string;
    tip?: string;
  }>;
}

export const PULSAR_N160_MANUAL: {
  bikeModel: string;
  edition: string;
  description: string;
  downloadUrl?: string;
  sections: ManualSection[];
} = {
  bikeModel: "Bajaj Pulsar N160 (Dual-Channel ABS / USD Fork Edition)",
  edition: "Official Bajaj Auto Owner's Manual & Workshop Guide Edition",
  description: "Complete rider handbook, technical specifications, periodic maintenance schedule, running-in instructions, fluids & tyre pressures, control guide, and troubleshooting procedures for Pulsar N160.",
  sections: [
    {
      id: "tech_specs",
      title: "Technical Specifications & Capacities",
      subtitle: "Engine architecture, power, fluids, dimensions and electrical ratings",
      iconName: "Cpu",
      category: "specs",
      badge: "OEM Factory Specs",
      items: [
        {
          title: "Engine & Performance",
          details: "4-stroke, Single cylinder, SOHC, 2-Valve, Oil-Cooled, Twin Spark FI (Fuel Injected) DTS-i engine.",
          specs: [
            { label: "Displacement", value: "164.82 cc" },
            { label: "Bore x Stroke", value: "58.0 mm x 62.4 mm" },
            { label: "Compression Ratio", value: "10.3 : 1" },
            { label: "Max Net Power", value: "16 PS (11.7 kW) @ 8,750 RPM" },
            { label: "Max Net Torque", value: "14.65 Nm @ 6,750 RPM" },
            { label: "Fuel System", value: "Electronic Fuel Injection (BOSCH FI)" },
            { label: "Starting", value: "Self Start Only (Electric)" },
            { label: "Ignition", value: "Electronic DC CDI" },
            { label: "Cooling System", value: "Oil-Cooled with External Radiator Matrix" },
            { label: "Clutch", value: "Wet, Multi-Plate with Assist & Slipper mechanism" },
            { label: "Transmission", value: "5-Speed Constant Mesh (1-N-2-3-4-5 pattern)" }
          ]
        },
        {
          title: "Fluids, Fuel & Capacities",
          details: "Always use genuine Bajaj DTS-i engine oil or equivalent API SN, JASO MA2 synthetic/semi-synthetic oil.",
          specs: [
            { label: "Engine Oil Grade", value: "Bajaj DTS-i 20W50 / 10W30 (API SN, JASO MA2)" },
            { label: "Oil Capacity (Drain & Refill)", value: "1,150 ml (1.15 Litres)" },
            { label: "Oil Capacity (Filter Replacement)", value: "1,200 ml (1.2 Litres)" },
            { label: "Oil Capacity (Engine Overhaul)", value: "1,350 ml (1.35 Litres)" },
            { label: "Fuel Tank Total Capacity", value: "14.0 Litres" },
            { label: "Fuel Reserve / Low Fuel Warning", value: "Approx. 2.0 - 2.5 Litres" },
            { label: "Fuel Recommendation", value: "Unleaded Petrol, Min 91 / 95 RON (Euro-4 compliant)" },
            { label: "Front Fork Oil (Per Leg)", value: "330 ± 5 ml (10W Bajaj Genuine Fork Oil)" },
            { label: "Brake Fluid Specification", value: "DOT 4 High Performance Brake Fluid only" }
          ],
          warning: "Never mix different grades or brands of engine oil. Do not use automotive car engine oil with friction modifiers."
        },
        {
          title: "Braking, Suspension & Chassis",
          details: "Perimeter / Tubular frame with front USD (Upside Down) forks and rear Nitrox Monoshock.",
          specs: [
            { label: "Frame Type", value: "Tubular frame with engine as stressed member" },
            { label: "Front Suspension", value: "31mm or 33mm Upside Down (USD) Telescopic Fork" },
            { label: "Rear Suspension", value: "Monoshock with Nitrox canister (Preload adjustable)" },
            { label: "Front Brake", value: "300 mm Petal Disc with 2-piston floating caliper" },
            { label: "Rear Brake", value: "230 mm Disc with single piston caliper" },
            { label: "ABS System", value: "Dual-Channel ABS (Bosch Generation 9.1)" },
            { label: "ABS Modes", value: "Road Mode, Rain Mode, Off-Road Mode" }
          ]
        },
        {
          title: "Tyres & Operating Pressures",
          details: "Tubeless radial / bias ply tyres. Check pressures weekly when tyres are completely cold.",
          specs: [
            { label: "Front Tyre Size", value: "100/80 - 17 Tubeless (52P)" },
            { label: "Rear Tyre Size", value: "130/70 - 17 Tubeless (62P)" },
            { label: "Front Pressure (Solo / Pillion)", value: "25 PSI (1.75 kg/cm²)" },
            { label: "Rear Pressure (Solo)", value: "28 PSI (2.00 kg/cm²)" },
            { label: "Rear Pressure (With Pillion)", value: "32 PSI (2.25 kg/cm²)" }
          ],
          tip: "Under-inflation drastically increases tyre wear, drops fuel economy, and reduces cornering stability."
        },
        {
          title: "Electrical System & Lighting",
          details: "12 Volt DC negative earth electrical network with maintenance-free VRLA battery.",
          specs: [
            { label: "Battery", value: "12V - 4Ah or 5Ah VRLA Maintenance Free (MF)" },
            { label: "Headlamp", value: "Bi-Functional LED Projector with Twin LED DRL Eyebrows" },
            { label: "Tail / Stop Lamp", value: "Crystalline Twin LED Strips" },
            { label: "Turn Signals", value: "12V 10W Amber Bulb or OEM LED indicators" },
            { label: "USB Charger Port", value: "5V 2.0A Type-A USB Fast Port (Integrated in tank cowl)" },
            { label: "Instrument Console", value: "Infinity Display with Gear Position, DTE & Clock" },
            { label: "Spark Plug", value: "Champion RG4HC or BOSCH UR4AC (Twin Plugs)" },
            { label: "Spark Plug Gap", value: "0.7 mm to 0.8 mm" }
          ]
        }
      ]
    },
    {
      id: "running_in",
      title: "Running-In Period (Break-in Guide)",
      subtitle: "Crucial first 2,000 km guidelines to ensure maximum engine longevity and power",
      iconName: "Gauge",
      category: "running_in",
      badge: "Crucial for New Engines",
      items: [
        {
          title: "First 1,000 km (Initial Run-in Phase)",
          details: "The first 1,000 km is the most critical period in the life of your motorcycle. Gentle operation allows machined surfaces of pistons, cylinder bore, gears, and bearings to polish into precise mating fit.",
          specs: [
            { label: "Maximum Speed (1st gear)", value: "15 km/h" },
            { label: "Maximum Speed (2nd gear)", value: "25 km/h" },
            { label: "Maximum Speed (3rd gear)", value: "40 km/h" },
            { label: "Maximum Speed (4th gear)", value: "55 km/h" },
            { label: "Maximum Speed (5th gear)", value: "70 km/h" },
            { label: "Engine RPM Ceiling", value: "Do not exceed 5,000 - 5,500 RPM" }
          ],
          warning: "Never rev the engine freely while in neutral or stationery. Avoid wide open throttle (WOT) acceleration and heavy towing during this initial stage."
        },
        {
          title: "1,000 km to 2,000 km (Secondary Break-in Phase)",
          details: "Gradually build up engine load and rpm without sustaining top speeds for prolonged durations.",
          specs: [
            { label: "Maximum Speed (5th gear)", value: "80 - 90 km/h" },
            { label: "Engine RPM Ceiling", value: "Up to 7,000 RPM intermittently" }
          ],
          tip: "Vary the engine speed regularly during rides rather than riding at a fixed steady speed on long straight highways. This loads and unloads the piston rings evenly."
        },
        {
          title: "Mandatory 1st Service at 750 km (or 30 - 45 Days)",
          details: "The initial oil contains microscopic metallic shavings worn off during break-in. Draining this oil and installing a fresh genuine filter at 750 km is mandatory to protect internal tolerances.",
          tip: "Check engine idle RPM (1,400 ± 100 RPM) and chain tension during the 1st workshop service."
        }
      ]
    },
    {
      id: "maintenance_schedule",
      title: "Periodic Maintenance Schedule & Tasks",
      subtitle: "Service intervals, mandatory checks, and itemized workshop operations",
      iconName: "Wrench",
      category: "maintenance",
      badge: "Factory Intervals",
      items: [
        {
          title: "Service Milestones Matrix",
          details: "Follow these periodic intervals faithfully or whichever comes first (distance vs calendar time):",
          specs: [
            { label: "1st Free Service", value: "750 km (or 30-45 days)" },
            { label: "2nd Free Service", value: "2,500 km (or 120 days / 4 months)" },
            { label: "3rd Free Service", value: "5,000 km (or 240 days / 8 months)" },
            { label: "4th Paid Service", value: "7,500 km (or 360 days / 12 months)" },
            { label: "5th Paid Service", value: "10,000 km (or 15 months)" },
            { label: "Subsequent Routine Services", value: "Every 2,500 km or 4 months thereafter" }
          ]
        },
        {
          title: "Component Replacement Intervals",
          details: "Factory recommended replacement cycles for wear parts and safety items:",
          specs: [
            { label: "Engine Oil", value: "Replace every 2,500 - 5,000 km (Top-up check weekly)" },
            { label: "Engine Oil Filter", value: "Replace every 5,000 km (Every alternate service)" },
            { label: "Air Filter Paper Element", value: "Clean every 2,500 km; Replace every 10,000 km" },
            { label: "Spark Plugs (Twin)", value: "Clean & regap at 5,000 km; Replace every 10,000 km" },
            { label: "Drive Chain & Sprockets", value: "Clean & lube every 500 km; Inspect slack; Replace ~20,000 km" },
            { label: "Brake Fluid (DOT 4)", value: "Replace completely every 15,000 km or 2 Years" },
            { label: "Front Fork Oil", value: "Replace every 20,000 km or 2 Years" },
            { label: "Valve Clearance (Tappets)", value: "Check & adjust at 1st service, then every 10,000 km" }
          ]
        },
        {
          title: "Drive Chain Cleaning & Lubrication Routine",
          details: "Pulsar N160 is equipped with an O-Ring / X-Ring drive chain. Proper care prevents stiff links, rust, and premature sprocket tooth wear.",
          specs: [
            { label: "Cleaning Frequency", value: "Every 500 km (or immediately after heavy rain/mud)" },
            { label: "Recommended Cleaner", value: "Motul C1, Kerosene, or O-ring safe degreaser" },
            { label: "Recommended Lubricant", value: "Dedicated O-ring chain spray (Motul C2, Yamalube, Wurth) or SAE 90 Gear Oil" },
            { label: "Drive Chain Slack", value: "25 mm to 30 mm vertical play at center of bottom run" }
          ],
          warning: "NEVER clean an O-ring chain with Petrol (Gasoline), diesel, or harsh thinners—it swells and destroys rubber O-rings. NEVER spray lube while the engine is running in gear."
        }
      ]
    },
    {
      id: "controls_console",
      title: "Controls, Switches & Digital Console",
      subtitle: "Instrument cluster features, ABS mode selection, switchgear and indicators",
      iconName: "Sliders",
      category: "controls",
      items: [
        {
          title: "Infinity Digital Instrument Cluster",
          details: "Edge-to-edge LCD screen displaying key vehicle telematics and diagnostics.",
          specs: [
            { label: "Gear Position Indicator", value: "Displays gears 1 through 5, and 'N' for Neutral" },
            { label: "DTE (Distance to Empty)", value: "Dynamic fuel range based on recent riding fuel economy" },
            { label: "Real-time Mileage (IFuel)", value: "Current instantaneous fuel consumption in km/L" },
            { label: "Average Fuel Economy (AFuel)", value: "Trip-based average consumption" },
            { label: "Dual Trip Meters", value: "Trip A and Trip B (with dedicated reset buttons)" },
            { label: "Service Reminder Spanner", value: "Illuminates 500 km prior to scheduled milestone" }
          ],
          tip: "To toggle between Trip A, Trip B, and ODO, press the 'M' (Mode) button. Press and hold 'S' (Set) button for 3 seconds to reset the selected trip meter."
        },
        {
          title: "ABS System Operation & Indicator Lamp",
          details: "Dual-Channel ABS prevents wheel lockup during emergency or hard braking on slippery surfaces.",
          specs: [
            { label: "ABS Indicator Lamp", value: "Blinks upon ignition ON, turns OFF once speed exceeds 5 km/h" },
            { label: "Steady Warning Light", value: "If ABS light stays ON while riding, ABS is deactivated (manual brakes still work)" }
          ],
          warning: "ABS does NOT shorten braking distance in all conditions (e.g. deep loose gravel or sand). Always maintain a safe following distance."
        },
        {
          title: "Tank-Mounted USB Fast-Charge Port",
          details: "Equipped with a weather-sealed 5V 2.0A USB port near the fuel tank flap. Powers GPS smartphones and cameras.",
          warning: "Always close the rubber protective cap tightly during rain, washing, or wet conditions to prevent water ingress into electrical circuitry."
        }
      ]
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting & Quick Diagnostics",
      subtitle: "Solutions for common issues: no-start, rough idling, battery drain, and brake squeal",
      iconName: "HelpCircle",
      category: "troubleshooting",
      badge: "Quick Fix Guide",
      items: [
        {
          title: "Engine Does Not Crank (Starter Motor Silent)",
          details: "Common safety interlock or electrical causes:",
          specs: [
            { label: "Kill Switch", value: "Verify red Engine Kill switch on right handlebar is in 'RUN' position" },
            { label: "Side Stand Sensor", value: "If motorcycle is in gear, starter won't engage unless side stand is up AND clutch pulled in" },
            { label: "Gear Position", value: "Shift gearbox into 'N' (Neutral) so the green 'N' lamp glows" },
            { label: "Battery Voltage", value: "Check battery terminal tightness; low charge causes rapid relay clicking" }
          ]
        },
        {
          title: "Engine Cranks But Refuses to Fire / Start",
          details: "Fuel, spark, or sensor diagnostic checklist:",
          specs: [
            { label: "Fuel Pump Primer Sound", value: "Turn key ON; listen for high-pitched 2-second fuel pump whine inside tank" },
            { label: "Fuel Level", value: "Ensure tank has at least 2 litres of fresh petrol" },
            { label: "Spark Plug Caps", value: "Confirm both HT spark plug rubber caps are firmly seated onto plugs" },
            { label: "Rollover / Tilt Sensor", value: "If bike was tilted over, turn ignition OFF, wait 10 seconds, then switch ON" }
          ]
        },
        {
          title: "Poor Idling, Stalling, or Surging",
          details: "Engine idle speed is controlled by the electronic ECU stepper valve.",
          specs: [
            { label: "Factory Idle Speed", value: "1,400 ± 100 RPM (when engine reaches operating temperature)" },
            { label: "Dirty Air Filter", value: "Clogged paper element restricts air; clean or replace if ridden in dusty conditions" },
            { label: "Contaminated Fuel", value: "Water droplets in fuel tank cause sputtering under throttle" }
          ]
        },
        {
          title: "Front Brake Squeal or Spongy Lever",
          details: "Inspect pads and hydraulic circuit immediately.",
          specs: [
            { label: "Brake Pad Wear Limit", value: "Inspect wear grooves on pad friction lining; replace if under 1.5 mm" },
            { label: "Spongy Feel", value: "Air bubble in hydraulic line; bleed caliper and master cylinder with fresh DOT 4 fluid" }
          ]
        }
      ]
    },
    {
      id: "safe_riding",
      title: "Safety Rules, Washing & Long-Term Storage",
      subtitle: "Safe riding practices, correct bike washing methods, and winter/monsoon storage",
      iconName: "ShieldCheck",
      category: "safety",
      items: [
        {
          title: "Daily Pre-Ride Inspection (T-CLOCS)",
          details: "Conduct a 60-second inspection before every major ride:",
          specs: [
            { label: "Tyres", value: "Check tyre pressures & inspect for nails, cuts, or embedded stones" },
            { label: "Controls", value: "Smooth throttle return, free front brake and clutch levers" },
            { label: "Lights", value: "Headlamp, LED tail lamp, indicators, brake switches (both front and rear)" },
            { label: "Oil Level", value: "Check sight glass window on right crankcase with bike on center stand" },
            { label: "Chain", value: "Check chain slack (25-30 mm) and adequate wet lubrication" },
            { label: "Stands", value: "Side stand snaps up crisply with firm spring tension" }
          ]
        },
        {
          title: "Motorcycle Washing Best Practices",
          details: "Protect sensitive electronics and fuel injection sensors during washing.",
          warning: "NEVER blast high-pressure water jet directly at: Instrument meter console, fuel injection throttle body, ECU under seat, wheel hub bearings, radiator oil cooler fins, or exhaust silencer outlet.",
          tip: "Always cover the exhaust tail pipe with a plastic bag during washing. Immediately dry and lubricate the drive chain after every wash."
        },
        {
          title: "Long-Term Parking / Storage (Over 30 Days)",
          details: "If leaving the motorcycle parked for extended durations:",
          specs: [
            { label: "Fuel", value: "Fill tank to brim to prevent moisture condensation and tank interior rust" },
            { label: "Battery", value: "Disconnect negative (-) black battery terminal to prevent parasitic drain" },
            { label: "Tyres", value: "Park on center stand; ensure tyres do not rest on damp concrete floor" },
            { label: "Cover", value: "Use a breathable outdoor motorcycle cover; avoid non-breathable vinyl" }
          ]
        }
      ]
    }
  ]
};
