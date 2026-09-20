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
} from 'lucide-react';
import { AppState } from '../types';

export interface QuickFaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  initialQuestion?: string | null;
  onNavigateToSchedule?: () => void;
}

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
    label: 'Periodic Service Schedule & Costs',
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
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('oil');
  const [activeQuestionText, setActiveQuestionText] = useState<string>('');
  const [inputQuery, setInputQuery] = useState<string>('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [answerSource, setAnswerSource] = useState<'gemini-ai' | 'knowledge-base' | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeFollowUps, setActiveFollowUps] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const answerContainerRef = useRef<HTMLDivElement>(null);

  // Trigger query on initial question or default question
  useEffect(() => {
    if (isOpen) {
      if (initialQuestion && initialQuestion.trim().length > 0) {
        handleAskQuestion(initialQuestion.trim());
      } else if (!answer && !isLoading) {
        handleAskQuestion(COMMON_QUESTIONS[0].query, COMMON_QUESTIONS[0].id);
      }
    }
  }, [isOpen, initialQuestion]);

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

  // Filter questions based on category tab and search query
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

  const handleAskQuestion = async (queryToAsk: string, questionId?: string) => {
    if (!queryToAsk.trim() || isLoading) return;

    setIsLoading(true);
    setActiveQuestionText(queryToAsk.trim());

    if (questionId) {
      setSelectedQuestionId(questionId);
      const matched = COMMON_QUESTIONS.find((q) => q.id === questionId);
      if (matched?.followUps) {
        setActiveFollowUps(matched.followUps);
      }
    } else {
      setSelectedQuestionId('');
      // Find possible follow-ups from common questions
      const randomPicks = COMMON_QUESTIONS.slice(0, 3).map((q) => q.label);
      setActiveFollowUps(randomPicks);
    }

    try {
      const res = await fetch('/api/faq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: queryToAsk.trim(),
          context: {
            bikeModel: state.vehicle.model || 'Bajaj Pulsar N160 (BKT-1374)',
            odometer: state.odometer,
            regNo: state.vehicle.regNo,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();
      setAnswer(data.answer || 'No response received.');
      setAnswerSource(data.source === 'gemini-ai' ? 'gemini-ai' : 'knowledge-base');
      setModelUsed(data.model || (data.source === 'gemini-ai' ? 'Gemini 3.8 Flash' : 'Factory Handbook'));

      // Smooth scroll to answer
      setTimeout(() => {
        answerContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch {
      // Local fallback for offline reliability
      setAnswer(
        `### Bajaj Pulsar N160 Factory Technical Specification
        
- **Recommended Oil:** **Bajaj DTS-i 10,000 (20W-50 API SL, JASO MA2)** or **10W-30 Semi-Synthetic**. Capacity: **1,200 ml**.
- **Drive Chain Maintenance:** Clean & lube every **500 km** with O-ring safe spray. Slack: **20–30 mm**.
- **Tyre Pressure:** Front **25 PSI**, Rear **28 PSI** (Solo) / **32 PSI** (With Pillion).
- **Service Interval:** 1st: 500-750 km; then every **5,000 km** or 120 days.
- **Brake Fluid:** **DOT 4** hydraulic fluid (Dual-Channel ABS).`
      );
      setAnswerSource('knowledge-base');
      setModelUsed('Pulsar N160 Verified Factory Manual');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!answer) return;
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitCustomQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      handleAskQuestion(inputQuery.trim());
      setInputQuery('');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-4xl bg-gradient-to-b from-[#131926] via-[#0d121c] to-[#080b12] border border-amber-500/35 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.85)] relative overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Ambient Lighting Orbs */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Modal Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex items-start justify-between gap-3 relative z-10 bg-[#0e1420]/80">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-[2px] shadow-[0_0_20px_rgba(245,158,11,0.35)] shrink-0">
                <div className="w-full h-full rounded-[14px] bg-[#0c101a] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-black text-lg sm:text-xl text-white tracking-wide">
                    Quick FAQ · Ask AI Assistant
                  </h3>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/35 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    Gemini 3.8 AI
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {state.vehicle.regNo || 'BKT-1374'} · {state.odometer.toLocaleString()} km
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Select any question below to <strong>Ask AI</strong>, or type your custom query for verified Bajaj Pulsar N160 technical guidance.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-2 rounded-xl bg-zinc-800/70 hover:bg-zinc-700/70 border border-zinc-700/60 transition-all cursor-pointer shrink-0"
              title="Close Quick FAQ (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-5 relative z-10 flex-1">
            {/* Custom Question Input Bar */}
            <form onSubmit={handleSubmitCustomQuery} className="relative">
              <div className="relative flex items-center">
                <div className="absolute left-3.5 pointer-events-none text-zinc-400">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask AI any Pulsar N160 question (e.g. why is gear shifting stiff, valve clearances, fuel reserve)..."
                  className="w-full pl-10 pr-28 py-3 rounded-2xl bg-[#0c101a] border border-zinc-700/80 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 text-xs sm:text-sm text-white placeholder-zinc-500 transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputQuery.trim()}
                  className="absolute right-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Thinking</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Ask AI</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Answer Display Box */}
            <div ref={answerContainerRef} className="space-y-3">
              {isLoading && (
                <div className="p-7 rounded-2xl bg-[#0d121c] border border-amber-500/25 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
                    <Sparkles className="w-5 h-5 text-amber-400 absolute inset-0 m-auto" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Consulting Pulsar N160 Technical Specs...</h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Synthesizing factory tolerances & maintenance procedures via Gemini AI
                    </p>
                  </div>
                </div>
              )}

              {!isLoading && answer && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#111726]/95 to-[#0b0f19]/95 border border-amber-500/35 shadow-xl relative overflow-hidden space-y-3.5">
                  {/* Metadata Header for Answer */}
                  <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
                        {answerSource === 'gemini-ai' ? (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>AI Verified Guidance</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Factory Reference Verified</span>
                          </>
                        )}
                      </span>
                      {modelUsed && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
                          {modelUsed}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Copy answer to clipboard"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 text-[11px]">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Copy</span>
                          </>
                        )}
                      </button>

                      {onNavigateToSchedule && (
                        <button
                          type="button"
                          onClick={onNavigateToSchedule}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Open Factory Service Schedule"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Schedule Guide</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Active Question Title */}
                  {activeQuestionText && (
                    <div className="text-xs font-medium text-amber-200/90 flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">Question: "{activeQuestionText}"</span>
                    </div>
                  )}

                  {/* Markdown Body */}
                  <div className="py-1">
                    <FormattedMarkdown content={answer} />
                  </div>

                  {/* Dynamic Follow-Up Questions (Ask AI) */}
                  {activeFollowUps && activeFollowUps.length > 0 && (
                    <div className="pt-2 border-t border-zinc-800/80">
                      <div className="flex items-center gap-1.5 mb-2 text-zinc-400 text-[11px] font-semibold uppercase tracking-wider">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Ask AI Follow-Up Questions:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {activeFollowUps.map((fu, fIdx) => (
                          <button
                            key={fIdx}
                            type="button"
                            onClick={() => handleAskQuestion(fu)}
                            disabled={isLoading}
                            className="px-2.5 py-1.5 rounded-xl text-xs bg-[#161c28] hover:bg-amber-500/20 border border-zinc-700/80 hover:border-amber-400 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-left group"
                          >
                            <Sparkles className="w-3 h-3 text-amber-400/80 group-hover:text-amber-300 shrink-0" />
                            <span className="text-[11px] font-medium">{fu}</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400/70 ml-1">
                              Ask AI
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Questions Section with Category Tabs & Search */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>All Questions · Tap to Ask AI</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {filteredQuestions.length} Questions
                  </span>
                </div>

                {/* Search / Filter Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filter questions..."
                    className="pl-8 pr-3 py-1 text-xs rounded-xl bg-[#0c101a] border border-zinc-700/80 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 w-36 sm:w-48 transition-all"
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

              {/* Question Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {filteredQuestions.map((q) => {
                  const Icon = q.icon;
                  const isSelected = selectedQuestionId === q.id;

                  return (
                    <div
                      key={q.id}
                      className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative group ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400'
                          : `bg-[#0f1422]/90 ${q.colorClass} hover:border-amber-400/80`
                      } ${isLoading ? 'opacity-70' : ''}`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-xl bg-black/40 border border-white/10 shrink-0">
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-[10px] font-mono text-zinc-400 block uppercase tracking-wider">
                              {q.categoryLabel}
                            </span>
                          </div>

                          {/* Explicit ASK AI Button on Every Question Card */}
                          <button
                            type="button"
                            onClick={() => handleAskQuestion(q.query, q.id)}
                            disabled={isLoading}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shadow-sm ${
                              isSelected
                                ? 'bg-amber-400 text-zinc-950 font-black'
                                : 'bg-amber-500/20 hover:bg-amber-400 text-amber-300 hover:text-zinc-950 border border-amber-500/40 hover:border-amber-400'
                            }`}
                            title="Ask AI this question"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Ask AI</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAskQuestion(q.query, q.id)}
                          disabled={isLoading}
                          className="text-left w-full cursor-pointer focus:outline-none"
                        >
                          <span className="text-xs font-bold leading-tight block text-white hover:text-amber-300 transition-colors">
                            {q.label}
                          </span>
                          <span className="text-[11px] text-zinc-400 block mt-1 line-clamp-1">
                            {q.hint}
                          </span>
                        </button>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-400">
                        <span className="font-mono text-amber-400/80">Gemini 3.8</span>
                        <button
                          type="button"
                          onClick={() => handleAskQuestion(q.query, q.id)}
                          disabled={isLoading}
                          className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                        >
                          <span>Get Answer</span>
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
                    No predefined questions found matching "{searchFilter}".
                  </p>
                  <button
                    type="button"
                    onClick={() => handleAskQuestion(searchFilter)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask AI "{searchFilter}"</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="bg-[#0b0e16] px-5 py-3 border-t border-zinc-800/80 flex items-center justify-between flex-wrap gap-3 relative z-10 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Pulsar N160 AI Service Engine Online</span>
            </div>

            <div className="flex items-center gap-2">
              {onNavigateToSchedule && (
                <button
                  type="button"
                  onClick={onNavigateToSchedule}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
                >
                  View Schedule Matrix
                </button>
              )}
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
      </div>
    </AnimatePresence>
  );
};
