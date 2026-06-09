import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { TransferRequestsPageComponent } from './transfer-requests-page.component';
import { RejectTransferDialogComponent } from './reject-transfer-dialog.component';

@NgModule({
  declarations: [TransferRequestsPageComponent, RejectTransferDialogComponent],
  imports: [SharedModule, RouterModule.forChild([
  { path: '', component: TransferRequestsPageComponent }
])]
})
export class TransfersModule {}
