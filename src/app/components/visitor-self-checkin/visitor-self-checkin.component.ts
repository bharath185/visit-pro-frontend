import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VisitorService } from '../../services/visitor.service';
import { Visitor } from '../../models/visitor.model';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-visitor-self-checkin',
  templateUrl: './visitor-self-checkin.component.html'
})
export class VisitorSelfCheckinComponent implements OnInit {
  step: 'welcome' | 'otp' | 'form' | 'selfverified' | 'done' = 'otp';
  model: Visitor = {};
  otpValue = '';
  loading = false;

  constructor(private svc: VisitorService, private route: ActivatedRoute, private notification: NzNotificationService) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(p => {
      if (p['code']) {
        this.otpValue = p['code'];
        this.doCheckinWithCode();
      }
    });
  }

  doCheckinWithCode(): void {
    this.loading = true;
    this.svc.selfCheckInVerify(this.otpValue).subscribe({
      next: (r) => {
        this.loading = false;
        if (r.Msg === 'Check-in completed') {
          this.model = r;
          this.step = 'selfverified';
        } else if (r.Msg === 'Already checked in') {
          this.model = r;
          this.step = 'selfverified';
        } else {
          this.tryAcceptAndCheckin();
        }
      },
      error: () => {
        this.tryAcceptAndCheckin();
      }
    });
  }

  tryAcceptAndCheckin(): void {
    this.loading = true;
    this.svc.verifyOTP(this.otpValue).subscribe({
      next: (r) => {
        if (r.Msg !== 'OTP verified successfully') {
          this.loading = false;
          this.notification.error('Check-in Failed', r.Msg || 'Invalid code');
          return;
        }
        this.model = r;
        this.model.VisitId = r.VisitId;
        this.model.Name = r.Name || '';
        this.model.Designation = r.Designation || '';
        this.model.Company = r.Company || '';
        this.model.Purpose = r.Purpose || '';
        this.model.PMail = r.PMail || '';
        this.model.Mobile = r.Mobile || '';
        this.svc.publicAcceptInvite(this.model).subscribe({
          next: (a) => {
            if (a.Msg && a.Msg.includes('successfully')) {
              const code = a.OTP || a.CheckInCode || this.otpValue;
              this.otpValue = code;
              this.model = a;
              this.svc.selfCheckInVerify(code).subscribe({
                next: (c) => {
                  this.loading = false;
                  if (c.Msg === 'Check-in completed' || c.Msg === 'Already checked in') {
                    this.model = c;
                    this.step = 'selfverified';
                  } else {
                    this.notification.error('Check-in Failed', c.Msg || 'Self check-in failed');
                  }
                },
                error: () => {
                  this.loading = false;
                  this.notification.error('Check-in Failed', 'Self check-in failed');
                }
              });
            } else {
              this.loading = false;
              this.notification.error('Check-in Failed', a.Msg || 'Could not accept invitation');
            }
          },
          error: () => {
            this.loading = false;
            this.notification.error('Check-in Failed', 'Could not accept invitation');
          }
        });
      },
      error: () => {
        this.loading = false;
        this.notification.error('Check-in Failed', 'Invalid code');
      }
    });
  }

  verifyOtp(): void {
    if (this.otpValue.length < 4) return;
    this.loading = true;
    this.svc.selfCheckInVerify(this.otpValue).subscribe({
      next: (r) => {
        this.loading = false;
        if (r.Msg === 'Check-in completed') {
          this.model = r;
          this.step = 'selfverified';
        } else if (r.Msg === 'Already checked in') {
          this.model = r;
          this.step = 'selfverified';
        } else {
          this.notification.error('Check-in Failed', r.Msg || 'Invalid check-in code');
        }
      },
      error: () => {
        this.loading = false;
        this.notification.error('Check-in Failed', 'Invalid check-in code');
      }
    });
  }

  submitSelfCheckIn(): void {
    if (!this.model.Name || !this.model.PMail) {
      this.notification.error('Error', 'Name and Email are required'); return;
    }
    this.loading = true;
    this.model.Invited = true;
    this.model.DirectCheckIn = true;
    this.model.Accept = true;
    this.svc.visitorDirectCheckIn(this.model).subscribe({
      next: (r) => {
        this.loading = false;
        this.notification.success('Success', r.Msg || 'Check-in submitted! Your code: ' + (r.OTP || ''));
        this.model = r;
        this.step = 'done';
      },
      error: () => {
        this.loading = false;
        this.notification.error('Error', 'Check-in failed');
      }
    });
  }
}