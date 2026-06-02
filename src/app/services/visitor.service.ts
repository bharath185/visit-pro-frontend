import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Visitor, Dashboard, Employee } from '../models/visitor.model';

@Injectable({ providedIn: 'root' })
export class VisitorService {
  private api = environment.apiUrl;
  private pub = environment.publicApiUrl;
  private master = environment.apiUrl.replace('/visitor', '/master');

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${this.api}/dashboard`);
  }

  getUserDashboard(empId: number): Observable<any> {
    return this.http.get<any>(`${this.api}/user-dashboard/${empId}`);
  }

  getTodayVisitors(): Observable<Visitor[]> {
    return this.http.get<Visitor[]>(`${this.api}/today`);
  }

  getAllVisitors(): Observable<Visitor[]> {
    return this.http.post<Visitor[]>(`${this.api}/list`, {});
  }

  getAllVisitorsByPlant(plantId: number): Observable<Visitor[]> {
    return this.http.post<Visitor[]>(`${this.api}/list/plant/${plantId}`, {});
  }

  getVisitorById(visitId: number): Observable<Visitor> {
    return this.http.post<Visitor>(`${this.api}/get-by-id`, { VisitId: visitId });
  }

  getByEmployee(empId: number): Observable<Visitor[]> {
    return this.http.post<Visitor[]>(`${this.api}/by-employee`, { EmpId: empId });
  }

  inviteVisit(data: Visitor): Observable<Visitor> {
    return this.http.post<Visitor>(`${this.api}/invite`, data);
  }

  acceptInvite(data: Visitor): Observable<Visitor> {
    return this.http.post<Visitor>(`${this.api}/accept-invite`, data);
  }

  directCheckIn(data: Visitor): Observable<Visitor> {
    return this.http.post<Visitor>(`${this.api}/direct-checkin`, data);
  }

  checkIn(visitId: number, data?: Visitor): Observable<Visitor> {
    const body = data || { VisitId: visitId } as Visitor;
    return this.http.post<Visitor>(`${this.api}/checkin`, body);
  }

  plantAdminCheckIn(data: Visitor): Observable<Visitor> {
    return this.http.post<Visitor>(`${this.api}/plantadmin-checkin`, data);
  }

  plantAdminCheckOut(data: Visitor): Observable<Visitor> {
    return this.http.post<Visitor>(`${this.api}/plantadmin-checkout`, data);
  }

  updateVisitorDetails(data: Visitor): Observable<Visitor> {
    return this.http.post<Visitor>(`${this.api}/update-details`, data);
  }

  checkOut(visitId: number): Observable<Visitor> {
    return this.http.post<Visitor>(`${this.api}/checkout`, { VisitId: visitId });
  }

  cancelInvite(visitId: number): Observable<Visitor> {
    return this.http.post<Visitor>(`${this.api}/cancel`, { VisitId: visitId });
  }

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.api}/employees`);
  }

  // Cascading dropdown APIs
  getDepartments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.master}/departments`);
  }

  getDepartmentNames(): Observable<string[]> {
    return this.http.get<string[]>(`${this.master}/dept-names`);
  }

  getDepartmentNamesByCompany(compId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.master}/dept-names-by-company?compId=${compId}`);
  }

  getDesignationList(deptId?: number): Observable<any[]> {
    const url = deptId ? `${this.master}/designation-list?deptId=${deptId}` : `${this.master}/designation-list`;
    return this.http.get<any[]>(url);
  }

  getFilteredEmployees(compId?: number, deptName?: string, designationId?: number): Observable<any[]> {
    let url = `${this.master}/employees-filter?`;
    if (compId) url += `compId=${compId}&`;
    if (deptName) url += `deptName=${encodeURIComponent(deptName)}&`;
    if (designationId) url += `designationId=${designationId}&`;
    return this.http.get<any[]>(url);
  }

  getCompanies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.master}/companies`);
  }

  // Employee CRUD
  getAllEmployees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.master}/employees-all`);
  }

  saveEmployee(data: any): Observable<any> {
    return this.http.post<any>(`${this.master}/employees`, data);
  }

  deleteEmployee(id: number): Observable<any> {
    return this.http.delete<any>(`${this.master}/employees/${id}`);
  }

  // New backend features
  getAllInvites(): Observable<any> {
    return this.http.post<any>(`${this.api}/all-invites`, {});
  }

  visitFilter(filter: any): Observable<Visitor[]> {
    return this.http.post<Visitor[]>(`${this.api}/visit-filter`, filter);
  }

  exportCsv(filter: any): Observable<Blob> {
    return this.http.post(`${this.api}/export-csv`, filter, { responseType: 'blob' });
  }

  getHrDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${this.api}/hr-dashboard`);
  }

  visitorCheckIn(data: Visitor): Observable<Visitor> {
    return this.http.post<Visitor>(`${this.api}/visitor-checkin`, data);
  }

  visitorCheckOut(data: Visitor): Observable<Visitor> {
    return this.http.post<Visitor>(`${this.api}/visitor-checkout`, data);
  }

  visitorDirectCheckIn(data: Visitor): Observable<Visitor> {
    return this.http.post<Visitor>(`${this.api}/visitor-direct-checkin`, data);
  }

  uploadPhoto(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.api}/upload-photo`, formData);
  }

  exportExcel(filter: any): Observable<Blob> {
    return this.http.post(`${this.api}/export-excel`, filter, { responseType: 'blob' });
  }

  expireInvites(): Observable<any> {
    return this.http.post(`${this.api}/expire-invites`, {});
  }

  // Direct check-in approval APIs
  approveDirectCheckIn(visitId: number, empId: number): Observable<Visitor> {
    return this.http.post<Visitor>(`${this.api}/approve-direct-checkin`, { VisitId: visitId, EmpId: empId });
  }

  rejectDirectCheckIn(visitId: number, empId: number): Observable<Visitor> {
    return this.http.post<Visitor>(`${this.api}/reject-direct-checkin`, { VisitId: visitId, EmpId: empId });
  }

  getDirectCheckInsByContact(empId: number): Observable<Visitor[]> {
    return this.http.post<Visitor[]>(`${this.api}/direct-checkins-by-contact`, { EmpId: empId });
  }

  getDirectCheckInsByContactAndPlant(empId: number, plantId: number): Observable<Visitor[]> {
    return this.http.post<Visitor[]>(`${this.api}/direct-checkins-by-contact/plant/${plantId}`, { EmpId: empId });
  }

  plantAdminCheckInDirect(data: Visitor): Observable<Visitor> {
    return this.http.post<Visitor>(`${this.api}/plantadmin-checkin-direct`, data);
  }

  plantAdminCheckOutDirect(data: Visitor): Observable<Visitor> {
    return this.http.post<Visitor>(`${this.api}/plantadmin-checkout-direct`, data);
  }

  // Public endpoints
  verifyOTP(otp: string): Observable<Visitor> {
    return this.http.post<Visitor>(`${this.pub}/verify-otp`, { OTP: otp });
  }

  verifyCheckInOTP(otp: string): Observable<Visitor> {
    return this.http.post<Visitor>(`${this.pub}/verify-checkin-otp`, { OTP: otp });
  }

  publicAcceptInvite(data: Visitor): Observable<Visitor> {
    return this.http.post<Visitor>(`${this.pub}/accept-invite`, data);
  }

  selfCheckInVerify(otp: string): Observable<Visitor> {
    return this.http.post<Visitor>(`${this.pub}/self-checkin-verify`, { OTP: otp });
  }

  regenerateCheckoutOtp(visitId: number): Observable<Visitor> {
    return this.http.post<Visitor>(`${this.api}/regenerate-checkout-otp`, { VisitId: visitId });
  }

  getPendingApprovals(empId: number): Observable<Visitor[]> {
    return this.http.post<Visitor[]>(`${this.api}/pending-approvals`, { EmpId: empId });
  }

  approvePendingInvite(visitId: number): Observable<Visitor> {
    return this.http.post<Visitor>(`${this.api}/approve-pending/${visitId}`, {});
  }

  rejectPendingInvite(visitId: number): Observable<Visitor> {
    return this.http.post<Visitor>(`${this.api}/reject-pending/${visitId}`, {});
  }
}
