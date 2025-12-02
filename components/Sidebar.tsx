
import React from 'react';
import { LayoutDashboard, FileText, Scale, ShieldCheck, Lock } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isAdmin?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isAdmin }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projetos Ativos', icon: FileText },
  ];

  if (isAdmin || process.env.NODE_ENV === 'development') {
      navItems.push({ id: 'admin', label: 'Painel Admin (CMS)', icon: Lock });
  }

  return (
    <div className="w-64 h-screen bg-slate-950 border-r border-gold-600/30 flex flex-col shadow-2xl z-10 relative">
      <div className="p-6 flex flex-col gap-4 border-b border-gold-600/20">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-gold-500/10 rounded border border-gold-500">
            <Scale className="w-6 h-6 text-gold-400" />
            </div>
            <div>
            <h1 className="text-gold-400 font-display font-bold text-lg leading-none tracking-wider">SWOT</h1>
            <h2 className="text-slate-400 text-[10px] font-sans tracking-widest uppercase">Auditoria de Compliance</h2>
            </div>
        </div>
        <div className="pl-14 -mt-3">
             <div className="h-px w-12 bg-gold-600/30 mb-1"></div>
             <p className="text-xs text-slate-300 font-serif font-bold">R. Morais</p>
        </div>
      </div>

      <nav className="flex-1 py-6">
        <ul className="space-y-2 px-3">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-300 group ${
                  currentView === item.id
                    ? 'bg-gold-500/10 border border-gold-500/50 text-gold-400 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                    : 'text-slate-400 hover:text-gold-200 hover:bg-white/5'
                }`}
              >
                <item.icon className={`w-5 h-5 ${currentView === item.id ? 'text-gold-400' : 'text-slate-500 group-hover:text-gold-300'}`} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gold-600/20 bg-slate-900/50">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-gold-600" />
          <span>V34.0 Deep Legal Core</span>
        </div>
      </div>
    </div>
  );
};
