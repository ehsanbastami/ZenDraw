
export type BrushType = 'pen' | 'brush' | 'pencil' | 'crayon';

export interface BrushSettings {
  color: string;
  size: number;
  opacity: number;
  isEraser: boolean;
  brushType: BrushType;
  bgColor: string; // 'transparent' or hex code
}

export interface Point {
  x: number;
  y: number;
}
