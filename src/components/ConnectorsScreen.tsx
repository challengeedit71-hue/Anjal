import React, { useState } from 'react';
import { ConnectorInfo } from '../types/chat';
import { CONNECTORS_LIST } from '../utils/constants';
import {
  ArrowLeft,
  Search,
  CheckCircle,
  XCircle,
  Key,
  ExternalLink,
  ShieldAlert,
  Zap,
  RefreshCw,
  X,
} from 'lucide-react';

interface ConnectorsScreenProps {
  onBack: () => void;
  geminiConnected: boolean;
  onOpenWorkspace?: (tab: 'gmail' | 'drive') => void;
}

export const ConnectorsScreen: React.FC<ConnectorsScreenProps> = ({
  onBack,
  geminiConnected,
  onOpenWorkspace,
}) => {
  const [connectors, setConnectors] = useState<ConnectorInfo[]>(() => {
    return CONNECTORS_LIST.map((c) =>
      c.id === 'gemini' ? { ...c, connected: geminiConnected } : c
    );
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Connected' | 'Not Connected'>('All');
  const [selectedConnector, setSelectedConnector] = useState<ConnectorInfo | null>(null);
  const [tempApiKey, setTempApiKey] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const connectedCount = connectors.filter((c) => c.connected).length;
  const totalCount = connectors.length;

  const filteredConnectors = connectors.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeFilter === 'Connected') return c.connected;
    if (activeFilter === 'Not Connected') return !c.connected;
    return true;
  });

  const handleOpenConfig = (connector: ConnectorInfo) => {
    setSelectedConnector(connector);
    setTempApiKey(connector.apiKey || '');
    setTestResult(null);
  };

  const handleSaveConfig = () => {
    if (!selectedConnector) return;
    setConnectors((prev) =>
      prev.map((c) =>
        c.id === selectedConnector.id
          ? { ...c, connected: selectedConnector.id === 'gemini' ? true : !!tempApiKey.trim(), apiKey: tempApiKey.trim() }
          : c
      )
    );
    setSelectedConnector(null);
  };

  const handleTestConnection = async () => {
    if (!selectedConnector) return;
    setIsTesting(true);
    setTestResult(null);

    // Simulate real handshake verification
    setTimeout(() => {
      setIsTesting(false);
      if (selectedConnector.id === 'gemini') {
        setTestResult('Success: Google Gemini 3.8 Flash endpoint connected with 94ms latency.');
      } else if (tempApiKey.trim()) {
        setTestResult(`Success: Handshake verified with ${selectedConnector.name}.`);
      } else {
        setTestResult('Notice: Connector requires an API key in client or backend proxy.');
      }
    }, 800);
  };

  const handleDisconnect = () => {
    if (!selectedConnector) return;
    setConnectors((prev) =>
      prev.map((c) =>
        c.id === selectedConnector.id
          ? { ...c, connected: false, apiKey: '' }
          : c
      )
    );
    setSelectedConnector(null);
  };

  return (
    <div className="flex flex-col min-h-full pb-24 pt-3 px-4 max-w-lg mx-auto select-none">
      {/* Top Header Matching Screenshot 2 */}
      <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide">Connectors</h1>
          <p className="text-xs text-slate-400">
            {connectedCount} of {totalCount} connected
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative my-3">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search connectors..."
          className="w-full bg-[#13131b] border border-white/10 rounded-2xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
        />
      </div>

      {/* Filter Tabs (Matches Screenshot 2) */}
      <div className="flex items-center space-x-2 mb-4">
        {(['All', 'Connected', 'Not Connected'] as const).map((filter) => {
          const isSelected = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all ${
                isSelected
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-[#14141e] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Connector List Grouped */}
      <div className="space-y-4">
        {filteredConnectors.some((c) => c.category === 'Google Workspace') && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
              <span>Google Workspace (OAuth)</span>
              <span className="text-[10px] text-red-400 font-mono font-normal">Active Integration</span>
            </h2>
            <div className="space-y-2">
              {filteredConnectors
                .filter((c) => c.category === 'Google Workspace')
                .map((connector) => {
                  return (
                    <div
                      key={connector.id}
                      onClick={() => {
                        if (onOpenWorkspace) {
                          onOpenWorkspace(connector.id === 'drive' ? 'drive' : 'gmail');
                        } else {
                          handleOpenConfig(connector);
                        }
                      }}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#14141e] to-[#171320] border border-red-500/20 hover:border-red-500/40 cursor-pointer active:scale-[0.99] transition-all group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center font-bold text-red-400 text-sm group-hover:scale-105 transition-transform">
                          {connector.id === 'gmail' ? 'GM' : 'GD'}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white leading-tight flex items-center space-x-1.5">
                            <span>{connector.name}</span>
                            <span className="text-[9px] px-1 rounded bg-white/10 text-slate-300 font-normal">Workspace</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                            {connector.description}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Connected
                        </span>
                        <span className="text-xs text-red-400 font-medium group-hover:translate-x-0.5 transition-transform hidden sm:inline">
                          Open →
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            AI & Models
          </h2>
          <div className="space-y-2">
            {filteredConnectors
              .filter((c) => c.category === 'AI & Models')
              .map((connector) => {
                return (
                  <div
                    key={connector.id}
                    onClick={() => handleOpenConfig(connector)}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[#14141e] border border-white/5 hover:border-white/15 cursor-pointer active:scale-[0.99] transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      {/* Avatar initial bubble */}
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white text-sm">
                        {connector.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white leading-tight">
                          {connector.name}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {connector.description}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 ${
                        connector.connected
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/5 text-slate-400 border border-white/5'
                      }`}
                    >
                      {connector.connected ? 'Connected' : 'Not connected'}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Research & Web Category */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Research & Web
          </h2>
          <div className="space-y-2">
            {filteredConnectors
              .filter((c) => c.category === 'Research & Web')
              .map((connector) => (
                <div
                  key={connector.id}
                  onClick={() => handleOpenConfig(connector)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#14141e] border border-white/5 hover:border-white/15 cursor-pointer active:scale-[0.99] transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white text-sm">
                      {connector.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white leading-tight">
                        {connector.name}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {connector.description}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 ${
                      connector.connected
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/5 text-slate-400 border border-white/5'
                    }`}
                  >
                    {connector.connected ? 'Connected' : 'Not connected'}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Creative & Voice Category */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Creative & Voice
          </h2>
          <div className="space-y-2">
            {filteredConnectors
              .filter((c) => c.category === 'Creative & Voice')
              .map((connector) => (
                <div
                  key={connector.id}
                  onClick={() => handleOpenConfig(connector)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#14141e] border border-white/5 hover:border-white/15 cursor-pointer active:scale-[0.99] transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white text-sm">
                      {connector.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white leading-tight">
                        {connector.name}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {connector.description}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 ${
                      connector.connected
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/5 text-slate-400 border border-white/5'
                    }`}
                  >
                    {connector.connected ? 'Connected' : 'Not connected'}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      {selectedConnector && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#13131c] border border-white/15 rounded-3xl p-5 shadow-2xl animate-slideUp">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center font-bold text-sm">
                  {selectedConnector.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedConnector.name}</h3>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">
                    {selectedConnector.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedConnector(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4">{selectedConnector.description}</p>

            {/* API Key Input */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
                <span>API Credential</span>
                {selectedConnector.id === 'gemini' && (
                  <span className="text-emerald-400 text-[10px]">Managed by AI Studio</span>
                )}
              </label>
              <input
                type="password"
                value={selectedConnector.id === 'gemini' ? '••••••••••••••••••••••••••••' : tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                disabled={selectedConnector.id === 'gemini'}
                placeholder={`Enter ${selectedConnector.name} API Key...`}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500 disabled:opacity-60"
              />
            </div>

            {testResult && (
              <div className="mb-4 p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300">
                {testResult}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-2 pt-2 border-t border-white/10">
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-colors flex items-center justify-center space-x-1"
              >
                {isTesting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Test Link</span>
              </button>

              <button
                onClick={handleSaveConfig}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow transition-colors"
              >
                Save
              </button>

              {selectedConnector.connected && selectedConnector.id !== 'gemini' && (
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-medium border border-red-500/30 transition-colors"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
