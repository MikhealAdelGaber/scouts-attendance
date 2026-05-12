import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { LeaderboardPageComponent } from './leaderboard-page/leaderboard-page.component';

const routes: Routes = [{ path: '', component: LeaderboardPageComponent }];

@NgModule({
  declarations: [LeaderboardPageComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class LeaderboardModule {}
