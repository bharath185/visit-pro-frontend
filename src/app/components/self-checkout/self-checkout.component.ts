import { Component, OnInit } from '@angular/core';
import { VisitorService } from '../../services/visitor.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-self-checkout',
  templateUrl: './self-checkout.component.html'
})
export class SelfCheckoutComponent implements OnInit {
  otp = '';
  visitor: any = null;
  loading = false;
  checkedOut = false;

  constructor(private svc: VisitorService, private notification: NzNotificationService) {}

  ngOnInit(): void {}

  verify(): void {
    if (!this.otp || this.otp.length < 6) {
      this.notification.error('Error', 'Please enter a valid 6-digit check-in code');
      return;
    }
    this.loading = true;
    this.svc.verifyCheckInOTP(this.otp).subscribe({
      next: (res) => {
        if (res.Msg && res.Msg.includes('Invalid')) {
          this.notification.error('Invalid', res.Msg);
        } else {
          this.visitor = res;
        }
        this.loading = false;
      },
      error: () => { this.notification.error('Error', 'Verification failed'); this.loading = false; }
    });
  }

  confirmCheckOut(): void {
    if (!this.visitor) return;
    this.loading = true;
    this.svc.visitorCheckOut({ VisitId: this.visitor.VisitId, OTP: this.otp }).subscribe({
      next: () => {
        this.checkedOut = true;
        this.notification.success('Success', 'Check-out successful! Thank you for visiting.');
        this.loading = false;
      },
      error: () => { this.notification.error('Error', 'Check-out failed'); this.loading = false; }
    });
  }

  reset(): void {
    this.otp = ''; this.visitor = null; this.checkedOut = false;
  }
}
