import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  step: 'input' | 'done' = 'input';
  emailId = '';
  loading = false;
  maskedEmail = '';

  constructor(private auth: AuthService, private notification: NzNotificationService) {}

  requestTempPassword(): void {
    if (!this.emailId) {
      this.notification.error('Error', 'Please enter your email address');
      return;
    }
    this.loading = true;
    this.auth.forgotPassword('', this.emailId).subscribe({
      next: (r) => {
        this.loading = false;
        if (r.Success) {
          this.maskedEmail = r.Email || '';
          this.step = 'done';
          this.notification.success('Temporary Password Sent', r.Msg || 'A temporary password has been sent to your email.');
        } else {
          this.notification.error('Error', r.Msg || 'User not found');
        }
      },
      error: () => {
        this.loading = false;
        this.notification.error('Error', 'Request failed. Please try again.');
      }
    });
  }
}
