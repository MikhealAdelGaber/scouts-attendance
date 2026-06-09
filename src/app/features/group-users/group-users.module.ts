import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { GroupUserListComponent } from './group-user-list/group-user-list.component';
import { EditPermissionsDialogComponent } from './edit-permissions-dialog/edit-permissions-dialog.component';

@NgModule({
  declarations: [
    GroupUserListComponent,
    EditPermissionsDialogComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild([
  { path: '', component: GroupUserListComponent }
])
  ]
})
export class GroupUsersModule {}
