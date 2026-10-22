const fs = require('fs');
const path = require('path');

const palettes = [
  { bg: '#2B4C7E', fg: '#E8F1F5', icon: 'heart', label: 'Blood Drive' },
  { bg: '#3C6E71', fg: '#D9D9D9', icon: 'tree', label: 'Plantation' },
  { bg: '#8B4513', fg: '#F7EDE2', icon: 'book', label: 'Literacy Camp' },
  { bg: '#B85D19', fg: '#FFF1E6', icon: 'sun', label: 'Solar Outreach' },
  { bg: '#4A5859', fg: '#F4F1DE', icon: 'handshake', label: 'Community Support' },
  { bg: '#1F363D', fg: '#C7EFCF', icon: 'shield', label: 'Health Camp' },
  { bg: '#6B4C72', fg: '#FED9B7', icon: 'star', label: 'Youth Summit' },
  { bg: '#264653', fg: '#E9C46A', icon: 'earth', label: 'Clean Drive' },
  { bg: '#A25936', fg: '#FBE8A6', icon: 'leaf', label: 'Eco Workshop' },
  { bg: '#3D5A80', fg: '#E0FBFC', icon: 'smile', label: 'Elderly Visit' },
  { bg: '#588157', fg: '#DAD7CD', icon: 'seedling', label: 'Green Campus' },
  { bg: '#8338EC', fg: '#FFE5EC', icon: 'sparkle', label: 'Inspire Youth' },
  { bg: '#4361EE', fg: '#F1FAEE', icon: 'people', label: 'Induction Meet' },
  { bg: '#D90429', fg: '#F8F9FA', icon: 'heartbeat', label: 'First Aid Drill' },
  { bg: '#4F772D', fg: '#ECF39E', icon: 'globe', label: 'Village Survey' },
  { bg: '#2A6F97', fg: '#E0AAFF', icon: 'trophy', label: 'Service Awards' }
];

function getIconSvg(type) {
  switch(type) {
    case 'heart':
      return '<path d="M200 240 C140 180 110 140 110 100 C110 65 140 40 175 40 C195 40 215 52 225 70 C235 52 255 40 275 40 C310 40 340 65 340 100 C340 140 310 180 250 240 L225 265 Z" fill="currentColor" opacity="0.9"/>';
    case 'tree':
      return '<path d="M200 60 L140 140 L170 140 L120 220 L185 220 L185 280 L215 280 L215 220 L280 220 L230 140 L260 140 Z" fill="currentColor" opacity="0.9"/>';
    case 'sun':
      return '<circle cx="200" cy="170" r="55" fill="currentColor" opacity="0.9"/><path d="M200 80 L200 95 M200 245 L200 260 M110 170 L125 170 M275 170 L290 170 M136 106 L147 117 M253 223 L264 234 M136 234 L147 223 M253 117 L264 106" stroke="currentColor" stroke-width="12" stroke-linecap="round"/>';
    default:
      return '<circle cx="200" cy="140" r="45" fill="currentColor" opacity="0.9"/><path d="M120 250 C120 205 155 190 200 190 C245 190 280 205 280 250 Z" fill="currentColor" opacity="0.85"/>';
  }
}

const outDir = path.join(process.cwd(), 'public', 'gallery-placeholders');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

palettes.forEach((item, i) => {
  const num = i + 1;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="grad${num}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${item.bg}"/>
      <stop offset="100%" stop-color="${item.bg}" stop-opacity="0.82"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" rx="12" fill="url(#grad${num})"/>
  <circle cx="200" cy="160" r="100" fill="white" fill-opacity="0.08"/>
  <g fill="${item.fg}" color="${item.fg}">
    ${getIconSvg(item.icon)}
  </g>
  <text x="200" y="315" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="${item.fg}" text-anchor="middle" letter-spacing="1.5">MOMENT ${num < 10 ? '0' + num : num}</text>
  <text x="200" y="342" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="500" fill="${item.fg}" opacity="0.8" text-anchor="middle">VOLUNTEER STORY</text>
</svg>`;
  fs.writeFileSync(path.join(outDir, `moment-${num}.svg`), svg);
});

console.log('Generated 16 placeholder SVGs in public/gallery-placeholders');
