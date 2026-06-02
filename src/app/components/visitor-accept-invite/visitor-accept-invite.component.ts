import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VisitorService } from '../../services/visitor.service';
import { Visitor } from '../../models/visitor.model';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-visitor-accept-invite',
  templateUrl: './visitor-accept-invite.component.html'
})
export class VisitorAcceptInviteComponent implements OnInit {
  model: Visitor = {};
  otpValue = '';
  rejectMessage = '';
  step: 'otp' | 'form' | 'done' | 'rejected' = 'otp';

  constructor(private svc: VisitorService, private route: ActivatedRoute, private notification: NzNotificationService) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(p => {
      if (p['code']) { this.otpValue = p['code']; this.verifyOtp(); }
    });
  }

  verifyOtp(): void {
    if (this.otpValue.length < 4) return;
    this.svc.verifyOTP(this.otpValue).subscribe(r => {
      if (r.Msg === 'OTP verified successfully') {
        this.model = r; this.step = 'form';
      } else if (r.Msg && r.Msg.includes('rejected')) {
        this.rejectMessage = r.Msg; this.step = 'rejected';
      } else {
        this.notification.error('Invalid', r.Msg || 'Invalid OTP');
      }
    });
  }

  accept(): void {
    const mobileRegex = /^[6-9]\d{9}$/;
    if (this.model.Mobile && !mobileRegex.test(this.model.Mobile)) {
      this.notification.error('Error', 'Enter a valid 10-digit mobile number'); return;
    }
    this.svc.publicAcceptInvite(this.model).subscribe(r => {
      this.notification.success('Success', r.Msg || 'Invitation accepted');
      this.step = 'done';
    });
  }
}
