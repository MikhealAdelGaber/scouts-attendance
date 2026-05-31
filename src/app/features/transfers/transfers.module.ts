import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { TransferRequestsPageComponent } from './transfer-requests-page.component';
import { RejectTransferDialogComponent } from './reject-transfer-dialog.component';

const routes: Routes = [
  { path: '', component: TransferRequestsPageComponent }
];

@NgModule({
  declarations: [TransferRequestsPageComponent, RejectTransferDialogComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class TransfersModule {}
