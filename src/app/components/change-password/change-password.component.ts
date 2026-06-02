import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html'
})
export class ChangePasswordComponent implements OnInit {
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router, private notification: NzNotificationService) {}

  ngOnInit(): void {
    const stored = this.auth.getPendingTempPassword();
    if (!stored) {
      this.notification.warning('No action needed', 'You do not need to change your password');
      this.router.navigate(['/login']);
      return;
    }
    this.oldPassword = stored;
  }

  changePassword(): void {
    if (!this.newPassword || this.newPassword.length < 6) {
      this.notification.warning('Warning', 'New password must be at least 6 characters');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.notification.warning('Warning', 'Passwords do not match');
      return;
    }
    this.loading = true;
    this.auth.changePassword(this.oldPassword, this.newPassword).subscribe({
      next: r => {
        this.loading = false;
        if (r.Success) {
          this.auth.clearPendingTempPassword();
          this.auth.logout();
          this.notification.success('Success', 'Password changed successfully. Please log in with your new password.');
          this.router.navigate(['/login']);
        } else {
          this.notification.error('Error', r.Msg || 'Failed to change password');
        }
      },
      error: () => {
        this.loading = false;
        this.notification.error('Error', 'Connection error');
      }
    });
  }

  cancel(): void {
    this.auth.clearPendingTempPassword();
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
