// 生成 Poetic Alps 主页的自定义 SVG 资产:水墨远山横幅、精选作品卡片、邮箱页脚。
// 视觉方向:克制的东方美学——宣纸与墨色的底、朱印作为唯一强调色、衬线字体、细线分隔、留白。
// 横幅母题为程序化生成的水墨远山(呼应 Poetic Alps),不使用山水古建等具象符号,不使用发光、网格、霓虹等科技装饰。
// 用法:node scripts/build-assets.mjs(零依赖,Node 18+)

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = join(ROOT, 'assets');

const SERIF = "'Noto Serif SC','Source Han Serif SC','Songti SC','STSong','SimSun',Georgia,serif";
const SANS = "'Noto Sans SC','PingFang SC','Microsoft YaHei','Segoe UI',Arial,sans-serif";

// 墨色(深色)与宣纸(浅色)两套色板。朱印为唯一强调色;远山用墨阶而非彩色。
const THEMES = {
  dark: {
    bg: '#15140F', panel: '#1B1A14', text: '#E9E3D3', muted: '#9E9785', dim: '#625C4D',
    line: '#3A372D', seal: '#C0543F', sealText: '#15140F',
    ridges: [['#443E2E', 0.5], ['#544C38', 0.6], ['#655B41', 0.72], ['#786C4E', 0.85]],
    disc: '#8A8064',
  },
  light: {
    bg: '#F4F0E4', panel: '#FBF8EF', text: '#1F1D18', muted: '#6C6657', dim: '#A59D8B',
    line: '#D6CCB7', seal: '#A8402F', sealText: '#FBF8EF',
    ridges: [['#C4BAA0', 0.5], ['#9A9078', 0.6], ['#6A6350', 0.72], ['#3B3729', 0.85]],
    disc: '#DCD2B6',
  },
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const write = (name, svg) => {
  mkdirSync(ASSETS, { recursive: true });
  writeFileSync(join(ASSETS, name), svg.trim() + '\n', 'utf8');
  console.log('wrote assets/' + name);
};

// ---------- 远山:控制点经中点二次贝塞尔平滑,向下闭合到画外(渐变在山脚完成消隐) ----------
function ridgePath(pts, floor = 400) {
  const mid = ([ax, ay], [bx, by]) => `${(ax + bx) / 2} ${(ay + by) / 2}`;
  let d = `M ${(pts[0][0] + pts[1][0]) / 2} ${(pts[0][1] + pts[1][1]) / 2}`;
  for (let i = 1; i < pts.length - 1; i++) d += ` Q ${pts[i][0]} ${pts[i][1]} ${mid(pts[i], pts[i + 1])}`;
  const last = pts[pts.length - 1];
  d += ` L ${last[0]} ${last[1]} L ${last[0]} ${floor} L ${pts[0][0]} ${floor} Z`;
  return d;
}

// 四层山,由远及近;峰谷交错,右缘出画,左缘交给渐隐蒙版处理
const RIDGES = [
  [[540, 244], [606, 170], [662, 226], [756, 138], [836, 228], [928, 158], [1008, 234], [1100, 146], [1182, 214], [1240, 178]],
  [[540, 272], [634, 206], [712, 262], [818, 190], [894, 258], [998, 198], [1088, 256], [1178, 204], [1240, 238]],
  [[540, 304], [654, 246], [748, 296], [862, 240], [952, 294], [1058, 250], [1150, 298], [1240, 266]],
  [[560, 332], [700, 310], [840, 328], [990, 304], [1130, 324], [1240, 312]],
];

// ---------- 横幅 1200×320 ----------
// 左:朱印「山」+ 衬线标题 + 细线 + 中英副题。右:四层水墨远山,每层向下渐隐入雾,左缘渐隐入纸底。
function banner(t) {
  const defs = [];
  const layers = RIDGES.map((pts, i) => {
    const c = t.ridges[i][0], op = t.ridges[i][1];
    const top = Math.min(...pts.map(p => p[1]));
    defs.push(`<linearGradient id="rg${i}" gradientUnits="userSpaceOnUse" x1="0" y1="${top}" x2="0" y2="345">
<stop offset="0" stop-color="${c}" stop-opacity="${op}"/>
<stop offset="0.5" stop-color="${c}" stop-opacity="${(op * 0.55).toFixed(2)}"/>
<stop offset="1" stop-color="${c}" stop-opacity="0"/>
</linearGradient>`);
    return `<path d="${ridgePath(pts, 400)}" fill="url(#rg${i})"/>`;
  }).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="320" viewBox="0 0 1200 320" role="img" aria-label="Poetic Alps — Creative Builder">
<defs>
${defs.join('\n')}
<linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="#000"/><stop offset="0.18" stop-color="#fff"/><stop offset="1" stop-color="#fff"/>
</linearGradient>
<mask id="mfade"><rect x="470" y="0" width="770" height="320" fill="url(#fade)"/></mask>
</defs>
<rect width="1200" height="320" fill="${t.bg}"/>
<circle cx="1032" cy="76" r="40" fill="none" stroke="${t.line}" stroke-width="1"/>
<circle cx="1032" cy="76" r="33" fill="${t.disc}"/>
<g mask="url(#mfade)">
${layers}
</g>
<rect x="76" y="84" width="34" height="34" fill="${t.seal}"/>
<text x="93" y="110" text-anchor="middle" font-family="${SERIF}" font-size="22" font-weight="700" fill="${t.sealText}">山</text>
<text x="76" y="192" font-family="${SERIF}" font-size="58" font-weight="600" letter-spacing="10" fill="${t.text}">POETIC ALPS</text>
<rect x="76" y="218" width="330" height="1" fill="${t.line}"/>
<text x="76" y="252" font-family="${SANS}" font-size="18" letter-spacing="5" fill="${t.muted}">CREATIVE BUILDER</text>
<text x="76" y="292" font-family="${SERIF}" font-size="26" fill="${t.text}">什么都做一点的建造者</text>
</svg>`;
}

// ---------- 精选作品卡片 600×260 ----------
// 宣纸底、细边框、勾选框与朱印。高亮作品以实心朱红框标识。
function card(p, t) {
  const border = p.highlight ? t.seal : t.line;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="260" viewBox="0 0 600 260" role="img" aria-label="${esc(p.title)}">
<rect x="0.5" y="0.5" width="599" height="259" rx="4" fill="${t.panel}" stroke="${border}"/>
${p.highlight
  ? `<rect x="28" y="28" width="14" height="14" fill="${t.seal}"/>`
  : `<rect x="28.5" y="28.5" width="13" height="13" fill="none" stroke="${t.muted}"/>`}
<text x="572" y="44" text-anchor="end" font-family="${SANS}" font-size="14" letter-spacing="1.5" fill="${t.dim}">${esc(p.kind)}</text>
<text x="28" y="92" font-family="${SERIF}" font-size="32" font-weight="600" fill="${t.text}">${esc(p.title)}</text>
<text x="28" y="124" font-family="${SANS}" font-size="18" fill="${t.muted}">${esc(p.subtitle)}</text>
<rect x="28" y="146" width="544" height="1" fill="${t.line}"/>
<text x="28" y="180" font-family="${SANS}" font-size="17" fill="${t.text}" fill-opacity=".9">${esc(p.desc[0])}</text>
<text x="28" y="210" font-family="${SANS}" font-size="17" fill="${t.text}" fill-opacity=".9">${esc(p.desc[1])}</text>
<text x="28" y="240" font-family="${SANS}" font-size="14" letter-spacing="0.5" fill="${t.dim}">${esc(p.tags.join(' · '))}</text>
</svg>`;
}

// ---------- 联系页脚 1200×120 ----------
// 与横幅同宽的横向页脚:左侧一句招呼,右侧邮箱;上缘一条细线与正文分隔。整张图可点击跳转 mailto。
function footer(t, email) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="120" viewBox="0 0 1200 120" role="img" aria-label="Say hello: ${esc(email)}">
<rect width="1200" height="120" fill="${t.bg}"/>
<rect x="76" y="0" width="1048" height="1" fill="${t.line}"/>
<rect x="76" y="50" width="10" height="10" fill="${t.seal}"/>
<text x="98" y="61" font-family="${SERIF}" font-size="26" fill="${t.text}">有点子想聊，或想一起做点什么，欢迎来信。</text>
<text x="1124" y="50" text-anchor="end" font-family="${SANS}" font-size="14" letter-spacing="3" fill="${t.dim}">EMAIL</text>
<text x="1124" y="82" text-anchor="end" font-family="${SERIF}" font-size="30" fill="${t.text}">${esc(email)}</text>
</svg>`;
}

function main() {
  const { projects } = JSON.parse(readFileSync(join(ROOT, 'scripts/projects.json'), 'utf8'));
  for (const [mode, t] of Object.entries(THEMES)) {
    write(`banner-${mode}.svg`, banner(t));
    for (const p of projects) write(`card-${p.id}-${mode}.svg`, card(p, t));
    write(`footer-${mode}.svg`, footer(t, '926382896@qq.com'));
  }
}

main();
