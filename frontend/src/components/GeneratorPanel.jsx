import { useState } from 'react';
import { Wand2, Copy, RefreshCw, CheckCheck, Sliders, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const DEFAULTS = {
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  special: true,
  excludeAmbiguous: false,
};

function Toggle({ checked, onChange, label, id }) {
  return (
    <label htmlFor={id} className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{label}</span>
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 rounded-full transition-colors duration-200 peer-checked:bg-cyan-600 bg-slate-700 peer-focus:ring-2 peer-focus:ring-cyan-500/30" />
        <div className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 peer-checked:translate-x-5" />
      </div>
    </label>
  );
}

export default function GeneratorPanel({ onUsePassword }) {
  const [opts, setOpts]           = useState(DEFAULTS);
  const [generated, setGenerated] = useState('');
  const [loading, setLoading]     = useState(false);
  const [copied, setCopied]       = useState(false);
  const [error, setError]         = useState('');
  const [showPass, setShowPass]   = useState(false);

  const set = (key, val) => setOpts(o => ({ ...o, [key]: val }));

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${API_BASE}/api/generate`, opts);
      setGenerated(data.password);
    } catch (e) {
      setError(e.response?.data?.error || 'Generation failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!generated) return;
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="cyber-card">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
          <Wand2 className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Password Generator</h2>
          <p className="text-xs text-slate-500">Generate a cryptographically secure password</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono">
          <Sliders className="w-3 h-3" />
          Configurable
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left — Options */}
        <div className="space-y-4">
          {/* Length Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-slate-300 font-semibold">Length</label>
              <span className="text-lg font-black font-mono text-cyan-400">{opts.length}</span>
            </div>
            <input
              type="range"
              min="8"
              max="64"
              value={opts.length}
              onChange={e => set('length', Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(90deg, #00d4ff ${((opts.length - 8) / 56) * 100}%, #1a3354 ${((opts.length - 8) / 56) * 100}%)`,
              }}
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1 font-mono">
              <span>8</span><span>64</span>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2 border-t border-cyber-border/50">
            <Toggle id="gen-upper"   checked={opts.uppercase}        onChange={v => set('uppercase', v)}        label="Uppercase (A–Z)" />
            <Toggle id="gen-lower"   checked={opts.lowercase}        onChange={v => set('lowercase', v)}        label="Lowercase (a–z)" />
            <Toggle id="gen-nums"    checked={opts.numbers}          onChange={v => set('numbers', v)}          label="Numbers (0–9)" />
            <Toggle id="gen-special" checked={opts.special}          onChange={v => set('special', v)}          label="Symbols (!@#$%)" />
            <Toggle id="gen-ambig"   checked={opts.excludeAmbiguous} onChange={v => set('excludeAmbiguous', v)} label="Exclude Ambiguous (0Ol1)" />
          </div>
        </div>

        {/* Right — Output */}
        <div className="flex flex-col gap-4">
          {/* Generate Button */}
          <button
            onClick={generate}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              boxShadow: '0 0 20px rgba(124,58,237,0.4)',
            }}
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            {loading ? 'Generating…' : 'Generate Password'}
          </button>

          {/* Output Box */}
          {generated && (
            <div className="animate-in">
              <div className="relative p-4 rounded-xl bg-cyber-surface border border-cyan-500/30 font-mono text-sm break-all"
                style={{ boxShadow: '0 0 15px rgba(0,212,255,0.1)' }}>
                <span className={`text-white ${!showPass ? 'tracking-widest' : ''}`}>
                  {showPass ? generated : '•'.repeat(generated.length)}
                </span>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setShowPass(s => !s)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white border border-cyber-border hover:border-slate-600 transition-all"
                >
                  {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showPass ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={copy}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                    copied
                      ? 'border-green-500/40 bg-green-500/10 text-green-400'
                      : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'
                  }`}
                >
                  {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                {onUsePassword && (
                  <button
                    onClick={() => onUsePassword(generated)}
                    className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-purple-500/40 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all"
                  >
                    Analyze This →
                  </button>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs animate-in">
              {error}
            </div>
          )}

          {/* Strength hint */}
          <div className="mt-auto p-3 rounded-xl bg-cyber-surface/40 border border-cyber-border/30">
            <p className="text-xs text-slate-500 leading-relaxed">
              <span className="text-slate-300 font-semibold">Security: </span>
              Passwords are generated server-side using Node.js{' '}
              <code className="text-cyan-400 font-mono">crypto.randomBytes</code>{' '}
              — cryptographically secure and never stored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
