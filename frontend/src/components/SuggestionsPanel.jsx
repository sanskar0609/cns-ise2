import {
  Lightbulb, AlertOctagon, AlertTriangle, Info, CheckCircle2, Ruler,
  ChevronUp, ChevronDown, Hash, AtSign, Shuffle, Shield, Star
} from 'lucide-react';

const PRIORITY_CONFIG = {
  critical: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    badge: 'bg-red-500/20 text-red-300 border-red-500/40',
    icon: AlertOctagon,
    label: 'CRITICAL',
  },
  high: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    icon: AlertTriangle,
    label: 'HIGH',
  },
  medium: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    icon: Info,
    label: 'MEDIUM',
  },
  low: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    icon: Info,
    label: 'LOW',
  },
  good: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    badge: 'bg-green-500/20 text-green-300 border-green-500/40',
    icon: CheckCircle2,
    label: 'GREAT',
  },
};

const ICON_MAP = {
  length:   Ruler,
  uppercase: ChevronUp,
  lowercase: ChevronDown,
  numbers:  Hash,
  special:  AtSign,
  pattern:  Shuffle,
  common:   Shield,
  unique:   Star,
  zxcvbn:   Lightbulb,
  good:     CheckCircle2,
};

export default function SuggestionsPanel({ suggestions }) {
  return (
    <div className="cyber-card">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Improvement Suggestions</h2>
          <p className="text-xs text-slate-500">Prioritised recommendations</p>
        </div>
        {suggestions && (
          <span className="ml-auto tag bg-slate-800 border border-slate-700 text-slate-400 text-xs">
            {suggestions.length} tips
          </span>
        )}
      </div>

      {/* Suggestions List */}
      {suggestions && suggestions.length > 0 ? (
        <div className="space-y-2.5">
          {suggestions.map((s, i) => {
            const cfg     = PRIORITY_CONFIG[s.priority] || PRIORITY_CONFIG.low;
            const BadgeIc = cfg.icon;
            const BodyIc  = ICON_MAP[s.icon] || Lightbulb;

            return (
              <div
                key={i}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-300 animate-in ${cfg.bg} ${cfg.border}`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <BodyIc className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.text}`} />
                <p className="flex-1 text-xs text-slate-300 leading-relaxed">{s.text}</p>
                <span className={`tag text-xs border rounded-md px-2 py-0.5 whitespace-nowrap ${cfg.badge}`}>
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Lightbulb className="w-8 h-8 text-slate-700 mb-3" />
          <p className="text-sm text-slate-600">Enter a password to see suggestions</p>
        </div>
      )}
    </div>
  );
}
