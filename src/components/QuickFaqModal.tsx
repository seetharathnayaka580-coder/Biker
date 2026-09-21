import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  HelpCircle,
  X,
  Send,
  Loader2,
  Copy,
  Check,
  Droplets,
  RotateCcw,
  Zap,
  Gauge,
  Wrench,
  ShieldCheck,
  Disc,
  Info,
  ExternalLink,
  Search,
  Fuel,
  Cpu,
  Sliders,
  RefreshCw,
  MessageSquare,
  ArrowRight,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  BookmarkPlus,
  Share2,
  AlertTriangle,
  CheckCircle2,
  Flame,
  ChevronRight,
  BookOpen,
  Clock,
  Bot,
  SlidersHorizontal,
  Key,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AppState, MaintenanceNote, NoteCategory } from '../types';

export interface QuickFaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  initialQuestion?: string | null;
  onNavigateToSchedule?: () => void;
  onOpenUserManual?: () => void;
  onAddNote?: (note: MaintenanceNote) => void;
}

export type AiEngine = 'gemini' | 'chatgpt';

export type FaqCategory =
  | 'all'
  | 'engine'
  | 'chain'
  | 'tyres'
  | 'brakes'
  | 'electrical'
  | 'schedule';

export interface CommonQuestion {
  id: string;
  category: FaqCategory;
  categoryLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  query: string;
  hint: string;
  colorClass: string;
  followUps?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: 'gemini-ai' | 'chatgpt-ai' | 'knowledge-base';
  model?: string;
  engine?: AiEngine;
  followUps?: string[];
}

export const COMMON_QUESTIONS: CommonQuestion[] = [
  // Engine & Oil
  {
    id: 'oil',
    category: 'engine',
    categoryLabel: 'Engine & Oil',
    icon: Droplets,
    label: 'Recommended Oil Grade & Capacity',
    query: 'What is the recommended engine oil grade, viscosity, and oil capacity for the Bajaj Pulsar N160?',
    hint: 'Bajaj DTS-i 20W-50 / 10W-30, 1.2L drain volume',
    colorClass: 'from-amber-500/20 to-yellow-500/10 text-amber-300 border-amber-500/30 hover:border-amber-400',
    followUps: [
      'How often should I change the oil filter on Pulsar N160?',
      'Can I use fully synthetic 10W-40 oil in Pulsar N160?',
      'What happens if I delay the engine oil change past 5000 km?',
    ],
  },
  {
    id: 'oil-filter',
    category: 'engine',
    categoryLabel: 'Engine & Oil',
    icon: Wrench,
    label: 'Oil Filter Replacement Schedule',
    query: 'How often should the oil filter be replaced on Bajaj Pulsar N160 and can it be cleaned with petrol?',
    hint: 'Replace every oil change; disposable paper cartridge',
    colorClass: 'from-amber-500/20 to-orange-500/10 text-amber-300 border-amber-500/30 hover:border-amber-400',
    followUps: [
      'What is the part number and price for genuine N160 oil filter?',
      'What are the symptoms of a clogged oil filter?',
    ],
  },
  {
    id: 'break-in',
    category: 'engine',
    categoryLabel: 'Engine & Oil',
    icon: Cpu,
    label: 'Running-In (Break-In) Procedure',
    query: 'What is the factory recommended engine break-in (running-in) RPM and speed limits for a new Pulsar N160?',
    hint: 'First 1,000 km rules, 50 km/h max, under 5000 RPM',
    colorClass: 'from-yellow-500/20 to-amber-500/10 text-yellow-300 border-yellow-500/30 hover:border-yellow-400',
    followUps: [
      'Why is the 1st service at 750 km so important for N160?',
      'Can I take a pillion passenger during the engine break-in period?',
    ],
  },
  {
    id: 'tappet',
    category: 'engine',
    categoryLabel: 'Engine & Oil',
    icon: Sliders,
    label: 'Valve (Tappet) Clearance Specs',
    query: 'What are the intake and exhaust valve tappet clearances and when to adjust them on Bajaj Pulsar N160?',
    hint: 'Inlet 0.05 mm, Exhaust 0.08 mm (cold engine)',
    colorClass: 'from-amber-500/20 to-rose-500/10 text-amber-300 border-amber-500/30 hover:border-amber-400',
    followUps: [
      'What does loose vs tight tappet sound like on N160?',
      'How to adjust tappets when the engine is warm?',
    ],
  },

  // Drive Chain & Sprocket
  {
    id: 'chain',
    category: 'chain',
    categoryLabel: 'Drive Chain',
    icon: RotateCcw,
    label: 'Chain Cleaning & Lube Intervals',
    query: 'What is the recommended chain cleaning and lubrication interval, correct slack, and proper cleaner for Pulsar N160?',
    hint: 'Every 500 km, 20-30 mm vertical slack, O-ring safe',
    colorClass: 'from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/30 hover:border-emerald-400',
    followUps: [
      'Can I clean an O-ring chain with diesel or kerosene?',
      'How to measure chain slack correctly with rider on bike?',
      'What are the signs that chain & sprockets need replacement?',
    ],
  },
  {
    id: 'chain-slack',
    category: 'chain',
    categoryLabel: 'Drive Chain',
    icon: Sliders,
    label: 'Chain Slack Adjustment Procedure',
    query: 'How do I adjust drive chain tension on the Bajaj Pulsar N160 and what is the rear axle nut torque?',
    hint: 'Rear axle 90-100 Nm, swingarm adjuster notch alignment',
    colorClass: 'from-emerald-500/20 to-green-500/10 text-emerald-300 border-emerald-500/30 hover:border-emerald-400',
    followUps: [
      'What happens if the chain is adjusted too tightly?',
      'How to check if the rear wheel is aligned after chain adjustment?',
    ],
  },
  {
    id: 'sprocket',
    category: 'chain',
    categoryLabel: 'Drive Chain',
    icon: Wrench,
    label: 'Sprocket Wear & Life Expectancy',
    query: 'What is the typical lifespan of the drive chain and sprocket kit on Bajaj Pulsar N160 and how to spot shark-fin wear?',
    hint: 'Expected 18,000 - 25,000 km with routine lubing',
    colorClass: 'from-teal-500/20 to-cyan-500/10 text-teal-300 border-teal-500/30 hover:border-teal-400',
    followUps: [
      'Should I change chain and sprockets together as a kit?',
      'Which brand makes OEM chain for Bajaj Pulsar N160?',
    ],
  },

  // Tyres & Suspension
  {
    id: 'tyre',
    category: 'tyres',
    categoryLabel: 'Tyres & Suspension',
    icon: Gauge,
    label: 'Tyre Pressure (Solo vs Pillion)',
    query: 'What are the correct front and rear tyre pressures for the Bajaj Pulsar N160 for solo riding and with a pillion passenger?',
    hint: 'Front: 25 PSI | Rear: 28 PSI (Solo) / 32 PSI (Pillion)',
    colorClass: 'from-sky-500/20 to-blue-500/10 text-sky-300 border-sky-500/30 hover:border-sky-400',
    followUps: [
      'What are the stock tyre dimensions on Pulsar N160?',
      'How often should tyre pressure be checked?',
      'Can I upgrade to a 140/70-17 rear tyre on Pulsar N160?',
    ],
  },
  {
    id: 'fork-oil',
    category: 'tyres',
    categoryLabel: 'Tyres & Suspension',
    icon: Droplets,
    label: 'Front Fork Oil Grade & Capacity',
    query: 'What is the front telescopic fork oil grade, quantity per leg, and replacement interval for Bajaj Pulsar N160?',
    hint: '10W fork oil, ~330 ml per leg, replace at 20,000 km',
    colorClass: 'from-sky-500/20 to-indigo-500/10 text-sky-300 border-sky-500/30 hover:border-sky-400',
    followUps: [
      'What are the symptoms of blown fork oil seals on N160?',
      'Does N160 come with USD forks or conventional forks?',
    ],
  },
  {
    id: 'monoshock',
    category: 'tyres',
    categoryLabel: 'Tyres & Suspension',
    icon: Sliders,
    label: 'Rear Monoshock Preload Settings',
    query: 'How to adjust the rear Nitrox monoshock preload on Bajaj Pulsar N160 for better pillion comfort or sporty cornering?',
    hint: 'Multi-step notch adjuster with C-spanner',
    colorClass: 'from-blue-500/20 to-cyan-500/10 text-blue-300 border-blue-500/30 hover:border-blue-400',
    followUps: [
      'Which notch is best for daily city commuting on bad roads?',
      'Can monoshock gas pressure be recharged?',
    ],
  },

  // Brakes & ABS
  {
    id: 'brake',
    category: 'brakes',
    categoryLabel: 'Brakes & ABS',
    icon: Disc,
    label: 'Brake Fluid Grade & ABS Bleeding',
    query: 'What brake fluid grade does the Pulsar N160 Dual-Channel ABS use and what is the bleeding interval?',
    hint: 'DOT 4 fluid, flush every 2 years / 20,000 km',
    colorClass: 'from-orange-500/20 to-red-500/10 text-orange-300 border-orange-500/30 hover:border-orange-400',
    followUps: [
      'Can I mix DOT 3 and DOT 4 brake fluid in N160?',
      'Why does the ABS light stay on when starting the bike?',
      'What is the minimum brake pad thickness before replacement?',
    ],
  },
  {
    id: 'brake-pads',
    category: 'brakes',
    categoryLabel: 'Brakes & ABS',
    icon: ShieldCheck,
    label: 'Brake Pad Wear Limit & Squeaking',
    query: 'What is the minimum brake pad lining thickness on Pulsar N160 and how to fix brake disc squeak noise?',
    hint: 'Replace when under 1.5 mm; clean with isopropyl alcohol',
    colorClass: 'from-red-500/20 to-rose-500/10 text-red-300 border-red-500/30 hover:border-red-400',
    followUps: [
      'Are organic or sintered brake pads recommended for N160?',
      'How to bleed dual channel ABS without dealer scanner?',
    ],
  },

  // Battery & Electrical
  {
    id: 'battery',
    category: 'electrical',
    categoryLabel: 'Battery & Electrical',
    icon: Zap,
    label: 'Battery Specs & Charging Voltage',
    query: 'What are the battery specifications, charging voltage, and trickle charging tips for Bajaj Pulsar N160?',
    hint: '12V VRLA Maintenance-Free, 14.2V - 14.8V charging output',
    colorClass: 'from-purple-500/20 to-violet-500/10 text-purple-300 border-purple-500/30 hover:border-purple-400',
    followUps: [
      'What to do if Pulsar N160 battery drains in 3 days?',
      'Can I jump-start Pulsar N160 with a car battery?',
    ],
  },
  {
    id: 'spark',
    category: 'electrical',
    categoryLabel: 'Battery & Electrical',
    icon: Zap,
    label: 'Spark Plug Gap & Replacement',
    query: 'What is the OEM spark plug type, electrode gap, and replacement schedule for Pulsar N160?',
    hint: 'Champion RG6HCC / Bosch VR5NE, gap 0.7 - 0.8 mm',
    colorClass: 'from-rose-500/20 to-pink-500/10 text-rose-300 border-rose-500/30 hover:border-rose-400',
    followUps: [
      'Can I upgrade to an Iridium spark plug in Pulsar N160?',
      'How to read spark plug color for lean or rich mixture?',
    ],
  },
  {
    id: 'fuses',
    category: 'electrical',
    categoryLabel: 'Battery & Electrical',
    icon: Cpu,
    label: 'LED Headlamp & Fuse Box Ratings',
    query: 'What are the main and sub fuse ratings in the Bajaj Pulsar N160 fuse box and what bulb is used in headlamp?',
    hint: 'Bi-Functional LED projector, 20A main fuse, 10A/15A sub',
    colorClass: 'from-indigo-500/20 to-purple-500/10 text-indigo-300 border-indigo-500/30 hover:border-indigo-400',
    followUps: [
      'Where is the spare fuse located on Pulsar N160?',
      'Can I adjust the LED projector beam angle height?',
    ],
  },

  // Service Schedule & Mileage
  {
    id: 'service',
    category: 'schedule',
    categoryLabel: 'Service & Mileage',
    icon: Wrench,
    label: 'Periodic Service Schedule & Intervals',
    query: 'What is the complete factory periodic maintenance schedule and km intervals for Bajaj Pulsar N160?',
    hint: '1st: 750 km; then every 5,000 km or 120 days',
    colorClass: 'from-purple-500/20 to-indigo-500/10 text-purple-300 border-purple-500/30 hover:border-purple-400',
    followUps: [
      'What are the mandatory checklist items for 1st service?',
      'What is the estimated cost of 3rd paid service for N160?',
      'Does skipping scheduled service void the Bajaj warranty?',
    ],
  },
  {
    id: 'mileage',
    category: 'schedule',
    categoryLabel: 'Service & Mileage',
    icon: Fuel,
    label: 'Real Mileage & Fuel Economy Tips',
    query: 'What is the real-world mileage of Bajaj Pulsar N160 and how can I maximize fuel efficiency?',
    hint: 'City: 45-48 km/L | Highway: 50-54 km/L, 14L tank',
    colorClass: 'from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/30 hover:border-emerald-400',
    followUps: [
      'How much fuel is left when the reserve fuel icon blinks?',
      'Is Pulsar N160 compatible with E20 blended petrol?',
    ],
  },
  {
    id: 'clutch',
    category: 'schedule',
    categoryLabel: 'Service & Mileage',
    icon: RotateCcw,
    label: 'Assist & Slipper Clutch Adjustment',
    query: 'How to adjust clutch lever free play on Pulsar N160 and troubleshoot hard gear shifting?',
    hint: 'Maintain 2-3 mm lever free play, wet multi-plate slipper clutch',
    colorClass: 'from-amber-500/20 to-yellow-500/10 text-amber-300 border-amber-500/30 hover:border-amber-400',
    followUps: [
      'What causes false neutrals between 1st and 2nd gear?',
      'How does an assist and slipper clutch work on Pulsar N160?',
    ],
  },
];

const CATEGORY_TABS: Array<{ id: FaqCategory; label: string }> = [
  { id: 'all', label: 'All Questions' },
  { id: 'engine', label: 'Engine & Oil' },
  { id: 'chain', label: 'Drive Chain' },
  { id: 'tyres', label: 'Tyres & Suspension' },
  { id: 'brakes', label: 'Brakes & ABS' },
  { id: 'electrical', label: 'Electrical & Spark' },
  { id: 'schedule', label: 'Service & Mileage' },
];

// Quick Diagnostic Action Buttons
const QUICK_ACTION_PROMPTS = [
  {
    id: 'diagnose-sound',
    title: 'Diagnose Sound / Vibration',
    subtitle: 'Tappet, chain slap, knock',
    prompt: 'My Bajaj Pulsar N160 is making an unusual noise or vibration. How can I diagnose whether it is coming from the valve tappets, drive chain slap, cam chain tensioner, or engine bearings?',
    icon: Wrench,
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  {
    id: 'history-health',
    title: 'Analyze Service History',
    subtitle: 'Health score & checks',
    prompt: 'Please analyze my motorcycle service history, current odometer reading, and upcoming target. Give me a comprehensive bike health grade (A/B/C) and a customized checklist of what should be inspected next.',
    icon: ShieldCheck,
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  {
    id: 'oil-calc',
    title: 'Next Oil Change Checklist',
    subtitle: 'Grade, filter, volume',
    prompt: 'Based on my current odometer reading, when is my next engine oil and filter change due? What is the exact DTS-i oil specification, drain volume, and oil filter part procedure for Pulsar N160?',
    icon: Droplets,
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  },
  {
    id: 'battery-check',
    title: 'Starting & Battery Issues',
    subtitle: 'Cold start, relay, voltage',
    prompt: 'My Pulsar N160 is having starting troubles (clicking starter relay or slow crank). How do I check battery terminal voltage, charging output at 4,000 RPM, and troubleshoot parasitic drain?',
    icon: Zap,
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  },
  {
    id: 'mileage-boost',
    title: 'Boost Fuel Mileage',
    subtitle: 'Tyre PSI, spark, filters',
    prompt: 'How can I maximize fuel economy on my Pulsar N160? Give me actionable tips regarding tyre pressure, spark plug health, air filter cleanliness, and riding habits to get 50+ km/L.',
    icon: Fuel,
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
  },
  {
    id: 'brake-squeal',
    title: 'Brake Noise & Spongy Lever',
    subtitle: 'DOT 4 fluid, pads, ABS',
    prompt: 'My front or rear disc brake on Pulsar N160 feels spongy or makes a high-pitched squeal. What causes this, how do I inspect the 1.5mm pad wear limit, and how to properly clean the discs?',
    icon: Disc,
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  },
];

// Helper to extract follow-up items from AI markdown
function extractFollowUps(markdown: string): { cleanContent: string; followUps: string[] } {
  const followUpMarker = '### Suggested Follow-Ups';
  const markerIndex = markdown.indexOf(followUpMarker);

  if (markerIndex === -1) {
    return { cleanContent: markdown, followUps: [] };
  }

  const cleanContent = markdown.substring(0, markerIndex).trim();
  const followUpSection = markdown.substring(markerIndex + followUpMarker.length);
  const lines = followUpSection.split('\n');
  const followUps: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const q = trimmed.replace(/^[-*]\s+/, '').replace(/^\[|\]$/g, '').trim();
      if (q.length > 5 && q.length < 120) {
        followUps.push(q);
      }
    }
  }

  return { cleanContent, followUps: followUps.slice(0, 3) };
}

// Helper to render Markdown text with clean formatting
const FormattedMarkdown: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');

  return (
    <div className="space-y-2.5 text-zinc-300 text-xs sm:text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // H3 Header
        if (trimmed.startsWith('### ')) {
          return (
            <h4
              key={idx}
              className="text-white font-display font-bold text-sm sm:text-base pt-2 pb-1 border-b border-zinc-800 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{trimmed.replace('### ', '')}</span>
            </h4>
          );
        }

        // H4 / Bullet / Bold header
        if (trimmed.startsWith('#### ')) {
          return (
            <h5 key={idx} className="text-amber-300 font-semibold text-xs sm:text-sm pt-1">
              {trimmed.replace('#### ', '')}
            </h5>
          );
        }

        // Bullet point
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const itemText = trimmed.replace(/^[-*]\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
              <div className="flex-1">
                {parseInlineFormatting(itemText)}
              </div>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold flex items-center justify-center mt-0.5 shrink-0 border border-amber-500/30">
                {numMatch[1]}
              </span>
              <div className="flex-1">
                {parseInlineFormatting(numMatch[2])}
              </div>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={idx}>
            {parseInlineFormatting(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

// Parse inline **bold**, *italic*, and `code` markers
function parseInlineFormatting(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-white font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="text-amber-200 not-italic font-medium">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded bg-zinc-800/90 text-amber-300 font-mono text-[11px] border border-zinc-700/60"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export const QuickFaqModal: React.FC<QuickFaqModalProps> = ({
  isOpen,
  onClose,
  state,
  initialQuestion,
  onNavigateToSchedule,
  onOpenUserManual,
  onAddNote,
}) => {
  const [activeView, setActiveView] = useState<'chat' | 'specs'>('chat');
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  // AI Engine Selection: 'gemini' (Free Google Gemini Flash) or 'chatgpt' (Free OpenAI ChatGPT)
  const [selectedEngine, setSelectedEngine] = useState<AiEngine>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pulsar_ai_engine');
      if (saved === 'chatgpt' || saved === 'gemini') return saved;
    }
    return 'gemini';
  });

  const [customOpenAiKey, setCustomOpenAiKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pulsar_custom_openai_key') || '';
    }
    return '';
  });

  const [showEngineSettings, setShowEngineSettings] = useState<boolean>(false);
  const [keyInputVal, setKeyInputVal] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pulsar_custom_openai_key') || '';
    }
    return '';
  });
  const [showKeyText, setShowKeyText] = useState<boolean>(false);
  const [keySavedToast, setKeySavedToast] = useState<boolean>(false);

  const handleSelectEngine = (engine: AiEngine) => {
    setSelectedEngine(engine);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pulsar_ai_engine', engine);
    }
  };

  const handleSaveOpenAiKey = () => {
    const trimmed = keyInputVal.trim();
    setCustomOpenAiKey(trimmed);
    if (typeof window !== 'undefined') {
      if (trimmed) {
        localStorage.setItem('pulsar_custom_openai_key', trimmed);
      } else {
        localStorage.removeItem('pulsar_custom_openai_key');
      }
    }
    setKeySavedToast(true);
    setTimeout(() => setKeySavedToast(false), 2500);
  };

  // Initial welcome message with motorcycle context
  const targetKm = state.targets[0] || 7688;
  const remainingKm = targetKm - state.odometer;
  const isOverdue = remainingKm <= 0;
  const isDueSoon = remainingKm > 0 && remainingKm <= 500;

  const defaultWelcomeMessage: ChatMessage = useMemo(() => {
    const statusNotice = isOverdue
      ? `🚨 **Service is currently overdue by ${Math.abs(remainingKm).toLocaleString()} km!**`
      : isDueSoon
      ? `🔔 **Upcoming service due in ${remainingKm.toLocaleString()} km!**`
      : `✅ **Motorcycle is up to date (${remainingKm.toLocaleString()} km until target).**`;

    return {
      id: 'welcome-msg',
      role: 'assistant',
      content: `### Welcome to Pulsar MechAI Diagnostic Center

Hello! I am your official **Bajaj Pulsar N160 AI Master Mechanic**, equipped with **Free Google Gemini Flash & ChatGPT AI**.

**Active Motorcycle Status:**
- **Bike:** ${state.vehicle.model || 'Bajaj Pulsar N160'} (${state.vehicle.regNo || 'BKT-1374'})
- **Current Odometer:** **${state.odometer.toLocaleString()} km**
- **Next Service Target:** **${targetKm.toLocaleString()} km**
- **Status:** ${statusNotice}
- **Logged Services:** **${state.services.length} records** on file
- **Active Engine:** ${selectedEngine === 'chatgpt' ? '🤖 OpenAI ChatGPT 4o-Mini (Free)' : '✨ Google Gemini Flash (Free)'}

Ask me anything about troubleshooting symptoms, unusual sounds, oil grades, chain adjustments, tyre pressures, or tap any diagnostic button below to start!`,
      timestamp: 'Just now',
      source: selectedEngine === 'chatgpt' ? 'chatgpt-ai' : 'gemini-ai',
      model: selectedEngine === 'chatgpt' ? 'ChatGPT (Free)' : 'Gemini Flash (Free)',
      engine: selectedEngine,
      followUps: [
        'When is my next oil change and what grade should I use?',
        'How to adjust drive chain slack and rear wheel alignment?',
        'Analyze my logged service records and give a health score',
      ],
    };
  }, [state.vehicle.model, state.vehicle.regNo, state.odometer, targetKm, remainingKm, isOverdue, isDueSoon, state.services.length, selectedEngine]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => [defaultWelcomeMessage]);

  const inputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Trigger query on initial question if passed
  useEffect(() => {
    if (isOpen && initialQuestion && initialQuestion.trim().length > 0) {
      setActiveView('chat');
      handleSendMessage(initialQuestion.trim());
    }
  }, [isOpen, initialQuestion]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (activeView === 'chat') {
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [chatMessages, isLoading, activeView]);

  // Stop speech when closing modal
  useEffect(() => {
    if (!isOpen) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingMsgId(null);
      if (isRecording && recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
        setIsRecording(false);
      }
    }
  }, [isOpen]);

  // Speech Recognition (Voice Input)
  const toggleVoiceInput = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice dictation is not supported in your current browser. Please type your query.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputQuery(transcript);
          setTimeout(() => {
            handleSendMessage(transcript);
          }, 300);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech recognition init error:', err);
      setIsRecording(false);
    }
  };

  // Text-To-Speech (Read Aloud)
  const handleToggleSpeak = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Audio playback is not supported in this browser.');
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Strip markdown characters for natural speech
    const cleanSpeech = text
      .replace(/###\s+/g, '')
      .replace(/####\s+/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`/g, '')
      .replace(/^[-*]\s+/gm, '')
      .replace(/\[|\]/g, '')
      .replace(/### Suggested Follow-Ups[\s\S]*/, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingMsgId(null);
    };

    utterance.onerror = () => {
      setSpeakingMsgId(null);
    };

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Save diagnostic output as a Maintenance Note
  const handleSaveToNotes = (msgContent: string) => {
    if (!onAddNote) return;

    const firstLine = msgContent.split('\n')[0].replace(/###|####|\*\*/g, '').trim();
    const title = firstLine.length > 5 ? firstLine : 'AI Diagnostic Recommendation';
    const noteId = `ai-note-${Date.now()}`;

    // Determine appropriate note category
    let category: NoteCategory = 'general';
    const lower = msgContent.toLowerCase();
    if (lower.includes('oil') || lower.includes('filter')) category = 'oil';
    else if (lower.includes('chain') || lower.includes('sprocket')) category = 'chain';
    else if (lower.includes('brake') || lower.includes('abs') || lower.includes('fluid')) category = 'brake';
    else if (lower.includes('tyre') || lower.includes('tire') || lower.includes('psi')) category = 'tyre';
    else if (lower.includes('battery') || lower.includes('fuse') || lower.includes('spark')) category = 'electrical';

    const newNote: MaintenanceNote = {
      id: noteId,
      text: `[AI Diagnostic] ${title}\n\n${msgContent.replace(/### Suggested Follow-Ups[\s\S]*/, '').trim()}`,
      date: new Date().toISOString().split('T')[0],
      km: state.odometer,
      category,
    };

    onAddNote(newNote);
    setSavedNoteId(noteId);
    setTimeout(() => setSavedNoteId(null), 3000);
  };

  // Send message to Gemini API
  const handleSendMessage = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: queryText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...chatMessages, userMessage];
    setChatMessages(newHistory);
    setInputQuery('');
    setIsLoading(true);

    // Context metadata for the model
    const lastService = state.services[0];
    const context = {
      bikeModel: state.vehicle.model || 'Bajaj Pulsar N160 (BKT-1374)',
      regNo: state.vehicle.regNo || 'BKT-1374',
      odometer: state.odometer,
      targetKm,
      remainingKm,
      isOverdue,
      isDueSoon,
      servicesCount: state.services.length,
      lastServiceSummary: lastService
        ? `${lastService.label} at ${lastService.km} km on ${lastService.date}`
        : 'None recorded',
      recentNotesSummary: state.notes.slice(0, 3).map((n) => `${n.date}: ${n.text}`).join(' | '),
    };

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: queryText.trim(),
          engine: selectedEngine,
          customApiKey: customOpenAiKey.trim() || undefined,
          messages: newHistory.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            content: m.content,
          })),
          context,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const rawAnswer = data.answer || 'No recommendation received.';
      const { cleanContent, followUps } = extractFollowUps(rawAnswer);

      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: cleanContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || (selectedEngine === 'chatgpt' ? 'chatgpt-ai' : 'gemini-ai'),
        model: data.model || (selectedEngine === 'chatgpt' ? 'ChatGPT 4o-Mini (Free)' : 'Gemini Flash (Free)'),
        engine: data.engine || selectedEngine,
        followUps: followUps.length > 0 ? followUps : [
          'What are the mandatory inspection items for my next service?',
          'How do I properly check and clean my spark plug?',
          'What tyre pressures should I maintain with a pillion passenger?'
        ],
      };

      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch {
      // Local fallback
      const fallbackAns = `### Bajaj Pulsar N160 Factory Technical Specifications

Regarding **"${queryText}"**:
- **Current Odometer:** **${state.odometer.toLocaleString()} km** (Target: **${targetKm.toLocaleString()} km**)
- **Engine Oil:** **Bajaj DTS-i 10,000 (20W-50 API SL, JASO MA2)** or **10W-30 Semi-Synthetic**. Refill capacity: **1,200 ml** (replace paper cartridge filter at every oil change).
- **Drive Chain:** Clean & lube every **500 km** with O-ring safe spray; vertical slack **20–30 mm**.
- **Tyre Pressure:** Front **25 PSI**, Rear **28 PSI** (Solo) / **32 PSI** (Pillion).
- **Service Schedule:** Periodic interval every **5,000 km** or **120 days**.
- **Brakes:** **DOT 4** hydraulic fluid (Dual-Channel ABS). Minimum pad thickness: **1.5 mm**.`;

      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: fallbackAns,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'knowledge-base',
        model: selectedEngine === 'chatgpt' ? 'ChatGPT (Offline Workshop Specs)' : 'Pulsar N160 Verified Factory Manual',
        engine: selectedEngine,
        followUps: [
          'How to measure drive chain slack correctly?',
          'When should the front fork oil be replaced?',
        ],
      };

      setChatMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareToWhatsApp = (text: string) => {
    const clean = encodeURIComponent(
      `*Bajaj Pulsar N160 Technical Advice (Log Book AI)*:\n\n${text.slice(0, 1000)}...`
    );
    window.open(`https://wa.me/?text=${clean}`, '_blank');
  };

  const handleResetChat = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMsgId(null);
    setChatMessages([defaultWelcomeMessage]);
  };

  // Filter questions for Specs Tab
  const filteredQuestions = useMemo(() => {
    let list = COMMON_QUESTIONS;
    if (selectedCategory !== 'all') {
      list = list.filter((q) => q.category === selectedCategory);
    }
    if (searchFilter.trim()) {
      const s = searchFilter.toLowerCase();
      list = list.filter(
        (q) =>
          q.label.toLowerCase().includes(s) ||
          q.hint.toLowerCase().includes(s) ||
          q.categoryLabel.toLowerCase().includes(s) ||
          q.query.toLowerCase().includes(s)
      );
    }
    return list;
  }, [selectedCategory, searchFilter]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-4xl bg-gradient-to-b from-[#131926] via-[#0d121c] to-[#080b12] border border-amber-500/35 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.85)] relative overflow-hidden flex flex-col h-[92vh] max-h-[850px]"
        >
          {/* Ambient Lighting Orbs */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Modal Header */}
          <div className="p-3.5 sm:p-4 border-b border-zinc-800/90 flex items-center justify-between gap-3 relative z-10 bg-[#0e1420]/90">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl p-[2px] shadow-lg shrink-0 transition-colors ${
                selectedEngine === 'chatgpt'
                  ? 'bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-600 shadow-emerald-500/20'
                  : 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 shadow-amber-500/25'
              }`}>
                <div className="w-full h-full rounded-[14px] bg-[#0c101a] flex items-center justify-center">
                  {selectedEngine === 'chatgpt' ? (
                    <Bot className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  )}
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-black text-base sm:text-lg text-white tracking-wide truncate">
                    Pulsar MechAI · Technical Assistant
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setKeyInputVal(customOpenAiKey);
                      setShowEngineSettings(true);
                    }}
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0 transition-all cursor-pointer ${
                      selectedEngine === 'chatgpt'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                    }`}
                    title="Click to manage AI engines (Gemini / ChatGPT)"
                  >
                    {selectedEngine === 'chatgpt' ? (
                      <>
                        <Bot className="w-2.5 h-2.5 text-emerald-400" />
                        <span>ChatGPT (Free)</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                        <span>Gemini Flash (Free)</span>
                      </>
                    )}
                    <SlidersHorizontal className="w-2.5 h-2.5 ml-0.5 opacity-70" />
                  </button>
                </div>

                {/* Bike Status Line */}
                <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400 flex-wrap">
                  <span className="font-mono text-zinc-300 font-semibold">
                    {state.vehicle.regNo || 'BKT-1374'}
                  </span>
                  <span>•</span>
                  <span>Odo: <strong className="text-zinc-200 font-mono">{state.odometer.toLocaleString()} km</strong></span>
                  <span>•</span>
                  {isOverdue ? (
                    <span className="text-red-400 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Overdue by {Math.abs(remainingKm).toLocaleString()} km
                    </span>
                  ) : isDueSoon ? (
                    <span className="text-amber-300 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" /> Due in {remainingKm.toLocaleString()} km
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Target: {targetKm.toLocaleString()} km
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleResetChat}
                className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/70 text-zinc-400 hover:text-white transition-all cursor-pointer"
                title="Restart Chat Session"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/70 text-zinc-400 hover:text-white transition-all cursor-pointer"
                title="Close Assistant (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Sub-bar: Chat Mode vs Factory Specs Mode & Dual AI Engine Switcher */}
          <div className="px-3 sm:px-4 py-2 border-b border-zinc-800/70 bg-[#0a0e16]/90 flex items-center justify-between gap-2 z-10 flex-wrap">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setActiveView('chat')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'chat'
                    ? selectedEngine === 'chatgpt'
                      ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                      : 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                    : 'bg-[#141926] text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>AI Chat</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/30">
                  Interactive
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('specs')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'specs'
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                    : 'bg-[#141926] text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>OEM Specs & FAQs</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/30">
                  {COMMON_QUESTIONS.length}
                </span>
              </button>
            </div>

            {/* DUAL AI ENGINE SELECTOR (Free Gemini vs Free ChatGPT) */}
            <div className="flex items-center gap-1.5 ml-auto">
              <div className="flex items-center p-0.5 rounded-xl bg-zinc-900/90 border border-zinc-800 shadow-inner">
                <button
                  type="button"
                  onClick={() => handleSelectEngine('gemini')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    selectedEngine === 'gemini'
                      ? 'bg-amber-500 text-zinc-950 shadow-sm shadow-amber-500/30'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Switch to Google Gemini Flash AI (Free)"
                >
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0 fill-current" />
                  <span>Gemini</span>
                  <span className={`text-[8px] font-mono uppercase px-1 py-0.2 rounded ${
                    selectedEngine === 'gemini' ? 'bg-black/20 text-zinc-950 font-black' : 'bg-zinc-800 text-amber-400'
                  }`}>
                    Free
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectEngine('chatgpt')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    selectedEngine === 'chatgpt'
                      ? 'bg-emerald-500 text-zinc-950 shadow-sm shadow-emerald-500/30'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Switch to OpenAI ChatGPT AI (Free)"
                >
                  <Bot className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>ChatGPT</span>
                  <span className={`text-[8px] font-mono uppercase px-1 py-0.2 rounded ${
                    selectedEngine === 'chatgpt' ? 'bg-black/20 text-zinc-950 font-black' : 'bg-zinc-800 text-emerald-400'
                  }`}>
                    Free
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setKeyInputVal(customOpenAiKey);
                    setShowEngineSettings(true);
                  }}
                  className="p-1 sm:p-1.5 rounded-lg text-zinc-400 hover:text-amber-300 hover:bg-zinc-800/80 transition-colors cursor-pointer"
                  title="Configure AI Engines & Custom API Key"
                >
                  <Sliders className="w-3 h-3" />
                </button>
              </div>

              {onOpenUserManual && (
                <button
                  type="button"
                  onClick={onOpenUserManual}
                  className="text-xs text-amber-300 hover:text-amber-200 hidden sm:flex items-center gap-1 font-semibold cursor-pointer px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30"
                  title="Open Bajaj Pulsar N160 Official User Manual"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Manual</span>
                </button>
              )}

              {onNavigateToSchedule && (
                <button
                  type="button"
                  onClick={onNavigateToSchedule}
                  className="text-xs text-amber-300 hover:text-amber-200 hidden lg:flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <span>Matrix</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* VIEW 1: INTERACTIVE AI CHAT */}
          {activeView === 'chat' && (
            <div className="flex flex-col flex-1 min-h-0 relative z-10">
              {/* Quick Action Prompt Chips Bar */}
              <div className="px-3 sm:px-4 py-2 bg-[#0d121c]/90 border-b border-zinc-800/60 overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1 whitespace-nowrap">
                  <Flame className="w-3 h-3 text-amber-400" />
                  Quick Actions:
                </span>
                {QUICK_ACTION_PROMPTS.map((qa) => {
                  const Icon = qa.icon;
                  return (
                    <button
                      key={qa.id}
                      type="button"
                      onClick={() => handleSendMessage(qa.prompt)}
                      disabled={isLoading}
                      className="px-2.5 py-1 rounded-xl text-xs bg-[#141a28] hover:bg-amber-500/20 border border-zinc-700/70 hover:border-amber-400/80 text-zinc-300 hover:text-white whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                      title={qa.subtitle}
                    >
                      <Icon className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="text-[11px] font-medium">{qa.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Chat Messages Scroll Container */}
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4">
                {chatMessages.map((msg) => {
                  const isUser = msg.role === 'user';
                  const isSpeaking = speakingMsgId === msg.id;
                  const isMsgChatGpt = !isUser && (
                    msg.engine === 'chatgpt' ||
                    msg.source === 'chatgpt-ai' ||
                    (msg.model && msg.model.toLowerCase().includes('chatgpt'))
                  );

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Assistant Avatar */}
                      {!isUser && (
                        <div className={`w-8 h-8 rounded-xl p-[1px] shrink-0 mt-1 shadow-md ${
                          isMsgChatGpt
                            ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-emerald-500/20'
                            : 'bg-gradient-to-tr from-amber-500 to-yellow-400 shadow-amber-500/20'
                        }`}>
                          <div className="w-full h-full rounded-[11px] bg-[#0c101a] flex items-center justify-center">
                            {isMsgChatGpt ? (
                              <Bot className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Sparkles className="w-4 h-4 text-amber-400" />
                            )}
                          </div>
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div
                        className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 space-y-2 relative shadow-lg ${
                          isUser
                            ? 'bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white rounded-tr-none'
                            : isMsgChatGpt
                            ? 'bg-[#0f171d] border border-emerald-500/35 text-zinc-200 rounded-tl-none shadow-[0_4px_20px_rgba(16,185,129,0.08)]'
                            : 'bg-[#101625] border border-amber-500/30 text-zinc-200 rounded-tl-none shadow-[0_4px_20px_rgba(245,158,11,0.08)]'
                        }`}
                      >
                        {/* Header for Message */}
                        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5 text-[10px] flex-wrap">
                          <div className="flex items-center gap-1.5 font-bold">
                            {isUser ? (
                              <span className="text-white">You</span>
                            ) : isMsgChatGpt ? (
                              <>
                                <span className="text-emerald-400 flex items-center gap-1">
                                  <Bot className="w-3 h-3" />
                                  Pulsar MechAI (ChatGPT)
                                </span>
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-500/40">
                                  {msg.model || 'ChatGPT 4o-Mini (Free)'}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="text-amber-400 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  Pulsar MechAI (Gemini)
                                </span>
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-950/70 text-amber-300 border border-amber-500/40">
                                  {msg.model || 'Gemini Flash (Free)'}
                                </span>
                              </>
                            )}
                          </div>
                          <span className="text-zinc-400 font-mono text-[9px]">{msg.timestamp}</span>
                        </div>

                        {/* Content */}
                        {isUser ? (
                          <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        ) : (
                          <FormattedMarkdown content={msg.content} />
                        )}

                        {/* Actions for Assistant Message */}
                        {!isUser && (
                          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Copy Button */}
                              <button
                                type="button"
                                onClick={() => handleCopy(msg.id, msg.content)}
                                className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 flex items-center gap-1 transition-all cursor-pointer"
                                title="Copy response to clipboard"
                              >
                                {copiedId === msg.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>

                              {/* Speak / Read Aloud Button */}
                              <button
                                type="button"
                                onClick={() => handleToggleSpeak(msg.id, msg.content)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
                                  isSpeaking
                                    ? 'bg-amber-500 text-zinc-950 border-amber-400 animate-pulse font-bold'
                                    : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border-zinc-700'
                                }`}
                                title={isSpeaking ? 'Stop speaking' : 'Read aloud (Hands-free garage assistant)'}
                              >
                                {isSpeaking ? (
                                  <>
                                    <VolumeX className="w-3 h-3" />
                                    <span>Stop</span>
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="w-3 h-3 text-amber-400" />
                                    <span>Listen</span>
                                  </>
                                )}
                              </button>

                              {/* Save to Maintenance Notes */}
                              {onAddNote && (
                                <button
                                  type="button"
                                  onClick={() => handleSaveToNotes(msg.content)}
                                  className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 transition-all cursor-pointer"
                                  title="Save this diagnostic advice to your Maintenance Notes"
                                >
                                  {savedNoteId ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span className="text-emerald-300">Saved to Notes!</span>
                                    </>
                                  ) : (
                                    <>
                                      <BookmarkPlus className="w-3 h-3 text-emerald-400" />
                                      <span>Save to Notes</span>
                                    </>
                                  )}
                                </button>
                              )}

                              {/* Share via WhatsApp */}
                              <button
                                type="button"
                                onClick={() => handleShareToWhatsApp(msg.content)}
                                className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30 flex items-center gap-1 transition-all cursor-pointer"
                                title="Share advice to WhatsApp mechanic"
                              >
                                <Share2 className="w-3 h-3" />
                                <span className="hidden sm:inline">WhatsApp</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Interactive Follow-up Question Chips */}
                        {!isUser && msg.followUps && msg.followUps.length > 0 && (
                          <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
                            <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                              Suggested Follow-ups:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.followUps.map((fu, fIdx) => (
                                <button
                                  key={fIdx}
                                  type="button"
                                  onClick={() => handleSendMessage(fu)}
                                  disabled={isLoading}
                                  className="px-2.5 py-1 rounded-xl text-xs bg-[#161c28] hover:bg-amber-500/20 border border-zinc-700/80 hover:border-amber-400 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-left disabled:opacity-50"
                                >
                                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                                  <span className="text-[11px]">{fu}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Loading state indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border text-xs text-zinc-300 max-w-sm ${
                      selectedEngine === 'chatgpt'
                        ? 'bg-[#0e171b] border-emerald-500/35'
                        : 'bg-[#0f1422] border-amber-500/30'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 animate-spin shrink-0 ${
                      selectedEngine === 'chatgpt'
                        ? 'border-emerald-500/20 border-t-emerald-400'
                        : 'border-amber-500/20 border-t-amber-400'
                    }`} />
                    <div>
                      <span className="font-bold text-white block">
                        {selectedEngine === 'chatgpt' ? 'Pulsar MechAI (ChatGPT) is thinking...' : 'Pulsar MechAI (Gemini) is analyzing...'}
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {selectedEngine === 'chatgpt'
                          ? 'Troubleshooting symptoms and Bajaj N160 workshop steps'
                          : 'Consulting Pulsar N160 technical workshop data'}
                      </span>
                    </div>
                  </motion.div>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 sm:p-4 bg-[#0c101a] border-t border-zinc-800/90 relative">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (inputQuery.trim()) {
                      handleSendMessage(inputQuery.trim());
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  {/* Voice dictation toggle button */}
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer shrink-0 ${
                      isRecording
                        ? 'bg-red-500 text-white border-red-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                        : selectedEngine === 'chatgpt'
                        ? 'bg-[#141a28] hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400 border-zinc-700/80'
                        : 'bg-[#141a28] hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 border-zinc-700/80'
                    }`}
                    title={isRecording ? 'Listening... click to stop' : 'Speak question (Microphone dictation)'}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {/* Text Input */}
                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputQuery}
                      onChange={(e) => setInputQuery(e.target.value)}
                      placeholder={
                        isRecording
                          ? 'Listening to your voice...'
                          : selectedEngine === 'chatgpt'
                          ? 'Ask ChatGPT AI: e.g. Gear shift stiffness, ticking sound, cold start, chain slack...'
                          : 'Ask Gemini AI: e.g. Oil grade, chain slack, cold start, brake bleeding, tyre PSI...'
                      }
                      disabled={isLoading}
                      className={`w-full pl-3.5 pr-10 py-3 rounded-2xl bg-[#111624] border text-xs sm:text-sm text-white placeholder-zinc-500 transition-all shadow-inner disabled:opacity-60 focus:outline-none focus:ring-1 ${
                        selectedEngine === 'chatgpt'
                          ? 'border-zinc-700/80 focus:border-emerald-400 focus:ring-emerald-400'
                          : 'border-zinc-700/80 focus:border-amber-400 focus:ring-amber-400'
                      }`}
                    />
                    {inputQuery && (
                      <button
                        type="button"
                        onClick={() => setInputQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs cursor-pointer"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={isLoading || !inputQuery.trim()}
                    className={`px-4 py-3 rounded-2xl font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 ${
                      selectedEngine === 'chatgpt'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950'
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 fill-slate-950" />
                        <span className="hidden sm:inline">
                          {selectedEngine === 'chatgpt' ? 'Ask ChatGPT' : 'Ask Gemini'}
                        </span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* VIEW 2: FACTORY SPECS & VERIFIED FAQS */}
          {activeView === 'specs' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 relative z-10">
              {/* Search & Filter Header */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Verified Factory Handbook & Workshop Specs
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {filteredQuestions.length} Specs
                  </span>
                </div>

                {/* Filter Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search specifications..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#0c101a] border border-zinc-700/80 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 w-44 sm:w-56 transition-all"
                  />
                  {searchFilter && (
                    <button
                      type="button"
                      onClick={() => setSearchFilter('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {CATEGORY_TABS.map((tab) => {
                  const isActive = selectedCategory === tab.id;
                  const count =
                    tab.id === 'all'
                      ? COMMON_QUESTIONS.length
                      : COMMON_QUESTIONS.filter((q) => q.category === tab.id).length;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedCategory(tab.id)}
                      className={`px-3 py-1.5 rounded-xl font-medium text-xs whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                          : 'bg-[#121622] hover:bg-[#1a2130] text-zinc-300 border border-zinc-800'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                          isActive ? 'bg-zinc-950 text-amber-300' : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Questions Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {filteredQuestions.map((q) => {
                  const Icon = q.icon;

                  return (
                    <div
                      key={q.id}
                      className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative group bg-[#0f1422]/90 ${q.colorClass} hover:border-amber-400/80 shadow-md`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-xl bg-black/40 border border-white/10 shrink-0">
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400 block uppercase tracking-wider">
                              {q.categoryLabel}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveView('chat');
                              handleSendMessage(q.query);
                            }}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 bg-amber-500/20 hover:bg-amber-400 text-amber-300 hover:text-zinc-950 border border-amber-500/40 hover:border-amber-400 transition-all cursor-pointer shadow-sm"
                            title="Ask AI this specific question"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Ask AI</span>
                          </button>
                        </div>

                        <span className="text-xs font-bold leading-tight block text-white group-hover:text-amber-300 transition-colors">
                          {q.label}
                        </span>
                        <span className="text-[11px] text-zinc-400 block mt-1 line-clamp-2">
                          {q.hint}
                        </span>
                      </div>

                      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-400">
                        <span className="font-mono text-amber-400/80">Pulsar N160 OEM</span>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveView('chat');
                            handleSendMessage(q.query);
                          }}
                          className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                        >
                          <span>Consult AI</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredQuestions.length === 0 && (
                <div className="p-8 rounded-2xl bg-[#0e121d] border border-zinc-800 text-center space-y-2">
                  <HelpCircle className="w-6 h-6 text-zinc-500 mx-auto" />
                  <p className="text-xs text-zinc-400">
                    No predefined specifications found matching "{searchFilter}".
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveView('chat');
                      handleSendMessage(searchFilter);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask AI "{searchFilter}"</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Modal Footer */}
          <div className="bg-[#0b0e16] px-4 py-2.5 border-t border-zinc-800/80 flex items-center justify-between flex-wrap gap-2 relative z-10 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                selectedEngine === 'chatgpt' ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span className="text-[11px] font-mono">
                Pulsar MechAI Core Active · {selectedEngine === 'chatgpt' ? 'ChatGPT (Free)' : 'Gemini Flash (Free)'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setKeyInputVal(customOpenAiKey);
                  setShowEngineSettings(true);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <SlidersHorizontal className="w-3 h-3 text-amber-400" />
                <span>Engine Settings</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>

        {/* AI ENGINE SETTINGS DIALOG */}
        <AnimatePresence>
          {showEngineSettings && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="w-full max-w-lg bg-[#0d121c] border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              >
                {/* Settings Header */}
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-[#111726]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-emerald-400 p-[1.5px]">
                      <div className="w-full h-full rounded-[10px] bg-[#0c101a] flex items-center justify-center">
                        <Sliders className="w-4 h-4 text-amber-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-display font-black text-sm text-white">AI Engine Configuration</h4>
                      <p className="text-[11px] text-zinc-400">Choose between Google Gemini & OpenAI ChatGPT</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEngineSettings(false)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Settings Body */}
                <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                  {/* Engine 1: Google Gemini Flash */}
                  <div
                    onClick={() => handleSelectEngine('gemini')}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedEngine === 'gemini'
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10'
                        : 'bg-[#121624] border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                          <Sparkles className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">Google Gemini Flash</span>
                            <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              100% Free
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            Fast response, multi-turn chat & full Bajaj Pulsar N160 factory maintenance database context.
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 pt-0.5">
                        {selectedEngine === 'gemini' ? (
                          <span className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-zinc-950">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full border border-zinc-600 block" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Engine 2: OpenAI ChatGPT */}
                  <div
                    onClick={() => handleSelectEngine('chatgpt')}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedEngine === 'chatgpt'
                        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                        : 'bg-[#121624] border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                          <Bot className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">OpenAI ChatGPT 4o-Mini</span>
                            <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              Free Built-in
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            Technical troubleshooting, symptom deduction, and step-by-step repair reasoning.
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 pt-0.5">
                        {selectedEngine === 'chatgpt' ? (
                          <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-zinc-950">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full border border-zinc-600 block" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Custom OpenAI Key Option (Optional) */}
                  <div className="p-3.5 rounded-xl bg-[#111624] border border-zinc-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-amber-400" />
                        Custom OpenAI API Key (Optional)
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">Works without key in Free mode</span>
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      If you have your own OpenAI key (<code className="text-zinc-300">sk-...</code>), enter it below. If left blank, ChatGPT operates 100% free of charge via built-in proxy engine.
                    </p>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showKeyText ? 'text' : 'password'}
                          value={keyInputVal}
                          onChange={(e) => setKeyInputVal(e.target.value)}
                          placeholder="sk-..."
                          className="w-full pl-3 pr-9 py-2 rounded-xl bg-[#0c101a] border border-zinc-700 text-xs text-white placeholder-zinc-600 focus:border-emerald-400 focus:outline-none font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKeyText(!showKeyText)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                        >
                          {showKeyText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveOpenAiKey}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors cursor-pointer shrink-0"
                      >
                        Save
                      </button>

                      {customOpenAiKey && (
                        <button
                          type="button"
                          onClick={() => {
                            setKeyInputVal('');
                            setCustomOpenAiKey('');
                            if (typeof window !== 'undefined') localStorage.removeItem('pulsar_custom_openai_key');
                            setKeySavedToast(true);
                            setTimeout(() => setKeySavedToast(false), 2000);
                          }}
                          className="px-2.5 py-2 rounded-xl bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 text-xs transition-colors cursor-pointer shrink-0"
                          title="Remove saved custom key"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {keySavedToast && (
                      <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        {customOpenAiKey ? 'API key saved in local browser storage!' : 'Key removed. Free mode active!'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Settings Footer */}
                <div className="p-3.5 bg-[#0f1422] border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">
                    Active:{' '}
                    <strong className={selectedEngine === 'chatgpt' ? 'text-emerald-400' : 'text-amber-400'}>
                      {selectedEngine === 'chatgpt' ? 'OpenAI ChatGPT' : 'Google Gemini Flash'}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowEngineSettings(false)}
                    className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Apply & Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};
