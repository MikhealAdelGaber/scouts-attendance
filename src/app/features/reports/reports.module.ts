import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AttendanceReportComponent } from './attendance-report/attendance-report.component';

@NgModule({
  declarations: [AttendanceReportComponent],
  imports: [SharedModule, RouterModule.forChild([
  { path: '', redirectTo: 'attendance', pathMatch: 'full' },
  { path: 'attendance', component: AttendanceReportComponent }
])]
})
export class ReportsModule {}
