import { Pipe, PipeTransform } from '@angular/core';
import { ExamScore } from '../../core/models/exam-score.model';

@Pipe({ name: 'passCount' })
export class PassCountPipe implements PipeTransform {
  transform(scores: ExamScore[]): number {
    return scores.filter(s => s.score >= 50).length;
  }
}
