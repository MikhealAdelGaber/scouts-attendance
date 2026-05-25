import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TripDto, CreateTripDto, UpdateTripDto,
  TripBookingDto, CreateBookingDto,
  TripAttendanceDto, SaveTripAttendanceDto
} from '../models/trip.model';

interface ApiResponse<T> { success: boolean; message?: string; data: T; }

@Injectable({ providedIn: 'root' })
export class TripService {
  private readonly base = `${environment.apiUrl}/trips`;

  constructor(private http: HttpClient) {}

  // ─── Trips ────────────────────────────────────────────────────────────────

  getAll(): Observable<TripDto[]> {
    return this.http.get<ApiResponse<TripDto[]>>(this.base)
      .pipe(map(r => r.data));
  }

  getById(id: string): Observable<TripDto> {
    return this.http.get<ApiResponse<TripDto>>(`${this.base}/${id}`)
      .pipe(map(r => r.data));
  }

  create(dto: CreateTripDto): Observable<TripDto> {
    return this.http.post<ApiResponse<TripDto>>(this.base, dto)
      .pipe(map(r => r.data));
  }

  update(id: string, dto: UpdateTripDto): Observable<TripDto> {
    return this.http.put<ApiResponse<TripDto>>(`${this.base}/${id}`, dto)
      .pipe(map(r => r.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`)
      .pipe(map(() => void 0));
  }

  // ─── Bookings ─────────────────────────────────────────────────────────────

  getBookings(tripId: string): Observable<TripBookingDto[]> {
    return this.http.get<ApiResponse<TripBookingDto[]>>(`${this.base}/${tripId}/bookings`)
      .pipe(map(r => r.data));
  }

  bookMember(tripId: string, dto: CreateBookingDto): Observable<TripBookingDto> {
    return this.http.post<ApiResponse<TripBookingDto>>(`${this.base}/${tripId}/bookings`, dto)
      .pipe(map(r => r.data));
  }

  cancelBooking(tripId: string, bookingId: string): Observable<TripBookingDto> {
    return this.http.delete<ApiResponse<TripBookingDto>>(`${this.base}/${tripId}/bookings/${bookingId}`)
      .pipe(map(r => r.data));
  }

  markPaid(tripId: string, bookingId: string): Observable<TripBookingDto> {
    return this.http.post<ApiResponse<TripBookingDto>>(
      `${this.base}/${tripId}/bookings/${bookingId}/mark-paid`, {}
    ).pipe(map(r => r.data));
  }

  // ─── Attendance ───────────────────────────────────────────────────────────

  getAttendance(tripId: string): Observable<TripAttendanceDto[]> {
    return this.http.get<ApiResponse<TripAttendanceDto[]>>(`${this.base}/${tripId}/attendance`)
      .pipe(map(r => r.data));
  }

  saveAttendance(tripId: string, dto: SaveTripAttendanceDto): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.base}/${tripId}/attendance`, dto)
      .pipe(map(() => void 0));
  }

  // ─── Export ───────────────────────────────────────────────────────────────

  exportExcel(tripId: string): Observable<Blob> {
    return this.http.get(`${this.base}/${tripId}/export/excel`, { responseType: 'blob' });
  }

  exportPdf(tripId: string): Observable<Blob> {
    return this.http.get(`${this.base}/${tripId}/export/pdf`, { responseType: 'blob' });
  }
}
