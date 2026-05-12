import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from './material.module';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { PointsBadgeComponent } from './components/points-badge/points-badge.component';
import { ImportResultDialogComponent } from './components/import-result-dialog/import-result-dialog.component';
import { PassCountPipe } from './pipes/pass-count.pipe';

@NgModule({
  declarations: [
    ConfirmDialogComponent,
    LoadingSpinnerComponent,
    PointsBadgeComponent,
    ImportResultDialogComponent,
    PassCountPipe
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, MaterialModule],
  exports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterModule,
    MaterialModule, ConfirmDialogComponent, LoadingSpinnerComponent,
    PointsBadgeComponent, ImportResultDialogComponent, PassCountPipe
  ]
})
export class SharedModule {}
