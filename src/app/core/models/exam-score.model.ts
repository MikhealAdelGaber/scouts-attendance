export interface ExamScore {
  id: string;
  memberId: string;
  memberName: string;
  troopName: string;
  year: number;
  theoreticalScore: number;
  practicalScore: number;
  totalScore: number;
  percentage?: number;
  grade?: string;
  notes?: string;
  createdAt: string;
}

export interface CreateExamScore {
  memberId: string;
  year: number;
  theoreticalScore: number;
  practicalScore: number;
  notes?: string;
}

export interface UpdateExamScore {
  theoreticalScore: number;
  practicalScore: number;
  notes?: string;
}

export interface ExamScoreConfig {
  id: string;
  groupId: string;
  year: number;
  theoreticalMaxScore: number;
  practicalMaxScore: number;
  totalMaxScore: number;
}

export interface SaveExamScoreConfig {
  year: number;
  theoreticalMaxScore: number;
  practicalMaxScore: number;
}

export interface ImportExamScoreResult {
  importedCount: number;
  skippedCount: number;
  skippedRows: ImportSkippedRow[];
}

export interface ImportSkippedRow {
  rowNumber: number;
  memberId: string;
  memberName: string;
  reason: string;
}

export interface ExamScoreGrade {
  label: string;
  color: string;
}

export function getGrade(percentage: number): ExamScoreGrade {
  if (percentage >= 90) return { label: 'Excellent',  color: '#4caf50' };
  if (percentage >= 75) return { label: 'Very Good',  color: '#8bc34a' };
  if (percentage >= 60) return { label: 'Good',       color: '#ff9800' };
  if (percentage >= 50) return { label: 'Pass',       color: '#ff5722' };
  return                       { label: 'Fail',        color: '#f44336' };
}
