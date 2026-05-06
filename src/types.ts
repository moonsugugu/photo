export type DecorationType = 'floating' | 'bubbles' | 'grid' | 'dots' | 'stars' | 'floral' | 'notebook' | 'waves' | 'gradient' | 'confetti' | 'hearts' | 'checkers' | 'sparkles' | 'clouds' | 'geometric' | 'bunting' | 'rings' | 'blobs' | 'hills';

export interface Theme {
  id: string;
  name: string;
  bgColor: string;
  fgColor: string;
  accColor: string;
  description: string;
  emojis: string[];
  bgImageUrl?: string;
  palettes: { bgColor: string; fgColor: string; accColor: string }[];
  decorationType?: DecorationType;
}

export type FrameMode = '1-cut' | '3-cut' | '4-cut';

export interface FrameDesign {
  id: string;
  name: string;
  style: string;
  color: string;
  borderColor: string;
  emoji: string;
  shape: 'rect' | 'rounded' | 'circle' | 'arch' | 'oval' | 'stamp' | 'ticket' | 'heart' | 'star';
}

export interface Sticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity?: number;
}

export interface Shot {
  dataUrl: string;
  timestamp: number;
  imageObj?: HTMLImageElement;
}
