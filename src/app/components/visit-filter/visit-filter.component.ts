import { Component, OnInit } from '@angular/core';
import { VisitorService } from '../../services/visitor.service';
import { MasterService } from '../../services/master.service';
import { AuthService } from '../../services/auth.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-visit-filter',
  templateUrl: './visit-filter.component.html'
})
export class VisitFilterComponent implements OnInit {
  fromDate: Date | null = null;
  toDate: Date | null = null;
  status = '';
  category = '';
  categories: any[] = [];
  statuses = ['', 'Invited', 'Invite Accepted', 'Checked In', 'Checked Out', 'Expired'];
  visitors: any[] = [];
  loading = false;
  exportingCsv = false;
  exportingExcel = false;

  constructor(private svc: VisitorService, private master: MasterService, public auth: AuthService, private notification: NzNotificationService) {}

  ngOnInit(): void {
    this.master.getCategories().subscribe(c => this.categories = c);
  }

  private buildFilter(): any {
    const filter: any = {};
    if (this.fromDate) filter.FromDate = new Date(this.fromDate).toISOString();
    if (this.toDate) filter.ToDate = new Date(this.toDate).toISOString();
    if (this.status) filter.Status = this.status;
    if (this.category) filter.Category = this.category;
    if (this.auth.isPlantAdmin() && this.auth.getPlantId()) filter.PlantId = this.auth.getPlantId();
    if (!this.auth.isSuperAdmin() && !this.auth.isPlantAdmin() && this.auth.currentUser?.EmpId) filter.EmpId = this.auth.currentUser.EmpId;
    return filter;
  }

  search(): void {
    if (!this.fromDate && !this.toDate && !this.status) {
      this.notification.warning('Warning', 'Please select at least one filter criteria');
      return;
    }
    this.loading = true;
    this.svc.visitFilter(this.buildFilter()).subscribe({
      next: (data) => { this.visitors = data; this.loading = false; },
      error: () => { this.notification.error('Error', 'Error fetching data'); this.loading = false; }
    });
  }

  exportCsv(): void {
    this.exportingCsv = true;
    this.svc.exportCsv(this.buildFilter()).subscribe({
      next: (blob) => {
        this.exportingCsv = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `VisitorsData_${new Date().getTime()}.csv`;
        a.click(); window.URL.revokeObjectURL(url);
        this.notification.success('Success', 'CSV exported successfully');
      },
      error: () => { this.exportingCsv = false; this.notification.error('Error', 'CSV export failed'); }
    });
  }

  exportExcel(): void {
    this.exportingExcel = true;
    this.svc.exportExcel(this.buildFilter()).subscribe({
      next: (blob) => {
        this.exportingExcel = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `VisitorsData_${new Date().getTime()}.xlsx`;
        a.click(); window.URL.revokeObjectURL(url);
        this.notification.success('Success', 'Excel exported successfully');
      },
      error: () => { this.exportingExcel = false; this.notification.error('Error', 'Excel export failed'); }
    });
  }

  clear(): void {
    this.fromDate = null; this.toDate = null; this.status = ''; this.category = ''; this.visitors = [];
  }

  getDuration(checkIn: string | undefined, checkOut: string | undefined): string {
    if (!checkIn || !checkOut) return '-';
    const diffMs = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    if (diffMs <= 0) return '-';
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  getStatusColor(s: string): string {
    const m: Record<string, string> = {
      'Invited': 'blue', 'Invite Accepted': 'green',
      'Checked In': 'orange', 'Checked Out': 'default',
      'Cancelled': 'red', 'Expired': 'red'
    };
    return m[s] || 'default';
  }
}
