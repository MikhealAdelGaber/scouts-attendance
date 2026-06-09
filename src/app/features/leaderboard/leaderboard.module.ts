import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { LeaderboardPageComponent } from './leaderboard-page/leaderboard-page.component';

@NgModule({
  declarations: [LeaderboardPageComponent],
  imports: [SharedModule, RouterModule.forChild([{ path: '', component: LeaderboardPageComponent }])]
})
export class LeaderboardModule {}
