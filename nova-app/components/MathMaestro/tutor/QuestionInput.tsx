import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Lightbulb, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Language } from '../../../types/tutor';

interface QuestionInputProps {
  language: Language;
  starterText: string;
  onSendText: (text: string) => void;
  onSendBoard: () => void;
  onInsertStarter?: (starter: string) => void;
  onUploadImage?: (file: File) => void;
}

export function QuestionInput({ language, starterText, onSendText, onSendBoard, onInsertStarter, onUploadImage }: QuestionInputProps) {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const placeholder = language === 'es'
    ? 'Escribe aquí tu pregunta para Nova... ✏️'
    : 'Write your question for Nova here... ✏️';

  const sendTextLabel = language === 'es' ? 'Enviar Texto' : 'Send Text';
  const sendBoardLabel = language === 'es' ? 'Enviar Tablero' : 'Send Board';
  const uploadLabel = language === 'es' ? 'Subir Foto' : 'Upload Photo';

  // Update text when starter is inserted
  useEffect(() => {
    if (starterText && !inputValue.includes(starterText)) {
      setInputValue(prev => prev ? `${prev} ${starterText}` : starterText);
    }
  }, [starterText]);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onSendText(inputValue);
      setInputValue('');
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadImage?.(e.target.files[0]);
    }
  };

  return (
    <div className="px-4 py-3 bg-card border-t border-border">
      <div className="flex items-start gap-3">
        {/* Input and integrated buttons */}
        <div className="relative flex items-center bg-white rounded-2xl shadow-sm border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-100 transition-all p-2 flex-1">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              // Auto-resize
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-transparent border-none focus:ring-0 text-slate-700 placeholder:text-slate-400 resize-none py-3 px-2 min-h-[60px] text-lg"
            rows={1}
          />

          <div className="flex items-center gap-2 self-end mb-2">

            {/* Image Upload Button */}
            <input
              type="file"
              id="chat-upload"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl"
              onClick={() => document.getElementById('chat-upload')?.click()}
              title={uploadLabel}
            >
              <ImageIcon className="w-5 h-5" />
            </Button>

            {/* Helper buttons */}
            <Button
              variant="ghost"
              size="icon"
              className="text-yellow-500 hover:bg-yellow-50 rounded-xl"
              onClick={() => onInsertStarter?.('💡')}
            >
              <Lightbulb className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
              onClick={() => setInputValue('')}
            >
              <RotateCcw className="w-5 h-5" />
            </Button>

            <Button
              size="icon"
              disabled={!inputValue.trim()}
              onClick={handleSubmit}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 disabled:opacity-50 disabled:shadow-none w-10 h-10 transition-all active:scale-95"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Send Board Button */}
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="default"
            onClick={onSendBoard}
            className="gap-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
          >
            <Sparkles className="w-4 h-4" />
            {sendBoardLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
