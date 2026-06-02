export interface AttendanceRate {
  memberId:          string;
  memberName:        string;
  troopName:         string;
  academicGrade:     string | null;
  // Attendance counts
  totalEvents:       number;
  present:           number;
  late:              number;
  tooLate:           number;
  excused:           number;
  absent:            number;
  rate:              number;
  // Exam
  latestExamScore:   number | null;
  // Projects
  totalProjects:     number;
  projectsCompleted: number;
  projectRate:       number | null;
  // Points
  totalPoints:       number;
}
