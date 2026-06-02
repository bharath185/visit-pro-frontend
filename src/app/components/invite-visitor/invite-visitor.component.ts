import { Component, OnInit } from '@angular/core';
import { VisitorService } from '../../services/visitor.service';
import { MasterService } from '../../services/master.service';
import { AuthService } from '../../services/auth.service';
import { Visitor } from '../../models/visitor.model';
import { NzNotificationService } from 'ng-zorro-antd/notification';


@Component({
  selector: 'app-invite-visitor',
  templateUrl: './invite-visitor.component.html'
})
export class InviteVisitorComponent implements OnInit {
  model: Visitor = { EmpId: 0, IsActive: true };
  visitors: Visitor[] = [];
  filteredVisitors: Visitor[] = [];
  searchTerm = '';
  pageSize = 10;
  pageIndex = 1;
  showForm = false;

  companies: any[] = [];
  categories: any[] = [];
  visitPurposes: any[] = [];

  // PlantAdmin on-behalf-of flow
  isPlantAdmin = false;
  plantId: number | null = null;
  designations: any[] = [];
  selectedDesignation: any = null;
  plantEmployees: any[] = [];
  filteredEmployees: any[] = [];
  selectedEmployee: any = null;

  uploading = false;
  today = new Date().toISOString().split('T')[0];

  constructor(private svc: VisitorService, private master: MasterService, public auth: AuthService, private notification: NzNotificationService) {}

  ngOnInit(): void {
    this.isPlantAdmin = this.auth.isPlantAdmin();
    this.plantId = this.auth.getPlantId();
    this.model.EmpId = this.auth.currentUser?.EmpId || 1;
    this.loadVisitors();
    this.master.getCompanies().subscribe(c => this.companies = c);
    this.master.getCategories().subscribe(c => this.categories = c);
    this.master.getVisitPurposes().subscribe(v => this.visitPurposes = v);
    if (this.isPlantAdmin && this.plantId) {
      this.master.getDesignationsByPlantDropdown(this.plantId).subscribe(ds => this.designations = ds);
    }
  }

  onDesignationChange(): void {
    this.selectedEmployee = null;
    this.model.WName = '';
    this.model.WEmail = '';
    this.model.WMobile = '';
    this.model.EmpId = this.auth.currentUser?.EmpId || 1;
    if (!this.selectedDesignation || !this.plantId) { this.filteredEmployees = []; return; }
    if (!this.plantEmployees.length) {
      this.master.getEmployeesByPlant(this.plantId).subscribe(emps => {
        this.plantEmployees = emps;
        this.filteredEmployees = this.plantEmployees.filter((e: any) => 
          e.Description === this.selectedDesignation.Name || e.Description === this.selectedDesignation.label
        );
      });
    } else {
      this.filteredEmployees = this.plantEmployees.filter((e: any) => 
        e.Description === this.selectedDesignation.Name || e.Description === this.selectedDesignation.label
      );
    }
  }

  onEmployeeSelect(emp: any): void {
    this.selectedEmployee = emp;
    this.model.WName = emp.Name || '';
    this.model.WEmail = emp.Field1 || '';
    this.model.WMobile = emp.Field2 || '';
    this.model.EmpId = emp.Id || 0;
  }

  loadVisitors(): void {
    const empId = this.auth.currentUser?.EmpId || 1;
    this.svc.getByEmployee(empId).subscribe(v => { this.visitors = v; this.filteredVisitors = [...v]; });
  }

  searchTermChange(val: string): void {
    this.filteredVisitors = val
      ? this.visitors.filter(v => (v.Name || '').toLowerCase().includes(val.toLowerCase()) || (v.Company || '').toLowerCase().includes(val.toLowerCase()))
      : [...this.visitors];
  }

  // ---- Submit ----
  submit(): void {
    if (!this.model.Name || !this.model.PMail) {
      this.notification.error('Error', 'Name and Email are required'); return;
    }
    const mobileRegex = /^[6-9]\d{9}$/;
    if (this.model.Mobile && !mobileRegex.test(this.model.Mobile)) {
      this.notification.error('Error', 'Enter a valid 10-digit mobile number'); return;
    }
    if (this.model.AMobile && !mobileRegex.test(this.model.AMobile)) {
      this.notification.error('Error', 'Enter a valid 10-digit alternate mobile number'); return;
    }
    if (this.model.WMobile && !mobileRegex.test(this.model.WMobile)) {
      this.notification.error('Error', 'Enter a valid 10-digit mobile number for yourself'); return;
    }
    if (this.isPlantAdmin && !this.selectedEmployee) {
      this.notification.error('Error', 'Please select an employee to meet'); return;
    }

    this.uploading = true;
    this.svc.inviteVisit(this.model).subscribe(r => {
      this.uploading = false;
      this.notification.success('Success', r.Msg || 'Invite sent successfully');
      this.model = { EmpId: this.auth.currentUser?.EmpId || 1, IsActive: true };
      this.selectedEmployee = null;
      this.selectedDesignation = null;
      this.filteredEmployees = [];
      this.showForm = false;
      this.loadVisitors();
    });
  }

  cancel(visitId: number): void {
    this.svc.cancelInvite(visitId).subscribe({
      next: (r) => {
        this.notification.success('Cancelled', r.Msg || 'Invite cancelled');
        this.loadVisitors();
      },
      error: () => this.notification.error('Error', 'Failed to cancel invite')
    });
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      'Invited': 'blue', 'Invite Accepted': 'green',
      'Checked In': 'orange', 'Checked Out': 'default',
      'Cancelled': 'red', 'Expired': 'red'
    };
    return map[status] || 'default';
  }
}
