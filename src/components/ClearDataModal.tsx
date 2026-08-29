import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, Check, ShieldAlert, RotateCcw } from 'lucide-react';

interface ClearDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmClear: () => void;
  bikeName: string;
  regNo: string;
}

export const ClearDataModal: React.FC<ClearDataModalProps> = ({
  isOpen,
  onClose,
  onConfirmClear,
  bikeName,
  regNo,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const isConfirmed = confirmText.trim().toLowerCase() === 'clear';

  const handleClear = async () => {
    if (!isConfirmed) return;
    setIsProcessing(true);
    try {
      await onConfirmClear();
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#12151c] border border-red-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-red-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Clear All Bike Data</h2>
              <span className="text-xs text-red-300 font-mono">
                {bikeName} · {regNo}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Body */}
        <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 text-xs text-red-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-red-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>This action will permanently erase:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-zinc-300">
            <li>All logged maintenance & service history records</li>
            <li>All garage remarks, tyre checks & chain lube notes</li>
            <li>Reset odometer to 0 km and next service target to 2,500 km</li>
          </ul>
        </div>

        {/* Confirmation Input */}
        <div className="space-y-1.5">
          <label className="block text-xs text-zinc-300 font-medium">
            Type <strong className="text-red-400 font-mono">CLEAR</strong> below to confirm deletion:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type CLEAR"
            className="w-full bg-[#181c26] border border-[#2e3748] focus:border-red-500 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder:text-zinc-600 focus:outline-none"
            autoFocus
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-[#1a1f2c] hover:bg-[#252d40] border border-[#2b3548] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={!isConfirmed || isProcessing}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isConfirmed && !isProcessing
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30'
                : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-60'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isProcessing ? 'Erasing...' : 'Wipe & Clear All Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
