import { Component, OnInit, ApplicationRef } from '@angular/core';
import { VisitorService } from '../../services/visitor.service';
import { MasterService } from '../../services/master.service';
import { AuthService } from '../../services/auth.service';
import { Visitor } from '../../models/visitor.model';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-view-visitors',
  templateUrl: './view-visitors.component.html'
})
export class ViewVisitorsComponent implements OnInit {
  visitors: Visitor[] = [];
  filtered: Visitor[] = [];
  searchTerm = '';
  pageSize = 10;
  pageIndex = 1;
  loading = true;
  selectedVisitor: Visitor | null = null;
  showVisitorDialog = false;
  checkingIn = false;
  checkingOut = false;
  plantAdminCheckInCode = '';
  plantAdminCheckingIn = false;
  plantAdminCheckOutCode = '';
  plantAdminCheckingOut = false;
  savingDetails = false;

  // Direct check-in
  directCheckInLoading = false;
  directCheckOutLoading = false;

  // Filter
  dateFrom: Date | null = null;
  dateTo: Date | null = null;
  filterStatus = '';
  filterCategory = '';
  categoryOptions: any[] = [];
  statusOptions = ['', 'Invited', 'Invite Accepted', 'Self Verified', 'Pending Approval', 'Approved', 'Checked In', 'Checked Out', 'Cancelled', 'Expired'];

  constructor(private svc: VisitorService, private master: MasterService, public auth: AuthService, private notification: NzNotificationService, private modal: NzModalService, private appRef: ApplicationRef) {}

  ngOnInit(): void {
    this.loadData();
    this.master.getCategories().subscribe(c => this.categoryOptions = c || []);
  }

  loadData(): void {
    this.loading = true;
    let obs;
    if (this.auth.isSuperAdmin()) {
      obs = this.svc.getAllVisitors();
    } else if ((this.auth.isPlantAdmin() || this.auth.isSecurity()) && this.auth.getPlantId()) {
      obs = this.svc.getAllVisitorsByPlant(this.auth.getPlantId()!);
    } else {
      obs = this.svc.getByEmployee(this.auth.currentUser?.EmpId || 0);
    }
    obs.subscribe(v => {
      this.visitors = v;
      this.filtered = [...v];
      this.loading = false;
    });
  }

  searchTermChange(val: string): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.visitors];

    // Search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(x =>
        (x.Name || '').toLowerCase().includes(term) ||
        (x.Company || '').toLowerCase().includes(term) ||
        (x.PMail || '').toLowerCase().includes(term) ||
        (x.Mobile || '').includes(term)
      );
    }

    // Date range
    if (this.dateFrom) {
      const from = new Date(this.dateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter(x => {
        if (!x.Date) return true;
        const d = new Date(x.Date);
        return d >= from;
      });
    }
    if (this.dateTo) {
      const to = new Date(this.dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter(x => {
        if (!x.Date) return true;
        const d = new Date(x.Date);
        return d <= to;
      });
    }

    // Status
    if (this.filterStatus) {
      result = result.filter(x => x.Status === this.filterStatus);
    }

    // Category
    if (this.filterCategory) {
      result = result.filter(x => x.Category === this.filterCategory);
    }

    this.filtered = result;
  }

  resetFilters(): void {
    this.dateFrom = null;
    this.dateTo = null;
    this.filterStatus = '';
    this.filterCategory = '';
    this.searchTerm = '';
    this.filtered = [...this.visitors];
  }

  view(v: Visitor): void {
    this.selectedVisitor = { ...v };
    this.plantAdminCheckInCode = v.CheckInCode || v.OTP || '';
    this.plantAdminCheckOutCode = v.CheckoutCode || '';
    this.showVisitorDialog = true;
    if (v.VisitId) {
      this.svc.getVisitorById(v.VisitId).subscribe({
        next: (fresh) => {
          if (fresh && fresh.VisitId) {
            this.selectedVisitor = { ...fresh };
            this.plantAdminCheckOutCode = fresh.CheckoutCode || '';
            this.appRef.tick();
          }
        }
      });
    }
  }

  regenerateOtp(): void {
    if (!this.selectedVisitor?.VisitId) return;
    this.svc.regenerateCheckoutOtp(this.selectedVisitor.VisitId).subscribe({
      next: (r) => {
        if (this.selectedVisitor) {
          this.selectedVisitor = { ...this.selectedVisitor, CheckoutCode: r.OTP || '' };
          this.plantAdminCheckOutCode = r.OTP || '';
          this.appRef.tick();
        }
        this.notification.success('OTP Regenerated', 'New OTP: ' + (r.OTP || '') + '. Valid for 2 minutes.');
      },
      error: () => this.notification.error('Error', 'Failed to regenerate OTP')
    });
  }

  regenerateOtpForRow(v: any): void {
    if (!v?.VisitId) return;
    this.svc.regenerateCheckoutOtp(v.VisitId).subscribe({
      next: (r) => {
        v.CheckoutCode = r.OTP || '';
        if (this.selectedVisitor?.VisitId === v.VisitId && this.selectedVisitor) {
          this.selectedVisitor = { ...this.selectedVisitor, CheckoutCode: r.OTP || '' };
          this.plantAdminCheckOutCode = r.OTP || '';
          this.appRef.tick();
        }
        this.notification.success('OTP Regenerated', 'New OTP: ' + (r.OTP || '') + '. Valid for 2 min.');
      },
      error: () => this.notification.error('Error', 'Failed to regenerate OTP')
    });
  }

  getDuration(checkIn: string | undefined, checkOut: string | undefined): string {
    if (!checkIn || !checkOut) return '-';
    const diffMs = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    if (diffMs <= 0) return '-';
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  closeVisitorDetail(): void {
    this.selectedVisitor = null;
    this.showVisitorDialog = false;
  }

  get isPlantAdmin(): boolean { return this.auth.isPlantAdmin() || this.auth.isSecurity(); }

  doCheckIn(): void {
    if (!this.selectedVisitor?.VisitId) return;
    this.checkingIn = true;
    this.svc.checkIn(this.selectedVisitor.VisitId, this.selectedVisitor).subscribe({
      next: () => {
        this.checkingIn = false;
        this.notification.success('Success', 'Check-in completed');
        this.selectedVisitor = null;
        this.showVisitorDialog = false;
        this.loadData();
      },
      error: () => { this.checkingIn = false; this.notification.error('Error', 'Check-in failed'); }
    });
  }

  doPlantAdminCheckIn(): void {
    if (!this.selectedVisitor?.VisitId || !this.plantAdminCheckInCode) return;
    this.plantAdminCheckingIn = true;
    const body: Visitor = {
      VisitId: this.selectedVisitor.VisitId,
      OTP: this.plantAdminCheckInCode,
      IdCard: this.selectedVisitor.IdCard,
      Accessories: this.selectedVisitor.Accessories
    };
    this.svc.plantAdminCheckIn(body).subscribe({
      next: (r) => {
        this.plantAdminCheckingIn = false;
        if (r.Msg && r.Msg !== 'Check-in successful') {
          if (r.Msg === 'Your invitation has not been accepted') {
            this.modal.warning({
              nzTitle: 'Cannot Check In',
              nzContent: 'Your invitation has not been accepted. The visitor must accept the invitation first before check-in.',
              nzOkText: 'OK'
            });
          } else {
            this.notification.error('Error', r.Msg);
          }
          return;
        }
        this.notification.success('Success', 'Check-in completed');
        this.selectedVisitor = null;
        this.showVisitorDialog = false;
        this.loadData();
      },
      error: () => { this.plantAdminCheckingIn = false; this.notification.error('Error', 'Check-in failed'); }
    });
  }

  doPlantAdminCheckOut(): void {
    if (!this.selectedVisitor?.VisitId || !this.plantAdminCheckOutCode) return;
    this.plantAdminCheckingOut = true;
    const body: Visitor = {
      VisitId: this.selectedVisitor.VisitId,
      OTP: this.plantAdminCheckOutCode
    };
    this.svc.plantAdminCheckOut(body).subscribe({
      next: (r) => {
        this.plantAdminCheckingOut = false;
        if (r.Msg && r.Msg !== 'Check-out successful') {
          this.notification.error('Error', r.Msg);
          return;
        }
        this.notification.success('Success', 'Check-out completed');
        this.selectedVisitor = null;
        this.showVisitorDialog = false;
        this.loadData();
      },
      error: () => { this.plantAdminCheckingOut = false; this.notification.error('Error', 'Check-out failed'); }
    });
  }

  saveVisitorDetails(): void {
    if (!this.selectedVisitor?.VisitId) return;
    this.savingDetails = true;
    this.svc.updateVisitorDetails(this.selectedVisitor).subscribe({
      next: (r) => {
        this.savingDetails = false;
        this.notification.success('Success', 'Visitor details updated');
        this.loadData();
      },
      error: () => { this.savingDetails = false; this.notification.error('Error', 'Failed to update details'); }
    });
  }

  doCheckOut(): void {
    if (!this.selectedVisitor?.VisitId) return;
    this.checkingOut = true;
    this.svc.checkOut(this.selectedVisitor.VisitId).subscribe({
      next: () => {
        this.checkingOut = false;
        this.notification.success('Success', 'Check-out completed');
        this.selectedVisitor = null;
        this.showVisitorDialog = false;
        this.loadData();
      },
      error: () => { this.checkingOut = false; this.notification.error('Error', 'Check-out failed'); }
    });
  }

  exportCsv(): void {
    const filter: any = {};
    if (this.dateFrom) filter.FromDate = new Date(this.dateFrom).toISOString();
    if (this.dateTo) filter.ToDate = new Date(this.dateTo).toISOString();
    if (this.filterStatus) filter.Status = this.filterStatus;
    this.svc.exportCsv(filter).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `VisitorsData_${new Date().getTime()}.csv`;
        a.click(); window.URL.revokeObjectURL(url);
        this.notification.success('Success', 'CSV exported successfully');
      },
      error: () => this.notification.error('Error', 'Export failed')
    });
  }

  doDirectCheckIn(): void {
    if (!this.selectedVisitor?.VisitId) return;
    this.directCheckInLoading = true;
    const body: Visitor = {
      VisitId: this.selectedVisitor.VisitId,
      IdCard: this.selectedVisitor.IdCard,
      Accessories: this.selectedVisitor.Accessories
    };
    this.svc.plantAdminCheckInDirect(body).subscribe({
      next: (r) => {
        this.directCheckInLoading = false;
        if (r.Msg && r.Msg !== 'Check-in successful') {
          this.notification.error('Error', r.Msg);
          return;
        }
        this.notification.success('Success', 'Check-in completed');
        this.selectedVisitor = null;
        this.showVisitorDialog = false;
        this.loadData();
      },
      error: () => { this.directCheckInLoading = false; this.notification.error('Error', 'Check-in failed'); }
    });
  }

  doDirectCheckOut(): void {
    if (!this.selectedVisitor?.VisitId) return;
    this.directCheckOutLoading = true;
    this.svc.plantAdminCheckOutDirect({ VisitId: this.selectedVisitor.VisitId } as Visitor).subscribe({
      next: (r) => {
        this.directCheckOutLoading = false;
        if (r.Msg && r.Msg !== 'Check-out successful') {
          this.notification.error('Error', r.Msg);
          return;
        }
        this.notification.success('Success', 'Check-out completed');
        this.selectedVisitor = null;
        this.showVisitorDialog = false;
        this.loadData();
      },
      error: () => { this.directCheckOutLoading = false; this.notification.error('Error', 'Check-out failed'); }
    });
  }

  getStatusColor(s: string): string {
    const m: Record<string, string> = {
      'Invited': 'blue', 'Invite Accepted': 'green',
      'Self Verified': 'cyan', 'Pending Approval': 'purple', 'Approved': 'lime',
      'Checked In': 'orange', 'Checked Out': 'default',
      'Cancelled': 'red', 'Expired': 'red'
    };
    return m[s] || 'default';
  }
}
