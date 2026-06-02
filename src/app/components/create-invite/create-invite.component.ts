import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { MasterService } from '../../services/master.service';
import { VisitorService } from '../../services/visitor.service';

const API = 'http://192.168.2.45:8081/api';

@Component({
  selector: 'app-create-invite',
  templateUrl: './create-invite.component.html'
})
export class CreateInviteComponent implements OnInit {
  user: any = null;
  loading = false;
  autoFillingMobile = false;

  // Form model
  model: any = {
    EmpId: 0, IsActive: true, Name: '', PMail: '', Mobile: '', Company: '',
    Designation: '', Purpose: '', WName: '', WEmail: '', WMobile: '', WhomtoMeet: null, Date: null, Time: null
  };

  myInvites: any[] = [];
  categories: any[] = [];
  visitPurposes: any[] = [];

  constructor(
    private http: HttpClient,
    public auth: AuthService,
    private master: MasterService,
    private notification: NzNotificationService,
    private svc: VisitorService
  ) {
    this.user = auth.currentUser;
  }

  ngOnInit(): void {
    this.model.EmpId = this.user?.EmpId || 0;
    const fullName = [this.user?.FirstName, this.user?.MiddleName, this.user?.LastName].filter(Boolean).join(' ');
    this.model.WName = fullName;
    this.model.WEmail = this.user?.EmailId || '';
    this.model.WMobile = this.user?.MobileNo || '';
    this.model.WhomtoMeet = this.user?.EmpId || 0;
    this.loadMyInvites();
    this.master.getCategories().subscribe(c => this.categories = c);
    this.master.getVisitPurposes().subscribe(v => this.visitPurposes = v);
  }

  loadMyInvites(): void {
    if (!this.user?.EmpId) return;
    this.http.post<any>(API + '/visitor/by-employee', { EmpId: this.user.EmpId }).subscribe({
      next: r => this.myInvites = Array.isArray(r) ? r : (r.visitorList || []),
      error: () => {}
    });
  }

  onMobileBlur(): void {
    const mobile = this.model.Mobile;
    if (!mobile || this.autoFillingMobile) return;
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) return;

    this.autoFillingMobile = true;
    this.svc.getVisitorByMobile(mobile).subscribe({
      next: (existing) => {
        this.autoFillingMobile = false;
        if (existing && existing.VisitId) {
          const m = this.model;
          if (!m.Name) m.Name = existing.Name || '';
          if (!m.Designation) m.Designation = existing.Designation || '';
          if (!m.Company) m.Company = existing.Company || '';
          if (!m.Purpose) m.Purpose = existing.Purpose || '';
          if (!m.PMail) m.PMail = existing.PMail || '';
          if (!m.Category) m.Category = existing.Category || '';
        }
      },
      error: () => { this.autoFillingMobile = false; }
    });
  }

  submit(): void {
    if (!this.model.Name || !this.model.PMail) {
      this.notification.error('Error', 'Name and Email are required');
      return;
    }
    const mobileRegex = /^[6-9]\d{9}$/;
    if (this.model.Mobile && !mobileRegex.test(this.model.Mobile)) {
      this.notification.error('Error', 'Enter a valid 10-digit mobile number'); return;
    }
    this.loading = true;
    this.model.EmpId = this.user?.EmpId || 0;

    // Format Date as yyyy-MM-dd
    const body: any = { ...this.model };
    if (body.Date instanceof Date) {
      const d = body.Date;
      const y = d.getFullYear();
      const m = ('0'+(d.getMonth()+1)).slice(-2);
      const day = ('0'+d.getDate()).slice(-2);
      body.Date = `${y}-${m}-${day}`;
    }
    // Format Time as HH:mm
    if (body.Time instanceof Date) {
      const t = body.Time;
      body.Time = ('0'+t.getHours()).slice(-2) + ':' + ('0'+t.getMinutes()).slice(-2);
    }

    this.http.post<any>(API + '/visitor/invite', body).subscribe({
      next: () => {
        this.loading = false;
        this.notification.success('Success', 'Invite sent successfully');
        this.model = { EmpId: this.user?.EmpId || 0, IsActive: true, WName: this.model.WName, WEmail: this.model.WEmail, WMobile: this.model.WMobile, WhomtoMeet: this.user?.EmpId || 0, Date: null, Time: null };
        this.loadMyInvites();
      },
      error: () => { this.loading = false; this.notification.error('Error', 'Failed to send invite'); }
    });
  }

  disabledDate = (current: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return current < today;
  };

  getStatusColor(s: string): string {
    const m: any = { 'Invited': 'blue', 'Invite Accepted': 'green', 'Checked In': 'orange', 'Checked Out': 'cyan', 'Cancelled': 'red', 'Expired': 'red' };
    return m[s] || 'default';
  }
}
