export interface YearlyArchiveSummary {
  id:           string;
  archiveYear:  string;
  archivedAt:   string;
  archivedBy:   string;
  totalMembers: number;
  totalGroups:  number;
}

export interface YearlyMemberArchive {
  id:                   string;
  memberId:             string;
  memberName:           string;
  groupId:              string;
  groupName:            string;
  troopName:            string | null;
  totalPointsAtYearEnd: number;
  totalAttendanceCount: number;
  totalEventsAttended:  number;
  totalExcusesCount:    number;
  latestExamScore:      number | null;
  totalProjects:        number;
  projectsCompleted:    number;
  academicGrade:        string | null;
  // computed by backend
  attendanceRate:       number | null;
  projectRate:          number | null;
}

export interface YearlyArchiveDetail extends YearlyArchiveSummary {
  members: YearlyMemberArchive[];
}

export interface NewYearResult {
  archiveId:             string;
  archiveYear:           string;
  totalMembers:          number;
  totalGroups:           number;
  archivedAt:            string;
  pointsDeleted:         number;
  excusesDeleted:        number;
  pendingExcusesDeleted: number;
  attendanceDeleted:     number;
  eventsDeleted:         number;
  tripsDeleted:          number;
  projectsDeleted:       number;
  troopsDeleted:         number;
}
