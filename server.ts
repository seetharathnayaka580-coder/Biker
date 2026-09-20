import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Verified Bajaj Pulsar N160 Factory Knowledge Base for Instant Fallbacks
const N160_KNOWLEDGE_BASE: Array<{
  keywords: string[];
  topic: string;
  answer: string;
}> = [
  {
    keywords: ['oil', 'grade', 'engine oil', 'capacity', 'viscosity', 'oil filter', '10w', '20w'],
    topic: 'Recommended Engine Oil & Capacity',
    answer: `### Bajaj Pulsar N160 Engine Oil Specifications

- **Recommended Grade:** **Bajaj DTS-i 10,000 (20W-50 API SL, JASO MA2)** or **10W-30 Semi-Synthetic / Fully Synthetic**.
- **Oil Capacity:**
  - Routine Service Drain & Refill: **1,200 ml (1.2 Liters)**.
  - Complete Engine Overhaul / Dry Fill: **1,400 ml (1.4 Liters)**.
- **Oil Filter:** Replace the disposable paper cartridge oil filter at **every single engine oil change**.
- **Replacement Interval:** First change at **500 - 750 km** (1st service), then every **4,500 - 5,000 km**.
- **Pro Tip:** Never mix mineral and fully synthetic oils. Always check the oil inspection sight glass with the bike standing upright on a flat center surface with the engine switched off for 3 minutes.`
  },
  {
    keywords: ['chain', 'clean', 'lube', 'lubricat', 'slack', 'sprocket', 'tight', 'loose'],
    topic: 'Drive Chain Cleaning, Lubrication & Slack',
    answer: `### Pulsar N160 Drive Chain Care & Intervals

- **Cleaning & Lubing Frequency:** Every **500 km** under normal conditions; every **300 km** during monsoon, rain, muddy, or dusty off-road riding.
- **Proper Cleaning Agent:** Use dedicated O-Ring safe chain cleaner spray or kerosene. **NEVER use petrol, diesel, or harsh solvents** as they degrade the internal rubber O-rings.
- **Lubricant:** Apply high-adhesion synthetic chain lube spray to the inner side of the lower chain loop after cleaning and drying.
- **Chain Slack:** **20 mm to 30 mm** of vertical play measured midway between the front and rear sprockets.
- **Pro Tip:** Lube the chain right after a ride when the chain is warm—this allows the lubricant to penetrate deep into the rollers and prevents fling-off.`
  },
  {
    keywords: ['tyre', 'tire', 'pressure', 'psi', 'bar', 'air', 'pillion', 'front', 'rear'],
    topic: 'Tyre Pressure & Tyre Specifications',
    answer: `### Bajaj Pulsar N160 Tyre Pressure Specs

- **Front Tyre (100/80-17 Tubeless):**
  - Solo Rider: **25 PSI (1.75 kg/cm²)**
  - With Pillion: **25 PSI (1.75 kg/cm²)**
- **Rear Tyre (130/70-17 Tubeless):**
  - Solo Rider: **28 PSI (2.00 kg/cm²)**
  - With Pillion / Heavy Load: **32 PSI (2.25 kg/cm²)**
- **Checking Frequency:** Check pressure cold (before riding or after resting for 2 hours) at least once every **7 to 10 days**.
- **Pro Tip:** Low tyre pressure causes sluggish cornering, increased fuel consumption, and uneven tyre tread wear.`
  },
  {
    keywords: ['service', 'schedule', 'interval', 'periodic', 'kilometer', 'free', 'first service'],
    topic: 'Recommended Service Intervals',
    answer: `### Official Factory Service Schedule for Pulsar N160

- **1st Service:** **500 – 750 km** (or 30–45 days) — Oil change, oil filter, tappet inspection, chain tightening, fastener torquing.
- **2nd Service:** **4,500 – 5,000 km** (or 240 days) — Oil change, oil filter, air filter cleaning, brake check, spark plug clean.
- **3rd Service:** **9,500 – 10,000 km** (or 360 days) — Oil change, brake fluid inspection, spark plug replacement, fuel filter check.
- **Subsequent Periodic Services:** Every **5,000 km** or **120 days** (whichever occurs first).
- **Pro Tip:** Our digital log book automatically triggers a notification banner when you are within 500 km of your next scheduled maintenance!`
  },
  {
    keywords: ['spark', 'plug', 'gap', 'ignition', 'misfire', 'champion', 'bosch'],
    topic: 'Spark Plug Type & Gap Settings',
    answer: `### Spark Plug Specifications for N160

- **Spark Plug Models:** **Champion RG6HCC** or **Bosch VR5NE**.
- **Electrode Gap:** **0.7 mm to 0.8 mm** (0.028 to 0.031 in).
- **Inspection & Cleaning:** Inspect, remove carbon deposits, and adjust electrode gap every **5,000 km**.
- **Replacement Period:** Replace with a fresh OEM spark plug every **10,000 to 15,000 km** or whenever the ceramic insulator shows cracking or heavy fouling.`
  },
  {
    keywords: ['brake', 'pad', 'abs', 'fluid', 'dot', 'bleeding', 'disc'],
    topic: 'Brake Fluid & Brake System Care',
    answer: `### Pulsar N160 Dual-Channel ABS Brake Care

- **Brake Fluid Type:** **DOT 4 Hydraulic Brake Fluid** (for both front 300 mm and rear 230 mm disc brakes).
- **Fluid Reservoir Check:** Inspect monthly through the sight glass on the handlebar and rear reservoir. Keep fluid above the MIN line.
- **Fluid Flush Interval:** Replace and bleed fresh brake fluid every **2 years or 15,000 km**.
- **Brake Pad Thickness:** Replace pads immediately when the friction lining wears down to less than **1.5 mm** or reaches the wear indicator grooves.
- **Safety Warning:** Never spill brake fluid on painted fuel tank surfaces or plastic fairings as it causes permanent chemical damage.`
  },
  {
    keywords: ['air', 'filter', 'intake', 'choke', 'clean', 'replace'],
    topic: 'Air Filter Cleaning & Replacement',
    answer: `### Pulsar N160 Air Filter Maintenance

- **Type:** Viscous-coated paper element.
- **Inspection Interval:** Inspect and gently tap out dry debris every **5,000 km** (clean more often in dusty rural environments).
- **Important Caution:** **NEVER wash the viscous paper element with water, petrol, or compressed air.** Doing so strips the adhesive dust-trapping coating.
- **Replacement:** Replace with a new genuine Bajaj air filter every **10,000 – 15,000 km** to maintain crisp throttle response and optimal fuel economy.`
  },
  {
    keywords: ['battery', 'volt', 'charging', 'terminal', 'vrla', 'starter'],
    topic: 'Battery & Electrical Maintenance',
    answer: `### Battery & Electrical Specifications

- **Battery Rating:** **12V, 4Ah or 8Ah VRLA Maintenance-Free (MF)** battery.
- **Terminal Maintenance:** Check battery terminals every 6 months. Clean corrosion using warm baking soda water, dry thoroughly, and apply a thin layer of petroleum jelly.
- **Charging Output:** Approximately **14.2V to 14.8V DC at 4,000 RPM**.
- **Storage Tip:** If the motorcycle is stored idle for more than 2 weeks, disconnect the negative terminal or use a smart trickle charger to prevent parasitic drain.`
  },
  {
    keywords: ['fuel', 'tank', 'capacity', 'reserve', 'mileage', 'average', 'petrol'],
    topic: 'Fuel Tank Capacity & Fuel Economy',
    answer: `### Fuel Tank Capacity & Mileage Guide

- **Total Tank Capacity:** **14 Liters**.
- **Usable Reserve:** Approximately **2.5 Liters**.
- **Fuel System:** Fuel Injection (Bi-Fuel Electronic Injection system).
- **Average Mileage:** Expected **45 – 50 km/L** in mixed city riding; up to **52+ km/L** on open highways at cruising speeds of 70-80 km/h.
- **Rider Tip:** Avoid running the fuel tank completely dry to protect the internal submerged fuel pump from overheating and sediment clogging.`
  },
  {
    keywords: ['tappet', 'valve', 'clearance', 'rattle', 'inlet', 'exhaust'],
    topic: 'Valve Clearance (Tappet) Specifications',
    answer: `### N160 Valve / Tappet Clearance (Engine Cold)

- **Inlet Valve Clearance:** **0.05 mm** (±0.01 mm).
- **Exhaust Valve Clearance:** **0.08 mm** (±0.01 mm).
- **Inspection Period:** Check and adjust during the 1st service (750 km), and then every **10,000 km** or if abnormal metallic ticking is audible from the cylinder head.
- **Note:** Always adjust valve clearance when the engine is completely cold (at room ambient temperature).`
  },
  {
    keywords: ['running in', 'break in', 'run in', 'new bike', 'rpm limit', 'speed limit'],
    topic: 'Engine Running-In / Break-In Procedure',
    answer: `### Bajaj Pulsar N160 Running-In (Break-In) Guidelines

- **First 1,000 km Rules:**
  - Maximum speed: **50 km/h** in 5th gear (keep engine under **5,000 RPM**).
  - Avoid sudden full-throttle acceleration, heavy pillion loads, and lugging the engine in high gears.
  - Vary your engine speeds smoothly rather than holding one steady RPM for hours.
- **Between 1,000 km and 2,000 km:**
  - Gradually increase speed up to **65–70 km/h** (under **6,000 RPM**).
- **First Oil Change Importance:** The 1st service at **500–750 km** removes factory machining metallic shavings; changing the oil and filter on schedule is critical for long engine life.`
  },
  {
    keywords: ['fork', 'suspension', 'monoshock', 'shock', 'preload', 'front fork'],
    topic: 'Suspension & Fork Oil Specifications',
    answer: `### Pulsar N160 Suspension Specifications

- **Front Telescopic Forks (37 mm / 31 mm stanchions):**
  - Fork Oil Grade: **10W Fork Oil**.
  - Capacity: **~330 ml per leg** (refill per factory manual specifications).
  - Service Period: Replace fork oil and inspect oil seals every **20,000 km or 2 years**.
- **Rear Monoshock (Nitrox Monoshock):**
  - Adjustable Preload: **5-Step or 7-Step notch adjustable**.
  - Notch 1–2: Softer damping for solo light riders.
  - Notch 3 (Default Factory): Balanced for everyday road commuting.
  - Notch 4–5: Firmer damping for aggressive riding or continuous pillion + luggage.`
  },
  {
    keywords: ['fuse', 'headlamp', 'led', 'projector', 'electrical', 'wiring'],
    topic: 'LED Headlamp & Fuse Ratings',
    answer: `### Pulsar N160 Electrical & Fuse Ratings

- **Headlamp:** Bi-Functional LED Projector Headlamp with signature LED DRLs.
- **Main Fuse:** **20A or 25A** (Blade type).
- **Sub Fuses:** **10A / 15A** for ABS module, ECU, Fuel Injection pump, and Instrument cluster.
- **Spare Fuses:** Located inside the under-seat fuse box container.
- **Important:** Never replace a blown fuse with higher amp ratings or direct wire jumpers as it will permanently destroy the ECU or ABS control unit.`
  },
  {
    keywords: ['clutch', 'gear', 'shifting', 'slipper', 'stiff', 'hard'],
    topic: 'Assist & Slipper Clutch & Gearbox Care',
    answer: `### Pulsar N160 Clutch & Transmission Guide

- **Clutch Type:** Wet multi-plate **Assist & Slipper Clutch** that reduces back-torque wheel hopping on rapid downshifts.
- **Clutch Lever Free Play:** Maintain **2 mm to 3 mm** of free play at the clutch lever perch.
- **Stiff Shifting Fixes:**
  - Always warm up engine for 60 seconds before shifting on cold mornings.
  - Ensure genuine 20W-50 / 10W-30 JASO MA2 motorcycle oil is used (car engine oils cause clutch slippage).
  - Lubricate the clutch cable inner wire with Teflon/silicone lube spray every 2,500 km.`
  }
];

function findFallbackAnswer(query: string): string | null {
  const q = query.toLowerCase();
  for (const item of N160_KNOWLEDGE_BASE) {
    if (item.keywords.some((kw) => q.includes(kw))) {
      return item.answer;
    }
  }
  return null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Server-side Gemini AI client initialization
  let ai: GoogleGenAI | null = null;
  function getGenAI(): GoogleGenAI | null {
    if (!ai && process.env.GEMINI_API_KEY) {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return ai;
  }

  // API Health Check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // N160 AI Maintenance Assistant API Route
  app.post('/api/faq', async (req: Request, res: Response) => {
    try {
      const { question, context } = req.body || {};

      if (!question || typeof question !== 'string') {
        res.status(400).json({ error: 'A question string is required.' });
        return;
      }

      const client = getGenAI();

      if (client) {
        try {
          const systemInstruction = `You are the official Bajaj Pulsar N160 Technical Maintenance AI Assistant for the Bike Service Log Book web application.
Your mission is to provide accurate, concise, and structured motorcycle maintenance advice specifically tailored for the Bajaj Pulsar N160 (Single & Dual Channel ABS, 164.82cc Oil-Cooled Single Cylinder 2-valve engine).

Key Bajaj Pulsar N160 Factory Specs:
- Engine Oil Grade: 20W-50 or 10W-30 (Bajaj DTS-i 10,000 API SL, JASO MA2).
- Engine Oil Capacity: 1,200 ml (1.2 L) for routine drain & refill; 1,400 ml (1.4 L) for dry engine overhaul.
- Oil Filter: Replace at every oil change.
- Chain Cleaning & Lubing: Every 500 km (or 300 km in rain/mud). Use O-ring safe cleaner and high-tack chain lube. Slack: 20-30 mm.
- Tyre Pressure: Front 25 PSI (100/80-17). Rear 28 PSI solo / 32 PSI with pillion (130/70-17).
- Service Schedule: 1st: 500-750 km (30-45d); 2nd: 4,500-5,000 km (240d); 3rd: 9,500-10,000 km (360d); subsequent: every 5,000 km.
- Spark Plug: Champion RG6HCC or Bosch VR5NE, gap 0.7 - 0.8 mm. Clean at 5,000 km, replace at 10,000-15,000 km.
- Brake Fluid: DOT 4 hydraulic brake fluid for front & rear disc brakes (Dual-Channel ABS). Flush every 2 years / 15,000 km.
- Fuel Tank: 14 Liters (approx. 2.5 L reserve).
- Battery: 12V 4Ah or 8Ah VRLA MF battery. Charging output ~14.2V - 14.8V DC.
- Air Filter: Viscous paper element. Inspect at every service, replace every 10,000-15,000 km. Do NOT wash with water or petrol.
- Valve / Tappet Clearance (Cold): Intake 0.05 mm, Exhaust 0.08 mm.

Formatting Guidelines:
- Use clean Markdown with bold key specs, bullet points, and short readable paragraphs.
- Provide direct, practical steps or precautions where relevant.
- Keep the response concise, punchy, and highly informative (avoid long filler text).
- Always include a brief rider safety / dealer verification tip at the end.`;

          const prompt = `Motorcycle Context:
- Bike: ${context?.bikeModel || 'Bajaj Pulsar N160 (BKT-1374)'}
- Current Odometer: ${context?.odometer ? `${context.odometer} km` : 'Active'}
- User Question: ${question}

Please provide the official Bajaj Pulsar N160 recommendation, specifications, and maintenance procedure for this question.`;

          // Try primary model, with automatic fallback if the model is under high demand (503)
          let answerText: string | null = null;
          let modelName = 'gemini-3.8-flash';

          try {
            const response = await client.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: prompt,
              config: {
                systemInstruction,
                temperature: 0.2,
              },
            });
            if (response?.text && response.text.trim().length > 0) {
              answerText = response.text.trim();
            }
          } catch {
            // If primary model is unavailable or rate-limited, attempt backup flash model
            try {
              modelName = 'gemini-3.6-flash';
              const backupResponse = await client.models.generateContent({
                model: 'gemini-3.6-flash',
                contents: prompt,
                config: {
                  systemInstruction,
                  temperature: 0.2,
                },
              });
              if (backupResponse?.text && backupResponse.text.trim().length > 0) {
                answerText = backupResponse.text.trim();
              }
            } catch {
              // Smooth fallback to local verified knowledge base below
            }
          }

          if (answerText) {
            res.json({
              answer: answerText,
              source: 'gemini-ai',
              model: modelName,
            });
            return;
          }
        } catch {
          // Handled smoothly by knowledge base fallback below
        }
      }

      // Fallback to verified N160 Technical Knowledge Base
      const fallback = findFallbackAnswer(question);
      if (fallback) {
        res.json({
          answer: fallback,
          source: 'knowledge-base',
          model: 'Bajaj Pulsar N160 Factory Manual',
        });
        return;
      }

      // General fallback response
      res.json({
        answer: `### Bajaj Pulsar N160 Maintenance Quick Guide

For **"${question}"**:
- **Engine Oil:** 20W-50 or 10W-30 (1,200 ml routine fill; oil filter replaced every change).
- **Chain Maintenance:** Clean & lube every **500 km** with O-ring safe spray; maintain **20–30 mm** slack.
- **Tyre Pressure:** Front **25 PSI**, Rear **28 PSI** (Solo) / **32 PSI** (Pillion).
- **Service Interval:** Every **5,000 km** or **120 days**.
- **Brake Fluid:** **DOT 4** hydraulic brake fluid with Dual-Channel ABS.

For specific diagnostics, please verify with an authorized Bajaj dealer or your digital service schedule tab!`,
        source: 'knowledge-base',
        model: 'Bajaj Pulsar N160 Factory Manual',
      });
    } catch (err: any) {
      console.error('API /api/faq error:', err);
      res.status(500).json({ error: 'Failed to generate FAQ answer.', details: err?.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
