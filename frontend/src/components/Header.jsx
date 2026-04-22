import { Shield, Zap, Lock } from 'lucide-react';

export default function Header() {
  return (
    <header className="relative border-b border-cyber-border/50">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-cyan-500/5" />

      <div className="relative max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 flex items-center justify-center border border-cyan-500/30"
              style={{ boxShadow: '0 0 20px rgba(0,212,255,0.2)' }}>
              <Shield className="w-6 h-6 text-cyber-accent" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-cyber-bg animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gradient-cyan">CipherGuard</h1>
            <p className="text-xs text-slate-500 font-mono">Password Security Analyzer v2.0</p>
          </div>
        </div>

        {/* Status Pills */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            System Online
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
            <Zap className="w-3 h-3" />
            Real-time Analysis
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold">
            <Lock className="w-3 h-3" />
            zxcvbn Powered
          </div>
        </div>
      </div>
    </header>
  );
}
