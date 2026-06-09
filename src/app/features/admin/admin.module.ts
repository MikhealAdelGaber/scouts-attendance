import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { UserListComponent } from './user-list/user-list.component';
import { UserFormComponent } from './user-form/user-form.component';
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component';
@NgModule({
  declarations: [UserListComponent, UserFormComponent, ChangePasswordDialogComponent],
  imports: [SharedModule, RouterModule.forChild([
  { path: '',          component: UserListComponent },
  { path: 'new',       component: UserFormComponent },
  { path: ':id/edit',  component: UserFormComponent }
])]
})
export class AdminModule {}
