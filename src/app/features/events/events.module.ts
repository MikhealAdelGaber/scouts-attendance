import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { EventListComponent } from './event-list/event-list.component';
import { EventFormComponent } from './event-form/event-form.component';
import { RoleGuard } from '../../core/guards/role.guard';
import { UserRole } from '../../core/models/user.model';

@NgModule({
  declarations: [EventListComponent, EventFormComponent],
  imports: [SharedModule, RouterModule.forChild([
  { path: '', component: EventListComponent },
  {
    path: 'new',
    component: EventFormComponent,
    canActivate: [RoleGuard],
    data: { roles: [UserRole.SystemAdmin, UserRole.GroupLeader, UserRole.GroupLeaderAdmin] }
  },
  {
    path: ':id/edit',
    component: EventFormComponent,
    canActivate: [RoleGuard],
    data: { roles: [UserRole.SystemAdmin, UserRole.GroupLeader, UserRole.GroupLeaderAdmin] }
  }
])]
})
export class EventsModule {}
