import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ImportMembersResult } from '../../../core/models/member.model';

@Component({
  selector: 'app-import-result-dialog',
  templateUrl: './import-result-dialog.component.html'
})
export class ImportResultDialogComponent {
  displayedColumns = ['row', 'name', 'reason'];

  constructor(
    public dialogRef: MatDialogRef<ImportResultDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImportMembersResult
  ) {}
}
