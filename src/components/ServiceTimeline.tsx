import React, { useState } from 'react';
import { History, Lock, Trash2, Calendar, MapPin, Search, CheckCircle, Tag, DollarSign } from 'lucide-react';
import { fmtDate, fmtKm } from '../utils/formatters';
import { ServiceRecord } from '../types';

interface ServiceTimelineProps {
  services: ServiceRecord[];
  onDeleteService: (id: string) => void;
}

export const ServiceTimeline: React.FC<ServiceTimelineProps> = ({
  services,
  onDeleteService,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = services
    .filter((s) => {
      const term = searchTerm.toLowerCase();
      return (
        s.label.toLowerCase().includes(term) ||
        s.dealer.toLowerCase().includes(term) ||
        s.note.toLowerCase().includes(term) ||
        s.km.toString().includes(term) ||
        s.date.includes(term)
      );
    })
    .sort((a, b) => (sortAsc ? a.km - b.km : b.km - a.km));

  // Compute intervals between consecutive sorted services
  const sortedByKm = [...services].sort((a, b) => a.km - b.km);
  const totalCost = services.reduce((acc, curr) => acc + (curr.cost || 0), 0);

  return (
    <div className="bg-[#171a21] border border-[#262b35] rounded-2xl p-5 sm:p-6 shadow-xl mb-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <History className="w-5 h-5 text-amber-400" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-base sm:text-lg text-white tracking-wide">
                Service History Log
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#222732] text-amber-300 border border-[#31394a]">
                {services.length} Records
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Complete official logs & workshop maintenance entries
            </p>
          </div>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search history..."
              className="w-full bg-[#11141a] border border-[#2d3442] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-300 bg-[#222732] hover:bg-[#2c3240] border border-[#313847] transition-colors whitespace-nowrap cursor-pointer"
          >
            {sortAsc ? 'Oldest first' : 'Newest first'}
          </button>
        </div>
      </div>

      {/* Quick Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5 p-3 rounded-xl bg-[#11141a] border border-[#222732]">
        <div>
          <span className="text-[10px] uppercase font-semibold text-zinc-500 block">Total Services</span>
          <span className="font-mono text-sm font-bold text-white">{services.length} completed</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-zinc-500 block">First Service</span>
          <span className="font-mono text-sm font-semibold text-zinc-300">
            {sortedByKm[0] ? fmtKm(sortedByKm[0].km) : '—'}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-zinc-500 block">Latest Service</span>
          <span className="font-mono text-sm font-semibold text-amber-300">
            {sortedByKm.length ? fmtKm(sortedByKm[sortedByKm.length - 1].km) : '—'}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-semibold text-zinc-500 block">Total Spend</span>
          <span className="font-mono text-sm font-semibold text-emerald-400">
            {totalCost > 0 ? `${totalCost.toLocaleString()} LKR` : 'Free / Standard'}
          </span>
        </div>
      </div>

      {/* Timeline List */}
      {filtered.length === 0 ? (
        <div className="text-center py-8 text-zinc-500 text-xs">
          No service records matching your search.
        </div>
      ) : (
        <div className="relative pl-4 sm:pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#2a303c]">
          {filtered.map((service, _index) => {
            // Find interval since previous service
            const currentIndex = sortedByKm.findIndex((s) => s.id === service.id);
            const prevService = currentIndex > 0 ? sortedByKm[currentIndex - 1] : null;
            const kmDifference = prevService ? service.km - prevService.km : null;

            return (
              <div
                key={service.id}
                className="relative bg-[#191d25] hover:bg-[#1e232d] border border-[#272d39] hover:border-amber-500/30 rounded-xl p-4 transition-all duration-200 shadow-md group"
              >
                {/* Timeline node dot */}
                <div className="absolute -left-[23px] sm:-left-[31px] top-4 w-4 h-4 rounded-full bg-[#11141a] border-2 border-emerald-400 flex items-center justify-center shadow-md">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#262c37] mb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold text-base text-white tracking-wide">
                      {service.label}
                    </span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                      {fmtKm(service.km)}
                    </span>
                    {kmDifference && (
                      <span className="text-[11px] font-mono text-zinc-400 bg-[#13161c] px-2 py-0.5 rounded">
                        +{kmDifference} km span
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      {fmtDate(service.date)}
                    </span>
                    {service.cost ? (
                      <span className="font-mono text-emerald-400 font-semibold flex items-center gap-0.5">
                        <DollarSign className="w-3 h-3" />
                        {service.cost.toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Workshop / Dealer */}
                <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium mb-2">
                  <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>{service.dealer || 'M.V. Electronic & D.S. Motors'}</span>
                </div>

                {/* Note / Work Done */}
                {service.note && (
                  <p className="text-xs text-zinc-300 leading-relaxed bg-[#12151b] p-2.5 rounded-lg border border-[#222732] mb-2.5">
                    {service.note}
                  </p>
                )}

                {/* Parts replaced pills if available */}
                {service.partsReplaced && service.partsReplaced.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {service.partsReplaced.map((part, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#222733] text-zinc-300 border border-[#303847]"
                      >
                        <Tag className="w-2.5 h-2.5 text-amber-400" />
                        {part}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer bar with Lock or Delete */}
                <div className="flex items-center justify-between text-[11px] pt-1">
                  {service.locked ? (
                    <span className="inline-flex items-center gap-1 text-zinc-400 font-mono">
                      <Lock className="w-3 h-3 text-amber-400" />
                      Locked Factory Record (BKT-1374)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-zinc-400">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      User Recorded Entry
                    </span>
                  )}

                  {!service.locked && (
                    <button
                      onClick={() => onDeleteService(service.id)}
                      className="text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer px-2 py-0.5 rounded hover:bg-red-500/10"
                      title="Remove this service record"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
