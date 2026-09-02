import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Crown,
  Sparkles,
  Phone,
  Send,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Bike,
  Mail,
  MapPin,
  Clock,
  Zap,
  Award,
  BadgeCheck,
  CheckCircle2,
  Wrench,
  HelpCircle,
  Code2,
  FileCode2,
  Cpu,
  Share2,
  QrCode,
  Smartphone,
  HeartHandshake,
} from 'lucide-react';
import { AppState, VehicleDetails } from '../types';
import { fmtKm } from '../utils/formatters';

interface AppOwnerTabProps {
  state: AppState;
  isAdmin: boolean;
  onNavigateToTab?: (tab: 'home' | 'vehicle' | 'service' | 'notes' | 'dealers' | 'owner') => void;
}

export const AppOwnerTab: React.FC<AppOwnerTabProps> = ({ state, isAdmin, onNavigateToTab }) => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('general');
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);

  // App Owner Contact Coordinates from user prompt
  const ownerDetails = {
    name: 'Sachintha Pathum',
    title: 'Official App Owner & Lead System Creator',
    roleBadge: 'Verified Master Creator & Admin',
    whatsappRaw: '+94763961123',
    whatsappDisplay: '+94 76 396 1123',
    whatsappLocal: '076 396 1123',
    telegramHandle: 'X_x_x_xzZ',
    telegramDisplay: '@X_x_x_xzZ',
    location: 'Western Province, Sri Lanka',
    status: 'Available for Support & Customization',
    responseTime: 'Usually replies within minutes',
    bikeModel: state.vehicle.model || 'Bajaj Pulsar N160 Dual-Channel ABS',
    bikeRegNo: state.vehicle.regNo || 'BKT-1374',
    appVersion: 'v2.6.0 Enchanted Edition',
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(key);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  // Preset topics for quick 1-click message composition
  const topicPresets: Record<string, { label: string; icon: typeof Wrench; template: string }> = {
    general: {
      label: 'General Inquiry',
      icon: MessageCircle,
      template: 'Hi Sachintha, I am contacting you regarding your Bike Service Log Book application.',
    },
    maintenance: {
      label: 'Maintenance & Service Advice',
      icon: Wrench,
      template: `Hi Sachintha, I would like to ask some maintenance and service advice regarding my ${ownerDetails.bikeModel}.`,
    },
    feature: {
      label: 'Feature Request / Idea',
      icon: Sparkles,
      template: 'Hi Sachintha, I have an awesome feature suggestion for the Bike Service Log Book app:',
    },
    garage: {
      label: 'Garage / Service Center Listing',
      icon: MapPin,
      template: 'Hi Sachintha, I would like to add / recommend a service center or garage to the Bajaj locator map.',
    },
    support: {
      label: 'App Support / Account Setup',
      icon: HelpCircle,
      template: 'Hi Sachintha, I need some assistance with the app settings and cloud sync.',
    },
  };

  // Compile final message with optional bike diagnostics
  const getCompiledMessage = () => {
    const base = customMessage.trim() || topicPresets[selectedTopic]?.template || topicPresets.general.template;
    if (!includeDiagnostics) {
      return base;
    }

    const currentTarget = state.targets[0] || 7688;
    const remainingKm = currentTarget - state.odometer;

    const diagInfo = `\n\n📌 [Vehicle Snapshot]\n• Bike: ${ownerDetails.bikeModel}\n• Plate: ${ownerDetails.bikeRegNo}\n• Current Odometer: ${fmtKm(state.odometer)}\n• Next Service Due: ${fmtKm(currentTarget)} (${remainingKm > 0 ? `${fmtKm(remainingKm)} remaining` : 'Overdue'})\n• Total Logs: ${state.services.length} records, ${state.notes.length} notes`;

    return `${base}${diagInfo}`;
  };

  const handleSendWhatsApp = () => {
    const message = encodeURIComponent(getCompiledMessage());
    const url = `https://wa.me/94763961123?text=${message}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSendTelegram = () => {
    const message = encodeURIComponent(getCompiledMessage());
    // Direct link to Telegram handle
    const url = `https://t.me/X_x_x_xzZ?text=${message}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Enchanted Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c121e] via-[#090d16] to-[#05070b] border border-cyan-500/30 p-5 sm:p-8 shadow-2xl shadow-cyan-950/40">
        {/* Enchanted Rainbow Ambient Line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rose-500 via-amber-400 via-emerald-400 via-cyan-400 via-blue-500 to-purple-500 animate-rainbow" />

        {/* Ambient Glow Orbs */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute center w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Owner Profile Identification */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* Animated Avatar Frame */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-[2px] bg-gradient-to-tr from-cyan-400 via-purple-500 to-amber-400 animate-rainbow shadow-xl shadow-cyan-500/20 overflow-hidden flex items-center justify-center">
                <div className="w-full h-full bg-[#090d16] rounded-[14px] p-1 flex items-center justify-center overflow-hidden">
                  {state.vehicle.ownerPhotoUrl ? (
                    <img
                      src={state.vehicle.ownerPhotoUrl}
                      alt={ownerDetails.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-950/60 to-purple-950/60 rounded-xl flex flex-col items-center justify-center text-cyan-300">
                      <Crown className="w-10 h-10 text-amber-400 mb-1 drop-shadow animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">Creator</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Online Indicator Badge */}
              <div className="absolute -bottom-1 -right-1 flex items-center gap-1 bg-[#090d16] border border-emerald-500/50 px-2 py-0.5 rounded-full shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute" />
                <span className="text-[10px] font-bold text-emerald-400 ml-2 font-mono">ONLINE</span>
              </div>
            </div>

            {/* Identity Details */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400/20 via-yellow-400/20 to-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-black flex items-center gap-1 shadow-sm">
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  APP OWNER & LEAD CREATOR
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Official Verified
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-display font-black tracking-wide text-white flex items-center justify-center sm:justify-start gap-2">
                {ownerDetails.name}
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              </h1>

              <p className="text-sm text-zinc-300 max-w-lg leading-relaxed">
                Lead Creator and Owner of the <span className="text-cyan-300 font-semibold">{ownerDetails.bikeModel}</span> Official Digital Log Book and Service Locator system.
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-zinc-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  {ownerDetails.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {ownerDetails.responseTime}
                </span>
                <span className="flex items-center gap-1">
                  <Bike className="w-3.5 h-3.5 text-cyan-400" />
                  Plate: <strong className="text-zinc-200 font-mono">{ownerDetails.bikeRegNo}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Direct Launch Action Buttons */}
          <div className="flex flex-row sm:flex-col gap-3 w-full sm:w-auto shrink-0">
            {/* Direct WhatsApp Button */}
            <a
              href={`https://wa.me/94763961123?text=${encodeURIComponent("Hi Sachintha! I'm reaching out from the Bike Service Log Book app.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all transform hover:scale-105 active:scale-95 cursor-pointer group"
            >
              <MessageCircle className="w-5 h-5 fill-white group-hover:rotate-12 transition-transform" />
              <span>WhatsApp Me</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            {/* Direct Telegram Button */}
            <a
              href="https://t.me/X_x_x_xzZ"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all transform hover:scale-105 active:scale-95 cursor-pointer group"
            >
              <Send className="w-5 h-5 fill-white group-hover:translate-x-1 transition-transform" />
              <span>Telegram Chat</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Primary Direct Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* CARD 1: WHATSAPP DIRECT CONTACT CARD */}
        <div className="rounded-2xl bg-gradient-to-b from-[#0e1713] via-[#0a110e] to-[#070c0a] border border-emerald-500/30 p-6 shadow-xl relative overflow-hidden group hover:border-emerald-400/60 transition-all">
          {/* Subtle top accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <MessageCircle className="w-6 h-6 text-white fill-white" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
                  Primary Messaging
                </span>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  WhatsApp Direct
                </h2>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 font-mono">
              <Zap className="w-3 h-3 text-emerald-400" />
              Active 24/7
            </span>
          </div>

          <p className="text-sm text-zinc-300 mb-5 leading-relaxed">
            Message directly on WhatsApp for immediate support, feature feedback, service maintenance inquiries, or customized Pulsar N160 setups.
          </p>

          {/* Number Display with Copy Actions */}
          <div className="bg-[#050a07] border border-emerald-500/20 rounded-xl p-3.5 mb-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">International Format:</span>
              <div className="flex items-center gap-2">
                <code className="font-mono font-black text-base text-emerald-300">
                  {ownerDetails.whatsappDisplay}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopy('wa_intl', ownerDetails.whatsappRaw)}
                  className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 transition-colors cursor-pointer"
                  title="Copy Phone Number"
                >
                  {copiedItem === 'wa_intl' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-emerald-500/10">
              <span className="text-xs text-zinc-400">Local Dial Format:</span>
              <div className="flex items-center gap-2">
                <code className="font-mono font-bold text-sm text-zinc-300">
                  {ownerDetails.whatsappLocal}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopy('wa_local', ownerDetails.whatsappLocal.replace(/\s+/g, ''))}
                  className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                  title="Copy Local Number"
                >
                  {copiedItem === 'wa_local' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3">
            <a
              href={`https://wa.me/94763961123?text=${encodeURIComponent("Hi Sachintha! I'm contacting you via WhatsApp regarding the Bike Service Log Book.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-zinc-950" />
              <span>Chat on WhatsApp</span>
            </a>

            <a
              href="tel:+94763961123"
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-sm font-semibold transition-all cursor-pointer"
              title="Call Directly"
            >
              <Phone className="w-4 h-4" />
              <span>Call</span>
            </a>
          </div>
        </div>

        {/* CARD 2: TELEGRAM DIRECT CONTACT CARD */}
        <div className="rounded-2xl bg-gradient-to-b from-[#0c141d] via-[#090e16] to-[#060a0f] border border-sky-500/30 p-6 shadow-xl relative overflow-hidden group hover:border-sky-400/60 transition-all">
          {/* Subtle top accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-500 to-blue-500" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
                <Send className="w-6 h-6 text-white fill-white" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-sky-400 uppercase">
                  Instant Telegram
                </span>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Telegram Channel
                </h2>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1 font-mono">
              <Zap className="w-3 h-3 text-sky-400" />
              High Speed
            </span>
          </div>

          <p className="text-sm text-zinc-300 mb-5 leading-relaxed">
            Connect over Telegram with owner username <span className="text-sky-300 font-mono font-bold">@X_x_x_xzZ</span> for developer inquiries, bot integrations, and swift discussions.
          </p>

          {/* Username Display with Copy Actions */}
          <div className="bg-[#05080c] border border-sky-500/20 rounded-xl p-3.5 mb-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Telegram Username:</span>
              <div className="flex items-center gap-2">
                <code className="font-mono font-black text-base text-sky-300">
                  {ownerDetails.telegramDisplay}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopy('tg_user', ownerDetails.telegramDisplay)}
                  className="p-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/30 text-sky-300 transition-colors cursor-pointer"
                  title="Copy Telegram Username"
                >
                  {copiedItem === 'tg_user' ? (
                    <Check className="w-4 h-4 text-sky-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-sky-500/10">
              <span className="text-xs text-zinc-400">Direct Link:</span>
              <div className="flex items-center gap-2">
                <code className="font-mono text-xs text-zinc-400 truncate max-w-[180px]">
                  https://t.me/X_x_x_xzZ
                </code>
                <button
                  type="button"
                  onClick={() => handleCopy('tg_url', 'https://t.me/X_x_x_xzZ')}
                  className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                  title="Copy Link URL"
                >
                  {copiedItem === 'tg_url' ? (
                    <Check className="w-3.5 h-3.5 text-sky-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3">
            <a
              href="https://t.me/X_x_x_xzZ"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-sm transition-all shadow-md shadow-sky-500/20 cursor-pointer"
            >
              <Send className="w-4 h-4 fill-white" />
              <span>Launch in Telegram</span>
            </a>

            <button
              type="button"
              onClick={() => handleCopy('tg_full', '@X_x_x_xzZ')}
              className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-sm font-semibold transition-all cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedItem === 'tg_full' ? 'Copied!' : 'Copy Handle'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Smart Message Composer with Live Diagnostic Snapshot */}
      <div className="rounded-2xl bg-[#090d15] border border-[#1d273a] p-5 sm:p-7 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1a2333] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">
                Interactive Message Station
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select a topic or compose a custom inquiry to send directly to the app owner via WhatsApp or Telegram with 1-click.
            </p>
          </div>

          {/* Include Diagnostics Toggle */}
          <label className="flex items-center gap-2 text-xs text-zinc-300 bg-[#0d131f] border border-[#1f2b3e] px-3 py-1.5 rounded-xl cursor-pointer hover:border-cyan-500/40 transition-colors">
            <input
              type="checkbox"
              checked={includeDiagnostics}
              onChange={(e) => setIncludeDiagnostics(e.target.checked)}
              className="rounded accent-cyan-500 w-4 h-4 cursor-pointer"
            />
            <span>Attach Live Bike Snapshot (Odo & Reg)</span>
          </label>
        </div>

        {/* Topic Pill Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300">Choose Quick Subject Preset:</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(topicPresets).map(([key, item]) => {
              const isSelected = selectedTopic === key;
              const Icon = item.icon;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedTopic(key);
                    setCustomMessage(item.template);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 border border-cyan-300'
                      : 'bg-[#0d121c] text-zinc-300 hover:text-white border border-[#1a2333] hover:border-zinc-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message Input Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300">Message Content:</label>
            <span className="text-[11px] font-mono text-zinc-500">Live preview ready</span>
          </div>

          <textarea
            rows={3}
            value={customMessage || topicPresets[selectedTopic]?.template || ''}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Type your message here..."
            className="w-full rounded-xl bg-[#05080e] border border-[#1a2333] focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 outline-none resize-none font-sans transition-colors"
          />

          {includeDiagnostics && (
            <div className="bg-[#060a12] border border-[#141e2e] rounded-xl p-3 text-xs font-mono text-cyan-300/80 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">
                Attached Telemetry Data:
              </span>
              <p className="text-[11px] text-zinc-400">
                • {ownerDetails.bikeModel} ({ownerDetails.bikeRegNo}) · Odo: {fmtKm(state.odometer)} · Service Target: {fmtKm(state.targets[0] || 7688)}
              </p>
            </div>
          )}
        </div>

        {/* Send Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-zinc-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Clicking below opens the app directly with your compiled message</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-zinc-950" />
              <span>Send to WhatsApp (+94 763961123)</span>
            </button>

            <button
              type="button"
              onClick={handleSendTelegram}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-zinc-950 font-black text-xs transition-all shadow-md shadow-sky-500/20 cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4 fill-zinc-950" />
              <span>Send to Telegram (@X_x_x_xzZ)</span>
            </button>
          </div>
        </div>
      </div>

      {/* App Architecture, Owner System Badges & Technical Credentials */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-[#090d15] border border-[#1a2333] p-4 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Full Access Admin</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Creator privileges with root database permissions and live cloud backup.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-[#090d15] border border-[#1a2333] p-4 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Live Firestore Sync</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Realtime multi-device synchronization with offline fallback persistence.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-[#090d15] border border-[#1a2333] p-4 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Certified Bajaj Specs</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Accurate factory torque, tyre pressure, and Motul 7100 20W-50 oil specs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
