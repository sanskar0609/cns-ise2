/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        cyber: {
          bg:      '#050a0f',
          surface: '#0a1628',
          card:    '#0d1f38',
          border:  '#1a3354',
          accent:  '#00d4ff',
          purple:  '#7c3aed',
          pink:    '#ec4899',
          green:   '#10b981',
          yellow:  '#f59e0b',
          red:     '#ef4444',
          orange:  '#f97316',
        }
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #050a0f 0%, #0a1628 50%, #050a0f 100%)',
        'glow-cyan':      'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)',
        'glow-purple':    'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
      },
      animation: {
        'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow':        'glow 2s ease-in-out infinite alternate',
        'scan':        'scan 2s linear infinite',
        'float':       'float 6s ease-in-out infinite',
        'shimmer':     'shimmer 2s linear infinite',
      },
      keyframes: {
        glow: {
          from: { boxShadow: '0 0 10px rgba(0,212,255,0.3), 0 0 20px rgba(0,212,255,0.1)' },
          to:   { boxShadow: '0 0 20px rgba(0,212,255,0.6), 0 0 40px rgba(0,212,255,0.2)' },
        },
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        }
      },
      boxShadow: {
        'cyber':  '0 0 20px rgba(0,212,255,0.2), 0 0 40px rgba(0,212,255,0.05)',
        'purple': '0 0 20px rgba(124,58,237,0.3), 0 0 40px rgba(124,58,237,0.1)',
        'danger': '0 0 20px rgba(239,68,68,0.3)',
        'success':'0 0 20px rgba(16,185,129,0.3)',
      }
    },
  },
  plugins: [],
}
