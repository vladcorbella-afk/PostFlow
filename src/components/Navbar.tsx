import React from 'react';
import { 
  Send, 
  CalendarClock, 
  History, 
  KeyRound, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Instagram,
  Facebook
} from 'lucide-react';
import { MetaCredentials } from '../types';

interface NavbarProps {
  activeTab: 'composer' | 'queue' | 'history' | 'settings';
  setActiveTab: (tab: 'composer' | 'queue' | 'history' | 'settings') => void;
  credentials: MetaCredentials;
  scheduledCount: number;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  credentials,
  scheduledCount,
  historyCount,
}) => {
  const isConnected = credentials.isSandboxMode || (credentials.accessToken && credentials.fbPageId);

  return (
    <header className="sticky top-0 z-40 bg-[#0d1322]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand & Connection Badge */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('composer')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-600 via-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-900/30 text-white font-extrabold text-lg">
              <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  PostFlow
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Meta v19
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Agendador Instagram &amp; Facebook</p>
            </div>
          </div>

          {/* Quick status pill */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              credentials.isSandboxMode
                ? 'bg-amber-950/40 text-amber-300 border-amber-800/50 hover:bg-amber-900/50'
                : isConnected
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50 hover:bg-emerald-900/50'
                : 'bg-rose-950/40 text-rose-300 border-rose-800/50 hover:bg-rose-900/50'
            }`}
          >
            {credentials.isSandboxMode ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Modo Sandbox</span>
              </>
            ) : isConnected ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Meta Conectado</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Desconectado</span>
              </>
            )}
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('composer')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'composer'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Criar &amp; Agendar</span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap relative ${
              activeTab === 'queue'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span>Fila Agendada</span>
            {scheduledCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-purple-400 text-slate-950 font-bold text-[10px]">
                {scheduledCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Histórico</span>
            {historyCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px]">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Configurar APIs</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
