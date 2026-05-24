import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { EventListComponent } from './event-list/event-list.component';
import { EventFormComponent } from './event-form/event-form.component';
import { RoleGuard } from '../../core/guards/role.guard';
import { UserRole } from '../../core/models/user.model';

const ADMIN_ROLES = [UserRole.SystemAdmin, UserRole.GroupLeader];

const routes: Routes = [
  { path: '', component: EventListComponent },
  {
    path: 'new',
    component: EventFormComponent,
    canActivate: [RoleGuard],
    data: { roles: ADMIN_ROLES }
  },
  {
    path: ':id/edit',
    component: EventFormComponent,
    canActivate: [RoleGuard],
    data: { roles: ADMIN_ROLES }
  }
];

@NgModule({
  declarations: [EventListComponent, EventFormComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class EventsModule {}
