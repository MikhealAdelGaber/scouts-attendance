import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ExcuseSubmitComponent } from './excuse-submit.component';

const routes: Routes = [
  { path: ':token', component: ExcuseSubmitComponent },
  { path: '',       redirectTo: 'invalid', pathMatch: 'full' },
  { path: 'invalid', component: ExcuseSubmitComponent }
];

@NgModule({
  declarations: [ExcuseSubmitComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class ExcuseSubmitModule {}
