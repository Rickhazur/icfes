import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Send, Gamepad2, Sparkles, GraduationCap, FileText } from "lucide-react";
import TutorMascot from "./TutorMascot";
import { getOllieResponse, gradeVocabulary } from "@/lib/olliePersonality_mod";
import { TutorReport } from "@/types/tutor";

interface Message {
  id: string;
  role: "tutor" | "student";
  content: string;
  type?: "text" | "game-prompt" | "correction" | "praise" | "personalized";
  emoji?: string;
  metadata?: {
    focusArea?: string;
    gradeLevel?: number;
    source?: string;
  };
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onStartGame: () => void;
  onOpenReports?: () => void;
  isTyping?: boolean;
  studentName?: string;
  gradeLevel?: number;
  activeReports?: TutorReport[];
}

const ChatInterface = ({
  messages,
  onSendMessage,
  onStartGame,
  onOpenReports,
  isTyping = false,
  studentName = "Student",
  gradeLevel = 3,
  activeReports = [],
}: ChatInterfaceProps) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const getMessageStyle = (type?: string) => {
    switch (type) {
      case "correction":
        return "bg-warning/20 border-warning/30";
      case "praise":
        return "bg-success/20 border-success/30";
      case "game-prompt":
        return "gradient-magic border-accent/30";
      case "personalized":
        return "bg-primary/10 border-primary/30";
      default:
        return "bg-card border-border";
    }
  };

  const getGradeLevelLabel = (grade: number) => {
    const ordinal = ["1st", "2nd", "3rd", "4th", "5th"];
    return ordinal[grade - 1] || `${grade}th`;
  };

  // Get priority challenges for quick actions
  const priorityChallenges = activeReports
    .flatMap(r => r.challenges)
    .filter(c => c.severity === "high")
    .slice(0, 2);

  return (
    <div className="flex flex-col h-full">
      {/* Grade Level Indicator */}
      <div className="px-4 py-2 bg-primary/5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <GraduationCap className="w-4 h-4 text-primary" />
          <span className="font-medium text-foreground">{getGradeLevelLabel(gradeLevel)} Grade</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{studentName}</span>
        </div>
        {activeReports.length > 0 && (
          <button
            onClick={onOpenReports}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <FileText className="w-3 h-3" />
            {activeReports.length} report{activeReports.length > 1 ? "s" : ""}
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={`flex items-end gap-3 ${message.role === "student" ? "flex-row-reverse" : ""}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.4 }}
            >
              {/* Avatar */}
              {message.role === "tutor" && (
                <div className="flex-shrink-0">
                  <TutorMascot size="sm" animate={false} />
                </div>
              )}

              {/* Message bubble */}
              <div
                className={`max-w-[80%] p-4 rounded-2xl border shadow-soft ${message.role === "student"
                    ? "gradient-primary text-primary-foreground rounded-br-sm"
                    : `${getMessageStyle(message.type)} rounded-bl-sm`
                  }`}
              >
                {message.emoji && (
                  <span className="text-2xl mr-2">{message.emoji}</span>
                )}
                <p className={`text-base leading-relaxed ${message.role === "tutor" && message.type !== "game-prompt" ? "text-foreground" : ""}`}>
                  {message.content}
                </p>
                {message.metadata?.focusArea && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                      📚 Focus: {message.metadata.focusArea}
                    </span>
                  </div>
                )}
              </div>

              {/* Student avatar */}
              {message.role === "student" && (
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">👦</span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              className="flex items-end gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <TutorMascot size="sm" mood="thinking" />
              <div className="bg-card p-4 rounded-2xl rounded-bl-sm border border-border shadow-soft">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-primary rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Priority Challenges Quick Actions */}
      {priorityChallenges.length > 0 && (
        <div className="px-4 py-2 bg-accent/10 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">🎯 Focus areas from your tutors:</p>
          <div className="flex gap-2 flex-wrap">
            {priorityChallenges.map((challenge) => (
              <Button
                key={challenge.id}
                variant="outline"
                size="sm"
                onClick={() => onSendMessage(`Help me with ${challenge.englishConnection}`)}
                className="text-xs bg-background"
              >
                {challenge.area}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto">
        <Button variant="playful" size="sm" onClick={onStartGame}>
          <Gamepad2 className="w-4 h-4 mr-1" />
          Games Center
        </Button>
        <Button variant="playful" size="sm" onClick={() => onSendMessage("Give me a new challenge 🎯")}>
          <Sparkles className="w-4 h-4 mr-1" />
          Challenge
        </Button>
        {onOpenReports && (
          <Button variant="outline" size="sm" onClick={onOpenReports}>
            <FileText className="w-4 h-4 mr-1" />
            View Reports
          </Button>
        )}
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Type your message, ${studentName}... ✨`}
            className="flex-1 p-4 rounded-2xl border-2 border-border bg-background focus:border-primary focus:outline-none transition-colors text-base"
          />
          <Button
            type="submit"
            variant="default"
            size="iconLg"
            disabled={!input.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
