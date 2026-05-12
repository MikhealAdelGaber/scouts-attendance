import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { MarkAttendanceComponent } from './mark-attendance/mark-attendance.component';
import { QrScannerComponent } from './qr-scanner/qr-scanner.component';

const routes: Routes = [
  { path: '', component: MarkAttendanceComponent },
  { path: 'qr', component: QrScannerComponent }
];

@NgModule({
  declarations: [MarkAttendanceComponent, QrScannerComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class AttendanceModule {}
