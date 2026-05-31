export enum TransferRequestStatus {
  Pending   = 0,
  Approved  = 1,
  Rejected  = 2,
  Cancelled = 3
}

export interface TransferRequest {
  id:              string;
  memberId:        string;
  memberName:      string;
  fromGroupId:     string;
  fromGroupName:   string;
  toGroupId:       string;
  toGroupName:     string;
  requestedBy:     string;
  requestedAt:     string;
  status:          TransferRequestStatus;
  statusLabel:     string;
  reviewedBy?:     string;
  reviewedAt?:     string;
  rejectionReason?: string;
  notes?:          string;
}

export interface CreateTransferRequest {
  memberId:  string;
  toGroupId: string;
  notes?:    string;
}

export interface ReviewTransferRequest {
  rejectionReason?: string;
}

/** Immutable snapshot created when a transfer is approved. */
export interface MemberTransferArchive {
  id:                    string;
  memberId:              string;
  memberName:            string;
  fromGroupId:           string;
  fromGroupName:         string;
  toGroupId:             string;
  toGroupName:           string;
  transferDate:          string;
  totalPointsAtTransfer: number;
  totalAttendanceCount:  number;
  totalEventsAttended:   number;
  totalExcusesCount:     number;
  archivedAt:            string;
}
