import React, { useState } from 'react';
import { StickyNote, Plus, Trash2, Calendar, Gauge, Disc, Droplets, Zap, ShieldAlert, Sparkles } from 'lucide-react';
import { fmtDate, fmtKm, uid } from '../utils/formatters';
import { MaintenanceNote, NoteCategory } from '../types';

interface MaintenanceNotesProps {
  notes: MaintenanceNote[];
  currentOdo: number;
  onAddNote: (note: MaintenanceNote) => void;
  onDeleteNote: (id: string) => void;
}

const CATEGORIES: { key: NoteCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
  { key: 'chain', label: 'Drive Chain', icon: Disc },
  { key: 'oil', label: 'Oil & Fluids', icon: Droplets },
  { key: 'tyre', label: 'Tyres & Air', icon: Gauge },
  { key: 'wash', label: 'Wash & Polish', icon: Sparkles },
  { key: 'brake', label: 'Brakes', icon: ShieldAlert },
  { key: 'electrical', label: 'Battery / Elec', icon: Zap },
  { key: 'general', label: 'General', icon: StickyNote },
];

export const MaintenanceNotes: React.FC<MaintenanceNotesProps> = ({
  notes,
  currentOdo,
  onAddNote,
  onDeleteNote,
}) => {
  const [text, setText] = useState('');
  const [km, setKm] = useState(currentOdo.toString());
  const [category, setCategory] = useState<NoteCategory>('chain');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newNote: MaintenanceNote = {
      id: uid('note'),
      text: text.trim(),
      date: new Date().toISOString().slice(0, 10),
      km: km ? Number(km) : null,
      category,
    };

    onAddNote(newNote);
    setText('');
  };

  const filteredNotes = notes.filter((n) => {
    if (activeFilter === 'all') return true;
    return n.category === activeFilter;
  });

  const getCategoryIcon = (cat?: NoteCategory) => {
    const found = CATEGORIES.find((c) => c.key === cat);
    return found ? found.icon : StickyNote;
  };

  return (
    <div className="bg-[#171a21] border border-[#262b35] rounded-2xl p-5 sm:p-6 shadow-xl mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-amber-400" />
          <h2 className="font-display font-bold text-base sm:text-lg text-white tracking-wide">
            Garage Remarks & Quick Maintenance Notes
          </h2>
          <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#222732] text-amber-300 border border-[#31394a]">
            {notes.length}
          </span>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-amber-500 text-zinc-950 font-bold'
                : 'bg-[#212631] text-zinc-400 hover:text-white'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setActiveFilter(c.key)}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                activeFilter === c.key
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'bg-[#212631] text-zinc-400 hover:text-white'
              }`}
            >
              <c.icon className="w-3 h-3" />
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add Note Form */}
      <form onSubmit={handleSubmit} className="mb-5 p-3 rounded-xl bg-[#11141a] border border-[#262c37]">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-2">
          <div className="sm:col-span-7">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Quick log — chain lubed with Motul, tyre pressure filled to 28 PSI, oil level checked..."
              className="w-full bg-[#181c23] border border-[#2d3443] rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-amber-400 focus:outline-none"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <input
              type="number"
              value={km}
              onChange={(e) => setKm(e.target.value)}
              placeholder="km"
              className="w-full bg-[#181c23] border border-[#2d3443] rounded-xl px-3 py-2 text-xs font-mono text-amber-300 focus:border-amber-400 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as NoteCategory)}
              className="w-full bg-[#181c23] border border-[#2d3443] rounded-xl px-3 py-2 text-xs text-zinc-200 focus:border-amber-400 focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Remark
          </button>
        </div>
      </form>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-6 text-zinc-500 text-xs">
          No remarks logged for this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {filteredNotes.map((note) => {
            const Icon = getCategoryIcon(note.category);
            return (
              <div
                key={note.id}
                className="group bg-[#191d25] hover:bg-[#202530] border border-[#272c38] hover:border-amber-500/30 rounded-xl p-3 flex items-start justify-between gap-3 transition-all duration-200"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#12151b] border border-[#2a303e] flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-200 leading-snug break-words">
                      {note.text}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5 text-zinc-400" />
                        {fmtDate(note.date)}
                      </span>
                      {note.km !== null && note.km !== undefined && (
                        <span className="text-amber-300 font-semibold bg-[#12151b] px-1.5 py-0.2 rounded border border-[#272d3a]">
                          {fmtKm(note.km)}
                        </span>
                      )}
                      {note.category && (
                        <span className="uppercase text-[9px] tracking-wider text-zinc-400">
                          {note.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteNote(note.id)}
                  className="text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                  title="Delete note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
