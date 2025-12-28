
import React, { useRef, useState } from 'react';
import { BrushSettings, BrushType } from '../types';

interface ToolbarProps {
  settings: BrushSettings;
  onSettingsChange: (settings: BrushSettings) => void;
  onClear: () => void;
  onDownload: () => void;
}

const COLOR_ROWS = [
  ['#000000', '#475569', '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4'],
  ['#3b82f6', '#8b5cf6', '#d946ef', '#ec4899', '#ffffff']
];

const BG_COLORS = ['#ffffff', '#f8fafc', '#f1f5f9', '#fff7ed', '#f0fdf4', 'transparent'];

const BRUSH_TYPES: { id: BrushType; icon: string; label: string }[] = [
  { id: 'pen', icon: '🖊️', label: 'Pen' },
  { id: 'brush', icon: '🖌️', label: 'Brush' },
  { id: 'pencil', icon: '✏️', label: 'Pencil' },
  { id: 'crayon', icon: '🖍️', label: 'Crayon' },
];

const Toolbar: React.FC<ToolbarProps> = ({ settings, onSettingsChange, onClear, onDownload }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const updateSetting = <K extends keyof BrushSettings>(key: K, value: BrushSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  // Helper to update both color and eraser mode in one go to avoid race conditions
  const selectColor = (color: string) => {
    onSettingsChange({
      ...settings,
      color: color,
      isEraser: false
    });
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-30 w-14 h-14 bg-white border border-slate-200 shadow-xl rounded-full flex items-center justify-center hover:scale-110 transition-all text-xl"
        aria-label="Open Toolbar"
      >
        🎨
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-lg pointer-events-auto">
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-[2.5rem] p-6 flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Minimize Button */}
        <button 
          onClick={() => setIsMinimized(true)}
          className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-full p-1 shadow-sm hover:bg-slate-50 transition-colors"
          title="Minimize Toolbar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {/* Top: Tools & Colors */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {BRUSH_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    onSettingsChange({ ...settings, brushType: type.id, isEraser: false });
                  }}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                    settings.brushType === type.id && !settings.isEraser
                      ? 'bg-blue-600 text-white shadow-md scale-105'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-lg">{type.icon}</span>
                  <span className="text-[9px] uppercase font-bold">{type.label}</span>
                </button>
              ))}
              <div className="w-px h-8 bg-slate-100 self-center mx-1" />
              <button
                onClick={() => updateSetting('isEraser', true)}
                className={`p-3 rounded-xl transition-all ${
                  settings.isEraser ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
                title="Eraser"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
                  <path d="m22 21H7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            {/* Ink Preview Square */}
            <div 
              className="w-12 h-12 rounded-2xl border border-slate-100 shadow-inner flex-shrink-0 transition-colors" 
              style={{ 
                backgroundColor: settings.isEraser ? 'transparent' : settings.color,
                backgroundImage: settings.isEraser ? 'url("data:image/svg+xml,%3Csvg width=\'6\' height=\'6\' viewBox=\'0 0 6 6\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h3v3H0V0zm3 3h3v3H3V3z\' fill=\'%2394a3b8\' fill-opacity=\'0.2\'/%3E%3C/svg%3E")' : 'none'
              }} 
            />
            <div className="flex flex-col gap-2 flex-1">
              {COLOR_ROWS.map((row, i) => (
                <div key={i} className="flex gap-2">
                  {row.map(c => (
                    <button
                      key={c}
                      onClick={() => selectColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                        settings.color === c && !settings.isEraser ? 'border-blue-500 scale-110 shadow-sm' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                  {i === 1 && (
                    <button
                      onClick={() => colorInputRef.current?.click()}
                      className="w-7 h-7 rounded-full border border-slate-200 bg-gradient-to-tr from-rose-400 via-blue-400 to-green-400 hover:scale-110 transition-transform flex items-center justify-center"
                      title="Custom Color"
                    >
                      <input 
                        ref={colorInputRef} 
                        type="color" 
                        className="opacity-0 w-full h-full cursor-pointer absolute" 
                        onChange={e => selectColor(e.target.value)}
                        value={settings.color}
                      />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sliders Area */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase">
              <span>Size</span>
              <span className="text-blue-600">{settings.size}px</span>
            </div>
            <input 
              type="range" min="1" max="100" 
              value={settings.size} 
              onChange={e => updateSetting('size', parseInt(e.target.value))} 
              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" 
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase">
              <span>Opacity</span>
              <span className="text-blue-600">{Math.round(settings.opacity * 100)}%</span>
            </div>
            <input 
              type="range" min="0.1" max="1" step="0.05" 
              value={settings.opacity} 
              onChange={e => updateSetting('opacity', parseFloat(e.target.value))} 
              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" 
            />
          </div>
        </div>

        {/* Background Selector */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Canvas Background</span>
          <div className="flex gap-2.5">
            {BG_COLORS.map(c => (
              <button
                key={c}
                onClick={() => updateSetting('bgColor', c)}
                className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-105 ${settings.bgColor === c ? 'border-blue-500 scale-110 shadow-sm' : 'border-slate-100'}`}
                style={{ 
                  backgroundColor: c === 'transparent' ? '#fff' : c,
                  backgroundImage: c === 'transparent' ? 'url("data:image/svg+xml,%3Csvg width=\'6\' height=\'6\' viewBox=\'0 0 6 6\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h3v3H0V0zm3 3h3v3H3V3z\' fill=\'%2394a3b8\' fill-opacity=\'0.2\'/%3E%3C/svg%3E")' : 'none'
                }}
                title={c === 'transparent' ? 'Transparent' : c}
              />
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 pt-2">
          <button 
            onClick={onClear} 
            className="flex-1 py-3 px-4 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 rounded-2xl text-xs font-bold transition-all text-slate-600 border border-slate-100 flex items-center justify-center gap-2"
          >
            Clear Canvas
          </button>
          <button 
            onClick={onDownload} 
            className="flex-1 py-3 px-4 bg-slate-900 text-white rounded-2xl text-xs font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Export Image
          </button>
        </div>

      </div>
    </div>
  );
};

export default Toolbar;
