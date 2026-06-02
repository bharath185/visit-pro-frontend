import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { MasterService } from '../../services/master.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

const API = 'http://192.168.2.45:8081/api';

@Component({
  selector: 'app-plant-user-management',
  templateUrl: './plant-user-management.component.html'
})
export class PlantUserManagementComponent implements OnInit {
  plantId: number | null = null;
  compId: number | null = null;
  plantName = '';
  employees: any[] = [];
  filteredEmps: any[] = [];
  empSearch = '';
  loading = false;

  // Modal
  showModal = false;
  editModal: any = { IsActive: true, IsDeleted: false, IsAdminUser: false, IsSecurity: false };
  editingId: number | null = null;
  saving = false;
  password = '';

  // Cascade for user creation
  companies: any[] = [];
  locations: any[] = [];
  designations: any[] = [];
  userCompany: any = null;
  reportingToEnabled = false;
  reportingEmployees: { id: number; name: string }[] = [];
  defaultLocation = '';

  constructor(
    private http: HttpClient,
    public auth: AuthService,
    private master: MasterService,
    private notification: NzNotificationService
  ) {
    this.plantId = auth.getPlantId();
    this.compId = auth.getCompId();
    this.plantName = auth.currentUser?.PlantName || '';
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.master.getCompanies().subscribe(r => {
      this.companies = r;
      this.userCompany = r.find(c => c.Id === this.compId) || null;
    });
    if (this.compId) {
      this.master.getLocationsByCompany(this.compId).subscribe(r => {
        this.locations = r;
        if (r.length > 0) this.defaultLocation = r[0].Name;
      });
    }
    if (this.plantId) {
      this.master.getDesignationsByPlantDropdown(this.plantId).subscribe(r => this.designations = r);
    }
  }

  loadEmployees(): void {
    if (!this.plantId) return;
    this.loading = true;
    this.master.getEmployeesByPlant(this.plantId).subscribe({
      next: r => { this.employees = r; this.filteredEmps = [...r]; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  get filteredList(): any[] {
    if (!this.empSearch) return this.filteredEmps;
    const s = this.empSearch.toLowerCase();
    return this.filteredEmps.filter((e: any) =>
      (e.Name || '').toLowerCase().includes(s) || (e.Code || '').toLowerCase().includes(s)
    );
  }

  onReportingToChange(): void {
    if (this.reportingToEnabled && this.reportingEmployees.length === 0) {
      this.http.get<any[]>(`${API}/master/reporting-employees`).subscribe(list => {
        this.reportingEmployees = list.map(r => ({ id: r.Id, name: r.Name }));
      });
    }
    if (!this.reportingToEnabled) {
      this.editModal.ReportId = undefined;
    }
  }

  openNew(): void {
    this.editingId = null;
    this.password = '';
    this.reportingToEnabled = false;
    this.editModal = { IsActive: true, IsDeleted: false, IsAdminUser: false, IsSecurity: false, PlantId: this.plantId, CompId: this.compId, ShortName: this.defaultLocation };
    if (this.plantId) {
      this.master.getDesignationsByPlantDropdown(this.plantId).subscribe(r => this.designations = r);
    }
    this.showModal = true;
  }

  editEmp(e: any): void {
    this.editingId = e.Id || e.id;
    this.password = '';
    this.reportingToEnabled = !!e.ReportId;
    this.editModal = {
      Id: this.editingId,
      Name: e.Name || '',
      Code: e.Code || '',
      Description: e.Description || '',
      ShortName: e.ShortName || '',
      Field1: e.Field1 || '',
      Field2: e.Field2 || '',
      PlantId: this.plantId,
      CompId: this.compId,
      IsAdminUser: e.IsAdminUser === true,
      IsSecurity: e.IsSecurity === true,
      ReportId: e.ReportId || undefined,
      IsActive: true, IsDeleted: false
    };
    if (this.reportingToEnabled) {
      this.http.get<any[]>(`${API}/master/reporting-employees`).subscribe(list => {
        this.reportingEmployees = list.map(r => ({ id: r.Id, name: r.Name }));
      });
    }
    if (this.plantId) {
      this.master.getDesignationsByPlantDropdown(this.plantId).subscribe(r => this.designations = r);
    }
    this.showModal = true;
  }

  save(): void {
    if (!this.editModal.Name || !this.editModal.Code) {
      this.notification.warning('Warning', 'Name and Username are required');
      return;
    }
    const mobileRegex = /^[6-9]\d{9}$/;
    if (this.editModal.Field2 && !mobileRegex.test(this.editModal.Field2)) {
      this.notification.warning('Warning', 'Enter a valid 10-digit mobile number');
      return;
    }
    if (!this.editingId && !this.password) {
      this.notification.warning('Warning', 'Password is required for new users');
      return;
    }
    this.saving = true;
    const payload: any = {
      Id: this.editingId || 0,
      Name: this.editModal.Name,
      Code: this.editModal.Code,
      PlantId: this.plantId,
      Description: this.editModal.Description || '',
      ShortName: this.editModal.ShortName || '',
      Field1: this.editModal.Field1 || '',
      Field2: this.editModal.Field2 || '',
      IsSecurity: this.editModal.IsSecurity === true,
      ReportId: this.reportingToEnabled ? this.editModal.ReportId : null,
      IsActive: true, IsDeleted: false
    };
    if (this.password) payload.Password = this.password;

    this.master.saveEmployee(payload).subscribe({
      next: () => {
        this.saving = false;
        this.showModal = false;
        this.notification.success('Saved', 'User saved successfully');
        this.loadEmployees();
      },
      error: () => { this.saving = false; this.notification.error('Error', 'Failed to save user'); }
    });
  }

  deleteEmp(id: number): void {
    const currentEmpId = this.auth.currentUser?.EmpId;
    if (id === currentEmpId) {
      this.notification.warning('Not Allowed', 'You cannot delete your own account');
      return;
    }
    if (!confirm('Delete this user?')) return;
    this.master.deleteEmployee(id).subscribe({
      next: () => { this.notification.success('Deleted', 'User deleted'); this.loadEmployees(); },
      error: () => this.notification.error('Error', 'Failed to delete')
    });
  }

  isCurrentUser(id: number): boolean {
    return id === this.auth.currentUser?.EmpId;
  }

  getStatusColor(s: string): string {
    const m: any = { 'Invited': 'blue', 'Invite Accepted': 'green', 'Checked In': 'orange', 'Checked Out': 'cyan', 'Cancelled': 'red', 'Expired': 'red' };
    return m[s] || 'default';
  }
}
