import { useRef, useEffect, useState } from 'react';
import { Pencil, Eraser, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { drawingColors } from '@/data/mathHints';
import { Language } from '@/types/tutor';

interface WhiteboardProps {
  language: Language;
  onContentChange?: (hasContent: boolean) => void;
}

export function Whiteboard({ language, onContentChange }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState(drawingColors[0].color);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  const title = language === 'es' ? 'Tu Pizarra' : 'Your Whiteboard';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width - 16;
      canvas.height = rect.height - 16;
    }

    // Fill with whiteboard color
    ctx.fillStyle = '#FEF9E7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setContext(ctx);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!context) return;
    setIsDrawing(true);
    
    const pos = getPosition(e);
    context.beginPath();
    context.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !context) return;
    
    const pos = getPosition(e);
    context.lineWidth = tool === 'eraser' ? 30 : 4;
    context.strokeStyle = tool === 'eraser' ? '#FEF9E7' : color;
    context.lineTo(pos.x, pos.y);
    context.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    onContentChange?.(true);
  };

  const getPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const clearCanvas = () => {
    if (!context || !canvasRef.current) return;
    context.fillStyle = '#FEF9E7';
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    onContentChange?.(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="flex items-center gap-2 bg-secondary/30 px-3 py-1.5 rounded-full">
          <span className="text-lg">✏️</span>
          <span className="font-semibold text-foreground">{title}</span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Tools */}
          <Button
            variant={tool === 'pen' ? 'toolActive' : 'tool'}
            size="icon"
            onClick={() => setTool('pen')}
          >
            <Pencil className="w-5 h-5" />
          </Button>
          <Button
            variant={tool === 'eraser' ? 'toolActive' : 'tool'}
            size="icon"
            onClick={() => setTool('eraser')}
          >
            <Eraser className="w-5 h-5" />
          </Button>

          {/* Color Palette */}
          <div className="flex items-center gap-1 ml-2">
            {drawingColors.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setColor(c.color);
                  setTool('pen');
                }}
                className={`color-dot ${color === c.color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''}`}
                style={{ backgroundColor: c.color }}
                aria-label={c.name}
              />
            ))}
          </div>

          {/* Clear */}
          <Button
            variant="ghost"
            size="icon"
            onClick={clearCanvas}
            className="ml-2 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 mx-4 mb-4 whiteboard-container p-2 overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair rounded-xl"
        />
      </div>
    </div>
  );
}
