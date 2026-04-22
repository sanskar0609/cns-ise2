import { useEffect, useRef } from 'react';

const SCORE_CONFIG = [
  { label: 'Very Weak', color: '#ef4444', glow: 'rgba(239,68,68,0.5)',   bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/30'    },
  { label: 'Weak',      color: '#f97316', glow: 'rgba(249,115,22,0.5)',  bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  { label: 'Fair',      color: '#f59e0b', glow: 'rgba(245,158,11,0.5)',  bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  { label: 'Strong',    color: '#10b981', glow: 'rgba(16,185,129,0.5)',  bg: 'bg-green-500/10',  text: 'text-green-400',  border: 'border-green-500/30'  },
  { label: 'Very Strong',color:'#00d4ff', glow: 'rgba(0,212,255,0.5)',   bg: 'bg-cyan-500/10',   text: 'text-cyan-400',   border: 'border-cyan-500/30'   },
];

export default function ScoreDisplay({ result }) {
  const canvasRef = useRef(null);
  const score  = result?.score ?? 0;
  const cfg    = SCORE_CONFIG[score];
  const pct    = ((score + 1) / 5) * 100;

  // Animated ring via SVG
  const radius        = 70;
  const circumference = 2 * Math.PI * radius;
  const offset        = circumference - (pct / 100) * circumference;

  return (
    <div className="cyber-card flex flex-col items-center">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">Security Score</h2>

      {/* SVG Ring */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Ambient glow */}
        <div className="absolute inset-0 rounded-full opacity-20 blur-2xl transition-colors duration-700"
          style={{ background: cfg.glow }} />

        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          {/* Track */}
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke="#1a3354"
            strokeWidth="10"
          />
          {/* Progress */}
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke={cfg.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={result ? offset : circumference}
            className="score-ring-path"
            style={{ filter: `drop-shadow(0 0 8px ${cfg.glow})` }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-black font-mono transition-all duration-700"
            style={{ color: cfg.color, textShadow: `0 0 20px ${cfg.glow}` }}>
            {result ? score : '–'}
          </span>
          <span className="text-xs text-slate-500 font-mono mt-1">/ 4</span>
        </div>
      </div>

      {/* Label */}
      <div className={`mt-5 px-5 py-2 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text} font-bold text-sm tracking-wide`}>
        {cfg.label}
      </div>

      {/* Stats Row */}
      {result && (
        <div className="mt-6 w-full grid grid-cols-2 gap-3">
          <StatBox label="Entropy" value={`${result.entropy} bits`} color={cfg.color} />
          <StatBox label="Crack Time" value={result.crackTime.label} color={cfg.color} />
        </div>
      )}

      {/* Score Description */}
      {result && (
        <p className="mt-4 text-xs text-center text-slate-500 leading-relaxed">
          {score === 0 && 'Extremely vulnerable — change this password immediately.'}
          {score === 1 && 'Very easy to crack — significant improvements needed.'}
          {score === 2 && 'Moderate security — consider improving complexity.'}
          {score === 3 && 'Good password — minor tweaks can make it excellent.'}
          {score === 4 && 'Excellent! This password is highly resistant to attacks.'}
        </p>
      )}
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div className="bg-cyber-surface/60 rounded-xl p-3 border border-cyber-border/50 text-center">
      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-bold font-mono truncate" style={{ color }}>{value}</p>
    </div>
  );
}
