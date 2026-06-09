export interface AttendanceRate {
  memberId:          string;
  memberName:        string;
  troopName:         string;
  academicGrade:     string | null;
  hasNeckerchief:    boolean;
  // Attendance counts
  totalEvents:       number;
  present:           number;
  late:              number;
  tooLate:           number;
  excused:           number;
  absent:            number;
  rate:              number;
  // Exam
  latestExamScore:          number | null;
  latestExamTheoretical:    number | null;
  latestExamTheoreticalMax: number | null;
  latestExamPractical:      number | null;
  latestExamPracticalMax:   number | null;
  latestExamPercentage:     number | null;
  // Projects
  totalProjects:     number;
  projectsCompleted: number;
  projectRate:       number | null;
  // Points
  totalPoints:       number;
}
