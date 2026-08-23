import React from 'react';
import { X, Printer, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';
import { AppState } from '../types';
import { fmtDate, fmtKm } from '../utils/formatters';

interface PrintBookletModalProps {
  state: AppState;
  onClose: () => void;
}

export const PrintBookletModal: React.FC<PrintBookletModalProps> = ({ state, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const sortedServices = [...state.services].sort((a, b) => a.km - b.km);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl bg-white text-zinc-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print bg-[#14171d] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#252a35]">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-amber-400" />
            <h3 className="font-display font-bold text-base tracking-wide">
              Official Service Log Book — Print & Export
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Booklet Content */}
        <div className="p-6 sm:p-8 overflow-y-auto font-sans text-xs print:p-0 print:text-black">
          {/* Header & Logo */}
          <div className="border-b-2 border-zinc-900 pb-4 mb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold font-display uppercase tracking-wider text-zinc-900">
                  BAJAJ PULSAR N160
                </h1>
                <span className="bg-zinc-900 text-white font-mono font-bold px-2 py-0.5 rounded text-xs">
                  {state.vehicle.regNo}
                </span>
              </div>
              <p className="text-sm font-semibold text-zinc-600 tracking-wide mt-0.5">
                OFFICIAL VEHICLE SERVICE & MAINTENANCE LOG BOOK
              </p>
            </div>

            <div className="text-right">
              <div className="font-mono text-xs font-bold text-zinc-900">
                BOOK NO: {state.vehicle.bookNo}
              </div>
              <div className="text-[11px] text-zinc-500">
                Generated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Vehicle & Owner Dossier */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 border border-zinc-200 rounded-xl p-4 mb-6">
            <div>
              <span className="block text-[10px] uppercase font-bold text-zinc-500">Registered Owner</span>
              <span className="font-bold text-zinc-900 text-sm">{state.vehicle.owner}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-zinc-500">Vehicle Model</span>
              <span className="font-bold text-zinc-900">{state.vehicle.model}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-zinc-500">Colour</span>
              <span className="font-semibold text-zinc-900">{state.vehicle.colour}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-zinc-500">Current Odometer</span>
              <span className="font-mono font-bold text-zinc-900 text-sm">{fmtKm(state.odometer)}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="block text-[10px] uppercase font-bold text-zinc-500">Chassis / Frame Number</span>
              <span className="font-mono font-bold text-zinc-800">{state.vehicle.chassisNo}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="block text-[10px] uppercase font-bold text-zinc-500">Engine Number</span>
              <span className="font-mono font-bold text-zinc-800">{state.vehicle.engineNo}</span>
            </div>
          </div>

          {/* Official Service Records Table */}
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Service Stamps & Maintenance Records
            </h2>
            <table className="w-full border-collapse text-left text-xs border border-zinc-300">
              <thead>
                <tr className="bg-zinc-100 border-b border-zinc-300 font-bold text-zinc-800">
                  <th className="p-2 border-r border-zinc-300 w-12 text-center">#</th>
                  <th className="p-2 border-r border-zinc-300 w-28">Service</th>
                  <th className="p-2 border-r border-zinc-300 w-24">Date</th>
                  <th className="p-2 border-r border-zinc-300 w-24">Odometer</th>
                  <th className="p-2 border-r border-zinc-300 w-44">Workshop / Dealer</th>
                  <th className="p-2 border-r border-zinc-300">Work Details & Remarks</th>
                  <th className="p-2 w-20 text-center">Stamp</th>
                </tr>
              </thead>
              <tbody>
                {sortedServices.map((service, idx) => (
                  <tr key={service.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                    <td className="p-2 border-r border-zinc-200 text-center font-mono font-bold">{idx + 1}</td>
                    <td className="p-2 border-r border-zinc-200 font-bold text-zinc-900">{service.label}</td>
                    <td className="p-2 border-r border-zinc-200 font-mono">{fmtDate(service.date)}</td>
                    <td className="p-2 border-r border-zinc-200 font-mono font-bold">{fmtKm(service.km)}</td>
                    <td className="p-2 border-r border-zinc-200 font-medium">{service.dealer}</td>
                    <td className="p-2 border-r border-zinc-200 leading-relaxed text-zinc-700">{service.note}</td>
                    <td className="p-2 text-center">
                      <div className="border border-dashed border-emerald-600 rounded px-1 py-0.5 text-[9px] font-bold text-emerald-700 uppercase">
                        VERIFIED
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Periodic Notes Log */}
          {state.notes.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 mb-2">
                Intermediate Garage Maintenance & Notes
              </h2>
              <div className="grid grid-cols-2 gap-2 border border-zinc-200 p-3 rounded-lg bg-zinc-50">
                {state.notes.map((note) => (
                  <div key={note.id} className="border-b border-zinc-200 pb-1.5 text-[11px]">
                    <div className="font-semibold text-zinc-800">{note.text}</div>
                    <div className="font-mono text-[10px] text-zinc-500">
                      {fmtDate(note.date)} {note.km ? `· ${fmtKm(note.km)}` : ''} · {note.category?.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verification & Signatures Footer */}
          <div className="mt-8 pt-4 border-t-2 border-zinc-300 grid grid-cols-3 gap-6 text-center text-[11px] text-zinc-600">
            <div>
              <div className="h-10 border-b border-zinc-400 mb-1"></div>
              <span className="font-semibold">Owner Signature</span>
            </div>
            <div>
              <div className="h-10 border-b border-zinc-400 mb-1 flex items-center justify-center">
                <span className="font-mono text-[10px] text-zinc-400">M.V. Electronic & D.S. Motors</span>
              </div>
              <span className="font-semibold">Authorized Dealer Seal</span>
            </div>
            <div>
              <div className="h-10 border-b border-zinc-400 mb-1"></div>
              <span className="font-semibold">Inspection Date & Stamp</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
