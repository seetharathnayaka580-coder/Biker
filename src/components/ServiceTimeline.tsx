import React, { useState } from 'react';
import { History, Lock, Trash2, Calendar, MapPin, Search, CheckCircle, Tag, DollarSign } from 'lucide-react';
import { fmtDate, fmtKm } from '../utils/formatters';
import { ServiceRecord } from '../types';

interface ServiceTimelineProps {
  services: ServiceRecord[];
  isAdmin?: boolean;
  onDeleteService: (id: string) => void;
}

export const ServiceTimeline: React.FC<ServiceTimelineProps> = ({
  services,
  isAdmin = true,
  onDeleteService,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = services
    .filter(
      (s) =>
        s.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.dealer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.km.toString().includes(searchTerm)
    )
    .sort((a, b) => (sortAsc ? a.km - b.km : b.km - a.km));

  return (
    <div className="bg-[#131722] border border-[#232a3a] rounded-2xl p-5 sm:p-6 shadow-xl mb-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-base sm:text-lg text-white tracking-wide">
              Service History
            </h2>
            <p className="text-xs text-zinc-400">Chronological service events and official maintenance logs</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search services..."
              className="w-full bg-[#0d1017] border border-[#262c3b] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={() => setSortAsc(!sortAsc)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 bg-[#1a202d] hover:bg-[#232b3d] border border-[#2c374d] transition-colors cursor-pointer whitespace-nowrap"
          >
            {sortAsc ? 'Oldest first' : 'Newest first'}
          </button>
        </div>
      </div>

      {/* Timeline List */}
      {filtered.length === 0 ? (
        <div className="text-center py-8 text-zinc-500 text-xs bg-[#0e111a] rounded-xl border border-[#1f2533]">
          No service records found.
        </div>
      ) : (
        <div className="relative pl-4 sm:pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#232938]">
          {filtered.map((service) => (
            <div
              key={service.id}
              className="relative bg-[#151924] hover:bg-[#181d2b] border border-[#252c3c] hover:border-amber-500/30 rounded-xl p-4 sm:p-5 transition-all duration-200 shadow-md group"
            >
              {/* Timeline node */}
              <div className="absolute -left-[23px] sm:-left-[31px] top-5 w-4 h-4 rounded-full bg-[#0d1017] border-2 border-emerald-400 flex items-center justify-center shadow-md">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>

              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#212735] mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-base text-white tracking-wide">
                    {service.label}
                  </span>
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/25 font-bold">
                    {fmtKm(service.km)}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    {fmtDate(service.date)}
                  </span>

                  {service.cost ? (
                    <span className="font-mono text-emerald-400 font-bold flex items-center gap-0.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                      <DollarSign className="w-3 h-3" />
                      {service.cost.toLocaleString()} LKR
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Dealer location */}
              <div className="flex items-center gap-1.5 text-xs text-zinc-300 mb-2 font-medium">
                <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>{service.dealer || 'M.V. Electronic & D.S. Motors'}</span>
              </div>

              {/* Notes */}
              {service.note && (
                <p className="text-xs text-zinc-300 leading-relaxed bg-[#0e111a] p-3 rounded-xl border border-[#202636] mb-3">
                  {service.note}
                </p>
              )}

              {/* Parts replaced chips */}
              {service.partsReplaced && service.partsReplaced.length > 0 && (
                <div className="mb-3">
                  <div className="text-[10px] uppercase font-semibold text-zinc-500 mb-1 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-amber-400" />
                    Parts Replaced & Tasks
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {service.partsReplaced.map((part, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#1a202d] text-zinc-200 border border-[#2a3449]"
                      >
                        <CheckCircle className="w-2.5 h-2.5 text-amber-400" />
                        {part}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#1f2533]">
                {service.locked ? (
                  <span className="inline-flex items-center gap-1 text-zinc-400 font-mono">
                    <Lock className="w-3 h-3 text-amber-400" />
                    Verified Official Record (BKT-1374)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-zinc-400">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    User Recorded Entry
                  </span>
                )}

                {isAdmin && !service.locked && (
                  <button
                    type="button"
                    onClick={() => onDeleteService(service.id)}
                    className="text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer px-2 py-0.5 rounded hover:bg-red-500/10"
                    title="Delete service entry"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
