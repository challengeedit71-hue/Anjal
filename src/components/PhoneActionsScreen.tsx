import React, { useState } from 'react';
import {
  ArrowLeft,
  Phone,
  Camera,
  Settings,
  MessageCircle,
  Share2,
  Users,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle,
} from 'lucide-react';

interface PhoneActionsScreenProps {
  onBack: () => void;
  onNavigateToCamera: () => void;
}

interface InstalledApp {
  id: string;
  name: string;
  category: string;
  iconBg: string;
  intentUrl?: string;
  isFavorite?: boolean;
}

export const PhoneActionsScreen: React.FC<PhoneActionsScreenProps> = ({
  onBack,
  onNavigateToCamera,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [waMessage, setWaMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Installed apps representation
  const [apps, setApps] = useState<InstalledApp[]>([
    { id: 'phone', name: 'Phone Dialer (Angel Amit)', category: 'Communication', iconBg: 'bg-emerald-500', intentUrl: 'tel:+919876543210', isFavorite: true },
    { id: 'instagram', name: 'Instagram', category: 'Social', iconBg: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600', intentUrl: 'instagram://app', isFavorite: true },
    { id: 'telegram', name: 'Telegram', category: 'Social', iconBg: 'bg-gradient-to-tr from-sky-400 to-blue-600', intentUrl: 'tg://resolve', isFavorite: true },
    { id: 'whatsapp', name: 'WhatsApp', category: 'Social', iconBg: 'bg-emerald-600', intentUrl: 'https://wa.me/', isFavorite: true },
    { id: 'camera', name: 'System Camera', category: 'Media', iconBg: 'bg-red-500', isFavorite: true },
    { id: 'settings', name: 'Android Settings', category: 'System', iconBg: 'bg-slate-500', isFavorite: false },
    { id: 'chrome', name: 'Google Chrome', category: 'Browser', iconBg: 'bg-blue-500', intentUrl: 'https://google.com', isFavorite: false },
    { id: 'youtube', name: 'YouTube', category: 'Media', iconBg: 'bg-red-600', intentUrl: 'https://youtube.com', isFavorite: false },
    { id: 'maps', name: 'Google Maps', category: 'Navigation', iconBg: 'bg-teal-500', intentUrl: 'https://maps.google.com', isFavorite: false },
    { id: 'gmail', name: 'Gmail Workspace', category: 'Communication', iconBg: 'bg-red-500', intentUrl: 'mailto:', isFavorite: false },
  ]);

  const quickContacts = [
    { name: 'Angel Amit', number: '+919876543210' },
    { name: 'Emergency', number: '112' },
    { name: 'Office', number: '+1234567890' },
  ];

  const handleDialerAction = (numberToCall?: string) => {
    const num = (numberToCall || phoneNumber).trim();
    if (!num) {
      setActionNotice('Please enter a phone number to initiate call intent.');
      return;
    }
    // Android standard telephone intent
    window.location.href = `tel:${num}`;
    setActionNotice(`Initiated Android ACTION_DIAL intent for ${num}.`);
  };

  const handleWhatsAppAction = () => {
    const text = encodeURIComponent(waMessage.trim() || 'Hello from NOVA AI Assistant');
    const url = `https://api.whatsapp.com/send?text=${text}`;
    window.open(url, '_blank');
    setActionNotice('Dispatched WhatsApp share intent.');
  };

  const handleInstagramAction = () => {
    window.open('https://instagram.com', '_blank');
    setActionNotice('Opened Instagram application intent.');
  };

  const toggleFavorite = (id: string) => {
    setApps((prev) =>
      prev.map((app) => (app.id === id ? { ...app, isFavorite: !app.isFavorite } : app))
    );
  };

  const filteredApps = apps.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-full pb-24 pt-3 px-4 max-w-lg mx-auto select-none">
      {/* Top Header */}
      <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide uppercase">
            Phone Actions & System
          </h1>
          <p className="text-xs text-slate-400">Android intent dispatch & system hardware nodes</p>
        </div>
      </div>

      {/* Action Notice Banner */}
      {actionNotice && (
        <div className="mt-3 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Security & Permissions Callout (Legitimate Android APIs) */}
      <div className="mt-3 p-3.5 rounded-2xl bg-[#14141e] border border-white/5 text-xs">
        <div className="flex items-center space-x-2 text-red-400 font-bold uppercase tracking-wider text-[11px] mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>AK Editor Amit • Android Security & Permissions</span>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          Operates strictly within legitimate Android Intents (<code className="text-red-400">ACTION_DIAL</code>, <code className="text-red-400">ACTION_SEND</code>, <code className="text-red-400">ACTION_IMAGE_CAPTURE</code>). You can say <strong>"Hey Angel, call 9876543210"</strong> or <strong>"Open WhatsApp"</strong> from anywhere. System passwords and protected locks remain securely isolated.
        </p>
      </div>

      {/* Section 1: Phone Dialer & Contacts */}
      <div className="mt-4 p-4 rounded-2xl bg-[#14141e] border border-white/10">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Phone className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            Telephone & Dialer Intent
          </h2>
        </div>

        <div className="flex items-center space-x-2 mb-3">
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter telephone number..."
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
          <button
            onClick={() => handleDialerAction()}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow active:scale-95 transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call</span>
          </button>
        </div>

        {/* Quick Contacts */}
        <div className="flex items-center space-x-2 pt-2 border-t border-white/5">
          <span className="text-[10px] text-slate-500 uppercase font-mono">Quick:</span>
          {quickContacts.map((c, i) => (
            <button
              key={i}
              onClick={() => handleDialerAction(c.number)}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 border border-white/5 transition-colors"
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Section 2: Social Intents (WhatsApp & Instagram) */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {/* WhatsApp Card */}
        <div className="p-3.5 rounded-2xl bg-[#14141e] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center text-white">
                <MessageCircle className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-white">WhatsApp</span>
            </div>
            <textarea
              rows={2}
              value={waMessage}
              onChange={(e) => setWaMessage(e.target.value)}
              placeholder="Message to share..."
              className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-[11px] text-white placeholder-slate-500 focus:outline-none resize-none mb-2"
            />
          </div>
          <button
            onClick={handleWhatsAppAction}
            className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center justify-center space-x-1 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Send Intent</span>
          </button>
        </div>

        {/* Instagram Card */}
        <div className="p-3.5 rounded-2xl bg-[#14141e] border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white">
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-white">Instagram</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Launch verified Instagram app launcher or account review page.
            </p>
          </div>
          <button
            onClick={handleInstagramAction}
            className="w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center justify-center space-x-1 border border-white/10 transition-colors"
          >
            <span>Launch App</span>
          </button>
        </div>
      </div>

      {/* Section 3: App Launcher & Installed Packages (Section 8 Compliance) */}
      <div className="mt-4 p-4 rounded-2xl bg-[#14141e] border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-red-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              App Launcher Nodes
            </h2>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {apps.length} apps registered
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search installed applications..."
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* App List */}
        <div className="grid grid-cols-3 gap-2">
          {filteredApps.map((app) => (
            <button
              key={app.id}
              onClick={() => {
                if (app.id === 'camera') {
                  onNavigateToCamera();
                } else if (app.intentUrl) {
                  window.open(app.intentUrl, '_blank');
                  setActionNotice(`Launched ${app.name}`);
                } else {
                  setActionNotice(`Requested ${app.name} launch via Android intent package`);
                }
              }}
              className="flex flex-col items-center p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-all text-center group"
            >
              <div
                className={`w-9 h-9 rounded-xl ${app.iconBg} flex items-center justify-center text-white mb-1.5 shadow-md group-hover:scale-105 transition-transform`}
              >
                <span className="text-xs font-bold uppercase">
                  {app.name.slice(0, 2)}
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-200 truncate w-full">
                {app.name}
              </span>
              <span className="text-[9px] text-slate-500 mt-0.5">{app.category}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
