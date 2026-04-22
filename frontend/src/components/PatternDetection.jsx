import { AlertTriangle, Keyboard, RotateCcw, Calendar, BookOpen, Hash, AlertCircle } from 'lucide-react';

const PATTERN_META = {
  keyboard_walk:      { icon: Keyboard,      label: 'Keyboard Walk',       color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30'    },
  repeated_chars:     { icon: RotateCcw,     label: 'Repeated Chars',      color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  sequential_numbers: { icon: Hash,          label: 'Sequential Numbers',  color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  leet_speak:         { icon: AlertCircle,   label: 'Leet Substitution',   color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30'   },
  date_pattern:       { icon: Calendar,      label: 'Date Pattern',        color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  single_case:        { icon: BookOpen,      label: 'Single Case',         color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  numbers_only:       { icon: Hash,          label: 'Numbers Only',        color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30'    },
  letters_only:       { icon: BookOpen,      label: 'Letters Only',        color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
};

const SEVERITY_BADGE = {
  high:   { label: 'HIGH',   style: 'bg-red-500/20 text-red-400 border border-red-500/40'    },
  medium: { label: 'MED',    style: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' },
  low:    { label: 'LOW',    style: 'bg-blue-500/20 text-blue-400 border border-blue-500/40' },
};

export default function PatternDetection({ patterns, isCommon, zxcvbnWarning }) {
  const hasIssues = (patterns?.length > 0) || isCommon || zxcvbnWarning;

  return (
    <div className="cyber-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Pattern Detection</h2>
            <p className="text-xs text-slate-500">Vulnerabilities & risky patterns</p>
          </div>
        </div>
        <div className={`tag text-xs font-bold ${
          hasIssues
            ? 'bg-red-500/10 border border-red-500/30 text-red-400'
            : 'bg-green-500/10 border border-green-500/30 text-green-400'
        }`}>
          {hasIssues ? `${(patterns?.length || 0) + (isCommon ? 1 : 0)} Issues` : 'Clean'}
        </div>
      </div>

      {/* Common Password Warning */}
      {isCommon && (
        <div className="mb-3 flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 animate-in">
          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-red-400">COMMON PASSWORD DETECTED</p>
            <p className="text-xs text-slate-400 mt-0.5">This password appears in known breach databases and is trivially crackable.</p>
          </div>
          <span className="ml-auto tag bg-red-700/30 text-red-300 border border-red-600/30 text-xs">CRITICAL</span>
        </div>
      )}

      {/* zxcvbn Warning */}
      {zxcvbnWarning && (
        <div className="mb-3 flex items-start gap-3 p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 animate-in">
          <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
          <p className="text-xs text-orange-300">{zxcvbnWarning}</p>
        </div>
      )}

      {/* Pattern List */}
      {patterns && patterns.length > 0 ? (
        <div className="space-y-2">
          {patterns.map((p, i) => {
            const meta   = PATTERN_META[p.type] || { icon: AlertCircle, label: p.type, color: 'text-slate-400', bg: 'bg-slate-800', border: 'border-slate-700' };
            const badge  = SEVERITY_BADGE[p.severity] || SEVERITY_BADGE.low;
            const Icon   = meta.icon;
            return (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl border animate-in ${meta.bg} ${meta.border}`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${meta.color}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold ${meta.color}`}>{meta.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{p.detail}</p>
                </div>
                <span className={`tag text-xs px-2 py-0.5 rounded-md ${badge.style}`}>{badge.label}</span>
              </div>
            );
          })}
        </div>
      ) : !isCommon && !zxcvbnWarning ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-3">
            <AlertTriangle className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-sm font-semibold text-green-400">No Patterns Detected</p>
          <p className="text-xs text-slate-500 mt-1">
            {patterns === null ? 'Enter a password to scan for patterns' : 'Password appears pattern-free — great!'}
          </p>
        </div>
      ) : null}
    </div>
  );
}
