export interface ExamScore {
  id: string;
  memberId: string;
  memberName: string;
  troopName: string;
  year: number;
  score: number;
  notes?: string;
  createdAt: string;
}

export interface CreateExamScore {
  memberId: string;
  year: number;
  score: number;
  notes?: string;
}

export interface UpdateExamScore {
  score: number;
  notes?: string;
}

export interface ExamScoreGrade {
  label: string;
  color: string;
}

export function getGrade(score: number): ExamScoreGrade {
  if (score >= 90) return { label: 'Excellent',  color: '#4caf50' };
  if (score >= 75) return { label: 'Very Good',  color: '#8bc34a' };
  if (score >= 60) return { label: 'Good',       color: '#ff9800' };
  if (score >= 50) return { label: 'Pass',       color: '#ff5722' };
  return                   { label: 'Fail',       color: '#f44336' };
}
