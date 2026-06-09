import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { GroupUserListComponent } from './group-user-list/group-user-list.component';
import { EditPermissionsDialogComponent } from './edit-permissions-dialog/edit-permissions-dialog.component';

const routes: Routes = [
  { path: '', component: GroupUserListComponent }
];

@NgModule({
  declarations: [
    GroupUserListComponent,
    EditPermissionsDialogComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class GroupUsersModule {}
