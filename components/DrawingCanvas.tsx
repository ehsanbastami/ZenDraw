
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { BrushSettings, Point } from '../types';

interface DrawingCanvasProps {
  settings: BrushSettings;
}

const DrawingCanvas = forwardRef<HTMLCanvasElement, DrawingCanvasProps>(({ settings }, ref) => {
  const internalRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);

  useImperativeHandle(ref, () => internalRef.current!);

  const applyBackground = (canvas: HTMLCanvasElement, color: string) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (color === 'transparent') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  useEffect(() => {
    const canvas = internalRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      if (newWidth === 0 || newHeight === 0) return;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx && canvas.width > 0 && canvas.height > 0) {
        tempCtx.drawImage(canvas, 0, 0);
      }

      canvas.width = newWidth;
      canvas.height = newHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        applyBackground(canvas, settings.bgColor);
        if (tempCanvas.width > 0 && tempCanvas.height > 0) {
          ctx.drawImage(tempCanvas, 0, 0);
        }
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial setup

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Update background when settings change, but only if it's the first time or clear
  // Actually we only want to fill the background if it's currently empty/transparent
  // For simplicity, we assume the user handles clearing. 
  // But we need a way to fill background on initial load.

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = internalRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const point = getCoordinates(e);
    setIsDrawing(true);
    setLastPoint(point);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !lastPoint) return;
    const canvas = internalRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const currentPoint = getCoordinates(e);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 0;
    ctx.setLineDash([]);

    if (settings.isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = settings.size * 2;
      ctx.globalAlpha = 1.0;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = settings.color;
      ctx.lineWidth = settings.size;
      ctx.globalAlpha = settings.opacity;

      switch (settings.brushType) {
        case 'brush':
          ctx.shadowBlur = settings.size / 2;
          ctx.shadowColor = settings.color;
          break;
        case 'pencil':
          ctx.globalAlpha = settings.opacity * 0.4;
          ctx.lineWidth = Math.max(1, settings.size * 0.5);
          break;
        case 'crayon':
          ctx.shadowBlur = 1;
          ctx.shadowColor = settings.color;
          // Simple rough effect by adding minor jitter
          ctx.lineWidth = settings.size + (Math.random() * 2 - 1);
          break;
        case 'pen':
        default:
          break;
      }
    }

    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.stroke();

    setLastPoint(currentPoint);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  return (
    <canvas
      ref={internalRef}
      className="w-full h-full block touch-none"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseOut={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
    />
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';
export default DrawingCanvas;
