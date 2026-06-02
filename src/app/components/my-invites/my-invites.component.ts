import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { VisitorService } from '../../services/visitor.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';

const API = 'http://192.168.2.45:8081/api';

@Component({
  selector: 'app-my-invites',
  templateUrl: './my-invites.component.html'
})
export class MyInvitesComponent implements OnInit {
  user: any = null;
  invites: any[] = [];
  filtered: any[] = [];
  directCheckins: any[] = [];
  searchTerm = '';
  loading = false;
  approving = false;

  constructor(private http: HttpClient, public auth: AuthService, private svc: VisitorService,
    private notification: NzNotificationService, private modal: NzModalService) {
    this.user = auth.currentUser;
  }

  ngOnInit(): void {
    this.loadInvites();
  }

  loadInvites(): void {
    if (!this.user?.EmpId) return;
    this.loading = true;
    // Load both created invites AND direct check-ins where employee is the contact
    this.http.post<any>(API + '/visitor/by-employee', { EmpId: this.user.EmpId }).subscribe({
      next: r => {
        const created = (Array.isArray(r) ? r : (r.visitorList || []));
        // Load direct check-ins where this employee is the contact person
        this.svc.getDirectCheckInsByContact(this.user.EmpId).subscribe(directList => {
          this.directCheckins = Array.isArray(directList) ? directList : [];
          // Merge both lists, avoid duplicates
          const existingIds = new Set(created.map((v: any) => v.VisitId));
          const merged = [...created];
          for (const d of this.directCheckins) {
            if (!existingIds.has(d.VisitId)) {
              merged.push(d);
            }
          }
          this.invites = merged.sort((a: any, b: any) => new Date(b.CreatedDate || b.Date).getTime() - new Date(a.CreatedDate || a.Date).getTime());
          this.filtered = [...this.invites];
          this.loading = false;
        });
      },
      error: () => { this.loading = false; }
    });
  }

  searchChange(val: string): void {
    if (!val) { this.filtered = [...this.invites]; return; }
    const s = val.toLowerCase();
    this.filtered = this.invites.filter(v =>
      (v.Name || '').toLowerCase().includes(s) || (v.Company || '').toLowerCase().includes(s)
    );
  }

  approveVisit(visitId: number): void {
    this.approving = true;
    this.svc.approveDirectCheckIn(visitId, this.user.EmpId).subscribe({
      next: (r) => {
        this.approving = false;
        this.notification.success('Approved', r.Msg || 'Visit approved successfully');
        this.loadInvites();
      },
      error: () => { this.approving = false; this.notification.error('Error', 'Failed to approve'); }
    });
  }

  rejectVisit(visitId: number): void {
    this.modal.confirm({
      nzTitle: 'Reject Visit?',
      nzContent: 'Are you sure you want to reject this visit?',
      nzOkText: 'Yes, Reject',
      nzOkDanger: true,
      nzOnOk: () => {
        this.svc.rejectDirectCheckIn(visitId, this.user.EmpId).subscribe({
          next: (r) => {
            this.notification.success('Rejected', r.Msg || 'Visit rejected');
            this.loadInvites();
          },
          error: () => this.notification.error('Error', 'Failed to reject')
        });
      }
    });
  }

  regenerateOtp(visitId: number): void {
    this.svc.regenerateCheckoutOtp(visitId).subscribe({
      next: (r) => {
        this.notification.success('OTP Regenerated', 'New OTP: ' + (r.OTP || '') + '. Valid for 2 min.');
        this.loadInvites();
      },
      error: () => this.notification.error('Error', 'Failed to regenerate OTP')
    });
  }

  cancelInvite(visitId: number): void {
    this.http.post<any>(API + '/visitor/cancel', { VisitId: visitId }).subscribe({
      next: () => { this.loadInvites(); this.notification.success('Cancelled', 'Invite cancelled'); },
      error: () => this.notification.error('Error', 'Failed to cancel')
    });
  }

  showDetail(v: any): void {
    const dateStr = v.Date ? new Date(v.Date).toLocaleDateString('en-GB') : '-';
    const html = `
      <div style="padding:16px 0">
        <div style="display:grid;grid-template-columns:130px 1fr;gap:8px 16px;font-size:14px">
          <div style="font-weight:600;color:#555;padding:6px 0">Visitor Name</div><div style="padding:6px 0;border-bottom:1px solid #f0f0f0">${v.Name}</div>
          <div style="font-weight:600;color:#555;padding:6px 0">Email</div><div style="padding:6px 0;border-bottom:1px solid #f0f0f0">${v.PMail ?? '-'}</div>
          <div style="font-weight:600;color:#555;padding:6px 0">Mobile</div><div style="padding:6px 0;border-bottom:1px solid #f0f0f0">${v.Mobile ?? '-'}</div>
          <div style="font-weight:600;color:#555;padding:6px 0">Company</div><div style="padding:6px 0;border-bottom:1px solid #f0f0f0">${v.Company ?? '-'}</div>
          <div style="font-weight:600;color:#555;padding:6px 0">Designation</div><div style="padding:6px 0;border-bottom:1px solid #f0f0f0">${v.Designation ?? '-'}</div>
          <div style="font-weight:600;color:#555;padding:6px 0">Purpose</div><div style="padding:6px 0;border-bottom:1px solid #f0f0f0">${v.Purpose ?? '-'}</div>
          <div style="font-weight:600;color:#555;padding:6px 0">Visit Date</div><div style="padding:6px 0;border-bottom:1px solid #f0f0f0">${dateStr}</div>
          <div style="font-weight:600;color:#555;padding:6px 0">Visit Time</div><div style="padding:6px 0">${v.Time ?? '-'}</div>
        </div>
      </div>`;
    this.modal.info({
      nzTitle: 'Invitation Details',
      nzContent: html,
      nzWidth: 520,
      nzOkText: 'Close'
    });
  }

  getStatusColor(s: string): string {
    const m: any = {
      'Invited': 'blue', 'Invite Accepted': 'green', 'Checked In': 'orange',
      'Checked Out': 'cyan', 'Cancelled': 'red', 'Expired': 'red',
      'Pending Approval': 'purple', 'Approved': 'lime'
    };
    return m[s] || 'default';
  }
}
