import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  template: `<div style="padding:24px"><h2>Dashboard Works!</h2><p>User: {{ user?.FullName }}</p></div>`
})
export class DashboardComponent implements OnInit {
  user = this.auth.currentUser;
  constructor(private auth: AuthService, private router: Router) {}
  ngOnInit(): void {
    if (!this.auth.isLoggedIn) { this.router.navigate(['/login']); return; }
    this.user = this.auth.currentUser;
  }
}
