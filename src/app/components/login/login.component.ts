import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  passwordVisible = false;
  loading = false;

  constructor(private auth: AuthService, private router: Router, private notification: NzNotificationService) {}

  login(): void {
    if (this.loading) return;
    if (!this.username || !this.password) {
      this.notification.warning('Warning', 'Username and password required'); return;
    }
    this.loading = true;
    this.auth.login(this.username, this.password).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: r => {
        if (r.Success) {
          // Must change password redirect
          if (r.MustChangePassword) {
            this.auth.setPendingTempPassword(this.password);
            this.router.navigate(['/change-password']);
            return;
          }
          // Determine redirect based on role
          const isSuperAdmin = r.IsAdmin === true && (r.CompId == null || r.CompId === 0);
          const isPlantAdmin = r.IsPlantAdmin === true;
          if (isSuperAdmin) {
            this.router.navigate(['/super-admin/dashboard']);
          } else if (isPlantAdmin) {
            this.router.navigate(['/plant-admin/dashboard']);
          } else {
            this.router.navigate(['/user/dashboard']);
          }
        } else this.notification.error('Login Failed', r.Msg || 'Invalid credentials');
      },
      error: () => this.notification.error('Error', 'Connection error')
    });
  }
}
