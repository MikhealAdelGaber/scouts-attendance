import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { TalaeaListComponent } from './talaea-list/talaea-list.component';
import { TalaeaFormComponent } from './talaea-form/talaea-form.component';
import { TalaeaPointsComponent } from './talaea-points/talaea-points.component';

@NgModule({
  declarations: [TalaeaListComponent, TalaeaFormComponent, TalaeaPointsComponent],
  imports: [SharedModule, RouterModule.forChild([
  { path: '',               component: TalaeaListComponent },
  { path: 'new',            component: TalaeaFormComponent },
  { path: ':id/edit',       component: TalaeaFormComponent },
  { path: ':id/points',     component: TalaeaPointsComponent }
])]
})
export class TalaeaModule {}
