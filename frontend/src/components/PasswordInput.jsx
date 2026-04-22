import { useState, useRef } from 'react';
import { Eye, EyeOff, Lock, X, Clipboard } from 'lucide-react';

export default function PasswordInput({ value, onChange, loading }) {
  const [show, setShow] = useState(false);
  const inputRef = useRef(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text);
    } catch {
      inputRef.current?.focus();
    }
  };

  const strengthColor = () => {
    if (!value) return 'bg-slate-700';
    const len = value.length;
    if (len < 6)  return 'bg-red-500';
    if (len < 10) return 'bg-orange-500';
    if (len < 14) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const charCount = value.length;
  const maxChars  = 128;

  return (
    <div className="cyber-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
          <Lock className="w-4 h-4 text-cyber-accent" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Password Input</h2>
          <p className="text-xs text-slate-500">Type or paste your password to analyze</p>
        </div>
      </div>

      {/* Input Wrapper */}
      <div className="relative group">
        <input
          ref={inputRef}
          id="password-input"
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          maxLength={maxChars}
          placeholder="Enter password to analyze…"
          autoComplete="off"
          spellCheck={false}
          className="cyber-input pr-24 font-mono text-base tracking-widest"
          aria-label="Password to analyze"
        />

        {/* Action Buttons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              onClick={() => onChange('')}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handlePaste}
            className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
            title="Paste from clipboard"
          >
            <Clipboard className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShow(s => !s)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700/50 transition-all"
            title={show ? 'Hide password' : 'Show password'}
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Glow effect on focus */}
        <div className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: 'inset 0 0 30px rgba(0,212,255,0.05)' }} />
      </div>

      {/* Bottom Meta Row */}
      <div className="mt-3 flex items-center justify-between">
        {/* Strength Bars */}
        <div className="flex items-center gap-1">
          {[6, 10, 14, 18].map((threshold, i) => (
            <div
              key={i}
              className={`h-1 w-8 rounded-full transition-all duration-500 ${
                charCount >= threshold ? strengthColor() : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Char count */}
        <span className={`text-xs font-mono transition-colors ${
          charCount > maxChars * 0.9 ? 'text-orange-400' : 'text-slate-600'
        }`}>
          {charCount}/{maxChars}
        </span>
      </div>

      {/* Loading pulse */}
      {loading && (
        <div className="mt-3 flex items-center gap-2 text-xs text-cyan-400">
          <div className="flex gap-1">
            {[0, 0.15, 0.3].map((delay, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
                style={{ animationDelay: `${delay}s` }} />
            ))}
          </div>
          <span className="font-mono">Analyzing…</span>
        </div>
      )}
    </div>
  );
}
