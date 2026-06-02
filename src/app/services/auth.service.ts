import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginUser {
  EmpId: number;
  EmpCode: string;
  FirstName: string;
  MiddleName: string;
  LastName: string;
  FullName: string;
  EmailId: string;
  MobileNo: string;
  DesignationId: number;
  DesignationName: string;
  DeptName: string;
  Photo: string;
  Token: string;
  Success: boolean;
  Msg: string;
  IsAdmin?: boolean;
  IsPlantAdmin?: boolean;
  IsSecurity?: boolean;
  PlantId?: number | null;
  CompId?: number | null;
  PlantName?: string;
  ReportId?: number | null;
  MustChangePassword?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiUrl.replace('/visitor', '/auth');
  private currentUserSubject = new BehaviorSubject<LoginUser | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private _pendingTempPassword: string | null = null;

  constructor(private http: HttpClient) {
    const stored = localStorage.getItem('visitor_user');
    if (stored) {
      try { this.currentUserSubject.next(JSON.parse(stored)); } catch {}
    }
  }

  login(username: string, password: string): Observable<LoginUser> {
    return this.http.post<LoginUser>(`${this.api}/login`, { Username: username, Password: password })
      .pipe(tap(user => {
        if (user.Success) {
          localStorage.setItem('visitor_user', JSON.stringify(user));
          localStorage.setItem('visitor_token', user.Token);
          this.currentUserSubject.next(user);
        }
      }));
  }

  changePassword(oldPassword: string, newPassword: string): Observable<LoginUser> {
    return this.http.post<LoginUser>(`${this.api}/change-password`,
      { oldPassword, newPassword },
      { headers: { 'Authorization': this.token } }
    );
  }

  logout(): void {
    localStorage.removeItem('visitor_user');
    localStorage.removeItem('visitor_token');
    this.currentUserSubject.next(null);
  }

  get currentUser(): LoginUser | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return this.currentUserSubject.value?.Success === true;
  }

  get isAdmin(): boolean {
    return this.currentUser?.IsAdmin === true;
  }

  get token(): string {
    return localStorage.getItem('visitor_token') || '';
  }

  /** SuperAdmin: IsAdmin === true AND CompId == null (no company scope) */
  isSuperAdmin(): boolean {
    const u = this.currentUser;
    return u?.Success === true && u.IsAdmin === true && (u.CompId == null || u.CompId === 0);
  }

  /** PlantAdmin: IsPlantAdmin === true */
  isPlantAdmin(): boolean {
    return this.currentUser?.IsPlantAdmin === true;
  }

  /** Security: IsSecurity === true */
  isSecurity(): boolean {
    return this.currentUser?.IsSecurity === true;
  }

  /** Regular user: authenticated but not superadmin, plantadmin, or security */
  isRegularUser(): boolean {
    return this.isLoggedIn && !this.isSuperAdmin() && !this.isPlantAdmin() && !this.isSecurity();
  }

  getPlantId(): number | null {
    return this.currentUser?.PlantId ?? null;
  }

  getCompId(): number | null {
    return this.currentUser?.CompId ?? null;
  }

  getUserRole(): 'superadmin' | 'plantadmin' | 'security' | 'user' | null {
    if (!this.isLoggedIn) return null;
    if (this.isSuperAdmin()) return 'superadmin';
    if (this.isPlantAdmin()) return 'plantadmin';
    if (this.isSecurity()) return 'security';
    return 'user';
  }

  setPendingTempPassword(password: string): void {
    this._pendingTempPassword = password;
  }

  getPendingTempPassword(): string | null {
    return this._pendingTempPassword;
  }

  clearPendingTempPassword(): void {
    this._pendingTempPassword = null;
  }

  forgotPassword(userName: string, emailId: string): Observable<any> {
    return this.http.post<any>(`${this.api}/forgot-password`, { userName, emailId });
  }

  resetPassword(otp: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.api}/reset-password`, { OTP: otp, NewPassword: newPassword });
  }
}
