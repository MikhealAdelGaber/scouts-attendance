export interface Project {
  id:           string;
  name:         string;
  description:  string | null;
  maxScore:     number;
  groupId:      string;
  groupName:    string;
  troopId:      string | null;
  troopName:    string | null;
  createdBy:    string;
  isActive:     boolean;
  gradedCount:  number;
  createdAt:    string;
}

export interface CreateProject {
  name:        string;
  description: string | null;
  maxScore:    number;
  troopId:     string | null;
}

export interface UpdateProject extends CreateProject {
  isActive: boolean;
}

export interface ProjectMemberScore {
  memberId:    string;
  memberName:  string;
  customId:    number;
  troopName:   string | null;
  score:       number | null;
  notes:       string | null;
  gradedBy:    string | null;
  gradedAt:    string | null;
  percentage:  number | null;
  grade:       string | null;
  gradeArabic: string | null;
  isGraded:    boolean;
}

export interface MemberProjectScore {
  projectId:   string;
  projectName: string;
  maxScore:    number;
  score:       number;
  notes:       string | null;
  gradedBy:    string;
  gradedAt:    string;
  percentage:  number;
  grade:       string;
  gradeArabic: string;
}

export interface MemberProjectSummary {
  memberId:          string;
  memberName:        string;
  totalScored:       number;
  totalPossible:     number;
  successRate:       number;
  overallGrade:      string;
  overallGradeArabic: string;
  projectCount:      number;
  projects:          MemberProjectScore[];
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A': return '#4caf50';
    case 'B': return '#8bc34a';
    case 'C': return '#ff9800';
    case 'D': return '#ff5722';
    case 'F': return '#f44336';
    default:  return '#9e9e9e';
  }
}
