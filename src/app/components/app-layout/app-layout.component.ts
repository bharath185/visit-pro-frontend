import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';

const API = 'http://192.168.2.45:8081/api';

@Component({
  selector: 'app-layout',
  templateUrl: './app-layout.component.html'
})
export class AppLayoutComponent implements OnInit, OnDestroy {
  user: any = null;
  isSuperAdmin = false;
  isPlantAdmin = false;
  isSecurity = false;
  isRegularUser = false;
  plantId: number | null = null;
  plantName = '';
  isCollapsed = false;
  notifCount = 0;
  currentTime = '';
  unreadNotifications: any[] = [];
  private popupTimer: any;
  private timeTimer: any;
  private notifTimer: any;

  menuSections: any[] = [];
  pageTitle = '';

  constructor(
    private http: HttpClient,
    public router: Router,
    public auth: AuthService
  ) {
    this.loadUser();
    this.updateClock();
    this.timeTimer = setInterval(() => this.updateClock(), 30000);
  }

  ngOnInit(): void {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.loadUser();
      this.updateMenuAndTitle();
    });
    this.updateMenuAndTitle();
    this.loadNotifCount();
    this.loadUnreadNotifications();
    this.notifTimer = setInterval(() => this.loadNotifCount(), 30000);
  }

  ngOnDestroy(): void {
    if (this.timeTimer) clearInterval(this.timeTimer);
    if (this.notifTimer) clearInterval(this.notifTimer);
    if (this.popupTimer) clearTimeout(this.popupTimer);
  }

  private loadUser(): void {
    const u = this.auth.currentUser;
    if (u && u.Success) {
      this.user = u;
      this.isSuperAdmin = u.IsAdmin === true && (u.CompId == null || u.CompId === 0);
      this.isPlantAdmin = u.IsPlantAdmin === true;
      this.isSecurity = u.IsSecurity === true;
      this.isRegularUser = !this.isSuperAdmin && !this.isPlantAdmin && !this.isSecurity;
      this.plantId = u.PlantId || null;
      this.plantName = u.PlantName || '';
    }
  }

  get isAdmin(): boolean {
    return this.user?.IsAdmin === true;
  }

  private updateClock(): void {
    this.currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private updateMenuAndTitle(): void {
    const url = this.router.url;

    if (this.isSuperAdmin) {
      this.menuSections = [
        { label: 'Main', children: [
          { icon: 'dashboard', label: 'Dashboard', route: '/super-admin/dashboard' },
          { icon: 'filter', label: 'Visitor Reports', route: '/super-admin/filter' }
        ]},
        { label: 'Administration', children: [
          { icon: 'setting', label: 'Master Setup', route: '/super-admin/master-setup' }
        ]}
      ];
      if (url.includes('/super-admin/dashboard')) this.pageTitle = 'Super Admin Dashboard';
      else if (url.includes('/master-setup')) this.pageTitle = 'Master Setup';
      else if (url.includes('/filter')) this.pageTitle = 'Visitor Reports';
      else this.pageTitle = 'Super Admin';
    } else if (this.isSecurity) {
      this.menuSections = [
        { label: 'Main', children: [
          { icon: 'team', label: 'View Visitors', route: '/security/visitors' },
          { icon: 'safety', label: 'Direct Check-In', route: '/security/direct-checkin' }
        ]}
      ];
      if (url.includes('/security/visitors')) this.pageTitle = 'View Visitors';
      else if (url.includes('/security/direct-checkin')) this.pageTitle = 'Direct Check-In';
      else this.pageTitle = 'Security';
    } else if (this.isPlantAdmin) {
      this.menuSections = [
        { label: 'Main', children: [
          { icon: 'dashboard', label: 'Dashboard', route: '/plant-admin/dashboard' },
          { icon: 'team', label: 'View Visitors', route: '/plant-admin/visitors' },
          { icon: 'safety', label: 'Direct Check-In', route: '/plant-admin/direct-checkin' },
          { icon: 'filter', label: 'Visitor Reports', route: '/plant-admin/filter' }
        ]},
        { label: 'Management', children: [
          { icon: 'user', label: 'Users', route: '/plant-admin/users' }
        ]}
      ];
      if (url.includes('/plant-admin/dashboard')) this.pageTitle = 'Plant Dashboard';
      else if (url.includes('/master-setup')) this.pageTitle = 'Master Setup';
      else if (url.includes('/users')) this.pageTitle = 'User Management';
      else if (url.includes('/designations')) this.pageTitle = 'Designation Management';
      else if (url.includes('/invite')) this.pageTitle = 'Invite Visitor';
      else if (url.includes('/visitors')) this.pageTitle = 'View Visitors';
      else if (url.includes('/direct-checkin')) this.pageTitle = 'Direct Check-In';
      else if (url.includes('/filter')) this.pageTitle = 'Visitor Reports';
      else this.pageTitle = 'Plant Admin';
    } else {
      const mainChildren: any[] = [
        { icon: 'dashboard', label: 'Dashboard', route: '/user/dashboard' }
      ];
      if (this.isAdmin) {
        mainChildren.push({ icon: 'setting', label: 'Master Setup', route: '/user/master-setup' });
      }
      mainChildren.push(
        { icon: 'send', label: 'Create Invite', route: '/user/invite' },
        { icon: 'unordered-list', label: 'My Invitations', route: '/user/my-invites' },
        { icon: 'bell', label: 'Notifications', route: '/user/notifications' }
      );
      this.menuSections = [
        { label: 'Main', children: mainChildren }
      ];
      if (url.includes('/user/dashboard')) this.pageTitle = 'My Dashboard';
      else if (url.includes('/master-setup')) this.pageTitle = 'Master Setup';
      else if (url.includes('/user/invite')) this.pageTitle = 'Create Invite';
      else if (url.includes('/my-invites')) this.pageTitle = 'My Invitations';
      else if (url.includes('/notifications')) this.pageTitle = 'Notifications';
      else this.pageTitle = 'Dashboard';
    }
  }

  navigateByRoute(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  getRoleBadge(): string {
    if (this.isSuperAdmin) return 'Super Admin';
    if (this.isPlantAdmin) return 'Plant Admin';
    if (this.isSecurity) return 'Security';
    return 'User';
  }

  // ============ NOTIFICATIONS ============
  loadNotifCount(): void {
    if (!this.user?.EmpId) return;
    this.http.get<any>(API + '/notifications/unread-count/' + this.user.EmpId).subscribe({
      next: r => this.notifCount = r.count || 0,
      error: () => {}
    });
  }

  loadUnreadNotifications(): void {
    if (!this.user?.EmpId) return;
    this.http.get<any[]>(API + '/notifications/unread/' + this.user.EmpId).subscribe({
      next: r => {
        this.unreadNotifications = Array.isArray(r) ? r.slice(0, 3) : [];
        if (this.unreadNotifications.length > 0 && this.popupTimer) clearTimeout(this.popupTimer);
        if (this.unreadNotifications.length > 0) {
          this.popupTimer = setTimeout(() => { this.unreadNotifications = []; }, 6000);
        }
      },
      error: () => {}
    });
  }

  markNotifRead(id: number): void {
    this.http.post<any>(API + '/notifications/mark-read/' + id, {}).subscribe(() => this.loadNotifCount());
    this.unreadNotifications = [];
  }

  dismissPopup(n: any): void {
    this.unreadNotifications = this.unreadNotifications.filter(x => x !== n);
  }
}
