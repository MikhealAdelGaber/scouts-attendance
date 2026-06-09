import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ExamScoreListComponent } from './exam-score-list/exam-score-list.component';
import { ExamImportResultDialogComponent } from './import-result-dialog/import-result-dialog.component';

@NgModule({
  declarations: [
    ExamScoreListComponent,
    ExamImportResultDialogComponent
  ],
  imports: [SharedModule, RouterModule.forChild([
  { path: '', component: ExamScoreListComponent }
])]
})
export class ExamScoresModule {}
