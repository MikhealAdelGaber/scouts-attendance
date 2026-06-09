import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AdminSettingsPageComponent } from './admin-settings-page/admin-settings-page.component';
import { StartNewYearDialogComponent } from './start-new-year-dialog/start-new-year-dialog.component';
import { PromotionSummaryDialogComponent } from './promotion-summary-dialog/promotion-summary-dialog.component';
import { AutoPromoteDialogComponent } from './auto-promote-dialog/auto-promote-dialog.component';

@NgModule({
  declarations: [
    AdminSettingsPageComponent,
    StartNewYearDialogComponent,
    PromotionSummaryDialogComponent,
    AutoPromoteDialogComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild([
  { path: '', component: AdminSettingsPageComponent }
])
  ]
})
export class AdminSettingsModule {}
