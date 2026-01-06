import { MathTutorBoard } from '@/components/MathMaestro/tutor/MathTutorBoard';

const MathTutor = ({ gradeLevel, userName, userId }: { gradeLevel: number; userName?: string; userId?: string }) => {
  return <MathTutorBoard initialGrade={gradeLevel} userName={userName} userId={userId} />;
};

export default MathTutor;
