import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { BadgesPageComponent } from './badges-page.component';

@NgModule({
  declarations: [BadgesPageComponent],
  imports: [SharedModule, RouterModule.forChild([
  { path: '', component: BadgesPageComponent }
])]
})
export class BadgesModule {}
