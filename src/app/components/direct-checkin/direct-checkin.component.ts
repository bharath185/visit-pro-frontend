import { Component, OnInit } from '@angular/core';
import { VisitorService } from '../../services/visitor.service';
import { MasterService } from '../../services/master.service';
import { AuthService } from '../../services/auth.service';
import { Visitor, Employee } from '../../models/visitor.model';
import { NzNotificationService } from 'ng-zorro-antd/notification';


@Component({
  selector: 'app-direct-checkin',
  templateUrl: './direct-checkin.component.html'
})
export class DirectCheckinComponent implements OnInit {
  model: Visitor = { Invited: true, Accept: true, Approved: true, DirectCheckIn: true, IsActive: true };
  employees: Employee[] = [];
  employeeDesignationMap: Record<number, string> = {};

  // PlantAdmin on-behalf-of flow
  isPlantAdmin = false;
  plantId: number | null = null;
  designations: any[] = [];
  selectedDesignation: any = null;
  plantEmployees: any[] = [];
  filteredEmployees: any[] = [];
  selectedEmployee: any = null;

  visitPurposes: any[] = [];

  uploading = false;
  autoFillingMobile = false;

  constructor(private svc: VisitorService, private master: MasterService, public auth: AuthService, private notification: NzNotificationService) {}

  ngOnInit(): void {
    this.isPlantAdmin = this.auth.isPlantAdmin() || this.auth.isSecurity();
    this.plantId = this.auth.getPlantId();
    this.model.Date = new Date().toISOString().split('T')[0];
    this.svc.getEmployees().subscribe(e => this.employees = e);
    this.svc.getAllEmployees().subscribe(emps => {
      emps.forEach((e: any) => this.employeeDesignationMap[e.Id] = e.Description || '');
    });
    this.master.getVisitPurposes().subscribe(v => this.visitPurposes = v);
    if (this.isPlantAdmin && this.plantId) {
      this.master.getDesignationsByPlantDropdown(this.plantId).subscribe(ds => this.designations = ds);
    }
  }

  onDesignationChange(): void {
    this.selectedEmployee = null;
    this.model.WhomtoMeet = undefined;
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
    this.model.WhomtoMeet = emp.Id || 0;
  }

  getEmployeeLabel(e: any): string {
    const desig = this.employeeDesignationMap[e.Id] || '';
    return desig ? `${e.Name} (${desig})` : `${e.Name} (${e.Code})`;
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
    if (!this.model.Name || !this.model.PMail || !this.model.IdCard) {
      this.notification.error('Error', 'Name, Email and ID Card are required'); return;
    }
    const mobileRegex = /^[6-9]\d{9}$/;
    if (this.model.Mobile && !mobileRegex.test(this.model.Mobile)) {
      this.notification.error('Error', 'Enter a valid 10-digit mobile number'); return;
    }
    if (this.model.AMobile && !mobileRegex.test(this.model.AMobile)) {
      this.notification.error('Error', 'Enter a valid 10-digit alternate mobile number'); return;
    }
    if (this.isPlantAdmin && !this.selectedEmployee) {
      this.notification.error('Error', 'Please select an employee for the visit'); return;
    }

    this.model.EmpId = this.auth.currentUser?.EmpId || 1;
    this.uploading = true;
    this.svc.directCheckIn(this.model).subscribe(r => {
      this.uploading = false;
      const msg = (this.auth.isSecurity() || this.auth.isPlantAdmin())
        ? (r.Msg || 'Check-in submitted. The host will be notified for approval.')
        : (r.Msg || 'Check-in successful');
      this.notification.success('Success', msg);
      this.model = { Invited: true, Accept: true, Approved: true, DirectCheckIn: true, IsActive: true, Date: new Date().toISOString().split('T')[0] };
      this.selectedEmployee = null;
      this.selectedDesignation = null;
      this.filteredEmployees = [];
    });
  }
}
