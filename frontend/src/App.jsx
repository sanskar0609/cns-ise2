import { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import Header            from './components/Header.jsx';
import PasswordInput     from './components/PasswordInput.jsx';
import ScoreDisplay      from './components/ScoreDisplay.jsx';
import CharacterAnalysis from './components/CharacterAnalysis.jsx';
import PatternDetection  from './components/PatternDetection.jsx';
import SuggestionsPanel  from './components/SuggestionsPanel.jsx';
import EntropyMeter      from './components/EntropyMeter.jsx';
import AttackResistance  from './components/AttackResistance.jsx';
import GeneratorPanel    from './components/GeneratorPanel.jsx';

// Use VITE_API_URL env var in production (Vercel), fallback to '' (Vite proxy) in dev
const API_BASE = import.meta.env.VITE_API_URL || '';

const DEBOUNCE_MS = 350;

export default function App() {
  const [password, setPassword]   = useState('');
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [activeTab, setActiveTab] = useState('analyzer'); // 'analyzer' | 'generator'
  const debounceRef               = useRef(null);

  const analyze = useCallback(async (pwd) => {
    if (!pwd) {
      setResult(null);
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post(`${API_BASE}/api/analyze`, { password: pwd });
      setResult(data);
    } catch (e) {
      if (e.code === 'ERR_NETWORK') {
        setError('Cannot connect to backend. Make sure `node server.js` is running on port 5000.');
      } else {
        setError(e.response?.data?.error || 'Analysis failed');
      }
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePasswordChange = (pwd) => {
    setPassword(pwd);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => analyze(pwd), DEBOUNCE_MS);
  };

  const handleUseGenerated = (pwd) => {
    setPassword(pwd);
    setActiveTab('analyzer');
    analyze(pwd);
  };

  return (
    <div className="min-h-screen bg-cyber-bg grid-pattern particle-bg">
      {/* Animated scan line */}
      <div
        className="fixed top-0 left-0 right-0 h-px z-50 pointer-events-none opacity-30"
        style={{
          background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
          animation: 'scanline 8s linear infinite',
        }}
      />

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Tab Bar */}
        <div className="flex gap-1 mb-8 bg-cyber-surface/60 rounded-2xl p-1.5 border border-cyber-border/50 w-fit">
          {[
            { id: 'analyzer',  label: '🔬 Analyzer'  },
            { id: 'generator', label: '⚡ Generator' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Analyzer Tab ───────────────────────────────── */}
        {activeTab === 'analyzer' && (
          <div className="space-y-6 animate-in">
            {/* Input */}
            <PasswordInput
              value={password}
              onChange={handlePasswordChange}
              loading={loading}
            />

            {/* Error Banner */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-in">
                ⚠️ {error}
              </div>
            )}

            {/* Empty State */}
            {!password && !result && (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-2xl bg-cyber-surface border border-cyber-border/50 flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🔐</span>
                </div>
                <h3 className="text-xl font-bold text-slate-400 mb-2">Enter a password above</h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto">
                  Real-time analysis will show you strength score, entropy, pattern vulnerabilities, 
                  crack time estimates, and personalised improvement suggestions.
                </p>
              </div>
            )}

            {/* Results Grid */}
            {(result || password) && (
              <>
                {/* Top row: Score + Entropy */}
                <div className="grid md:grid-cols-3 gap-6">
                  <ScoreDisplay result={result} />
                  <div className="md:col-span-2 space-y-6">
                    <EntropyMeter entropy={result?.entropy ?? null} />
                    <CharacterAnalysis charAnalysis={result?.charAnalysis ?? null} />
                  </div>
                </div>

                {/* Middle row: Patterns + Suggestions */}
                <div className="grid md:grid-cols-2 gap-6">
                  <PatternDetection
                    patterns={result?.patterns ?? null}
                    isCommon={result?.isCommon ?? false}
                    zxcvbnWarning={result?.zxcvbn?.warning ?? null}
                  />
                  <SuggestionsPanel suggestions={result?.suggestions ?? null} />
                </div>

                {/* Bottom: Attack Resistance */}
                <AttackResistance attackResistance={result?.attackResistance ?? null} />
              </>
            )}
          </div>
        )}

        {/* ─── Generator Tab ──────────────────────────────── */}
        {activeTab === 'generator' && (
          <div className="animate-in">
            <GeneratorPanel onUsePassword={handleUseGenerated} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-cyber-border/30 mt-16 py-6 text-center">
        <p className="text-xs text-slate-600">
          CipherGuard Password Analyzer · Built with React + Node.js · 
          <span className="text-cyan-700"> Powered by zxcvbn</span>
        </p>
      </footer>
    </div>
  );
}
