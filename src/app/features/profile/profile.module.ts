import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ProfilePageComponent } from './profile-page/profile-page.component';

@NgModule({
  declarations: [ProfilePageComponent],
  imports: [SharedModule, RouterModule.forChild([
  { path: '', component: ProfilePageComponent }
])]
})
export class ProfileModule {}
