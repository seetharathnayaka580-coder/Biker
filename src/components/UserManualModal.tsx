import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  Search,
  Sparkles,
  Cpu,
  Gauge,
  Wrench,
  Sliders,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Printer,
  FileText,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { PULSAR_N160_MANUAL, ManualSection } from '../data/userManualData';
import { VehicleDetails } from '../types';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleDetails;
  onAskAi?: (question: string) => void;
  onOpenSchedule?: () => void;
}

const SECTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Cpu,
  Gauge,
  Wrench,
  Sliders,
  HelpCircle,
  ShieldCheck,
};

export const UserManualModal: React.FC<UserManualModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onAskAi,
  onOpenSchedule,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('all');
  const [expandedSectionIds, setExpandedSectionIds] = useState<Record<string, boolean>>({
    tech_specs: true,
    running_in: true,
    maintenance_schedule: true,
    controls_console: true,
    troubleshooting: true,
    safe_riding: true,
  });

  const toggleSection = (id: string) => {
    setExpandedSectionIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    PULSAR_N160_MANUAL.sections.forEach((s) => {
      all[s.id] = true;
    });
    setExpandedSectionIds(all);
  };

  const collapseAll = () => {
    setExpandedSectionIds({});
  };

  // Filter sections based on search query
  const filteredSections = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      if (selectedSectionId === 'all') return PULSAR_N160_MANUAL.sections;
      return PULSAR_N160_MANUAL.sections.filter((s) => s.id === selectedSectionId);
    }

    return PULSAR_N160_MANUAL.sections
      .map((sec) => {
        const titleMatch = sec.title.toLowerCase().includes(q) || sec.subtitle.toLowerCase().includes(q);
        const matchingItems = sec.items.filter((item) => {
          if (item.title.toLowerCase().includes(q) || item.details.toLowerCase().includes(q)) return true;
          if (item.warning && item.warning.toLowerCase().includes(q)) return true;
          if (item.tip && item.tip.toLowerCase().includes(q)) return true;
          if (
            item.specs &&
            item.specs.some(
              (sp) => sp.label.toLowerCase().includes(q) || sp.value.toLowerCase().includes(q)
            )
          ) {
            return true;
          }
          return false;
        });

        if (titleMatch || matchingItems.length > 0) {
          return {
            ...sec,
            items: titleMatch ? sec.items : matchingItems,
          };
        }
        return null;
      })
      .filter((sec): sec is ManualSection => sec !== null);
  }, [searchQuery, selectedSectionId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-[#0c1017] border border-[#1f293d] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] relative">
        {/* Subtle Top Accent */}
        <div className="h-1 bg-gradient-to-r from-amber-500 via-cyan-400 to-amber-500 w-full" />

        {/* Modal Header */}
        <div className="bg-[#101522] px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1b2438]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] shrink-0">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-black text-base sm:text-lg text-white tracking-wide">
                  Bajaj Pulsar N160 User Manual
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/35 uppercase">
                  Official OEM Handbook
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {vehicle.regNo}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Comprehensive factory rider handbook, operating guidelines, fluids, torque & maintenance guide
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {onAskAi && (
              <button
                type="button"
                onClick={() =>
                  onAskAi(
                    'What are the essential user manual guidelines, oil capacities, running-in limits, and maintenance steps for Pulsar N160?'
                  )
                }
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 hover:border-amber-400 transition-all cursor-pointer shadow-sm"
                title="Ask AI Mechanic about User Manual"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Ask AI Mechanic</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800/80 transition-colors cursor-pointer border border-transparent hover:border-zinc-700"
              title="Close User Manual"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="bg-[#0e131d] px-4 sm:px-6 py-3 border-b border-[#1b2438] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user manual: oil capacity, brake fluid, tyre pressure, spark plug, running-in..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#141b28] border border-[#232f48] focus:border-amber-400 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Category Buttons & Expand/Collapse */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
            <button
              type="button"
              onClick={() => {
                setSelectedSectionId('all');
                setSearchQuery('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedSectionId === 'all' && !searchQuery
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-950/40'
                  : 'bg-[#141b28] text-zinc-400 hover:text-white border border-[#232f48]'
              }`}
            >
              All Sections ({PULSAR_N160_MANUAL.sections.length})
            </button>

            {PULSAR_N160_MANUAL.sections.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => {
                  setSelectedSectionId(sec.id);
                  setSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedSectionId === sec.id && !searchQuery
                    ? 'bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-950/40'
                    : 'bg-[#141b28] text-zinc-400 hover:text-white border border-[#232f48]'
                }`}
              >
                {sec.title.split(' ')[0]}
              </button>
            ))}

            <div className="h-5 w-px bg-zinc-700 mx-1 hidden sm:block shrink-0" />

            <button
              type="button"
              onClick={expandAll}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-medium bg-[#141b28] text-zinc-400 hover:text-zinc-200 border border-[#232f48] cursor-pointer whitespace-nowrap"
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-medium bg-[#141b28] text-zinc-400 hover:text-zinc-200 border border-[#232f48] cursor-pointer whitespace-nowrap"
            >
              Collapse
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-gradient-to-b from-[#0c1017] to-[#090c12]">
          {/* Quick Fast Facts Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="p-3 rounded-xl bg-[#111724] border border-[#1e2a40] flex flex-col">
              <span className="text-[10px] uppercase font-bold text-amber-400/90 flex items-center gap-1">
                <Droplets className="w-3 h-3 text-amber-400" />
                Engine Oil Spec
              </span>
              <span className="font-mono font-bold text-white text-xs mt-1">
                20W50 / 10W30 (1.15L)
              </span>
              <span className="text-[10px] text-zinc-400 mt-0.5">JASO MA2, API SN</span>
            </div>

            <div className="p-3 rounded-xl bg-[#111724] border border-[#1e2a40] flex flex-col">
              <span className="text-[10px] uppercase font-bold text-cyan-400/90 flex items-center gap-1">
                <Gauge className="w-3 h-3 text-cyan-400" />
                Tyre Pressures
              </span>
              <span className="font-mono font-bold text-white text-xs mt-1">
                F: 25 PSI / R: 28-32
              </span>
              <span className="text-[10px] text-zinc-400 mt-0.5">Tubeless cold check</span>
            </div>

            <div className="p-3 rounded-xl bg-[#111724] border border-[#1e2a40] flex flex-col">
              <span className="text-[10px] uppercase font-bold text-emerald-400/90 flex items-center gap-1">
                <Wrench className="w-3 h-3 text-emerald-400" />
                1st Service Break-in
              </span>
              <span className="font-mono font-bold text-white text-xs mt-1">
                750 km (30-45 Days)
              </span>
              <span className="text-[10px] text-zinc-400 mt-0.5">Mandatory oil & filter</span>
            </div>

            <div className="p-3 rounded-xl bg-[#111724] border border-[#1e2a40] flex flex-col">
              <span className="text-[10px] uppercase font-bold text-purple-400/90 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-purple-400" />
                Drive Chain Slack
              </span>
              <span className="font-mono font-bold text-white text-xs mt-1">
                25 mm - 30 mm
              </span>
              <span className="text-[10px] text-zinc-400 mt-0.5">Clean/Lube every 500 km</span>
            </div>
          </div>

          {/* Sections List */}
          {filteredSections.length === 0 ? (
            <div className="text-center py-12 bg-[#101520] border border-[#1f293d] rounded-2xl p-6">
              <HelpCircle className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
              <h4 className="font-bold text-white text-base">No manual topics found</h4>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                No sections matched "{searchQuery}". Try searching for words like 'oil', 'pressure', 'chain', 'speed', or 'filter'.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-4 px-3 py-1.5 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSections.map((sec) => {
                const IconComponent = SECTION_ICONS[sec.iconName] || BookOpen;
                const isExpanded = !!expandedSectionIds[sec.id];

                return (
                  <div
                    key={sec.id}
                    className="bg-[#101622] border border-[#1d273a] hover:border-[#2b3a54] rounded-2xl overflow-hidden transition-all duration-200 shadow-lg"
                  >
                    {/* Section Header Accordion Trigger */}
                    <button
                      type="button"
                      onClick={() => toggleSection(sec.id)}
                      className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 text-left bg-[#121927] hover:bg-[#162032] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-display font-bold text-sm sm:text-base text-white truncate">
                              {sec.title}
                            </h3>
                            {sec.badge && (
                              <span className="px-2 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {sec.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{sec.subtitle}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-zinc-500 hidden sm:inline font-mono">
                          {sec.items.length} items
                        </span>
                        <div className="w-6 h-6 rounded-lg bg-[#192233] flex items-center justify-center text-zinc-400">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-amber-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-zinc-400" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Section Accordion Content */}
                    {isExpanded && (
                      <div className="p-4 sm:p-5 space-y-4 border-t border-[#1a2333] divide-y divide-[#18202e]">
                        {sec.items.map((item, idx) => (
                          <div key={idx} className={idx === 0 ? '' : 'pt-4'}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <h4 className="font-display font-bold text-sm text-zinc-100 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                {item.title}
                              </h4>

                              {onAskAi && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    onAskAi(
                                      `From Bajaj Pulsar N160 User Manual: Tell me the complete official specifications, instructions, and precautions for "${item.title}".`
                                    )
                                  }
                                  className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                                >
                                  <Sparkles className="w-3 h-3 text-amber-400" />
                                  <span>Ask AI details</span>
                                </button>
                              )}
                            </div>

                            <p className="text-xs text-zinc-300 leading-relaxed mb-3">{item.details}</p>

                            {/* Spec Matrix / Key-Value Pairs */}
                            {item.specs && item.specs.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 my-2.5">
                                {item.specs.map((sp, sIdx) => (
                                  <div
                                    key={sIdx}
                                    className="p-2.5 rounded-xl bg-[#0a0e16] border border-[#161f2e] flex flex-col justify-between"
                                  >
                                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                                      {sp.label}
                                    </span>
                                    <span className="font-mono font-bold text-xs text-cyan-300 mt-1">
                                      {sp.value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Warning Box */}
                            {item.warning && (
                              <div className="mt-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-200">
                                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="text-red-300 block text-[11px] font-bold uppercase tracking-wider">
                                    Factory Caution / Warning
                                  </strong>
                                  <p className="mt-0.5">{item.warning}</p>
                                </div>
                              </div>
                            )}

                            {/* Pro Tip Box */}
                            {item.tip && (
                              <div className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
                                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="text-amber-300 block text-[11px] font-bold uppercase tracking-wider">
                                    Owner & Service Tip
                                  </strong>
                                  <p className="mt-0.5">{item.tip}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#101522] px-4 sm:px-6 py-3.5 border-t border-[#1b2438] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Pulsar N160 Digital Handbook (Dual-Channel ABS Edition)</span>
            <span className="text-zinc-600">·</span>
            <span>Ref: POR002202510033</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onOpenSchedule && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSchedule();
                }}
                className="px-3 py-1.5 rounded-xl bg-[#141b28] hover:bg-[#1a2334] text-zinc-300 hover:text-white border border-[#232f48] text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                <span>Service Schedule Guide</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs cursor-pointer shadow-md transition-all active:scale-95"
            >
              Close Manual
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
