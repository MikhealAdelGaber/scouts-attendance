import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ExamScoreListComponent } from './exam-score-list/exam-score-list.component';
import { ExamImportResultDialogComponent } from './import-result-dialog/import-result-dialog.component';

const routes: Routes = [
  { path: '', component: ExamScoreListComponent }
];

@NgModule({
  declarations: [
    ExamScoreListComponent,
    ExamImportResultDialogComponent
  ],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class ExamScoresModule {}
