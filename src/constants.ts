import { Theme, FrameDesign } from './types';
import { SUNGLASSES_SVGS, HEADBANDS_SVGS, HATS_SVGS, NEW_YEAR_SVGS } from './svgStickers';
import premiumBackgrounds from './assets/premium-backgrounds-sheet.png';
import premiumFrames from './assets/premium-frames-sheet.png';
import premiumStickers from './assets/premium-stickers-sheet.png';
import premiumPlayfulBackgrounds from './assets/premium-backgrounds-playful-sheet.png';
import premiumStyleBackgrounds from './assets/premium-backgrounds-styles-sheet.png';
import premiumFaceOverlays from './assets/premium-face-overlays-sheet.png';
import premiumLifestyleStickers from './assets/premium-lifestyle-stickers-sheet.png';
import premiumThemeStickers from './assets/premium-theme-stickers-sheet.png';
import premiumHats from './assets/premium-hats-sheet.png';
import premiumThemeBackgroundsA from './assets/premium-theme-backgrounds-a-sheet.png';
import premiumThemeBackgroundsB from './assets/premium-theme-backgrounds-b-sheet.png';
import premiumHeadwearExtras from './assets/premium-headwear-extras-sheet.png';
import premiumEyewearExtras from './assets/premium-eyewear-extras-sheet.png';
import premiumStickersExtrasA from './assets/premium-stickers-extras-a-sheet.png';
import premiumStickersExtrasB from './assets/premium-stickers-extras-b-sheet.png';
import premiumSnacksY2kExtras from './assets/premium-snacks-y2k-extras-sheet.png';

export const PREMIUM_STICKER_SHEET = premiumStickers;
export const PREMIUM_STICKER_SHEETS: Record<string, string> = {
  premium: premiumStickers,
  face: premiumFaceOverlays,
  lifestyle: premiumLifestyleStickers,
  theme: premiumThemeStickers,
  hats: premiumHats,
  headwearExtra: premiumHeadwearExtras,
  eyewearExtra: premiumEyewearExtras,
  extrasA: premiumStickersExtrasA,
  extrasB: premiumStickersExtrasB,
  snacksY2k: premiumSnacksY2kExtras,
};

export const THEMES: Theme[] = [

  { id: 'seollal', name: '복 가득 설날', bgColor: '#FFF6E5', fgColor: '#5B1D20', accColor: '#D84A3A', description: '복주머니와 단청으로 완성한 따뜻한 새해', emojis: ['premium:0', 'premium:1', 'premium:2', 'premium:3'], bgImageUrl: premiumBackgrounds, imageCrop: [0, 0, .5, .5], palettes: [{ bgColor: '#FFF9F0', fgColor: '#432122', accColor: '#C83D36' }, { bgColor: '#F8F0D7', fgColor: '#173F3A', accColor: '#D7A52A' }], decorationType: 'lunar' },
  { id: 'chuseok-premium', name: '풍요로운 한가위', bgColor: '#15234A', fgColor: '#F8D36A', accColor: '#E87838', description: '보름달과 등불이 빛나는 가을밤', emojis: ['premium:4', 'premium:5', 'premium:6', 'premium:7'], bgImageUrl: premiumBackgrounds, imageCrop: [.5, 0, .5, .5], palettes: [], decorationType: 'stars' },
  { id: 'hangeul-premium', name: '한글날 책방', bgColor: '#F3E5C7', fgColor: '#34231F', accColor: '#A66A3F', description: '한지와 붓으로 꾸민 배움의 하루', emojis: ['premium:8', 'premium:9', 'premium:10', 'premium:11'], bgImageUrl: premiumBackgrounds, imageCrop: [0, .5, .5, .5], palettes: [], decorationType: 'notebook' },
  { id: 'spring-premium', name: '봄날 학교 소풍', bgColor: '#DDF4FF', fgColor: '#355845', accColor: '#F19AA6', description: '벚꽃이 피어난 교정의 봄날', emojis: ['premium:12', 'premium:13', 'premium:14', 'premium:15'], bgImageUrl: premiumBackgrounds, imageCrop: [.5, .5, .5, .5], palettes: [], decorationType: 'floral' },

  { id: 'children', name: '즐거운 어린이', bgColor: '#FEF9C3', fgColor: '#166534', accColor: '#F59E0B', description: '햇살 가득한 즐거운 하루', emojis: ['🎈', '🧸', '🍭', '🎡'], palettes: [{ bgColor: '#E0F7FA', fgColor: '#006064', accColor: '#FF6B6B' }, { bgColor: '#FFF9C4', fgColor: '#F57F17', accColor: '#4ECDC4' }], decorationType: 'bunting' },
  { id: 'parents', name: '부모님사랑해요', bgColor: '#FFE4E6', fgColor: '#881337', accColor: '#F43F5E', description: '사랑을 담은 따뜻한 하트', emojis: ['🌺', '🌸', '💝'], palettes: [{ bgColor: '#FFF5F8', fgColor: '#880E4F', accColor: '#EC407A' }], decorationType: 'rings' },
  { id: 'teacher', name: '선생님감사해요', bgColor: '#ECFCCB', fgColor: '#3F6212', accColor: '#84CC16', description: '감사의 마음을 전해요', emojis: ['🍎', '📚', '🖋️'], palettes: [{ bgColor: '#FDFCF8', fgColor: '#1E3A8A', accColor: '#27AE60' }], decorationType: 'notebook' },
  { id: 'friend', name: 'Y2K 우정네컷', bgColor: '#E6E6FA', fgColor: '#4B0082', accColor: '#9B51E0', description: '힙한 보랏빛 배경', emojis: ['🎧', '💿', '🦋', '⭐'], palettes: [{ bgColor: '#FDF2F8', fgColor: '#831843', accColor: '#F472B6' }], decorationType: 'blobs' },
  { id: 'family', name: '우리가족최고', bgColor: '#FFEDD5', fgColor: '#9A3412', accColor: '#F97316', description: '행복한 우리 가족', emojis: ['🌻', '🏠', '👨‍👩‍👧‍👦', '❤️'], palettes: [{ bgColor: '#FEF3C7', fgColor: '#78350F', accColor: '#F59E0B' }], decorationType: 'hills' },
  { id: 'sky', name: '청량한 하늘', bgColor: '#E0F2FE', fgColor: '#0C4A6E', accColor: '#38BDF8', description: '맑고 푸른 하늘 톤', emojis: ['☁️', '🕊️', '✈️', '☀️'], palettes: [], decorationType: 'clouds' },
  { id: 'ocean', name: '여름 바다', bgColor: '#CFFAFE', fgColor: '#083344', accColor: '#06B6D4', description: '시원한 바다 파도', emojis: ['🌊', '🏝️', '🐳', '🐚'], palettes: [], decorationType: 'waves' },
  { id: 'space', name: '우주 탐험', bgColor: '#0F172A', fgColor: '#F1F5F9', accColor: '#8B5CF6', description: '신비로운 밤하늘', emojis: ['🪐', '👽', '🚀', '⭐', '🌌'], palettes: [], decorationType: 'stars' },
  { id: 'cherry', name: '벚꽃놀이', bgColor: '#FCE7F3', fgColor: '#831843', accColor: '#F472B6', description: '흩날리는 벚꽃', emojis: ['🌸', '🍡', '💕', '🍵'], palettes: [], decorationType: 'floral' },
  { id: 'forest', name: '신비한 숲속', bgColor: '#D1FAE5', fgColor: '#064E3B', accColor: '#10B981', description: '초록빛 힐링', emojis: ['🌳', '🦌', '🍄', '🌿'], palettes: [], decorationType: 'floral' },
  { id: 'party', name: '생일 파티', bgColor: '#FEF08A', fgColor: '#713F12', accColor: '#F59E0B', description: '신나는 파티 타임', emojis: ['🎉', '🎂', '🎁', '🥳'], palettes: [], decorationType: 'confetti' },
  { id: 'retro', name: '레트로 게임', bgColor: '#18181B', fgColor: '#22C55E', accColor: '#EF4444', description: '8비트 감성', emojis: ['🕹️', '👾', '🎮', '💯'], palettes: [], decorationType: 'grid' },
  { id: 'neon', name: '네온 시티', bgColor: '#1E1E24', fgColor: '#00F0FF', accColor: '#FF003C', description: '사이버펑크 네온', emojis: ['⚡', '🌃', '🕶️', '🎵'], palettes: [], decorationType: 'gradient' },
  { id: 'pastel', name: '파스텔 블렌어', bgColor: '#FAF5FF', fgColor: '#4C1D95', accColor: '#C084FC', description: '요정같은 컬러풀 블렌딩', emojis: ['🦄', '🌈', '🍭', '✨'], palettes: [], decorationType: 'blobs' },
  { id: 'cat', name: '고양이 다이어리', bgColor: '#FFE4E6', fgColor: '#881337', accColor: '#FDA4AF', description: '냐옹냐옹 귀여운 발바닥', emojis: ['🐾', '🐈', '🧶', '🐟'], palettes: [], decorationType: 'dots' },
  { id: 'magic', name: '마법소녀', bgColor: '#FDF4FF', fgColor: '#701A75', accColor: '#D946EF', description: '변신! 마법의 별', emojis: ['🪄', '🌙', '🎀', '💖'], palettes: [], decorationType: 'sparkles' },
  { id: 'pixel', name: '픽셀 아트', bgColor: '#F3F4F6', fgColor: '#111827', accColor: '#3B82F6', description: '아기자기한 픽셀', emojis: ['🧊', '🧩', '💻', '🖲️'], palettes: [], decorationType: 'checkers' },
  { id: 'winter', name: '포근한 겨울', bgColor: '#F0F9FF', fgColor: '#0369A1', accColor: '#7DD3FC', description: '하얀 눈이 내리는', emojis: ['❄️', '⛄', '🧣', '☕'], palettes: [], decorationType: 'floating' },
  { id: 'picnic', name: '소풍가는 날', bgColor: '#FEFCE8', fgColor: '#854D0E', accColor: '#A3E635', description: '달콤한 디저트와 햇살', emojis: ['🥪', '🧃', '🧺', '🍓'], palettes: [], decorationType: 'checkers' },
  { id: 'hiphop', name: '스트릿 무드', bgColor: '#27272A', fgColor: '#F4F4F5', accColor: '#F59E0B', description: '자유로운 스트릿', emojis: ['🛹', '👟', '🧢', '🔥'], palettes: [], decorationType: 'grid' },
  { id: 'royal', name: '로열 팰리스', bgColor: '#FFFBEB', fgColor: '#78350F', accColor: '#B45309', description: '우아한 궁궐 느낌', emojis: ['👑', '🏰', '💎', '🍷'], palettes: [], decorationType: 'rings' },
  { id: 'cyber', name: '사이버 메틱', bgColor: '#09090B', fgColor: '#D4D4D8', accColor: '#3B82F6', description: '차가운 메탈릭 퓨처', emojis: ['🦾', '🛠️', '🧬', '⚙️'], palettes: [], decorationType: 'geometric' },
  { id: 'movie', name: '시네마틱', bgColor: '#111827', fgColor: '#FFFFFF', accColor: '#EF4444', description: '영화의 한 장면처럼', emojis: ['🎬', '🍿', '🎟️', '📽️'], palettes: [], decorationType: 'gradient' },
  { id: 'cottage', name: '코티지 코어', bgColor: '#FFF7ED', fgColor: '#9A3412', accColor: '#FDBA74', description: '동화 감성 촌캉스', emojis: ['🍞', '🌼', '📖', '🧶'], palettes: [], decorationType: 'hills' },
  { id: 'dark', name: '다크 아카데미아', bgColor: '#1C1917', fgColor: '#D6D3D1', accColor: '#78716C', description: '깊은 밤의 서재', emojis: ['🕰️', '🕯️', '📜', '☕'], palettes: [], decorationType: 'notebook' }
];

export const STICKER_CATEGORIES = [
  {
    name: '설날 스페셜 · 프리미엄',
    stickers: ['premium:0', 'premium:1', 'premium:2', 'premium:3', 'premium:4', 'premium:5', 'premium:6', 'premium:7', 'premium:8', 'premium:9', 'premium:10', 'premium:11', 'premium:12', 'premium:13', 'premium:14', 'premium:15']
  },
  {
    name: '모자',
    stickers: [...Array.from({ length: 16 }, (_, index) => `asset:hats:${index}`), ...Array.from({ length: 8 }, (_, index) => `asset:headwearExtra:${index}`)]
  },
  {
    name: '헤어밴드 & 머리띠',
    stickers: ['asset:face:0', 'asset:face:1', 'asset:face:2', 'asset:face:3', ...Array.from({ length: 8 }, (_, index) => `asset:headwearExtra:${index + 8}`)]
  },
  {
    name: '그래픽 선글라스 (안경다리 없음)',
    stickers: ['asset:face:4', 'asset:face:5', 'asset:face:6', 'asset:face:7', ...Array.from({ length: 8 }, (_, index) => `asset:eyewearExtra:${index}`)]
  },
  {
    name: '렌즈 색상별 도형',
    stickers: ['asset:face:8', 'asset:face:9', 'asset:face:10', 'asset:face:11', 'asset:face:12', 'asset:face:13', 'asset:face:14', 'asset:face:15', ...Array.from({ length: 8 }, (_, index) => `asset:eyewearExtra:${index + 8}`)]
  },
  {
    name: '악세사리 (귀걸이/목걸이/쥬얼리)',
    stickers: ['asset:theme:0', 'asset:theme:1', 'asset:theme:2', 'asset:theme:3', ...Array.from({ length: 4 }, (_, index) => `asset:extrasA:${index}`), ...Array.from({ length: 4 }, (_, index) => `asset:extrasB:${index}`)]
  },
  {
    name: '데코/이펙트 효과',
    stickers: ['asset:lifestyle:0', 'asset:lifestyle:1', 'asset:lifestyle:2', 'asset:lifestyle:3', ...Array.from({ length: 4 }, (_, index) => `asset:extrasA:${index + 4}`), ...Array.from({ length: 4 }, (_, index) => `asset:extrasB:${index + 4}`)]
  },
  {
    name: '귀여운 동물 친구들',
    stickers: ['asset:lifestyle:4', 'asset:lifestyle:5', 'asset:lifestyle:6', 'asset:lifestyle:7', ...Array.from({ length: 4 }, (_, index) => `asset:extrasA:${index + 8}`), ...Array.from({ length: 4 }, (_, index) => `asset:extrasB:${index + 8}`)]
  },
  {
    name: '맛있는 간식/디저트',
    stickers: ['asset:lifestyle:8', 'asset:lifestyle:9', 'asset:lifestyle:10', 'asset:lifestyle:11', ...Array.from({ length: 8 }, (_, index) => `asset:snacksY2k:${index}`)]
  },
  {
    name: 'Y2K / 힙한 감성',
    stickers: ['asset:lifestyle:12', 'asset:lifestyle:13', 'asset:lifestyle:14', 'asset:lifestyle:15', ...Array.from({ length: 8 }, (_, index) => `asset:snacksY2k:${index + 8}`)]
  }
];

export const FRAME_DESIGNS: FrameDesign[] = [
  { id: 'photo-rectangle', name: '기본 직사각형', style: 'classic', color: '#262626', borderColor: '#FFFFFF', emoji: '▭', shape: 'rect' },
  { id: 'photo-rounded', name: '라운드 직사각형', style: 'classic', color: '#262626', borderColor: '#FFFFFF', emoji: '▢', shape: 'rounded' },
  { id: 'photo-circle', name: '원형', style: 'classic', color: '#262626', borderColor: '#FFFFFF', emoji: '○', shape: 'circle' },
  { id: 'photo-oval', name: '타원형', style: 'classic', color: '#262626', borderColor: '#FFFFFF', emoji: '⬭', shape: 'oval' },
  { id: 'photo-arch', name: '아치형', style: 'classic', color: '#262626', borderColor: '#FFFFFF', emoji: '∩', shape: 'arch' },
  { id: 'photo-heart', name: '하트 모양', style: 'classic', color: '#262626', borderColor: '#FFFFFF', emoji: '♡', shape: 'heart' },
  { id: 'photo-star', name: '별 모양', style: 'classic', color: '#262626', borderColor: '#FFFFFF', emoji: '☆', shape: 'star' },
  { id: 'photo-ticket', name: '티켓 모양', style: 'classic', color: '#262626', borderColor: '#FFFFFF', emoji: '⌑', shape: 'ticket' },
];

const themeGridCrop = (index: number): [number, number, number, number] => [
  (index % 4) / 4, Math.floor(index / 4) / 4, .25, .25
];
const namedThemeBackgrounds: Record<string, { source: string; index: number }> = {
  children: { source: premiumThemeBackgroundsA, index: 0 }, parents: { source: premiumThemeBackgroundsA, index: 1 },
  teacher: { source: premiumThemeBackgroundsA, index: 2 }, friend: { source: premiumThemeBackgroundsA, index: 3 },
  family: { source: premiumThemeBackgroundsA, index: 4 }, sky: { source: premiumThemeBackgroundsA, index: 5 },
  ocean: { source: premiumThemeBackgroundsA, index: 6 }, space: { source: premiumThemeBackgroundsA, index: 7 },
  cherry: { source: premiumThemeBackgroundsA, index: 8 }, forest: { source: premiumThemeBackgroundsA, index: 9 },
  party: { source: premiumThemeBackgroundsA, index: 10 }, retro: { source: premiumThemeBackgroundsA, index: 11 },
  neon: { source: premiumThemeBackgroundsA, index: 12 }, pastel: { source: premiumThemeBackgroundsA, index: 13 },
  cat: { source: premiumThemeBackgroundsA, index: 14 }, magic: { source: premiumThemeBackgroundsA, index: 15 },
  pixel: { source: premiumThemeBackgroundsB, index: 0 }, winter: { source: premiumThemeBackgroundsB, index: 1 },
  picnic: { source: premiumThemeBackgroundsB, index: 2 }, hiphop: { source: premiumThemeBackgroundsB, index: 3 },
  royal: { source: premiumThemeBackgroundsB, index: 4 }, cyber: { source: premiumThemeBackgroundsB, index: 5 },
  movie: { source: premiumThemeBackgroundsB, index: 6 }, cottage: { source: premiumThemeBackgroundsB, index: 7 },
  dark: { source: premiumThemeBackgroundsB, index: 8 },
};

// Give every named theme a unique generated backdrop instead of rotating the
// same few designs through unrelated theme names.
THEMES.forEach((theme) => {
  const visual = namedThemeBackgrounds[theme.id];
  if (visual) {
    theme.bgImageUrl = visual.source;
    theme.imageCrop = themeGridCrop(visual.index);
  }
});

// Each catalogue theme keeps its original stickers and receives four polished,
// context-aware illustrated additions. The four premium launch themes already
// have their own dedicated four-item packs above.
const themeStickerPack = (theme: Theme): string[] => {
  if (['cherry', 'teacher', 'picnic', 'cottage', 'parents', 'family'].includes(theme.id)) return ['asset:theme:8', 'asset:theme:9', 'asset:theme:10', 'asset:theme:11'];
  if (['ocean', 'sky', 'summer', 'space'].includes(theme.id)) return ['asset:theme:12', 'asset:theme:13', 'asset:theme:14', 'asset:theme:15'];
  if (['friend', 'retro', 'neon', 'hiphop', 'cyber', 'pixel', 'movie'].includes(theme.id)) return ['asset:lifestyle:12', 'asset:lifestyle:13', 'asset:lifestyle:14', 'asset:lifestyle:15'];
  if (['children', 'cat', 'forest', 'magic', 'pastel'].includes(theme.id)) return ['asset:lifestyle:4', 'asset:lifestyle:5', 'asset:lifestyle:6', 'asset:lifestyle:7'];
  if (['party'].includes(theme.id)) return ['asset:lifestyle:0', 'asset:lifestyle:1', 'asset:lifestyle:2', 'asset:lifestyle:3'];
  if (['winter', 'royal', 'dark'].includes(theme.id)) return ['asset:theme:0', 'asset:theme:1', 'asset:theme:2', 'asset:theme:3'];
  return ['asset:theme:4', 'asset:theme:5', 'asset:theme:6', 'asset:theme:7'];
};
THEMES.forEach((theme) => {
  if (!['seollal', 'chuseok-premium', 'hangeul-premium', 'spring-premium'].includes(theme.id)) {
    theme.emojis = [...theme.emojis, ...themeStickerPack(theme)];
  }
});

// Every original frame option remains selectable; the generated illustration
// sheet provides the upgraded artwork in the 3-cut output and the selector.

