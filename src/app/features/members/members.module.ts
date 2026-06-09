import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { MemberListComponent } from './member-list/member-list.component';
import { MemberDetailComponent } from './member-detail/member-detail.component';
import { MemberFormComponent } from './member-form/member-form.component';
import { MemberBadgesComponent } from './member-badges/member-badges.component';
import { AwardBadgeDialogComponent } from './award-badge-dialog/award-badge-dialog.component';
import { RequestTransferDialogComponent } from './request-transfer-dialog/request-transfer-dialog.component';
import { MemberTransferHistoryComponent } from './member-transfer-history/member-transfer-history.component';
import { MemberTransferArchiveComponent } from './member-transfer-archive/member-transfer-archive.component';
import { MemberProjectsComponent } from './member-projects/member-projects.component';
import { RoleGuard } from '../../core/guards/role.guard';
import { UserRole } from '../../core/models/user.model';

@NgModule({
  declarations: [MemberListComponent, MemberDetailComponent, MemberFormComponent,
                 MemberBadgesComponent, AwardBadgeDialogComponent,
                 RequestTransferDialogComponent, MemberTransferHistoryComponent,
                 MemberTransferArchiveComponent, MemberProjectsComponent],
  imports: [SharedModule, RouterModule.forChild([
  { path: '',       component: MemberListComponent },
  {
    path: 'new',
    component: MemberFormComponent,
    canActivate: [RoleGuard],
    data: { roles: [UserRole.SystemAdmin, UserRole.GroupLeader, UserRole.GroupLeaderAdmin] }
  },
  { path: ':id',    component: MemberDetailComponent },
  {
    path: ':id/edit',
    component: MemberFormComponent,
    canActivate: [RoleGuard],
    data: { roles: [UserRole.SystemAdmin, UserRole.GroupLeader, UserRole.GroupLeaderAdmin] }
  }
])]
})
export class MembersModule {}
