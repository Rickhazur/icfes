import { ResearchCenter } from '../components/research/ResearchCenter';

const Index = ({ gradeLevel = 3 }: { gradeLevel?: number }) => {
  return <ResearchCenter initialGrade={gradeLevel} />;
};

export default Index;
