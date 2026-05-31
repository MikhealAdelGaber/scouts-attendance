import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Project, CreateProject, UpdateProject,
  ProjectMemberScore, MemberProjectSummary
} from './project.model';

interface ApiResponse<T> { success: boolean; message?: string; data: T; }

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly base = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Project[]> {
    return this.http.get<ApiResponse<Project[]>>(this.base)
      .pipe(map(r => r.data ?? []));
  }

  getById(id: string): Observable<Project> {
    return this.http.get<ApiResponse<Project>>(`${this.base}/${id}`)
      .pipe(map(r => r.data));
  }

  create(dto: CreateProject): Observable<Project> {
    return this.http.post<ApiResponse<Project>>(this.base, dto)
      .pipe(map(r => r.data));
  }

  update(id: string, dto: UpdateProject): Observable<Project> {
    return this.http.put<ApiResponse<Project>>(`${this.base}/${id}`, dto)
      .pipe(map(r => r.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`)
      .pipe(map(() => void 0));
  }

  getProjectMembers(projectId: string): Observable<ProjectMemberScore[]> {
    return this.http.get<ApiResponse<ProjectMemberScore[]>>(`${this.base}/${projectId}/members`)
      .pipe(map(r => r.data ?? []));
  }

  saveScore(projectId: string, memberId: string, score: number, notes: string | null): Observable<ProjectMemberScore> {
    return this.http.post<ApiResponse<ProjectMemberScore>>(
      `${this.base}/${projectId}/members/${memberId}/score`, { score, notes })
      .pipe(map(r => r.data));
  }

  getMemberSummary(memberId: string): Observable<MemberProjectSummary> {
    return this.http.get<ApiResponse<MemberProjectSummary>>(
      `${environment.apiUrl}/members/${memberId}/projects/summary`)
      .pipe(map(r => r.data));
  }

  exportUrl(projectId: string): string {
    return `${this.base}/${projectId}/export`;
  }

  downloadExport(projectId: string, projectName: string): Observable<void> {
    return this.http.get(`${this.base}/${projectId}/export`, { responseType: 'blob' }).pipe(
      map(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Project-${projectName.replace(/\s+/g, '-')}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
    );
  }
}
