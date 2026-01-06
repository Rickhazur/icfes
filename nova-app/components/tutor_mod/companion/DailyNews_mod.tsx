import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Volume2, BookOpen, CheckCircle, XCircle, Star, RefreshCw, Clock, TrendingUp } from "lucide-react";
import { useRewards } from "@/hooks/useRewards_mod";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import type { PersonalizedContent } from "@/hooks/usePersonalizedContent_mod";

interface DailyNewsProps {
  onComplete: (score: number, coins: number) => void;
  onBack: () => void;
  personalizedContent?: PersonalizedContent;
}

interface VocabWord {
  word: string;
  definition: string;
  example: string;
}

interface ComprehensionQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

interface Article {
  id: string;
  title: string;
  emoji: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  readTime: number;
  content: string;
  vocabulary: VocabWord[];
  questions: ComprehensionQuestion[];
}

// Generate dynamic articles based on personalized content
const generateDynamicArticles = (content: PersonalizedContent): Article[] => {
  const articles: Article[] = [];
  const gradeLevel = content.gradeLevel;
  const level = gradeLevel <= 2 ? 'beginner' : gradeLevel <= 4 ? 'intermediate' : 'advanced';
  
  // Group vocabulary by category
  const vocabByCategory = content.vocabulary.reduce((acc, v) => {
    if (!acc[v.category]) acc[v.category] = [];
    acc[v.category].push(v);
    return acc;
  }, {} as Record<string, typeof content.vocabulary>);

  // Generate articles for each focus area
  content.focusAreas.forEach((area, areaIdx) => {
    const relatedVocab = content.vocabulary.filter(v => 
      v.sourceChallenge?.includes(area) || 
      content.challenges.some(c => c.englishConnection === area && c.area === v.category)
    );
    
    const vocabToUse = relatedVocab.length > 0 ? relatedVocab : content.vocabulary.slice(areaIdx * 4, (areaIdx + 1) * 4);
    if (vocabToUse.length === 0) return;

    const vocabWords = vocabToUse.slice(0, 4).map(v => ({
      word: v.word,
      definition: v.definition,
      example: v.example,
    }));

    const categoryEmoji: Record<string, string> = {
      science: '🔬',
      math: '🔢',
      history: '📜',
      writing: '✏️',
      general: '📚',
    };

    const emoji = categoryEmoji[vocabToUse[0]?.category] || '📰';
    const category = vocabToUse[0]?.category?.charAt(0).toUpperCase() + vocabToUse[0]?.category?.slice(1) || 'Learning';

    // Generate article content using the vocabulary
    const articleContent = generateArticleContent(vocabToUse, area, gradeLevel);
    const questions = generateQuestions(vocabToUse, articleContent);

    articles.push({
      id: `dynamic-${areaIdx}`,
      title: articleContent.title,
      emoji,
      category,
      level,
      readTime: Math.max(2, Math.ceil(articleContent.text.split(' ').length / 100)),
      content: articleContent.text,
      vocabulary: vocabWords,
      questions,
    });
  });

  // Add at least one article if none generated
  if (articles.length === 0 && content.vocabulary.length > 0) {
    const vocabWords = content.vocabulary.slice(0, 4).map(v => ({
      word: v.word,
      definition: v.definition,
      example: v.example,
    }));

    articles.push({
      id: 'dynamic-default',
      title: 'Learning New Words',
      emoji: '📚',
      category: 'Vocabulary',
      level,
      readTime: 2,
      content: `Today we will learn some important words for school. ${content.vocabulary.slice(0, 3).map(v => `The word "${v.word}" means ${v.definition.toLowerCase()}.`).join(' ')} These words will help you in your studies!`,
      vocabulary: vocabWords,
      questions: generateQuestions(content.vocabulary.slice(0, 4), { title: '', text: '' }),
    });
  }

  return articles;
};

const generateArticleContent = (
  vocab: PersonalizedContent['vocabulary'],
  focusArea: string,
  gradeLevel: number
): { title: string; text: string } => {
  const templates = {
    'Academic vocabulary practice': {
      title: 'A Day in the Science Lab',
      text: (words: string[]) => `Today, the students visited the school laboratory. The teacher showed them how to do an ${words[0] || 'experiment'}. First, they made a ${words[1] || 'hypothesis'} about what would happen. Then, they made careful ${words[2] || 'observations'}. At the end, they wrote their ${words[3] || 'conclusion'}. Science is fun when you understand the vocabulary!`,
    },
    'Reading comprehension for math': {
      title: 'Solving Problems Together',
      text: (words: string[]) => `Maria loves math class. Today, the teacher gave the students a word problem. They needed to find the ${words[0] || 'total'} of some numbers. Maria knew that ${words[1] || 'altogether'} means to add things up. She also remembered that the ${words[2] || 'difference'} means to subtract. She helped her friend understand ${words[3] || 'each'} step. Working together makes math easier!`,
    },
    'Sentence structure and clarity': {
      title: 'Writing Clear Sentences',
      text: (words: string[]) => `Good writing uses clear sentences. ${words[0] ? `A ${words[0]} is a group of sentences about one idea.` : ''} Every story needs an ${words[1] || 'introduction'} at the beginning. The ${words[2] || 'conclusion'} comes at the end. Using words like "${words[3] || 'however'}" helps connect ideas. Practice makes your writing better!`,
    },
    'Sequence words and imperative verbs': {
      title: 'Following Instructions',
      text: (words: string[]) => `Knowing how to follow instructions is important. ${words[0] ? `${words[0].charAt(0).toUpperCase() + words[0].slice(1)}, read all the steps carefully.` : 'First, read all the steps.'} ${words[1] ? `${words[1].charAt(0).toUpperCase() + words[1].slice(1)}, gather your materials.` : 'Then, gather your materials.'} ${words[2] ? `${words[2].charAt(0).toUpperCase() + words[2].slice(1)}, follow each step in order.` : 'Next, follow each step.'} ${words[3] ? `${words[3].charAt(0).toUpperCase() + words[3].slice(1)}, check your work.` : 'Finally, check your work!'} Good instructions use sequence words!`,
    },
    'Ordinal numbers and date expressions': {
      title: 'Understanding Time and Dates',
      text: (words: string[]) => `Dates and time are important in history. A ${words[0] || 'century'} is one hundred years. A ${words[1] || 'decade'} is ten years. When we talk about ${words[2] || 'ancient'} times, we mean very long ago. The ${words[3] || 'modern'} world is the time we live in now. Understanding time helps us learn history!`,
    },
  };

  const template = templates[focusArea as keyof typeof templates] || templates['Academic vocabulary practice'];
  const words = vocab.map(v => v.word);

  return {
    title: template.title,
    text: template.text(words),
  };
};

const generateQuestions = (
  vocab: PersonalizedContent['vocabulary'],
  article: { title: string; text: string }
): ComprehensionQuestion[] => {
  const questions: ComprehensionQuestion[] = [];

  // Vocabulary questions
  vocab.slice(0, 3).forEach((v, idx) => {
    const wrongOptions = vocab
      .filter(other => other.word !== v.word)
      .map(other => other.definition)
      .slice(0, 3);

    while (wrongOptions.length < 3) {
      wrongOptions.push(`Not related to ${v.word}`);
    }

    const options = [v.definition, ...wrongOptions].sort(() => Math.random() - 0.5);
    
    questions.push({
      question: `What does "${v.word}" mean?`,
      options,
      correctIndex: options.indexOf(v.definition),
    });
  });

  return questions;
};

const DailyNews_mod = ({ onComplete, onBack, personalizedContent }: DailyNewsProps) => {
  const { addCoins } = useRewards();
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced' | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [showVocab, setShowVocab] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [totalCoins, setTotalCoins] = useState(0);
  const [articlesRead, setArticlesRead] = useState(0);

  // Generate dynamic articles from personalized content
  const dynamicArticles = useMemo(() => {
    if (personalizedContent && personalizedContent.vocabulary.length > 0) {
      return generateDynamicArticles(personalizedContent);
    }
    return [];
  }, [personalizedContent]);

  useEffect(() => {
    if (selectedLevel) {
      // Use dynamic articles if available, filtered by level
      if (dynamicArticles.length > 0) {
        const filtered = dynamicArticles.filter(a => a.level === selectedLevel);
        // If no articles match the level, show all dynamic articles
        setArticles(filtered.length > 0 ? filtered.sort(() => Math.random() - 0.5) : dynamicArticles.sort(() => Math.random() - 0.5));
      } else {
        setArticles([]);
      }
    }
  }, [selectedLevel, dynamicArticles]);

  const speakText = useCallback((text: string) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  }, []);

  const handleSelectArticle = (article: Article) => {
    setCurrentArticle(article);
    setShowVocab(false);
    setShowQuiz(false);
    setCurrentQuestion(0);
    setAnswers([]);
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowResult(true);
    
    const isCorrect = index === currentArticle?.questions[currentQuestion].correctIndex;
    if (isCorrect) {
      const coins = selectedLevel === 'beginner' ? 2 : selectedLevel === 'intermediate' ? 3 : 5;
      setTotalCoins(prev => prev + coins);
      addCoins(coins, 'Daily News Quiz');
    }
    
    setAnswers([...answers, index]);
  };

  const handleNextQuestion = () => {
    if (!currentArticle) return;
    
    if (currentQuestion < currentArticle.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz finished
      const correctCount = answers.filter((a, i) => a === currentArticle.questions[i].correctIndex).length + 
        (selectedAnswer === currentArticle.questions[currentQuestion].correctIndex ? 1 : 0);
      
      const readBonus = selectedLevel === 'beginner' ? 5 : selectedLevel === 'intermediate' ? 8 : 12;
      setTotalCoins(prev => prev + readBonus);
      addCoins(readBonus, 'Article Completed');
      setArticlesRead(prev => prev + 1);
      
      toast.success(`Article completed! ${correctCount}/${currentArticle.questions.length} correct!`);
      setCurrentArticle(null);
      setShowQuiz(false);
    }
  };

  const handleFinish = () => {
    onComplete(articlesRead * 20, totalCoins);
  };

  if (!selectedLevel) {
    return (
      <motion.div className="flex-1 flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              📰 Daily English News
            </h2>
            <p className="text-muted-foreground">Read articles and learn new vocabulary!</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <motion.div 
            className="text-8xl"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            📚
          </motion.div>
          
          <h3 className="text-xl font-bold text-foreground">Choose Your Reading Level</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg">
            {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
              <motion.button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  level === 'beginner' ? 'bg-green-100 border-green-400 hover:bg-green-200' :
                  level === 'intermediate' ? 'bg-amber-100 border-amber-400 hover:bg-amber-200' :
                  'bg-purple-100 border-purple-400 hover:bg-purple-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-4xl mb-2">
                  {level === 'beginner' ? '📗' : level === 'intermediate' ? '📙' : '📕'}
                </div>
                <div className="font-bold capitalize text-foreground">{level}</div>
                <div className="text-sm text-muted-foreground">
                  {level === 'beginner' ? 'Simple stories' : level === 'intermediate' ? 'More details' : 'Complex topics'}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (!currentArticle) {
    return (
      <motion.div className="flex-1 flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelectedLevel(null)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-xl font-bold text-foreground capitalize">{selectedLevel} Articles</h2>
              <p className="text-muted-foreground">{articlesRead} articles read</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            <span className="font-bold text-primary">{totalCoins} coins</span>
          </div>
        </div>

        <div className="grid gap-4 overflow-y-auto">
          {articles.map((article, index) => (
            <motion.button
              key={article.id}
              onClick={() => handleSelectArticle(article)}
              className="p-4 bg-card border border-border rounded-2xl text-left hover:border-primary/50 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{article.emoji}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-1">{article.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {article.readTime} min
                    </span>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                      {article.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {article.vocabulary.length} words
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {articlesRead > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
            <Button onClick={handleFinish} className="w-full bg-gradient-to-r from-green-500 to-emerald-500">
              Finish Reading ({articlesRead} articles, {totalCoins} coins)
            </Button>
          </motion.div>
        )}
      </motion.div>
    );
  }

  if (showQuiz) {
    const question = currentArticle.questions[currentQuestion];
    const isCorrect = selectedAnswer === question.correctIndex;

    return (
      <motion.div className="flex-1 flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => setShowQuiz(false)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">Comprehension Quiz</h2>
            <Progress value={((currentQuestion + 1) / currentArticle.questions.length) * 100} className="h-2 mt-1" />
          </div>
          <span className="text-sm text-muted-foreground">
            {currentQuestion + 1}/{currentArticle.questions.length}
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-foreground mb-6">{question.question}</h3>
            
            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectAnswer = index === question.correctIndex;
                
                return (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-3 ${
                      showResult && isCorrectAnswer ? 'bg-green-100 border-2 border-green-500' :
                      showResult && isSelected && !isCorrect ? 'bg-red-100 border-2 border-red-500' :
                      isSelected ? 'bg-primary/20 border-2 border-primary' :
                      'bg-muted/50 border-2 border-transparent hover:border-primary/30'
                    }`}
                    whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                    whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      showResult && isCorrectAnswer ? 'bg-green-500 text-white' :
                      showResult && isSelected && !isCorrect ? 'bg-red-500 text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1 text-foreground">{option}</span>
                    {showResult && isCorrectAnswer && <CheckCircle className="w-6 h-6 text-green-500" />}
                    {showResult && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500" />}
                  </motion.button>
                );
              })}
            </div>

            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-xl ${isCorrect ? 'bg-green-100' : 'bg-amber-100'}`}
              >
                <p className="font-medium text-foreground">
                  {isCorrect ? '🎉 Correct! Great job!' : '💪 Keep trying! The correct answer is highlighted.'}
                </p>
              </motion.div>
            )}
          </motion.div>

          {showResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
              <Button onClick={handleNextQuestion} className="w-full">
                {currentQuestion < currentArticle.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="flex-1 flex flex-col overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={() => setCurrentArticle(null)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">{currentArticle.title}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {currentArticle.readTime} min read
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={() => speakText(currentArticle.content)}>
          <Volume2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-4">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="text-6xl text-center mb-4">{currentArticle.emoji}</div>
          <div className="prose prose-sm max-w-none">
            {currentArticle.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-foreground mb-4 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Vocabulary Section */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <button
            onClick={() => setShowVocab(!showVocab)}
            className="w-full flex items-center justify-between"
          >
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Vocabulary ({currentArticle.vocabulary.length} words)
            </h3>
            <motion.span animate={{ rotate: showVocab ? 180 : 0 }}>▼</motion.span>
          </button>
          
          <AnimatePresence>
            {showVocab && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 space-y-3 overflow-hidden"
              >
                {currentArticle.vocabulary.map((vocab, index) => (
                  <motion.div
                    key={vocab.word}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-muted/50 rounded-xl p-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-primary">{vocab.word}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => speakText(vocab.word)}>
                        <Volume2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{vocab.definition}</p>
                    <p className="text-sm text-foreground mt-1 italic">"{vocab.example}"</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Quiz Button */}
      <div className="mt-4">
        <Button onClick={handleStartQuiz} className="w-full bg-gradient-to-r from-primary to-primary/80">
          <TrendingUp className="w-5 h-5 mr-2" />
          Take Comprehension Quiz
        </Button>
      </div>
    </motion.div>
  );
};

export default DailyNews_mod;
