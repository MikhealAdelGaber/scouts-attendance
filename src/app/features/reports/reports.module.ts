import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AttendanceReportComponent } from './attendance-report/attendance-report.component';

const routes: Routes = [
  { path: '', redirectTo: 'attendance', pathMatch: 'full' },
  { path: 'attendance', component: AttendanceReportComponent }
];

@NgModule({
  declarations: [AttendanceReportComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class ReportsModule {}
