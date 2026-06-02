import { Component } from '@angular/core';
import { VisitorService } from '../../services/visitor.service';
import { Visitor, Employee } from '../../models/visitor.model';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-self-direct-checkin',
  templateUrl: './self-direct-checkin.component.html'
})
export class SelfDirectCheckinComponent {
  model: Visitor = { IsActive: true };
  loading = false;
  checkedIn = false;
  checkInCode = '';
  employees: Employee[] = [];
  today = new Date().toISOString().split('T')[0];

  constructor(private svc: VisitorService, private notification: NzNotificationService) {
    this.svc.getEmployees().subscribe(e => this.employees = e);
  }

  submit(): void {
    if (!this.model.Name) { this.notification.error('Error', 'Name is required'); return; }
    if (!this.model.PMail && !this.model.OMail) { this.notification.error('Error', 'Email is required'); return; }
    const mobileRegex = /^[6-9]\d{9}$/;
    if (this.model.Mobile && !mobileRegex.test(this.model.Mobile)) {
      this.notification.error('Error', 'Enter a valid 10-digit mobile number'); return;
    }
    if (this.model.AMobile && !mobileRegex.test(this.model.AMobile)) {
      this.notification.error('Error', 'Enter a valid 10-digit alternate mobile number'); return;
    }
    this.loading = true;
    this.svc.visitorDirectCheckIn(this.model).subscribe({
      next: (res) => {
        this.checkInCode = res.OTP || ''; this.checkedIn = true; this.loading = false;
      },
      error: () => { this.notification.error('Error', 'Check-in failed'); this.loading = false; }
    });
  }

  reset(): void {
    this.model = { IsActive: true }; this.checkedIn = false; this.checkInCode = '';
  }
}
