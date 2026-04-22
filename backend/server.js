require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const zxcvbn = require('zxcvbn');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet());

const rawOrigins = process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000';
const allowedOrigins = rawOrigins.split(',').map(o => o.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server / curl (no origin header)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max:       parseInt(process.env.RATE_LIMIT_MAX)       || 300,
  message: { error: 'Too many requests, please slow down.' },
});
app.use('/api/', limiter);

// ─── Common Password List (Top 200+) ──────────────────────────────────────────
const COMMON_PASSWORDS = new Set([
  'password','123456','password123','admin','letmein','qwerty','abc123',
  'monkey','master','dragon','password1','iloveyou','sunshine','princess',
  'welcome','shadow','superman','michael','football','baseball','soccer',
  'batman','trustno1','hello','charlie','donald','password2','qwerty123',
  '1234567890','987654321','12345678','1234567','12345','123456789',
  '111111','000000','1234','pass','test','user','root','admin123','admin1',
  'passw0rd','p@ssword','p@ss123','p@ssw0rd','login','access','guest',
  'changeme','secret','sample','demo','temp','example','default','offline',
  'computer','internet','network','security','system','manager','server',
  'database','windows','linux','ubuntu','android','iphone','apple','google',
  'facebook','twitter','instagram','youtube','amazon','netflix','spotify',
]);

// ─── Helper Functions ──────────────────────────────────────────────────────────
function calcEntropy(password) {
  const charsets = [
    { regex: /[a-z]/, size: 26 },
    { regex: /[A-Z]/, size: 26 },
    { regex: /[0-9]/, size: 10 },
    { regex: /[^a-zA-Z0-9]/, size: 32 },
  ];
  const poolSize = charsets.reduce((acc, c) => c.regex.test(password) ? acc + c.size : acc, 0);
  return poolSize > 0 ? Math.log2(poolSize) * password.length : 0;
}

function detectPatterns(password) {
  const patterns = [];
  const lower = password.toLowerCase();

  // Keyboard walks
  const walks = ['qwerty','asdfgh','zxcvbn','qweasdzxc','1234567890','0987654321'];
  for (const walk of walks) {
    if (lower.includes(walk.slice(0, 4))) {
      patterns.push({ type: 'keyboard_walk', severity: 'high', detail: `Keyboard pattern detected: "${walk.slice(0,4)}..."` });
      break;
    }
  }

  // Sequential characters
  const seqMatch = lower.match(/(.)\1{2,}/);
  if (seqMatch) {
    patterns.push({ type: 'repeated_chars', severity: 'high', detail: `Repeated characters: "${seqMatch[0]}"` });
  }

  // Number sequences
  if (/(?:012|123|234|345|456|567|678|789|890|987|876|765|654|543|432|321|210)/.test(password)) {
    patterns.push({ type: 'sequential_numbers', severity: 'medium', detail: 'Sequential number pattern found' });
  }

  // Common substitutions l33t
  if (/[@43!0$]/.test(password) && /[aeiouAEIOU]/.test(password.replace(/[@43!0$]/g, ''))) {
    patterns.push({ type: 'leet_speak', severity: 'low', detail: 'Common character substitutions detected (leet speak)' });
  }

  // Date patterns
  if (/\b(19|20)\d{2}\b/.test(password)) {
    patterns.push({ type: 'date_pattern', severity: 'medium', detail: 'Year pattern detected in password' });
  }

  if (/(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])/.test(password)) {
    patterns.push({ type: 'date_pattern', severity: 'medium', detail: 'Date pattern (MMDD) detected' });
  }

  // All same case
  if (password.length > 4 && (/^[a-z]+$/.test(password) || /^[A-Z]+$/.test(password))) {
    patterns.push({ type: 'single_case', severity: 'medium', detail: 'Password uses only one letter case' });
  }

  // Only letters or only digits
  if (/^\d+$/.test(password)) {
    patterns.push({ type: 'numbers_only', severity: 'high', detail: 'Password contains only numbers' });
  }
  if (/^[a-zA-Z]+$/.test(password)) {
    patterns.push({ type: 'letters_only', severity: 'medium', detail: 'Password contains only letters' });
  }

  return patterns;
}

function estimateCrackTime(entropy) {
  // GPU brute force: ~10 billion (1e10) hashes/sec for bcrypt-like
  const guessesPerSecond = 1e10;
  const totalGuesses = Math.pow(2, entropy);
  const seconds = totalGuesses / guessesPerSecond;

  if (seconds < 1)         return { label: 'Instantly',             seconds, severity: 'critical' };
  if (seconds < 60)        return { label: `${Math.floor(seconds)} seconds`,    seconds, severity: 'critical' };
  if (seconds < 3600)      return { label: `${Math.floor(seconds/60)} minutes`, seconds, severity: 'high' };
  if (seconds < 86400)     return { label: `${Math.floor(seconds/3600)} hours`, seconds, severity: 'high' };
  if (seconds < 2592000)   return { label: `${Math.floor(seconds/86400)} days`, seconds, severity: 'medium' };
  if (seconds < 31536000)  return { label: `${Math.floor(seconds/2592000)} months`, seconds, severity: 'low' };
  if (seconds < 3153600000)return { label: `${Math.floor(seconds/31536000)} years`, seconds, severity: 'low' };
  return { label: 'Centuries+', seconds, severity: 'safe' };
}

function getCharAnalysis(password) {
  return {
    uppercase: (password.match(/[A-Z]/g) || []).length,
    lowercase: (password.match(/[a-z]/g) || []).length,
    numbers:   (password.match(/[0-9]/g) || []).length,
    special:   (password.match(/[^a-zA-Z0-9]/g) || []).length,
    length:    password.length,
    unique:    new Set(password).size,
  };
}

function generateSuggestions(password, charAnalysis, patterns, zxcvbnResult) {
  const suggestions = [];

  if (password.length < 8) {
    suggestions.push({ priority: 'critical', text: 'Password must be at least 8 characters long', icon: 'length' });
  } else if (password.length < 12) {
    suggestions.push({ priority: 'high', text: 'Increase password length to 12+ characters for better security', icon: 'length' });
  } else if (password.length < 16) {
    suggestions.push({ priority: 'medium', text: 'Consider 16+ characters for maximum protection', icon: 'length' });
  }

  if (charAnalysis.uppercase === 0) {
    suggestions.push({ priority: 'high', text: 'Add uppercase letters (A–Z) to increase complexity', icon: 'uppercase' });
  }
  if (charAnalysis.lowercase === 0) {
    suggestions.push({ priority: 'high', text: 'Add lowercase letters (a–z) to increase complexity', icon: 'lowercase' });
  }
  if (charAnalysis.numbers === 0) {
    suggestions.push({ priority: 'medium', text: 'Include numbers (0–9) to widen the character pool', icon: 'numbers' });
  }
  if (charAnalysis.special === 0) {
    suggestions.push({ priority: 'high', text: 'Add special characters (!@#$%^&*) for stronger entropy', icon: 'special' });
  }

  const highPatterns = patterns.filter(p => p.severity === 'high');
  if (highPatterns.length > 0) {
    suggestions.push({ priority: 'critical', text: 'Avoid predictable patterns like keyboard walks or repeated characters', icon: 'pattern' });
  }

  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    suggestions.push({ priority: 'critical', text: 'This password appears in common password lists — change it immediately!', icon: 'common' });
  }

  const uniqueRatio = charAnalysis.unique / charAnalysis.length;
  if (uniqueRatio < 0.5 && password.length > 4) {
    suggestions.push({ priority: 'medium', text: 'Too many repeated characters — use more unique characters', icon: 'unique' });
  }

  if (zxcvbnResult.feedback.suggestions.length > 0) {
    for (const s of zxcvbnResult.feedback.suggestions.slice(0, 2)) {
      suggestions.push({ priority: 'low', text: s, icon: 'zxcvbn' });
    }
  }

  if (suggestions.length === 0 || (charAnalysis.length >= 16 && charAnalysis.special > 1)) {
    suggestions.push({ priority: 'good', text: 'Great password! Consider using a password manager to store it safely.', icon: 'good' });
  }

  const order = { critical: 0, high: 1, medium: 2, low: 3, good: 4 };
  return suggestions.sort((a, b) => order[a.priority] - order[b.priority]);
}

function getAttackResistance(score, entropy, patterns) {
  const hasHighPatterns = patterns.some(p => p.severity === 'high');
  return {
    bruteForce:  { resistant: entropy >= 50, label: entropy >= 60 ? 'Strong' : entropy >= 40 ? 'Moderate' : 'Weak' },
    dictionary:  { resistant: !COMMON_PASSWORDS.has(''), label: score >= 3 ? 'Strong' : score >= 2 ? 'Moderate' : 'Weak' },
    patternBased:{ resistant: !hasHighPatterns, label: hasHighPatterns ? 'Vulnerable' : patterns.length === 0 ? 'Strong' : 'Moderate' },
    hybrid:      { resistant: score >= 3 && entropy >= 50, label: score >= 3 ? 'Resilient' : 'Exposed' },
  };
}

// ─── API Routes ────────────────────────────────────────────────────────────────
app.post('/api/analyze', (req, res) => {
  const { password } = req.body;

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password is required' });
  }
  if (password.length > 128) {
    return res.status(400).json({ error: 'Password too long (max 128 chars)' });
  }

  try {
    const zxcvbnResult = zxcvbn(password);
    const charAnalysis = getCharAnalysis(password);
    const entropy = calcEntropy(password);
    const patterns = detectPatterns(password);
    const crackTime = estimateCrackTime(entropy);
    const suggestions = generateSuggestions(password, charAnalysis, patterns, zxcvbnResult);
    const attackResistance = getAttackResistance(zxcvbnResult.score, entropy, patterns);
    const isCommon = COMMON_PASSWORDS.has(password.toLowerCase());

    const response = {
      score: zxcvbnResult.score,               // 0–4
      strength: ['Very Weak','Weak','Fair','Strong','Very Strong'][zxcvbnResult.score],
      entropy: Math.round(entropy * 100) / 100,
      charAnalysis,
      patterns,
      crackTime,
      suggestions,
      attackResistance,
      isCommon,
      zxcvbn: {
        guessesLog10: zxcvbnResult.guesses_log10,
        warning: zxcvbnResult.feedback.warning || null,
      },
    };

    res.json(response);
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

app.post('/api/generate', (req, res) => {
  const {
    length = 16,
    uppercase = true,
    lowercase = true,
    numbers = true,
    special = true,
    excludeAmbiguous = false,
  } = req.body;

  const safeLength = Math.max(8, Math.min(64, parseInt(length)));

  let charset = '';
  if (uppercase)  charset += excludeAmbiguous ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lowercase)  charset += excludeAmbiguous ? 'abcdefghjkmnpqrstuvwxyz'  : 'abcdefghijklmnopqrstuvwxyz';
  if (numbers)    charset += excludeAmbiguous ? '23456789' : '0123456789';
  if (special)    charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (!charset) {
    return res.status(400).json({ error: 'At least one character type must be selected' });
  }

  let password = '';
  const randomBytes = crypto.randomBytes(safeLength * 2);
  let i = 0;
  while (password.length < safeLength) {
    password += charset[randomBytes[i] % charset.length];
    i++;
  }

  // Guarantee at least one of each selected type
  const guaranteed = [];
  if (uppercase) guaranteed.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random()*26)]);
  if (lowercase) guaranteed.push('abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random()*26)]);
  if (numbers)   guaranteed.push('0123456789'[Math.floor(Math.random()*10)]);
  if (special)   guaranteed.push('!@#$%^&*()[]{}'[Math.floor(Math.random()*14)]);

  let arr = password.split('');
  guaranteed.forEach((ch, idx) => {
    const pos = Math.floor(Math.random() * safeLength);
    arr[pos] = ch;
  });
  password = arr.join('');

  res.json({ password });
});

app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`\n🔐 Password Analyzer API running on http://localhost:${PORT}`);
  console.log(`   Health:   GET  /api/health`);
  console.log(`   Analyze:  POST /api/analyze`);
  console.log(`   Generate: POST /api/generate\n`);
});
