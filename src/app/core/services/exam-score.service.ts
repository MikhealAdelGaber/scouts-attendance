import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  ExamScore, CreateExamScore, UpdateExamScore,
  ExamScoreConfig, SaveExamScoreConfig, ImportExamScoreResult
} from '../models/exam-score.model';

@Injectable({ providedIn: 'root' })
export class ExamScoreService {
  constructor(private api: ApiService) {}

  // ── Score reads ────────────────────────────────────────────────────────────

  getByMember(memberId: string): Observable<ExamScore[]> {
    return this.api.get<ExamScore[]>(`exam-scores/member/${memberId}`);
  }

  getByTroop(troopId: string, year?: number): Observable<ExamScore[]> {
    return this.api.get<ExamScore[]>(`exam-scores/troop/${troopId}`, year ? { year } : undefined);
  }

  // ── Score writes ───────────────────────────────────────────────────────────

  create(dto: CreateExamScore): Observable<ExamScore> {
    return this.api.post<ExamScore>('exam-scores', dto);
  }

  update(id: string, dto: UpdateExamScore): Observable<ExamScore> {
    return this.api.put<ExamScore>(`exam-scores/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`exam-scores/${id}`);
  }

  // ── Config ─────────────────────────────────────────────────────────────────

  getConfig(year: number): Observable<ExamScoreConfig | null> {
    return this.api.get<ExamScoreConfig | null>(`exam-scores/config/${year}`);
  }

  saveConfig(dto: SaveExamScoreConfig): Observable<ExamScoreConfig> {
    return this.api.put<ExamScoreConfig>('exam-scores/config', dto);
  }

  // ── Export / Import ────────────────────────────────────────────────────────

  /** Download the blank score-entry template as .xlsx */
  downloadTemplate(year: number, troopId?: string): Observable<Blob> {
    const params: Record<string, any> = { year };
    if (troopId) params['troopId'] = troopId;
    return this.api.getBlob('exam-scores/export-template', params);
  }

  /** Import a filled .xlsx file */
  importScores(file: File, year: number): Observable<ImportExamScoreResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.postFormData<ImportExamScoreResult>(`exam-scores/import?year=${year}`, formData);
  }
}
