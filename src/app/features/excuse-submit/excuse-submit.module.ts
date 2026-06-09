import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ExcuseSubmitComponent } from './excuse-submit.component';

@NgModule({
  declarations: [ExcuseSubmitComponent],
  imports: [SharedModule, RouterModule.forChild([
  { path: ':token', component: ExcuseSubmitComponent },
  { path: '',       redirectTo: 'invalid', pathMatch: 'full' },
  { path: 'invalid', component: ExcuseSubmitComponent }
])]
})
export class ExcuseSubmitModule {}
