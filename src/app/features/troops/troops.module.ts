import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { TroopListComponent } from './troop-list/troop-list.component';
import { TroopDetailComponent } from './troop-detail/troop-detail.component';
import { TroopFormComponent } from './troop-form/troop-form.component';

const routes: Routes = [
  { path: '', component: TroopListComponent },
  { path: 'new', component: TroopFormComponent },
  { path: ':id', component: TroopDetailComponent },
  { path: ':id/edit', component: TroopFormComponent }
];

@NgModule({
  declarations: [TroopListComponent, TroopDetailComponent, TroopFormComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class TroopsModule {}
