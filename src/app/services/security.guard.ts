import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SecurityGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isSecurity()) return true;
    if (this.auth.isLoggedIn) {
      if (this.auth.isSuperAdmin()) this.router.navigate(['/super-admin/dashboard']);
      else if (this.auth.isPlantAdmin()) this.router.navigate(['/plant-admin/dashboard']);
      else this.router.navigate(['/']);
      return false;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
