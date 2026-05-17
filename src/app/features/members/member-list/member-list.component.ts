import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { MemberService } from '../../../core/services/member.service';
import { TroopService } from '../../../core/services/troop.service';
import { ExportService } from '../../../core/services/export.service';
import { AuthService } from '../../../core/services/auth.service';
import { Member } from '../../../core/models/member.model';
import { Troop } from '../../../core/models/troop.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ImportResultDialogComponent } from '../../../shared/components/import-result-dialog/import-result-dialog.component';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss']
})
export class MemberListComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  members: Member[] = [];
  troops: Troop[] = [];
  loading     = false;
  exporting   = false;
  exportingQr = false;
  importing   = false;
  totalCount = 0;
  page = 1;
  pageSize = 20;

  // Special sentinel value used in the troop dropdown to select "Unassigned" members
  readonly UNASSIGNED = '__unassigned__';

  // Filter state
  search = '';
  selectedTroopId = '';
  selectedAcademicYear = '';
  selectedRegion = '';
  selectedNeckerchief: boolean | null = null;
  filtersExpanded = false;

  /** True when the troop dropdown is set to the "Unassigned" option. */
  get showUnassigned(): boolean { return this.selectedTroopId === this.UNASSIGNED; }

  readonly academicYears = [
    'Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6',
    'Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'
  ];

  displayedColumns = ['customId', 'fullName', 'troop', 'region', 'academicYear', 'neckerchief', 'phone', 'totalPoints', 'actions'];

  private searchSubject = new Subject<string>();
  private filterSubject = new Subject<void>();

  get hasActiveFilters(): boolean {
    return !!(this.selectedTroopId || this.selectedAcademicYear ||
              this.selectedRegion  || this.selectedNeckerchief !== null);
  }

  constructor(
    private memberService: MemberService,
    private troopService: TroopService,
    private exportService: ExportService,
    public auth: AuthService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.troopService.getAll().subscribe(t => this.troops = t);
    this.load();

    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => { this.page = 1; this.load(); });

    this.filterSubject.pipe(debounceTime(200))
      .subscribe(() => { this.page = 1; this.load(); });
  }

  load(): void {
    this.loading = true;
    this.memberService.getAll({
      // When the "Unassigned" option is selected in the troop dropdown, pass
      // unassigned=true and omit troopId so the API returns only members with
      // TroopId = null.  Otherwise pass the selected troop (if any).
      troopId:        this.showUnassigned ? undefined : (this.selectedTroopId || undefined),
      page:           this.page,
      pageSize:       this.pageSize,
      search:         this.search               || undefined,
      academicYear:   this.selectedAcademicYear || undefined,
      region:         this.selectedRegion       || undefined,
      hasNeckerchief: this.selectedNeckerchief  ?? undefined,
      unassigned:     this.showUnassigned       || undefined
    }).subscribe({
      next: r => { this.members = r.items; this.totalCount = r.totalCount; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onSearch(value: string): void { this.search = value; this.searchSubject.next(value); }
  onPage(e: PageEvent): void { this.page = e.pageIndex + 1; this.pageSize = e.pageSize; this.load(); }
  onFilterChange(): void { this.filterSubject.next(); }

  clearFilters(): void {
    this.selectedTroopId      = '';   // also resets showUnassigned (it's a getter)
    this.selectedAcademicYear = '';
    this.selectedRegion       = '';
    this.selectedNeckerchief  = null;
    this.search               = '';
    this.page = 1;
    this.load();
  }

  viewQr(member: Member): void {
    this.memberService.getQrCodeImage(member.id).subscribe(blob => {
      window.open(URL.createObjectURL(blob), '_blank');
    });
  }

  exportExcel(): void {
    this.exporting = true;
    this.exportService.downloadExcel('members/excel', { troopId: this.selectedTroopId || undefined })
      .subscribe({ next: () => { this.exporting = false; }, error: () => { this.exporting = false; } });
  }

  exportQrPdf(): void {
    this.exportingQr = true;
    this.memberService.exportQrPdf().subscribe({
      next: blob => {
        // Derive filename from Content-Disposition if available, else fall back
        const date  = new Date().toISOString().slice(0, 10);
        const url   = URL.createObjectURL(blob);
        const a     = document.createElement('a');
        a.href      = url;
        a.download  = `QR-Codes-${date}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.exportingQr = false;
      },
      error: () => {
        this.snack.open('Failed to generate QR PDF — please try again.', 'Close', { duration: 5000 });
        this.exportingQr = false;
      }
    });
  }

  downloadTemplate(): void {
    this.memberService.downloadImportTemplate().subscribe(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'members_import_template.xlsx';
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }

  openImportPicker(): void {
    // Resolve the troop that will receive the imported members.
    // "__unassigned__" is a UI sentinel and is NOT a valid troop ID — treat it as empty.
    const effectiveFilter = this.showUnassigned ? '' : (this.selectedTroopId || '');
    const troopId = (this.auth.currentUser?.troopId ?? effectiveFilter) || '';
    if (!troopId) {
      // GroupLeaders / Admins must pick a troop first
      this.snack.open(
        'Please select a troop from the Filters panel first, then click Import.',
        'Close',
        { duration: 6000 }
      );
      this.filtersExpanded = true;   // open the filter panel so they can pick a troop
      return;
    }
    this.fileInput.nativeElement.value = '';
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;

    // 5 MB guard
    if (file.size > 5 * 1024 * 1024) {
      this.snack.open('File is too large (max 5 MB)', 'Close', { duration: 4000 });
      return;
    }

    this.importing = true;
    const troopId = (this.auth.currentUser?.troopId ?? this.selectedTroopId) || undefined;
    this.memberService.importMembers(file, troopId).subscribe({
      next: result => {
        this.importing = false;
        this.dialog.open(ImportResultDialogComponent, {
          data: result,
          maxWidth: '720px',
          width: '90vw'
        }).afterClosed().subscribe(() => this.load());
      },
      error: (err) => {
        this.importing = false;
        // Show the actual error message from the API if available
        const msg: string =
          err?.error?.message ||
          err?.error?.title ||
          'Import failed — check file format and try again.';
        this.snack.open(msg, 'Close', { duration: 7000 });
      }
    });
  }

  delete(member: Member): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Member', message: `Delete ${member.fullName}? This cannot be undone.`, confirmText: 'Delete' }
    }).afterClosed().subscribe(ok => {
      if (!ok) return;
      this.memberService.delete(member.id).subscribe(() => {
        this.snack.open('Member deleted', 'Close', { duration: 3000 });
        this.load();
      });
    });
  }
}
