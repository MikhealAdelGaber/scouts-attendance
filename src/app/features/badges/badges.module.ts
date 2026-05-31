import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { BadgesPageComponent } from './badges-page.component';

const routes: Routes = [
  { path: '', component: BadgesPageComponent }
];

@NgModule({
  declarations: [BadgesPageComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class BadgesModule {}
