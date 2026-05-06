import { Theme, FrameDesign } from './types';
import { SUNGLASSES_SVGS, HEADBANDS_SVGS, HATS_SVGS } from './svgStickers';

export const THEMES: Theme[] = [

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
    name: '모자',
    stickers: HATS_SVGS
  },
  {
    name: '헤어밴드 & 머리띠',
    stickers: HEADBANDS_SVGS
  },
  {
    name: '그래픽 선글라스 (안경다리 없음)',
    stickers: SUNGLASSES_SVGS
  },
  {
    name: '렌즈 색상별 도형',
    stickers: [
      '🖤-🖤', '🤍-🤍', '❤️-❤️', '💙-💙', '💚-💚', '💛-💛', '💜-💜', '🤎-🤎', '💖-💖', '💔-💔', '❣️-❣️', '💕-💕', '💞-💞',
      '🔴-🔴', '🟠-🟠', '🟡-🟡', '🟢-🟢', '🔵-🔵', '🟣-🟣', '⚫-⚫', '⚪-⚪', '🟤-🟤', 
      '🔺-🔺', '🔻-🔻', '🔶-🔶', '🔷-🔷', '🔳-🔳', '🔲-🔲'
    ]
  },
  {
    name: '악세사리 (귀걸이/목걸이/쥬얼리)',
    stickers: ['💍', '💎', '📿', '🧿', '🔮', '🪙', '🎀', '💝', '🧣', '🧤', '👛', '👜', '💄', '💋', '🌂', '🌙', '⭐', '💧', '🍒', '🍓', '🔔', '✨', '⚡']
  },
  {
    name: '데코/이펙트 효과',
    stickers: ['✨', '⭐', '🌟', '💫', '🔥', '💥', '💦', '💨', '💗', '💖', '💘', '💕', '🎉', '🎊', '🎈']
  },
  {
    name: '귀여운 동물 친구들',
    stickers: ['🐶', '🐱', '🐰', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐣', '🦄', '🦋', '🐝']
  },
  {
    name: '맛있는 간식/디저트',
    stickers: ['🍭', '🍬', '🎂', '🍰', '🧁', '🍦', '🍨', '🍧', '🍩', '🍪', '🍫', '🍿', '🥤', '🧋', '🍕', '🌭']
  },
  {
    name: 'Y2K / 힙한 감성',
    stickers: ['📱', '📟', '📸', '🎧', '💿', '📼', '🛹', '🎸', '🎮', '👾', '👽', '💀', '🖤', '🔥', '🧨', '🧿']
  }
];

export const FRAME_DESIGNS: FrameDesign[] = [
  { id: 'classic', name: '시그니처 블랙 (기본)', style: 'classic', color: '#1A1A1A', borderColor: '#F5F5F5', emoji: '⬛', shape: 'rect' },
  { id: 'rounded', name: '블랙 라운딩 (부드러운)', style: 'classic', color: '#1A1A1A', borderColor: '#F5F5F5', emoji: '🔲', shape: 'rounded' },
  { id: 'film', name: '영화 필름 (아치형)', style: 'film', color: '#111111', borderColor: '#FFFFFF', emoji: '🎞️', shape: 'arch' },
  { id: 'lace', name: '앤틱 레이스 (타원형)', style: 'lace', color: '#FDFBF7', borderColor: '#D4C4B7', emoji: '🏛️', shape: 'oval' },
  { id: 'flower', name: '플로럴 덩굴 (둥근모서리)', style: 'flower', color: '#E9ECEF', borderColor: '#8FBC8F', emoji: '🌿', shape: 'rounded' },
  { id: 'cartoon', name: '코믹북 액자 (기본)', style: 'cartoon', color: '#FFE066', borderColor: '#000000', emoji: '🗯️', shape: 'rect' },
  { id: 'heart', name: '러블리 하트 (둥근모서리)', style: 'heart', color: '#FFB6C1', borderColor: '#FF1493', emoji: '💗', shape: 'rounded' },
  { id: 'vintage', name: '빈티지 둥근 액자', style: 'vintage', color: '#8B4513', borderColor: '#D2B48C', emoji: '🪵', shape: 'circle' },
  { id: 'star_cut', name: '매직 스타 컷', style: 'star', color: '#1B263B', borderColor: '#FFD700', emoji: '⭐', shape: 'star' },
  { id: 'heart_cut', name: '러블리 하트 컷', style: 'heart', color: '#FFE4E6', borderColor: '#F43F5E', emoji: '💖', shape: 'heart' },
  { id: 'ticket_red', name: '레트로 티켓 (레드)', style: 'ticket', color: '#FEF2F2', borderColor: '#EF4444', emoji: '🎟️', shape: 'ticket' },
  { id: 'ticket_blue', name: '레트로 티켓 (블루)', style: 'ticket', color: '#EFF6FF', borderColor: '#3B82F6', emoji: '🎫', shape: 'ticket' },
  { id: 'stamp_post', name: '우표 느낌 (베이지)', style: 'stamp', color: '#FFFBEB', borderColor: '#D97706', emoji: '📮', shape: 'stamp' },
  { id: 'stamp_mint', name: '우표 느낌 (민트)', style: 'stamp', color: '#F0FDF4', borderColor: '#059669', emoji: '✉️', shape: 'stamp' },
  { id: 'neon_pink', name: '네온 핑크 라운딩', style: 'neon', color: '#09090B', borderColor: '#EC4899', emoji: '😈', shape: 'rounded' },
  { id: 'neon_green', name: '네온 그린 직각', style: 'neon', color: '#09090B', borderColor: '#10B981', emoji: '⚡', shape: 'rect' },
  { id: 'polaroid', name: '화이트 폴라로이드', style: 'polaroid', color: '#FFFFFF', borderColor: '#E5E7EB', emoji: '📸', shape: 'rect' },
  { id: 'arch_window', name: '아치형 창문', style: 'arch', color: '#FDF8F6', borderColor: '#D6D3D1', emoji: '🪟', shape: 'arch' },
  { id: 'circle_pop', name: '동그라미 팝', style: 'circle', color: '#FEF08A', borderColor: '#EAB308', emoji: '🟡', shape: 'circle' },
  { id: 'oval_mirror', name: '타원형 거울', style: 'oval', color: '#F8FAFC', borderColor: '#94A3B8', emoji: '🪞', shape: 'oval' },
  { id: 'cloud_soft', name: '구름 라운딩', style: 'minimal', color: '#F0F9FF', borderColor: '#38BDF8', emoji: '☁️', shape: 'rounded' },
  { id: 'dark_star', name: '다크 우주 별컷', style: 'star', color: '#0F172A', borderColor: '#818CF8', emoji: '✨', shape: 'star' }
];

