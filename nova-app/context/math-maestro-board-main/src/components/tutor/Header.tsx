import { ChevronLeft, Volume2, BookOpen, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Language, GradeLevel, Curriculum } from '@/types/tutor';
import { gradeLabels, curriculumLabels } from '@/data/mathHints';

interface HeaderProps {
  language: Language;
  grade: GradeLevel;
  curriculum: Curriculum;
  onLanguageChange: (lang: Language) => void;
  onGradeChange: (grade: GradeLevel) => void;
  onCurriculumChange: (curriculum: Curriculum) => void;
}

export function Header({ 
  language, 
  grade, 
  curriculum,
  onLanguageChange, 
  onGradeChange,
  onCurriculumChange 
}: HeaderProps) {
  const tutorName = language === 'es' ? 'Nova 🌟' : 'Nova 🌟';
  const sessionLabel = language === 'es' ? 'Sesión Socrática' : 'Socratic Session';

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-lg">
            😊
          </div>
          <div>
            <h1 className="font-bold text-foreground">{tutorName}</h1>
            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
              {sessionLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Curriculum Badge */}
        <div className="flex items-center gap-1 bg-accent/20 border border-accent rounded-lg px-2 py-1">
          <BookOpen className="w-4 h-4 text-accent" />
          <select 
            value={curriculum}
            onChange={(e) => onCurriculumChange(e.target.value as Curriculum)}
            className="bg-transparent cursor-pointer border-none outline-none text-sm font-medium text-accent"
          >
            <option value="ib-pyp">{curriculumLabels['ib-pyp'][language]}</option>
            <option value="colombia">{curriculumLabels['colombia'][language]}</option>
          </select>
        </div>

        {/* Grade Badge */}
        <div className="flex items-center gap-1 bg-primary/20 border border-primary rounded-lg px-2 py-1">
          <GraduationCap className="w-4 h-4 text-primary" />
          <select 
            value={grade}
            onChange={(e) => onGradeChange(Number(e.target.value) as GradeLevel)}
            className="bg-transparent cursor-pointer border-none outline-none text-sm font-medium text-primary"
          >
            {[1, 2, 3, 4, 5].map((g) => (
              <option key={g} value={g}>
                {gradeLabels[language][g - 1]}
              </option>
            ))}
          </select>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center bg-muted rounded-full p-1">
          <button
            onClick={() => onLanguageChange('en')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              language === 'en' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => onLanguageChange('es')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              language === 'es' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            ES
          </button>
        </div>

        <Button variant="ghost" size="icon">
          <Volume2 className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
