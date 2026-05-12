import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ExamScore, CreateExamScore, UpdateExamScore } from '../models/exam-score.model';

@Injectable({ providedIn: 'root' })
export class ExamScoreService {
  constructor(private api: ApiService) {}

  getByMember(memberId: string): Observable<ExamScore[]> {
    return this.api.get<ExamScore[]>(`exam-scores/member/${memberId}`);
  }

  getByTroop(troopId: string, year?: number): Observable<ExamScore[]> {
    return this.api.get<ExamScore[]>(`exam-scores/troop/${troopId}`, year ? { year } : undefined);
  }

  create(dto: CreateExamScore): Observable<ExamScore> {
    return this.api.post<ExamScore>('exam-scores', dto);
  }

  update(id: string, dto: UpdateExamScore): Observable<ExamScore> {
    return this.api.put<ExamScore>(`exam-scores/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`exam-scores/${id}`);
  }
}
