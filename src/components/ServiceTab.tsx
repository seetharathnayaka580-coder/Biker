import React from 'react';
import { OdometerGauge } from './OdometerGauge';
import { ServiceLogger } from './ServiceLogger';
import { ServiceTimeline } from './ServiceTimeline';
import { AppState, ServiceRecord } from '../types';
import { Wrench, Gauge, PlusCircle, History, Sparkles, BookOpen } from 'lucide-react';

interface ServiceTabProps {
  state: AppState;
  isAdmin: boolean;
  onUpdateOdometer: (newOdo: number) => void;
  onUpdateTarget: (newTarget: number) => void;
  onAddService: (newService: ServiceRecord) => void;
  onDeleteService: (id: string) => void;
  onOpenScheduleGuide: () => void;
}

export const ServiceTab: React.FC<ServiceTabProps> = ({
  state,
  isAdmin,
  onUpdateOdometer,
  onUpdateTarget,
  onAddService,
  onDeleteService,
  onOpenScheduleGuide,
}) => {
  const currentTarget = state.targets[0] || 7688;
  const remainingKm = currentTarget - state.odometer;

  return (
    <div className="space-y-6">
      {/* Tab Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#171a23] via-[#1a1f2b] to-[#14161f] border border-[#272d3b] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-white uppercase tracking-wide">
                Service & Maintenance Management
              </h1>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-bold text-xs">
                {state.services.length} Records Logged
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Distance to next service tracking, new service logger & complete maintenance history
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenScheduleGuide}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Factory Schedule Guide</span>
        </button>
      </div>

      {/* Top 2-Column Grid: Distance to Next Service Gauge & Log New Service Record */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SECTION 1: Distance to Next Service & Odometer Gauge */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="flex items-center gap-2 mb-2 px-1">
            <Gauge className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Distance to Next Service & Odometer
            </h2>
          </div>
          <OdometerGauge
            odometer={state.odometer}
            targets={state.targets}
            services={state.services}
            isAdmin={isAdmin}
            onUpdateOdometer={onUpdateOdometer}
            onUpdateTarget={onUpdateTarget}
          />
        </div>

        {/* SECTION 2: Log New Service Record */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="flex items-center gap-2 mb-2 px-1">
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Log New Service Record
            </h2>
          </div>
          <ServiceLogger
            currentOdometer={state.odometer}
            servicesCount={state.services.length}
            isAdmin={isAdmin}
            onAddService={onAddService}
          />
        </div>
      </div>

      {/* SECTION 3: Service History Timeline */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Complete Service History & Timeline
            </h2>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            {state.services.length} verified inspection stamps
          </span>
        </div>
        <ServiceTimeline
          services={state.services}
          isAdmin={isAdmin}
          onDeleteService={onDeleteService}
        />
      </div>
    </div>
  );
};
