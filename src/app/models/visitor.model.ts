export interface Visitor {
  VisitId?: number;
  RegNo?: string;
  QR?: string;
  Name?: string;
  Designation?: string;
  Company?: string;
  Purpose?: string;
  PMail?: string;
  OMail?: string;
  Mobile?: string;
  AMobile?: string;
  Photo?: string;
  Category?: string;
  CompId?: string;
  CompName?: string;
  WhomtoMeet?: number;
  WName?: string;
  WEmpCode?: string;
  WEmail?: string;
  WMobile?: string;
  Date?: string;
  Time?: string;
  Invited?: boolean;
  Accept?: boolean;
  Approved?: boolean;
  Expired?: boolean;
  Accessories?: string;
  DirectCheckIn?: boolean;
  CheckIn?: string;
  CheckOut?: string;
  IdCard?: string;
  VisitorCheckIn?: boolean;
  VisitorCheckOut?: boolean;
  CreatedBy?: number;
  CreatedDate?: string;
  LastUpdatedBy?: number;
  LastUpdatedDate?: string;
  IsActive?: boolean;
  IsUpdated?: boolean;
  IsDeleted?: boolean;
  EmpId?: number;
  EmpCode?: string;
  InviteCode?: string;
  Status?: string;
  Msg?: string;
  OTP?: string;
  CheckInCode?: string;
  CheckoutCode?: string;
}

export interface Dashboard {
  TotalVisitorsToday: number;
  TotalCheckIns: number;
  TotalCheckOuts: number;
  TotalInvited: number;
  TotalPending: number;
}

export interface Employee {
  Id: number;
  Name: string;
  Code: string;
}
