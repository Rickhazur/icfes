import { useState } from 'react';
import { Send, Sparkles, Lightbulb, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Language } from '@/types/tutor';

interface QuestionInputProps {
  language: Language;
  starterText: string;
  onSendText: (text: string) => void;
  onSendBoard: () => void;
}

export function QuestionInput({ language, starterText, onSendText, onSendBoard }: QuestionInputProps) {
  const [text, setText] = useState('');

  const placeholder = language === 'es' 
    ? 'Escribe aquí tu pregunta para Nova... ✏️' 
    : 'Write your question for Nova here... ✏️';
  
  const sendTextLabel = language === 'es' ? 'Enviar Texto' : 'Send Text';
  const sendBoardLabel = language === 'es' ? 'Enviar Tablero' : 'Send Board';

  // Update text when starter is inserted
  if (starterText && !text.includes(starterText)) {
    setText(prev => prev ? `${prev} ${starterText}` : starterText);
  }

  const handleSend = () => {
    if (text.trim()) {
      onSendText(text);
      setText('');
    }
  };

  return (
    <div className="px-4 py-3 bg-card border-t border-border">
      <div className="flex items-start gap-3">
        {/* Left Icons */}
        <div className="flex flex-col gap-2 pt-2">
          <button className="text-muted-foreground hover:text-primary transition-colors">
            <Lightbulb className="w-5 h-5" />
          </button>
          <button className="text-muted-foreground hover:text-primary transition-colors">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Input */}
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            className="input-question resize-none min-h-[60px]"
            rows={2}
          />
        </div>

        {/* Send Buttons */}
        <div className="flex flex-col gap-2">
          <Button
            variant="send"
            size="default"
            onClick={handleSend}
            disabled={!text.trim()}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            {sendTextLabel}
          </Button>
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
