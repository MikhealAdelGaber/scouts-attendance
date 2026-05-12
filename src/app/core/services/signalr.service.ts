import { Injectable, OnDestroy } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AttendanceUpdate {
  eventId: string;
  memberId: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class SignalRService implements OnDestroy {
  private hubConnection: HubConnection | null = null;
  private currentEventId: string | null = null;

  /** Emits whenever AttendanceUpdated is received from the hub */
  attendanceUpdated$ = new Subject<AttendanceUpdate>();

  private getToken(): string | null {
    const raw = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');
    if (!raw) return null;
    try { return JSON.parse(raw)?.token ?? null; } catch { return null; }
  }

  async joinEvent(eventId: string): Promise<void> {
    if (this.currentEventId === eventId && this.hubConnection) return;

    await this.leaveCurrentEvent();

    const token = this.getToken();
    const hubUrl = `${environment.apiUrl.replace('/api', '')}/hubs/attendance`;

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, { accessTokenFactory: () => token ?? '' })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    this.hubConnection.on('AttendanceUpdated', (update: AttendanceUpdate) => {
      this.attendanceUpdated$.next(update);
    });

    await this.hubConnection.start();
    await this.hubConnection.invoke('JoinEvent', eventId);
    this.currentEventId = eventId;
  }

  async leaveCurrentEvent(): Promise<void> {
    if (this.hubConnection && this.currentEventId) {
      try {
        await this.hubConnection.invoke('LeaveEvent', this.currentEventId);
        await this.hubConnection.stop();
      } catch { /* ignore */ }
      this.hubConnection = null;
      this.currentEventId = null;
    }
  }

  ngOnDestroy(): void {
    this.leaveCurrentEvent();
    this.attendanceUpdated$.complete();
  }
}
