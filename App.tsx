
import React, { useState, useCallback, useRef } from 'react';
import DrawingCanvas from './components/DrawingCanvas';
import Toolbar from './components/Toolbar';
import { BrushSettings } from './types';

const App: React.FC = () => {
  const [settings, setSettings] = useState<BrushSettings>({
    color: '#000000',
    size: 5,
    opacity: 1,
    isEraser: false,
    brushType: 'pen',
    bgColor: '#ffffff',
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleClear = useCallback(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        if (settings.bgColor === 'transparent') {
          context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        } else {
          context.fillStyle = settings.bgColor;
          context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    }
  }, [settings.bgColor]);

  const handleDownload = useCallback(() => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `zendraw-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  }, []);

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden flex flex-col transition-colors duration-500"
      style={{ 
        backgroundColor: settings.bgColor === 'transparent' ? '#f1f5f9' : settings.bgColor,
        backgroundImage: settings.bgColor === 'transparent' ? 'radial-gradient(#cbd5e1 1px, transparent 0)' : 'none',
        backgroundSize: '24px 24px'
      }}
    >
      {/* Header */}
      <header className="absolute top-6 left-6 z-10 pointer-events-none">
        <div className="bg-white/80 backdrop-blur-md px-5 py-3 rounded-2xl shadow-sm border border-slate-200/50 pointer-events-auto flex flex-col gap-1">
          <h1 className="text-lg font-bold text-slate-800 leading-none">
            ZenDraw <span className="text-blue-600">Studio</span>
          </h1>
          <div className="flex flex-col">
            <p className="text-[10px] text-slate-500 font-medium">
              Created with ❤️ and 🥹 by Ehsan Bastami
            </p>
            <a 
              href="https://mreb.ir/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[10px] text-blue-500 hover:text-blue-600 transition-colors underline decoration-blue-500/30"
            >
              https://mreb.ir/
            </a>
          </div>
        </div>
      </header>

      {/* Main Drawing Area */}
      <main className="flex-1 relative cursor-crosshair">
        <DrawingCanvas 
          ref={canvasRef}
          settings={settings} 
        />
      </main>

      {/* Floating Toolbar */}
      <Toolbar 
        settings={settings} 
        onSettingsChange={setSettings} 
        onClear={handleClear}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default App;
