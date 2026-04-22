import { Activity } from 'lucide-react';

function getEntropyLevel(bits) {
  if (bits < 28)  return { label: 'Terrible',  color: '#ef4444', pct: Math.min((bits / 28) * 20, 20)  };
  if (bits < 35)  return { label: 'Very Weak', color: '#f97316', pct: Math.min(20 + ((bits-28)/7)*20, 40)  };
  if (bits < 50)  return { label: 'Weak',      color: '#f59e0b', pct: Math.min(40 + ((bits-35)/15)*20, 60) };
  if (bits < 64)  return { label: 'Good',      color: '#10b981', pct: Math.min(60 + ((bits-50)/14)*20, 80) };
  if (bits < 80)  return { label: 'Great',     color: '#00d4ff', pct: Math.min(80 + ((bits-64)/16)*15, 95) };
  return           { label: 'Excellent',color: '#7c3aed', pct: 100 };
}

const MILESTONES = [
  { bits: 28,  label: '28 bits', note: 'Min acceptable' },
  { bits: 50,  label: '50 bits', note: 'Moderate'       },
  { bits: 64,  label: '64 bits', note: 'Good'            },
  { bits: 80,  label: '80 bits', note: 'Strong'          },
];

export default function EntropyMeter({ entropy }) {
  const level = entropy != null ? getEntropyLevel(entropy) : null;

  return (
    <div className="cyber-card">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
          <Activity className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Entropy Meter</h2>
          <p className="text-xs text-slate-500">Information-theoretic strength</p>
        </div>
        {level && (
          <span className="ml-auto text-xs font-bold font-mono px-3 py-1 rounded-full"
            style={{ color: level.color, background: `${level.color}15`, border: `1px solid ${level.color}40` }}>
            {level.label}
          </span>
        )}
      </div>

      {/* Entropy Number Display */}
      <div className="flex items-end gap-2 mb-5">
        <span className="text-5xl font-black font-mono transition-all duration-700"
          style={{ color: level?.color || '#334155' }}>
          {entropy != null ? entropy.toFixed(1) : '—'}
        </span>
        <span className="text-slate-500 text-sm mb-2 font-mono">bits of entropy</span>
      </div>

      {/* Progress Track */}
      <div className="relative">
        {/* Track */}
        <div className="h-4 rounded-full bg-slate-800/80 overflow-hidden relative">
          {/* Fill */}
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
            style={{
              width: level ? `${level.pct}%` : '0%',
              background: level ? `linear-gradient(90deg, ${level.color}88, ${level.color})` : '#1e293b',
              boxShadow: level ? `0 0 12px ${level.color}66` : 'none',
            }}
          />
          {/* Shimmer */}
          {level && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          )}
        </div>

        {/* Milestone Markers */}
        <div className="relative h-6 mt-1">
          {MILESTONES.map(m => {
            const pos = getEntropyLevel(m.bits).pct;
            const active = entropy != null && entropy >= m.bits;
            return (
              <div
                key={m.bits}
                className="absolute -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${pos}%` }}
              >
                <div className={`w-px h-2 ${active ? 'bg-white' : 'bg-slate-700'}`} />
                <span className={`text-xs font-mono mt-0.5 ${active ? 'text-slate-300' : 'text-slate-700'}`}>
                  {m.bits}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <InfoBox label="Formula" value="log₂(pool) × length" mono />
        <InfoBox label="Pool Size" value={entropy != null ? derivePool(entropy, null) : '—'} mono />
      </div>

      <p className="mt-4 text-xs text-slate-500 leading-relaxed">
        Entropy measures how unpredictable your password is. Higher bits means exponentially more 
        time needed for brute-force attacks. Security experts recommend ≥ 64 bits for strong passwords.
      </p>
    </div>
  );
}

function InfoBox({ label, value, mono }) {
  return (
    <div className="bg-cyber-surface/60 rounded-lg p-3 border border-cyber-border/30">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-xs text-white font-semibold ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

// Approximate character pool size from entropy and length context
function derivePool(entropy, length) {
  // entropy = log2(pool) * length → can't derive without length
  return 'Mixed charset';
}
