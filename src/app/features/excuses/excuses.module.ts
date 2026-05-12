import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ExcusesListComponent } from './excuses-list/excuses-list.component';
import { ExcuseFormComponent } from './excuse-form/excuse-form.component';

const routes: Routes = [
  { path: '', component: ExcusesListComponent },
  { path: 'new', component: ExcuseFormComponent }
];

@NgModule({
  declarations: [ExcusesListComponent, ExcuseFormComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class ExcusesModule {}
