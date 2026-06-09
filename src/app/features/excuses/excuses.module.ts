import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ExcusesListComponent } from './excuses-list/excuses-list.component';
import { ExcuseFormComponent } from './excuse-form/excuse-form.component';

@NgModule({
  declarations: [ExcusesListComponent, ExcuseFormComponent],
  imports: [SharedModule, RouterModule.forChild([
  { path: '', component: ExcusesListComponent },
  { path: 'new', component: ExcuseFormComponent }
])]
})
export class ExcusesModule {}
