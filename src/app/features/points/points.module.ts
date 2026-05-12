import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { PointsDashboardComponent } from './points-dashboard/points-dashboard.component';
import { AddPointsComponent } from './add-points/add-points.component';
import { TroopPointsComponent } from './troop-points/troop-points.component';
import { MemberCategoriesComponent } from './member-categories/member-categories.component';
import { TroopCategoriesComponent } from './troop-categories/troop-categories.component';

const routes: Routes = [
  { path: '',                  component: PointsDashboardComponent },
  { path: 'add',               component: AddPointsComponent },
  { path: 'troop',             component: TroopPointsComponent },
  { path: 'member-categories', component: MemberCategoriesComponent },
  { path: 'troop-categories',  component: TroopCategoriesComponent }
];

@NgModule({
  declarations: [
    PointsDashboardComponent,
    AddPointsComponent,
    TroopPointsComponent,
    MemberCategoriesComponent,
    TroopCategoriesComponent
  ],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class PointsModule {}
