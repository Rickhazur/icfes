import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Pencil, Eraser, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { drawingColors } from '../../../data/mathHints';
import { Language } from '../../../types/tutor';
import { toast } from 'sonner';

interface WhiteboardProps {
  language: Language;
  onContentChange?: (hasContent: boolean) => void;
}

export interface WhiteboardRef {
  clear: () => void;
  drawDivision: (dividend: number, divisor: number, style: 'ib' | 'colombia') => void;
  writeQuotient: (value: number, index?: number) => void;
  writeProduct: (value: number) => void;
  writeRemainder: (value: number) => void;
  drawMultiplication: (factorA: number, factorB: number) => void;
  drawAddition: (num1: number, num2: number) => void;
  drawSubtraction: (num1: number, num2: number) => void;
  writeAnswer: (value: number) => void;
  addText: (text: string) => void;
  drawBarModel: (total: number, selected: number, label?: string) => void;
  drawNumberBond: (whole: number | null, part1: number | null, part2: number | null) => void;
  drawImage: (imageUrl: string) => void;
  getImageData: () => string | null;
  highlightRegion: (x: number, y: number, width: number, height: number) => void;
}

export const Whiteboard = forwardRef<WhiteboardRef, WhiteboardProps>(({ language, onContentChange }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState(drawingColors[0].color);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  // Layout Refs
  const layoutRef = useRef<{
    style: 'ib' | 'colombia';
    cx: number;
    cy: number;
    divisorWidth: number;
    dividendWidth: number;
    quotientX: number;
  }>({ style: 'ib', cx: 0, cy: 0, divisorWidth: 0, dividendWidth: 0, quotientX: 0 });

  const title = language === 'es' ? 'Pizarra Interactiva' : 'Interactive Whiteboard';

  // ANIMATION UTILS
  const animateLine = (x1: number, y1: number, x2: number, y2: number, duration: number = 500) => {
    return new Promise<void>((resolve) => {
      if (!context || !canvasRef.current) { resolve(); return; }
      const startTime = performance.now();
      const animate = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease out

        const currentX = x1 + (x2 - x1) * ease;
        const currentY = y1 + (y2 - y1) * ease;

        context.beginPath();
        context.moveTo(x1, y1); // This draws over previous, which is fine for solid lines
        context.lineTo(currentX, currentY);
        context.stroke();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  };

  const animateText = (text: string, x: number, y: number, align: CanvasTextAlign = 'left') => {
    return new Promise<void>((resolve) => {
      if (!context) { resolve(); return; }
      context.textAlign = align;
      // Pop effect
      let scale = 0;
      const duration = 400;
      const startTime = performance.now();

      const animate = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = (p: number) => { const b = 1.6; return (p = p - 1) * p * ((b + 1) * p + b) + 1; } // Back out (pop)

        scale = ease(progress);

        // We can't easily "undraw" text in canvas without clearing rect. 
        // For simplicity in this non-layered canvas, we'll just draw. 
        // To make it look good without clearing, we only draw the FINAL state at the end, 
        // or if we want animation, we assume empty space.
        // Better strategy for this simple canvas: Just appear with a delay or simple alpha fade if possible.
        // Canvas doesn't support alpha on fillText easily without resetting globalAlpha.

        // SIMPLE APPROACH: Character by character typing effect?
        // No, for math numbers, popping in is better.

        if (progress >= 1) {
          context.fillText(text, x, y);
          resolve();
        } else {
          // Wait for next frame
          requestAnimationFrame(animate);
        }
      };
      // Actually, let's just use typing effect for simple text, but for numbers just standard draw with delay?
      // Let's rely on the sequential nature of async/await for the "timing" and just draw instantly after a small delay.
      setTimeout(() => {
        context.fillText(text, x, y);
        resolve();
      }, 100);
    });
  };

  useImperativeHandle(ref, () => ({
    clear: () => {
      clearCanvas();
    },
    drawDivision: (dividend: number, divisor: number, style: 'ib' | 'colombia') => {
      if (!context || !canvasRef.current) return;
      const ctx = context;
      const canvas = canvasRef.current;
      const cx = canvas.width / 2;
      const cy = canvas.height / 3;

      ctx.save();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.font = 'bold 48px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.textBaseline = 'middle';

      const divStr = dividend.toString();
      const dvrStr = divisor.toString();
      const divWidth = ctx.measureText(divStr).width;
      const dvrWidth = ctx.measureText(dvrStr).width;

      // Store Layout
      layoutRef.current = {
        style, cx, cy, dividendWidth: divWidth, divisorWidth: dvrWidth, quotientX: 0
      };

      if (style === 'colombia') {
        // COLOMBIA:  89 | 3
        (async () => {
          ctx.textAlign = 'right';
          await animateText(divStr, cx - 20, cy, 'right');

          // Draw Vertical Line
          ctx.beginPath(); // Reset path for animation
          await animateLine(cx, cy - 30, cx, cy + 20);

          // Draw Horizontal Line
          ctx.beginPath();
          await animateLine(cx, cy + 20, cx + dvrWidth + 30, cy + 20);

          ctx.textAlign = 'left';
          await animateText(dvrStr, cx + 10, cy - 10, 'left');

          layoutRef.current.quotientX = cx + 10;
          saveState();
          onContentChange?.(true);
        })();

      } else {
        // IB:   3 ) 89
        (async () => {
          ctx.textAlign = 'right';
          await animateText(dvrStr, cx - 15, cy + 5, 'right');

          // Draw Curve )
          // We'll simulate curve with a simple arc draw
          ctx.beginPath();
          ctx.arc(cx - 5, cy + 5, 25, -Math.PI / 2.5, Math.PI / 2.5, false);
          ctx.stroke();

          // Draw Line Top
          ctx.beginPath();
          await animateLine(cx + 5, cy - 25, cx + divWidth + 20, cy - 25);

          ctx.textAlign = 'left';
          await animateText(divStr, cx + 15, cy + 5, 'left');

          layoutRef.current.quotientX = cx + 15;
          saveState();
          onContentChange?.(true);
        })();
      }

      ctx.restore(); // Note: restore happens immediately, might affect async styles if not careful. 
      // Ideally we lock style or set it inside async. For now, we assume single threaded access.

      ctx.restore();
      saveState();
      onContentChange?.(true);
    },
    writeQuotient: (value: number, index: number = 0) => {
      if (!context || !canvasRef.current) return;
      const ctx = context;
      const { style, cx, cy, quotientX } = layoutRef.current;

      ctx.save();
      ctx.font = 'bold 48px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#2563eb'; // Blue
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';

      const valStr = value.toString();
      const charWidth = 30; // approx
      const xPos = quotientX + (index * charWidth);

      if (style === 'colombia') {
        // Write BELOW divisor
        ctx.fillText(valStr, xPos, cy + 50);
      } else {
        // Write ABOVE dividend
        ctx.fillText(valStr, xPos, cy - 55);
      }

      ctx.restore();
      saveState();
    },
    writeProduct: (value: number) => {
      if (!context || !canvasRef.current) return;
      const ctx = context;
      const { style, cx, cy } = layoutRef.current;

      ctx.save();
      ctx.font = 'bold 40px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#16a34a'; // Green for product
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'right';

      const valStr = value.toString();

      if (style === 'colombia') {
        // Write product below the dividend (left side)
        ctx.fillText(valStr, cx - 30, cy + 60);
      } else {
        // Write product below the dividend
        ctx.fillText(valStr, cx + 100, cy + 45);
      }

      ctx.restore();
      saveState();
    },
    writeRemainder: (value: number) => {
      if (!context || !canvasRef.current) return;
      const ctx = context;
      const { style, cx, cy } = layoutRef.current;

      ctx.save();
      ctx.font = 'bold 40px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#dc2626'; // Red for remainder
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'right';

      const valStr = value.toString();

      if (style === 'colombia') {
        // Write remainder below product
        ctx.fillText(valStr, cx - 30, cy + 100);
      } else {
        // Write remainder below product
        ctx.fillText(valStr, cx + 100, cy + 85);
      }

      ctx.restore();
      saveState();
    },
    drawMultiplication: (factorA: number, factorB: number) => {
      if (!context || !canvasRef.current) return;
      const ctx = context;
      const canvas = canvasRef.current;
      const cx = canvas.width / 2;
      const cy = canvas.height / 3;

      ctx.save();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.font = 'bold 48px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'right';

      // Draw vertical format:
      //     factorA
      //   ×  factorB
      //   ________

      // Draw vertical format:
      //     factorA
      //   ×  factorB
      //   ________

      (async () => {
        await animateText(factorA.toString(), cx + 50, cy - 30, 'right');
        await animateText('×', cx - 30, cy + 20, 'right');
        await animateText(factorB.toString(), cx + 50, cy + 20, 'right');

        // Draw line
        ctx.beginPath();
        await animateLine(cx - 60, cy + 50, cx + 80, cy + 50);

        saveState();
        onContentChange?.(true);
      })();

      ctx.restore();
      saveState();
      onContentChange?.(true);
    },
    drawAddition: (num1: number, num2: number) => {
      if (!context || !canvasRef.current) return;
      const ctx = context;
      const canvas = canvasRef.current;
      const cx = canvas.width / 2;
      const cy = canvas.height / 3;

      ctx.save();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.font = 'bold 48px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'right';

      // Draw vertical format:
      //     num1
      //   +  num2
      //   ________

      // Draw vertical format:
      //     num1
      //   +  num2
      //   ________

      (async () => {
        await animateText(num1.toString(), cx + 50, cy - 30, 'right');
        await animateText('+', cx - 30, cy + 20, 'right');
        await animateText(num2.toString(), cx + 50, cy + 20, 'right');

        // Draw line
        ctx.beginPath();
        await animateLine(cx - 60, cy + 50, cx + 80, cy + 50);

        saveState();
        onContentChange?.(true);
      })();

      ctx.restore();
      saveState();
      onContentChange?.(true);
    },
    drawSubtraction: (num1: number, num2: number) => {
      if (!context || !canvasRef.current) return;
      const ctx = context;
      const canvas = canvasRef.current;
      const cx = canvas.width / 2;
      const cy = canvas.height / 3;

      ctx.save();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.font = 'bold 48px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'right';

      // Draw vertical format:
      //     num1
      //   -  num2
      //   ________

      // Draw vertical format:
      //     num1
      //   -  num2
      //   ________

      (async () => {
        await animateText(num1.toString(), cx + 50, cy - 30, 'right');
        await animateText('−', cx - 30, cy + 20, 'right');
        await animateText(num2.toString(), cx + 50, cy + 20, 'right');

        // Draw line
        ctx.beginPath();
        await animateLine(cx - 60, cy + 50, cx + 80, cy + 50);

        saveState();
        onContentChange?.(true);
      })();

      ctx.restore();
      saveState();
      onContentChange?.(true);
    },
    writeAnswer: (value: number) => {
      if (!context || !canvasRef.current) return;
      const ctx = context;
      const canvas = canvasRef.current;
      const cx = canvas.width / 2;
      const cy = canvas.height / 3;

      ctx.save();
      ctx.font = 'bold 48px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#16a34a'; // Green for answer
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'right';

      // Write answer below the line
      ctx.fillText(value.toString(), cx + 50, cy + 90);

      ctx.restore();
      saveState();
    },
    addText: (text: string) => {
      if (!context || !canvasRef.current) return;
      clearCanvas(); // Clear previous content
      const ctx = context;
      ctx.save();
      ctx.font = '24px "Comic Sans MS", cursive';
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      const maxWidth = canvasRef.current.width - 60;
      const x = 30;
      const startY = 60;
      const lineHeight = 34;

      const words = text.split(' ');
      let line = '';
      let y = startY;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, y);
          line = words[n] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, y);
      ctx.restore();
      saveState();
      onContentChange?.(true);
    },
    drawBarModel: (total: number, selected: number, label?: string) => {
      if (!context || !canvasRef.current) return;
      const ctx = context;
      const canvas = canvasRef.current;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Limit total segments to avoid tiny rects
      const safeTotal = Math.min(Math.max(total, 1), 20);
      const safeSelected = Math.min(selected, safeTotal);

      const width = Math.min(canvas.width * 0.8, 600);
      const height = 80;
      const startX = cx - width / 2;

      const segmentWidth = width / safeTotal;

      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#1e293b';

      // Draw segments
      for (let i = 0; i < safeTotal; i++) {
        const x = startX + i * segmentWidth;

        ctx.beginPath();
        // Fill if selected
        if (i < safeSelected) {
          ctx.fillStyle = '#60a5fa'; // Blue highlight
          ctx.fillRect(x, cy - height / 2, segmentWidth, height);
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, cy - height / 2, segmentWidth, height);
        }

        // Draw borders
        ctx.rect(x, cy - height / 2, segmentWidth, height);
        ctx.stroke();
      }

      // Draw Label
      if (label) {
        ctx.font = 'bold 24px "Comic Sans MS", sans-serif';
        ctx.fillStyle = '#1e293b';
        ctx.textAlign = 'center';
        ctx.fillText(label, cx, cy - height / 2 - 25);
      }

      // Draw Fraction Text Below
      ctx.font = 'bold 36px "Comic Sans MS", sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'center';
      ctx.fillText(`${selected}/${total}`, cx, cy + height / 2 + 50);

      ctx.restore();
      saveState();
      onContentChange?.(true);
    },
    drawNumberBond: (whole: number | null, part1: number | null, part2: number | null) => {
      if (!context || !canvasRef.current) return;
      const ctx = context;
      const canvas = canvasRef.current;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      const r = 50; // radius
      const topY = cy - 80;
      const botY = cy + 80;
      const leftX = cx - 100;
      const rightX = cx + 100;

      ctx.save();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#334155'; // Slate-700
      ctx.font = 'bold 36px "Comic Sans MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Draw Connections (Lines) behind circles
      ctx.beginPath();
      // From center of top to centers of bottoms
      ctx.moveTo(cx, topY);
      ctx.lineTo(leftX, botY);
      ctx.moveTo(cx, topY);
      ctx.lineTo(rightX, botY);
      ctx.stroke();

      // Helper to draw circle node
      const drawNode = (val: number | null, x: number, y: number, color: string, label: string) => {
        // Circle background
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.stroke();

        // Text
        ctx.fillStyle = '#1e293b';
        ctx.fillText(val !== null ? val.toString() : '?', x, y);

        // Label (Whole/Part)
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 16px "Comic Sans MS", sans-serif';
        ctx.fillText(label, x, y + r + 20);
        // Reset font for next number
        ctx.font = 'bold 36px "Comic Sans MS", sans-serif';
      };

      // Draw Nodes (Whole on top, Parts on bottom)
      drawNode(whole, cx, topY, '#fef08a', 'Todo'); // Yellow-200
      drawNode(part1, leftX, botY, '#bfdbfe', 'Parte'); // Blue-200
      drawNode(part2, rightX, botY, '#bbf7d0', 'Parte'); // Green-200 (Changed from red for friendlier look)

      ctx.restore();
      saveState();
      onContentChange?.(true);
    },
    drawImage: (imageUrl: string) => {
      if (!context || !canvasRef.current) return;
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        let w = img.width;
        let h = img.height;
        const maxW = canvas.width * 0.8;
        const maxH = canvas.height * 0.8;
        const scale = Math.min(maxW / w, maxH / h, 1);
        w *= scale;
        h *= scale;
        const x = (canvas.width - w) / 2;
        const y = (canvas.height - h) / 2;
        context.drawImage(img, x, y, w, h);
        saveState();
        onContentChange?.(true);
      };
      img.src = imageUrl;
    },
    getImageData: () => {
      if (!canvasRef.current) return null;
      return canvasRef.current.toDataURL('image/png');
    },
    highlightRegion: (x: number, y: number, width: number, height: number) => {
      if (!context || !canvasRef.current) return;
      const ctx = context;
      ctx.save();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#F87171'; // Red-400
      ctx.lineCap = 'round';

      // Draw sloppy circle/ellipse around the region
      ctx.beginPath();
      const cx = x + width / 2;
      const cy = y + height / 2;
      const rx = width / 2 + 10;
      const ry = height / 2 + 10;

      ctx.ellipse(cx, cy, rx, ry, Math.random() * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
      saveState();
    }
  }), [context]);

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

    // Restore saved state
    const savedState = sessionStorage.getItem('whiteboard-state');
    if (savedState) {
      const img = new Image();
      img.src = savedState;
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
    }
  }, []);

  const saveState = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL();
    sessionStorage.setItem('whiteboard-state', dataUrl);
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!context || !canvasRef.current) return;
    setIsDrawing(true);

    const pos = getPosition(e);
    context.beginPath();
    context.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !context || !canvasRef.current) return;

    const pos = getPosition(e);
    context.lineWidth = tool === 'eraser' ? 30 : 4;
    context.strokeStyle = tool === 'eraser' ? '#FEF9E7' : color;
    context.shadowBlur = 0;

    context.lineTo(pos.x, pos.y);
    context.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    context?.closePath();
    onContentChange?.(true);
    saveState();
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
    sessionStorage.removeItem('whiteboard-state');
    toast(language === 'es' ? 'Pizarra limpia' : 'Canvas cleared');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
        <span className="font-bold text-xs text-indigo-900 uppercase tracking-wider mr-4">{title}</span>

        {/* Tools */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
          <Button
            variant={tool === 'pen' ? 'default' : 'ghost'}
            size="icon"
            className="w-8 h-8 rounded-lg"
            onClick={() => setTool('pen')}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant={tool === 'eraser' ? 'default' : 'ghost'}
            size="icon"
            className="w-8 h-8 rounded-lg"
            onClick={() => setTool('eraser')}
          >
            <Eraser className="w-4 h-4" />
          </Button>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-1 ml-auto">
          {drawingColors.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setColor(c.color);
                setTool('pen');
              }}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c.color ? 'border-indigo-600 scale-125' : 'border-white hover:scale-110'}`}
              style={{ backgroundColor: c.color }}
              aria-label={c.name}
            />
          ))}
        </div>

        <div className="w-px h-6 bg-slate-200 mx-2" />

        {/* Upload Image */}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          id="wb-upload"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (ev) => {
                if (ev.target?.result) {
                  const img = new Image();
                  img.onload = () => {
                    if (context && canvasRef.current) {
                      // Scale to fit if too big
                      const canvas = canvasRef.current;
                      let w = img.width;
                      let h = img.height;
                      const maxW = canvas.width * 0.8;
                      const maxH = canvas.height * 0.8;
                      const scale = Math.min(maxW / w, maxH / h, 1);
                      w *= scale;
                      h *= scale;
                      const x = (canvas.width - w) / 2;
                      const y = (canvas.height - h) / 2;
                      context.drawImage(img, x, y, w, h);
                      saveState();
                      onContentChange?.(true);
                      toast.success("Imagen subida a la pizarra");
                    }
                  };
                  img.src = ev.target.result as string;
                }
              };
              reader.readAsDataURL(file);
            }
          }}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => document.getElementById('wb-upload')?.click()}
          className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 w-8 h-8 rounded-lg"
          title="Subir Imagen"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </Button>

        {/* Clear */}
        <Button
          variant="ghost"
          size="icon"
          onClick={clearCanvas}
          className="ml-1 text-slate-400 hover:text-red-500 hover:bg-red-50 w-8 h-8 rounded-lg"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Canvas */}
      <div className="flex-1 mx-4 mb-4 whiteboard-container p-2 overflow-hidden bg-white rounded-3xl border-4 border-slate-100 shadow-inner relative">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair rounded-xl touch-none"
        />
      </div>
    </div>
  );
});
