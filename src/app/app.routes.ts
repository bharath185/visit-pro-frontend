import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';
import { SuperAdminGuard } from './services/super-admin.guard';
import { PlantAdminGuard } from './services/plant-admin.guard';
import { SecurityGuard } from './services/security.guard';
import { RegularUserGuard } from './services/regular-user.guard';

// Layout
import { AppLayoutComponent } from './components/app-layout/app-layout.component';

// Components
import { LoginComponent } from './components/login/login.component';
import { SuperAdminDashboardComponent } from './components/super-admin-dashboard/super-admin-dashboard.component';
import { MasterSetupComponent } from './components/master-setup/master-setup.component';
import { InviteVisitorComponent } from './components/invite-visitor/invite-visitor.component';
import { ViewVisitorsComponent } from './components/view-visitors/view-visitors.component';
import { DirectCheckinComponent } from './components/direct-checkin/direct-checkin.component';
import { VisitFilterComponent } from './components/visit-filter/visit-filter.component';
import { PlantAdminDashboardComponent } from './components/plant-admin-dashboard/plant-admin-dashboard.component';
import { PlantUserManagementComponent } from './components/plant-user-management/plant-user-management.component';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component';
import { CreateInviteComponent } from './components/create-invite/create-invite.component';
import { MyInvitesComponent } from './components/my-invites/my-invites.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { VisitorSelfCheckinComponent } from './components/visitor-self-checkin/visitor-self-checkin.component';
import { VisitorAcceptInviteComponent } from './components/visitor-accept-invite/visitor-accept-invite.component';
import { SelfCheckoutComponent } from './components/self-checkout/self-checkout.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';

const routes: Routes = [
  // Public full-page routes (no sidebar, no auth required)
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'change-password', component: ChangePasswordComponent },
  { path: 'self-checkin', component: VisitorSelfCheckinComponent },
  { path: 'accept-invite', component: VisitorAcceptInviteComponent },

  // Routes with sidebar layout (authenticated)
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // Super Admin routes
      {
        path: 'super-admin',
        canActivate: [SuperAdminGuard],
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'dashboard', component: SuperAdminDashboardComponent },
          { path: 'master-setup', component: MasterSetupComponent },
          { path: 'invite', component: InviteVisitorComponent },
          { path: 'visitors', component: ViewVisitorsComponent },
          { path: 'direct-checkin', component: DirectCheckinComponent },
          { path: 'filter', component: VisitFilterComponent }
        ]
      },

      // Plant Admin routes
      {
        path: 'plant-admin',
        canActivate: [PlantAdminGuard],
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'dashboard', component: PlantAdminDashboardComponent },
          { path: 'users', component: PlantUserManagementComponent },
          { path: 'invite', component: InviteVisitorComponent },
          { path: 'visitors', component: ViewVisitorsComponent },
          { path: 'direct-checkin', component: DirectCheckinComponent },
          { path: 'filter', component: VisitFilterComponent }
        ]
      },

      // Security routes
      {
        path: 'security',
        canActivate: [SecurityGuard],
        children: [
          { path: '', redirectTo: 'visitors', pathMatch: 'full' },
          { path: 'visitors', component: ViewVisitorsComponent },
          { path: 'direct-checkin', component: DirectCheckinComponent }
        ]
      },

      // Regular User routes
      {
        path: 'user',
        canActivate: [RegularUserGuard],
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'dashboard', component: UserDashboardComponent },
          { path: 'master-setup', component: MasterSetupComponent },
          { path: 'invite', component: CreateInviteComponent },
          { path: 'my-invites', component: MyInvitesComponent },
          { path: 'notifications', component: NotificationsComponent }
        ]
      },

      // Self-service routes
      { path: 'self-checkout', component: SelfCheckoutComponent },

      // Legacy route for backward compatibility
      { path: 'invite', component: InviteVisitorComponent },
      { path: 'visitors', component: ViewVisitorsComponent },
      { path: 'direct-checkin', component: DirectCheckinComponent },
      { path: 'master-setup', component: MasterSetupComponent },
      { path: 'visit-filter', component: VisitFilterComponent },
      { path: 'notifications', component: NotificationsComponent },

      // Default redirect within the layout
      { path: '', redirectTo: '/login', pathMatch: 'full' }
    ]
  },

  // Catch-all redirect
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
