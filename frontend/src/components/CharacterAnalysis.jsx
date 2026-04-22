import { BarChart2, Hash, ChevronUp, ChevronDown, Star, AtSign } from 'lucide-react';

const CHAR_CONFIG = [
  { key: 'uppercase', label: 'Uppercase',  icon: ChevronUp,   color: '#7c3aed', bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  { key: 'lowercase', label: 'Lowercase',  icon: ChevronDown, color: '#00d4ff', bg: 'bg-cyan-500/10',   border: 'border-cyan-500/30',   text: 'text-cyan-400'   },
  { key: 'numbers',   label: 'Numbers',    icon: Hash,        color: '#f59e0b', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  { key: 'special',   label: 'Symbols',    icon: AtSign,      color: '#ec4899', bg: 'bg-pink-500/10',   border: 'border-pink-500/30',   text: 'text-pink-400'   },
];

export default function CharacterAnalysis({ charAnalysis }) {
  if (!charAnalysis) {
    return (
      <div className="cyber-card">
        <SectionHeader />
        <div className="grid grid-cols-2 gap-3 mt-4">
          {CHAR_CONFIG.map(c => <PlaceholderCard key={c.key} cfg={c} />)}
        </div>
      </div>
    );
  }

  const total = charAnalysis.length || 1;

  return (
    <div className="cyber-card">
      <SectionHeader />

      <div className="grid grid-cols-2 gap-3 mt-4">
        {CHAR_CONFIG.map(cfg => {
          const count = charAnalysis[cfg.key] || 0;
          const pct   = Math.round((count / total) * 100);
          const Icon  = cfg.icon;
          const present = count > 0;

          return (
            <div
              key={cfg.key}
              className={`rounded-xl p-4 border transition-all duration-500 ${
                present ? `${cfg.bg} ${cfg.border}` : 'bg-slate-900/50 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${present ? cfg.text : 'text-slate-600'}`} />
                  <span className={`text-xs font-semibold ${present ? cfg.text : 'text-slate-600'}`}>
                    {cfg.label}
                  </span>
                </div>
                <span className={`text-lg font-black font-mono ${present ? 'text-white' : 'text-slate-700'}`}>
                  {count}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    background: present ? cfg.color : '#374151',
                    boxShadow: present ? `0 0 8px ${cfg.color}88` : 'none',
                  }}
                />
              </div>
              <p className={`text-xs mt-1.5 font-mono ${present ? 'text-slate-400' : 'text-slate-700'}`}>
                {pct}% of chars
              </p>
            </div>
          );
        })}
      </div>

      {/* Summary Row */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <MiniStat label="Total Length" value={charAnalysis.length} />
        <MiniStat label="Unique Chars" value={charAnalysis.unique} />
        <MiniStat label="Diversity"    value={`${Math.round((charAnalysis.unique / charAnalysis.length) * 100)}%`} />
      </div>
    </div>
  );
}

function SectionHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
        <BarChart2 className="w-4 h-4 text-cyber-accent" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-white">Character Analysis</h2>
        <p className="text-xs text-slate-500">Breakdown by character type</p>
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-cyber-surface/60 rounded-lg p-2.5 text-center border border-cyber-border/30">
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm font-bold font-mono text-white">{value ?? '–'}</p>
    </div>
  );
}

function PlaceholderCard({ cfg }) {
  const Icon = cfg.icon;
  return (
    <div className="rounded-xl p-4 border border-slate-800 bg-slate-900/30">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-slate-700" />
        <span className="text-xs font-semibold text-slate-700">{cfg.label}</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800" />
    </div>
  );
}
