import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AdminSettingsPageComponent } from './admin-settings-page/admin-settings-page.component';
import { StartNewYearDialogComponent } from './start-new-year-dialog/start-new-year-dialog.component';
import { PromotionSummaryDialogComponent } from './promotion-summary-dialog/promotion-summary-dialog.component';

const routes: Routes = [
  { path: '', component: AdminSettingsPageComponent }
];

@NgModule({
  declarations: [
    AdminSettingsPageComponent,
    StartNewYearDialogComponent,
    PromotionSummaryDialogComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class AdminSettingsModule {}
