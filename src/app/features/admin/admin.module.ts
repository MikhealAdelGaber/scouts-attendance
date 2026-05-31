import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { UserListComponent } from './user-list/user-list.component';
import { UserFormComponent } from './user-form/user-form.component';
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component';
const routes: Routes = [
  { path: '',          component: UserListComponent },
  { path: 'new',       component: UserFormComponent },
  { path: ':id/edit',  component: UserFormComponent }
];

@NgModule({
  declarations: [UserListComponent, UserFormComponent, ChangePasswordDialogComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class AdminModule {}
