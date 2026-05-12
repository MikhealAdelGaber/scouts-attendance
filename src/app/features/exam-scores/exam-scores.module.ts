import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ExamScoreListComponent } from './exam-score-list/exam-score-list.component';

const routes: Routes = [
  { path: '', component: ExamScoreListComponent }
];

@NgModule({
  declarations: [ExamScoreListComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class ExamScoresModule {}
