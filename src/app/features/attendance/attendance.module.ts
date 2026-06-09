import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { MarkAttendanceComponent } from './mark-attendance/mark-attendance.component';
import { QrScannerComponent } from './qr-scanner/qr-scanner.component';

@NgModule({
  declarations: [MarkAttendanceComponent, QrScannerComponent],
  imports: [SharedModule, RouterModule.forChild([
  { path: '', component: MarkAttendanceComponent },
  { path: 'qr', component: QrScannerComponent }
])]
})
export class AttendanceModule {}
