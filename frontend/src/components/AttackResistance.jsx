import { Shield, Zap, BookOpen, Target } from 'lucide-react';

const ATTACK_META = [
  {
    key:   'bruteForce',
    icon:  Zap,
    label: 'Brute Force',
    desc:  'GPU-accelerated exhaustive search',
  },
  {
    key:   'dictionary',
    icon:  BookOpen,
    label: 'Dictionary Attack',
    desc:  'Common words & password lists',
  },
  {
    key:   'patternBased',
    icon:  Target,
    label: 'Pattern Attack',
    desc:  'Keyboard walks & sequences',
  },
  {
    key:   'hybrid',
    icon:  Shield,
    label: 'Hybrid Attack',
    desc:  'Combined dictionary + mutation',
  },
];

function ResistanceBar({ resistant, label }) {
  const color = resistant
    ? label === 'Strong' || label === 'Resilient' ? '#10b981' : '#f59e0b'
    : '#ef4444';

  return (
    <div className="flex items-center gap-2">
      <div
        className="h-2 rounded-full flex-1 transition-all duration-700"
        style={{
          background: resistant
            ? `linear-gradient(90deg, ${color}88, ${color})`
            : `linear-gradient(90deg, #ef444488, #ef4444)`,
          boxShadow: `0 0 6px ${color}44`,
          width: resistant ? '100%' : '30%',
        }}
      />
      <span className="text-xs font-mono font-bold"
        style={{ color }}>
        {label}
      </span>
    </div>
  );
}

export default function AttackResistance({ attackResistance }) {
  return (
    <div className="cyber-card">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
          <Shield className="w-4 h-4 text-green-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Attack Resistance</h2>
          <p className="text-xs text-slate-500">Resistance to common attack vectors</p>
        </div>
      </div>

      {/* Attack Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ATTACK_META.map(meta => {
          const data = attackResistance?.[meta.key];
          const Icon = meta.icon;

          return (
            <div
              key={meta.key}
              className={`p-4 rounded-xl border transition-all duration-500 ${
                data
                  ? data.resistant
                    ? 'bg-green-500/5 border-green-500/20'
                    : 'bg-red-500/5 border-red-500/20'
                  : 'bg-slate-900/30 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-4 h-4 ${
                  data ? (data.resistant ? 'text-green-400' : 'text-red-400') : 'text-slate-600'
                }`} />
                <span className={`text-xs font-semibold ${
                  data ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {meta.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">{meta.desc}</p>
              {data ? (
                <ResistanceBar resistant={data.resistant} label={data.label} />
              ) : (
                <div className="h-2 rounded-full bg-slate-800" />
              )}
            </div>
          );
        })}
      </div>

      {/* Overall summary */}
      {attackResistance && (
        <div className="mt-4 p-3 rounded-xl bg-cyber-surface/60 border border-cyber-border/50">
          <p className="text-xs text-slate-400 leading-relaxed">
            <span className="text-white font-semibold">Tip: </span>
            A truly secure password resists all four attack vectors simultaneously. 
            Use a unique, random password of 16+ characters with all character types.
          </p>
        </div>
      )}
    </div>
  );
}
