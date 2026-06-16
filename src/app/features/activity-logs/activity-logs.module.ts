import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ActivityLogComponent } from './activity-log/activity-log.component';
import { UserRole } from '../../core/models/user.model';
import { RoleGuard } from '../../core/guards/role.guard';

@NgModule({
  declarations: [ActivityLogComponent],
  imports: [SharedModule, RouterModule.forChild([
    {
      path: '',
      component: ActivityLogComponent,
      canActivate: [RoleGuard],
      data: { roles: [UserRole.SystemAdmin] }
    }
  ])]
})
export class ActivityLogsModule {}
