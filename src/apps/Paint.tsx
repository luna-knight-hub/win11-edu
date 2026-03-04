import React, { useRef, useState, useEffect } from 'react';

export const Paint: React.FC<{ windowId: string }> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Set canvas size to match parent container
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []); // Run once on mount

  // Handle window resize (optional, but good for robustness)
  useEffect(() => {
    const handleResize = () => {
       // In a real app, we'd want to save the canvas content, resize, and redraw.
       // For simplicity, we just keep the fixed size or let it clip.
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="h-16 bg-gray-50 border-b border-gray-200 flex items-center px-4 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Color</label>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-8 rounded cursor-pointer" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Size: {lineWidth}px</label>
          <input type="range" min="1" max="20" value={lineWidth} onChange={(e) => setLineWidth(parseInt(e.target.value))} className="w-24" />
        </div>
        <button onClick={() => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (canvas && ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }} className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 text-sm">
            Clear Canvas
        </button>
      </div>
      <div className="flex-1 overflow-hidden relative bg-gray-200 p-4 flex items-center justify-center">
        <div className="bg-white shadow-lg">
            <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="cursor-crosshair"
            />
        </div>
      </div>
    </div>
  );
};
