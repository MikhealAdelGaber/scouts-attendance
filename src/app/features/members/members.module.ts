import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { MemberListComponent } from './member-list/member-list.component';
import { MemberDetailComponent } from './member-detail/member-detail.component';
import { MemberFormComponent } from './member-form/member-form.component';
import { RoleGuard } from '../../core/guards/role.guard';
import { UserRole } from '../../core/models/user.model';

const ADMIN_ROLES = [UserRole.SystemAdmin, UserRole.GroupLeader];

const routes: Routes = [
  { path: '',       component: MemberListComponent },
  {
    path: 'new',
    component: MemberFormComponent,
    canActivate: [RoleGuard],
    data: { roles: ADMIN_ROLES }
  },
  { path: ':id',    component: MemberDetailComponent },
  {
    path: ':id/edit',
    component: MemberFormComponent,
    canActivate: [RoleGuard],
    data: { roles: ADMIN_ROLES }
  }
];

@NgModule({
  declarations: [MemberListComponent, MemberDetailComponent, MemberFormComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class MembersModule {}
