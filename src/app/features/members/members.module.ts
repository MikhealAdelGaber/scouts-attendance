import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { MemberListComponent } from './member-list/member-list.component';
import { MemberDetailComponent } from './member-detail/member-detail.component';
import { MemberFormComponent } from './member-form/member-form.component';

const routes: Routes = [
  { path: '', component: MemberListComponent },
  { path: 'new', component: MemberFormComponent },
  { path: ':id', component: MemberDetailComponent },
  { path: ':id/edit', component: MemberFormComponent }
];

@NgModule({
  declarations: [MemberListComponent, MemberDetailComponent, MemberFormComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class MembersModule {}
