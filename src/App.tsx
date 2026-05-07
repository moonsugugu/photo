/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, Download, RefreshCw, Star, Heart, Users, Sparkles, Smile, Trash2, Layout, Image as ImageIcon, Check, ChevronLeft, ChevronRight, SwitchCamera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageSegmenter, FilesetResolver } from '@mediapipe/tasks-vision';

import confetti from 'canvas-confetti';
import { THEMES, STICKER_CATEGORIES, FRAME_DESIGNS } from './constants';
import { Theme, FrameMode, Sticker, Shot, FrameDesign } from './types';

const imageCache = new Map<string, HTMLImageElement>();

const traceShape = (ctx: CanvasRenderingContext2D, shape: string, x: number, y: number, w: number, h: number) => {
    ctx.beginPath();
    if (shape === 'rounded') {
        const r = 24;
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
    } else if (shape === 'circle') {
        const r = Math.min(w, h) / 2;
        ctx.arc(x + w / 2, y + h / 2, r, 0, Math.PI * 2);
    } else if (shape === 'arch') {
        const r = w / 2;
        ctx.moveTo(x, y + h);
        ctx.lineTo(x, y + r);
        ctx.arc(x + r, y + r, r, Math.PI, 0);
        ctx.lineTo(x + w, y + h);
    } else if (shape === 'oval') {
        ctx.ellipse(x + w/2, y + h/2, w/2, h/2, 0, 0, Math.PI * 2);
    } else if (shape === 'stamp') {
        // stamp shape: small cutouts along edges
        const r = 8;
        ctx.moveTo(x, y);
        for(let i=x+r; i<x+w; i+=r*2.5) { ctx.lineTo(i, y); ctx.arc(i+r/2, y, r, Math.PI, 0, true); }
        ctx.lineTo(x+w, y);
        for(let i=y+r; i<y+h; i+=r*2.5) { ctx.lineTo(x+w, i); ctx.arc(x+w, i+r/2, r, 1.5*Math.PI, 0.5*Math.PI, true); }
        ctx.lineTo(x+w, y+h);
        for(let i=x+w-r; i>x; i-=r*2.5) { ctx.lineTo(i, y+h); ctx.arc(i-r/2, y+h, r, 0, Math.PI, true); }
        ctx.lineTo(x, y+h);
        for(let i=y+h-r; i>y; i-=r*2.5) { ctx.lineTo(x, i); ctx.arc(x, i-r/2, r, 0.5*Math.PI, 1.5*Math.PI, true); }
        ctx.lineTo(x, y);
    } else if (shape === 'ticket') {
        const r = 20;
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.arc(x + w, y, r, Math.PI, 0.5*Math.PI, true);
        ctx.lineTo(x + w, y + h - r);
        ctx.arc(x + w, y + h, r, 1.5*Math.PI, Math.PI, true);
        ctx.lineTo(x + r, y + h);
        ctx.arc(x, y + h, r, 0, 1.5*Math.PI, true);
        ctx.lineTo(x, y + r);
        ctx.arc(x, y, r, 0.5*Math.PI, 0, true);
    } else if (shape === 'heart') {
        ctx.moveTo(x + w/2, y + h/4);
        ctx.bezierCurveTo(x + w, y - h/4, x + w*1.2, y + h/2, x + w/2, y + h);
        ctx.bezierCurveTo(x - w*0.2, y + h/2, x, y - h/4, x + w/2, y + h/4);
    } else if (shape === 'star') {
        const cx = x + w/2, cy = y + h/2;
        const spikes = 5;
        const outerRadius = Math.min(w,h)/2, innerRadius = outerRadius/2;
        let rot = Math.PI/2 * 3;
        let cx1 = cx, cy1 = cy - outerRadius;
        ctx.moveTo(cx1, cy1);
        for(let i = 0; i < spikes; i++) {
            ctx.lineTo(cx + Math.cos(rot)*outerRadius, cy + Math.sin(rot)*outerRadius);
            rot += Math.PI/spikes;
            ctx.lineTo(cx + Math.cos(rot)*innerRadius, cy + Math.sin(rot)*innerRadius);
            rot += Math.PI/spikes;
        }
        ctx.lineTo(cx, cy - outerRadius);
    } else {
        ctx.rect(x, y, w, h);
    }
};

export default function App() {
  // --- Refs ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fullscreenCanvasRef = useRef<HTMLCanvasElement>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const segmentationRef = useRef<ImageSegmenter | null>(null);
  const segmentedCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- Refs for Stickers so callback sees newest ---
  const stickersRef = useRef<Sticker[]>([]);
  const selectedStickerIdRef = useRef<string | null>(null);
  const frameModeRef = useRef<FrameMode>('4-cut');
  const activeFrameDesignRef = useRef<FrameDesign>(FRAME_DESIGNS[0]);
  const activeThemeRef = useRef<Theme>(THEMES[0]);
  const shotsRef = useRef<Shot[]>([]);
  const retakingIndexRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const allShotFramesRef = useRef<HTMLImageElement[][]>([]);
  const customBgImageRef = useRef<HTMLImageElement | null>(null);
  const videoExtRef = useRef<string>('mp4');

  // --- State ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  
  const isAndroid = typeof window !== 'undefined' && /Android/i.test(navigator.userAgent);
  const defaultFacingMode = isAndroid ? 'environment' : 'user';

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(defaultFacingMode);
  const facingModeRef = useRef<'user' | 'environment'>(defaultFacingMode);
  const [activeTheme, setActiveTheme] = useState<Theme>(THEMES[0]);
  const [activeFrameDesign, setActiveFrameDesign] = useState<FrameDesign>(FRAME_DESIGNS[0]);
  const [frameMode, setFrameMode] = useState<FrameMode>('4-cut');
  const [canvasDim, setCanvasDim] = useState({ w: 600, h: 600 });
  const [shots, setShots] = useState<Shot[]>([]);
  const [isTakingShots, setIsTakingShots] = useState(false);
  const [retakingIndex, setRetakingIndex] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'camera' | 'themes' | 'frames' | 'stickers' | 'texts'>('themes');
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [textSize, setTextSize] = useState(40);
  const [isTextBold, setIsTextBold] = useState(false);
  const [textColor, setTextColor] = useState('#000000');

  // Camera Settings State
  const [cameraBrightness, setCameraBrightness] = useState(100);
  const [cameraHue, setCameraHue] = useState(0);
  const [cameraBlur, setCameraBlur] = useState(0);
  const [cameraContrast, setCameraContrast] = useState(100);
  const [cameraSaturate, setCameraSaturate] = useState(100);
  const [cameraSepia, setCameraSepia] = useState(0);
  const [cameraGrayscale, setCameraGrayscale] = useState(0);
  const [cameraInvert, setCameraInvert] = useState(0);
  const [removeBackground, setRemoveBackground] = useState(true);

  const canvasDimRef = useRef({ w: 600, h: 600 });
  const topTextRef = useRef('');
  const bottomTextRef = useRef('');
  const textSizeRef = useRef(40);
  const isTextBoldRef = useRef(false);
  const textColorRef = useRef('#000000');
  const cameraFilterRef = useRef('none');
  const removeBackgroundRef = useRef(true);

  useEffect(() => {
    switch (frameMode) {
      case '1-cut':
        setCanvasDim({ w: 800, h: 600 }); // 4:3
        break;
      case '3-cut':
        setCanvasDim({ w: 500, h: 1000 }); // Strip layout
        break;
      case '4-cut':
        setCanvasDim({ w: 700, h: 840 }); // 2x2 grid layout
        break;
    }
  }, [frameMode]);

  useEffect(() => {
    if (activeTheme.bgImageUrl) {
        if (customBgImageRef.current?.src !== activeTheme.bgImageUrl) {
            const img = new Image();
            img.src = activeTheme.bgImageUrl;
            img.onload = () => {
                customBgImageRef.current = img;
            };
        }
    } else {
        customBgImageRef.current = null;
    }
  }, [activeTheme]);

  useEffect(() => {
    stickersRef.current = stickers;
    selectedStickerIdRef.current = selectedStickerId;
    frameModeRef.current = frameMode;
    activeFrameDesignRef.current = activeFrameDesign;
    activeThemeRef.current = activeTheme;
    canvasDimRef.current = canvasDim;
    shotsRef.current = shots;
    retakingIndexRef.current = retakingIndex;
    topTextRef.current = topText;
    bottomTextRef.current = bottomText;
    textSizeRef.current = textSize;
    isTextBoldRef.current = isTextBold;
    textColorRef.current = textColor;
  }, [stickers, selectedStickerId, frameMode, activeFrameDesign, activeTheme, canvasDim, shots, retakingIndex, topText, bottomText, textSize, isTextBold, textColor]);

  useEffect(() => {
    cameraFilterRef.current = `brightness(${cameraBrightness}%) hue-rotate(${cameraHue}deg) blur(${cameraBlur}px) contrast(${cameraContrast}%) saturate(${cameraSaturate}%) sepia(${cameraSepia}%) grayscale(${cameraGrayscale}%) invert(${cameraInvert}%)`;
    removeBackgroundRef.current = removeBackground;
  }, [cameraBrightness, cameraHue, cameraBlur, cameraContrast, cameraSaturate, cameraSepia, cameraGrayscale, cameraInvert, removeBackground]);



  useEffect(() => {
    const initSegmenter = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        segmentationRef.current = await ImageSegmenter.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
            delegate: "CPU"
          },
          runningMode: "VIDEO",
          outputCategoryMask: false,
          outputConfidenceMasks: true,
        });
      } catch (e) {
        console.error("Failed to initialize MediaPipe Image Segmenter:", e);
      }
    };
    initSegmenter();
  }, []);

  // --- Camera Setup ---
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('이 브라우저/환경에서는 카메라를 지원하지 않거나 안전한 연결(HTTPS)이 아닙니다.');
      }
      
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: { exact: facingModeRef.current } },
          audio: false,
        });
      } catch (e) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: facingModeRef.current },
          audio: false,
        });
      }

      if (videoRef.current) {
        // Stop any existing tracks
        if (videoRef.current.srcObject) {
          const oldStream = videoRef.current.srcObject as MediaStream;
          oldStream.getTracks().forEach(track => track.stop());
        }
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = async () => {
          setIsCameraReady(true);
          try {
            await videoRef.current?.play();
          } catch(e: any) {
            if (e.name !== 'AbortError') {
              console.error('Play error:', e);
            }
          }
        };
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      let errorMessage = '카메라를 연결할 수 없습니다.';
      if (err?.name === 'NotAllowedError' || err?.message === 'Permission denied') {
         errorMessage = '브라우저에서 카메라 접근이 차단되었습니다. 주소창의 권한 설정에서 카메라를 허용해주세요.';
      } else if (err?.name === 'NotFoundError') {
         errorMessage = '연결된 카메라 기기를 찾을 수 없습니다.';
      } else if (err?.message) {
         errorMessage = `카메라 오류: ${err.message}`;
      }
      setCameraError(errorMessage);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      startCamera();
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
         const stream = videoRef.current.srcObject as MediaStream;
         stream.getTracks().forEach(track => track.stop());
         videoRef.current.srcObject = null;
      }
    };
  }, [startCamera, isAuthenticated]);

  const frameRef = useRef<number>();
  const lastProcessTimeRef = useRef<number>(0);

  const processFrame = useCallback(async () => {
    frameRef.current = requestAnimationFrame(processFrame);

    if (!videoRef.current || !isCameraReady) return;

    const now = performance.now();

    // If no background removal, draw at full speed (60fps)
    if (!segmentationRef.current || !removeBackgroundRef.current) {
        drawCanvas();
        return;
    }

    // Heavy segmentation task - limit to 15fps to keep UI thread unblocked for animations/React
    if (now - lastProcessTimeRef.current < 1000 / 15) {
        drawCanvas(); // Draw the previous segmented frame
        return;
    }
    
    lastProcessTimeRef.current = now;

    try {
        const result = segmentationRef.current.segmentForVideo(videoRef.current, performance.now());
        if (result && result.confidenceMasks && result.confidenceMasks.length > 0) {
            const maskArray = result.confidenceMasks[0].getAsFloat32Array();
            if (!segmentedCanvasRef.current) {
                segmentedCanvasRef.current = document.createElement('canvas');
            }
            const canvas = segmentedCanvasRef.current;
            const w = videoRef.current.videoWidth || 640;
            const h = videoRef.current.videoHeight || 480;
            if (canvas.width !== w) canvas.width = w;
            if (canvas.height !== h) canvas.height = h;
            
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
                ctx.clearRect(0, 0, w, h);
                if (cameraFilterRef.current && cameraFilterRef.current !== 'none') {
                    ctx.filter = cameraFilterRef.current;
                }
                ctx.drawImage(videoRef.current, 0, 0, w, h);
                ctx.filter = 'none';
                const imgData = ctx.getImageData(0, 0, w, h);
                for (let i = 0; i < maskArray.length; i++) {
                    // Set alpha channel. maskArray[i] is person confidence (0 to 1).
                    // Background will be 0.
                    imgData.data[i * 4 + 3] = maskArray[i] * 255;
                }
                ctx.putImageData(imgData, 0, 0);
            }
            result.close();
        }
        drawCanvas();
    } catch(e) {
        drawCanvas();
    }
  }, [isCameraReady]);

  useEffect(() => {
    if (isCameraReady) {
      frameRef.current = requestAnimationFrame(processFrame);
    }
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isCameraReady, processFrame]);

  const drawCover = (ctx: CanvasRenderingContext2D, source: HTMLImageElement | HTMLVideoElement, x: number, y: number, w: number, h: number, mirror: boolean, shape: string = 'rect', filter: string = 'none') => {
      const srcW = source instanceof HTMLVideoElement ? source.videoWidth || 640 : source.width;
      const srcH = source instanceof HTMLVideoElement ? source.videoHeight || 480 : source.height;
      if (srcW === 0 || srcH === 0) return;
      const srcAspect = srcW / srcH;
      const destAspect = w / h;
      
      let drawW, drawH, drawX, drawY;
      if (srcAspect > destAspect) {
          drawH = h;
          drawW = drawH * srcAspect;
          drawX = x + (w - drawW) / 2;
          drawY = y;
      } else {
          drawW = w;
          drawH = drawW / srcAspect;
          drawX = x;
          drawY = y + (h - drawH) / 2;
      }

      ctx.save();
      
      // Define clip path based on shape
      traceShape(ctx, shape, x, y, w, h);
      ctx.clip();

      if (mirror) {
          ctx.translate(x + w / 2, 0);
          ctx.scale(-1, 1);
          ctx.translate(-(x + w / 2), 0);
      }
      if (filter !== 'none') {
         ctx.filter = filter;
      }
      ctx.drawImage(source, drawX, drawY, drawW, drawH);
      ctx.restore();
  };

  const renderScene = (
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    currentTheme: Theme,
    currentFrameMode: FrameMode,
    currentFrameDesign: FrameDesign,
    currentStickers: Sticker[],
    currentSelectedId: string | null,
    currentShots: Shot[],
    liveSource: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | null,
    retakingIndex: number | null,
    topText: string,
    bottomText: string,
    textSize: number,
    isTextBold: boolean,
    textColor: string,
    customBgImage?: HTMLImageElement | null
) => {
    ctx.save();
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 1. Draw Background (based on theme)
    ctx.fillStyle = currentTheme.bgColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    if (customBgImage) {
        let drawW, drawH, drawX, drawY;
        const srcW = customBgImage.width;
        const srcH = customBgImage.height;
        const srcAspect = srcW / srcH;
        const destAspect = canvasWidth / canvasHeight;
        if (srcAspect > destAspect) {
            drawH = canvasHeight;
            drawW = drawH * srcAspect;
            drawX = (canvasWidth - drawW) / 2;
            drawY = 0;
        } else {
            drawW = canvasWidth;
            drawH = drawW / srcAspect;
            drawX = 0;
            drawY = (canvasHeight - drawH) / 2;
        }
        ctx.globalAlpha = 1;
        ctx.drawImage(customBgImage, drawX, drawY, drawW, drawH);
    } else {
        drawBackgroundDecorations(ctx, currentTheme);
    }

    const padding = 20;
    const footerHeight = 100;
    const headerHeight = topText ? 80 : 0;
    let slotWidth = 0, slotHeight = 0;
    
    interface Slot { x: number; y: number; w: number; h: number; }
    const slots: Slot[] = [];

    if (currentFrameMode === '1-cut') {
         slotWidth = canvasWidth - padding * 2;
         slotHeight = canvasHeight - padding * 2 - headerHeight - footerHeight;
         slots.push({ x: padding, y: padding + headerHeight, w: slotWidth, h: slotHeight });
    } else if (currentFrameMode === '3-cut') {
         slotWidth = canvasWidth - padding * 2;
         slotHeight = (canvasHeight - padding * 4 - headerHeight - footerHeight) / 3;
         for (let i = 0; i < 3; i++) {
             slots.push({ x: padding, y: padding + headerHeight + i * (slotHeight + padding), w: slotWidth, h: slotHeight });
         }
    } else if (currentFrameMode === '4-cut') {
         slotWidth = (canvasWidth - padding * 3) / 2;
         slotHeight = (canvasHeight - padding * 3 - headerHeight - footerHeight) / 2;
         for (let i = 0; i < 4; i++) {
             const col = i % 2;
             const row = Math.floor(i / 2);
             slots.push({ 
                 x: padding + col * (slotWidth + padding), 
                 y: padding + headerHeight + row * (slotHeight + padding), 
                 w: slotWidth, 
                 h: slotHeight 
             });
         }
    }

    // 2. Draw Slots
    slots.forEach((slot, index) => {
        const shape = currentFrameDesign.shape || 'rect';
        
        // Draw inner white border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 10;
        traceShape(ctx, shape, slot.x, slot.y, slot.w, slot.h);
        ctx.stroke();
        
        const isRetakingThisSlot = retakingIndex === index;
        
        if (isRetakingThisSlot && liveSource) {
            drawCover(ctx, liveSource, slot.x, slot.y, slot.w, slot.h, true, shape, cameraFilterRef.current);
        } else if (index < currentShots.length && (currentShots[index].imageObj?.complete || currentShots[index].imageObj instanceof HTMLCanvasElement)) {
            drawCover(ctx, currentShots[index].imageObj!, slot.x, slot.y, slot.w, slot.h, false, shape);
        } else if (index === currentShots.length && retakingIndex === null && liveSource) {
            drawCover(ctx, liveSource, slot.x, slot.y, slot.w, slot.h, true, shape, cameraFilterRef.current);
        } else {
             // Future slots, show placeholder
             ctx.fillStyle = 'rgba(255,255,255,0.3)';
             traceShape(ctx, shape, slot.x, slot.y, slot.w, slot.h);
             ctx.fill();
             
             ctx.fillStyle = '#D1D5DB';
             ctx.font = 'bold 24px sans-serif';
             ctx.textAlign = 'center';
             ctx.textBaseline = 'middle';
             ctx.fillText(`${index + 1}`, slot.x + slot.w/2, slot.y + slot.h/2);
        }
    });

    // 3. Draw Frame Design Overlay in Preview
    drawFrameOverlay(
      ctx, 
      currentFrameDesign, 
      10, 
      10, 
      canvasWidth - 20, 
      canvasHeight - 20
    );

    // Footer/Header Texts
    ctx.fillStyle = textColor || currentTheme.fgColor;
    ctx.textAlign = 'center';

    const fw = isTextBold ? '800' : '400';
    if (topText) {
        ctx.font = `${fw} ${textSize + 12}px sans-serif`;
        ctx.fillText(topText, canvasWidth / 2, padding + headerHeight / 2 + 10);
    }

    const botT = bottomText || `${currentTheme.name}`;
    if (botT) {
        ctx.font = `${fw} ${textSize}px sans-serif`;
        ctx.fillText(botT, canvasWidth / 2, canvasHeight - padding - 10);
    }

    // 4. Draw Stickers
    currentStickers.forEach((s) => {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate((s.rotation * Math.PI) / 180);
      ctx.font = `${s.size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;

      ctx.globalAlpha = s.opacity ?? 1;
      if (s.emoji.startsWith('data:image/')) {
        let img = imageCache.get(s.emoji);
        if (!img) {
          img = new Image();
          img.onload = () => setStickers(prev => [...prev]);
          img.src = s.emoji;
          imageCache.set(s.emoji, img);
        }
        if (img.complete && img.naturalHeight > 0) {
          const aspect = img.naturalWidth / img.naturalHeight;
          const h = s.size;
          const w = s.size * aspect;
          ctx.drawImage(img, -w / 2, -h / 2, w, h);
        }
      } else {
        ctx.fillText(s.emoji, 0, 0);
      }
      ctx.globalAlpha = 1;
      ctx.shadowColor = 'transparent';

      if (s.id === currentSelectedId) {
        // Outline
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(-s.size / 2 - 10, -s.size / 2 - 10, s.size + 20, s.size + 20);
        
        ctx.setLineDash([]);

        const handleRadius = 12;

        // --- Opacity Up Handle (Top-Left) ---
        ctx.fillStyle = '#118AB2';
        ctx.beginPath();
        ctx.arc(-s.size / 2 - 10, -s.size / 2 - 10, handleRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('+', -s.size / 2 - 10, -s.size / 2 - 9);

        // --- Opacity Down Handle (Top-Left, offset right) ---
        ctx.fillStyle = '#118AB2';
        ctx.beginPath();
        ctx.arc(-s.size / 2 + 18, -s.size / 2 - 10, handleRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('-', -s.size / 2 + 18, -s.size / 2 - 10);

        // --- Resize Handle (Bottom-Right) ---
        ctx.fillStyle = currentTheme.fgColor;
        ctx.beginPath();
        ctx.arc(s.size / 2 + 10, s.size / 2 + 10, handleRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // --- Rotate Handle (Bottom-Left) ---
        ctx.fillStyle = '#4ECDC4';
        ctx.beginPath();
        ctx.arc(-s.size / 2 - 10, s.size / 2 + 10, handleRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Rotate icon
        ctx.fillStyle = '#fff';
        ctx.font = '14px sans-serif';
        ctx.fillText('↻', -s.size / 2 - 10, s.size / 2 + 11);

        // --- Delete Handle (Top-Right) ---
        ctx.fillStyle = '#FF6B6B';
        ctx.beginPath();
        ctx.arc(s.size / 2 + 10, -s.size / 2 - 10, handleRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // X icon
        ctx.fillStyle = '#fff';
        ctx.font = '12px sans-serif';
        ctx.fillText('✕', s.size / 2 + 10, -s.size / 2 - 9);
      }
      ctx.restore();
    });
    
    ctx.restore();
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentTheme = activeThemeRef.current;
    const currentFrameMode = frameModeRef.current;
    const currentFrameDesign = activeFrameDesignRef.current;
    const currentStickers = stickersRef.current;
    const currentSelectedId = selectedStickerIdRef.current;
    const dim = canvasDimRef.current;
    const currentShots = shotsRef.current;

    if (canvas.width !== dim.w || canvas.height !== dim.h) {
      canvas.width = dim.w;
      canvas.height = dim.h;
    }

    const liveSource = removeBackgroundRef.current && segmentedCanvasRef.current ? segmentedCanvasRef.current : video;
    
    if (fullscreenCanvasRef.current) {
        const fsCanvas = fullscreenCanvasRef.current;
        const fsCtx = fsCanvas.getContext('2d');
        if (fsCtx) {
           const srcW = liveSource instanceof HTMLVideoElement ? liveSource.videoWidth || 640 : liveSource.width;
           const srcH = liveSource instanceof HTMLVideoElement ? liveSource.videoHeight || 480 : liveSource.height;
           if (srcW > 0 && srcH > 0) {
               if (fsCanvas.width !== srcW || fsCanvas.height !== srcH) {
                   fsCanvas.width = srcW;
                   fsCanvas.height = srcH;
               }
               fsCtx.clearRect(0, 0, fsCanvas.width, fsCanvas.height);
               fsCtx.save();
               if (cameraFilterRef.current !== 'none') {
                   fsCtx.filter = cameraFilterRef.current;
               }
               fsCtx.drawImage(liveSource, 0, 0, fsCanvas.width, fsCanvas.height);
               fsCtx.restore();
           }
        }
    }

    renderScene(
      ctx,
      canvas.width,
      canvas.height,
      currentTheme,
      currentFrameMode,
      currentFrameDesign,
      currentStickers,
      currentSelectedId,
      currentShots,
      liveSource,
      retakingIndexRef.current,
      topTextRef.current,
      bottomTextRef.current,
      textSizeRef.current,
      isTextBoldRef.current,
      textColorRef.current,
      customBgImageRef.current
    );
  };

  const drawFallbackFrame = () => {
    // legacy, but not needed anymore
  };

  const onResults = () => {
      // legacy, not needed
  };

  const drawFrameOverlay = (ctx: CanvasRenderingContext2D, design: FrameDesign, x: number, y: number, w: number, h: number) => {
    ctx.save();
    
    // Outer Thick overlay that covers the edges
    const frameThick = 40;
    
    ctx.lineWidth = frameThick;
    ctx.strokeStyle = design.color;
    ctx.strokeRect(x - frameThick/2, y - frameThick/2, w + frameThick, h + frameThick);

    // Inner thin border
    ctx.lineWidth = 4;
    ctx.strokeStyle = design.borderColor;
    ctx.strokeRect(x, y, w, h);

    // Specific Style Decorations overlapping the edge
    ctx.fillStyle = design.borderColor;
    if (design.style === 'lace') {
        for (let i = 0; i <= w; i += 40) {
            ctx.beginPath(); ctx.arc(x + i, y, 15, 0, Math.PI); ctx.fill();
            ctx.beginPath(); ctx.arc(x + i, y + h, 15, Math.PI, 0); ctx.fill();
        }
        for (let i = 0; i <= h; i += 40) {
            ctx.beginPath(); ctx.arc(x, y + i, 15, -Math.PI/2, Math.PI/2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + w, y + i, 15, Math.PI/2, -Math.PI/2); ctx.fill();
        }
    } else if (design.style === 'film') {
        ctx.fillStyle = '#111111';
        ctx.fillRect(x - 30, y, 30, h);
        ctx.fillRect(x + w, y, 30, h);
        ctx.fillStyle = '#FFFFFF';
        for(let i = 20; i < h; i+= 40) {
            ctx.fillRect(x - 22, y + i, 14, 20);
            ctx.fillRect(x + w + 8, y + i, 14, 20);
        }
    } else if (design.style === 'cartoon') {
        ctx.fillStyle = design.color;
        // Zigzag edge or thick black dots
        ctx.fillStyle = '#000000';
        for (let i = 20; i < w; i += 60) {
            ctx.beginPath(); ctx.arc(x + i, y - 10, 8, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + i, y + h + 10, 8, 0, Math.PI*2); ctx.fill();
        }
    } else if (design.style === 'heart') {
        ctx.fillStyle = design.borderColor;
        for (let i = 30; i < w; i += 80) {
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('♥', x + i, y - 10);
            ctx.fillText('♥', x + i, y + h + 10);
        }
    } else if (design.style === 'flower') {
        ctx.fillStyle = design.borderColor;
        for (let i = 20; i < h; i += 60) {
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🌿', x - 10, y + i);
            ctx.fillText('🌿', x + w + 10, y + i);
        }
    } else if (design.style === 'vintage') {
        ctx.strokeStyle = '#5C4033';
        ctx.lineWidth = 2;
        for (let i=0; i<10; i++) {
           ctx.strokeRect(x - frameThick/2 + i*2, y - frameThick/2 + i*2, w + frameThick - i*4, h + frameThick - i*4);
        }
    }

    ctx.restore();
  };

  const drawBackgroundDecorations = (ctx: CanvasRenderingContext2D, theme: Theme) => {
    ctx.save();
    
    // Pseudo-random generator for static decorations
    const prng = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const cw = ctx.canvas.width;
    const ch = ctx.canvas.height;
    
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = theme.bgColor;
    ctx.fillRect(0, 0, cw, ch);

    const type = theme.decorationType || 'floating';
    
    // Core decoration logic with higher quality aesthetic
    if (type === 'blobs' || type === 'gradient') {
      ctx.globalAlpha = 0.6;
      ctx.filter = 'blur(60px)';
      const colors = [theme.accColor, theme.fgColor, theme.bgColor, theme.accColor];
      for (let i = 0; i < 4; i++) {
        const cx = (0.2 + prng(i)*0.6) * cw;
        const cy = (0.2 + prng(i+1)*0.6) * ch;
        const r = 250 + prng(i+2)*150;
        ctx.fillStyle = colors[i];
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.filter = 'none';
      ctx.globalAlpha = 1.0;
    } else if (type === 'grid') {
      ctx.strokeStyle = theme.accColor;
      ctx.globalAlpha = 0.15;
      ctx.lineWidth = 1;
      const step = 20;
      for (let x = 0; x < cw; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ch); ctx.stroke(); }
      for (let y = 0; y < ch; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cw, y); ctx.stroke(); }
      
      // Emphasize every 5th line
      ctx.globalAlpha = 0.3;
      for (let x = 0; x < cw; x += step * 5) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ch); ctx.stroke(); }
      for (let y = 0; y < ch; y += step * 5) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cw, y); ctx.stroke(); }
      ctx.globalAlpha = 1.0;
    } else if (type === 'dots') {
      ctx.fillStyle = theme.accColor;
      ctx.globalAlpha = 0.2;
      const step = 24;
      for (let x = 12; x < cw; x += step) {
        for (let y = 12; y < ch; y += step) {
          ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI*2); ctx.fill();
        }
      }
      ctx.globalAlpha = 1.0;
    } else if (type === 'waves' || type === 'hills') {
      ctx.fillStyle = theme.accColor;
      ctx.globalAlpha = 0.15;
      for(let i=0; i<3; i++) {
         ctx.beginPath();
         ctx.moveTo(0, ch);
         for(let x=0; x<=cw; x+=20) {
            const y = ch - 150 - Math.sin(x/100 + i) * 50 - i * 80;
            ctx.lineTo(x, y);
         }
         ctx.lineTo(cw, ch);
         ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    } else if (type === 'notebook') {
      // Elegant lined paper
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0,0,cw,ch);
      ctx.strokeStyle = '#94a3b8';
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 1;
      for (let y = 100; y < ch; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cw, y); ctx.stroke(); }
      ctx.strokeStyle = '#f87171';
      ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.moveTo(80, 0); ctx.lineTo(80, ch); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(84, 0); ctx.lineTo(84, ch); ctx.stroke();
      ctx.globalAlpha = 1.0;
    } else if (type === 'rings') {
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 15; i++) {
        ctx.strokeStyle = (i % 2 === 0) ? theme.fgColor : theme.accColor;
        ctx.globalAlpha = 0.15 + prng(i)*0.2;
        const r = 80 + prng(i)*200;
        ctx.beginPath(); ctx.arc(cw/2 + (prng(i*2)-0.5)*cw*0.5, ch/2 + (prng(i*2+1)-0.5)*ch*0.5, r, 0, Math.PI*2); ctx.stroke();
      }
      ctx.globalAlpha = 1.0;
    } else if (type === 'checkers') {
      ctx.fillStyle = theme.accColor;
      ctx.globalAlpha = 0.08;
      const step = 60;
      for (let x = 0; x < cw; x += step) {
        for (let y = 0; y < ch; y += step) {
          if ((Math.floor(x/step) + Math.floor(y/step)) % 2 === 0) {
            ctx.fillRect(x, y, step, step);
          }
        }
      }
      ctx.globalAlpha = 1.0;
    } else if (type === 'geometric') {
       ctx.globalAlpha = 0.05;
       ctx.fillStyle = theme.accColor;
       ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(cw*0.6, 0); ctx.lineTo(0, ch*0.6); ctx.fill();
       ctx.fillStyle = theme.fgColor;
       ctx.beginPath(); ctx.moveTo(cw, ch); ctx.lineTo(cw*0.4, ch); ctx.lineTo(cw, ch*0.4); ctx.fill();
       ctx.strokeStyle = theme.accColor;
       ctx.lineWidth = 20;
       ctx.beginPath(); ctx.arc(cw*0.8, ch*0.2, 100, 0, Math.PI*2); ctx.stroke();
       ctx.globalAlpha = 1.0;
    } else if (type === 'confetti' || type === 'sparkles') {
       ctx.globalAlpha = 0.6;
       for (let i = 0; i < 80; i++) {
         ctx.fillStyle = [theme.accColor, theme.fgColor, '#FDE047', '#67E8F9'][i % 4];
         ctx.beginPath();
         if (type === 'sparkles') {
            const x = prng(i)*cw; const y = prng(i+1)*ch; const s = 2 + prng(i)*4;
            ctx.moveTo(x, y-s); ctx.lineTo(x+s/3, y-s/3); ctx.lineTo(x+s, y); ctx.lineTo(x+s/3, y+s/3);
            ctx.lineTo(x, y+s); ctx.lineTo(x-s/3, y+s/3); ctx.lineTo(x-s, y); ctx.lineTo(x-s/3, y-s/3);
         } else {
            ctx.arc(prng(i)*cw, prng(i+1)*ch, 3 + prng(i+2)*4, 0, Math.PI*2);
         }
         ctx.fill();
       }
       ctx.globalAlpha = 1.0;
    }

    // Elegant structured Emojis - completely overhauled
    if (theme.emojis && theme.emojis.length > 0) {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.4; // very subtle integration
      
      if (type === 'grid' || type === 'dots' || type === 'checkers') {
        // Repeated strict pattern
        const stepX = cw / 4;
        const stepY = ch / 6;
        let idx = 0;
        for (let x = stepX/2; x < cw; x += stepX) {
          for (let y = stepY/2; y < ch; y += stepY) {
            ctx.font = `20px sans-serif`;
            ctx.fillText(theme.emojis[idx % theme.emojis.length], x, y);
            idx++;
          }
        }
      } else if (type === 'rings' || type === 'geometric') {
        // Corner emphasis
        const corners = [[60, 60], [cw-60, 60], [60, ch-60], [cw-60, ch-60]];
        corners.forEach(([x, y], i) => {
          ctx.font = `40px sans-serif`;
          ctx.fillText(theme.emojis[i % theme.emojis.length], x, y);
        });
      } else {
        // Floating but very tasteful and sparse (watermark style)
        for (let i = 0; i < 6; i++) {
          const x = (0.1 + prng(i)*0.8) * cw;
          const y = (0.1 + prng(i+1)*0.8) * ch;
          const size = 30 + prng(i*2) * 15;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((prng(i) - 0.5) * 0.4);
          ctx.font = `${size}px sans-serif`;
          ctx.globalAlpha = 0.15; // extremely subtle
          ctx.fillText(theme.emojis[i % theme.emojis.length], 0, 0);
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1.0;
    }

    // Add a subtle grain/noise texture overlay to make it look like physical paper
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = '#000000';
    for(let i=0; i<cw; i+=4) {
       for(let j=0; j<ch; j+=4) {
          if (prng(i*j) > 0.5) ctx.fillRect(i, j, 2, 2);
       }
    }
    ctx.globalAlpha = 1.0;
    
    ctx.restore();
  };

  const getSharedAudioContext = (() => {
    let audioCtx: AudioContext | null = null;
    return () => {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
        }
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
      return audioCtx;
    };
  })();

  const playCountdownSound = () => {
    try {
      const ctx = getSharedAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch(e){}
  };

  const playShutterSound = () => {
    try {
      const ctx = getSharedAudioContext();
      if (!ctx) return;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);

      const bufferSize = ctx.sampleRate * 0.05;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5; // Softer noise
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.15, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(ctx.currentTime);
    } catch(e){}
  };

  const generateTimelapse = () => {
    const framesArray = allShotFramesRef.current;
    if (!framesArray || framesArray.length === 0) return;
    
    if (!(window as any).MediaRecorder) return;
    
    const dim = canvasDimRef.current;
    const c = document.createElement('canvas');
    c.width = dim.w;
    c.height = dim.h;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    
    const stream = c.captureStream(15);
    
    let mimeType = '';
    if (MediaRecorder.isTypeSupported('video/mp4')) {
      mimeType = 'video/mp4';
      videoExtRef.current = 'mp4';
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      mimeType = 'video/webm';
      videoExtRef.current = 'webm';
    } else {
      mimeType = '';
      videoExtRef.current = 'mp4';
    }

    const options = mimeType ? { mimeType } : undefined;
    const recorder = new MediaRecorder(stream, options);
    const chunks: Blob[] = [];
    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    
    const maxFrames = Math.max(...framesArray.map(arr => arr ? arr.length : 0));
    if (maxFrames === 0) return;
    
    recorder.start();
    
    let frameIndex = 0;
    
    const drawNextFrame = () => {
        if (frameIndex >= maxFrames) {
            recorder.stop();
            return;
        }

        const currentTheme = activeThemeRef.current;
        const currentFrameMode = frameModeRef.current;
        const currentFrameDesign = activeFrameDesignRef.current;
        const currentStickers = stickersRef.current;
        const topText = topTextRef.current;
        const bottomText = bottomTextRef.current;
        const textSize = textSizeRef.current;
        const isTextBold = isTextBoldRef.current;
        const textColor = textColorRef.current;

        const tempShots: Shot[] = [];
        for (let s = 0; s < framesArray.length; s++) {
            if (!framesArray[s] || framesArray[s].length === 0) continue;
            const frame = framesArray[s][Math.min(frameIndex, framesArray[s].length - 1)];
            if (!frame) continue;
            
            tempShots.push({
               dataUrl: '',
               imageObj: frame as unknown as HTMLImageElement,
            });
        }
        
        renderScene(
            ctx,
            dim.w,
            dim.h,
            currentTheme,
            currentFrameMode,
            currentFrameDesign,
            currentStickers,
            null,
            tempShots,
            null,
            null,
            topText,
            bottomText,
            textSize,
            isTextBold,
            textColor,
            customBgImageRef.current
        );
        
        frameIndex++;
        setTimeout(drawNextFrame, 1000 / 15);
    };
    
    recorder.onstop = () => {
        const finalMimeType = recorder.mimeType || mimeType || (videoExtRef.current === 'mp4' ? 'video/mp4' : 'video/webm');
        if (finalMimeType.includes('webm')) {
            videoExtRef.current = 'webm';
        } else if (finalMimeType.includes('mp4')) {
            videoExtRef.current = 'mp4';
        }
        const blob = new Blob(chunks, { type: finalMimeType });
        setVideoUrl(URL.createObjectURL(blob));
        setIsSyncing(false);
    };
    
    drawNextFrame();
  };

  // --- Actions ---
  const handleStartCapture = async () => {
    if (isTakingShots) return;
    setIsTakingShots(true);
    setShots([]);
    setShowResult(false);
    setVideoUrl(null);
    allShotFramesRef.current = [];

    const numShots = frameMode === '1-cut' ? 1 : frameMode === '3-cut' ? 3 : 4;
    const capturedShots: Shot[] = [];
    
    // Shared canvas to prevent memory leak and freeze on mobile
    const captureTempCanvas = document.createElement('canvas');
    captureTempCanvas.width = 200;
    captureTempCanvas.height = 150;
    const captureTempCtx = captureTempCanvas.getContext('2d', { willReadFrequently: true });

    for (let i = 0; i < numShots; i++) {
      const shotFrames: any[] = [];
      const captureInterval = setInterval(() => {
          const v = videoRef.current;
          const seg = segmentedCanvasRef.current;
          const src = (seg && seg.width > 0) ? seg : v;
          if (src && captureTempCtx) {
              captureTempCtx.save();
              captureTempCtx.translate(captureTempCanvas.width, 0);
              captureTempCtx.scale(-1, 1);
              captureTempCtx.drawImage(src as CanvasImageSource, 0, 0, captureTempCanvas.width, captureTempCanvas.height);
              captureTempCtx.restore();
              
              const copyCanvas = document.createElement('canvas');
              copyCanvas.width = captureTempCanvas.width;
              copyCanvas.height = captureTempCanvas.height;
              const copyCtx = copyCanvas.getContext('2d');
              if (copyCtx) {
                   copyCtx.drawImage(captureTempCanvas, 0, 0);
                   shotFrames.push(copyCanvas);
              }
          }
      }, 1000 / 15);

      // Countdown
      for (let c = 3; c > 0; c--) {
        setCountdown(c);
        playCountdownSound();
        await new Promise((r) => setTimeout(r, 1000));
      }
      setCountdown(0); // Flash
      playShutterSound();
      clearInterval(captureInterval);
      allShotFramesRef.current.push(shotFrames as any);
      
      await new Promise((r) => setTimeout(r, 100)); // Flash delay

      // Capture
      const v = videoRef.current;
      const seg = removeBackgroundRef.current ? segmentedCanvasRef.current : null;
      const sourceImage = (seg && seg.width > 0) ? seg : v;
      const sw = sourceImage instanceof HTMLVideoElement ? sourceImage.videoWidth : sourceImage?.width || 0;
      const sh = sourceImage instanceof HTMLVideoElement ? sourceImage.videoHeight : sourceImage?.height || 0;
      if (sourceImage && sw > 0 && sh > 0) {
        const temp = document.createElement('canvas');
        temp.width = sw;
        temp.height = sh;
        const tempCtx = temp.getContext('2d');
        if (tempCtx) {
            tempCtx.translate(temp.width, 0);
            tempCtx.scale(-1, 1);
            if (cameraFilterRef.current !== 'none') {
                 tempCtx.filter = cameraFilterRef.current;
            }
            tempCtx.drawImage(sourceImage as CanvasImageSource, 0, 0, temp.width, temp.height);
            
            const dataUrl = temp.toDataURL('image/jpeg', 0.85);
            const imageObj = new Image();
            imageObj.src = dataUrl;
            
            await new Promise((resolve) => {
               imageObj.onload = resolve;
               imageObj.onerror = resolve;
            });

            capturedShots.push({ dataUrl, timestamp: Date.now(), imageObj });
            setShots([...capturedShots]);
        }
      }
      setCountdown(null);
      if (i < numShots - 1) {
        await new Promise((r) => setTimeout(r, 2000)); // Delay between shots
      }
    }

    setIsTakingShots(false);
  };

  const handleRetakeShot = async (indexToReplace: number) => {
    if (isTakingShots) return;
    setIsTakingShots(true);
    setRetakingIndex(indexToReplace);
    
    const captureTempCanvas = document.createElement('canvas');
    captureTempCanvas.width = 200;
    captureTempCanvas.height = 150;
    const captureTempCtx = captureTempCanvas.getContext('2d', { willReadFrequently: true });

    const shotFrames: any[] = [];
    const captureInterval = setInterval(() => {
        const v = videoRef.current;
        const seg = segmentedCanvasRef.current;
        const src = (seg && seg.width > 0) ? seg : v;
        if (src && captureTempCtx) {
            captureTempCtx.save();
            captureTempCtx.translate(captureTempCanvas.width, 0);
            captureTempCtx.scale(-1, 1);
            captureTempCtx.drawImage(src as CanvasImageSource, 0, 0, captureTempCanvas.width, captureTempCanvas.height);
            captureTempCtx.restore();
            
            const copyCanvas = document.createElement('canvas');
            copyCanvas.width = captureTempCanvas.width;
            copyCanvas.height = captureTempCanvas.height;
            const copyCtx = copyCanvas.getContext('2d');
            if (copyCtx) {
                 copyCtx.drawImage(captureTempCanvas, 0, 0);
                 shotFrames.push(copyCanvas);
            }
        }
    }, 1000 / 15);

    // Countdown
    for (let c = 3; c > 0; c--) {
      setCountdown(c);
      playCountdownSound();
      await new Promise((r) => setTimeout(r, 1000));
    }
    setCountdown(0); // Flash
    playShutterSound();
    clearInterval(captureInterval);
    
    if (allShotFramesRef.current) {
        allShotFramesRef.current[indexToReplace] = shotFrames as any;
    }
    
    await new Promise((r) => setTimeout(r, 100)); // Flash delay

    const v = videoRef.current;
    const seg = removeBackgroundRef.current ? segmentedCanvasRef.current : null;
    const sourceImage = (seg && seg.width > 0) ? seg : v;
    const sw = sourceImage instanceof HTMLVideoElement ? sourceImage.videoWidth : sourceImage?.width || 0;
    const sh = sourceImage instanceof HTMLVideoElement ? sourceImage.videoHeight : sourceImage?.height || 0;
    if (sourceImage && sw > 0 && sh > 0) {
      const temp = document.createElement('canvas');
      temp.width = sw;
      temp.height = sh;
      const tempCtx = temp.getContext('2d');
      if (tempCtx) {
          tempCtx.translate(temp.width, 0);
          tempCtx.scale(-1, 1);
          if (cameraFilterRef.current !== 'none') {
               tempCtx.filter = cameraFilterRef.current;
          }
          tempCtx.drawImage(sourceImage as CanvasImageSource, 0, 0, temp.width, temp.height);
          
          const dataUrl = temp.toDataURL('image/jpeg', 0.85);
          const imageObj = new Image();
          imageObj.src = dataUrl;
          
          await new Promise((resolve) => {
             imageObj.onload = resolve;
             imageObj.onerror = resolve;
          });

          setShots(prev => {
             const next = [...prev];
             next[indexToReplace] = { dataUrl, timestamp: Date.now(), imageObj };
             return next;
          });
      }
    }

    setCountdown(null);
    setRetakingIndex(null);
    setIsTakingShots(false);
  };

  const handleFinish = () => {
    if (canvasRef.current) {
        setFinalImage(canvasRef.current.toDataURL('image/jpeg', 0.95));
    }
    setShowResult(true);
    setIsSyncing(true);
    generateTimelapse();
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const addSticker = (emoji: string) => {
    const newSticker: Sticker = {
      id: Math.random().toString(36).substr(2, 9),
      emoji,
      x: canvasDim.w / 2,
      y: canvasDim.h / 2,
      size: 150,
      rotation: 0,
    };
    setStickers([...stickers, newSticker]);
    setSelectedStickerId(newSticker.id);
    setActiveTab('stickers');
  };

  const deleteSelectedSticker = () => {
    if (selectedStickerId) {
      setStickers(stickers.filter(s => s.id !== selectedStickerId));
      setSelectedStickerId(null);
    }
  };

  const updateSelectedSticker = (updates: Partial<Sticker>) => {
    setStickers(stickers.map(s => s.id === selectedStickerId ? { ...s, ...updates } : s));
  };

  const handleSwitchCamera = () => {
    const nextMode = facingModeRef.current === 'user' ? 'environment' : 'user';
    facingModeRef.current = nextMode;
    setFacingMode(nextMode);
    startCamera();
  };

  const handleDownload = () => {
    if (!finalImage) return;
    const link = document.createElement('a');
    link.download = `photo-booth-${Date.now()}.png`;
    link.href = finalImage;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Ref for interaction state ---
  const interactionState = useRef<{
    isDragging: boolean;
    isResizing: boolean;
    isRotating: boolean;
    stickerId: string | null;
    startX: number;
    startY: number;
    startSize: number;
    startRotation: number;
    startAngle: number;
  }>({
    isDragging: false,
    isResizing: false,
    isRotating: false,
    stickerId: null,
    startX: 0,
    startY: 0,
    startSize: 0,
    startRotation: 0,
    startAngle: 0,
  });

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    for (let i = stickers.length - 1; i >= 0; i--) {
      const s = stickers[i];
      
      const dx = x - s.x;
      const dy = y - s.y;
      const rotRad = (s.rotation * Math.PI) / 180;
      const localX = dx * Math.cos(-rotRad) - dy * Math.sin(-rotRad);
      const localY = dx * Math.sin(-rotRad) + dy * Math.cos(-rotRad);

      if (s.id === selectedStickerId) {
        // --- Resize Handle (Bottom-Right) ---
        if (Math.hypot(localX - (s.size / 2 + 10), localY - (s.size / 2 + 10)) < 24) {
            interactionState.current = {
                ...interactionState.current,
                isDragging: false,
                isResizing: true,
                isRotating: false,
                stickerId: s.id,
                startX: x,
                startY: y,
                startSize: s.size
            };
            return;
        }

        // --- Rotate Handle (Bottom-Left) ---
        if (Math.hypot(localX - (-s.size / 2 - 10), localY - (s.size / 2 + 10)) < 24) {
            interactionState.current = {
                ...interactionState.current,
                isDragging: false,
                isResizing: false,
                isRotating: true,
                stickerId: s.id,
                startRotation: s.rotation,
                startAngle: Math.atan2(y - s.y, x - s.x)
            };
            return;
        }

        // --- Opacity Up Handle (Top-Left) ---
        if (Math.hypot(localX - (-s.size / 2 - 10), localY - (-s.size / 2 - 10)) < 24) {
            setStickers(prev => prev.map(sticker => 
               sticker.id === s.id ? { ...sticker, opacity: Math.min(1, (sticker.opacity ?? 1) + 0.1) } : sticker
            ));
            return;
        }

        // --- Opacity Down Handle (Top-Left, offset right) ---
        if (Math.hypot(localX - (-s.size / 2 + 18), localY - (-s.size / 2 - 10)) < 24) {
            setStickers(prev => prev.map(sticker => 
               sticker.id === s.id ? { ...sticker, opacity: Math.max(0.1, (sticker.opacity ?? 1) - 0.1) } : sticker
            ));
            return;
        }

        // --- Delete Handle (Top-Right) ---
        if (Math.hypot(localX - (s.size / 2 + 10), localY - (-s.size / 2 - 10)) < 24) {
            deleteSelectedSticker();
            return;
        }
      }

      if (Math.hypot(localX, localY) < s.size / 2 + 10) {
        setSelectedStickerId(s.id);
        
        // Bring to front
        setStickers(prev => {
          const newStickers = [...prev];
          const [removed] = newStickers.splice(i, 1);
          newStickers.push(removed);
          return newStickers;
        });

        interactionState.current = {
          ...interactionState.current,
          isDragging: true,
          isResizing: false,
          isRotating: false,
          stickerId: s.id,
          startX: x - s.x,
          startY: y - s.y,
        };
        return;
      }
    }
    setSelectedStickerId(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const state = interactionState.current;
    if (!state.stickerId) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (state.isDragging) {
        setStickers(prev => prev.map(s => 
          s.id === state.stickerId 
            ? { ...s, x: x - state.startX, y: y - state.startY }
            : s
        ));
    } else if (state.isResizing) {
        const dx = x - state.startX;
        const dy = y - state.startY;
        const dist = Math.max(dx, dy); 
        const newSize = Math.max(20, Math.min(800, state.startSize + dist));
        setStickers(prev => prev.map(s => 
          s.id === state.stickerId 
            ? { ...s, size: newSize }
            : s
        ));
    } else if (state.isRotating) {
        const s = stickers.find(st => st.id === state.stickerId);
        if(s) {
            const angle = Math.atan2(y - s.y, x - s.x);
            let dRot = (angle - state.startAngle) * (180 / Math.PI);
            setStickers(prev => prev.map(st => 
                st.id === state.stickerId 
                  ? { ...st, rotation: state.startRotation + dRot }
                  : st
              ));
        }
    }
  };

  const handleCanvasMouseUp = () => {
    interactionState.current.isDragging = false;
    interactionState.current.isResizing = false;
    interactionState.current.isRotating = false;
  };

  if (!isAuthenticated) {
    const handleLogin = () => {
      if (passwordInput === 'dlanstnvhxh') {
        setIsAuthenticated(true);
        setPasswordError(false);
      } else {
        setPasswordError(true);
      }
    };
    
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F4F6F6] font-[sans-serif] p-4 relative">
        <div className="fixed inset-0 opacity-10 pointer-events-none dot-pattern"></div>
        <div className="bg-white p-8 rounded-3xl neo-border neo-shadow-xl max-w-sm w-full flex flex-col items-center gap-6 relative z-10 transition-transform transform hover:scale-[1.02]">
          <div className="w-20 h-20 bg-[#FF6B6B] rounded-full neo-border flex items-center justify-center neo-shadow-sm mb-2 shadow-[0_4px_0_0_#333]">
            <span className="text-white font-bold text-4xl">📸</span>
          </div>
          <div className="text-center">
             <h1 className="text-2xl font-black text-[#333] tracking-tighter uppercase mb-1">찰칵포토부스</h1>
             <p className="text-[#888] font-bold text-sm tracking-widest mb-4">비밀번호를 입력하세요</p>
             <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-[#888] font-bold text-xs md:text-sm tracking-widest whitespace-nowrap">
                  made by <a href="https://moonsunezipbrand.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-[#FF6B6B] hover:text-[#4ECDC4] underline">문수네집</a>
                </span>
                <a href="https://www.instagram.com/moonsune.zip" target="_blank" rel="noopener noreferrer" className="bg-[#E1306C] text-white text-[10px] px-2 py-0.5 rounded-full font-black neo-border shadow-sm flex items-center gap-1 hover:scale-105 transition-transform">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    Instagram
                </a>
             </div>
          </div>
          <div className="w-full flex flex-col gap-4">
            <div>
               <input 
                 type="password" 
                 value={passwordInput}
                 onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if(passwordError) setPasswordError(false);
                 }}
                 className={`w-full h-14 bg-gray-50 border-2 ${passwordError ? 'border-red-500 bg-red-50' : 'border-[#333]/20'} rounded-2xl px-4 font-bold text-[#333] text-center text-xl focus:outline-none focus:border-[#4ECDC4] transition-all`}
                 placeholder="••••••••"
                 onKeyDown={(e) => {
                   if(e.key === 'Enter') handleLogin();
                 }}
               />
               {passwordError && (
                  <motion.p 
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="text-red-500 text-xs font-bold text-center mt-2"
                  >
                     비밀번호가 일치하지 않습니다.
                  </motion.p>
               )}
            </div>
            <button 
              onClick={handleLogin}
              className="w-full h-14 bg-[#4ECDC4] text-[#333] rounded-2xl font-black text-lg flex items-center justify-center transition-all neo-border shadow-[0_4px_0_0_#333] active:translate-y-1 active:shadow-none"
            >
               입장하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-[#F4F6F6] font-sans relative overflow-x-hidden p-4 lg:p-8">
      {/* Background Patterns */}
      <div className="fixed inset-0 opacity-10 pointer-events-none dot-pattern"></div>

      {/* Fullscreen Camera Popup */}
      <AnimatePresence>
        {(isTakingShots || retakingIndex !== null) && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4 lg:p-8"
          >
             <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden neo-border">
                 <canvas
                    ref={fullscreenCanvasRef}
                    className="w-full h-full object-contain transform scale-x-[-1]"
                 />
                 
                 {countdown !== null && countdown > 0 && (
                   <motion.div 
                     key={countdown}
                     initial={{ scale: 0.5, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     exit={{ scale: 1.5, opacity: 0 }}
                     transition={{ duration: 0.5 }}
                     className="absolute inset-0 flex items-center justify-center pointer-events-none"
                   >
                     <span className="text-[250px] font-black text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">{countdown}</span>
                   </motion.div>
                 )}
                 {countdown === 0 && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white z-50 pointer-events-none" />
                 )}
             </div>
             
             <p className="text-white font-black text-2xl mt-8 animate-pulse text-center">
                사진 촬영 중... 예쁘고 멋지게! ✨<br/>
                <span className="text-sm font-bold text-gray-400 mt-2 block">(카메라를 보세요!)</span>
             </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Main Mode Selection */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between mb-6 z-20 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#FF6B6B] rounded-full neo-border flex items-center justify-center neo-shadow-sm">
            <span className="text-white font-bold text-3xl">📸</span>
          </div>
          <div>
            <div className="flex flex-col md:flex-row md:items-end gap-1 md:gap-4">
              <h1 className="text-2xl md:text-3xl font-black text-[#333] tracking-tighter uppercase whitespace-nowrap">찰칵포토부스</h1>
              <div className="flex items-center gap-2 md:mb-1">
                <span className="text-[#888] font-bold text-xs md:text-sm tracking-widest whitespace-nowrap">
                  made by <a href="https://moonsunezipbrand.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-[#FF6B6B] hover:text-[#4ECDC4] underline">문수네집</a>
                </span>
                <a href="https://www.instagram.com/moonsune.zip" target="_blank" rel="noopener noreferrer" className="bg-[#E1306C] text-white text-[10px] px-2 py-0.5 rounded-full font-black neo-border shadow-sm flex items-center gap-1 hover:scale-105 transition-transform">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    Instagram
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 p-2 bg-white rounded-2xl neo-border neo-shadow">
          {(['1-cut', '3-cut', '4-cut'] as FrameMode[]).map(mode => (
             <button
               key={mode}
               onClick={() => setFrameMode(mode)}
               className={`px-4 sm:px-6 py-3 rounded-xl font-black transition-all whitespace-nowrap ${frameMode === mode ? 'bg-[#FFE66D] neo-border neo-shadow text-[#333]' : 'text-gray-400 hover:bg-gray-50'}`}
             >
               {mode === '1-cut' ? '1컷' : mode === '3-cut' ? '3컷 (세로)' : '4컷 (2x2)'}
             </button>
          ))}
        </div>
      </div>

      {/* Layout Content */}
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl z-10">
        
        {/* LEFT: Camera & Previews */}
        <div className="flex flex-col md:flex-row gap-4 lg:w-[60%] w-full flex-shrink-0">
          
          <div className="flex-1 w-full flex flex-col items-center">
            {/* Animated Canvas Wrapper */}
            <div className="relative transition-all duration-500 w-full flex justify-center">
              <div 
                className="bg-[#333] neo-border neo-shadow-xl relative overflow-hidden group flex items-center justify-center mx-auto"
                style={{ 
                  height: 'auto',
                  maxHeight: '85vh',
                  maxWidth: '100%',
                  aspectRatio: `${canvasDim.w}/${canvasDim.h}`
                }}
              >
                <video ref={videoRef} autoPlay playsInline muted className="hidden" />
                <canvas 
                  ref={canvasRef} 
                  className="w-full h-full object-contain cursor-crosshair touch-none"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                  onTouchStart={(e) => {
                    const touch = e.touches[0];
                    handleCanvasMouseDown({
                      clientX: touch.clientX,
                      clientY: touch.clientY,
                    } as any);
                  }}
                  onTouchMove={(e) => {
                    const touch = e.touches[0];
                    handleCanvasMouseMove({
                      clientX: touch.clientX,
                      clientY: touch.clientY,
                    } as any);
                  }}
                  onTouchEnd={handleCanvasMouseUp}
                  onTouchCancel={handleCanvasMouseUp}
                />
                
                {/* Flash/Countdown overlays (moved to fullscreen popup) */}
                {!isCameraReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-30">
                    {cameraError ? (
                      <div className="text-center p-6 space-y-4">
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
                          <Camera className="w-8 h-8" />
                        </div>
                        <p className="font-black text-gray-800 text-sm">{cameraError}</p>
                        <button 
                          onClick={startCamera}
                          className="neo-button bg-[#4ECDC4] text-[#333] px-6 py-2 rounded-xl font-black text-sm"
                        >
                          카메라 다시 연결
                        </button>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <RefreshCw className="w-12 h-12 animate-spin text-[#4ECDC4] mx-auto" />
                        <p className="font-black text-gray-400 uppercase tracking-widest text-[10px]">카메라를 준비하고 있어요...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Shoot Button under Camera */}
            <div className="mt-6 w-full max-w-[500px]">
              {(() => {
                const numShots = frameMode === '1-cut' ? 1 : frameMode === '3-cut' ? 3 : 4;
                const isDone = shots.length >= numShots;
                
                if (isDone) {
                  return (
                    <button
                      onClick={handleFinish}
                      className="w-full py-4 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all bg-[#4ECDC4] text-[#333] neo-border shadow-[0_6px_0_0_#333] active:translate-y-1 active:shadow-none"
                    >
                      <Download className="w-6 h-6" />
                      <span>꾸미기 완료 & 인화하기!</span>
                    </button>
                  );
                }
                
                return (
                  <div className="flex gap-4">
                    <button
                      onClick={handleStartCapture}
                      disabled={isTakingShots || !isCameraReady}
                      className={`
                        flex-1 py-4 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all
                        ${isTakingShots || !isCameraReady
                          ? 'bg-gray-200 text-gray-400 border-4 border-gray-300' 
                          : 'bg-[#FF6B6B] text-white neo-border shadow-[0_6px_0_0_#333] active:translate-y-1 active:shadow-none'}
                      `}
                    >
                      <Camera className="w-6 h-6" />
                      <span>{isTakingShots ? '촬영 중...' : '촬영 시작!'}</span>
                    </button>
                    <button 
                      onClick={handleSwitchCamera}
                      disabled={isTakingShots || !isCameraReady}
                      className={`
                        p-4 rounded-2xl font-black text-xl flex items-center justify-center transition-all bg-white text-[#333]
                        ${isTakingShots || !isCameraReady
                          ? 'opacity-50 cursor-not-allowed border-4 border-gray-300 text-gray-400'
                          : 'neo-border shadow-[0_6px_0_0_#333] active:translate-y-1 active:shadow-none hover:bg-gray-50'}
                      `}
                      title="카메라 전환"
                    >
                      <SwitchCamera className="w-6 h-6" />
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Shots Preview Strip (Visible when taking multiple shots) */}
          {(shots.length > 0 || isTakingShots) && !showResult && (
            <div className="w-full md:w-28 shrink-0 flex flex-row md:flex-col gap-3 p-3 bg-white neo-border neo-shadow-sm rounded-xl overflow-x-auto md:overflow-y-auto max-h-[80vh] md:max-h-none">
              <div className="text-center font-black text-xs text-gray-500 uppercase flex shrink-0 items-center justify-center">
                {shots.length}컷 📸
              </div>
              {shots.map((shot, i) => (
                <div key={i} className="relative group w-20 md:w-full shrink-0">
                  <div className="aspect-square rounded-xl overflow-hidden border-2 border-[#333] relative">
                    <img src={shot.dataUrl} className="w-full h-full object-cover" />
                    <div className="absolute top-0 right-0 bg-[#333] text-white text-[10px] font-black px-2 py-0.5 rounded-bl-lg">
                      {i + 1}
                    </div>
                  </div>
                  {!isTakingShots && (
                      <button 
                         onClick={() => handleRetakeShot(i)}
                         className="w-full mt-1 bg-white border-2 border-gray-200 text-gray-600 hover:border-black hover:text-black hover:bg-[#FFE066] text-[10px] font-bold py-1 rounded-lg transition-colors shadow-sm"
                      >
                        다시찍기
                      </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Controls Tabs */}
        <div className="flex-1 w-full lg:max-w-[400px] bg-white rounded-3xl neo-border neo-shadow flex flex-col overflow-hidden lg:max-h-[80vh] lg:sticky lg:top-8">
          {/* Tabs header */}
          <div className="flex gap-2 p-4 bg-gray-100 border-b-2 border-[#333]/10 overflow-x-auto w-full scrollbar-hide">
            {(['camera', 'themes', 'frames', 'texts', 'stickers'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  shrink-0 py-2 px-3 rounded-xl font-black text-sm uppercase transition-all
                  ${activeTab === tab ? 'bg-[#4ECDC4] text-[#333] neo-border neo-shadow-sm' : 'text-gray-400 hover:text-gray-600'}
                `}
              >
                {tab === 'camera' ? '카메라' : tab === 'themes' ? '테마' : tab === 'frames' ? '디자인' : tab === 'texts' ? '글자꾸미기' : '스티커'}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
            {/* Camera Settings Tab */}
            {activeTab === 'camera' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-black uppercase text-[#888] tracking-widest">빠른 필터</label>
                  <div className="grid grid-cols-5 gap-2 pb-2">
                    <button 
                      onClick={() => { setCameraBrightness(100); setCameraHue(0); setCameraBlur(0); setCameraContrast(100); setCameraSaturate(100); setCameraSepia(0); setCameraGrayscale(0); setCameraInvert(0); }} 
                      className="px-2 py-2 bg-gray-100 rounded-xl font-bold text-xs hover:bg-gray-200 text-gray-700 transition-colors truncate"
                    >기본</button>
                    <button 
                      onClick={() => { setCameraBrightness(115); setCameraHue(0); setCameraBlur(0); setCameraContrast(105); setCameraSaturate(110); setCameraSepia(0); setCameraGrayscale(0); setCameraInvert(0); }} 
                      className="px-2 py-2 bg-pink-100 rounded-xl font-bold text-xs hover:bg-pink-200 text-pink-700 transition-colors truncate"
                    >화사하게</button>
                    <button 
                      onClick={() => { setCameraBrightness(100); setCameraHue(0); setCameraBlur(0); setCameraContrast(120); setCameraSaturate(0); setCameraSepia(0); setCameraGrayscale(100); setCameraInvert(0); }} 
                      className="px-2 py-2 bg-gray-200 rounded-xl font-bold text-xs hover:bg-gray-300 text-gray-800 transition-colors truncate"
                    >흑백</button>
                    <button 
                      onClick={() => { setCameraBrightness(90); setCameraHue(0); setCameraBlur(0); setCameraContrast(110); setCameraSaturate(100); setCameraSepia(100); setCameraGrayscale(0); setCameraInvert(0); }} 
                      className="px-2 py-2 bg-yellow-100 rounded-xl font-bold text-xs hover:bg-yellow-200 text-yellow-800 transition-colors truncate"
                    >세피아</button>
                    <button 
                      onClick={() => { setCameraBrightness(105); setCameraHue(0); setCameraBlur(0); setCameraContrast(110); setCameraSaturate(150); setCameraSepia(0); setCameraGrayscale(0); setCameraInvert(0); }} 
                      className="px-2 py-2 bg-orange-100 rounded-xl font-bold text-xs hover:bg-orange-200 text-orange-700 transition-colors truncate"
                    >비비드</button>

                    <button 
                      onClick={() => { setCameraBrightness(100); setCameraHue(44); setCameraBlur(0); setCameraContrast(120); setCameraSaturate(150); setCameraSepia(0); setCameraGrayscale(0); setCameraInvert(0); }} 
                      className="px-2 py-2 bg-green-100 rounded-xl font-bold text-xs hover:bg-green-200 text-green-700 transition-colors truncate"
                    >초록 외계인</button>
                    <button 
                      onClick={() => { setCameraBrightness(100); setCameraHue(-140); setCameraBlur(0); setCameraContrast(120); setCameraSaturate(150); setCameraSepia(0); setCameraGrayscale(0); setCameraInvert(0); }} 
                      className="px-2 py-2 bg-blue-100 rounded-xl font-bold text-xs hover:bg-blue-200 text-blue-700 transition-colors truncate"
                    >블루 스머프</button>
                    <button 
                      onClick={() => { setCameraBrightness(100); setCameraHue(-50); setCameraBlur(0); setCameraContrast(110); setCameraSaturate(130); setCameraSepia(0); setCameraGrayscale(0); setCameraInvert(0); }} 
                      className="px-2 py-2 bg-red-100 rounded-xl font-bold text-xs hover:bg-red-200 text-red-700 transition-colors truncate"
                    >레드 데블</button>
                    <button 
                      onClick={() => { setCameraBrightness(90); setCameraHue(0); setCameraBlur(1.5); setCameraContrast(150); setCameraSaturate(130); setCameraSepia(0); setCameraGrayscale(0); setCameraInvert(0); }} 
                      className="px-2 py-2 bg-purple-100 rounded-xl font-bold text-xs hover:bg-purple-200 text-purple-700 transition-colors truncate"
                    >몽환 블러</button>
                    <button 
                      onClick={() => { setCameraBrightness(100); setCameraHue(0); setCameraBlur(0); setCameraContrast(90); setCameraSaturate(100); setCameraSepia(0); setCameraGrayscale(0); setCameraInvert(100); }} 
                      className="px-2 py-2 bg-indigo-100 rounded-xl font-bold text-xs hover:bg-indigo-200 text-indigo-700 transition-colors truncate"
                    >색상 반전</button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-black uppercase text-[#888] tracking-widest">인물 배경 제거</label>
                    <button
                      onClick={() => setRemoveBackground(!removeBackground)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${removeBackground ? 'bg-[#4ECDC4]' : 'bg-gray-300'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${removeBackground ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 font-bold">인물만 남기고 배경을 투명하게 제거합니다.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-black uppercase text-[#888]">밝기 (Gamma)</label>
                      <span className="text-sm font-bold text-[#333]">{cameraBrightness}%</span>
                    </div>
                    <input 
                      type="range" min="50" max="150" value={cameraBrightness} 
                      onChange={e => setCameraBrightness(Number(e.target.value))}
                      className="w-full accent-[#FF6B6B]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-black uppercase text-[#888]">색조 (Hue)</label>
                      <span className="text-sm font-bold text-[#333]">{cameraHue}deg</span>
                    </div>
                    <input 
                      type="range" min="-180" max="180" value={cameraHue} 
                      onChange={e => setCameraHue(Number(e.target.value))}
                      className="w-full accent-[#FF6B6B]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-black uppercase text-[#888]">부드러움 (Blur)</label>
                      <span className="text-sm font-bold text-[#333]">{cameraBlur.toFixed(1)}px</span>
                    </div>
                    <input 
                      type="range" min="0" max="3" step="0.1" value={cameraBlur} 
                      onChange={e => setCameraBlur(Number(e.target.value))}
                      className="w-full accent-[#FF6B6B]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-black uppercase text-[#888]">거침/대비 조절</label>
                      <span className="text-sm font-bold text-[#333]">{cameraContrast}%</span>
                    </div>
                    <input 
                      type="range" min="50" max="200" value={cameraContrast} 
                      onChange={e => setCameraContrast(Number(e.target.value))}
                      className="w-full accent-[#FF6B6B]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-black uppercase text-[#888]">채도 (Saturation)</label>
                      <span className="text-sm font-bold text-[#333]">{cameraSaturate}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="200" value={cameraSaturate} 
                      onChange={e => setCameraSaturate(Number(e.target.value))}
                      className="w-full accent-[#FF6B6B]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-black uppercase text-[#888]">빛바랜 효과 (Sepia)</label>
                      <span className="text-sm font-bold text-[#333]">{cameraSepia}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={cameraSepia} 
                      onChange={e => setCameraSepia(Number(e.target.value))}
                      className="w-full accent-[#FF6B6B]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-black uppercase text-[#888]">흑백 필터 (Grayscale)</label>
                      <span className="text-sm font-bold text-[#333]">{cameraGrayscale}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={cameraGrayscale} 
                      onChange={e => setCameraGrayscale(Number(e.target.value))}
                      className="w-full accent-[#FF6B6B]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-black uppercase text-[#888]">색상 반전 (Invert)</label>
                      <span className="text-sm font-bold text-[#333]">{cameraInvert}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={cameraInvert} 
                      onChange={e => setCameraInvert(Number(e.target.value))}
                      className="w-full accent-[#FF6B6B]"
                    />
                  </div>
                  
                  <button
                    onClick={() => {
                        setCameraBrightness(100);
                        setCameraHue(0);
                        setCameraBlur(0);
                        setCameraContrast(100);
                        setCameraSaturate(100);
                        setCameraSepia(0);
                        setCameraGrayscale(0);
                        setCameraInvert(0);
                    }}
                    className="w-full mt-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors"
                  >
                    초기화
                  </button>
                </div>
              </div>
            )}

            {/* Themes Tab */}
            {activeTab === 'themes' && (
              <div className="space-y-6">
                
                {/* Background Image Upload */}
                <div className="space-y-3">
                  <label className="text-sm font-black uppercase text-[#888] tracking-widest">커스텀 배경 (내가 가진 사진)</label>
                  <button 
                    onClick={() => document.getElementById('bg-upload-input')?.click()}
                    className="w-full py-4 bg-[#FFE66D] border-2 border-[#333] hover:bg-[#FFD166] rounded-2xl font-black text-[#333] flex items-center justify-center gap-2 neo-shadow-sm transition-transform active:translate-y-1 active:shadow-none"
                  >
                    <ImageIcon className="w-5 h-5" /> 사진 파일로 배경 채우기
                  </button>
                  <input 
                    id="bg-upload-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const result = ev.target?.result as string;
                          setActiveTheme({
                            id: 'custom-' + Date.now(),
                            name: '커스텀 배경',
                            bgColor: '#FFFFFF',
                            fgColor: '#333333',
                            accColor: '#FF6B6B',
                            description: '내가 올린 멋진 사진',
                            emojis: ['🖼️'],
                            bgImageUrl: result,
                            palettes: []
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                      e.target.value = '';
                    }}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black uppercase text-[#888] tracking-widest">기본 테마 선택</label>
                  <div className="grid grid-cols-1 gap-3">
                    {THEMES.map(theme => (
                      <button
                        key={theme.id}
                        onClick={() => setActiveTheme({...theme})}
                        className={`
                          w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left
                          ${activeTheme.id === theme.id ? 'neo-button' : 'bg-white border-2 hover:bg-gray-50 border-gray-100'}
                        `}
                        style={{ backgroundColor: activeTheme.id === theme.id ? activeTheme.bgColor : 'white' }}
                      >
                        <span className="text-2xl drop-shadow-sm">{theme.emojis[0]}</span>
                        <span className="font-bold text-[#333] flex-1">{theme.name}</span>
                        {activeTheme.id === theme.id && <Check className="w-5 h-5 text-[#333]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {activeTheme.palettes && activeTheme.palettes.length > 0 && (
                  <div className="pt-4 border-t-4 border-dashed border-gray-100 space-y-3">
                    <label className="text-sm font-black uppercase text-[#888] tracking-widest">색조합 선택</label>
                    <div className="flex justify-between gap-2">
                      {activeTheme.palettes.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveTheme({...activeTheme, bgColor: p.bgColor, fgColor: p.fgColor, accColor: p.accColor})}
                          className={`flex-1 h-12 rounded-xl border-4 transition-all flex overflow-hidden ${activeTheme.bgColor === p.bgColor ? 'border-[#333] scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                        >
                           <div className="flex-1" style={{ backgroundColor: p.bgColor }} />
                           <div className="flex-1" style={{ backgroundColor: p.fgColor }} />
                           <div className="flex-1" style={{ backgroundColor: p.accColor }} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Frames Design Tab */}
            {activeTab === 'frames' && (
              <div className="space-y-4">
                <label className="text-sm font-black uppercase text-[#888] tracking-widest">프레임 디자인</label>
                <div className="grid grid-cols-1 gap-3">
                  {FRAME_DESIGNS.map(design => (
                    <button
                      key={design.id}
                      onClick={() => setActiveFrameDesign(design)}
                      className={`
                        w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left
                        ${activeFrameDesign.id === design.id ? 'neo-button' : 'bg-white border-2 border-transparent hover:bg-gray-50'}
                      `}
                      style={{ backgroundColor: activeFrameDesign.id === design.id ? design.color : 'white' }}
                    >
                      <span className="text-2xl drop-shadow-sm">{design.emoji}</span>
                      <span className="font-bold flex-1" style={{ color: activeFrameDesign.id === design.id && (design.style === 'classic' || design.style === 'film' || design.style === 'star') ? 'white' : '#333' }}>{design.name}</span>
                      {activeFrameDesign.id === design.id && <Check className="w-5 h-5" style={{ color: (design.style === 'classic' || design.style === 'film' || design.style === 'star') ? 'white' : '#333' }} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Texts Tab */}
            {activeTab === 'texts' && (
              <div className="space-y-6">
                
                <div className="space-y-2">
                   <label className="text-sm font-black uppercase text-[#888] tracking-widest">글자 색상</label>
                   <div className="flex gap-2">
                     {['#000000', '#FFFFFF', '#FF6B6B', '#4ECDC4', '#FFE066', '#9B51E0', '#DB2777', '#4A3B32'].map(color => (
                        <button
                          key={color}
                          onClick={() => setTextColor(color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${textColor === color ? 'scale-125 border-gray-400' : 'border-gray-200'}`}
                          style={{ backgroundColor: color }}
                        />
                     ))}
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-sm font-black uppercase text-[#888] tracking-widest">글자 크기 & 굵기</label>
                   <div className="flex gap-4 items-center">
                     <span className="text-xs font-bold w-12 text-gray-500 text-right">크기</span>
                     <input
                       type="range"
                       min="16"
                       max="120"
                       value={textSize}
                       onChange={(e) => setTextSize(Number(e.target.value))}
                       className="flex-1 accent-[#4ECDC4]"
                     />
                     <span className="text-xs font-bold w-8 text-gray-500">{textSize}px</span>
                   </div>
                   <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => setIsTextBold(false)}
                        className={`flex-1 p-2 rounded-xl transition-all font-normal ${!isTextBold ? 'bg-[#333] text-white neo-shadow' : 'bg-gray-100 text-gray-600'}`}
                      >
                        기본 굵기
                      </button>
                      <button
                        onClick={() => setIsTextBold(true)}
                        className={`flex-1 p-2 rounded-xl transition-all font-black ${isTextBold ? 'bg-[#333] text-white neo-shadow' : 'bg-gray-100 text-gray-600'}`}
                      >
                        두꺼운 굵기
                      </button>
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black uppercase text-[#888] tracking-widest">위에 들어갈 글자</label>
                  <input 
                    type="text" 
                    value={topText}
                    onChange={(e) => setTopText(e.target.value)}
                    placeholder="예: 해피 어린이날!"
                    className="w-full neo-border rounded-2xl p-3 focus:outline-none focus:ring-4 focus:ring-[#4ECDC4]/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black uppercase text-[#888] tracking-widest">아래 기관/텍스트</label>
                  <input 
                    type="text" 
                    value={bottomText}
                    onChange={(e) => setBottomText(e.target.value)}
                    placeholder="예: 늘푸른유치원"
                    className="w-full neo-border rounded-2xl p-3 focus:outline-none focus:ring-4 focus:ring-[#4ECDC4]/50"
                  />
                </div>

              </div>
            )}

            {/* Stickers Tab */}
            {activeTab === 'stickers' && (
              <div className="space-y-6">
                {/* Tip Text */}
                <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs flex justify-between items-center">
                  <span>💡 마우스로 스티커를 옮겨보세요!</span>
                  {stickers.length > 0 && (
                    <button onClick={() => { setStickers([]); setSelectedStickerId(null); }} className="text-red-500 hover:text-red-700 bg-red-100 px-2 py-1 rounded-lg">전체 삭제</button>
                  )}
                </div>

                {selectedStickerId && (
                  <div className="bg-[#FFFCE8] p-4 rounded-2xl neo-border neo-shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[#333] text-sm uppercase">크기 조절</span>
                      <button onClick={deleteSelectedSticker} className="bg-red-100 text-red-500 hover:bg-red-200 px-3 py-1 rounded-xl transition-all font-bold flex gap-1 items-center">
                        <Trash2 className="w-4 h-4" /> 삭제
                      </button>
                    </div>
                    <input 
                      type="range" min="20" max="300" 
                      value={stickers.find(s => s.id === selectedStickerId)?.size || 60}
                      onChange={(e) => updateSelectedSticker({ size: Number(e.target.value) })}
                      className="w-full h-2 bg-[#eee] rounded-lg appearance-none cursor-pointer accent-[#FF6B6B]"
                    />
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[#333] text-sm uppercase">회전</span>
                    </div>
                    <input 
                      type="range" min="-180" max="180" 
                      value={stickers.find(s => s.id === selectedStickerId)?.rotation || 0}
                      onChange={(e) => updateSelectedSticker({ rotation: Number(e.target.value) })}
                      className="w-full h-2 bg-[#eee] rounded-lg appearance-none cursor-pointer accent-[#4ECDC4]"
                    />
                  </div>
                )}

                <div className="space-y-6">
                  {/* Theme Emojis */}
                  <div className="space-y-2">
                    <h3 className="font-black text-sm uppercase text-gray-500">현재 테마의 스티커</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {activeTheme.emojis.map((e, index) => (
                        <button 
                          key={`theme-${index}`} 
                          onClick={() => addSticker(e)}
                          className="aspect-square w-full h-full bg-white border-2 border-gray-100 rounded-xl flex items-center justify-center text-3xl hover:bg-[#FFE66D] hover:border-[#333] transition-all group overflow-hidden"
                        >
                          <span className="group-active:scale-90 transition-transform w-[80%] h-[80%] flex items-center justify-center">
                            {e.startsWith('data:image/') ? <img src={e} className="w-full h-full object-contain" alt="sticker" draggable="false" /> : e}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Categories */}
                  {STICKER_CATEGORIES.map((category, catIndex) => (
                    <div key={`cat-${catIndex}`} className="space-y-2">
                      <h3 className="font-black text-sm uppercase text-gray-500">{category.name}</h3>
                      <div className="grid grid-cols-4 gap-2">
                        {category.stickers.map((e, index) => (
                          <button 
                            key={`cat-${catIndex}-${index}`} 
                            onClick={() => addSticker(e)}
                            className="aspect-square w-full h-full bg-white border-2 border-gray-100 rounded-xl flex items-center justify-center text-2xl hover:bg-[#FFE66D] hover:border-[#333] transition-all group overflow-hidden"
                          >
                            <span className="group-active:scale-90 transition-transform w-[80%] h-[80%] flex items-center justify-center">
                              {e.startsWith('data:image/') ? <img src={e} className="w-full h-full object-contain" alt="sticker" draggable="false" /> : e}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    {/* --- Results Modal --- */}
      <AnimatePresence>
        {showResult && shots.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#333]/90 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, rotate: 1 }}
              animate={{ scale: 1, rotate: 0 }}
              className="bg-[#FFF9E1] neo-border p-6 md:p-8 max-w-5xl w-full max-h-[95vh] overflow-y-auto flex flex-col md:flex-row gap-6 md:gap-12 neo-shadow-xl relative scrollbar-hide"
            >
              <div className="absolute inset-0 opacity-5 dot-pattern pointer-events-none"></div>

              {/* Strip Preview */}
              <div className="relative z-10 w-full md:w-1/2 flex flex-col items-center justify-start gap-4 pb-4">
                {finalImage && (
                  <img src={finalImage} alt="Final Photo" className="w-[70%] md:w-[80%] max-w-[400px] h-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-white neo-border" />
                )}
                
                {videoUrl && !isSyncing && (
                  <div className="w-[70%] md:w-[80%] max-w-[400px] flex flex-col items-center gap-2">
                    <h3 className="text-sm font-black uppercase text-gray-500">타임랩스 (촬영 과정)</h3>
                    <video src={videoUrl} autoPlay loop muted playsInline className="w-full neo-border rounded-xl shadow-lg border-4 border-white bg-black" />
                  </div>
                )}
              </div>

              {/* Action Side */}
              <div className="flex-1 w-full md:w-1/2 flex flex-col justify-center space-y-8 relative z-10 py-4">
                {isSyncing ? (
                   <div className="flex flex-col items-center justify-center space-y-6 bg-white p-10 rounded-3xl neo-border neo-shadow">
                     <RefreshCw className="w-16 h-16 animate-spin text-[#4ECDC4]" />
                     <div className="text-center space-y-2">
                         <h2 className="text-3xl font-black text-[#333]">잠시만 기다리세요</h2>
                         <p className="text-gray-500 font-bold">스티커 사진과 영상을 동기화 중입니다...</p>
                     </div>
                   </div>
                ) : (
                   <>
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 bg-[#FFE66D] px-4 py-1 rounded-full neo-border neo-shadow text-xs font-black uppercase">
                        Success!
                      </div>
                      <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-[#333]">
                        Awesome<br className="hidden md:block"/> Pictures!
                      </h2>
                      <p className="text-gray-600 font-bold text-sm md:text-base">우리 아이들의 예쁜 추억이 예술적인 필름으로 완성되었어요!</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        onClick={handleDownload}
                        className="bg-[#FF6B6B] text-white py-4 md:py-6 rounded-3xl font-black text-lg flex items-center justify-center gap-3 neo-button shadow-[0_6px_0_0_#333]"
                      >
                        <Download className="w-6 h-6" />
                        갤러리 저장
                      </button>
                      {videoUrl && (
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.download = `photo-booth-timelapse-${Date.now()}.${videoExtRef.current}`;
                            link.href = videoUrl;
                            link.target = '_blank';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="bg-[#4ECDC4] text-white py-4 md:py-6 rounded-3xl font-black text-lg flex items-center justify-center gap-3 neo-button shadow-[0_6px_0_0_#333]"
                        >
                          <Download className="w-6 h-6" />
                          타임랩스 영상
                        </button>
                      )}
                      <button
                        onClick={() => { setShowResult(false); setShots([]); setVideoUrl(null); }}
                        className="sm:col-span-2 bg-white text-[#333] py-4 rounded-3xl font-black text-lg flex items-center justify-center gap-3 neo-button"
                      >
                        <RefreshCw className="w-6 h-6" />
                        다시 찍기
                      </button>
                    </div>
                    
                    <div className="text-center pt-4">
                      <p className="text-[10px] sm:text-xs font-black text-[#888] uppercase tracking-widest">찰칵포토부스</p>
                    </div>
                   </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
