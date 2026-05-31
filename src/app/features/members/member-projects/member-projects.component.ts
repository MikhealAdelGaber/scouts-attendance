import { Component, Input, OnInit } from '@angular/core';
import { ProjectService } from '../../projects/project.service';
import { MemberProjectSummary, getGradeColor } from '../../projects/project.model';

@Component({
  selector: 'app-member-projects',
  templateUrl: './member-projects.component.html',
  styleUrls: ['./member-projects.component.scss']
})
export class MemberProjectsComponent implements OnInit {
  @Input() memberId!: string;

  summary: MemberProjectSummary | null = null;
  loading = true;

  getGradeColor = getGradeColor;

  readonly columns = ['projectName', 'score', 'maxScore', 'percentage', 'grade', 'gradedBy', 'gradedAt'];

  constructor(private svc: ProjectService) {}

  ngOnInit(): void {
    this.svc.getMemberSummary(this.memberId).subscribe({
      next: s  => { this.summary = s; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
