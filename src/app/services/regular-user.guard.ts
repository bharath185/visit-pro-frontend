import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RegularUserGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isLoggedIn && this.auth.isRegularUser()) return true;
    if (this.auth.isLoggedIn) {
      // Redirect admins to their dashboard
      if (this.auth.isSuperAdmin()) this.router.navigate(['/super-admin/dashboard']);
      else if (this.auth.isPlantAdmin()) this.router.navigate(['/plant-admin/dashboard']);
      else if (this.auth.isSecurity()) this.router.navigate(['/security/visitors']);
      return false;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
