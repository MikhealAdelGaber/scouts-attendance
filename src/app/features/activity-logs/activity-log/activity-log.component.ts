import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ActivityLogService, ActivityLogDto, ActivityLogFilters } from '../../../core/services/activity-log.service';

@Component({
  selector: 'app-activity-log',
  templateUrl: './activity-log.component.html',
  styleUrls: ['./activity-log.component.scss']
})
export class ActivityLogComponent implements OnInit {
  logs: ActivityLogDto[] = [];
  totalCount = 0;
  page = 1;
  pageSize = 20;
  loading = false;
  exporting = false;

  actions: string[] = [];
  entityTypes: string[] = [];

  searchCtrl    = new FormControl('');
  actionCtrl    = new FormControl('');
  entityCtrl    = new FormControl('');
  fromCtrl      = new FormControl<Date | null>(null);
  toCtrl        = new FormControl<Date | null>(null);

  displayedColumns = ['createdAt', 'userName', 'action', 'entityType', 'entityName', 'details', 'ipAddress'];

  constructor(private svc: ActivityLogService) {}

  ngOnInit(): void {
    this.svc.getActions().subscribe(a => this.actions = a);
    this.svc.getEntityTypes().subscribe(e => this.entityTypes = e);

    this.searchCtrl.valueChanges.pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => { this.page = 1; this.load(); });

    this.load();
  }

  load(): void {
    this.loading = true;
    const filters: ActivityLogFilters = {
      page: this.page,
      pageSize: this.pageSize,
      search: this.searchCtrl.value || undefined,
      action: this.actionCtrl.value || undefined,
      entityType: this.entityCtrl.value || undefined,
      from: this.fromCtrl.value ? this.fromCtrl.value.toISOString() : undefined,
      to: this.toCtrl.value ? this.toCtrl.value.toISOString() : undefined,
    };

    this.svc.getLogs(filters).subscribe({
      next: res => {
        this.logs = res.items;
        this.totalCount = res.totalCount;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onPageChange(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.load();
  }

  onFilterChange(): void {
    this.page = 1;
    this.load();
  }

  clearFilters(): void {
    this.searchCtrl.setValue('');
    this.actionCtrl.setValue('');
    this.entityCtrl.setValue('');
    this.fromCtrl.setValue(null);
    this.toCtrl.setValue(null);
    this.page = 1;
    this.load();
  }

  getActionColor(action: string): 'primary' | 'warn' | 'accent' {
    if (action.startsWith('Deleted') || action === 'Failed Login') return 'warn';
    if (action.startsWith('Created')) return 'primary';
    return 'accent';
  }

  exportExcel(): void {
    this.exporting = true;
    const filters: ActivityLogFilters = {
      search: this.searchCtrl.value || undefined,
      action: this.actionCtrl.value || undefined,
      entityType: this.entityCtrl.value || undefined,
      from: this.fromCtrl.value ? this.fromCtrl.value.toISOString() : undefined,
      to: this.toCtrl.value ? this.toCtrl.value.toISOString() : undefined,
    };
    this.svc.exportExcel(filters).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ActivityLog-${new Date().toISOString().slice(0,10)}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        this.exporting = false;
      },
      error: () => this.exporting = false
    });
  }
}
