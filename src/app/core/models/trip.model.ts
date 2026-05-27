export enum TripStatus {
  Open      = 0,
  Full      = 1,
  Cancelled = 2
}

export enum BookingStatus {
  Confirmed = 0,
  Waiting   = 1
}

export interface TripDto {
  id:               string;
  name:             string;
  description:      string;
  location:         string;
  tripDate:         string;
  price:            number;
  siblingPrice:     number;
  maxCapacity:      number | null;
  confirmedCount:   number;
  waitingCount:     number;
  hasPoints:        boolean;
  pointValue:       number | null;
  status:           TripStatus;
  groupId:          string;
  createdBy:        string;
  createdAt:        string;
  allowInstallments: boolean;
}

export interface CreateTripDto {
  name:             string;
  description:      string;
  location:         string;
  tripDate:         string;
  price:            number;
  siblingPrice:     number;
  maxCapacity?:     number | null;
  hasPoints:        boolean;
  pointValue?:      number | null;
  allowInstallments: boolean;
  /** SystemAdmin only: the group this trip belongs to. */
  groupId?:         string | null;
}

export interface UpdateTripDto {
  name:             string;
  description:      string;
  location:         string;
  tripDate:         string;
  price:            number;
  siblingPrice:     number;
  maxCapacity?:     number | null;
  hasPoints:        boolean;
  pointValue?:      number | null;
  status:           TripStatus;
  allowInstallments: boolean;
  /** SystemAdmin only: re-assign to a different group. */
  groupId?:         string | null;
}

export interface BookingPaymentDto {
  id:        string;
  bookingId: string;
  amountPaid: number;
  paidAt:    string;
  notes:     string;
}

export interface AddPaymentDto {
  amountPaid: number;
  notes:      string;
}

export interface TripBookingDto {
  id:               string;
  tripId:           string;
  memberId:         string;
  memberName:       string;
  troopName:        string;
  memberCustomId:   number;
  bookingStatus:    BookingStatus;
  statusName:       string;
  isSibling:        boolean;
  amountDue:        number;
  isPaid:           boolean;
  paidAt:           string | null;
  notes:            string;
  createdAt:        string;
  allowInstallments: boolean;
  totalPaid:        number;
  payments:         BookingPaymentDto[];
}

export interface CreateBookingDto {
  memberId:  string;
  isSibling: boolean;
  notes:     string;
}

export interface TripAttendanceDto {
  memberId:    string;
  memberName:  string;
  troopName:   string;
  status:      number;   // 0=Present,1=Absent,2=Late,3=Excused
  notes:       string;
}

export interface TripAttendanceEntryDto {
  memberId: string;
  status:   number;
  notes:    string;
}

export interface SaveTripAttendanceDto {
  records: TripAttendanceEntryDto[];
}
