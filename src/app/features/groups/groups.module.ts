import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { GroupListComponent } from './group-list/group-list.component';
import { GroupFormComponent } from './group-form/group-form.component';

@NgModule({
  declarations: [GroupListComponent, GroupFormComponent],
  imports: [SharedModule, RouterModule.forChild([
  { path: '', component: GroupListComponent },
  { path: 'new', component: GroupFormComponent },
  { path: ':id/edit', component: GroupFormComponent }
])]
})
export class GroupsModule {}
